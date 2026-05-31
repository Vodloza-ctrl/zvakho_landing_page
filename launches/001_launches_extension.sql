-- ═══════════════════════════════════════════════════════════════════════════
-- ZVAKHO LAUNCHES EXTENSION — Migration 001
-- Run against: STORE_DB (D1)
-- Safe to run multiple times — all statements use IF NOT EXISTS / IF EXISTS
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────
-- 1. EXTEND campaigns TABLE
--    Add columns the launch page needs that don't exist yet.
--    All are nullable so existing rows are unaffected.
-- ─────────────────────────────────────────────────────────────────────────

-- Countdown / timing
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS launch_date       TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS countdown_enabled INTEGER DEFAULT 1;

-- Preorder config
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS preorder_enabled  INTEGER DEFAULT 0;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS preorder_limit    INTEGER;           -- NULL = unlimited
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS preorder_price    REAL;              -- NULL = use product price

-- Fan capture prompts shown on launch page
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS email_capture     INTEGER DEFAULT 1;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS whatsapp_capture  INTEGER DEFAULT 1;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS capture_headline  TEXT;              -- e.g. "Be first to know"
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS capture_subtext   TEXT;

-- Branding overrides (falls back to artist theme if NULL)
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS hero_video_url    TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS bg_color          TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS accent_color      TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS logo_override_url TEXT;

-- Social proof
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS supporter_count_visible INTEGER DEFAULT 1;

-- ─────────────────────────────────────────────────────────────────────────
-- 2. EXTEND campaign_supporters TABLE
--    Add email column (WhatsApp phone already exists).
--    Add capture_source so we know how the fan came in.
-- ─────────────────────────────────────────────────────────────────────────

ALTER TABLE campaign_supporters ADD COLUMN IF NOT EXISTS email          TEXT;
ALTER TABLE campaign_supporters ADD COLUMN IF NOT EXISTS capture_source TEXT DEFAULT 'launch_page';
-- capture_source values: launch_page | whatsapp | preorder | store

-- ─────────────────────────────────────────────────────────────────────────
-- 3. EXTEND products TABLE
--    Link products to a specific launch slot (position on launch page).
--    preorder_count tracks live demand without a JOIN.
-- ─────────────────────────────────────────────────────────────────────────

ALTER TABLE products ADD COLUMN IF NOT EXISTS launch_slot      INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS preorder_count   INTEGER DEFAULT 0;

-- ─────────────────────────────────────────────────────────────────────────
-- 4. NEW: launch_preorders TABLE
--    Ties a preorder to an existing order in the orders table.
--    This is the bridge between fan capture and fulfilment.
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS launch_preorders (
  preorder_id   TEXT PRIMARY KEY,
  campaign_id   TEXT NOT NULL,
  artist_id     TEXT NOT NULL,
  order_id      TEXT,           -- FK to orders.order_id (NULL until payment completes)
  product_id    TEXT NOT NULL,
  variant_id    TEXT,           -- FK to product_variants.variant_id
  supporter_id  TEXT,           -- FK to campaign_supporters.supporter_id
  phone         TEXT NOT NULL,
  email         TEXT,
  customer_name TEXT,
  quantity      INTEGER DEFAULT 1,
  unit_price    REAL    NOT NULL,
  total_amount  REAL    NOT NULL,
  currency      TEXT    DEFAULT 'USD',
  status        TEXT    DEFAULT 'pending',
  -- status values: pending | paid | cancelled | refunded | fulfilled
  payment_ref   TEXT,           -- reference from payment worker
  notes         TEXT,
  created_at    TEXT    DEFAULT (datetime('now')),
  updated_at    TEXT    DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_lp_campaign  ON launch_preorders(campaign_id, status);
CREATE INDEX IF NOT EXISTS idx_lp_phone     ON launch_preorders(phone);
CREATE INDEX IF NOT EXISTS idx_lp_order     ON launch_preorders(order_id);
CREATE INDEX IF NOT EXISTS idx_lp_supporter ON launch_preorders(supporter_id);

-- ─────────────────────────────────────────────────────────────────────────
-- 5. INDEXES on existing tables (safe to add, ignored if already present)
-- ─────────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_campaigns_slug    ON campaigns(slug);
CREATE INDEX IF NOT EXISTS idx_campaigns_status  ON campaigns(status, launch_date);
CREATE INDEX IF NOT EXISTS idx_cs_campaign_phone ON campaign_supporters(campaign_id, phone);
CREATE INDEX IF NOT EXISTS idx_cs_email          ON campaign_supporters(email);

-- ─────────────────────────────────────────────────────────────────────────
-- 6. VERIFICATION QUERY — run this after migration to confirm
-- ─────────────────────────────────────────────────────────────────────────

-- SELECT
--   (SELECT COUNT(*) FROM campaigns)          AS campaigns,
--   (SELECT COUNT(*) FROM campaign_supporters) AS supporters,
--   (SELECT COUNT(*) FROM launch_preorders)    AS preorders,
--   (SELECT COUNT(*) FROM launch_events)       AS events;
