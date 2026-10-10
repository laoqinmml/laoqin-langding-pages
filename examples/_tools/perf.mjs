// usage: node perf.mjs <dist-dir> ["标签"]
// 自带静态服务 + 手机视口 + Fast 3G + 4x CPU 降速，输出各类型传输体积、LCP/CLS/TTFB 与脚本清单。
// 只读：不改动任何文件。
import puppeteer from "puppeteer-core";
import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";

const dir = process.argv[2];
if (!dir) {
  console.error("用法: node perf.mjs <dist-dir> [标签]");
  process.exit(1);
}
const label = process.argv[3] || dir;
const port = 5399;
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml",
};

// 本地静态服务：不依赖 python / wrangler，也不做压缩，
// 所以下面是「未压缩」体积，真实 CDN 会 gzip/brotli，大约三折。
const server = http.createServer(async (req, res) => {
  const urlPath = decodeURIComponent(new URL(req.url, "http://x").pathname);
  const candidates = [path.join(dir, urlPath), path.join(dir, urlPath, "index.html"), path.join(dir, "index.html")];
  for (const candidate of candidates) {
    try {
      const body = await readFile(candidate);
      res.writeHead(200, { "content-type": TYPES[path.extname(candidate)] || "application/octet-stream" });
      res.end(body);
      return;
    } catch {
      // try next
    }
  }
  res.writeHead(404);
  res.end("not found");
});
await new Promise((resolve) => server.listen(port, "127.0.0.1", resolve));

const browser = await puppeteer.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: "new",
  args: ["--hide-scrollbars"],
});
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
const client = await page.createCDPSession();
await client.send("Network.enable");
await client.send("Emulation.setCPUThrottlingRate", { rate: 4 });
await client.send("Network.emulateNetworkConditions", {
  offline: false,
  latency: 150,
  downloadThroughput: (1.6 * 1024 * 1024) / 8, // Fast 3G
  uploadThroughput: (750 * 1024) / 8,
});

const meta = new Map();
const sizes = [];
client.on("Network.responseReceived", (e) => meta.set(e.requestId, { type: e.type, url: e.response.url }));
client.on("Network.loadingFinished", (e) => {
  const info = meta.get(e.requestId);
  sizes.push({ type: info ? info.type : "Other", url: info ? info.url : "", bytes: e.encodedDataLength });
});

await page.evaluateOnNewDocument(() => {
  window.__cls = 0;
  window.__lcp = 0;
  new PerformanceObserver((l) => {
    for (const entry of l.getEntries()) {
      if (!entry.hadRecentInput) window.__cls += entry.value;
    }
  }).observe({ type: "layout-shift", buffered: true });
  new PerformanceObserver((l) => {
    const entries = l.getEntries();
    window.__lcp = entries[entries.length - 1].startTime;
  }).observe({ type: "largest-contentful-paint", buffered: true });
});

await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "load", timeout: 120000 });
await new Promise((r) => setTimeout(r, 2500));

const metrics = await page.evaluate(() => {
  const nav = performance.getEntriesByType("navigation")[0];
  const fcp = performance.getEntriesByName("first-contentful-paint")[0];
  return {
    ttfb: Math.round(nav.responseStart),
    fcp: fcp ? Math.round(fcp.startTime) : null,
    domContentLoaded: Math.round(nav.domContentLoadedEventEnd),
    load: Math.round(nav.loadEventEnd),
    lcp: Math.round(window.__lcp || 0),
    cls: Number((window.__cls || 0).toFixed(4)),
  };
});

const byType = {};
let total = 0;
for (const s of sizes) {
  byType[s.type] = byType[s.type] || { count: 0, bytes: 0 };
  byType[s.type].count += 1;
  byType[s.type].bytes += s.bytes;
  total += s.bytes;
}
const kb = (n) => Math.round(n / 1024);

console.log(
  JSON.stringify(
    {
      label,
      metrics,
      bytes: Object.fromEntries(Object.entries(byType).map(([k, v]) => [k, { count: v.count, kb: kb(v.bytes) }])),
      totalKb: kb(total),
      scripts: sizes.filter((s) => s.type === "Script").map((s) => `${kb(s.bytes)}KB ${s.url.split("/").pop()}`),
      note: "本地服务未压缩，真实 CDN 会 gzip/brotli（约三折）",
    },
    null,
    2,
  ),
);

await browser.close();
server.close();
