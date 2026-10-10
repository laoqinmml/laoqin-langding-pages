---
name: laoqin-langding-pages
description: 通用落地页技能：帮 B2B 企业主把产品/工厂/服务信息做成 Astro 落地页，发布到 Cloudflare Pages 收询盘。触发场景：「做一个落地页」「做官网」「外贸独立站」「参考这个站设计落地页」「按这张截图做」「按这份 DESIGN.md 做」「refero 风格」「screenshot to code」「给我几个完全不同的版本」「多风格首页」「比稿」「从参考页抓事实写文案」「astro 建站」「部署到 Cloudflare」「网站要能收询盘」「截图自审」「生成配图」——客户给 DESIGN.md 或网站截图时，先按它定风格再出草稿。默认交付：Astro 静态站 + 询盘表单 + Cloudflare Pages 上线，企业主只需回答几个问题。
license: MIT
metadata:
  merged_from: [laoqin-langding-pages, ai-seo-site-builder]
  tags: [landing-page, astro, b2b, seo, cloudflare-pages, lead-gen]
---

# 通用落地页技能：B2B 落地页 → Astro → Cloudflare

一句话：**企业主只要回答几个问题，就能拿到一个能上线的 Astro 落地页，发布到 Cloudflare Pages 并开始收询盘。**

适用对象：工厂、代工、机械设备、零部件、材料、专业服务等 B2B 企业主。他们不懂 Astro、不懂 SEO、不想填长表——结构、文案骨架、设计、SEO、部署都由你完成。

## 默认交付物（用户没特别说明就按这个做）

| 项 | 默认 |
| --- | --- |
| 技术栈 | Astro 静态站（`output: 'static'`） |
| 页面 | 单页落地页（首页就是落地页）：导航 → 首屏 → 卖点 → 应用/产品 → 能力/产能 → 流程 → 资质 → 询盘表单 → 页脚 |
| 起始工程 | 复制 [starter/](starter/)，只需改 `src/config.ts` 和 `src/content.ts` |
| 表单 | Pages Function `/api/contact`：蜜罐 → 校验 → Turnstile（配了就开）→ D1 落库（配了就写）→ Resend 通知（配了就发），缺配置自动降级并把状态说清楚 |
| 部署 | Cloudflare Pages |
| 语言 | 按目标市场；面向欧美默认英文，中文站也可以 |
| SEO 底线 | 唯一 title/description、一个 H1、canonical、sitemap、robots、404；预售期用 noindex 三层锁 |

需要多页（产品页 / 博客 / 案例 / FAQ）时再扩展，规则见 [references/astro-project.md](references/astro-project.md)。

不做：需要登录、数据库、计费、用户角色的动态 SaaS；WordPress 主题开发；用户明确要求每页手写、不接受 agent 参与。

## 全程守的八条

1. **只问缺的那几件。** 按阶段问（见 [templates/user-intake.md](templates/user-intake.md)），能默认就默认，并告诉用户用了什么默认。
2. **先报计划再写代码。** 说清做几版、几页、分几步、停在哪，用户同意再动手。
3. **一次只做一版。** 用户要三个设计方向，也一版一版来，做完一版再开下一版。
4. **事实只用用户给过的来源。** 参考页没写地址、电话、邮箱、客户名、销量、获奖，就一律不出现；缺了要显式说「这块我没编」。
5. **截图看联系表，不逐张读原图。** 一张 1440×900 截图就是上千 token，用 `examples/_tools/sheet.py` 拼成一张再看。
6. **图片分两阶段。** 草稿一律用 `placehold.co` 占位——尺寸按 [references/images.md](references/images.md) 的表格选，和版面比例对齐，不要随手写；客户确认后再换真实图片：有实拍就用实拍，没有就调生图 API（`examples/_tools/gen_images.py`）。
7. **工具连续失败两次就停**，把报错原文给用户，不要原地重试第三遍。
8. **不许声称做完了。** 交付要有真实 `npm run build` 输出、截图自审结果或线上验证结果兜底。

## 主线六步

### 0. 起手：只问一个问题

> 我们来做你的落地页。先告诉我五件事：公司/品牌名、目标国家和语言、行业、主要产品（或服务）、怎么联系你（邮箱 / WhatsApp）？其余的我给默认建议。

拿到这些就能开工。缺品牌主色、缺 Logo、缺参考站都不阻塞，用文字 Logo 和行业默认配色先做，回头再换。

### 1. 抓事实【不停，直接做】

