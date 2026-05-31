/**
 * ZVAKHO Launches Extension Worker — v1
 * ══════════════════════════════════════════════════════════════════════════
 *
 * PURPOSE:
 *   This file contains ONLY the new routes added by the Launches extension.
 *   It is designed to be imported into the existing v8 unified worker,
 *   or run as a standalone Cloudflare Worker behind a route pattern like
 *   /launch/* on the same worker domain.
 *
 * NEW ROUTES ADDED:
 *   GET  /launch/:slug/page          Full launch page data (branding + products + count)
 *   POST /launch/:slug/capture       Fan email + WhatsApp capture (no payment)
 *   POST /launch/:slug/preorder      Preorder (fan capture + payment in one step)
 *   GET  /launch/:slug/status        Live countdown + supporter count (poll every 30s)
 *   GET  /launch/:slug/preorders     Admin: list preorders for a campaign
 *   POST /launch/:slug/preorder/:id/cancel  Cancel a pending preorder
 *
 * EXISTING ROUTES USED UNCHANGED:
 *   GET  /launch/:slug               Campaign + products (v8, cached 60s)
 *   POST /launch/:slug/join          Supporter join, phone only (v8)
 *   POST /web-checkout               Payment dispatch (v8)
 *
 * INTEGRATION:
 *   Copy the handleLaunchRoutes() function body into the v8 worker's
 *   route table, before the 404 catch-all:
 *
 *     // ── Launches extension ──────────────────────────────────────────
 *     const launchResult = await handleLaunchRoutes(request, env, url, path, cors, json, uid);
 *     if (launchResult) return launchResult;
 *     // ────────────────────────────────────────────────────────────────
 *
 * ENVIRONMENT BINDINGS (same as v8):
 *   STORE_DB          D1 database (required)
 *   PAYMENT_WORKER    Service binding to payment worker (required for preorders)
 *   PAYMENT_WORKER_URL  Fallback HTTP URL (optional)
 *   ALLOWED_ORIGINS   CORS allowlist
 */

// ═══════════════════════════════════════════════════════════════════════════
// STANDALONE ENTRY POINT
// Remove this export block when integrating into v8.
// ═══════════════════════════════════════════════════════════════════════════

