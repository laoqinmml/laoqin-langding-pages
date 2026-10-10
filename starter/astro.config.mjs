// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { config } from "./src/config.ts";

// 域名只在 src/config.ts 定义一处：canonical、sitemap、og:url 都用它。
const SITE = config.domain;

export default defineConfig({
  site: SITE,
  output: "static",
  integrations: [sitemap()],
  build: {
    inlineStylesheets: "auto",
  },
});
