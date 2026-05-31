# ZVAKHO Launches Extension — Complete Reference

## Overview

The Launches extension adds a universal, artist-branded launch page system to your existing ZVAKHO infrastructure. It extends — never replaces — the v8 unified worker, the orders table, and the existing fan capture flow.

---

## Folder Structure

```
zvakho-launches/
├── migrations/
│   └── 001_launches_extension.sql   ← Run once against STORE_DB
│
├── workers/
│   ├── launches-extension.js        ← New routes (import into v8 worker)
│   └── integration-patch.js         ← Exact diff to apply to v8 worker
│
├── launch/
│   └── index.html                   ← Universal launch page frontend
│
└── docs/
    └── REFERENCE.md                 ← This file
```

Deploy launch/index.html to the same static host as your other pages (e.g. Cloudflare Pages), accessible at `/launch/[slug]`.

---

## Database Changes

### Modified tables (non-breaking ALTERs)

| Table | New column | Type | Default | Purpose |
|---|---|---|---|---|
| campaigns | launch_date | TEXT | NULL | Countdown target |
| campaigns | countdown_enabled | INTEGER | 1 | Show/hide countdown |
| campaigns | preorder_enabled | INTEGER | 0 | Gate preorder button |
| campaigns | preorder_limit | INTEGER | NULL | Max preorder slots |
| campaigns | preorder_price | REAL | NULL | Override product price |
| campaigns | email_capture | INTEGER | 1 | Show email field |
| campaigns | whatsapp_capture | INTEGER | 1 | Show WhatsApp redirect |
| campaigns | capture_headline | TEXT | NULL | Form headline copy |
| campaigns | capture_subtext | TEXT | NULL | Form sub-copy |
| campaigns | hero_video_url | TEXT | NULL | Autoplay hero video |
| campaigns | bg_color | TEXT | NULL | Theme override |
| campaigns | accent_color | TEXT | NULL | Theme override |
| campaigns | logo_override_url | TEXT | NULL | Logo override |
| campaigns | supporter_count_visible | INTEGER | 1 | Social proof visibility |
| campaign_supporters | email | TEXT | NULL | Email alongside phone |
| campaign_supporters | capture_source | TEXT | 'launch_page' | How they came in |
| products | launch_slot | INTEGER | 0 | Display order on launch page |
| products | preorder_count | INTEGER | 0 | Running preorder total |

### New table

**launch_preorders** — bridges fan capture with the existing orders table.

```sql
preorder_id   TEXT PRIMARY KEY
campaign_id   TEXT NOT NULL
artist_id     TEXT NOT NULL
order_id      TEXT              -- populated after payment completes
product_id    TEXT NOT NULL
variant_id    TEXT              -- optional
supporter_id  TEXT              -- FK to campaign_supporters
phone         TEXT NOT NULL
email         TEXT
customer_name TEXT
quantity      INTEGER DEFAULT 1
unit_price    REAL NOT NULL
total_amount  REAL NOT NULL
currency      TEXT DEFAULT 'USD'
status        TEXT DEFAULT 'pending'
  -- pending | paid | cancelled | refunded | fulfilled
payment_ref   TEXT
notes         TEXT
created_at    TEXT
updated_at    TEXT
```

---

## New Routes

| Method | Path | Purpose | Cache |
|---|---|---|---|
| GET | /launch/:slug/page | Full launch page payload | 30s |
| POST | /launch/:slug/capture | Email + WhatsApp opt-in | no-store |
| POST | /launch/:slug/preorder | Fan capture + payment | no-store |
| GET | /launch/:slug/status | Live countdown + counts (poll) | 15s |
| GET | /launch/:slug/preorders | Admin: list preorders | no-store |
| POST | /launch/:slug/preorder/:id/cancel | Cancel a preorder | no-store |

**Unchanged routes used by the launch page:**
- `GET /launch/:slug` — existing, cached 60s
- `POST /launch/:slug/join` — existing phone-only capture
- `POST /web-checkout` — existing payment dispatch

---

## Migration Script

Run once against your D1 database:

```bash
wrangler d1 execute zvakho-store-db \
  --file=migrations/001_launches_extension.sql \
  --remote
```

Or via the Cloudflare dashboard → D1 → your database → Console → paste the SQL.

**All statements use `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` and `CREATE TABLE IF NOT EXISTS`, so it is safe to run multiple times.**

After migration, verify:
```sql
SELECT
  (SELECT COUNT(*) FROM campaigns)           AS campaigns,
  (SELECT COUNT(*) FROM campaign_supporters) AS supporters,
  (SELECT COUNT(*) FROM launch_preorders)    AS preorders;
```

---

## Deployment Strategy

### Phase 1 — Database (zero-downtime)
1. Run `001_launches_extension.sql` against production D1.
2. No existing queries are affected — all new columns are nullable with defaults.
3. Verify with the SELECT above.

### Phase 2 — Worker
1. Copy `launches-extension.js` into your `workers/` folder.
2. Apply the 3-line diff from `integration-patch.js` to your v8 worker.
3. Run `wrangler secret put ADMIN_TOKEN` (generate a random 32-char string).
4. Deploy: `wrangler deploy`.
5. Test the health check endpoint: `curl https://your-worker.workers.dev/`
6. Test a launch page route: `curl https://your-worker.workers.dev/launch/YOUR-SLUG/page`

