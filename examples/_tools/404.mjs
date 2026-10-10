import puppeteer from "puppeteer-core";
const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: "new" });
for (const v of ["v1-lens-lab","v2-mirror-night","v3-pictogram"]) {
  const p = await b.newPage();
  p.on("response", r => { if (r.status() >= 400) console.log(v, r.status(), r.url()); });
  await p.goto(`http://localhost:5173/${v}/`, { waitUntil: "networkidle0" });
  await p.close();
}
await b.close();
