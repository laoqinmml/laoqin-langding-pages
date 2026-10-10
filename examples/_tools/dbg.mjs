import puppeteer from "puppeteer-core";
const [url, expr] = process.argv.slice(2);
const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: "new" });
const p = await b.newPage(); await p.setViewport({ width: +(process.env.W||1440), height: 900 });
p.on("pageerror", e => console.log("page error:", e.message));
await p.goto(url, { waitUntil: "networkidle0" });
console.log(JSON.stringify(await p.evaluate(expr), null, 1));
await b.close();
