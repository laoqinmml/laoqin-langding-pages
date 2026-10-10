# B2B 落地页起始工程（Astro + Cloudflare Pages）

一个能直接用的单页落地页：导航 → 首屏 → 信任条 → 卖点 → 产品 → 应用 → 产能 → 合作方式与流程 → 资质 → FAQ → 询盘表单 → 页脚，附带询盘接口、SEO 文件、D1 表结构和 wrangler 配置。

## 五步跑起来

```bash
# 1. 复制到项目目录
cp -r <skill>/starter ./my-landing-page && cd ./my-landing-page   # Windows: Copy-Item -Recurse

# 2. 改两个文件（见下表）：域名/品牌/联系方式在 src/config.ts，文案在 src/content.ts

# 3. 本地预览
npm install
npm run dev            # http://localhost:4321

# 4. 构建（必须跑通再交付）
npm run build

# 5. 发布
npx wrangler login                                                                  # 浏览器授权
npx wrangler pages project create <project> --production-branch main                # 首次才需要
npx wrangler pages deploy dist --project-name <project> --branch main
```

## 本地预览：三种方式

| 想验证什么 | 命令 | 地址 |
| --- | --- | --- |
| 改文案 / 样式，热更新 | `npm run dev` | http://localhost:4321 |
| 生产构建的结果（就是上线那一份） | `npm run build && npm run preview` | http://localhost:4321 |
| 表单能不能收（Pages Function + 本地 D1） | `npx wrangler pages dev dist --persist-to .wrangler/state --port 5215` | http://localhost:5215 |

**注意**：`npm run dev` 和 `npm run preview` 都不跑 Pages Function，`POST /api/contact` 会返回 404（页面上会显示提交失败）。**要测表单必须用 `wrangler pages dev`**，并先按 `references/deploy-cloudflare.md` 建好本地 D1 表。

`npm run preview` 默认端口也是 4321，和 dev 同时开要换端口：

```bash
npm run preview -- --port 4322
```

### 给客户或同事看

- **同一台电脑**：直接开上面的地址。
- **同一局域网（手机上看真机效果）**：`npm run dev -- --host`，用输出里的 `Network:` 地址（形如 `http://192.168.1.23:4321/`），手机连同一个 Wi-Fi 即可；`wrangler pages dev` 可加 `--ip 0.0.0.0` 供局域网访问。
- **对方不在同一网络 / 不方便开服务**：用截图自审那套出图发过去（`node examples/_tools/shots.mjs` + `python examples/_tools/sheet.py`）。**不要为了给对方看一眼就去部署。**

## 要改的就两个文件

| 文件 | 改什么 |
| --- | --- |
| `src/config.ts` | 域名、品牌名、邮箱 / WhatsApp / 电话、四个开关（`noindex` / `turnstile` / `d1` / `emailNotification`） |
| `src/content.ts` | 所有页面文案：首屏、信任条、卖点、产品、应用、产能、合作方式、流程、资质、FAQ、表单文案、页脚 |

页面组件只从这两个文件取值。不要在 `.astro` 里写死邮箱、电话、域名。

## 动效：默认带一套极简的，别自己发挥

内置三种，都已经写在 `global.css` + `Layout.astro` 里，不需要额外配置：

| 动效 | 触发 | 实现 |
| --- | --- | --- |
| 首屏载入级联 | 页面加载 | `.hero > *` 的 `rise-in` 动画（纯 CSS，不走 JS，避免首屏闪烁） |
| 区块滚动进场 | 容器进入视口 | 容器加 `data-reveal`，`Layout.astro` 里的 IntersectionObserver 加 `.is-visible`，子元素按 `nth-child` 每级 60ms 级联 |
| hover 反馈 | 鼠标悬停 | 卡片描边变亮 + 上浮 2px；按钮上浮 1px；ghost 按钮反色 |

规矩：

