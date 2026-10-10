# 可选风格模板：用 DESIGN.md 定设计再出草稿

给用户多一条路：**不用口述风格，直接去 [styles.refero.design](https://styles.refero.design/) 挑一个喜欢的网站风格，下载它的 `DESIGN.md` 交给 agent**，agent 按这份文件出第一版草稿。

什么时候用：

- 用户说“我想要 Apple / Stripe / 某某站那种感觉”
- 用户拿不定设计方向，比起看三版比稿，更想直接选一个现成的
- 客户已经有品牌色，但想要一套成熟的结构与排版规范

## 一、用户怎么拿（三步，写进提问话术）

1. 打开 https://styles.refero.design/ （2000+ 个真实产品站点的设计系统，每周更新）
2. 搜或逛，挑一个喜欢的风格，打开它的详情页
3. 点下载，拿到 `DESIGN.md`，把这个文件丢给 agent

给用户的原话可以用：

> 你可以先去 styles.refero.design 挑一个喜欢的风格，下载它的 DESIGN.md 发给我，我就按那套设计做草稿。懒得挑也行，我按你的行业给你定。

## 二、DESIGN.md 里有什么

一份 DESIGN.md 通常是这个结构（顺序固定）：

| 段落 | 内容 | 对草稿的用处 |
| --- | --- | --- |
| 标题 + 一句话 | 这个风格是什么感觉，主题（light / dark / mixed） | 定整体语气 |
| Tokens — Colors | 具名色 + hex + token 名 + 每个色的**角色**（谁是底、谁是文字、谁是强调） | 直接进 `tokens.css` |
| Tokens — Typography | 字族（常带 open 替代字体）、字重、字号阶梯、行高、字距、Type Scale 表 | 定字体与字号阶梯 |
| Tokens — Spacing & Shapes | 基础单位、密度、间距阶梯、圆角、**页面最大宽 / 段落间距 / 卡片内边距 / 元素间距** | 定栅格与留白 |
| Components | 命名组件（首屏、按钮、导航、卡片……）各自的结构与规格 | 直接照着拼区块 |
| Do's and Don'ts | 硬性约束，例如「所有圆角必须是 0」「一种强调色只能出现一次」 | 变成自检项 |
| Surfaces / Elevation | 层级表面色、是否有阴影、用什么分隔 | 定区块底色节奏 |
| Imagery | 图片风格：构图、色调、实拍 vs 插画、图文比例 | 定占位图文字与后期生图提示词 |
| Layout | 页面节奏：全幅 vs 容器、几栏、栏距 | 定每个区块的排布 |
| Agent Prompt Guide | 快速色彩参考 + 几条现成的组件提示词 | 写文案/组件时可直接引用 |
| Quick Start | **现成的 CSS 变量块**（`:root {}`）和 Tailwind v4 `@theme {}` | 复制粘贴就能用 |

## 三、拿到之后怎么落到 starter

### 第 1 步：把 Quick Start 的 CSS 变量整段贴进 `src/styles/tokens.css`

DESIGN.md 的 `:root { … }` 是自洽的，原样贴进去（含它的 `--color-*`、`--text-*`、`--spacing-*`、`--radius-*`、`--surface-*`）。

### 第 2 步：把 starter 的语义令牌指到它上面

starter 的组件只认这十几个语义变量，所以只要把指针改过去，全站风格立刻切换：

```css
:root {
  /* —— DESIGN.md 的变量块原样贴在这里 —— */

  /* —— 语义映射：只改这一段 —— */
  --c-bg: var(--surface-canvas-white);
  --c-surface: var(--surface-marble);
  --c-ink: var(--color-carbony-black);
  --c-ink-soft: var(--color-steel-mid);
  --c-line: var(--color-ash-border);
  --c-accent: var(--color-giallo-vivo);
  --c-accent-soft: color-mix(in srgb, var(--color-giallo-vivo) 12%, #fff);
  --c-on-accent: var(--color-pearl-white);

  --font-sans: var(--font-lambotype);
  --radius: var(--radius-buttons);
  --radius-lg: var(--radius-cards);
  --container: var(--page-max-width);
}
```

映射对照：

| starter 语义令牌 | 从 DESIGN.md 取 |
| --- | --- |
| `--c-bg` | 最常用的浅色底 / 画布色（Surfaces 里的 canvas） |
| `--c-surface` | 用于交替区块的第二底色（Surface level 1） |
| `--c-ink` | 主文字色（通常在 Colors 表里标着 “Primary text” 或使用次数最多） |
| `--c-ink-soft` | 次级文字 / 元信息色（标着 secondary、muted、caption） |
| `--c-line` | 分隔线与浅边框色 |
| `--c-accent` | 唯一的强调色（标着 accent / brand / primary action） |
| `--c-accent-soft` | 用 `color-mix` 从强调色调出来，别自己发明新颜色 |
| `--font-sans` | 主字族（优先用它给的 open 替代字体，原字族通常拿不到） |
| `--radius` / `--radius-lg` | Border Radius 表里的 buttons / cards |
| `--container` | Layout 里的 Page max-width |

### 第 3 步：把字号阶梯与间距改成它的

starter 用 `--step-*` 和 `--space-*` 两级令牌。把 DESIGN.md 的 Type Scale 与 Spacing Scale 按档位映射过去（小屏用 `clamp()` 压住，桌面端取它给的值）：

```css
--step--1: 12px;   /* caption */
--step-0:  16px;   /* body */
--step-1:  18px;   /* subheading */
--step-2:  32px;   /* heading */
--step-3:  54px;   /* display */
--step-4:  80px;   /* display-lg / hero */
--space-3: 24px;   /* element gap / card padding */
--space-5: 48px;
--space-6: 80px;   /* section gap */
```

段落间距、卡片内边距、栅格间距都取 DESIGN.md 的 `section gap` / `card padding` / `element gap`，别凭感觉写。

### 第 4 步：把 Do's and Don'ts 变成自检项

这一段是 DESIGN.md 最值钱的地方，逐条翻译成可检查的规则再动手：

| DESIGN.md 里的说法 | 落到代码里 |
| --- | --- |
| “所有圆角 0px” | `--radius: 0; --radius-lg: 0`，并检查 `.card__media` 这类局部圆角 |
| “标题必须全部大写” | 标题加 `text-transform: uppercase`（若用中文字体则改用字重/字距表达） |
| “统一 0.023em 字距” | `h1,h2,h3,.eyebrow { letter-spacing: .023em }` |
| “强调色一屏只出现一次” | 一屏只留一个 `.btn` 用强调色，其余走 ghost/outline |
| “不许用阴影” | 删掉 `--shadow`，用表面色与 1px 线分隔 |
| “只用一种字重” | 层级靠字号与大小写，不靠 `font-weight` |

### 第 5 步：Imagery 段落决定草稿占位图和后期生图

- 草稿阶段按 [images.md](images.md) 用 placehold.co，但底色取 DESIGN.md 的浅面、字色取强调色，让占位图也符合这套设计；`text=` 写明这块要放什么（例如 `Front+three-quarter+shot`）。
- 客户确认要真图时，**把 Imagery 段落的描述直接写进生图提示词**（构图、光影、色调、实拍还是插画、要不要文字），再走 `examples/_tools/gen_images.py`。

### 第 6 步：替代字体要自己引入

DESIGN.md 给的是原站字族的 open 替代字体（例如 LamboType → Barlow Condensed）。只在 `tokens.css` 里写字体名没用——**浏览器不会自己下载**，得在 `src/layouts/Layout.astro` 里引入：

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400&display=swap" rel="stylesheet" />
```

客户要求不请求第三方时，把字体文件下到 `public/fonts/` 自托管并写 `@font-face`。引完在截图里确认标题真的是替代字体的形态，别默认它生效了。

## 四、实测教训：Do's and Don'ts 要落到具体选择器

用 Lamborghini 那份 DESIGN.md 实测时，两个坑一定会碰到：

1. **强调色会从别的令牌漏出来。** 把 `--c-accent` 指到黄色之后，除了主按钮，`.eyebrow`（区块小标签）、步骤序号、链接悬停也会一起变黄——一屏出现五个黄色，直接违反“强调色一屏只出现一次”。
   做法：按 DESIGN.md 的 Do 逐条找到**所有**用强调色的地方，把非关键项降成中性色：

   ```css
   .eyebrow, .stat__value { color: var(--c-ink-soft); }   /* 只留主按钮是强调色 */
   .site-header .btn { background: transparent; border-color: var(--c-ink); color: var(--c-ink); }
   ```

2. **占位图带的旧配色会和新风格打架。** `content.ts` 里的 placehold.co URL 写死了底色和字色，换风格时要一起改（底色取新设计的面色，字色取中性色），否则草稿截图里会出现一块不属于这套系统的绿/蓝。

所以自检顺序是：先跑一次截图 → 对着 Do's and Don'ts 逐条找反例 → 改完再跑一次。只靠读代码很容易漏掉“颜色从令牌漏出去”这种问题。

## 五、三个必须提醒用户的事

1. **借的是结构与排版，不是别人的品牌资产。** 不要复制对方的 Logo、字体文件、实拍图和文案；原字族通常拿不到，用 DESIGN.md 里给的 open 替代字体。
2. **客户自己的品牌色优先。** 如果客户有品牌色，保留它的结构与排版规范，把强调色换成客户色——否则做出来是帮别人打广告。
3. **一份 DESIGN.md 只用于一个项目。** 别在同一页里混两套设计系统。

## 六、完整例子：一份 DESIGN.md 落到 tokens.css

以 Lamborghini 那份为例（展示厅黑 + 单一亮黄 + 全 0 圆角 + 全大写标题）：

```css
:root {
  /* ---- 来自 DESIGN.md 的 Quick Start ---- */
  --color-giallo-vivo: #ffc000;
  --color-carbony-black: #202020;
  --color-pearl-white: #ffffff;
  --color-marble-gray: #f5f5f5;
  --color-steel-mid: #7d7d7d;
  --color-ash-border: #969696;
  --surface-canvas-white: #ffffff;
  --surface-marble: #f5f5f5;
  --surface-carbony: #202020;
  --radius-buttons: 0px;
  --radius-cards: 0px;
  --page-max-width: 1440px;
  --font-lambotype: "Barlow Condensed", ui-sans-serif, system-ui, sans-serif;

  /* ---- 语义映射 ---- */
  --c-bg: var(--surface-canvas-white);
  --c-surface: var(--surface-marble);
  --c-ink: var(--color-carbony-black);
  --c-ink-soft: var(--color-steel-mid);
  --c-line: var(--color-ash-border);
  --c-accent: var(--color-giallo-vivo);
  --c-on-accent: #000;
  --font-sans: var(--font-lambotype);
  --radius: var(--radius-buttons);
  --radius-lg: var(--radius-cards);
  --container: var(--page-max-width);
}
```

再按 Do's and Don'ts 补三条：

```css
h1, h2, h3, .eyebrow { text-transform: uppercase; letter-spacing: 0.023em; }
h1, h2, h3 { font-weight: 400; }        /* 只有一个字重，层级靠字号 */
.btn { box-shadow: none; }              /* 不许有阴影 */
```

改完必须重新 `npm run build` 并截图自审（桌面 1440 + 手机 390），确认：没有意外的圆角、强调色一屏只出现一次、标题确实大写、没有阴影。

## 七、没给 DESIGN.md 时

照旧走主线：由 agent 按行业给 2–3 个设计方向（见 [design-directions.md](design-directions.md)），用户挑一个再落 starter。DESIGN.md 这条只是把「定方向」换成「用户自己挑现成的」。
