# 图片：草稿用占位，确认后用真图

分两阶段，别混：

| 阶段 | 用什么 | 目的 |
| --- | --- | --- |
| 草稿 / 给客户看方向 | `placehold.co` 占位图 | 页面先有完整观感，版面、比例、截图自审都能做，不用等图 |
| 客户确认后 | 真实图片（客户实拍，或生图 API 出的图） | 上线交付 |

## 阶段一：草稿一律用 placehold.co

语法（来自 placehold.co 官方文档）：

| 用途 | 写法 | 说明 |
| --- | --- | --- |
| 指定宽高 | `https://placehold.co/600x400` | 只给宽度得到正方形，如 `https://placehold.co/400` |
| 尺寸范围 | —— | 最大 4000×4000，最小 10×10 |
| 指定格式 | `https://placehold.co/600x400/png` 或 `https://placehold.co/600x400.png` | 默认 SVG；支持 SVG / PNG / JPEG / GIF / WebP / AVIF |
| 指定颜色 | `https://placehold.co/600x400/000000/FFF` | 背景色/文字色；也可用 CSS 颜色名或 `transparent`。两个颜色必须一起给 |
| 指定文字 | `https://placehold.co/600x400?text=Hello+World` | 空格用 `+`，换行用 `\n` |
| 指定字体 | `https://placehold.co/600x400?font=roboto` | 默认 Lato，可用字体见官网下拉列表 |
| 二倍图 | `https://placehold.co/600x400@2x.png` | 支持 `@2x` / `@3x`，仅栅格格式（png/jpeg/gif/webp/avif） |
| 组合示例 | `https://placehold.co/1200x900/e6efe9/1f5f4a/png?text=Factory+photo` | 尺寸 / 背景 / 文字 / 格式 + 文字参数，可以叠加 |

### 尺寸怎么选

按版面实际占用像素 × 1.5–2 取整到整百，并且**和 CSS 里的 `aspect-ratio` 一致**，否则截图自审时看起来会变形。

| 位置 | 建议尺寸 | 比例 |
| --- | --- | --- |
| 首屏主图 | 1600×1200 或 1600×1067 | 4:3 / 3:2 |
| 产品卡图 | 800×600 | 4:3 |
| 场景 / 应用卡图 | 600×400 | 3:2 |
| 团队 / 人物竖图 | 600×800 | 3:4 |
| 客户 Logo 墙 | 240×120（SVG 或有底色） | 2:1 |
| 社交分享图（og:image） | 1200×630 | 1.91:1 |
| 站点图标 | 512×512 | 1:1 |

配色跟设计令牌走：底色用主题里的浅色，字色用强调色，`text=` 写明这一块要放什么图（`Factory+photo`、`CNC+parts`），这样草稿截图看起来也像一套设计。

草稿期要知道的两件事：

- 占位图是外链，客户看预览要联网；**上线前必须全部换掉**。
- 换完图要重新 `npm run build` + 重跑截图自审（重点看手机端和图片比例）。

## 阶段二：换成真实图片

客户给了实拍图：放进 `public/images/`，压缩到 ≤ 1800 px 宽 / JPEG q82，文件名用语义化 slug（`hero-factory.jpg`），`alt` 写清拍的是什么；`content.ts` 里的 URL 改成 `/images/hero-factory.jpg`。

### 首选：直接用客户自己网站上的图

客户要是已经有官网/落地页，**直接拉他们自己的图**——比 AI 生图真实、比占位图可信，而且图片本来就属于客户。

```bash
# 1. 从客户页面把所有图片地址抓出来（这里以 WordPress 站为例）
#    正则匹配 src/data-src 的图片后缀，再去重
# 2. 下载到项目里的 _downloads/（不要直接放进 public/，先压再放）
# 3. 用技能自带脚本压缩（见下）
# 4. content.ts 里改成 /images/<name>.webp，并在交付说明里写明图片来源
```

```bash
node examples/_tools/optimize-images.mjs _downloads public/images jobs.json
```

`jobs.json` 长这样（键是输出名，值是原文件名与目标宽度）：

```json
{
  "hero":         { "file": "raw-hero.webp", "width": 1200, "quality": 78, "avif": true },
  "sport-cycling":{ "file": "raw-cycling.webp", "width": 900, "quality": 78 }
}
```

实测数据（TaiWoo 单页，13 张图）：原图 **1012KB → 708KB**；首屏图 97KB → WebP 54KB → **AVIF 43KB**；整页首屏传输 108KB（占位图）→ 133KB（真图 + AVIF）。

三条要点：

1. **首屏图一定出 AVIF**，页面用 `<picture><source type="image/avif"><img …></picture>` 兜底，再配 `loading="eager" fetchpriority="high" decoding="async"` 和正确的 width/height。
2. **其余图全部 `loading="lazy"`**，并按版面比例写死宽高或 CSS `aspect-ratio`（证书这类竖图用 `object-fit: contain`，别裁掉文字）。
3. 图片是客户资产，但**交付说明里仍要写明来源**（"图片取自客户官网 xxx 页面"），别让客户以为是 AI 生成的。

没有实拍、需要 AI 出图：用技能自带的生图脚本 `examples/_tools/gen_images.py`（OpenAI 兼容接口，带重试，出图即压缩）。

```bash
IMG_API_KEY=xxx python examples/_tools/gen_images.py <输出目录> jobs.json [只出某个任务名]
```

jobs JSON 结构：

```json
{
  "base_url": "https://jojocode.com/v1/images/generations",
  "model": "gpt-image-2",
  "style_suffix": " Photorealistic, high detail, natural colour grading. No text, no watermark, no brand logos.",
  "jobs": {
    "hero":       { "prompt": "…", "size": "1536x1024", "max_w": 1800 },
    "product-01": { "prompt": "…", "size": "1024x1024", "max_w": 1200 }
  }
}
```

出图四条规矩：

1. 提示词里**把比例写成数字**（画幅、各段长度），否则 AI 容易画歪；
2. 用同一个 `style_suffix` 让一批图看起来是一套；
3. key 只从环境变量 `IMG_API_KEY` 读，绝不写进 jobs JSON 或产物；
4. 并发别超过 2–3，高了整批容易被截断。

边界：

- **AI 生成的图要在交付说明里写明**，不能当实拍图宣传。
- 没有授权的客户名、真实商标、真实产品外观不要生成。
- 换完图再跑一次 `npm run build` 和截图自审，确认没有拉伸、变形、超宽。
