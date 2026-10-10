# Astro 工程：结构、组件、多页、检查清单

## 起始工程怎么用

```bash
cp -r <skill>/starter ./my-landing-page && cd ./my-landing-page    # Windows: Copy-Item -Recurse
npm install
npm run dev        # http://localhost:4321
npm run check      # astro check：类型与常见错误
npm run build      # 产物在 dist/
```

只改两个文件就能换一个客户：

| 文件 | 改什么 |
| --- | --- |
| `src/config.ts` | 域名、品牌名、邮箱 / WhatsApp / 电话、四个开关（`noindex` / `turnstile` / `d1` / `emailNotification`） |
| `src/content.ts` | 所有文案 + 图片 URL（草稿用 placehold.co，见 [images.md](images.md)） |

## 目录结构

```
astro.config.mjs           站点域名 + sitemap 集成；output 保持 static
wrangler.jsonc             Pages 配置；D1 绑定写在注释里，需要时打开
schema.sql                 leads 表结构
functions/api/contact.ts   询盘接口（Pages Function，走 /api/contact）
public/_headers            noindex 第三层锁
public/webmcp.json         AI agent 可读的表单与工具 schema
public/favicon.svg         内联 SVG 图标，避免 favicon.ico 404
src/config.ts              品牌 / 联系方式 / 开关
src/content.ts             全部文案
src/layouts/Layout.astro   head、SEO meta、canonical、Organization JSON-LD
src/components/            Header / Hero / Section / ContactForm / Footer
src/pages/index.astro      落地页
src/pages/thank-you.astro  提交成功页（始终 noindex）
src/pages/robots.txt.ts    跟随 noindex 开关生成
src/pages/llms.txt.ts      生成 llms.txt
src/styles/tokens.css      设计令牌（配色、字号、间距、圆角、容器宽）
src/styles/global.css      基础排版与组件样式
```

## 组件规矩

- **页面里不写内联样式**，样式只出现在 `global.css` 或组件自己的 `<style>` 里。
- **不发明新组件形态**：先查 `src/components/`。缺能力就补进现有组件，而不是在页面里再写一份。
- 品牌名、电话、邮箱、域名只在 `config.ts` 出现一次；文案只在 `content.ts` 出现一次。
- 文案写在 HTML/组件里，不用 JS 拼正文（SEO 和无障碍都靠它）。
- 一页只有一个 H1（首屏标题），其余用 H2/H3。

## 设计令牌

`tokens.css` 里三件事必须成套：**底色 + 一个强调色 + 中性灰阶**；字号用 `clamp()` 做流体缩放；容器宽度 `--container` 统一。换主题只改这一个文件。

## 动效基线

`starter` 自带一套极简动效，新项目不用从零写，也不要随手加更多：

| 动效 | 触发 | 位置 |
| --- | --- | --- |
| 首屏载入级联 | 页面加载 | `global.css` 的 `rise-in` 动画作用在 `.hero > *`（纯 CSS，避免首屏闪烁） |
| 区块滚动进场 | 容器进入视口 | 容器标 `data-reveal`；`Layout.astro` 的 IntersectionObserver 加 `.is-visible`；子元素按 `nth-child` 级联 60ms |
| hover 反馈 | 悬停 | 卡片描边变亮 + 上浮 2px；按钮上浮 1px；ghost 反色（不用阴影） |

四条硬规矩：

1. **减少动态效果时立即显示**：`@media (prefers-reduced-motion: reduce)` 里把进场动画、位移、hover 位移全部关掉。进场动画属于「自动播放」，必须关；而随滚动而变的效果（sticky 段、进度线）属于交互反馈，照常开。
2. **JS 失败不能让内容消失**：隐藏态只由 `<html class="js-reveal">` 触发，这个 class 由 head 内联脚本在首帧前加；`<noscript>` 里覆盖成可见；观察器 2.5 秒没任何回调就 `revealAll()` 兜底。
3. **动效只出现在标记过的地方**：容器加 `data-reveal` 才有进场，不做「全站自动扫一遍」的魔法。
4. **时长短**：160 / 320 / 620ms 三档 + 统一 `--ease-out`；超过这个量级的动效先问客户。

无头截图默认报 `prefers-reduced-motion: reduce`，所以**截图里内容齐全，就等于验证了第 1 条**；要单独验证滚动进场，用 CDP 把媒体特性模拟成 `no-preference` 再测（滚动前子元素 `opacity: 0`，滚动后变 `1`）。

