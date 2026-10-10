# laoqin-langding-pages · 落地页 / 独立站技能

> 帮 B2B 企业主把产品、工厂、服务信息做成 Astro 落地页，发布到 Cloudflare Pages，并且真能收到询盘。

这是一个给 AI agent（Codex / Claude Code 等）用的技能包：**用户只回答几个问题，结构、文案骨架、设计、SEO、表单和部署都由 agent 完成。**

## 能做什么

四条路径，按客户要什么选：

| 路径 | 什么时候用 | 交付物 |
| --- | --- | --- |
| 主线：Astro 落地页 → Cloudflare | 客户要一个能收询盘的正式站 | Astro 静态站 + 询盘表单 + 上线 |
| A 按客户给的风格做 | 客户发来 `DESIGN.md`，或直接甩一张喜欢的网站截图 | 按那份设计系统 / 截图的结构与气质出草稿 |
| B 多方案比稿 | 客户拿不定设计方向 | 2–3 版互不相似的设计，选定后再进 Astro |
| C 多页 / SEO 内容站 | 要产品页、博客、案例、FAQ | 多页 Astro 站 + 内容工作流 |

任何行业通用：制造 / 代工、机械设备、材料、专业服务、产品发布、活动报名。

## 安装

```bash
git clone https://github.com/laoqinmml/laoqin-langding-pages.git ~/.codex/skills/laoqin-langding-pages
```

Windows PowerShell：

```powershell
git clone https://github.com/laoqinmml/laoqin-langding-pages.git "$env:USERPROFILE\.codex\skills\laoqin-langding-pages"
```

装完新开一轮对话即可触发（说「做一个落地页」「做官网」「astro 建站」都行）。

## 五分钟拿到一个能跑的落地页

```bash
cp -r starter ./my-landing-page && cd ./my-landing-page   # Windows: Copy-Item -Recurse
npm install
npm run dev        # http://localhost:4321
npm run check      # astro check：类型与常见错误
npm run build      # 产物在 dist/
```

**本地预览三种方式**：`npm run dev`（改文案/样式，热更新）→ `npm run build && npm run preview`（看上线那一份构建）→ `npx wrangler pages dev dist --persist-to .wrangler/state --port 5215`（测表单，带 Pages Function + 本地 D1）。前两种都没有 Pages Function，**表单提交会 404**。手机上看真机效果：`npm run dev -- --host`，用输出里的 `Network:` 地址（同一 Wi-Fi）。详细说明见 [starter/README.md](starter/README.md)。

只改两个文件就能换一个客户：

| 文件 | 改什么 |
| --- | --- |
| `src/config.ts` | 域名、品牌名、邮箱 / WhatsApp / 电话、四个开关（`noindex` / `turnstile` / `d1` / `emailNotification`） |
| `src/content.ts` | 所有文案 + 图片 URL |

## 主线六步

1. **起手**——只问五件事：公司/品牌、目标国家和语言、行业、主要产品、联系方式。
2. **抓事实**——把参考页或产品册整理成事实清单，标出不能用、不能编的数据。
3. **定结构 + 定方向【停下给用户确认】**——先写计划再写一行代码。
4. **落 Astro**——复制 `starter/`，改 `config.ts` 与 `content.ts`。
5. **自审与校验**——`npm run build` + 截图自审 + SEO 检查清单。
6. **发布**——Cloudflare Pages 上线，接表单（D1 落库 / Turnstile / Resend 通知）。

完整流程与规矩见 [SKILL.md](SKILL.md)。

## 目录结构

