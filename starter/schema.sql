-- 询盘表：D1 建库后执行
-- npx wrangler d1 execute <db> --remote --file=./schema.sql -y
CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  submission_key TEXT UNIQUE,
  name TEXT,
  email TEXT,
  company TEXT,
  country TEXT,
  message TEXT,
  page_url TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  gclid TEXT,
  fbclid TEXT,
  mail_status TEXT,
  mail_error TEXT
);

CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads (email);
