/**
 * ZVAKHO v8 Worker — Integration Patch
 * ══════════════════════════════════════════════════════════════════════════
 *
 * HOW TO INTEGRATE launches-extension.js INTO THE EXISTING v8 UNIFIED WORKER
 *
 * This file shows the EXACT diff to apply to the v8 worker.
 * You are NOT rewriting the v8 worker — you are adding 3 small blocks to it.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * STEP 1 — Add the import at the very top of your v8 worker file:
 * ─────────────────────────────────────────────────────────────────────────
 */

// ADD at top of zvakho-worker-unified.js (line 1):
import { handleLaunchRoutes } from "./launches-extension.js";

/**
 * ─────────────────────────────────────────────────────────────────────────
 * STEP 2 — Add the route handler inside the main try{} block,
 *           BEFORE the final 404 return.
 *
 * Find this line in the v8 worker:
 *
 *   // ────────────────────────────────────────────────────────────────────
 *   // 404
 *   // ────────────────────────────────────────────────────────────────────
 *   return json({ status: "error", message: "Route not found" }, 404);
 *
 * And insert BEFORE it:
 * ─────────────────────────────────────────────────────────────────────────
 */

// INSERT before the 404 return:
{
  const launchResult = await handleLaunchRoutes(
    request, env, url, path, cors, json, uid
  );
  if (launchResult) return launchResult;
}

/**
 * ─────────────────────────────────────────────────────────────────────────
 * STEP 3 — Add ADMIN_TOKEN to wrangler.toml secrets (optional but recommended)
 *
 * The /launch/:slug/preorders admin route checks env.ADMIN_TOKEN.
 * If you skip this, the route is unprotected.
 *
 *   wrangler secret put ADMIN_TOKEN
 *   > Enter a secret value: [your-long-random-token]
 *
 * ─────────────────────────────────────────────────────────────────────────
 * FULL WRANGLER.TOML after integration:
 * ─────────────────────────────────────────────────────────────────────────
 */

/*
name = "zvakho-universal-store-api"
main = "workers/zvakho-worker-unified.js"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "STORE_DB"
database_name = "zvakho-store-db"
database_id = "YOUR_D1_DATABASE_ID"

[[services]]
binding = "PAYMENT_WORKER"
service = "zvakho-payments-v2"

[vars]
ALLOWED_ORIGINS = "https://zvakho.co.zw,https://www.zvakho.co.zw,https://store.zvakho.co.zw"

# Secrets (run these separately via wrangler secret put):
# PAYMENT_WORKER_URL = "..."   (only if not using service binding)
# ADMIN_TOKEN        = "..."   (protect /preorders admin route)
*/

/**
 * ─────────────────────────────────────────────────────────────────────────
 * NO OTHER CHANGES REQUIRED IN THE V8 WORKER.
 * ─────────────────────────────────────────────────────────────────────────
 */