| 路径 | 说明 |
| --- | --- |
| `SKILL.md` | 技能入口：默认交付物、八条规矩、主线六步、常见坑、交付检查 |
| `starter/` | **可直接复制的 Astro 落地页起始工程**：单页 13 区块 + 询盘 Pages Function + D1 schema + `robots.txt`/`llms.txt`/`webmcp.json` + noindex 三层锁 + wrangler 配置 |
| `references/landing-page-structure.md` | B2B 落地页怎么组织：按类型选结构、区块顺序、CTA 与表单策略、失败模式 |
| `references/design-directions.md` | 多方案设计：方向从主题怎么长出来、三轴不重叠、AI 默认味、截图自审与出图 |
| `references/design-md.md` | 用 [styles.refero.design](https://styles.refero.design/) 的 `DESIGN.md` 定风格：结构解读、映射进 `tokens.css`、Do/Don't 转自检项 |
| `references/screenshot-to-code.md` | 客户发来喜欢的网站截图：要什么样的截图、提取骨架/令牌、两条执行路径（含 [abi/screenshot-to-code](https://github.com/abi/screenshot-to-code)）、版权边界与并排自审 |
| `references/images.md` | 图片两阶段：`placehold.co` 语法与尺寸表、换真图、生图 API 的 jobs JSON |
| `references/astro-project.md` | Astro 工程：目录、组件规矩、多页扩展与依赖规则、SEO/可访问性清单 |
| `references/deploy-cloudflare.md` | 部署：命令、密钥三类、D1/Turnstile/Resend、noindex 锁、域名、线上验证 |
| `references/content-and-keywords.md` | 持续出内容：关键词导入、写作前分析、信息增益、内链结构 |
| `templates/` | 用户采集模板、站点 manifest、AI 友好 / WebMCP 模板 |
| `examples/` | 三套跑通的落地页样例（同一产品、三种设计语言）+ 截图自审 / 联系表 / 生图脚本 |

## 图片：草稿占位 → 确认后出真图

- **草稿阶段**一律用 [placehold.co](https://placehold.co/) 占位，尺寸与版面比例对齐（首屏 1600×1200、产品卡 800×600、场景卡 600×400、og 1200×630），底色/字色取设计令牌。
- **客户确认后**换真实图片：实拍进 `public/images/`，没有实拍就用生图脚本 `examples/_tools/gen_images.py`（OpenAI 兼容接口，读 jobs JSON，出图即压缩）。
- 占位图是外链，**上线前必须全部换掉**。

细节见 [references/images.md](references/images.md)。

## 换风格：DESIGN.md 或参考截图

两条输入，任选其一：

- **DESIGN.md**：客户去 [styles.refero.design](https://styles.refero.design/) 挑一个喜欢的网站风格，下载 `DESIGN.md` 交给 agent。它有现成的 `:root {}` 变量块、组件规格和 Do's and Don'ts，映射进 `starter/src/styles/tokens.css` 即可整站换风格。
- **网站截图**：客户直接发"我想要这种"的截图（整页、桌面 + 手机各一张）。先提取骨架、栅格、留白节奏、配色、字体气质，再落到 starter；需要快速看清结构时可用 [abi/screenshot-to-code](https://github.com/abi/screenshot-to-code) 生成 HTML 参考稿——它输出的是 HTML/React 单页，**不是交付物**（没有 SEO 文件、询盘落库和 Cloudflare 链路）。

做法见 [references/design-md.md](references/design-md.md) 与 [references/screenshot-to-code.md](references/screenshot-to-code.md)。共同红线：借结构与风格，不搬别人的 Logo、图片、字体文件和文案，不做 1:1 复刻；强调色优先换回客户自己的品牌色；截图里的参数和认证数字仍然只能用客户提供的事实。

## 部署到 Cloudflare Pages

```bash
npx wrangler login
npm run build
npx wrangler pages project create <project> --production-branch main   # 首次才需要
npx wrangler pages deploy dist --project-name <project> --branch main
```

表单链路顺序固定：解析请求体 → 蜜罐 → 校验 → Turnstile 服务端 siteverify → 频率限制 → **先写 D1 → 再发邮件** → 回写 `mail_status`。有 D1 时邮件失败也返回成功；没有 D1 也没有邮件配置时直接 500，不假装成功。

密钥分三类别混：构建期公开（`.env`）、运行时密钥（`.dev.vars` / `pages secret`）、绑定（`wrangler.jsonc`）。**Pages 的密钥只对新部署生效**，设完必须重新部署。

完整命令见 [references/deploy-cloudflare.md](references/deploy-cloudflare.md)。

## 依赖

- Node 18+（Astro、wrangler）
- 一个 Cloudflare 账号（静态站免费额度够用）
- 要用截图自审 / 出图脚本时：Python + Pillow、本机 Chrome 或 Edge，`examples/_tools/` 下 `npm i puppeteer-core`
- 表单落库可选 Cloudflare D1；人机验证可选 Turnstile；邮件通知可选 Resend

## 已验证范围

已实测：`starter/` 通过 `astro check`（0 errors）与 `astro build`；产物含 `index.html`、`thank-you/`、`robots.txt`、`llms.txt`、`sitemap-index.xml`、`webmcp.json`；桌面 1440 与手机 390 均无横向滚动、console 无报错；表单接口在 `wrangler pages dev` 下测得 400（缺字段）/ 500（未配通道）/ 200（蜜罐命中）；用一份真实 `DESIGN.md`（Lamborghini 风格）走通了整站换风格。

未覆盖：`examples/` 里的旧版静态样例表单仅做前端校验，未接后端；Safari 与真机性能未单独测。
