// usage: node shots.mjs <version-dir> <width> <height> [selector ...]
// Scrolls to each selector (or 'top') and saves a viewport screenshot; logs console errors.
import puppeteer from "puppeteer-core";

const [v, w = "1440", h = "900", ...sels] = process.argv.slice(2);
const browser = await puppeteer.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: "new",
  args: ["--hide-scrollbars", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"]
});
const page = await browser.newPage();
await page.setViewport({ width: +w, height: +h });
page.on("console", m => { if (m.type() === "error") console.log("console error:", m.text()); });
page.on("pageerror", e => console.log("page error:", e.message));
await page.goto(`http://localhost:5173/${v}/`, { waitUntil: "networkidle0" });
await page.addStyleTag({ content: "html{scroll-behavior:auto!important}" });
await new Promise(r => setTimeout(r, 800));
for (const s of (sels.length ? sels : ["top"])) {
  if (s.startsWith("click:")) { await page.click(s.slice(6)); await new Promise(r => setTimeout(r, 400)); continue; }
  if (s.startsWith("hover:")) { await page.hover(s.slice(6)); await new Promise(r => setTimeout(r, 400)); continue; }
  if (s.startsWith("mouse:")) { const [x, y] = s.slice(6).split(","); await page.mouse.move(+x, +y, { steps: 8 }); await new Promise(r => setTimeout(r, 900)); continue; }
  const [sel, off = "0"] = s.split("@");
  await page.evaluate((sel, off) => {
    if (sel === "top") return window.scrollTo(0, 0);
    if (sel.startsWith("y=")) return window.scrollTo(0, +sel.slice(2));
    const el = document.querySelector(sel);
    window.scrollTo(0, el.getBoundingClientRect().top + scrollY + (+off));
  }, sel, off);
  await new Promise(r => setTimeout(r, 900));
  const name = s.replace(/[^a-z0-9]+/gi, "_");
  await page.screenshot({ path: `shots/${v}-${name}-${w}.png` });
  console.log(`shots/${v}-${name}-${w}.png`);
}
await browser.close();
