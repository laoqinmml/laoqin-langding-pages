import type { APIRoute } from "astro";
import { config } from "../config";
import { content } from "../content";

/** 静态构建时生成 dist/llms.txt */
export const prerender = true;

export const GET: APIRoute = () => {
  const base = config.domain.replace(/\/+$/, "");

  const body = [
    `# ${config.brand.name}`,
    "",
    `> ${config.brand.tagline}`,
    "",
    "## Site purpose",
    content.seo.description,
    "",
    "## AI usage policy",
    "Public pages may be read, summarised and quoted with a link back to this site. Contact details are for genuine business enquiries only.",
    "",
    "## Important URLs",
    `- Home: ${base}/`,
    `- Sitemap: ${base}/sitemap-index.xml`,
    `- Robots: ${base}/robots.txt`,
    `- WebMCP schema: ${base}/webmcp.json`,
    "",
    "## Contact",
    `- Email: ${config.contact.email}`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
};
