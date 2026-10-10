# 发布到 Cloudflare Pages

## 前置条件

- Node 18+，项目能 `npm run build`
- 一个 Cloudflare 账号（免费套餐够用）
- 让**用户自己**执行 `npx wrangler login`，浏览器授权即可——不要索取 Cloudflare 密码，也不要索取 API Token（除非要做代部署服务）

## 首次部署

```bash
npx wrangler login
npm run build
npx wrangler pages project create <project> --production-branch main   # wrangler 4 不会自动建项目
npx wrangler pages deploy dist --project-name <project> --branch main
```

后续更新只要：

```bash
npm run build && npx wrangler pages deploy dist --project-name <project> --branch main
```

## 密钥分三类，别混

| 类别 | 放哪 | 例子 |
| --- | --- | --- |
| 构建期公开 | `.env`（会打进前端代码） | `PUBLIC_TURNSTILE_SITE_KEY` |
| 运行时密钥 | 本地 `.dev.vars`；生产 `npx wrangler pages secret bulk` | `TURNSTILE_SECRET_KEY`、`RESEND_API_KEY`、`NOTIFY_EMAIL` |
| 绑定 | `wrangler.jsonc` | D1 的 `DB` |

**Pages 的密钥只对新的部署生效**：设完密钥必须重新 `npm run build && wrangler pages deploy`，否则这次线上还是没有这些变量。

## 询盘落库（D1）

```bash
npx wrangler d1 create landing-leads
# 把输出的 database_id 填进 wrangler.jsonc 的 d1_databases，binding 用 DB
npx wrangler d1 execute landing-leads --remote --file=./schema.sql -y
# 打开 src/config.ts 的 features.d1
```

查最近的询盘：

```bash
npx wrangler d1 execute landing-leads --remote --command "select created_at,name,email,company,country,mail_status from leads order by id desc limit 20"
```

## 表单链路（顺序不能错）

```
解析请求体 → 蜜罐(website) → 必填/格式校验 → Turnstile 服务端 siteverify
→ 频率限制 → 先写 D1 → 再发 Resend → 回写 mail_status / mail_error
```

- **D1 必须先于邮件**：邮件挂了不能丢询盘。
- `submission_key UNIQUE` 是幂等键（前端 `crypto.randomUUID()`），重复提交直接忽略。
- 有 D1：邮件失败也返回成功（询盘已留存），失败原因写进 `mail_status` / `mail_error`。
- 无 D1：邮件是唯一通道，发信失败必须返回 500，不能假装成功。
- 归因字段 `utm_*` / `gclid` / `fbclid` 从 URL 采集后写进 D1，用来判断哪个渠道来的询盘值钱。

## 人机验证（Turnstile）

1. Cloudflare 控制台 → Turnstile → 建站点，拿到 site key 与 secret key。
2. `.env` 写 `PUBLIC_TURNSTILE_SITE_KEY`，`src/config.ts` 的 `features.turnstile` 开成 `true`（组件才渲染 widget）。
3. 生产密钥：

```bash
echo '{"TURNSTILE_SECRET_KEY":"0x..."}' > cf-secrets.json
npx wrangler pages secret bulk cf-secrets.json --project-name <project>
```

widget 和服务端 siteverify **两处都要有**，只做前端等于没做。测试密钥（`1x…`）任何 token 都通过，上线前必须换成真实密钥。

## 邮件通知（Resend）

```bash
echo '{"RESEND_API_KEY":"re_xxx","NOTIFY_EMAIL":"sales@yourdomain.com","FROM_EMAIL":"website@yourdomain.com"}' > cf-secrets.json
npx wrangler pages secret bulk cf-secrets.json --project-name <project>
```

发件域名先在 Resend 里验证，否则只能从 `onboarding@resend.dev` 发测试邮件。MailChannels 免费发信已停服，不要照抄老教程。

## noindex 三层锁（预售期）

三处必须同时改，漏一处就白锁：

1. `src/config.ts` 的 `features.noindex` → 页面 meta 与 `robots.txt`
2. `public/_headers` 的 `X-Robots-Tag`

（第三层是提交成功页自身始终 noindex，starter 里已经写死。）

客户确认上线时：`features.noindex` 改 `false`、删掉 `_headers` 里的 `X-Robots-Tag`、重新部署，然后：

```bash
curl -I https://<domain>/ | findstr /i robots     # Windows；macOS/Linux 用 grep -i robots
```

确认响应头里没有 `x-robots-tag`。

## 绑定自定义域名

Pages 项目 → Custom domains → 添加域名，按提示在 DNS 里加 CNAME（域名也托管在 Cloudflare 时通常自动完成）。绑定后把 `astro.config.mjs` 的 `SITE` 和 `src/config.ts` 的 `domain` 改成正式域名，重新构建部署——canonical 和 sitemap 都靠它。

## 上线验证清单

- [ ] 线上首页能打开，手机能看，无横向滚动
- [ ] `curl -I` 看响应头，robots 状态与预期一致（预售期有 `x-robots-tag`，上线后没有）
- [ ] `/robots.txt`、`/sitemap-index.xml`、`/llms.txt`、`/webmcp.json` 都能访问
- [ ] 表单能提交，且**邮件真的收到了**（不是只看到接口 200）
- [ ] D1 里有记录，`mail_status` 有值
- [ ] 表单四态都测过：正常 / 蜜罐命中 / 伪造 token 被拒 / 重复提交被忽略
- [ ] Google Search Console 接上并提交 sitemap（解锁 noindex 之后）

## 常见错误

1. wrangler 的 OAuth token 每 1 小时过期；直连 Cloudflare API 报 401/403，先 `npx wrangler whoami`。
2. `wrangler pages project create` 没跑就 deploy，报项目不存在。
3. 设完密钥没重新部署，线上还是旧变量。
4. Cloudflare 的 Email Address Obfuscation 默认开着，会把页面上的 `mailto:` 改写成 `/cdn-cgi/l/email-protection`；邮箱点不了就去 Scrape Shield 关掉。
5. 忘了给 `/api/contact` 配 Turnstile secret，病毒式刷单会直接进 D1。
