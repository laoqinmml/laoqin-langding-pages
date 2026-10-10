# AI 友好访问 / WebMCP 模板

AI Agent 生成网站时必须补充以下文件和检查项。

## 必须生成的公开文件

```text
public/llms.txt
public/webmcp.json
```

## llms.txt 要求

`llms.txt` 必须是 Markdown 文本，并至少包含一个 H1 标题。

建议结构：

```markdown
# Brand Name

## Site Purpose
说明网站用途、目标用户、业务范围。

## AI Access Policy
说明 AI 代理是否可以浏览、摘要、引用公开内容。

## Important URLs
- Home: /
- Sitemap: /sitemap.xml
- Robots: /robots.txt
- WebMCP schema: /webmcp.json

## Contact
填写网站联系信息。
```

## WebMCP 表单注释

重要表单需要有可访问标签和 WebMCP 注释：

```html
<form id="contact-form" data-webmcp-form="lead-capture" aria-label="Contact sales form">
  <label for="email">Email</label>
  <input id="email" name="email" type="email" autocomplete="email" required />
  <button type="submit">Submit inquiry</button>
</form>
```

## webmcp.json 最小结构

```json
{
  "name": "brand-webmcp",
  "version": "1.0.0",
  "description": "AI-agent-readable schema for important website forms and tools.",
  "forms": [],
  "tools": []
}
```

## AI 访问检查项

- 可访问性树结构良好：使用 header/nav/main/section/article/footer。
- 表单字段有 label、aria-label 或可识别名称。
- 按钮和链接文字可理解，避免“点击这里”。
- 图片有 alt，重要图片预留 width/height 或 CSS 尺寸，减少 CLS。
- 动态内容不要插入到页面顶部导致布局跳动。
- `llms.txt` 可访问且 Markdown 结构正确。
- `webmcp.json` 是有效 JSON，表单和工具 schema 清晰。
