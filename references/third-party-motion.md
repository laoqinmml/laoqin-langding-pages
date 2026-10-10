# 第三方动效组件库：能不能嵌、怎么嵌

客户或你自己看到喜欢的动效，常见的三个库：

| 库 | 形态 | 依赖 | 许可 |
| --- | --- | --- | --- |
| [React Bits](https://reactbits.dev/)（GitHub: DavidHDev/react-bits，48k+ star） | 200+ 组件，每个有 **4 个变体：JS-CSS / JS-TW / TS-CSS / TS-TW** | React；选 CSS 变体则**不需要 Tailwind** | MIT + Commons Clause（可免费用在项目里，**但不能把组件本身当产品转售**） |
| [Vengeance UI](https://www.vengenceui.com/)（注意域名拼写是 vengence） | 46 组件 / 9 家族，走 shadcn registry | 官方前置步骤：Next.js → **Tailwind** → theming → utilities；安装 `npx shadcn@latest add @vengeanceui/<组件>` | 见仓库 |
| [Animata](https://animata.design/) | 156+ 组件，复制粘贴式 | React + **Tailwind（shadcn 生态）**；也有 npm 包 `animata` | 开源 |

共同点：**它们都是 React 组件**。我们的 starter 是纯 Astro + 自写 CSS（没有 React、没有 Tailwind），所以"嵌入"是有成本的决定，不是加一行 import。

## 三条接入路径

### A. 复制源码，改写成本站令牌（默认推荐）

把组件源码复制进 `src/components/`，把它的颜色、圆角、阴影、字体全部换成 `tokens.css` 里的令牌；Tailwind 类名改写成普通 CSS。

- 新增依赖：**0**（React Bits 的 JS-CSS 变体就是这种）
- 优点：包体积、无障碍、reduce-motion、设计一致性全部可控，和客户的 DESIGN.md 不打架
- 代价：要读懂它的动画实现，重写那几十行 CSS/JS

### B. Astro island：真把 React 组件嵌进去

只有客户明确点名"就要这个效果"、且 A 路线成本过高时才走：

```bash
npx astro add react          # 装 @astrojs/react + react + react-dom
```

```astro
---
import BlurText from "../components/react/BlurText";
---
<!-- 只 hydrate 一个组件，且进了视口才加载 -->
<BlurText client:visible text="Purpose-built solutions for every sport" />
```

要点：

- 组件文件放 `src/components/react/`，用 `.tsx`；需要在 `astro.config.mjs` 里加 `react()`（`npx astro add react` 会自动加）。
- **一个页面最多一处 island**，`client:visible` 或 `client:idle`，不要 `client:load` 到处撒。
- 页面文字仍然 SSR 进 HTML（SEO 不受影响），但会多出 React 运行时 + 组件自身的 JS（几十到上百 KB，看组件）。**动效不能出现在首屏 LCP 元素上**。
- 若组件用 Tailwind 写的，就得为它引入 Tailwind（和现有 `tokens.css` 并存会出现两套样式体系）——这也是为什么 B 路线要慎重。

### C. 只借思路，自己重写（设计系统强时最优）

看清它"怎么动"（位移量、时长、缓动、触发点），用我们现有的 `--motion-*` 令牌重写一遍。多数"文字逐字显现 / 边框流光 / 卡片跟随"用 30 行 CSS + 一点 JS 就能复刻，且完全贴合客户的设计规范。

## 四条红线

1. **减少动态效果必须关**：这些库的动画基本是自动播放型，`prefers-reduced-motion: reduce` 下必须立即显示最终态。React 组件的动画不受我们 CSS 控制，要自己接 `matchMedia` 判断。
2. **不许放在首屏 LCP 元素上**，不许造成 CLS；canvas / WebGL 背景（Aurora、Particles、Liquid 之类）在手机上直接别用。
3. **触屏和键盘下要有意义**：鼠标跟随、cursor trail 这类在手机上等于没有，别占版面。
4. **许可**：React Bits 是 MIT + Commons Clause，**不能把组件本身当产品卖**；交付说明里注明用了哪个库和它的许可。

## 决策表

| 客户的要求 | 走哪条 |
| --- | --- |
| "这里能有点动效吗" | 先用 starter 自带的动效基线（首屏级联 + 滚动进场 + hover），够了就停 |
| "我喜欢这个网站的文字动效" | A / C：复制或重写，配色换成客户令牌 |
| "我就要 React Bits 里那个组件一模一样" | B：加 React island，`client:visible`，一处 |
| "整个首页都要粒子背景" | 劝退：手机性能 + 转化都吃亏，改成静态渐变 + 一处微动效 |

## 交付时要说明的

- 用了哪个库、哪个组件、什么许可
- 是否新增了 React / Tailwind 依赖（客户后续维护要知道）
- 减少动态效果下的表现
