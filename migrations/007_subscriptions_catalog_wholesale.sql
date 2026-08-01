-- ============================================================
-- ZVAKHO Migration 007 — Subscriptions, Commission Catalog, Wholesale
-- Run each block separately in the D1 console, in order.
-- ============================================================


-- BLOCK 1 — Real subscription billing (separate from the brands.subscription_plan
-- cosmetic flag, which stays as the fast-read cache used by getBrandSubscription()).
-- billing_exempt=1 skips the lazy-expiry downgrade (use for founder/demo accounts).
CREATE TABLE IF NOT EXISTS brand_subscriptions (
  brand_id TEXT PRIMARY KEY REFERENCES brands(brand_id),
  plan TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active',
  billing_cycle TEXT DEFAULT 'monthly',
  amount REAL,
  current_period_end TEXT,
  poll_url TEXT,
  browser_url TEXT,
  payment_reference TEXT,
  billing_exempt INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_brand_subscriptions_reference ON brand_subscriptions(payment_reference);


-- BLOCK 2 — Product catalog: ZVAKHO's producible blanks. base_cost already
-- includes blank + print + packaging + fulfilment labour + your manufacturing
-- margin. This is the real cost sheet — populate real values via
-- POST /admin/catalog/create before relying on the commission math.
CREATE TABLE IF NOT EXISTS product_catalog (
  catalog_id TEXT PRIMARY KEY,
  product_type TEXT NOT NULL,
  name TEXT NOT NULL,
  base_cost REAL NOT NULL,
  currency TEXT DEFAULT 'USD',
  print_method TEXT DEFAULT 'dtf' CHECK(print_method IN ('dtf','vinyl')),
  active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS catalog_variants (
  variant_id TEXT PRIMARY KEY,
  catalog_id TEXT NOT NULL REFERENCES product_catalog(catalog_id),
  color_name TEXT,
  color_hex TEXT,
  size_code TEXT,
  size_label TEXT,
  cost_adjustment REAL DEFAULT 0,
  active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_catalog_variants_catalog_id ON catalog_variants(catalog_id);


-- BLOCK 3 — Link an owner's product to a catalog blank and snapshot the
-- base_cost onto the product itself (so a later catalog cost change never
-- retroactively changes a product's already-quoted commission math until
-- the owner explicitly re-saves).
ALTER TABLE products ADD COLUMN catalog_id TEXT REFERENCES product_catalog(catalog_id);
ALTER TABLE products ADD COLUMN base_cost REAL DEFAULT 0;


-- BLOCK 4 — Snapshot commission per order line at the moment of sale.
-- Never recompute retroactively from live catalog/product prices.
ALTER TABLE order_items ADD COLUMN base_cost REAL DEFAULT 0;
ALTER TABLE order_items ADD COLUMN owner_commission REAL DEFAULT 0;


-- BLOCK 5 — Wholesale manufacturing inquiries (manual quote queue, same
-- pattern as the existing domain_wishes-style workflow — no automated
-- bulk-pricing engine yet, so a human quotes each one).
CREATE TABLE IF NOT EXISTS wholesale_inquiries (
  inquiry_id TEXT PRIMARY KEY,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  items_requested TEXT NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'new' CHECK(status IN ('new','quoted','confirmed','fulfilled','cancelled')),
  quoted_amount REAL,
  admin_notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_wholesale_inquiries_status ON wholesale_inquiries(status);


-- BLOCK 6 — Normalize existing brands off the retired 'launch'/'enterprise'
-- tiers onto the new Free/Grow/Pro set. Nothing here changes billing —
-- it just keeps brands.subscription_plan valid against the new
-- SUBSCRIPTION_PLANS object in the worker.
UPDATE brands
SET subscription_plan = 'free', updated_at = datetime('now')
WHERE subscription_plan IS NULL OR subscription_plan NOT IN ('free', 'grow', 'pro');


-- BLOCK 7 — Seed brand_subscriptions rows for every existing brand so
-- getBrandSubscription() has a row to read immediately (defaults to
-- exempt for founder accounts — is_founder brands were never meant to
-- be billed off their current plan).
INSERT OR IGNORE INTO brand_subscriptions (brand_id, plan, status, billing_exempt, created_at, updated_at)
SELECT brand_id, subscription_plan, 'active', CASE WHEN is_founder = 1 THEN 1 ELSE 0 END, datetime('now'), datetime('now')
FROM brands;


-- BLOCK 8 — Verify (read-only, run last)
SELECT
  (SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='brand_subscriptions') as brand_subscriptions_exists,
  (SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='product_catalog') as product_catalog_exists,
  (SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='catalog_variants') as catalog_variants_exists,
  (SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='wholesale_inquiries') as wholesale_inquiries_exists,
  (SELECT COUNT(*) FROM pragma_table_info('products') WHERE name='catalog_id') as products_catalog_id,
  (SELECT COUNT(*) FROM pragma_table_info('products') WHERE name='base_cost') as products_base_cost,
  (SELECT COUNT(*) FROM pragma_table_info('order_items') WHERE name='owner_commission') as order_items_commission,
  (SELECT COUNT(*) FROM brand_subscriptions) as brand_subscriptions_rows;