**客户说"看不到动效"时的排查顺序**：① 控制台 `matchMedia("(prefers-reduced-motion: reduce)").matches`（`true` = 系统关了动画，Windows 在 设置 → 辅助功能 → 视觉效果 → 动画效果）；② 确认看的是动效版而不是克制版；③ 确认是刷新后看的首屏（载入动画只播一次）。演示/验收时可以在 URL 上加 `?motion=always` 临时无视系统设置（starter 已内置这个开关）。

**验证滚动/数字动画时别只看最终值**：数字滚动如果只检查"最后等于 2013"，即使动画抛异常也会假通过。要**中途采样**（例如 160ms 一次），看到 `2013 → 772 → 1468 → …` 这种中间值才算真的在动。

**选择器坑**：`js-reveal` 和 `force-motion` 都挂在同一个 `<html>` 上，覆盖规则必须写 `.force-motion.js-reveal [data-reveal]`（同一元素），写成 `.force-motion .js-reveal`（后代）永远不匹配，动效会被 reduce 的"立即可见"盖掉。

想要更花的动效（React Bits / Vengeance UI / Animata 这类第三方动效库）时，先读 [third-party-motion.md](third-party-motion.md) 再决定走哪条路——它们都是 React 组件，真嵌进来等于给项目加 React 运行时（Vengeance UI 和 Animata 还要 Tailwind）。

## URL 与页面组织

- 最终 URL 扁平：`/about-us/`、`/contact-us/`、`/products/`、`/blog/`、`/faq/`。
- 小写英文 + 数字 + 连字符；不要中文、空格、下划线、大写，不要 `?id=123` 这种查询式 URL。
- 除非用户明确要求，避免 `/blog/category/topic/` 这类深路径。

## 扩成多页时

页面类型与依赖规则（**首页永远有；选了产品页就必须有产品分类页，选了博客页就必须有博客分类页**）：

| 类型 | 用于 | 必须带 |
| --- | --- | --- |
| 博客详情页 | 文章、指南、教程 | 博客分类页 + 内链 + 配图建议 |
| 产品详情页 | 产品/服务详情 | 产品分类页 + 相关产品 |
| 产品分类页 | 产品列表 | 链到每个产品 |
| 博客分类页 | 文章列表 | 链到每篇 |
| 案例页 / FAQ / 资料下载页 | 可选 | 从导航或正文有入口 |

每页至少有一个入口：导航、分类页、相关页、sitemap、或正文内链。**不允许有孤岛页。**

## 每页都要过的检查

- [ ] title 唯一、长度合理
- [ ] meta description 唯一、长度合理
- [ ] 恰好一个 H1，与页面主题一致且全站不重复
- [ ] canonical 指向当前规范化 URL
- [ ] 图片有 alt，且写了 width/height 或 CSS 尺寸（控 CLS）
- [ ] 详情页归属分类页
- [ ] 至少一个入口，无孤岛
- [ ] 语义化地标：`header` / `nav` / `main` / `section` / `article` / `footer`
- [ ] 表单字段有 label、必要的 `autocomplete`、`data-webmcp-form` 注释
- [ ] 重要链接/按钮文字能看懂（不要「点击这里」）
- [ ] `robots.txt`、`sitemap.xml`、`404`、`llms.txt`、`webmcp.json` 都在 `dist/`

## 表单与 AI 友好

- 表单接口是 Pages Function（`functions/api/contact.ts`），链路与开关见 [deploy-cloudflare.md](deploy-cloudflare.md)。
- `public/llms.txt` 与 `public/webmcp.json` 是给 AI agent 和浏览器自动化读的：站点用途、允许的引用方式、重要 URL、表单字段与工具 schema。模板见 [../templates/ai-accessibility-webmcp.md](../templates/ai-accessibility-webmcp.md)。

## 常见坑

1. `output: "hybrid"` 在 Astro 5.x 已移除，用默认 `static`。
2. 构建产物里要有 `/api/contact` 的 worker（Pages Function），别只做前端校验就说能收询盘。
3. 装饰性大图形要 `html, body { overflow-x: clip; }`，否则手机端横向滚动。
4. 卡片网格用 `minmax(0, 1fr)`，长单词和大数字不会撑破列。
5. 用 `@astrojs/sitemap` 时必须在 `astro.config.mjs` 设 `site`，否则 sitemap 里是空域名。
6. 每次改完跑 `npm run check` 和 `npm run build`，别靠肉眼确认。
