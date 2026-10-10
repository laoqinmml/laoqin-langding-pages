// usage: node optimize-images.mjs <src-dir> <out-dir> <jobs.json>
// 把客户给的原图压成交付图：按最大宽度缩放 + WebP；标了 avif 的额外出一份 AVIF（首屏图用）。
// 在项目根目录执行（sharp 由 Astro 自带，从当前项目解析）。
//
// jobs.json:
// {
//   "hero":          { "file": "raw/hero.jpg",          "width": 1200, "quality": 78, "avif": true },
//   "sport-cycling": { "file": "raw/cycling.jpg",       "width": 900,  "quality": 78 },
//   "cert-iso9001":  { "file": "raw/cert-iso.png",      "width": 900,  "quality": 80 }
// }
import { createRequire } from "node:module";
import { copyFile, mkdir, stat } from "node:fs/promises";
import { readFileSync } from "node:fs";
import path from "node:path";

const require = createRequire(path.join(process.cwd(), "package.json"));
const sharp = require("sharp");

const [srcDir, outDir, jobsFile] = process.argv.slice(2);
if (!srcDir || !outDir || !jobsFile) {
  console.error("用法: node optimize-images.mjs <src-dir> <out-dir> <jobs.json>");
  process.exit(1);
}

const jobs = JSON.parse(readFileSync(jobsFile, "utf8"));
const kb = (n) => Math.round(n / 1024);
await mkdir(outDir, { recursive: true });

let before = 0;
let after = 0;

for (const [name, spec] of Object.entries(jobs)) {
  const srcPath = path.join(srcDir, spec.file);
  const outPath = path.join(outDir, `${name}.webp`);
  const srcSize = (await stat(srcPath)).size;
  const meta = await sharp(srcPath).metadata();
  const width = spec.width || 1200;

  await sharp(srcPath)
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: spec.quality || 78, effort: 5 })
    .toFile(outPath);

  let outSize = (await stat(outPath)).size;
  // 原图已经压得很好时，重编码反而更大 —— 那就直接用原图（前提是本来就是 webp）
  if (outSize >= srcSize && path.extname(spec.file).toLowerCase() === ".webp") {
    await copyFile(srcPath, outPath);
    outSize = srcSize;
  }

  before += srcSize;
  after += outSize;
  console.log(`${name.padEnd(16)} ${meta.width}x${meta.height} → ${kb(srcSize)}KB → ${kb(outSize)}KB`);

  if (spec.avif) {
    const avifPath = path.join(outDir, `${name}.avif`);
    await sharp(srcPath)
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .avif({ quality: 55, effort: 6 })
      .toFile(avifPath);
    console.log(`  └─ ${name}.avif ${kb((await stat(avifPath)).size)}KB（首屏用 <picture> 引入）`);
  }
}

console.log(`\n合计 ${kb(before)}KB → ${kb(after)}KB（省 ${Math.round((1 - after / before) * 100)}%）`);
