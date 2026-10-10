// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// 换成客户真实域名：canonical、sitemap、og:url 都靠它。
const SITE = "https://example.com";

export default defineConfig({
  site: SITE,
  output: "static",
  integrations: [sitemap()],
  build: {
    inlineStylesheets: "auto",
  },
});