export default {
  async fetch(request, env) {
    const rawOrigins = String(env.ALLOWED_ORIGINS || "https://zvakho.co.zw").trim();
    const ALLOWED_ORIGINS = rawOrigins.split(",").map(o => o.trim()).filter(Boolean);
    const requestOrigin = request.headers.get("Origin") || "";
    const allowedOrigin = ALLOWED_ORIGINS.includes(requestOrigin)
      ? requestOrigin : ALLOWED_ORIGINS[0];

    const cors = {
      "Access-Control-Allow-Origin":  allowedOrigin,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Vary": "Origin"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    if (!env.STORE_DB) {
      return new Response(JSON.stringify({ status: "error", message: "Missing STORE_DB" }), {
        status: 500, headers: { "Content-Type": "application/json", ...cors }
      });
    }

    const url  = new URL(request.url);
    const path = url.pathname;

    const json = (data, status = 200, maxAge = 0) =>
      new Response(JSON.stringify(data, null, 2), {
        status,
        headers: {
          "Content-Type": "application/json",
          ...cors,
          "Cache-Control": maxAge > 0
            ? `public, max-age=${maxAge}, s-maxage=${maxAge}`
            : "no-store"
        }
      });

    const uid = (prefix = "ID") =>
      `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    try {
      const result = await handleLaunchRoutes(request, env, url, path, cors, json, uid);
      if (result) return result;
      return json({ status: "error", message: "Route not found" }, 404);
    } catch (err) {
      return json({ status: "error", message: err.message || "Internal server error" }, 500);
    }
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// CORE: handleLaunchRoutes
// This function is what you embed in the v8 unified worker.
// ═══════════════════════════════════════════════════════════════════════════

export async function handleLaunchRoutes(request, env, url, path, cors, json, uid) {

  // ─────────────────────────────────────────────────────────────────────────
  // GET /launch/:slug/page
  //
  // Unified payload for the launch page frontend.
  // Returns: campaign, artist branding, theme, products, supporter_count,
  //          countdown state, preorder availability.
  //
  // This is the ONLY call the launch page needs on load.
  // Cache: 30s (short — supporter count and countdown state change often)
  // ─────────────────────────────────────────────────────────────────────────

  const pageMatch = path.match(/^\/launch\/([^/]+)\/page$/);

  if (request.method === "GET" && pageMatch) {
    const slug = pageMatch[1].toLowerCase();

    const campaign = await env.STORE_DB.prepare(`
      SELECT
        c.*,
        a.artist_id,
        a.artist_name,
        a.slug          AS artist_slug,
        a.genre,
        a.bio,
        a.tagline,
        a.profile_image_url,
        a.hero_image_url,
        a.logo_url,
        a.logo_white_url,
        a.whatsapp_number,
        a.instagram_url,
        a.tiktok_url,
        a.youtube_url,
        at.primary_color,
        at.secondary_color,
        at.background_color,
        at.text_color,
        at.accent_color,
        at.ticker_text,
        tp.button_style,
        tp.preset_name
      FROM campaigns c
      LEFT JOIN artists       a  ON a.artist_id  = c.artist_id
      LEFT JOIN artist_themes at ON at.artist_id = c.artist_id
      LEFT JOIN theme_presets tp ON tp.preset_id = at.preset_id
      WHERE LOWER(c.slug) = ?
      LIMIT 1
    `).bind(slug).first();

    if (!campaign) {
      return json({ status: "error", message: "Launch not found" }, 404);
    }

    // ── Products (sorted by launch_slot for page order control) ───────────

    const productsRows = await env.STORE_DB.prepare(`
      SELECT
        p.product_id,
        p.product_type,
        p.product_name,
        p.description,
        p.price,
        p.currency,
        p.stock,
        p.main_image_url,
        p.image_url,
        p.file_url,
        p.preview_url,
        p.preorder_enabled,
        p.preorder_close_date,
        p.preorder_count,
        p.limited_release,
        p.launch_slot
      FROM products p
      WHERE p.campaign_id = ? AND p.active = 1
      ORDER BY p.launch_slot ASC, p.created_at DESC
    `).bind(campaign.campaign_id).all();

    const products = (productsRows.results || []).map(p => ({
      product_id:         p.product_id,
      product_type:       p.product_type,
      product_name:       p.product_name,
      description:        p.description       || "",
      price:              Number(p.price || 0),
      currency:           p.currency          || "USD",
      price_label:        `$${Number(p.price || 0).toFixed(2)}`,
      stock:              p.stock             ?? null,
      image:              p.main_image_url    || p.image_url || campaign.cover_image || "",
      file_url:           p.file_url          || "",
      preview_url:        p.preview_url       || "",
      preorder_enabled:   Boolean(p.preorder_enabled),
      preorder_close_date: p.preorder_close_date || null,
      preorder_count:     Number(p.preorder_count || 0),
      limited_release:    Boolean(p.limited_release),
      launch_slot:        Number(p.launch_slot || 0)
    }));

    // ── Supporter count (public social proof) ────────────────────────────

    const countRow = await env.STORE_DB.prepare(`
      SELECT COUNT(*) AS n
      FROM campaign_supporters
      WHERE campaign_id = ?
    `).bind(campaign.campaign_id).first();

    const supporter_count = Number(countRow?.n || 0);

    // ── Countdown state ────────────────────────────────────────────────

    const now         = Date.now();
    const launchTime  = campaign.launch_date
      ? new Date(campaign.launch_date).getTime()
      : null;

    const countdown = launchTime
      ? {
          enabled:      Boolean(campaign.countdown_enabled),
          launch_date:  campaign.launch_date,
          ms_remaining: Math.max(0, launchTime - now),
          launched:     now >= launchTime
        }
      : { enabled: false, launched: true };

    // ── Theme (campaign overrides fall back to artist theme) ──────────

    const theme = {
      primary_color:    campaign.bg_color         || campaign.background_color || "#0b0b0b",
      accent_color:     campaign.accent_color      || campaign.accent_color_raw || "#f5a400",
      text_color:       campaign.text_color        || "#ffffff",
      secondary_color:  campaign.secondary_color   || "#ffffff",
      button_style:     campaign.button_style      || "solid",
      ticker_text:      campaign.ticker_text       || "",
      logo_url:         campaign.logo_override_url || campaign.logo_white_url || campaign.logo_url || ""
    };

    return json({
      status: "success",

      campaign: {
        campaign_id:             campaign.campaign_id,
        slug:                    campaign.slug,
        title:                   campaign.title          || "",
        campaign_type:           campaign.campaign_type  || "Launch",
        description:             campaign.description    || "",
        cover_image:             campaign.cover_image    || "",
        hero_video_url:          campaign.hero_video_url || "",
        release_date:            campaign.release_date   || null,
        launch_date:             campaign.launch_date    || null,
        status:                  campaign.status         || "active",
        preorder_enabled:        Boolean(campaign.preorder_enabled),
        preorder_limit:          campaign.preorder_limit ?? null,
        email_capture:           Boolean(campaign.email_capture ?? 1),
        whatsapp_capture:        Boolean(campaign.whatsapp_capture ?? 1),
        capture_headline:        campaign.capture_headline || "Be the first to know",
        capture_subtext:         campaign.capture_subtext  || "Drop your details and we'll hit you when it's live.",
        supporter_count_visible: Boolean(campaign.supporter_count_visible ?? 1)
      },

      artist: {
        artist_id:         campaign.artist_id,
        artist_name:       campaign.artist_name       || "",
        slug:              campaign.artist_slug        || "",
        genre:             campaign.genre              || "",
        tagline:           campaign.tagline            || "",
        bio:               campaign.bio                || "",
        profile_image_url: campaign.profile_image_url || "",
        hero_image_url:    campaign.hero_image_url     || "",
        whatsapp_number:   campaign.whatsapp_number    || "",
        instagram_url:     campaign.instagram_url      || "",
        tiktok_url:        campaign.tiktok_url         || "",
        youtube_url:       campaign.youtube_url        || ""
      },

      theme,
      countdown,
      supporter_count: campaign.supporter_count_visible ? supporter_count : null,
      products,
      product_count: products.length
    }, 200, 30);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // POST /launch/:slug/capture
  //
  // Fan email + WhatsApp opt-in. No payment.
  // Writes to campaign_supporters (upsert by phone).
  // Fires launch_events entry.
  //
  // Body: { phone, email?, name? }
  // ─────────────────────────────────────────────────────────────────────────

  const captureMatch = path.match(/^\/launch\/([^/]+)\/capture$/);

  if (request.method === "POST" && captureMatch) {
    const slug = captureMatch[1].toLowerCase();

    let body;
    try { body = await request.json(); } catch {
      return json({ status: "error", message: "Invalid JSON body" }, 400);
    }

    const phone = String(body.phone || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const name  = String(body.name  || "").trim();

    // At least one contact method required
    if (!phone && !email) {
      return json({ status: "error", message: "Phone or email required" }, 400);
    }

    const campaign = await env.STORE_DB.prepare(`
      SELECT campaign_id, artist_id, title, email_capture, whatsapp_capture
      FROM campaigns
      WHERE LOWER(slug) = ?
      LIMIT 1
    `).bind(slug).first();

    if (!campaign) {
      return json({ status: "error", message: "Campaign not found" }, 404);
    }

    // Check for existing supporter (by phone or email)
    const lookupKey = phone || email;
    const lookupCol = phone ? "phone" : "email";

    const existing = await env.STORE_DB.prepare(`
      SELECT supporter_id, phone, email
      FROM campaign_supporters
      WHERE campaign_id = ? AND ${lookupCol} = ?
      LIMIT 1
    `).bind(campaign.campaign_id, lookupKey).first();

    let supporterId;

    if (existing) {
      supporterId = existing.supporter_id;

      // Update email if they're adding it now
      if (email && !existing.email) {
        await env.STORE_DB.prepare(`
          UPDATE campaign_supporters SET email = ? WHERE supporter_id = ?
        `).bind(email, supporterId).run();
      }
    } else {
      supporterId = crypto.randomUUID();

      await env.STORE_DB.prepare(`
        INSERT INTO campaign_supporters
          (supporter_id, campaign_id, phone, email, tag, capture_source)
        VALUES (?, ?, ?, ?, 'launch_fan', 'launch_page')
      `).bind(
        supporterId,
        campaign.campaign_id,
        phone  || null,
        email  || null
      ).run();
    }

    // Fire event (non-fatal if it fails)
    try {
      await env.STORE_DB.prepare(`
        INSERT INTO launch_events
          (event_id, campaign_id, artist_id, event_type, reference_id, metadata)
        VALUES (?, ?, ?, 'fan_captured', ?, ?)
      `).bind(
        crypto.randomUUID(),
        campaign.campaign_id,
        campaign.artist_id,
        supporterId,
        JSON.stringify({ phone: phone || null, email: email || null, name: name || null })
      ).run();
    } catch { /* non-fatal */ }

    // Return count for live social proof update
    const countRow = await env.STORE_DB.prepare(`
      SELECT COUNT(*) AS n FROM campaign_supporters WHERE campaign_id = ?
    `).bind(campaign.campaign_id).first();

    return json({
      status:          "success",
      message:         existing ? "Already registered" : "Registered",
      supporter_id:    supporterId,
      supporter_count: Number(countRow?.n || 0),
      whatsapp_redirect: campaign.whatsapp_capture
        ? buildWhatsAppURL(campaign)
        : null
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // POST /launch/:slug/preorder
  //
  // Fan capture + preorder in one step.
  // 1. Upserts campaign_supporters (same as /capture)
  // 2. Inserts into launch_preorders
  // 3. Dispatches to PAYMENT_WORKER (same flow as /web-checkout)
  // 4. On payment success: updates preorder status + order_id
  //
  // Body: { phone, email?, customer_name?, product_id, variant_id?, quantity? }
  // ─────────────────────────────────────────────────────────────────────────

  const preorderMatch = path.match(/^\/launch\/([^/]+)\/preorder$/);

  if (request.method === "POST" && preorderMatch) {
    const slug = preorderMatch[1].toLowerCase();

    // Guard payment binding
    const hasServiceBinding = env.PAYMENT_WORKER && typeof env.PAYMENT_WORKER.fetch === "function";
    const hasUrlBinding = typeof env.PAYMENT_WORKER_URL === "string" && env.PAYMENT_WORKER_URL.startsWith("http");

    if (!hasServiceBinding && !hasUrlBinding) {
      return json({ status: "error", message: "Payment not configured" }, 500);
    }

    let body;
    try { body = await request.json(); } catch {
      return json({ status: "error", message: "Invalid JSON body" }, 400);
    }

    const phone         = String(body.phone         || "").trim();
    const email         = String(body.email         || "").trim().toLowerCase();
    const customer_name = String(body.customer_name || "Fan").trim();
    const product_id    = String(body.product_id    || "").trim();
    const variant_id    = String(body.variant_id    || "").trim() || null;
    const quantity      = Math.max(1, Number(body.quantity || 1));

    if (!phone && !email) return json({ status: "error", message: "Phone or email required" }, 400);
    if (!product_id)      return json({ status: "error", message: "product_id required" }, 400);

    // ── Load campaign ──────────────────────────────────────────────────

    const campaign = await env.STORE_DB.prepare(`
      SELECT
        c.campaign_id, c.artist_id, c.title, c.slug,
        c.preorder_enabled, c.preorder_limit,
        a.artist_name, a.whatsapp_number
      FROM campaigns c
      LEFT JOIN artists a ON a.artist_id = c.artist_id
      WHERE LOWER(c.slug) = ?
      LIMIT 1
    `).bind(slug).first();

    if (!campaign)                    return json({ status: "error", message: "Campaign not found" }, 404);
    if (!campaign.preorder_enabled)   return json({ status: "error", message: "Preorders not open" }, 400);

    // ── Check preorder limit ──────────────────────────────────────────

    if (campaign.preorder_limit) {
      const takenRow = await env.STORE_DB.prepare(`
        SELECT COUNT(*) AS n
        FROM launch_preorders
        WHERE campaign_id = ? AND status NOT IN ('cancelled','refunded')
      `).bind(campaign.campaign_id).first();

      const taken = Number(takenRow?.n || 0);
      if (taken >= campaign.preorder_limit) {
        return json({ status: "error", message: "Preorder slots full" }, 409);
      }
    }

    // ── Load & validate product ───────────────────────────────────────

    const product = await env.STORE_DB.prepare(`
      SELECT product_id, product_name, product_type, price, currency, active, preorder_enabled
      FROM products
      WHERE product_id = ? AND campaign_id = ? AND active = 1
      LIMIT 1
    `).bind(product_id, campaign.campaign_id).first();

    if (!product) return json({ status: "error", message: "Product not found or inactive" }, 404);

    const unit_price   = Number(campaign.preorder_price || product.price || 0);
    const total_amount = unit_price * quantity;

    if (total_amount <= 0) return json({ status: "error", message: "Invalid price" }, 400);

    // ── Upsert supporter ──────────────────────────────────────────────

    const lookupKey = phone || email;
    const lookupCol = phone ? "phone" : "email";

    const existing = await env.STORE_DB.prepare(`
      SELECT supporter_id FROM campaign_supporters
      WHERE campaign_id = ? AND ${lookupCol} = ?
      LIMIT 1
    `).bind(campaign.campaign_id, lookupKey).first();

    let supporterId = existing?.supporter_id;

    if (!supporterId) {
      supporterId = crypto.randomUUID();
      await env.STORE_DB.prepare(`
        INSERT INTO campaign_supporters
          (supporter_id, campaign_id, phone, email, tag, capture_source)
        VALUES (?, ?, ?, ?, 'preorder', 'preorder')
      `).bind(supporterId, campaign.campaign_id, phone || null, email || null).run();
    }

    // ── Create pending preorder record ────────────────────────────────

    const preorderId = uid("PRE");

    await env.STORE_DB.prepare(`
      INSERT INTO launch_preorders
        (preorder_id, campaign_id, artist_id, product_id, variant_id,
         supporter_id, phone, email, customer_name,
         quantity, unit_price, total_amount, currency, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'USD', 'pending')
    `).bind(
      preorderId,
      campaign.campaign_id,
      campaign.artist_id,
      product_id,
      variant_id,
      supporterId,
      phone  || null,
      email  || null,
      customer_name,
      quantity,
      unit_price,
      total_amount
    ).run();

    // ── Dispatch to payment worker ─────────────────────────────────────

    const paymentPayload = {
      artist_id:      campaign.artist_id,
      artist_name:    campaign.artist_name,   // Always from DB
      customer_name,
      phone:          phone  || "",
      customer_phone: phone  || "",
      email:          email  || "",
      customer_email: email  || "",
      order_type:     "preorder",
      platform:       "launch_page",
      total_amount,
      order_total:    total_amount,
      currency:       "USD",
      preorder_id:    preorderId,
      items: [{
        product_id:   product.product_id,
        product_name: product.product_name,
        product_type: product.product_type,
        variant_id,
        quantity,
        unit_price,
        line_total: total_amount
      }]
    };

    let payRes;
    try {
      if (hasServiceBinding) {
        payRes = await env.PAYMENT_WORKER.fetch(
          new Request("https://payment-worker/create-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(paymentPayload)
          })
        );
      } else {
        payRes = await fetch(env.PAYMENT_WORKER_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(paymentPayload)
        });
      }
    } catch (payErr) {
      // Mark preorder as cancelled if payment worker is unreachable
      await env.STORE_DB.prepare(
        `UPDATE launch_preorders SET status='cancelled', notes=? WHERE preorder_id=?`
      ).bind(`Payment worker error: ${payErr.message}`, preorderId).run();
      return json({ status: "error", message: "Payment unavailable, please try again" }, 503);
    }

    const payText = await payRes.text();
    let payment = null;
    try { payment = JSON.parse(payText); } catch { payment = null; }

    if (!payRes.ok || !payment) {
      await env.STORE_DB.prepare(
        `UPDATE launch_preorders SET status='cancelled', notes=? WHERE preorder_id=?`
      ).bind(`Payment failed: ${payText.slice(0, 200)}`, preorderId).run();
      return json({ status: "error", message: "Payment failed", raw: payText }, 500);
    }

    // ── Update preorder with payment reference ─────────────────────────

    const paymentRef = payment.payment_id || payment.order_id || payment.reference || null;
    const orderId    = payment.order_id || null;

    await env.STORE_DB.prepare(`
      UPDATE launch_preorders
      SET status = 'paid', payment_ref = ?, order_id = ?, updated_at = datetime('now')
      WHERE preorder_id = ?
    `).bind(paymentRef, orderId, preorderId).run();

    // Increment product preorder_count
    await env.STORE_DB.prepare(`
      UPDATE products SET preorder_count = preorder_count + 1 WHERE product_id = ?
    `).bind(product_id).run();

    // Fire event
    try {
      await env.STORE_DB.prepare(`
        INSERT INTO launch_events
          (event_id, campaign_id, artist_id, event_type, reference_id, metadata)
        VALUES (?, ?, ?, 'preorder_placed', ?, ?)
      `).bind(
        crypto.randomUUID(),
        campaign.campaign_id,
        campaign.artist_id,
        preorderId,
        JSON.stringify({ product_id, quantity, total_amount, payment_ref: paymentRef })
      ).run();
    } catch { /* non-fatal */ }

    return json({
      status:      "success",
      preorder_id: preorderId,
      total_amount,
      total_label: `$${total_amount.toFixed(2)}`,
      payment
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // GET /launch/:slug/status
  //
  // Lightweight poll endpoint. Frontend calls this every 30s to refresh:
  //   - supporter_count  (social proof ticker)
  //   - countdown        (time remaining)
  //   - preorders_left   (scarcity indicator)
  //
  // Cache: 15s (CDN edge cache — cheap to serve, gives near-real-time feel)
  // ─────────────────────────────────────────────────────────────────────────

  const statusMatch = path.match(/^\/launch\/([^/]+)\/status$/);

  if (request.method === "GET" && statusMatch) {
    const slug = statusMatch[1].toLowerCase();

    const campaign = await env.STORE_DB.prepare(`
      SELECT
        campaign_id, launch_date, countdown_enabled,
        preorder_enabled, preorder_limit,
        supporter_count_visible, status
      FROM campaigns
      WHERE LOWER(slug) = ?
      LIMIT 1
    `).bind(slug).first();

    if (!campaign) return json({ status: "error", message: "Campaign not found" }, 404);

    const now        = Date.now();
    const launchTime = campaign.launch_date ? new Date(campaign.launch_date).getTime() : null;

    const [countRow, preorderRow] = await Promise.all([
      env.STORE_DB.prepare(
        `SELECT COUNT(*) AS n FROM campaign_supporters WHERE campaign_id = ?`
      ).bind(campaign.campaign_id).first(),

      campaign.preorder_enabled && campaign.preorder_limit
        ? env.STORE_DB.prepare(
            `SELECT COUNT(*) AS n FROM launch_preorders WHERE campaign_id = ? AND status NOT IN ('cancelled','refunded')`
          ).bind(campaign.campaign_id).first()
        : Promise.resolve(null)
    ]);

    const supporter_count = Number(countRow?.n || 0);
    const preorders_taken = Number(preorderRow?.n || 0);
    const preorders_left  = campaign.preorder_limit
      ? Math.max(0, campaign.preorder_limit - preorders_taken)
      : null;

    return json({
      status: "success",
      campaign_status:  campaign.status,
      supporter_count:  campaign.supporter_count_visible ? supporter_count : null,
      preorders_left,
      countdown: launchTime
        ? {
            enabled:      Boolean(campaign.countdown_enabled),
            launch_date:  campaign.launch_date,
            ms_remaining: Math.max(0, launchTime - now),
            launched:     now >= launchTime
          }
        : { enabled: false, launched: true }
    }, 200, 15);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // GET /launch/:slug/preorders
  // Admin: full preorder list for a campaign.
  // (No auth guard here — protect at the network/R2 level or add a
  //  ?admin_token= check against an env secret before going to production.)
  // ─────────────────────────────────────────────────────────────────────────

  const preorderListMatch = path.match(/^\/launch\/([^/]+)\/preorders$/);

  if (request.method === "GET" && preorderListMatch) {
    const slug = preorderListMatch[1].toLowerCase();

    const adminToken = url.searchParams.get("token");
    if (env.ADMIN_TOKEN && adminToken !== env.ADMIN_TOKEN) {
      return json({ status: "error", message: "Unauthorised" }, 401);
    }

    const campaign = await env.STORE_DB.prepare(
      `SELECT campaign_id FROM campaigns WHERE LOWER(slug) = ? LIMIT 1`
    ).bind(slug).first();

    if (!campaign) return json({ status: "error", message: "Campaign not found" }, 404);

    const rows = await env.STORE_DB.prepare(`
      SELECT
        lp.*,
        p.product_name,
        p.product_type
      FROM launch_preorders lp
      LEFT JOIN products p ON p.product_id = lp.product_id
      WHERE lp.campaign_id = ?
      ORDER BY lp.created_at DESC
      LIMIT 200
    `).bind(campaign.campaign_id).all();

    const summary = await env.STORE_DB.prepare(`
      SELECT
        status,
        COUNT(*)       AS count,
        SUM(total_amount) AS total
      FROM launch_preorders
      WHERE campaign_id = ?
      GROUP BY status
    `).bind(campaign.campaign_id).all();

    return json({
      status:    "success",
      preorders: rows.results || [],
      count:     (rows.results || []).length,
      summary:   summary.results || []
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // POST /launch/:slug/preorder/:id/cancel
  // Cancel a pending preorder. Marks as cancelled, does not refund.
  // ─────────────────────────────────────────────────────────────────────────

  const cancelMatch = path.match(/^\/launch\/([^/]+)\/preorder\/([^/]+)\/cancel$/);

  if (request.method === "POST" && cancelMatch) {
    const [, slug, preorderId] = cancelMatch;

    const campaign = await env.STORE_DB.prepare(
      `SELECT campaign_id FROM campaigns WHERE LOWER(slug) = ? LIMIT 1`
    ).bind(slug.toLowerCase()).first();

    if (!campaign) return json({ status: "error", message: "Campaign not found" }, 404);

    const preorder = await env.STORE_DB.prepare(`
      SELECT preorder_id, status, product_id
      FROM launch_preorders
      WHERE preorder_id = ? AND campaign_id = ?
      LIMIT 1
    `).bind(preorderId, campaign.campaign_id).first();

    if (!preorder) return json({ status: "error", message: "Preorder not found" }, 404);
    if (preorder.status === "cancelled") return json({ status: "ok", message: "Already cancelled" });
    if (preorder.status === "fulfilled") return json({ status: "error", message: "Cannot cancel fulfilled order" }, 409);

    await env.STORE_DB.prepare(`
      UPDATE launch_preorders
      SET status = 'cancelled', updated_at = datetime('now')
      WHERE preorder_id = ?
    `).bind(preorderId).run();

    // Decrement product preorder_count if it was paid
    if (preorder.status === "paid") {
      await env.STORE_DB.prepare(`
        UPDATE products
        SET preorder_count = MAX(0, preorder_count - 1)
        WHERE product_id = ?
      `).bind(preorder.product_id).run();
    }

    return json({ status: "success", message: "Preorder cancelled" });
  }

  // No match — return null so the v8 worker continues to its own routes
  return null;
}

// ─────────────────────────────────────────────────────────────────────────
// HELPERS (private to this module)
// ─────────────────────────────────────────────────────────────────────────

function buildWhatsAppURL(campaign) {
  // Re-uses artist's existing whatsapp_number.
  // Message auto-populates on mobile, letting the artist continue
  // the conversation in their existing WhatsApp flow.
  const number = String(campaign.whatsapp_number || "").replace(/\D/g, "");
  if (!number) return null;

  const text = encodeURIComponent(
    `Hey! I just signed up for the ${campaign.title || "launch"} — count me in 🔥`
  );

  return `https://wa.me/${number}?text=${text}`;
}