### Phase 3 — Frontend
1. Copy `launch/index.html` to your static host.
2. Ensure `config.js` is available at `/config.js` on that host (it already is on your existing pages).
3. The page auto-detects the slug from the URL path `/launch/[slug]` or `?slug=[slug]`.

### Phase 4 — Create a test launch
```sql
-- Insert a test campaign (adapt as needed)
INSERT INTO campaigns (
  campaign_id, artist_id, title, slug, campaign_type,
  description, status,
  launch_date, countdown_enabled,
  preorder_enabled, preorder_limit,
  email_capture, whatsapp_capture,
  capture_headline, capture_subtext
) VALUES (
  'CAMP_TEST_001',
  'YOUR_ARTIST_ID',
  'Test Launch',
  'test-launch',
  'Launch',
  'This is a test launch page.',
  'active',
  datetime('now', '+7 days'),
  1,
  0,
  NULL,
  1,
  1,
  'Be First To Know',
  'Drop your number and we''ll hit you when it drops.'
);
```

Visit: `https://your-domain.com/launch/test-launch`

---

## Security Considerations

### What the extension does right (inherits from v8)

- `artist_name` is **always resolved from the DB** — never trusted from request body in preorder flow.
- `total_amount` is **computed server-side** from DB prices. The client cannot inflate or deflate the price.
- `artist_id` is **validated against the DB** before any payment dispatch.
- CORS is enforced via the same `ALLOWED_ORIGINS` allowlist as the rest of the worker.
- SQL uses **parameterised queries** (`prepare().bind()`) throughout — no string interpolation.

### What to harden before production

#### 1. Admin route protection
The `/launch/:slug/preorders` route is gated by `env.ADMIN_TOKEN`.  
**Set this before deploying to production:**
```bash
wrangler secret put ADMIN_TOKEN
```
Without it, the preorder list is publicly readable.

#### 2. Capture rate limiting
The `/capture` and `/preorder` POST endpoints have no rate limit. Add Cloudflare Rate Limiting rules on the Worker route:
- Rule: `POST /launch/*/capture` → 10 requests / IP / minute
- Rule: `POST /launch/*/preorder` → 5 requests / IP / minute

This is a Cloudflare dashboard setting (Security → WAF → Rate Limiting) and does not require code changes.

#### 3. Phone/email validation
The worker does minimal input sanitisation (trims, lowercases). For production, consider:
- Server-side regex for E.164 phone format before DB insert
- Email regex or a lightweight validator
- Max length guards (255 chars) to prevent oversized inserts

#### 4. Preorder idempotency
Currently a fan can submit multiple preorders for the same product. If you want one-per-fan:
```sql
-- Add a unique constraint:
CREATE UNIQUE INDEX IF NOT EXISTS idx_lp_fan_product
  ON launch_preorders(campaign_id, product_id, phone)
  WHERE status NOT IN ('cancelled','refunded');
```

Then handle the UNIQUE constraint violation (SQLite error code 19) in the worker and return a friendly message.

#### 5. Payment worker trust
The extension forwards `order_type: "preorder"` and `platform: "launch_page"` in the payment payload. Ensure your payment worker handles or ignores these fields gracefully — it should not fail on unknown keys.

#### 6. CORS
The extension inherits CORS config from the v8 worker's `ALLOWED_ORIGINS` env var. The launch page domain must be in that list.

#### 7. Supporter data
`campaign_supporters` now stores emails. Ensure your privacy policy covers email collection and that you are compliant with applicable regulations (GDPR for EU visitors, POPIA for Zimbabwe/South Africa).

---

## How the Pieces Connect

```
Fan visits /launch/[slug]
        │
        ▼
launch/index.html
  GET /launch/:slug/page     ← single API call, gets everything
        │
        ├── Renders hero, countdown, capture form, products
        │
        ├── Capture form → POST /launch/:slug/capture
        │     └── Writes campaign_supporters (phone + email)
        │         Fires launch_events
        │         Returns WhatsApp redirect URL
        │
        ├── Preorder button → POST /launch/:slug/preorder
        │     ├── Upserts campaign_supporters
        │     ├── Inserts launch_preorders (pending)
        │     ├── Calls PAYMENT_WORKER (same as /web-checkout)
        │     └── Updates launch_preorders (paid + order_id)
        │
        └── Status poll (every 30s) → GET /launch/:slug/status
              └── Refreshes supporter count + countdown
```

---

## Adding a Launch in the Admin Dashboard

The extension reads from the existing `campaigns` table. Use whatever admin UI you already have to insert a campaign row, then set the new columns via SQL or a future admin form.

Minimum required fields for a launch page to render:
```
artist_id       → must exist in artists table
title           → shown as hero headline
slug            → URL identifier (unique, lowercase, hyphenated)
status          → 'active'
cover_image     → hero background
description     → hero subtext
```

Optional but high-impact:
```
launch_date           → enables countdown
preorder_enabled = 1  → shows preorder buttons on products
capture_headline      → custom form headline
capture_subtext       → custom form sub-copy
hero_video_url        → autoplay video hero
bg_color / accent_color → brand colour overrides
```
