/**
 * Cloudflare Pages Function —— POST /api/contact
 *
 * 链路顺序不要调换：
 *   解析请求体 → 蜜罐 → 必填/格式校验 → Turnstile 服务端 siteverify
 *   → 频率限制 → 先写 D1 → 再发 Resend → 回写 mail_status
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

async function readPayload(request: Request): Promise<Record<string, string>> {
  const type = request.headers.get("content-type") || "";

  if (type.includes("application/json")) {
    const data = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    if (!data) return {};
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, value == null ? "" : String(value)]),
    );
  }

  const form = await request.formData();
  return Object.fromEntries([...form.entries()].map(([key, value]) => [key, String(value)]));
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

async function sendNotification(env: Env, lead: Record<string, string>): Promise<void> {
  const subject = `New enquiry from ${lead.name}${lead.company ? ` (${lead.company})` : ""}`;
  const rows: Array<[string, string]> = [
    ["Name", lead.name],
    ["Email", lead.email],
    ["Company", lead.company],
    ["Country", lead.country],
    ["Page", lead.page_url],
    ["Source", [lead.utm_source, lead.utm_medium, lead.utm_campaign].filter(Boolean).join(" / ")],
    ["Message", lead.message],
  ];

  const html = `<h2>New enquiry</h2><table cellpadding="6">${rows
    .filter(([, value]) => value)
    .map(([label, value]) => `<tr><td><strong>${label}</strong></td><td>${escapeHtml(value)}</td></tr>`)
    .join("")}</table>`;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: env.FROM_EMAIL || "onboarding@resend.dev",
      to: [env.NOTIFY_EMAIL],
      reply_to: lead.email,
      subject,
      html,
    }),
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

  const payload = await readPayload(request);

  // 1. 蜜罐：真人看不见这个字段，机器人会填。命中就假装成功，不给任何提示。
  if (payload.website) return json({ ok: true, ignored: true });

  // 2. 校验
  const lead = {
    name: (payload.name || "").trim(),
    email: (payload.email || "").trim(),
    company: (payload.company || "").trim(),
    country: (payload.country || "").trim(),
    message: (payload.message || "").trim(),
    submission_key: (payload.submission_key || "").trim() || `fallback-${Date.now()}`,
    page_url: (payload.page_url || "").trim(),
    utm_source: (payload.utm_source || "").trim(),
    utm_medium: (payload.utm_medium || "").trim(),
    utm_campaign: (payload.utm_campaign || "").trim(),
    gclid: (payload.gclid || "").trim(),
    fbclid: (payload.fbclid || "").trim(),
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

  // 3. Turnstile（配了密钥才校验）
  if (env.TURNSTILE_SECRET_KEY) {
    const passed = await verifyTurnstile(env.TURNSTILE_SECRET_KEY, payload.turnstileToken || "", ip);
    if (!passed) return json({ ok: false, error: "Verification failed" }, 403);
  }

  // 4. 频率限制
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

  // 5. 先落库
  let stored = false;
  if (hasDb) {
    try {
      const result = await env.DB.prepare(
        `INSERT OR IGNORE INTO leads
           (submission_key, name, email, company, country, message, page_url,
            utm_source, utm_medium, utm_campaign, gclid, fbclid, mail_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
        .bind(
          lead.submission_key,
          lead.name,
          lead.email,
          lead.company,
          lead.country,
          lead.message,
          lead.page_url,
          lead.utm_source,
          lead.utm_medium,
          lead.utm_campaign,
          lead.gclid,
          lead.fbclid,
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

  // 6. 再发邮件
  let mailed = false;
  let mailError = "";
  if (hasMail) {
    try {
      await sendNotification(env, lead);
      mailed = true;
    } catch (error) {
      mailError = error instanceof Error ? error.message : String(error);
    }
  }

  // 7. 回写邮件状态
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

  return json({ ok: true, stored, mailed });
}
