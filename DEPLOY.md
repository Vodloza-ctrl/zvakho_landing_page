# ZVAKHO — Worker Ownership Map

This repo contains code for **more than one thing**. Before editing or deploying anything,
check this table so you don't overwrite a live worker with unrelated code.

Last verified: 2026-08-19

## Live in production

| Cloudflare Worker | Owns | Source in this repo |
|---|---|---|
| `zvakho-workers-universal` | Brand identity / font engine, artist store rendering, Paynow payment creation for this flow. **This is the primary production worker.** | `workers/universal.js` — kept in sync, confirmed byte-identical to live as of 2026-08-19. |
| `zvakho-payments-v2` | Auth (login/logout/sessions, PBKDF2 password hashing), payments (create/poll — polls Paynow directly rather than trusting inbound webhooks), owner + artist dashboards, fulfilment updates. | Not in this repo. Lives only on Cloudflare — treat as source of truth for auth/session patterns if replicating elsewhere. |
| `zvakho-store-api` | Product catalog, artist storefront config, launches/campaigns, web checkout (calls `zvakho-payments-v2`-family via `PAYMENT_WORKER` service binding). | Not in this repo. |
| `zvakho-dashboard-api` | Read-only reporting: CSV/HTML/TXT sales exports, system health checks. Complements (does not duplicate) `zvakho-payments-v2`'s dashboards. | Not in this repo. |
| `zvakho-cron-worker` | Scheduled jobs. Modified most recently of all ZVAKHO workers — treat as active. | Not in this repo. |

## Retired — do not deploy to

| Cloudflare Worker | Status | Notes |
|---|---|---|
| `zvakho-universal-store-api` | **Retired 2026-08-19.** No longer receiving new deploys. | A `wrangler.toml` on the `zvakho-rebuild-dev` branch previously targeted this worker's name and had leaked secrets (since scrubbed from git history and rotated). If reviving this worker for any reason, treat all prior credentials as burned. |
| `zvakho-payments` (no `-v2` suffix) | Likely superseded by `zvakho-payments-v2`. | Older KV-based subscription/VIP-unlock model, debug `console.log` statements left in (`HASH_PREFIX`, `KEY_LEN`), different data model (Workers KV, not D1 `orders` table) from everything else currently in use. Not confirmed dead — verify request volume in the Cloudflare dashboard before deleting. |

## In this repo but NOT deployed anywhere

`src/index.js` and everything under `src/api/` is a from-scratch unified-platform rewrite
(`package.json` name: `zvakho-platform`, v2.0.0). It does not correspond to any currently-live
Cloudflare Worker. Large parts of it are incomplete stubs (see empty files under `src/api/auth/`,
`src/api/orders/`, `src/models/`). Treat this as a parked branch-only experiment, not a deploy
target, until a deliberate decision is made to replace the fragmented-but-working live system above.

**Before ever deploying anything from `src/index.js`:** confirm the `name` field in whatever
`wrangler.toml` you use does NOT match any worker in the "Live in production" table above,
unless that is intentionally the goal.

## Workers whose status is NOT yet verified

These exist in the Cloudflare account but haven't been checked against this repo or confirmed
live/dead. Check request volume in the Cloudflare dashboard (Worker → Metrics) before assuming
either way:

- `zvakho-artist-onboarding`
- `zvakho-submissions-api`
- `zvakho-launch-worker`
- `zvakho-brand-identity-test` (name suggests a test/staging worker, not production)

## Secrets

Never commit `wrangler.toml` with real values. Use `wrangler secret put <NAME>` or the
Cloudflare dashboard (Worker → Settings → Variables → toggle "Encrypt") for:
`JWT_SECRET`, `PAYNOW_INTEGRATION_KEY`, `CLOUDFLARE_API_TOKEN`, `GOOGLE_CLIENT_SECRET`,
`MANYCHAT_API_TOKEN`, `RESEND_API_KEY`, and any dashboard/owner access keys.
See `wrangler.toml.example` on the `zvakho-rebuild-dev` branch for the safe template.
