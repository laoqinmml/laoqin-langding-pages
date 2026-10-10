/**
 * 全站文案集中在这里：改文案只改这个文件，不要进组件里找。
 * 规矩：只写客户给过的事实。拿不准的数字、客户名、认证编号一律不要写进来。
 *
 * 图片两阶段走：
 *   1. 草稿阶段一律用 placehold.co 占位（尺寸按下面表格选），让页面先有完整观感；
 *      语法：https://placehold.co/<宽>x<高>/<底色>/<字色>/<格式>?text=文字
 *      例：https://placehold.co/1200x900/e6efe9/1f5f4a/png?text=Factory+photo
 *      尺寸上限 4000x4000，最小 10x10；尺寸后加 @2x 出二倍图（png/jpeg/webp/avif）。
 *   2. 客户确认后换成真实图片，放进 public/images/ 并把这里改成 "/images/xxx.jpg"；
 *      需要 AI 出图时走生图脚本（见技能里的 references/images.md）。
 *
 * 常用占位尺寸：
 *   首屏主图  1600x1200（4:3）或 1600x1067（3:2）
 *   产品卡图  800x600（4:3）
 *   场景卡图  600x400（3:2）
 *   社交分享  1200x630（1.91:1，og:image）
 */
export const content = {
  /** 面向欧美用 "en"，中文站用 "zh-CN" */
  lang: "en",

  seo: {
    title: "Example Industrial — Custom Parts Manufacturing for Global Brands",
    description:
      "OEM and ODM manufacturing of precision parts for global brands: prototyping, tooling, mass production and quality inspection under one roof.",
  },

  nav: [
    { label: "Capabilities", href: "#capabilities" },
    { label: "Products", href: "#products" },
    { label: "Applications", href: "#applications" },
    { label: "Process", href: "#process" },
    { label: "FAQ", href: "#faq" },
  ],
  navCta: { label: "Get a quote", href: "#contact" },

  hero: {
    eyebrow: "OEM / ODM manufacturer",
    title: "Precision parts, made to your drawing",
    lead:
      "From prototype to mass production: tooling, machining, surface treatment and inspection in one factory. Send a drawing, get a quotation with lead time in 2 working days.",
    primaryCta: { label: "Get a quote", href: "#contact" },
    secondaryCta: { label: "Download catalog", href: "#contact" },
    imageAlt: "Production line in the factory",
    /** 草稿用占位图；确认后换成 /images/hero.jpg 这类本站路径 */
    image: "https://placehold.co/1600x1200/e6efe9/1f5f4a/png?text=Factory+%2F+product+photo" as string,
  },

  /** 信任条：只放能核实的数字，没有就把数组清空，整块会自动隐藏 */
  trust: [
    { value: "Founded 2008", label: "17 years in manufacturing" },
    { value: "ISO 9001", label: "Certified quality system" },
    { value: "1.2M pcs / year", label: "Annual capacity" },
    { value: "40+ countries", label: "Shipped worldwide" },
  ],

  benefits: {
    eyebrow: "Why us",
    title: "What you get besides parts",
    items: [
      {
        title: "Drawing to production in one place",
        body:
          "Tooling, machining, treatment and inspection stay in-house, so nobody blames the other supplier when something slips.",
        fact: "Average quoting time: 2 working days",
      },
      {
        title: "Quality you can audit",
        body:
          "Every batch keeps inspection records. Full material certificates are available on request.",
        fact: "ISO 9001 quality system, inspection report per batch",
      },
      {
        title: "Small runs are welcome",
        body:
          "Prototype and pilot orders run on the same line as mass production, so the sample you approve is what you get.",
        fact: "MOQ from 100 pcs for most parts",
      },
      {
        title: "One English-speaking contact",
        body:
          "You talk to the same engineer from quotation to shipment, by email or on the phone.",
        fact: "Replies within one business day",
      },
    ],
  },

  products: {
    eyebrow: "Products",
    title: "What we make",
    items: [
      {
        name: "Precision machined parts",
        image: "https://placehold.co/800x600/d8ded9/3c4a45/jpeg?text=CNC+parts",
        use: "CNC turning and milling for metal and engineering plastics",
        spec: "Tolerance from ±0.01 mm",
      },
      {
        name: "Sheet metal assemblies",
        image: "https://placehold.co/800x600/d8ded9/3c4a45/jpeg?text=Sheet+metal",
        use: "Laser cutting, bending, welding and powder coating",
        spec: "Up to 3000 × 1500 mm sheet",
      },
      {
        name: "Tooling and fixtures",
        image: "https://placehold.co/800x600/d8ded9/3c4a45/jpeg?text=Tooling",
        use: "In-house mould and jig making for your product",
        spec: "Design to first sample: 3–5 weeks",
      },
      {
        name: "Sub-assembly service",
        image: "https://placehold.co/800x600/d8ded9/3c4a45/jpeg?text=Assembly",
        use: "We assemble and pack under your brand",
        spec: "Custom packaging and labeling",
      },
    ],
  },

  applications: {
    eyebrow: "Applications",
    title: "Where our parts end up",
    items: [
      { name: "Automation equipment", detail: "Frames, brackets, guide parts" },
      { name: "New energy", detail: "Busbar, housings, cooling plates" },
      { name: "Medical devices", detail: "Non-standard enclosures and jigs" },
      { name: "Robotics", detail: "Joint parts and mounting plates" },
      { name: "Packaging machinery", detail: "Wear parts and change parts" },
      { name: "Tools and hardware", detail: "Small runs under your brand" },
    ],
  },

  capabilities: {
    eyebrow: "Capabilities",
    title: "Equipment and capacity",
    items: [
      { label: "CNC machining centers", value: "28" },
      { label: "Turning centers", value: "16" },
      { label: "Laser cutting", value: "4" },
      { label: "Inspection equipment", value: "CMM, projectors, hardness testers" },
    ],
    note:
      "Inspections run on incoming material, first article, in-process and final shipment.",
  },

  process: {
    eyebrow: "How we work",
    title: "OEM, ODM, or white label",
    modes: [
      {
        name: "OEM",
        body: "You supply drawings and specifications, we make exactly to them.",
      },
      {
        name: "ODM",
        body: "You describe the function and the market, our engineers design and propose samples.",
      },
      {
        name: "White label",
        body: "We produce, inspect and pack under your brand, ready for your warehouse.",
      },
    ],
    steps: [
      { step: "1", title: "Send inquiry", body: "Drawing, sample photos or written specification." },
      { step: "2", title: "Quotation", body: "Price, lead time and tooling cost in 2 working days." },
      { step: "3", title: "Sample", body: "Sample produced and shipped for your approval." },
      { step: "4", title: "Production", body: "Batch production with inspection records." },
      { step: "5", title: "Shipping", body: "Export packing, documents and tracking." },
    ],
  },

  /** 资质：只写有证书可查的 */
  certifications: {
    eyebrow: "Certifications",
    title: "Documents available on request",
    items: [
      "ISO 9001 quality system",
      "Material certificates (mill certs)",
      "Inspection reports per batch",
    ],
  },

  faq: {
    eyebrow: "FAQ",
    title: "Questions buyers ask daily",
    items: [
      {
        q: "What is your minimum order quantity?",
        a: "For most parts the small-run minimum is 100 pieces. Prototypes are accepted below that.",
      },
      {
        q: "How long does a sample take?",
        a: "10–15 working days after drawings and payment are confirmed. Tooling projects take 3–5 weeks.",
      },
      {
        q: "How do you handle quality problems?",
        a: "Send photos of the issue with the batch number. We check the inspection record, then replace or credit in the next shipment.",
      },
      {
        q: "Which payment terms do you accept?",
        a: "T/T 30% deposit, balance before shipment. Other terms can be discussed for repeat orders.",
      },
    ],
  },

  form: {
    ariaLabel: "Request a quotation",
    title: "Tell us what you need",
    body:
      "Send a drawing, a sample photo or a written specification. You get price, lead time and tooling cost in 2 working days.",
    fields: {
      name: "Your name",
      email: "Work email",
      company: "Company (optional)",
      country: "Country (optional)",
      sport: "Custom goggles for",
      message: "What do you need?",
    },
    /** 下拉选项：按客户产品改；参考页有下拉就照抄它的选项 */
    sportOptions: [
      "Cycling",
      "Running",
      "Skiing",
      "Outdoor & Mountain",
      "Water Sports & Fishing",
      "Ball, Contact & Precision Sports",
      "Others",
    ],
    attachment: "Reference image (optional)",
    attachmentHint: "JPG, PNG, WebP or PDF · up to 5 MB",
    messagePlaceholder:
      "Part name, material, quantity, target price, drawing or specification…",
    submit: "Send enquiry",
    sending: "Sending…",
    success: "Thanks. We will reply within one business day.",
    error: "Sending failed. Please try again, or email us directly.",
    tooLarge: "The reference image must be under 5 MB.",
  },

  footer: {
    note:
      "Example Industrial — precision parts manufacturing. Replace this text with your company description.",
    copyright: `© ${new Date().getFullYear()} Example Industrial. All rights reserved.`,
  },

  thanks: {
    title: "Enquiry received",
    body:
      "We will reply within one business day. If it is urgent, email us directly.",
    backLabel: "Back to home",
  },
} as const;