把用户给的资料（参考页 URL、产品册、报价、工厂信息）整理成一份事实清单：卖点、参数、产能、认证编号、流程步数、交期、服务过的客户类型、CTA。同时记下**不能用的数据**（自相矛盾、明显过期、无法核实的销量或客户名）。

### 2. 定结构 + 定方向【停：给用户确认再写代码】

**这一步最值钱，先写计划，再写一行代码。**

先定结构：这页要干什么、读者是谁（采购、工程师、还是经销商）、按什么顺序讲。B2B 落地页的区块顺序、每块写什么、CTA 和表单怎么放，见 [references/landing-page-structure.md](references/landing-page-structure.md)。

再定方向：给 2–3 个**一眼能看出不是一个模子**的设计方向，每个一句话说清（调色板、字体气质、版式机制、一句话记忆点）。方法、要避开的「一眼假 AI」味，见 [references/design-directions.md](references/design-directions.md)。

给用户看过方向再往下写。用户说「你定」就选一个最稳的并说明理由。

**可选：让客户直接给风格。** 比看三版比稿更快的一条路，两种输入都支持：

- **DESIGN.md**——让客户去 [styles.refero.design](https://styles.refero.design/) 挑一个喜欢的网站风格，下载 `DESIGN.md` 发给你。变量块直接贴进 `tokens.css`，最省事。见 [references/design-md.md](references/design-md.md)。
- **网站截图**——客户直接甩"我想要这种"的截图（或设计稿）。先提取结构 + 令牌，再落到 starter；需要时可以用 [abi/screenshot-to-code](https://github.com/abi/screenshot-to-code) 快速生成一份 HTML 参考稿帮你看结构，但那只是参考，不是交付物。见 [references/screenshot-to-code.md](references/screenshot-to-code.md)。

走这两条时跳过「给方向」，但**结构仍要按第 2 步自己定**，强调色优先换回客户品牌色，截图里的第三方 Logo / 图片 / 文案一律不搬。

### 3. 落 Astro

```bash
cp -r <skill>/starter ./my-landing-page       # Windows 用 Copy-Item -Recurse
npm install
npm run dev                                                          # 看页面 http://localhost:4321（加 --host 手机可同一局域网访问）
npm run build && npm run preview                                     # 看生产构建（默认也是 4321，同时开用 --port 4322）
npx wrangler pages dev dist --persist-to .wrangler/state --port 5215 # 测表单：带 Pages Function + 本地 D1
```

只需改两个文件：`src/config.ts`（品牌名、联系方式、开关）和 `src/content.ts`（所有页面文案）。工程结构、组件分层、样式令牌、多页怎么加、每页要过哪些 SEO 检查，见 [references/astro-project.md](references/astro-project.md)。

三种本地预览的分工：`dev`/`preview` 只能看页面（都没有 Pages Function，表单提交会 404），**测表单必须用 `wrangler pages dev`**；给客户看优先发截图，或让他用 `--host` 输出的局域网地址在自己手机上打开，别为了演示去部署。完整说明见 [starter/README.md](starter/README.md)。

规矩：页面里不写内联样式，不发明新组件形态（先查 `src/components/`，缺什么补进去再复用）；品牌名、电话、邮箱、域名只在 `src/config.ts` 定义一处。

草稿阶段的图片默认已经写成 `placehold.co` 外链（首屏 1600×1200、产品卡 800×600）。按尺寸表改文字和比例即可，不要留空、也不要随手塞一张大图。客户确认后按 [references/images.md](references/images.md) 换成 `public/images/` 下的实拍图或生图产出，再重新构建部署。

### 4. 自审与校验【每版做完跑一次】

```bash
npm run build      # 必须真跑，构建失败先修
npm run check      # astro check：类型与常见错误
```

再做静态自审（截图 + console 报错 + 4xx + 横向溢出），脚本用法见 [examples/README.md](examples/README.md)。交付前逐条过 [references/astro-project.md](references/astro-project.md) 的检查清单：唯一 title、唯一 description、一个 H1、canonical、图片 alt、每页有入口，`robots.txt` / `sitemap.xml` / `404` / `llms.txt` / `webmcp.json` 都在 `dist/` 里。手机 390 宽不能有横向滚动。

### 5. 发布到 Cloudflare Pages

```bash
npx wrangler login                                                                  # 浏览器授权
npm run build
npx wrangler pages project create <project> --production-branch main                # 首次才需要
npx wrangler pages deploy dist --project-name <project> --branch main
```

让用户自己跑 `wrangler login`，**永远不要索取 Cloudflare 密码**。要落库或发邮件时，先把密钥配好再**重新部署**（Pages 密钥只对新部署生效）。完整命令、密钥分类、D1 / Turnstile / Resend 接线、域名绑定、线上验证，见 [references/deploy-cloudflare.md](references/deploy-cloudflare.md)。

### 6. 上线后

确认线上 URL 能打开、手机能看、表单能收到；接 Google Search Console 并提交 sitemap；预售期保持 noindex 三层锁，客户确认后再解锁。需要持续出内容时走 [references/content-and-keywords.md](references/content-and-keywords.md)。

## 可选分支

**A. 按客户给的风格做** —— 两种输入：

- `DESIGN.md`（来自 [styles.refero.design](https://styles.refero.design/)）：把它的 CSS 变量贴进 `tokens.css`、语义令牌指过去、按 Do's and Don'ts 改样式 → [references/design-md.md](references/design-md.md)
- 网站截图 / 设计稿：先提取骨架、栅格、配色、字体气质，再落 starter；可选地用 [abi/screenshot-to-code](https://github.com/abi/screenshot-to-code) 生成 HTML 参考稿看结构 → [references/screenshot-to-code.md](references/screenshot-to-code.md)

两种都要：强调色优先换回客户品牌色；原字族拿不到就用免费近似替代；**借结构不搬资产、不做 1:1 复刻**。

**B. 多方案比稿** —— 用户拿不定设计方向，或说「给我三个完全不同的版本」时：一次一版做静态页面（`index.html` + `styles.css` + `app.js`，无构建），让用户挑，选定后按主线第 3 步迁进 Astro。做法与三套现成样例见 [references/design-directions.md](references/design-directions.md) 和 [examples/README.md](examples/README.md)。

**C. 多页 / SEO 内容站** —— 要产品页、博客、案例、FAQ 时，按 [references/astro-project.md](references/astro-project.md) 的页面类型与依赖规则扩展，内容生产走 [references/content-and-keywords.md](references/content-and-keywords.md)。

## 交付前检查

- `npm run build` 真跑过，产物在 `dist/`
- 每页唯一 title/description、恰好一个 H1、canonical 正确
- `dist/` 里有 `robots.txt`、`sitemap.xml`、`404`、`llms.txt`、`webmcp.json`
- 手机 390 宽下 `scrollWidth === innerWidth`，无横向滚动
- console 报错 0、4xx 0
- 动效守规：`prefers-reduced-motion: reduce` 下内容立即可见（截图自审默认就是这个状态）；位移只出现在 hover；时长在 160/320/620ms 三档内
- 跑一次 `node examples/_tools/perf.mjs ./dist`，把**传输总量 / 首屏 JS / LCP** 三个数字写进交付说明（见 [references/performance.md](references/performance.md)）
- 图片：草稿用 `placehold.co` 占位（尺寸与版面比例一致）；上线前确认已全部换成真图，没换的在交付说明里写明
- 用了 DESIGN.md 或参考截图时：硬规矩逐条对过（圆角、强调色出现次数、大小写、字距、阴影），并和参考图并排比一次
- 表单：正常提交 / 蜜罐命中 / 伪造 token 被拒 / 重复提交被忽略（配了哪几项就测哪几项）
- 接了邮件通知就确认真的收到了，不是只看到接口返回 200
- 页面事实来源、没放的内容及原因、没验证的部分，都写进交付说明

## 常见坑

**Astro 与构建**

1. `output: "hybrid"` 在 Astro 5.x 已移除，用默认 `static`。
2. `/api/contact` 由 Pages Function 提供；不要只在页面里做前端校验就说「能收询盘」，构建产物里要有对应的 worker。
3. 环境变量分三类别混：构建期公开（`PUBLIC_*` → `.env`）、运行时密钥（`.dev.vars`，生产用 `pages secret`）、绑定（`wrangler.jsonc`）。
4. Pages 的密钥只对**新部署**生效，设完必须重新 deploy。

**样式与自适应**

5. 装饰性超大图形一定加 `html, body { overflow-x: clip; }`，否则手机端必然横向滚动。
6. 手机端 `grid-template-columns: 1fr` 仍会被长内容撑破，用 `minmax(0, 1fr)`，或给该列字号加 clamp。
7. 无头浏览器会把 `prefers-reduced-motion` 报成 `reduce`：滚动联动的效果（sticky 段、进度线）是「随用户滚动而变」不是自动播放，应当照常开，只要静态画面下内容仍可读；而进场淡入这类自动播放的动画，在 reduce 下必须**立即可见**——截图看到的正是这个状态，截图里内容没缺就说明兜底对了。
8. 扁平色块上的照片：`filter: grayscale(1) contrast(1.15)` + `mix-blend-mode: multiply` + 底色，比直接贴彩照更贴设计系统。

**表单与上线**

9. **在 `npm run dev` 里测表单会 404**：dev 和 preview 都不跑 Pages Function，`/api/contact` 根本不存在。测表单只能用 `wrangler pages dev dist`。
10. 本地 D1 要用 `wrangler.jsonc` 里的绑定：`pages dev --d1 DB=<名字>` 会另建一个本地库，表现是接口一直报 `no such table: leads`。两边都用配置绑定 + 同一个 `--persist-to`。
11. 表单链路顺序不能错：解析请求体 → 蜜罐 → 必填/格式校验 → Turnstile 服务端 siteverify → 频率限制 → **先写 D1，再发邮件**。邮件失败不能丢询盘。
12. `submission_key UNIQUE` 是幂等键（前端 `crypto.randomUUID()`），重复提交自动忽略。有 D1 时邮件失败也返回成功；无 D1 时邮件是唯一通道，失败必须返回 500。
13. Turnstile 测试密钥（`1x…`）任何 token 都通过，忘了换真实密钥等于表单裸奔。
14. noindex 三层锁要同时改（页面 meta、`robots.txt`、`_headers` 的 `X-Robots-Tag`），漏一处就白锁。
15. Cloudflare 的 Email Address Obfuscation 默认开着，会把页面上的 `mailto:` 改写成 `/cdn-cgi/l/email-protection`；邮箱点不了就去 Scrape Shield 关掉。
16. wrangler 的 OAuth token 每 1 小时过期；直连 Cloudflare API 报 401/403，先 `npx wrangler whoami` 刷新。

## 这个技能里带的东西

| 路径 | 用途 |
| --- | --- |
| `starter/` | **可直接复制的 Astro 落地页起始工程**：单页 + 询盘表单 + Pages Function + sitemap/robots/llms.txt/webmcp.json + D1 schema + wrangler 配置 |
| `references/landing-page-structure.md` | B2B 落地页怎么组织：按类型选结构、区块顺序、文案骨架、CTA 与表单策略、失败模式 |
| `references/design-directions.md` | 多方案设计：方向从主题怎么长出来、三轴不重叠、AI 默认味清单、截图自审与出图 |
| `references/design-md.md` | 可选项：用 styles.refero.design 的 DESIGN.md 定风格，结构解读、映射进 tokens.css、Do/Don't 转自检项 |
| `references/screenshot-to-code.md` | 可选项：客户发来喜欢的网站截图，怎么要图、提取什么、两条执行路径（含 abi/screenshot-to-code）、边界与并排自审 |
| `references/astro-project.md` | Astro 工程：目录、组件分层、样式令牌、多页扩展与依赖规则、SEO/可访问性清单 |
| `references/third-party-motion.md` | 想嵌 React Bits / Vengeance UI / Animata 这类动效库时：三条接入路径、依赖代价、四条红线、决策表 |
| `references/performance.md` | 性能预算与实测：`examples/_tools/perf.mjs` 怎么跑、动效与 React island 的真实开销对照、交付前必报的三个数字 |
| `examples/_tools/optimize-images.mjs` | 把客户给的原图按宽度压成 WebP（首屏图可选出 AVIF），配 jobs.json 使用 |
| `references/deploy-cloudflare.md` | Cloudflare Pages 全流程：部署命令、密钥分类、D1/Turnstile/Resend、noindex 锁、域名、线上验证 |
| `references/content-and-keywords.md` | 持续出内容：关键词导入、写作前分析、信息增益、反批量垃圾内容 |
| `references/images.md` | 图片两阶段：placehold.co 语法与尺寸表、换真图、生图 API 的 jobs JSON 与边界 |
| `templates/user-intake.md` | 分阶段问用户的采集模板（不要整张丢给用户） |
| `templates/site-manifest.template.json` | 站点清单：业务信息、功能依赖、URL 规则、SEO 规则、部署参数 |
| `templates/ai-accessibility-webmcp.md` | `llms.txt` / `webmcp.json` / 表单注释模板与检查项 |
| `examples/` | 三套跑通的落地页样例（同一产品、三种设计语言）+ 截图自审 / 联系表 / 生图脚本 |

依赖：Node 18+（Astro、wrangler）、一个 Cloudflare 账号；要用截图自审脚本时，额外需要 Python + Pillow 和本机 Chrome 或 Edge。
