/**
 * 全站唯一配置点：品牌名、联系方式、开关。
 * 组件只从这里取值，不要在组件里写死邮箱、电话、域名。
 */
export interface SocialLink {
  label: string;
  url: string;
}

export interface SiteConfig {
  /** 站点域名（部署后改这里，同时改 astro.config.mjs 里的 SITE） */
  domain: string;
  brand: {
    name: string;
    /** 没有 Logo 时用文字 Logo */
    logoText: string;
    tagline: string;
  };
  /** 联系方式：不确定的先留空，页面上会自动隐藏对应按钮 */
  contact: {
    email: string;
    /** 例：+8613800000000（只写数字和国家码，不带空格） */
    whatsapp: string;
    phone: string;
    address: string;
    socials: SocialLink[];
  };
  form: {
    endpoint: string;
    /** 提交成功后跳转的页面 */
    thanksPath: string;
    privacyNote: string;
  };
  /** 功能开关：没有对应资源时保持 false，页面相关部分会自动隐藏 */
  features: {
    /** 预售期锁索引：页面 meta + robots.txt + _headers 三层一起生效 */
    noindex: boolean;
    /** 用 Cloudflare Turnstile 时置 true，并配置 PUBLIC_TURNSTILE_SITE_KEY 与 TURNSTILE_SECRET_KEY */
    turnstile: boolean;
    /** 询盘写入 Cloudflare D1（需要 wrangler.jsonc 里的 DB 绑定） */
    d1: boolean;
    /** 询盘邮件通知（需要 RESEND_API_KEY 与 NOTIFY_EMAIL） */
    emailNotification: boolean;
  };
}

export const config: SiteConfig = {
  domain: "https://example.com",

  brand: {
    name: "Example Industrial",
    logoText: "Example Industrial",
    tagline: "Custom parts manufacturing for global brands",
  },

  contact: {
    email: "sales@example.com",
    whatsapp: "",
    phone: "",
    address: "",
    socials: [
      // { label: "LinkedIn", url: "https://www.linkedin.com/company/xxx" },
    ],
  },

  form: {
    endpoint: "/api/contact",
    thanksPath: "/thank-you/",
    privacyNote:
      "We use your details only to reply to this enquiry. No newsletters, no resale.",
  },

  features: {
    noindex: true,
    turnstile: false,
    d1: false,
    emailNotification: false,
  },
};