- 时长短、统一缓动：`--motion-fast/base/slow` = 160 / 320 / 620ms，`--ease-out`。
- **`prefers-reduced-motion: reduce` 下必须立即可见**：不做进场、不做位移，hover 也不位移。已在 CSS 里处理，改动效时别破坏这一层。
- 内容不能因为 JS 失败而消失：`<html class="js-reveal">` 由 head 里的内联脚本在首帧前加上，`<noscript>` 兜住禁用 JS 的情况，IntersectionObserver 2.5 秒一次都没回调才全部显示。
- 想做更花的动效（滚动联动、Canvas / WebGL）先问客户；B2B 落地页动效太多会让采购觉得不专业，**默认一处大胆、其余克制**。
- 想直接嵌第三方动效组件库（React Bits / Vengeance UI / Animata）先读技能里的 `references/third-party-motion.md`：它们都是 React 组件，默认路线是"复制源码改写成我们的令牌"，真嵌 React island 会给项目加运行时（其中两个还要 Tailwind）。

### 看不到动效？先查这两件事

1. **系统是不是关了动画**：浏览器控制台跑 `matchMedia("(prefers-reduced-motion: reduce)").matches`，返回 `true` 就是系统要求"减少动态效果"——按规范动效就该是关的，**代码没坏**。Windows 的开关在 设置 → 辅助功能 → 视觉效果 → 动画效果。
2. **自动化截图里看不到动效是正常的**：无头浏览器默认上报 `reduce`，所以截图验证的其实是"内容完整可见"这条兜底线。

临时演示用：URL 加 `?motion=always`（例：`http://localhost:4321/?motion=always`），本次访问无视系统设置照常播放，不影响默认行为。

## 图片：草稿占位 → 确认换真图

草稿阶段**不要留空、也不要随手塞大图**，统一用 `placehold.co` 占位（默认已经这么写了），尺寸按版面比例选：

| 位置 | 尺寸 |
| --- | --- |
| 首屏主图 | `1600x1200`（4:3） |
| 产品卡图 | `800x600`（4:3） |
| 场景 / 应用卡图 | `600x400`（3:2） |
| 社交分享图 og:image | `1200x630` |

语法：`https://placehold.co/<宽>x<高>/<底色>/<字色>/<格式>?text=说明文字`

```
https://placehold.co/1600x1200/e6efe9/1f5f4a/png?text=Factory+photo
https://placehold.co/800x600/d8ded9/3c4a45/jpeg?text=CNC+parts
```

上限 4000×4000、最小 10×10；格式默认 SVG，也支持 png / jpeg / webp / avif；尺寸后加 `@2x` 出二倍图。底色和字色建议直接用主题令牌（`#e6efe9` / `#1f5f4a`），占位图也能贴合设计。

客户确认后换成真图：实拍图放进 `public/images/` 并把 `content.ts` 里的 URL 改成 `/images/xxx.jpg`；需要 AI 出图就用生图脚本（见技能里的 `references/images.md`）。**占位图是外链，上线前必须全部换掉**，换完重新 `npm run build` 并重跑一遍手机端检查。

## 换风格：DESIGN.md 或参考截图

如果客户不想看比稿，让他给风格——两种都行：

