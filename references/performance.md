# 性能：动效和第三方库到底花多少

客户问"会不会影响加载速度"时不要凭感觉回答——本地就能测出真实数字。

## 怎么测（技能自带工具）

```bash
npm run build
node examples/_tools/perf.mjs ./dist "标签"
```

它会：起一个本地静态服务（不依赖 python / wrangler）→ 手机视口 390×844 + **Fast 3G + 4× CPU 降速** → 输出各类型传输体积、`TTFB / FCP / LCP / DOMContentLoaded / load / CLS`，并列出所有脚本及其体积。

两个注意点：

- 本地服务**不做压缩**，看到的是未压缩体积；真实 CDN 会 gzip/brotli，大约三折。
- 它衡量的是首屏加载，**不测滚动后才加载的懒加载资源**（要测就先把视口设大或先滚一遍）。

## 实测基线（TaiWoo 单页，手机 390 / Fast 3G / 4× CPU）

| 版本 | 传输总量 | 首屏 JS | LCP | CLS |
| --- | --- | --- | --- | --- |
| Astro + 动效基线，无 React | **108 KB** | **0 个请求**（约 1KB 内联在 HTML 里） | 1.06 s | 0.0003 |
| + 一个 React island（`client:visible`，在首屏外） | 113 KB | **0 个请求**（进视口才加载） | 0.68 s | 0.0003 |
| + 一个 React island（`client:load`，最坏情况） | **333 KB** | **3 个 / 220 KB**（gzip ≈ 70 KB） | 0.68 s | 0.0003 |

结论：

1. **自带动效几乎不花钱**：滚动进场的 JS 小到被 Vite 直接内联进 HTML，额外请求 0 个；CSS 只多了约 2KB（gzip）。实测 CLS 0.0003，LCP 不受影响。
2. **第三方 React 组件库才是大头**：一个 island 就是 +220KB 未压缩 / **+70KB gzip** 的 JS，还没算组件库自己的依赖（GSAP、framer-motion、Tailwind 会更多）。3G 手机上 70KB gzip ≈ 多 0.4–1s 下载，再加几十到上百毫秒解析与 hydrate。
3. 同一个 island，`client:visible` 放在首屏外时**首屏一个字节的 JS 都不加载**；`client:load` 才会在首屏拉 React 运行时。
4. 这页真正占体积的是**图片（占位图一张约 25KB）和字体（Inter 48KB）**，不是动效。

## 性能预算（放进交付前自检）

| 项 | 预算 |
| --- | --- |
| 首屏 JS（gzip） | ≤ 30KB；要用 React island 另算，且必须在交付说明里写明 |
| 首屏图片 | 首屏只放 1 张主图（`loading="eager"` + 显式 width/height），其余全部 `loading="lazy"` |
| 单张图 | ≤ 1800px 宽、JPEG q82 或 WebP；hero 图 ≤ 200KB |
| 外部字体 | 只引 1 个字族、2–3 个字重；客户在意速度时改自托管 + 子集化（Inter 只留 latin 能省近一半） |
| CLS | < 0.1（实测 0.0003 属优秀） |
| LCP | 4G 下 < 2.5s；本地 Fast 3G 测出来 < 1.5s |

## 三条规则

1. **动效默认用技能自带的那套**（首屏级联 + 滚动进场 + hover）：零请求、可关闭、不影响 CLS。
2. **要上第三方动效库先读 [third-party-motion.md](third-party-motion.md)**：能复制重写就复制重写；真要嵌 React island，最多一处、用 `client:visible`、别放在 LCP 元素上。
3. **每次交付前跑一次 `perf.mjs`**，把三个数字写进交付说明：传输总量、首屏 JS、LCP。客户问起来你有数据。
