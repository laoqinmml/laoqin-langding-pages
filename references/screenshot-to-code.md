# 可选风格来源：客户直接发来喜欢的网站截图

比 DESIGN.md 更常见的一种情况：客户说不清要什么风格，直接甩一张（或几张）"我想要这种"的网站截图。

处理原则：**截图用来定结构与风格，产物仍然是 `starter/` 里的 Astro 站。** 截图转出来的 HTML 只是参考稿，不是交付物——它没有我们的 SEO 文件、询盘表单、D1 落库和 Cloudflare 部署链路。

## 一、先跟客户要对的截图

截图质量直接决定能不能用。要这几张：

1. **整页截图**：桌面宽 1440（或 1920），浏览器整页截取（不是只截首屏），PNG，2 倍图更好。
2. **关键区块单截**：客户最想要的那一块（比如那个 hero 交互、那张规格表、那个表单），单独截一张。
3. **手机版一张**：390 宽整页，用来判断响应式行为。
4. **明确偏好**：让客户圈出"就要这个部分"，其余部分说明可以改。避免整站照搬。

低分辨率、带聊天窗口/浏览器书签栏、只截了半个首屏的图，先让客户重发，别硬做。

## 二、从截图里提取什么

像写一份 mini DESIGN.md 一样，逐项记下来（这一份记录后面直接决定 `tokens.css` 和区块排布）：

| 要提取的 | 具体看什么 | 落到哪 |
| --- | --- | --- |
| 页面骨架 | 有哪几块、顺序、全幅还是容器、几栏 | 页面区块顺序（对照 [landing-page-structure.md](landing-page-structure.md) 补齐 B2B 必需项） |
| 容器与栅格 | 最大宽度、栏数、栏距、左右留白 | `--container`、`.grid` 的列与 gap |
| 留白节奏 | 段落间距、卡片内边距、区块间距 | `--space-*` |
| 配色 | 底色、文字色、唯一强调色（取色器取 hex） | `--c-bg` / `--c-ink` / `--c-accent` |
| 字体气质 | 衬线/无衬线、粗略字重、大小写、字距、标题与正文的比例差 | `--font-sans`、`--step-*`、标题是否 `uppercase` |
| 组件形态 | 按钮（圆角/描边/填充）、卡片（圆角/阴影/边框）、图片处理 | `--radius`、`--radius-lg`、阴影与分隔方式 |
| 图片风格 | 实拍/插画、色调、构图、图文比例 | 草稿占位图的 `text=` 与配色；后期生图提示词 |
| 交互线索 | 明显有滚动联动、切换、hover 的地方 | 先记下来，第一版可以不做，确认后再补 |

取色没必要逐个猜：截图里的纯色块用取色器取 hex，渐变和照片就用手感的近似色替代。

**注意**：截图里常有的"一眼假 AI 味"（紫蓝渐变、玻璃拟态、居中 hero + 三列图标）如果在客户截图里出现，说明客户就喜欢这个——那是客户偏好，不要按 [design-directions.md](design-directions.md) 的默认味清单去否定它。

## 三、两条执行路径

### 路径 1（默认）：agent 直接读截图，落到 starter

不需要任何 key、不需要起服务：

1. 按上一节提取结构 + 令牌，写成一小段记录（给客户看，也给自己用）。
2. 把令牌映射进 `starter/src/styles/tokens.css`（映射规则同 [design-md.md](design-md.md) 第 3 节）。
3. 按截图的区块顺序调整 `src/pages/index.astro` 的区块与 `src/content.ts` 的文案。
4. 草稿图仍用 `placehold.co`（尺寸按 [images.md](images.md)），配色跟截图走。
5. `npm run build` + 截图自审。

这条路径最稳，产物直接是能上线的 Astro 站。

### 路径 2（可选）：用 abi/screenshot-to-code 先生成一份 HTML 参考稿

[abi/screenshot-to-code](https://github.com/abi/screenshot-to-code)（MIT，80k+ star）能把截图/设计稿/录屏转成 HTML+Tailwind / React / Vue 代码。用它**加速"看清结构"这一步**，不是拿来当交付。

三种用法，按投入从低到高：

- **托管版**：https://screenshottocode.com/ ——最省事，上传截图直接出代码。
- **Docker 本地起**（仓库根目录）：

  ```bash
  echo "GEMINI_API_KEY=your-key" > .env      # 至少一个模型 key；Gemini 质量最好
  docker-compose up -d --build               # 起在 http://localhost:5173
  ```

- **本地开发模式**：后端 FastAPI（Poetry，端口 7001）+ 前端 React/Vite（pnpm，端口 5173），至少需要一个 OpenAI / Anthropic / Gemini key，Gemini 与 Replicate 效果最好。

拿到它生成的那页 HTML 之后，只做三件事：

1. 看它的**分区与栅格**（哪几块、怎么排、比例关系），对照自己的提取记录纠错。
2. 看它的**令牌取值**（颜色、间距、字号），需要时抄进 `tokens.css`。
3. 其余代码不用。**不要**直接把它的 HTML 交付给客户，原因：不是 Astro 工程、缺 `robots.txt`/`sitemap.xml`/`llms.txt`/`webmcp.json`、表单不落库、常夹带截图里的第三方品牌素材。

## 四、边界（这条比技术更重要）

- **借结构与风格，不做 1:1 复刻。** 客户发来的多半是同行或大牌官网；原样复刻有法律与品牌风险，也做不出差异。做法是保留版面逻辑与气质，换掉颜色体系、文案、图片、图标。
- **不搬第三方资产**：截图里的 Logo、插画、产品图、字体文件、文案都不要直接使用；字体用免费的近似替代（同 [design-md.md](design-md.md) 第 6 步）。
- **截图里的品牌名要替换**成客户品牌；如果客户就是要求"照着 XX 做"，明确告诉他这条边界，并给一个"同结构、换皮"的版本。
- **客户给了截图 ≠ 客户给了事实**。页面上的参数、认证、产能仍然只能用客户提供的来源，截图里的数字不能抄。

## 五、自审：和参考截图并排比

改完必须并排看一次，不能只凭记忆：

```bash
node examples/_tools/shots.mjs <项目> 1440 900 "top" "#capabilities" "#contact"
python examples/_tools/sheet.py _tools/shots/s1.jpg _tools/shots/*.png 3
```

对照检查：区块顺序是否一致、栅格与留白节奏是否接近、强调色是否只出现在该出现的地方、字体气质是否对得上、手机端是否仍成立。差异太大的地方要么改，要么明确告诉客户"这块我按 B2B 询盘的习惯调整了"。

## 六、和 DESIGN.md 怎么选

| 客户给的东西 | 走哪条 |
| --- | --- |
| `styles.refero.design` 下载的 `DESIGN.md` | [design-md.md](design-md.md)：变量块直接贴，最省事 |
| 网站截图 / 设计稿 | 这份文档：先提取，再落 starter |
| 只有"我喜欢 XX 那种感觉" | 让客户去 refero 挑一份，或你按行业做 2–3 个方向（[design-directions.md](design-directions.md)） |
