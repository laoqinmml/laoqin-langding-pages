/**
 * Cloudflare Pages Function —— POST /api/contact
 *
 * 链路顺序不要调换：
 *   解析请求体(multipart 或 JSON) → 蜜罐 → 必填/格式校验 → 附件校验
 *   → Turnstile 服务端 siteverify → 频率限制 → 先写 D1 → 再发 Resend(带附件) → 回写 mail_status
 *
 * 三个可选环节按环境变量自动启用，没配就跳过：
 *   DB 绑定（D1） / TURNSTILE_SECRET_KEY / RESEND_API_KEY + NOTIFY_EMAIL
 *
 * 两条分支规则：
 *   有 D1：邮件失败也返回成功（询盘已落库），只在 mail_status 里记失败原因。
 *   无 D1：邮件是唯一通道，失败必须返回 500，不能假装成功。
 */

type Env = {
  DB?: any;
  TURNSTILE_SECRET_KEY?: string;
  RESEND_API_KEY?: string;
  NOTIFY_EMAIL?: string;
  FROM_EMAIL?: string;
};

type Context = {
  request: Request;
  env: Env;
};

const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 6;
const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;
const ALLOWED_ATTACHMENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

/** 只在单个 isolate 内有效：够挡住脚本刷单，不替代 Turnstile */
const recentHits = new Map<string, number[]>();

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

type ParsedBody = {
  fields: Record<string, string>;
  file: File | null;
};

/** 前端用 multipart 提交（可带附件）；也兼容老的 JSON 提交 */
async function readBody(request: Request): Promise<ParsedBody> {
  const type = request.headers.get("content-type") || "";

  if (type.includes("application/json")) {
    const data = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    if (!data) return { fields: {}, file: null };
    return {
      fields: Object.fromEntries(
        Object.entries(data).map(([key, value]) => [key, value == null ? "" : String(value)]),
      ),
      file: null,
    };
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    // 客户端发了畸形的 multipart（例如某个 part 没有 name）——别抛 500，让上面按 400 处理
    throw new Error("Malformed form data");
  }
  const fields: Record<string, string> = {};
  let file: File | null = null;

  for (const [key, value] of form.entries()) {
    if (typeof value === "string") {
      fields[key] = value;
    } else if (value && typeof value === "object" && "size" in value && (value as File).size > 0) {
      file = value as File;
    }
  }

  return { fields, file };
}

function toBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunk = 0x8000;
  for (let index = 0; index < bytes.length; index += chunk) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunk));
  }
  return btoa(binary);
}

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (recentHits.get(ip) || []).filter((time) => now - time < RATE_WINDOW_MS);
  hits.push(now);
  recentHits.set(ip, hits);
  return hits.length > RATE_MAX;
}

async function verifyTurnstile(
  secret: string,
  token: string,
  ip: string | null,
): Promise<boolean> {
  if (!token) return false;
  const body = new FormData();
  body.append("secret", secret);
  body.append("response", token);
  if (ip) body.append("remoteip", ip);

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body,
  });
  const result = (await response.json().catch(() => ({}))) as { success?: boolean };
  return result.success === true;
}

