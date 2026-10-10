# 示例：同一批事实，三套设计方向

这是技能自带的三套跑通的落地页样例，给「多方案比稿」当参照物。**正式交付走 `../starter/` 的 Astro 工程**，这里的静态版只用于快速看方向、让客户挑。

三个版本共用同一份内容骨架（卖点 → 应用场景 → 能力 → 客户类型 → 合作方式 → 流程 → 资质 → 询盘），区别只在设计语言。判据是：把三个方向的名字盖住只看截图，应该认不出是同一批人做的。

## 怎么打开

无构建步骤，但三个版本共用 `assets/`，要走 HTTP 才能正确加载图片。**在 `examples/` 这一层启动服务**：

```bash
cd examples
python -m http.server 5173
```

然后打开 http://localhost:5173/ —— 这一层的 `index.html` 是三个版本的入口页。

## 三个版本

| 版本 | 设计方向 | 最想让人记住的那一处 |
| --- | --- | --- |
| [`v1-lens-lab/`](v1-lens-lab/) | 浅色光学实验室。冷调纸白 + 墨蓝，Archivo 可变字宽（标题拉到 125%）。左下右器的两栏结构，一节一个可操作的器件。 | 首屏一块镜片在实拍山路上游走：镜片内是矫正后的清晰画面，镜片外是模糊的裸眼视野。可切换透明 / 变色 / 高对比 / 偏光四种镜片，变色镜带紫外线强度滑块。偏光用内联 SVG 的 `feComponentTransfer` 压暗高光来模拟消眩光。 |
| [`v2-mirror-night/`](v2-mirror-night/) | 深钴蓝夜色。Big Shoulders 窄体大字（`line-height: .9`）。全幅照片层叠，每项运动一屏。 | 首屏是 WebGL 实时渲染的镀膜镜片：薄膜干涉色 + 程序生成的环境反射（上亮下暗加一道地平线），跟鼠标走，五种镀膜色可换。镜片分层是 3D 透视爆炸图，流程是随滚动画出的曲线。 |
| [`v3-pictogram/`](v3-pictogram/) | 赛事标识系统风格。白底 + 六个运动的扁平标识色 + 2px 描边，严格的方形网格。Schibsted Grotesk。 | 中段的「项目简报」构建器：选运动（六个扁平图标）、镜片、路线、数量、度数，右侧规格卡实时更新并标注推荐镜片；点发送把简报写进底部询盘表单。 |

## 目录结构

```
index.html            三个版本的入口页
assets/               三个版本共用的 12 张图（AI 生成示意）
v1-lens-lab/          index.html + styles.css + app.js + scenes.js
v2-mirror-night/      index.html + styles.css + app.js
v3-pictogram/         index.html + styles.css + app.js
_tools/               截图自审、联系表、生图脚本
```

`scenes.js`（只有 V1 有）放程序生成的 SVG 代码，让主 HTML 保持可读。V2 / V3 的图形代码都在 `app.js` 里。

## 内容来源与边界

页面事实**只取自参考产品页**：成立年份、年产能、ISO 9001 证书号、FDA 工厂登记号、八步流程、六种运动、七种镜片、六个月质保、表单字段。

**参考页上没有的，这里一律没有**——具体是：地址、电话、邮箱、WhatsApp 号码、客户名称、案例、销量数据。所以页面上的 WhatsApp 按钮指向 `https://wa.me/`（无号码），表单只做前端校验。这条边界就是技能里「不许编事实」的示例。

图片全部是 AI 生成的示意图，与真实产品无关。

## 自审脚本（`_tools/`）

三个脚本都实测过。先在本目录起服务，再截图：

```bash
node _tools/shots.mjs v3-pictogram 1440 900 "top" "#brief@100" "click:label[for=b-sport-ski]"
```

无头截图，顺带打印 console 报错、4xx、页面高度、屏数、H1 数量、横向溢出。动作支持 `top`、`#id@偏移`、`y=像素`、`click:选择器`、`hover:选择器`、`mouse:x,y`。

```bash
python _tools/sheet.py _tools/shots/s1.jpg _tools/shots/v3-*.png 3
```

把截图拼成联系表并缩到一半。**看画面只读这张，别逐张读原图。**

```bash
IMG_API_KEY=xxx python _tools/gen_images.py assets jobs.json
```

生图（OpenAI 兼容接口），带重试和压缩。密钥只从环境变量读。

依赖：Node + `npm i puppeteer-core`（在 `_tools/` 里）、Python + Pillow、本机 Chrome 或 Edge。

## 已验证 / 未验证

已验证：三个版本的电脑端（1440×900）和手机端（390×844）都逐个看过主要区块；手机端无横向滚动（`scrollWidth === innerWidth`）；页面无 console 报错、无 4xx；每页一个 H1。

未验证：

- 表单只做前端校验和成功提示，**没有接后端**（代码里留了 `TODO`）。
- Safari 与真机手机上的流畅度。
- V2 的 WebGL 镜片在没有 GPU 加速的环境下会退回彩色渐变；「关掉 WebGL」这条兜底路径没有单独测过。
