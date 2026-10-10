import type { APIRoute } from "astro";
import { config } from "../config";

/** 静态构建时生成 dist/robots.txt，跟随 config.ts 里的 noindex 开关 */
export const prerender = true;

export const GET: APIRoute = () => {
  const base = config.domain.replace(/\/+$/, "");

  const lines = config.features.noindex
    ? ["# Preview lock: remove by setting features.noindex = false", "User-agent: *", "Disallow: /", ""]
    : [
        "User-agent: *",
        "Allow: /",
        "Disallow: /thank-you/",
        "",
        `Sitemap: ${base}/sitemap-index.xml`,
        "",
      ];

  return new Response(lines.join("\n"), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
};
