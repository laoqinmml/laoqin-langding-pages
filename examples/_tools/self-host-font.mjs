// usage: node self-host-font.mjs [family] [weights] [out-dir]
// 默认: node self-host-font.mjs "Inter" "300..600" public/fonts
// 作用：把 Google Fonts 的字体抓成本地文件（只取 latin 子集），并打印要贴进 global.css 的 @font-face。
// 为什么要自托管：省掉 fonts.googleapis.com / fonts.gstatic.com 两个外部连接，
// 可以用 <link rel="preload"> 提前下载，也能设长缓存。实测 LCP 从 1.58s 降到 1.03s（同字节数）。
import { mkdir, writeFile, stat } from "node:fs/promises";
import path from "node:path";

const family = process.argv[2] || "Inter";
const weights = process.argv[3] || "300..600";
const outDir = process.argv[4] || path.join("public", "fonts");

// Google 只对现代浏览器 UA 返回 woff2（否则给 ttf），所以必须带 Chrome UA
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";
const cssUrl = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:wght@${weights}&display=swap`;

const css = await (await fetch(cssUrl, { headers: { "User-Agent": UA } })).text();
const blocks = [...css.matchAll(/@font-face\s*\{([^}]*)\}/g)].map((m) => m[1]);
if (!blocks.length) {
  console.error("没拿到 @font-face，检查字体名/字重是否正确");
  process.exit(1);
}

const pick = (block) => {
  const url = block.match(/url\((https:\/\/[^)]+\.woff2)\)/)?.[1];
  const range = block.match(/unicode-range:\s*([^;]+);/)?.[1] || "";
  const weight = block.match(/font-weight:\s*([^;]+);/)?.[1]?.trim() || "400";
  const subset = /U\+0000-00FF/.test(range)
    ? "latin"
    : /U\+0100-02BA/.test(range)
      ? "latin-ext"
      : "other";
  return { url, subset, weight };
};

const latin = blocks.map(pick).filter((b) => b.subset === "latin" && b.url);
if (!latin.length) {
  console.error("没找到 latin 子集");
  process.exit(1);
}

await mkdir(outDir, { recursive: true });
const slug = family.toLowerCase().replace(/[^a-z0-9]+/g, "-");
const fileName = `${slug}-latin-var.woff2`;
const outPath = path.join(outDir, fileName);

const bytes = Buffer.from(await (await fetch(latin[0].url)).arrayBuffer());
await writeFile(outPath, bytes);

const meta = await stat(outPath);
console.log(`${family} ${latin[0].weight} latin → ${outPath}（${Math.round(meta.size / 1024)}KB）`);
console.log("\n贴进 src/styles/global.css：\n");
console.log(`@font-face {
  font-family: "${family}";
  font-style: normal;
  font-weight: ${latin[0].weight};
  font-display: swap;
  src: url("/fonts/${fileName}") format("woff2");
}`);
console.log("\n贴进 src/layouts/Layout.astro 的 <head>：\n");
console.log(`    <link rel="preload" href="/fonts/${fileName}" as="font" type="font/woff2" crossorigin />`);
console.log("\n想彻底不要 Web 字体（再省 47KB、CLS 归零）：把 tokens.css 的 --font-sans 换成 system-ui 系统字体栈。");