**① DESIGN.md**：去 [styles.refero.design](https://styles.refero.design/) 挑一个喜欢的风格，下载 `DESIGN.md` 发过来。

1. 把 DESIGN.md 的 `Quick Start` → `:root { … }` 变量块整段贴进 `src/styles/tokens.css`（保留它原有的 `--color-*` / `--text-*` / `--spacing-*` / `--radius-*` / `--surface-*`）。
2. 把 `tokens.css` 下面的语义变量指过去：`--c-bg: var(--surface-canvas-white)`、`--c-ink: var(--color-…-black)`、`--c-accent: var(--color-…-accent)`、`--font-sans: var(--font-…)`、`--radius: var(--radius-buttons)`。
3. 字号阶梯和间距按它的 Type Scale / Spacing Scale 覆盖 `--step-*` 与 `--space-*`；`--container` 取它的 Page max-width。
4. 把它的 Do's and Don'ts 逐条落到代码里（例如「全部 0 圆角」「强调色一屏只出现一次」「标题全大写」「不要阴影」）。

强调色优先换回客户自己的品牌色，别把别人的品牌色直接搬上线。完整映射表和例子见技能里的 `references/design-md.md`。

**② 网站截图**：客户直接发"我想要这种"的截图（整页、桌面+手机各一张，圈出最想要的那块）。先从截图里提取骨架、栅格、留白节奏、配色、字体气质、组件形态，再按上面的方式映射进 `tokens.css`；草稿图仍用 placehold.co，配色跟截图走。需要快速看清结构时，可以用 [abi/screenshot-to-code](https://github.com/abi/screenshot-to-code) 生成一份 HTML 参考稿，但**不要直接交付**（它不是 Astro，也没有 SEO 文件、表单落库和部署链路）。做法与边界见技能里的 `references/screenshot-to-code.md`。

两条路共同的红线：借结构与风格，不搬别人的 Logo、图片、字体文件和文案，不做 1:1 复刻。

## 目录

```
astro.config.mjs          站点域名 + sitemap 集成
wrangler.jsonc            Pages 配置（D1 绑定写在注释里，需要时打开）
schema.sql                leads 表结构
functions/api/contact.ts  询盘接口（Pages Function）
public/_headers           noindex 第三层锁
public/webmcp.json        AI agent 可读的表单与工具 schema
src/config.ts             品牌 / 联系方式 / 开关
src/content.ts            全部文案
src/layouts/Layout.astro  head、SEO meta、canonical、Organization JSON-LD
src/components/           Header / Hero / Section / ContactForm / Footer
src/pages/index.astro     落地页
src/pages/thank-you.astro 提交成功页（始终 noindex）
src/pages/robots.txt.ts   跟随 noindex 开关生成
src/pages/llms.txt.ts     生成 llms.txt
src/styles/               tokens.css（设计令牌）+ global.css
```

## 表单链路

`functions/api/contact.ts` 的顺序固定：解析请求体 → 蜜罐 → 校验 → Turnstile 服务端 siteverify → 频率限制 → **先写 D1 → 再发邮件** → 回写 `mail_status`。

- 三个环节按环境变量自动启用，没配就跳过。
- 有 D1 时邮件失败也返回成功（询盘没丢）；没有 D1 也没有邮件配置时直接返回 500，绝不假装成功。
- `submission_key` 是幂等键（前端 `crypto.randomUUID()`），重复提交自动忽略。
- 归因字段 `utm_*` / `gclid` / `fbclid` 从 URL 采集后写进 D1。

### 接 D1（让询盘落库）

```bash
npx wrangler d1 create landing-leads
# 把输出的 database_id 填进 wrangler.jsonc，打开 d1_databases 那段
npx wrangler d1 execute landing-leads --remote --file=./schema.sql -y
# 把 src/config.ts 的 features.d1 改成 true
```

### 接 Turnstile（挡机器人）

1. Cloudflare 控制台建 Turnstile 站点，拿 site key 与 secret key。
2. `.env` 里填 `PUBLIC_TURNSTILE_SITE_KEY`，`src/config.ts` 的 `features.turnstile` 改成 `true`。
3. 生产环境存 secret：

```bash
echo '{"TURNSTILE_SECRET_KEY":"你的secret"}' > cf-secrets.json
npx wrangler pages secret bulk cf-secrets.json --project-name <project>
```

**测试密钥（`1x…`）任何 token 都通过**，上线前一定换真实密钥，否则表单等于裸奔。

### 接 Resend（邮件通知）

```bash
echo '{"RESEND_API_KEY":"re_xxx","NOTIFY_EMAIL":"sales@yourdomain.com","FROM_EMAIL":"website@yourdomain.com"}' > cf-secrets.json
npx wrangler pages secret bulk cf-secrets.json --project-name <project>
```

发件域名先在 Resend 验证。**密钥只对新部署生效**，设完必须重新 deploy。

## 上线前把 noindex 锁解开

预售期默认锁索引，三层同时生效：`src/config.ts` 的 `noindex`（管页面 meta 和 robots.txt）与 `public/_headers`（管 `X-Robots-Tag`）。客户确认后按顺序做三件事：

1. `src/config.ts` → `features.noindex: false`
2. 删掉 `public/_headers` 里的 `X-Robots-Tag` 那几行
3. 重新构建部署，再用 `curl -I` 确认响应头里没有 `x-robots-tag`

## 交付前自检

- `npm run build` 通过，`dist/` 里有 `index.html`、`thank-you/index.html`、`robots.txt`、`llms.txt`、`sitemap-index.xml`
- 每页唯一 title/description、恰好一个 H1、canonical 指向线上域名
- 手机 390 宽无横向滚动，字号可读，按钮 ≥ 44px 高
- console 报错 0、4xx 0
- 表单四态都测过：正常提交 / 蜜罐命中 / 伪造 token 被拒 / 重复提交被忽略
- 邮件确实收到（不是只看到接口 200）