async function sendNotification(
  env: Env,
  lead: Record<string, string>,
  attachment: { filename: string; content: string } | null,
): Promise<void> {
  const subject = `New enquiry from ${lead.name}${lead.company ? ` (${lead.company})` : ""}`;
  const rows: Array<[string, string]> = [
    ["Name", lead.name],
    ["Email", lead.email],
    ["Company", lead.company],
    ["Country", lead.country],
    ["Custom goggles for", lead.sport],
    ["Reference image", attachment ? attachment.filename : ""],
    ["Page", lead.page_url],
    ["Source", [lead.utm_source, lead.utm_medium, lead.utm_campaign].filter(Boolean).join(" / ")],
    ["Message", lead.message],
  ];

  const html = `<h2>New enquiry</h2><table cellpadding="6">${rows
    .filter(([, value]) => value)
    .map(([label, value]) => `<tr><td><strong>${label}</strong></td><td>${escapeHtml(value)}</td></tr>`)
    .join("")}</table>`;

  const payload: Record<string, unknown> = {
    from: env.FROM_EMAIL || "onboarding@resend.dev",
    to: [env.NOTIFY_EMAIL],
    reply_to: lead.email,
    subject,
    html,
  };
  if (attachment) {
    payload.attachments = [{ filename: attachment.filename, content: attachment.content }];
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Resend ${response.status}: ${detail.slice(0, 300)}`);
  }
}

export async function onRequestGet(): Promise<Response> {
  return json({ ok: false, error: "Use POST" }, 405);
}

export async function onRequestPost(context: Context): Promise<Response> {
  const { request, env } = context;
  const ip = request.headers.get("cf-connecting-ip");

  let fields: Record<string, string>;
  let file: File | null;
  try {
    ({ fields, file } = await readBody(request));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return json({ ok: false, error: message }, 400);
  }

  // 1. 蜜罐：真人看不见这个字段，机器人会填。命中就假装成功，不给任何提示。
  if (fields.website) return json({ ok: true, ignored: true });

  // 2. 校验
  const lead = {
    name: (fields.name || "").trim(),
    email: (fields.email || "").trim(),
    company: (fields.company || "").trim(),
    country: (fields.country || "").trim(),
    sport: (fields.sport || "").trim(),
    message: (fields.message || "").trim(),
    submission_key: (fields.submission_key || "").trim() || `fallback-${Date.now()}`,
    page_url: (fields.page_url || "").trim(),
    utm_source: (fields.utm_source || "").trim(),
    utm_medium: (fields.utm_medium || "").trim(),
    utm_campaign: (fields.utm_campaign || "").trim(),
    gclid: (fields.gclid || "").trim(),
    fbclid: (fields.fbclid || "").trim(),
  };

  if (!lead.name || !lead.email || !lead.message) {
    return json({ ok: false, error: "Missing name, email or message" }, 400);
  }
  if (!isEmail(lead.email)) {
    return json({ ok: false, error: "Invalid email address" }, 400);
  }
  if (lead.message.length > 4000) {
    return json({ ok: false, error: "Message too long" }, 400);
  }

  // 3. 附件校验
  if (file) {
    if (file.size > MAX_ATTACHMENT_BYTES) {
      return json({ ok: false, error: "Attachment too large (max 5 MB)" }, 413);
    }
    if (file.type && !ALLOWED_ATTACHMENT_TYPES.includes(file.type)) {
      return json({ ok: false, error: "Unsupported attachment type" }, 400);
    }
  }

  // 4. Turnstile（配了密钥才校验）
  if (env.TURNSTILE_SECRET_KEY) {
    const passed = await verifyTurnstile(
      env.TURNSTILE_SECRET_KEY,
      fields["cf-turnstile-response"] || fields.turnstileToken || "",
      ip,
    );
    if (!passed) return json({ ok: false, error: "Verification failed" }, 403);
  }

  // 5. 频率限制
  if (ip && rateLimited(ip)) {
    return json({ ok: false, error: "Too many requests, please try again later" }, 429);
  }

  const hasDb = Boolean(env.DB);
  const hasMail = Boolean(env.RESEND_API_KEY && env.NOTIFY_EMAIL);

  if (!hasDb && !hasMail) {
    return json(
      { ok: false, error: "No delivery channel configured (D1 binding or RESEND_API_KEY)" },
      500,
    );
  }

  // 6. 先落库
  let stored = false;
  if (hasDb) {
    try {
      const result = await env.DB.prepare(
        `INSERT OR IGNORE INTO leads
           (submission_key, name, email, company, country, sport, message, page_url,
            utm_source, utm_medium, utm_campaign, gclid, fbclid,
            attachment_name, attachment_size, mail_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
        .bind(
          lead.submission_key,
          lead.name,
          lead.email,
          lead.company,
          lead.country,
          lead.sport,
          lead.message,
          lead.page_url,
          lead.utm_source,
          lead.utm_medium,
          lead.utm_campaign,
          lead.gclid,
          lead.fbclid,
          file ? file.name : "",
          file ? file.size : 0,
          hasMail ? "pending" : "skipped",
        )
        .run();

      stored = (result?.meta?.changes ?? 1) > 0;
      // changes === 0 说明是重复提交（submission_key 命中），当作成功忽略
      if (!stored) return json({ ok: true, stored: false, mailed: false, duplicate: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return json({ ok: false, error: `Storage failed: ${message}` }, 500);
    }
  }

  // 7. 再发邮件（附件随邮件带走；没配邮件时附件不留存，这一点要在交付说明里写清楚）
  let mailed = false;
  let mailError = "";
  if (hasMail) {
    try {
      const attachment = file
        ? { filename: file.name || "reference-image", content: toBase64(await file.arrayBuffer()) }
        : null;
      await sendNotification(env, lead, attachment);
      mailed = true;
    } catch (error) {
      mailError = error instanceof Error ? error.message : String(error);
    }
  }

  // 8. 回写邮件状态
  if (hasDb) {
    const status = hasMail ? (mailed ? "sent" : "failed") : "skipped";
    try {
      await env.DB.prepare("UPDATE leads SET mail_status = ?, mail_error = ? WHERE submission_key = ?")
        .bind(status, mailError.slice(0, 500), lead.submission_key)
        .run();
    } catch {
      // 回写失败不影响询盘本身，已经存下了
    }
  }

  // 有 D1：邮件失败也算成功（询盘没丢）。无 D1：邮件失败必须报错。
  if (!mailed && !hasDb) {
    return json({ ok: false, error: mailError || "Mail delivery failed" }, 500);
  }

  return json({ ok: true, stored, mailed, attachment: file ? file.name : null });
}
