// ================================================================
// ZVAKHO Universal Worker — v50 (fixes a real legibility bug in
// pattern_tile and texture_panel_badge -- knocked-out text was
// illegible against both dot patterns)
// Built directly on the real live v23 worker (version string below still
// reads v23-real-merch-commission for the merch/commission subsystem).
//
// v46: new interlock_monogram archetype. Two initials, second one
// genuinely cut away via SVG mask wherever it overlaps the first
// letter's real rendered glyph shape -- not just layered text -- so it
// works correctly with real embedded custom fonts, not just as a
// system-font approximation. Three styles, picked per generation:
//   - weight: same font, contrasting weight (variable fonts get a real
//     weight range like weight_contrast_word already does; static fonts
//     fall back to a muted fill on the back letter, same proven
//     compensation weight_contrast_word already uses for the identical
//     limitation)
//   - size: dominant letter + smaller nested letter
//   - pairing: primaryFont + supportFont, a genuine two-font pairing,
//     falls back to weight-contrast if no supportFont was assigned
// Positioning uses text-anchor end/start around a shared center point,
// not hand-tuned absolute coordinates, so the overlap zone adapts to
// each letter's actual rendered width -- verified against 10 different
// letter pairs (narrow, wide, same-letter) before shipping, not just
// the one pair it was prototyped with.
//
// Caught and fixed a real bug before shipping: the edit that inserted
// this function anchored on the "const IDENTITY_ARCHETYPE_RENDERERS ="
// line to find its insertion point and didn't preserve that line in the
// replacement -- the exact same mistake class as the v41 hotfix. Caught
// this time by an explicit brace-balance check (1728/1728) rather than
// trusting node --check alone, which reported the broken version as
// syntactically fine. Also cross-checked every declared render*
// function against the registry (18 declared, 18 registered, zero
// mismatches) before considering this done.
//
// v50: real user report -- pattern_tile and texture_panel_badge both
// illegible, "text is white and pattern is black". Confirmed the root
// cause: both used a knockout mask (text carved as empty space out of
// a dot pattern), which looked clean against the simple "Brand Name"
// review sample but breaks down with real names -- a dot-based pattern
// can't tile cleanly against curved letter strokes, so the letterforms
// read as noisy/jagged rather than clean text, and this held for BOTH
// the uniform pattern_tile grid and the deliberately-randomized
// texture_panel_badge halftone, ruling out "just make the pattern more
// uniform" as the fix. Real fix: text now sits on its own solid
// background-color plate instead of being knocked out of the pattern --
// the dots remain a genuine border/frame effect around the text rather
// than something the text has to compete with, and legibility no
// longer depends on how the browser happens to rasterize a mask.
// Caught and fixed a real sizing bug in the first version of this fix
// before it ever reached the worker file: the plate-width formula
// (estimated text width + fixed padding) was checked only visually at
// first, but numerically verifying it against the bordered pattern
// area's actual width showed a 23px overflow for a 10-character name --
// the plate would have poked out past the border on both sides. Fixed
// by tightening the font-fit width so the plate has real margin
// (verified: ~47px/~27px of visible pattern on each side for
// pattern_tile/texture_panel_badge respectively), then re-verified a
// 23-character stress-test name still fits inside the border before
// shipping either fix.
//
// v49: 4 new archetypes -- icon_accent_wordmark, icon_medallion_hero,
// icon_divider_rule, texture_panel_badge -- give the 10 trend-research
// icons (flame, spiderweb, smiley x2, heart-dagger, barbed wire, chain
// link, cherry, line-leaf, halftone-distressed texture) a real path
// into generated artwork. Rather than one bespoke archetype per icon
// (10 icons would mean 10 archetypes), built a pool-based picker,
// identityPickIcon() -- same principle getFontPoolForCategory already
// uses for fonts: query a real pool (by register or an explicit icon_id
// whitelist), prefer tag-matched rows, fall back to the broader pool,
// pick randomly. icon_medallion_hero draws from the whole y2k register;
// icon_divider_rule deliberately uses an explicit 2-icon whitelist
// (barbed wire, chain link) instead, since those are the only current
// icons actually shaped for a horizontal divider slot -- a flame or
// smiley squeezed into that shape wouldn't read correctly, so this
// isn't just "open the whole register" everywhere.
// Caught a real bug while wiring this up, independent of anything new
// being built: the actual /identity/generate render loop never declared
// or passed iconCache at all -- wreath_lockup and seal_medallion have
// been silently re-querying D1 for the same icon on every single call
// since v46/v47 instead of reusing one cached lookup per request, same
// class of gap as fontCache. Not a crash (identityFetchIcon/
// identityPickIcon both guard against an undefined cache), just a real,
// silent inefficiency that's been live this whole time. Fixed by adding
// the missing `const iconCache = new Map();` and threading it through
// both real render calls.
// Verified the same way as v48, applied from the start this time rather
// than after being caught out: registry key set cross-matched
// character-for-character against the D1 archetypes table (24/24, zero
// orphans either direction), and the actual composited logic tested
// locally first with real icon file content and mock brand names,
// rendered end to end, before any of it went into the real worker file.
//
// v48: real user report via screenshots -- wreath_lockup and
// seal_medallion failed on every single font tested, across every tag
// (premium/vintage/athletic), while every other archetype (including
// pattern_tile and the curved-text ones with no icon dependency) worked
// fine. That pattern -- both broken archetypes share icon-fetching,
// nothing else does -- pointed straight at identityFetchIcon()/
// iconGroup(). Ran a comprehensive audit (every camelCase call site in
// the file cross-checked against actual declarations) rather than
// guessing, and confirmed: both helper functions were called 4 times
// combined, declared zero times, anywhere in the file. Calling an
// undefined function throws a ReferenceError, silently caught by the
// preview tool's error handling and shown as a bare "(render failed)"
// with no detail -- which is also fixed this version: the preview tool
// now shows the actual error message on a failed card instead of
// swallowing it, so this exact situation is self-diagnosing next time
// rather than needing a screenshot and a manual trace. Re-added both
// helpers verified working, re-ran the same undefined-reference audit
// afterward and confirmed clean (the audit also flags jsonResponse,
// deriveBits, normalizeArtistId, renderFn, renderers as "missing" --
// checked each individually and confirmed all five are false positives
// from the heuristic: an alias assignment, a built-in Web Crypto API
// call, a comment mentioning an old name, and two local variables
// holding function references -- not real bugs).
// Separately reported in the same screenshots: "Capo Rose" failing
// across multiple different archetypes (not just one), which is a
// different signature -- a font-level problem, not an archetype one.
// Checked its D1 row: r2_key looks structurally normal
// (fonts/premium/capo-rose/regular.woff2), same shape as the earlier
// "Comico" case, which turned out to be a genuinely missing R2 file.
// Can't confirm the actual R2 object from here (no object-level R2
// access in this environment) -- this is exactly what
// /admin/fonts/diagnose exists for, and the preview tool will now also
// show the real error directly on the failing card once this version
// is deployed.
//
// v47: building the requested archetype+font combo preview tool forced
// tracing the full real generation pipeline end to end, which surfaced
// three real bugs already live in v46 -- none caught by node --check:
// (1) getFontPoolForCategory()/getPairingPartnerPool() -- the actual
// functions real generation calls -- never selected case_style, so
// every font reaching an archetype had case_style === undefined and
// applyBrandNameCase() always fell through to .toUpperCase(). The
// entire Upper/Lower/Natural feature from v44/v45 has been silently
// inert in real generation this whole time, only ever working in local
// sandbox tests where case_style was set manually. Both queries now
// select it. (2) interlock_monogram was never added to
// IDENTITY_ARCHETYPES_NEEDING_SUPPORT_FONT, so its "pairing" style was
// dead code in production -- now registered. (3) renderWreathLockup
// and renderSealMedallion -- verified working locally before v46
// shipped -- never actually made it into the pushed file; only
// renderInterlockMonogram survived. Both were still seeded `active` in
// D1, so buildComboPool's defensive check silently filtered them out of
// every generation rather than erroring -- no crash, just quietly never
// selectable. Re-added both from the tested implementation, and removed
// a related orphan: nested_monogram was seeded in D1 with no
// implementing code at all, and turned out unnecessary anyway since
// interlock_monogram's own "size" style already covers that treatment.
// Verified this version with a check aimed at this exact failure class:
// cross-checked the registry's key set against the D1 archetypes
// table's actual rows and confirmed an exact match, zero orphans either
// direction -- not just a key count, which the v46 verification also
// had and which still missed the problem.
// New: GET /admin/preview -- archetype picker showing real `active`
// status, and per archetype a real combo grid rendered with the ACTUAL
// production render function against a random sample of real approved
// fonts (genuine identitySvgDoc output with embedded font data, not an
// approximation), with a decommission button per font and one for the
// archetype itself. New POST /admin/archetypes/toggle backs the
// archetype-level decommission, flipping the same `active` column
// buildComboPool already gates on.
//
// v40: /admin/fonts cards now have a "move to category" dropdown next to
// the approve/reject button, populated from the live DISTINCT set of
// category_tag values. New POST /admin/fonts/recategorize endpoint
// backs it -- same Basic Auth as the rest of /admin/fonts. Deliberately
// only allows moving into a category_tag that already exists somewhere
// in the table (this is a recategorize tool, not a category-creation
// tool -- a typo in the request body can't spawn a stray new category).
// Logic verified directly against live D1 before shipping: moved a real
// font ("Winter Half") to a different category, confirmed the change
// persisted, then reverted it -- the actual recategorization decisions
// are Lenni's to make with the tool, not something to bake in as a
// side effect of testing.
//
// v39: 4 archetypes that were bare (no supporting micro-copy at all) now
// carry real structural text -- same no-invented-copy principle already
// established elsewhere (bootleg_stack's EST. year, ornate_tagline's
// tag-or-tagline fallback):
//   - wordmark: small "SINCE <year>" or city label beneath the word --
//     matches the "oversized minimalism" register directly (huge word,
//     tiny real supporting text, no icon).
//   - weight_contrast_word: same small label treatment.
//   - laurel_badge: the previously-bare rule line now carries "EST.
//     <year>" -- a real heritage-badge convention, not decoration for
//     its own sake.
//   - stamp_seal: a curved "SINCE <year>" label along the inner ring,
//     same textPath technique circle_badge already proved. Replaced a
//     small dot decoration that would have visually collided with it.
// Deliberately did NOT touch monogram_mark, split_panel, or pattern_tile
// -- those are minimal/graphic-forward by design; adding text would
// dilute what makes them work, not improve them.
// Verified all 4 by rendering real geometry locally before shipping.
//
// v38: direct response to "this is just text in circle/square frames" --
// fair critique. Of the original 11 archetypes, only 2 (circle_badge,
// monogram_mark) had any real shape/frame at all; the rest were pure
// typography. Added 6 new ones built from actual graphic elements
// (trig-placed laurel leaves, a fishtail ribbon path, a double-ring
// tick-marked seal, an SVG-masked two-tone split panel, a real icon+
// wordmark lockup, a pattern-fill knockout mark) -- none of this needed
// image generation, all pure SVG. Each was rendered and visually
// reviewed locally with real geometry before shipping (not shipped
// blind) -- one (split_panel) was caught using a fragile inline
// CSS clip-path with ambiguous percentage semantics and rewritten with a
// proper SVG <clipPath clipPathUnits="userSpaceOnUse"> before going in.
// Registered but not yet seeded into the `archetypes` D1 table with tags
// -- run the accompanying SQL to make them actually selectable.
//
// v37: after live generations came back looking bad ("terrible", one
// illegible), traced the likely real cause -- the 311-font bulk approval
// from last session filtered only on license status, which says nothing
// about whether a font is actually legible or well-designed for a brand
// wordmark. That was flagged as a tradeoff at the time; this is the
// follow-through. New tool: GET /admin/fonts (category picker, then a
// grid of every font in that category rendered with a real sample word
// using its own embedded glyphs -- reuses identityFetchFontBase64(), the
// same font-loading path generation itself uses) + POST
// /admin/fonts/toggle (flips a single font's approved flag). Same Basic
// Auth pattern as /admin/calibrator -- same session, no extra login.
// This doesn't fix any font automatically; it makes the actual problem
// (illegible fonts silently included) visible and fixable by eye, fast,
// rather than needing to review 311 rows of text data blind.
//
// v36: IDENTITY_MAX_GENERATIONS raised from 3 to 10, per direct decision
// -- the original 3-cap made sense for a system charging a paid AI API
// call per generation, which this build never actually used (no LLM,
// deterministic selection logic throughout). Real cost per generation
// here is negligible. Kept finite rather than unlimited on purpose --
// unlimited regeneration risks decision paralysis rather than helping
// anyone actually land on an identity, a real UX cost independent of
// infra cost. 10 comfortably covers even the smallest category pool
// (handwritten, 22 combos as of the font-approval pass run directly
// against D1 this session) without leaning on the v35 repeat-fallback.
//
// v35, per direct request: two real changes to /identity/generate.
// (1) Never returns fewer than 3 concepts again. Previously, once a
// brand's shown-combo history exhausted the (small) pool for a tag --
// which happens fast: e.g. "modern" only had 4 eligible archetypes x 2
// approved fonts = 8 total combos against 3 rounds x 3 concepts = 9
// requested slots -- round 3 would come back with fewer than 3
// (confirmed live: got exactly 2, both forced onto the same leftover
// font). Now pickNFromPool() falls back to allowing a repeat from the
// full pool rather than ever returning short. Real fix long-term is
// approving more fonts per category; this just stops the short-count
// symptom regardless.
// (2) 1 of the 3 concepts is now ALWAYS drawn from the "experimental" tag
// specifically -- a standing guarantee via pickConceptsForRound(), not
// gated behind the old creative_mode opt-in anymore (that flag folded
// experimental into the same pool rather than reserving it a real slot,
// which wasn't actually the ask). Each concept in the response now has
// an `is_experimental` flag so it's identifiable which one it is.
// creative_mode is still accepted in the request body for backward
// compatibility but no longer does anything.
//
// Also includes the v34 fix (artwork never has a baked-in background,
// at the source) and everything from v29-v33 before it.
//
// v32: the calibrator tool (added in v31) only ever generated SQL text
// to copy-paste -- no real persistence, which was confusing ("no way of
// saving it"). Added POST /admin/calibrator/save, same Basic Auth as the
// page itself (browsers auto-attach cached Basic Auth credentials to
// same-origin fetch() calls, no extra login step needed) -- writes
// area_x/y/w/h + image_width/height straight to the matching
// print_templates row by template_id. Only ever UPDATEs the 6 known
// columns on an existing row, never inserts, never touches any other
// table. The tool's "Save to database" button now does this directly;
// "Copy SQL" is kept alongside it for anyone who still wants the
// equivalent statement for their own records.
//
// v31: the print-area-calibrator.html tool (previously a local-only file)
// is now served directly by this worker at GET /admin/calibrator, so it
// can be opened as a plain bookmarked URL from any browser rather than
// needing the local file re-shared. Gated by HTTP Basic Auth
// (env.CALIBRATOR_PASSWORD -- new required secret, set it in the
// dashboard) rather than the normal Bearer session auth used everywhere
// else in this file: a bare browser navigation can't attach a custom
// Authorization header, but the browser's native Basic Auth popup works
// from a simple GET with zero JS/header wrangling. The HTML itself is
// embedded base64-encoded in IDENTITY_CALIBRATOR_HTML_B64 (avoids any
// escaping conflict between the tool's own template literals and this
// file's) and decoded UTF-8-safe at request time -- verified byte-for-
// byte round-trip against the original file before deploying.
//
// v30 fix (still in effect): compositeMockup() sizes the canvas to the
// real photo's dimensions (template.image_width/image_height, populated
// by the calibrator) instead of a hardcoded 800x800 square, and uses
// preserveAspectRatio="meet" (never crops) -- fixes the "mush" bug where
// non-square garment photos were being aggressively cropped.
//
// v29 fix (still in effect): identityBaseUrl() strips any trailing slash
// from env.BASE_URL, fixing a double-slash in generated preview/asset
// URLs that would have 404'd.
//
// All 11 archetypes have a render function. ONE R2 binding, env.R2 --
// fonts, identity concepts/mockups, and garment photography (mock-up/...
// prefix) all live in the same bucket. The account's other R2 bucket
// (artist product photos, legacy music, live storefronts) is
// deliberately not touched by this worker.
//
// Access model: bucket never made public at the Cloudflare level. Draft
// concepts only reachable via GET /identity/preview/:key (owner-auth-
// gated); selected identities copied to brands/{id}/public/, served via
// the open GET /assets/:key (also allowlists mock-up/ for garment
// photos). Requires the R2 binding (var name "R2") and now also
// CALIBRATOR_PASSWORD (plain env var or secret, your choice) for the
// new admin tool route.
//
// Print placement: generate()/mockup() accept an optional `placement`
// field ("front_chest" | "pocket" | "back", defaults to front_chest).
// ================================================================

export default {
  async fetch(request, env) {
    // ───── CORS ──────────────────────────────────────────────────
    const requestOrigin = request.headers.get("Origin") || "";
    let allowedOrigin = "https://zvakho.co.zw";
    if (requestOrigin) {
      try {
        const { hostname } = new URL(requestOrigin);
        if (
          hostname === "zvakho.co.zw" ||
          hostname === "www.zvakho.co.zw" ||
          hostname.endsWith(".zvakho.co.zw")
        ) {
          allowedOrigin = requestOrigin;
        }
      } catch {}
    }

    const cors = {
      "Access-Control-Allow-Origin": allowedOrigin,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Vary": "Origin"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    // ───── HELPERS ──────────────────────────────────────────────
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

    const jsonResponse = json;

    // ───── PAYMENT HELPERS ─────────────────────────────────────
    function formatZimPhone(phone) {
      if (!phone) return "";
      let cleaned = String(phone).replace(/\D/g, "");
      if (cleaned.startsWith("263")) cleaned = "0" + cleaned.slice(3);
      return cleaned;
    }

    function sanitizeId(value) {
      return String(value || "GENERAL").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    }

    function parsePaynowResponse(text) {
      const result = {};
      if (!text) return result;
      text.split("&").forEach((pair) => {
        const [k, v] = pair.split("=");
        if (!k) return;
        result[decodeURIComponent(k).toLowerCase()] = decodeURIComponent(v || "");
      });
      return result;
    }

    async function generateHash(fields, key) {
      let str = "";
      Object.keys(fields).forEach((k) => {
        if (k !== "hash") str += fields[k];
      });
      str += key;
      const buf = await crypto.subtle.digest("SHA-512", new TextEncoder().encode(str));
      return [...new Uint8Array(buf)]
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
        .toUpperCase();
    }

    function corsHeaders() {
      return {
        "Access-Control-Allow-Origin": allowedOrigin,
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      };
    }

    // ───── AUTH ──────────────────────────────────────────────────
    function normalizeEmail(value) {
      return String(value || "").trim().toLowerCase();
    }

    function getBearerToken(request) {
      const header = request.headers.get("Authorization") || "";
      if (!header.toLowerCase().startsWith("bearer ")) return "";
      return header.slice(7).trim();
    }

    function randomToken(bytes = 32) {
      const array = new Uint8Array(bytes);
      crypto.getRandomValues(array);
      return bufferToBase64Url(array.buffer);
    }

    function bufferToBase64Url(buffer) {
      const bytes = new Uint8Array(buffer);
      let binary = "";
      for (const byte of bytes) binary += String.fromCharCode(byte);
      return btoa(binary)
        .replaceAll("+", "-")
        .replaceAll("/", "_")
        .replaceAll("=", "");
    }

    async function sha256(value) {
      const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
      return bufferToBase64Url(digest);
    }

    async function hashPassword(password, salt) {
      const keyMaterial = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(password),
        "PBKDF2",
        false,
        ["deriveBits"]
      );
      const bits = await crypto.subtle.deriveBits(
        {
          name: "PBKDF2",
          salt: new TextEncoder().encode(salt),
          iterations: 100000,
          hash: "SHA-256"
        },
        keyMaterial,
        256
      );
      return bufferToBase64Url(bits);
    }

    function timingSafeEqual(a, b) {
      const left = String(a || "");
      const right = String(b || "");
      if (left.length !== right.length) return false;
      let result = 0;
      for (let i = 0; i < left.length; i++) {
        result |= left.charCodeAt(i) ^ right.charCodeAt(i);
      }
      return result === 0;
    }

    async function verifyPassword(password, salt, expectedHash) {
      const actualHash = await hashPassword(password, salt);
      return timingSafeEqual(actualHash, expectedHash);
    }

    function publicUser(user) {
      return {
        user_id: user.user_id,
        email: user.email,
        name: user.name || "",
        role: user.role,
        brand_id: user.brand_id || ""
      };
    }

    function canViewOwnerDashboard(user) {
      const role = String(user?.role || "").toLowerCase();
      return ["owner", "admin", "fulfilment_staff"].includes(role);
    }

    function canUpdateFulfilment(user) {
      const role = String(user?.role || "").toLowerCase();
      return ["owner", "admin", "fulfilment_staff"].includes(role);
    }

    async function authenticateRequest(request, env) {
      const token = getBearerToken(request);
      if (!token) return { ok: false, status: 401, message: "Missing Authorization token" };

      const tokenHash = await sha256(token);
      const session = await env.DB.prepare(
        `
        SELECT
          s.session_id,
          s.expires_at,
          s.revoked_at,
          u.user_id,
          u.email,
          u.name,
          u.role,
          u.brand_id,
          u.is_active,
          u.email_verified
        FROM sessions s
        INNER JOIN users u ON u.user_id = s.user_id
        WHERE s.token_hash = ?
        LIMIT 1
      `
      )
        .bind(tokenHash)
        .first();

      if (!session) return { ok: false, status: 401, message: "Invalid session" };
      if (session.revoked_at) return { ok: false, status: 401, message: "Session revoked" };
      if (Number(session.is_active) !== 1) return { ok: false, status: 403, message: "User is inactive" };
      if (Number(session.email_verified) !== 1) return { ok: false, status: 403, message: "Email not verified" };
      if (new Date(session.expires_at).getTime() <= Date.now())
        return { ok: false, status: 401, message: "Session expired" };

      await env.DB.prepare(`UPDATE sessions SET last_seen_at = datetime('now') WHERE session_id = ?`)
        .bind(session.session_id)
        .run();

      return {
        ok: true,
        user: {
          user_id: session.user_id,
          email: session.email,
          name: session.name,
          role: session.role,
          brand_id: session.brand_id
        },
        session_id: session.session_id
      };
    }

    // ───── RESEND EMAIL HELPERS ──────────────────────────────
    // Updated: accept optional fromAddress (must end with @zvakho.co.zw)
    async function sendResendEmail(env, to, subject, html, text = "", fromAddress = "noreply@zvakho.co.zw") {
      if (!env.RESEND_API_KEY) {
        console.warn("RESEND_API_KEY not set – email not sent.");
        return { success: false, error: "Missing API key" };
      }
      // Ensure the fromAddress is valid (must end with @zvakho.co.zw)
      if (!fromAddress.endsWith("@zvakho.co.zw")) {
        console.warn(`Invalid from address: ${fromAddress} – defaulting to noreply@zvakho.co.zw`);
        fromAddress = "noreply@zvakho.co.zw";
      }
      const from = `ZVAKHO <${fromAddress}>`;
      const payload = {
        from,
        to: [to],
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, "")
      };
      try {
        const resp = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${env.RESEND_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });
        const data = await resp.json();
        if (!resp.ok) {
          console.error("Resend error:", data);
          return { success: false, error: data.message || "Email sending failed" };
        }
        return { success: true, data };
      } catch (error) {
        console.error("Resend fetch error:", error);
        return { success: false, error: error.message };
      }
    }

    function generateOTP() {
      return Math.floor(100000 + Math.random() * 900000).toString();
    }

    function generateEmailToken() {
      return randomToken(32);
    }

    // ───── NEW: SIGNUP ──────────────────────────────────────────
    async function handleSignup(request, env) {
      let body;
      try { body = await request.json(); } catch { return jsonResponse({ status: "error", message: "Invalid JSON" }, 400); }

      const email = normalizeEmail(body.email);
      const password = String(body.password || "");
      const name = String(body.name || "").trim();
      const tosAccepted = body.tos_accepted ? 1 : 0;
      const marketingConsent = body.marketing_consent ? 1 : 0;

      if (!email) return jsonResponse({ status: "error", message: "Missing email" }, 400);
      if (password.length < 8)
        return jsonResponse({ status: "error", message: "Password must be at least 8 characters" }, 400);
      if (!tosAccepted)
        return jsonResponse({ status: "error", message: "You must accept the Terms & Conditions" }, 400);

      // Check if user already exists
      const existing = await env.DB.prepare(
        `SELECT user_id FROM users WHERE LOWER(email) = LOWER(?)`
      ).bind(email).first();
      if (existing) return jsonResponse({ status: "error", message: "Email already registered" }, 400);

      // Create user
      const userId = uid("USER");
      const salt = randomToken(24);
      const passwordHash = await hashPassword(password, salt);
      const verificationToken = generateEmailToken();
      const unsubscribeToken = randomToken(16);
      const tosVersion = "3.0";

      await env.DB.prepare(
        `INSERT INTO users (
          user_id, email, name, password_hash, password_salt,
          email_verified, verification_token, unsubscribe_token,
          is_active, role, marketing_consent,
          tos_accepted_at, tos_version,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, 0, ?, ?, 1, 'user', ?, datetime('now'), ?, datetime('now'), datetime('now'))`
      ).bind(
        userId, email, name, passwordHash, salt,
        verificationToken, unsubscribeToken,
        marketingConsent,
        tosVersion
      ).run();

      // Send verification email (from noreply)
      const verifyLink = `${env.APP_DOMAIN}/api/auth/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;
      const html = `
        <h2>Welcome to ZVAKHO!</h2>
        <p>Please verify your email address by clicking the link below:</p>
        <p><a href="${verifyLink}">Verify Email</a></p>
        <p>This link expires in 24 hours.</p>
        <p>If you didn't sign up, please ignore this email.</p>
      `;
      await sendResendEmail(env, email, "Verify your ZVAKHO account", html, "", "noreply@zvakho.co.zw");

      return jsonResponse({
        status: "success",
        message: "Account created. Please check your email to verify."
      });
    }

    // ───── SEND OTP ─────────────────────────────────────────────
    async function handleSendOTP(request, env) {
      let body;
      try { body = await request.json(); } catch { return jsonResponse({ status: "error", message: "Invalid JSON" }, 400); }

      const email = normalizeEmail(body.email);
      if (!email) return jsonResponse({ status: "error", message: "Missing email" }, 400);

      // Check user exists
      const user = await env.DB.prepare(
        `SELECT user_id FROM users WHERE LOWER(email) = LOWER(?)`
      ).bind(email).first();
      if (!user) return jsonResponse({ status: "error", message: "User not found" }, 404);

      const otp = generateOTP();
      const expiresAt = new Date(Date.now() + 1000 * 60 * 30).toISOString(); // 30 min
      const otpId = uid("OTP");

      // Store OTP
      await env.DB.prepare(
        `INSERT INTO otps (otp_id, email, otp_code, expires_at) VALUES (?, ?, ?, ?)`
      ).bind(otpId, email, otp, expiresAt).run();

      // Send email (from noreply)
      const html = `
        <h2>Your ZVAKHO verification code</h2>
        <p>Enter the code below to verify your email:</p>
        <div style="font-size:32px;font-weight:bold;letter-spacing:6px;background:#f0f0f0;padding:16px;border-radius:8px;">${otp}</div>
        <p>This code expires in 30 minutes.</p>
      `;
      await sendResendEmail(env, email, "Your ZVAKHO OTP code", html, "", "noreply@zvakho.co.zw");

      return jsonResponse({ status: "success", message: "OTP sent", otp_id: otpId });
    }

    // ───── VERIFY OTP ───────────────────────────────────────────
    async function handleVerifyOTP(request, env) {
      let body;
      try { body = await request.json(); } catch { return jsonResponse({ status: "error", message: "Invalid JSON" }, 400); }

      const email = normalizeEmail(body.email);
      const otp = String(body.otp_code || "").trim();
      if (!email || !otp) return jsonResponse({ status: "error", message: "Missing email or OTP" }, 400);

      // Find valid, unused OTP
      const record = await env.DB.prepare(
        `SELECT otp_id, expires_at FROM otps 
         WHERE email = ? AND otp_code = ? AND verified = 0
         ORDER BY created_at DESC LIMIT 1`
      ).bind(email, otp).first();

      if (!record) return jsonResponse({ status: "error", message: "Invalid or expired OTP" }, 400);
      if (new Date(record.expires_at).getTime() <= Date.now()) {
        return jsonResponse({ status: "error", message: "OTP expired" }, 400);
      }

      // Mark OTP used
      await env.DB.prepare(`UPDATE otps SET verified = 1 WHERE otp_id = ?`).bind(record.otp_id).run();
      // Mark user verified
      await env.DB.prepare(`UPDATE users SET email_verified = 1 WHERE LOWER(email) = LOWER(?)`).bind(email).run();

      return jsonResponse({ status: "success", message: "Email verified successfully" });
    }

    // ───── VERIFY EMAIL (via link token) ──────────────────────
    async function handleVerifyEmailLink(request, env) {
      const url = new URL(request.url);
      const token = url.searchParams.get("token");
      const email = url.searchParams.get("email");

      if (!token || !email) {
        return jsonResponse({ status: "error", message: "Missing token or email" }, 400);
      }

      const user = await env.DB.prepare(
        `SELECT user_id, verification_token FROM users WHERE LOWER(email) = LOWER(?) AND email_verified = 0`
      ).bind(email).first();

      if (!user) return jsonResponse({ status: "error", message: "User not found or already verified" }, 404);
      if (user.verification_token !== token) {
        return jsonResponse({ status: "error", message: "Invalid verification token" }, 400);
      }

      // Mark verified, clear token
      await env.DB.prepare(
        `UPDATE users SET email_verified = 1, verification_token = NULL WHERE user_id = ?`
      ).bind(user.user_id).run();

      // Redirect to frontend with success message
      return new Response(null, {
        status: 302,
        headers: {
          "Location": `${env.FRONTEND_URL || "https://zvakho.co.zw"}/verified.html`,
          ...cors
        }
      });
    }

    // ───── RESEND VERIFICATION EMAIL ──────────────────────────
    async function handleResendVerification(request, env) {
      let body;
      try { body = await request.json(); } catch { return jsonResponse({ status: "error", message: "Invalid JSON" }, 400); }

      const email = normalizeEmail(body.email);
      if (!email) return jsonResponse({ status: "error", message: "Missing email" }, 400);

      const user = await env.DB.prepare(
        `SELECT user_id, verification_token FROM users WHERE LOWER(email) = LOWER(?) AND email_verified = 0`
      ).bind(email).first();

      if (!user) return jsonResponse({ status: "error", message: "User not found or already verified" }, 404);

      // Generate new token if missing
      let token = user.verification_token;
      if (!token) {
        token = generateEmailToken();
        await env.DB.prepare(
          `UPDATE users SET verification_token = ? WHERE user_id = ?`
        ).bind(token, user.user_id).run();
      }

      const verifyLink = `${env.APP_DOMAIN}/api/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`;
      const html = `
        <h2>Verify your ZVAKHO account</h2>
        <p>Click the link below to verify your email:</p>
        <p><a href="${verifyLink}">Verify Email</a></p>
        <p>This link expires in 24 hours.</p>
      `;
      await sendResendEmail(env, email, "Verify your ZVAKHO account", html, "", "noreply@zvakho.co.zw");

      return jsonResponse({ status: "success", message: "Verification email sent" });
    }

    // ───── ORDER CONFIRMATION EMAIL ──────────────────────────
    async function sendOrderConfirmation(env, email, orderDetails) {
      const { orderId, amount, items, brandName } = orderDetails;
      const html = `
        <h2>✅ Order Confirmed</h2>
        <p>Your order #${orderId} has been confirmed.</p>
        <p><strong>Total:</strong> $${amount}</p>
        <p><strong>Artist:</strong> ${brandName}</p>
        <p>We'll notify you when it's ready.</p>
      `;
      // Use support@ for order confirmations (or you can use noreply)
      await sendResendEmail(env, email, `Your ZVAKHO order #${orderId} is confirmed`, html, "", "support@zvakho.co.zw");
    }

    // ───── RE-ENGAGEMENT EMAIL (MARKETING) ──────────────────
    async function sendReengagementEmail(env, email, brandName) {
      // Check consent first
      const user = await env.DB.prepare(
        `SELECT marketing_consent, unsubscribe_token FROM users WHERE LOWER(email) = LOWER(?)`
      ).bind(email).first();
      if (!user || user.marketing_consent !== 1) return; // skip if no consent

      const unsubscribeLink = `https://${env.APP_DOMAIN.replace(/^https?:\/\//, '')}/unsubscribe?email=${encodeURIComponent(email)}&token=${user.unsubscribe_token}`;

      const html = `
        <h2>👋 It's been a while</h2>
        <p>Hi ${brandName || 'Artist'},</p>
        <p>We noticed you haven't had any sales lately. Let's get you back on track.</p>
        <p><a href="https://zvakho.co.zw/dashboard">View your store</a></p>
        <hr style="margin:24px 0; border-color:#444;">
        <p style="font-size:12px; color:#888;">
          You're receiving this because you opted in at ZVAKHO.<br>
          <a href="${unsubscribeLink}">Unsubscribe</a> from marketing emails.
        </p>
      `;
      // Use marketing@ for re-engagement
      await sendResendEmail(env, email, 'How to boost your ZVAKHO sales', html, "", "marketing@zvakho.co.zw");
    }

    // ───── WELCOME EMAIL (MARKETING) ─────────────────────────
    async function sendWelcomeEmail(env, email, name) {
      // Check consent – welcome is marketing, so we check
      const user = await env.DB.prepare(
        `SELECT marketing_consent FROM users WHERE LOWER(email) = LOWER(?)`
      ).bind(email).first();
      if (!user || user.marketing_consent !== 1) return;

      const html = `
        <h2>🎉 Welcome to ZVAKHO!</h2>
        <p>Hi ${name || 'there'},</p>
        <p>You're now part of the ZVAKHO community. Start selling your music and merchandise.</p>
        <p><a href="https://zvakho.co.zw/dashboard">Go to your dashboard</a></p>
      `;
      // Use marketing@ for welcome emails
      await sendResendEmail(env, email, 'Welcome to ZVAKHO!', html, "", "marketing@zvakho.co.zw");
    }

    // ───── UNSUBSCRIBE ENDPOINT ──────────────────────────────
    async function handleUnsubscribe(request, env) {
      const url = new URL(request.url);
      const email = normalizeEmail(url.searchParams.get('email'));
      const token = url.searchParams.get('token');

      if (!email || !token) {
        return new Response('Missing email or token.', { status: 400 });
      }

      const user = await env.DB.prepare(
        `SELECT user_id, unsubscribe_token FROM users WHERE LOWER(email) = LOWER(?)`
      ).bind(email).first();

      if (!user) {
        return new Response('User not found.', { status: 404 });
      }

      if (user.unsubscribe_token !== token) {
        return new Response('Invalid unsubscribe token.', { status: 400 });
      }

      // Update consent to 0
      await env.DB.prepare(
        `UPDATE users SET marketing_consent = 0 WHERE user_id = ?`
      ).bind(user.user_id).run();

      // Log consent change (optional)
      try {
        await env.DB.prepare(
          `INSERT INTO consent_audit (audit_id, user_id, action, source, created_at)
           VALUES (?, ?, 'revoked', 'unsubscribe', datetime('now'))`
        ).bind(uid('AUD'), user.user_id).run();
      } catch (e) { /* ignore if table doesn't exist */ }

      return new Response(`
        <!DOCTYPE html>
        <html>
          <head><title>Unsubscribed — ZVAKHO</title></head>
          <body style="font-family: sans-serif; background: #0b0b0b; color: #f5f1ea; display:grid; place-items:center; min-height:100vh; margin:0; padding:24px;">
            <div style="background:#1c1814; padding:40px; border-radius:16px; max-width:480px; text-align:center; border:1px solid #333;">
              <h1 style="color:#d4a574;">✅ Unsubscribed</h1>
              <p style="color:#a89e91;">You have been unsubscribed from ZVAKHO marketing emails.</p>
              <p style="color:#766c62; font-size:13px;">You can re-subscribe in your account settings at any time.</p>
              <a href="/" style="color:#d4a574; display:inline-block; margin-top:16px;">← Back to ZVAKHO</a>
            </div>
          </body>
        </html>
      `, {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      });
    }

    // ───── GOOGLE OAUTH HELPERS ───────────────────────────────
    function generateCodeVerifier() {
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      return bufferToBase64Url(array.buffer);
    }

    async function generateCodeChallenge(verifier) {
      const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
      return bufferToBase64Url(digest);
    }

    function generateState() {
      return randomToken(16);
    }

    // ───── OAUTH HANDLERS ──────────────────────────────────────
    async function handleGoogleAuth(request, env) {
      const url = new URL(request.url);
      const redirect = url.searchParams.get("redirect") || env.FRONTEND_URL || "https://zvakho.co.zw/dashboard";

      const state = generateState();
      const verifier = generateCodeVerifier();
      const challenge = await generateCodeChallenge(verifier);

      const stateCookie = `oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`;
      const verifierCookie = `oauth_verifier=${verifier}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`;
      const redirectCookie = `oauth_redirect=${encodeURIComponent(redirect)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`;

      const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
      authUrl.searchParams.set("client_id", env.GOOGLE_CLIENT_ID);
      authUrl.searchParams.set("redirect_uri", `${env.APP_DOMAIN}/api/auth/google/callback`);
      authUrl.searchParams.set("response_type", "code");
      authUrl.searchParams.set("scope", "openid email profile");
      authUrl.searchParams.set("state", state);
      authUrl.searchParams.set("code_challenge", challenge);
      authUrl.searchParams.set("code_challenge_method", "S256");
      authUrl.searchParams.set("access_type", "offline");
      authUrl.searchParams.set("prompt", "consent");

      return new Response(null, {
        status: 302,
        headers: {
          "Location": authUrl.toString(),
          "Set-Cookie": [stateCookie, verifierCookie, redirectCookie],
          ...cors
        }
      });
    }

    async function handleGoogleCallback(request, env) {
      const url = new URL(request.url);
      const code = url.searchParams.get("code");
      const state = url.searchParams.get("state");

      if (!code || !state) {
        return json({ error: "Missing code or state" }, 400);
      }

      const cookieHeader = request.headers.get("Cookie") || "";
      const cookies = Object.fromEntries(
        cookieHeader.split("; ").filter(Boolean).map(c => {
          const [k, ...v] = c.split("=");
          return [k, v.join("=")];
        })
      );

      const storedState = cookies.oauth_state || "";
      const storedVerifier = cookies.oauth_verifier || "";
      const storedRedirect = cookies.oauth_redirect ? decodeURIComponent(cookies.oauth_redirect) : (env.FRONTEND_URL || "https://zvakho.co.zw/dashboard");

      if (!storedState || storedState !== state) {
        return json({ error: "Invalid state" }, 400);
      }

      if (!storedVerifier) {
        return json({ error: "Missing verifier" }, 400);
      }

      const tokenUrl = "https://oauth2.googleapis.com/token";
      const tokenRes = await fetch(tokenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: env.GOOGLE_CLIENT_ID,
          client_secret: env.GOOGLE_CLIENT_SECRET,
          redirect_uri: `${env.APP_DOMAIN}/api/auth/google/callback`,
          grant_type: "authorization_code",
          code_verifier: storedVerifier
        })
      });
      const tokenData = await tokenRes.json();
      if (tokenData.error) {
        console.error("Token exchange error:", tokenData);
        return json({ error: "Failed to exchange code" }, 400);
      }

      const accessToken = tokenData.access_token;

      const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const userInfo = await userInfoRes.json();
      if (!userInfo.email) {
        return json({ error: "Failed to get user info" }, 400);
      }

      const email = normalizeEmail(userInfo.email);
      const name = userInfo.name || userInfo.given_name || "Google User";

      let user = await env.DB.prepare(
        `SELECT user_id, email, name, role, brand_id, is_active, email_verified FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1`
      )
        .bind(email)
        .first();

      if (!user) {
        // Create new user – Google verified email, so set email_verified=1
        const userId = uid("USER");
        const unsubscribeToken = randomToken(16);
        await env.DB.prepare(
          `INSERT INTO users (user_id, email, name, role, is_active, email_verified, unsubscribe_token, created_at, updated_at)
           VALUES (?, ?, ?, 'user', 1, 1, ?, datetime('now'), datetime('now'))`
        )
          .bind(userId, email, name, unsubscribeToken)
          .run();

        user = await env.DB.prepare(
          `SELECT user_id, email, name, role, brand_id, is_active, email_verified FROM users WHERE user_id = ?`
        )
          .bind(userId)
          .first();
      }

      if (Number(user.is_active) !== 1) {
        return json({ error: "User is inactive" }, 403);
      }

      // If for some reason email_verified is 0 (shouldn't happen for Google), set it to 1
      if (Number(user.email_verified) !== 1) {
        await env.DB.prepare(`UPDATE users SET email_verified = 1 WHERE user_id = ?`).bind(user.user_id).run();
      }

      const token = randomToken(32);
      const tokenHash = await sha256(token);
      const sessionId = `SESSION_${Date.now()}_${randomToken(10)}`;
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();

      await env.DB.prepare(
        `
        INSERT INTO sessions (session_id, user_id, token_hash, expires_at, created_at, last_seen_at, revoked_at)
        VALUES (?, ?, ?, ?, datetime('now'), datetime('now'), NULL)
      `
      )
        .bind(sessionId, user.user_id, tokenHash, expiresAt)
        .run();

      const cookieDomain = env.SESSION_COOKIE_DOMAIN || "";
      const cookie = `zvakho_session=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=2592000${cookieDomain ? `; Domain=${cookieDomain}` : ""}`;

      const clearCookies = [
        "oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0",
        "oauth_verifier=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0",
        "oauth_redirect=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0"
      ];

      return new Response(null, {
        status: 302,
        headers: {
          "Location": storedRedirect,
          "Set-Cookie": [cookie, ...clearCookies],
          ...cors
        }
      });
    }

    // ───── AUTH HANDLERS ─────────────────────────────────────
    async function handleSetPassword(request, env) {
      let body;
      try { body = await request.json(); } catch { return jsonResponse({ status: "error", message: "Invalid JSON body" }, 400); }

      const setupKey = String(body.setup_key || "").trim();
      const allowedSetupKey = env.AUTH_SETUP_KEY || env.OWNER_DASHBOARD_KEY || "";
      if (allowedSetupKey && setupKey !== allowedSetupKey)
        return jsonResponse({ status: "error", message: "Unauthorized" }, 401);

      const email = normalizeEmail(body.email);
      const password = String(body.password || "");
      if (!email) return jsonResponse({ status: "error", message: "Missing email" }, 400);
      if (password.length < 8)
        return jsonResponse({ status: "error", message: "Password must be at least 8 characters" }, 400);

      const user = await env.DB.prepare(
        `SELECT user_id, email, name, role, brand_id, is_active FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1`
      )
        .bind(email)
        .first();
      if (!user) return jsonResponse({ status: "error", message: "User not found" }, 404);
      if (Number(user.is_active) !== 1) return jsonResponse({ status: "error", message: "User is inactive" }, 403);

      const salt = randomToken(24);
      const passwordHash = await hashPassword(password, salt);
      await env.DB.prepare(
        `UPDATE users SET password_hash = ?, password_salt = ?, updated_at = datetime('now') WHERE user_id = ?`
      )
        .bind(passwordHash, salt, user.user_id)
        .run();

      return jsonResponse({ status: "success", message: "Password set successfully", user: publicUser(user) });
    }

    async function handleLogin(request, env) {
      let body;
      try { body = await request.json(); } catch { return jsonResponse({ status: "error", message: "Invalid JSON body" }, 400); }

      const email = normalizeEmail(body.email);
      const password = String(body.password || "");
      if (!email || !password) return jsonResponse({ status: "error", message: "Missing email or password" }, 400);

      const user = await env.DB.prepare(
        `
        SELECT user_id, email, name, role, brand_id, password_hash, password_salt, is_active, email_verified
        FROM users
        WHERE LOWER(email) = LOWER(?)
        LIMIT 1
      `
      )
        .bind(email)
        .first();

      if (!user || Number(user.is_active) !== 1)
        return jsonResponse({ status: "error", message: "Invalid login" }, 401);
      if (Number(user.email_verified) !== 1)
        return jsonResponse({ status: "error", message: "Please verify your email before logging in." }, 403);
      if (!user.password_hash || !user.password_salt || user.password_hash === "TEMP_HASH")
        return jsonResponse({ status: "error", message: "Password has not been set for this account" }, 403);

      const valid = await verifyPassword(password, user.password_salt, user.password_hash);
      if (!valid) return jsonResponse({ status: "error", message: "Invalid login" }, 401);

      const token = randomToken(32);
      const tokenHash = await sha256(token);
      const sessionId = `SESSION_${Date.now()}_${randomToken(10)}`;
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();

      await env.DB.prepare(
        `
        INSERT INTO sessions (session_id, user_id, token_hash, expires_at, created_at, last_seen_at, revoked_at)
        VALUES (?, ?, ?, ?, datetime('now'), datetime('now'), NULL)
      `
      )
        .bind(sessionId, user.user_id, tokenHash, expiresAt)
        .run();

      return jsonResponse({ status: "success", token, expires_at: expiresAt, user: publicUser(user) });
    }

    async function handleMe(request, env) {
      const auth = await authenticateRequest(request, env);
      if (!auth.ok) return jsonResponse({ status: "error", message: auth.message }, auth.status || 401);
      return jsonResponse({ status: "success", user: publicUser(auth.user) });
    }

    async function handleLogout(request, env) {
      const token = getBearerToken(request);
      if (!token) return jsonResponse({ status: "success", message: "Already logged out" });
      const tokenHash = await sha256(token);
      await env.DB.prepare(
        `UPDATE sessions SET revoked_at = datetime('now'), last_seen_at = datetime('now') WHERE token_hash = ? AND revoked_at IS NULL`
      )
        .bind(tokenHash)
        .run();

      const headers = {
        ...cors,
        "Set-Cookie": `zvakho_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0${env.SESSION_COOKIE_DOMAIN ? `; Domain=${env.SESSION_COOKIE_DOMAIN}` : ""}`
      };
      return jsonResponse({ status: "success", message: "Logged out" }, 200, 0, headers);
    }

    // ================================================================
    // BRAND RESOLUTION -- replaces the hardcoded ARTISTS object.
    // Accepts a brand_id, a brand_slug, or a legacy artist_id (the 3
    // real artists' old IDs -- MDUSEVAN/VUSAMANGENA/ABSOLL -- are already
    // embedded in shared WhatsApp links and social bios that can't be
    // reached and changed, so this path stays supported permanently,
    // not just during a migration window).
    // ================================================================
    async function resolveBrand(env, identifier) {
      if (!identifier) return null;
      const raw = String(identifier).trim();

      let brand = await env.DB.prepare(
        `SELECT * FROM brands WHERE brand_id = ? AND deleted_at IS NULL LIMIT 1`
      ).bind(raw).first();
      if (brand) return brand;

      brand = await env.DB.prepare(
        `SELECT * FROM brands WHERE LOWER(brand_slug) = LOWER(?) AND deleted_at IS NULL LIMIT 1`
      ).bind(raw).first();
      if (brand) return brand;

      // Legacy artist_id -- case-insensitive since old links/QR codes may
      // have been generated with inconsistent casing over time.
      brand = await env.DB.prepare(
        `SELECT * FROM brands WHERE brand_id = UPPER(?) AND deleted_at IS NULL LIMIT 1`
      ).bind(raw).first();
      if (brand) return brand;

      // Final fallback: env-configurable default store (was hardcoded to
      // "MDUSEVAN" in the old normalizeArtistId() -- kept as a behavior,
      // but now a deploy-time setting instead of baked into the code).
      const cleaned = raw.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
      if (!cleaned || cleaned === "WWW" || cleaned === "ZVAKHO") {
        const defaultId = env.DEFAULT_BRAND_ID || "";
        if (defaultId) return await resolveBrand(env, defaultId);
      }
      return null;
    }

    function publicBrand(brand) {
      if (!brand) return null;
      return {
        brand_id: brand.brand_id,
        slug: brand.brand_slug,
        brand_name: brand.brand_name,
        status: brand.store_status,
        whatsapp_store_link: brand.whatsapp_number
          ? `https://wa.me/${String(brand.whatsapp_number).replace(/\D/g, "")}`
          : ""
      };
    }

    // ───── SAVE ORDER ITEMS ─────────────────────────────────────
    async function saveOrderItems(env, options) {
      const {
        orderId,
        paymentReference,
        fallbackBrandId,
        fallbackProductId,
        fallbackProductName,
        fallbackProductType,
        fallbackQuantity,
        fallbackUnitPrice,
        items
      } = options;

      let saved = 0;
      for (let index = 0; index < items.length; index++) {
        const item = items[index] || {};
        const productId = String(item.product_id || fallbackProductId || "").trim();
        const variantId = String(item.variant_id || "").trim();
        const brandId = String(item.artist_id || fallbackBrandId || "").trim();
        const productName = String(item.product_name || fallbackProductName || "Product").trim();
        const productType = String(item.product_type || fallbackProductType || "item").trim();
        const color = String(item.color || "").trim();
        const sizeCode = String(item.size_code || "").trim();
        const sizeLabel = String(item.size_label || "").trim();
        const quantity = Math.max(1, Number(item.quantity || fallbackQuantity || 1));
        const unitPrice = Number(item.unit_price ?? fallbackUnitPrice ?? 0);
        const lineTotal = Number(item.line_total ?? quantity * unitPrice);

        if (!productId || !brandId || !productName || !productType) continue;

        // Snapshot the owner's commission at the moment of sale: retail
        // (unit_price) minus base_cost (ZVAKHO's manufacturing cost+margin,
        // already baked in). Snapshotted here permanently — never
        // recomputed later from a catalog price that may have changed.
        // Digital/music products have no base_cost; they keep the
        // existing 80/20 split, computed separately in the dashboard.
        let baseCost = 0;
        try {
          const productRow = await env.DB.prepare(
            `SELECT base_cost FROM products WHERE product_id = ?`
          ).bind(productId).first();
          baseCost = Number(productRow?.base_cost || 0);
        } catch {}
        const ownerCommission = productType === "music" || productType === "digital"
          ? lineTotal * 0.8
          : Math.max(0, lineTotal - baseCost * quantity);

        const itemId = `${paymentReference}_${index + 1}_${sanitizeId(productId).slice(0, 32)}`;
        await env.DB.prepare(
          `
          INSERT OR REPLACE INTO order_items (
            item_id, order_id, payment_reference, brand_id, product_id, variant_id,
            product_name, product_type, color, size_code, size_label,
            quantity, unit_price, line_total, base_cost, owner_commission,
            fulfilment_status, stock_deducted,
            created_at, updated_at
          )
          VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'not_started', 0, datetime('now'), datetime('now')
          )
        `
        )
          .bind(
            itemId,
            orderId,
            paymentReference,
            brandId,
            productId,
            variantId,
            productName,
            productType,
            color,
            sizeCode,
            sizeLabel,
            quantity,
            unitPrice,
            lineTotal,
            baseCost,
            ownerCommission
          )
          .run();
        saved++;
      }
      return saved;
    }

    // ───── MANYCHAT NOTIFICATION ──────────────────────────────
    async function notifyManyChat(env, { phone, productName, brandName, reference, amount, customMessage }) {
      try {
        if (!env.MANYCHAT_API_TOKEN || !phone) return;
        let cleaned = String(phone).replace(/\D/g, "");
        if (cleaned.startsWith("0")) cleaned = "263" + cleaned.slice(1);
        if (cleaned.length < 10) return;

        const findRes = await fetch(`https://api.manychat.com/fb/subscriber/findByPhone?phone=%2B${cleaned}`, {
          headers: { Authorization: `Bearer ${env.MANYCHAT_API_TOKEN}`, "Content-Type": "application/json" }
        });
        if (!findRes.ok) return;
        const findData = await findRes.json();
        const subscriberId = findData?.data?.id;
        if (!subscriberId) return;

        if (customMessage) {
          await fetch("https://api.manychat.com/fb/sending/sendMessage", {
            method: "POST",
            headers: { Authorization: `Bearer ${env.MANYCHAT_API_TOKEN}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              subscriber_id: subscriberId,
              messages: [{ text: customMessage }]
            })
          });
        } else {
          await fetch("https://api.manychat.com/fb/sending/sendFlow", {
            method: "POST",
            headers: { Authorization: `Bearer ${env.MANYCHAT_API_TOKEN}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              subscriber_id: subscriberId,
              flow_ns: "content20260531175501_037112",
              data: [
                { field_name: "order_product", field_value: String(productName || "") },
                { field_name: "order_reference", field_value: String(reference || "") },
                { field_name: "order_amount", field_value: String(amount || "") },
                { field_name: "artist_name", field_value: String(brandName || "") }
              ]
            })
          });
        }
      } catch {}
    }

    // ───── SHIPPING LABEL GENERATION ──────────────────────────
    async function generateShippingLabel(request, env, user, orderId) {
      try {
        let order;
        if (user.role === 'admin' || user.role === 'owner') {
          order = await env.DB.prepare(`
            SELECT * FROM orders WHERE order_id = ?
          `).bind(orderId).first();
        } else {
          order = await env.DB.prepare(`
            SELECT * FROM orders WHERE order_id = ? AND brand_id = ?
          `).bind(orderId, user.brand_id).first();
        }

        if (!order) {
          return jsonResponse({ error: 'Order not found' }, 404);
        }

        if (order.payment_status !== 'paid') {
          return jsonResponse({ error: 'Order not paid' }, 400);
        }

        if (order.fulfilment_status === 'shipped') {
          return jsonResponse({ error: 'Already shipped' }, 400);
        }

        const trackingNumber = 'ZVK-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();

        await env.DB.prepare(`
          UPDATE orders 
          SET tracking_number = ?,
              shipping_carrier = 'ZVAKHO Express',
              fulfilment_status = 'shipped',
              updated_at = datetime('now')
          WHERE order_id = ?
        `).bind(trackingNumber, orderId).run();

        await env.DB.prepare(`
          UPDATE order_items 
          SET fulfilment_status = 'shipped', updated_at = datetime('now')
          WHERE order_id = ?
        `).bind(orderId).run();

        const message = `Your order ${order.order_id} has been shipped! Tracking: ${trackingNumber}`;
        await sendFulfillmentNotification(env, order, message);

        return jsonResponse({
          success: true,
          order_id: orderId,
          tracking_number: trackingNumber,
          carrier: 'ZVAKHO Express',
          message: 'Shipping label generated'
        });

      } catch (error) {
        console.error('❌ Shipping label error:', error);
        return jsonResponse({ error: 'Failed to generate shipping label' }, 500);
      }
    }

    async function sendFulfillmentNotification(env, order, message) {
      try {
        await notifyManyChat(env, {
          phone: order.phone,
          productName: order.product_name,
          brandName: order.artist_name,
          reference: order.order_id,
          amount: order.amount,
          customMessage: message
        });
      } catch {}
    }

    // ───── HELPER: GET DOWNLOAD URL ────────────────────────────
    async function getDownloadUrl(env, productId) {
      try {
        if (!productId) return null;
        const product = await env.DB.prepare(
          `SELECT file_url, product_type FROM products WHERE product_id = ?`
        ).bind(productId).first();
        if (product && (product.product_type === 'music' || product.product_type === 'digital')) {
          return product.file_url || null;
        }
      } catch {}
      return null;
    }

    // ───── HANDLE CREATE PAYMENT ──────────────────────────────
    async function handleCreatePayment(request, env) {
      let body;
      try { body = await request.json(); } catch { return jsonResponse({ status: "error", message: "Invalid JSON body" }, 400); }

      const quantity = Number(body.quantity || body.order_quantity || 1);
      const unitPrice = Number(body.unit_price || 0);
      const deliveryFee = Number(body.delivery_fee || 0);
      const totalAmount = Number(body.total_amount || body.order_total || 0);

      const userId = String(body.user_id || body.mc_contact_id || "");
      const brandIdentifier = String(body.brand_id || body.artist_id || "");
      const productId = String(body.product_id || "");
      const productName = String(body.product_name || body.order_product || "");
      const trackFile = String(body.track_file || body.current_track_file || "");
      const orderType = String(body.order_type || "music_purchase");
      const deliveryMethod = String(body.delivery_method || "digital");
      const currency = String(body.currency || "USD");
      const platform = String(body.platform || "zvakho");

      const phone = formatZimPhone(body.phone || body.customer_phone || "");
      const email = String(body.email || body.customer_email || "");
      const items = Array.isArray(body.items) ? body.items : [];

      const shipping_address = String(body.shipping_address || "").trim();
      const shipping_city = String(body.shipping_city || "").trim();
      const shipping_province = String(body.shipping_province || "").trim();
      const shipping_postal_code = String(body.shipping_postal_code || "").trim();
      const shipping_country = String(body.shipping_country || "Zimbabwe").trim();

      if (!totalAmount || totalAmount <= 0) return jsonResponse({ status: "error", message: "Invalid amount" }, 400);
      if (!phone) return jsonResponse({ status: "error", message: "Missing phone" }, 400);
      if (!email) return jsonResponse({ status: "error", message: "Missing email" }, 400);
      if (!productName) return jsonResponse({ status: "error", message: "Missing product_name" }, 400);
      if (!brandIdentifier) return jsonResponse({ status: "error", message: "Missing brand_id" }, 400);

      const brand = await resolveBrand(env, brandIdentifier);
      if (!brand) return jsonResponse({ status: "error", message: "Invalid brand" }, 400);
      const brandId = brand.brand_id;
      const brandName = brand.brand_name || "";

      // production_method: read from the product being ordered, stamp onto
      // the order as a permanent historical record even if the product's
      // setting changes later. Falls back to 'dtf' (the confirmed
      // workhorse process) if the product lookup misses for any reason.
      let productionMethod = "dtf";
      if (productId) {
        const productRow = await env.DB.prepare(`SELECT print_method FROM products WHERE product_id = ?`).bind(productId).first();
        if (productRow?.print_method) productionMethod = productRow.print_method;
      }

      if (userId) {
        const existing = await env.DB.prepare(
          `
          SELECT payment_reference, poll_url, browser_url
          FROM orders
          WHERE user_id = ? AND brand_id = ? AND product_name = ? AND amount = ? AND payment_status = 'pending'
          LIMIT 1
        `
        )
          .bind(userId, brandId, productName, totalAmount)
          .first();
        if (existing) {
          return jsonResponse({
            status: "success",
            duplicate_blocked: true,
            reference: existing.payment_reference,
            transaction_reference: existing.payment_reference,
            payment_url: existing.browser_url || "",
            poll_url: existing.poll_url || "",
            poll_url_received: Boolean(existing.poll_url),
            payment_status: "pending",
            paynow_status: existing.poll_url ? "Ok" : "Missing poll_url",
            paynow_error: existing.poll_url ? "" : "Existing pending order has no poll_url"
          });
        }
      }

      const safeBrandId = sanitizeId(brandId);
      const reference = `ZVAKHO_${safeBrandId}_${Date.now()}`;
      const baseUrl = env.BASE_URL || "https://zvakho-payments-v2.yasibomedia.workers.dev";

      const fields = {
        resulturl: `${baseUrl}/paynow-result`,
        returnurl: `${baseUrl}/return`,
        reference,
        amount: totalAmount.toFixed(2),
        id: env.PAYNOW_INTEGRATION_ID,
        additionalinfo: `${brandName || brandId} - ${productName} x${quantity}`,
        authemail: email,
        phone,
        method: "ecocash",
        status: "Message"
      };

      const hash = await generateHash(fields, env.PAYNOW_INTEGRATION_KEY);
      const response = await fetch("https://www.paynow.co.zw/interface/remotetransaction", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ ...fields, hash })
      });

      const text = await response.text();
      const parsed = parsePaynowResponse(text);
      const paynowStatus = parsed.status || "";
      const paynowError = parsed.error || "";
      const pollUrl = parsed.pollurl || "";
      const browserUrl = parsed.browserurl || "";

      if (!pollUrl) {
        return jsonResponse(
          {
            status: "error",
            duplicate_blocked: false,
            reference,
            transaction_reference: reference,
            payment_status: "failed",
            paynow_status: paynowStatus,
            paynow_error: paynowError || "Paynow did not return poll_url",
            raw_paynow_response: text
          },
          400
        );
      }

      await env.DB.prepare(
        `
        INSERT INTO orders (
          order_id, user_id, brand_id, artist_name, product_id, product_name, track_file,
          order_type, quantity, unit_price, delivery_fee, amount, currency, platform,
          delivery_method, payment_reference, payment_status, poll_url, browser_url,
          paynow_status, paynow_error, phone,
          shipping_address, shipping_city, shipping_province, shipping_postal_code, shipping_country,
          production_method, fulfilment_status,
          created_at, updated_at
        )
        VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, 'pending',
          datetime('now'), datetime('now')
        )
      `
      )
        .bind(
          reference,
          userId,
          brandId,
          brandName,
          productId,
          productName,
          trackFile,
          orderType,
          quantity,
          unitPrice,
          deliveryFee,
          totalAmount,
          currency,
          platform,
          deliveryMethod,
          reference,
          pollUrl,
          browserUrl,
          paynowStatus,
          paynowError,
          phone,
          shipping_address,
          shipping_city,
          shipping_province,
          shipping_postal_code,
          shipping_country,
          productionMethod
        )
        .run();

      let orderItemsSaved = 0;
      let orderItemsError = "";
      if (items.length > 0) {
        try {
          orderItemsSaved = await saveOrderItems(env, {
            orderId: reference,
            paymentReference: reference,
            fallbackBrandId: brandId,
            fallbackProductId: productId,
            fallbackProductName: productName,
            fallbackProductType: orderType,
            fallbackQuantity: quantity,
            fallbackUnitPrice: unitPrice || totalAmount,
            items
          });
        } catch (err) {
          orderItemsError = err.message || "Failed to save order items";
        }
      }

      return jsonResponse({
        status: "success",
        duplicate_blocked: false,
        reference,
        transaction_reference: reference,
        payment_url: browserUrl || "",
        poll_url: pollUrl,
        poll_url_received: true,
        payment_status: "pending",
        paynow_status: paynowStatus,
        paynow_error: paynowError,
        order_items_saved: orderItemsSaved,
        order_items_error: orderItemsError
      });
    }

    // ───── POLL STATUS ─────────────────────────────────────────
    async function handlePollStatus(request, env) {
      const url = new URL(request.url);
      const reference = url.searchParams.get("reference");
      if (!reference) return jsonResponse({ status: "error", payment_status: "error", message: "Missing reference" }, 400);

      const order = await env.DB.prepare(
        `
        SELECT payment_status, poll_url, paynow_reference, product_name, amount, artist_name,
               COALESCE(phone, '') as phone, product_id, email
        FROM orders
        WHERE payment_reference = ?
        LIMIT 1
      `
      )
        .bind(reference)
        .first();

      if (!order) return jsonResponse({ status: "error", payment_status: "error", reference, message: "Order not found" }, 404);

      // Helper to fetch download URL
      async function getDownloadUrl() {
        try {
          if (!order.product_id) return null;
          const product = await env.DB.prepare(
            `SELECT file_url, product_type FROM products WHERE product_id = ?`
          ).bind(order.product_id).first();
          if (product && (product.product_type === 'music' || product.product_type === 'digital')) {
            return product.file_url || null;
          }
        } catch {}
        return null;
      }

      // If already paid in D1, return download_url as well
      if (order.payment_status === "paid") {
        const download_url = await getDownloadUrl();
        return jsonResponse({
          status: "paid",
          payment_status: "paid",
          source: "d1",
          reference,
          paynow_reference: order.paynow_reference || "",
          download_url
        });
      }

      if (!order.poll_url) {
        return jsonResponse(
          { status: "error", payment_status: "error", source: "d1_no_poll_url", reference, message: "Missing poll_url" },
          400
        );
      }

      const res = await fetch(order.poll_url);
      const text = await res.text();
      const parsed = parsePaynowResponse(text);
      const paynowStatus = String(parsed.status || "").toLowerCase();
      const paynowReference = parsed.paynowreference || parsed.reference || "";

      if (paynowStatus === "paid" || paynowStatus === "awaiting delivery") {
        await env.DB.prepare(
          `
          UPDATE orders
          SET payment_status = 'paid', paynow_reference = ?, paynow_status = ?, paid_at = datetime('now'), updated_at = datetime('now')
          WHERE payment_reference = ?
        `
        )
          .bind(paynowReference, parsed.status || "Paid", reference)
          .run();

        await notifyManyChat(env, {
          phone: order.phone || "",
          productName: order.product_name || "",
          brandName: order.artist_name || "",
          reference,
          amount: order.amount || 0
        });

        // Send order confirmation email if email exists
        if (order.email) {
          await sendOrderConfirmation(env, order.email, {
            orderId: reference,
            amount: order.amount || 0,
            items: [],
            brandName: order.artist_name || ""
          });
        }

        // ZVAKHO produces and fulfils every order, so the admin/fulfilment
        // team needs to know the instant a payment confirms — not just
        // the customer. Fire-and-forget, never blocks the poll response.
        await notifyAdminNewOrder(env, {
          payment_reference: reference,
          artist_name: order.artist_name || "",
          product_name: order.product_name || "",
          amount: order.amount || 0,
          phone: order.phone || ""
        });

        const download_url = await getDownloadUrl();

        return jsonResponse({
          status: "paid",
          payment_status: "paid",
          source: "paynow",
          reference,
          paynow_reference: paynowReference,
          paynow_status: parsed.status || "Paid",
          download_url
        });
      }

      await env.DB.prepare(`UPDATE orders SET paynow_status = ?, updated_at = datetime('now') WHERE payment_reference = ?`)
        .bind(parsed.status || "Pending", reference)
        .run();

      return jsonResponse({
        status: "pending",
        payment_status: "pending",
        source: "paynow",
        reference,
        paynow_status: parsed.status || "Pending"
      });
    }

    // ───── UPDATE FULFILMENT ──────────────────────────────────
    async function handleUpdateFulfilment(request, env) {
      let body;
      try { body = await request.json(); } catch { return jsonResponse({ status: "error", message: "Invalid JSON body" }, 400); }

      const ownerKey = env.OWNER_DASHBOARD_KEY || "";
      const key = String(body.key || "").trim();
      let authUser = null;
      const auth = await authenticateRequest(request, env);
      if (auth.ok) authUser = auth.user;
      else if (ownerKey && key === ownerKey) authUser = { role: "owner", brand_id: "" };
      else return jsonResponse({ status: "error", message: "Unauthorized" }, 401);
      if (!canUpdateFulfilment(authUser)) return jsonResponse({ status: "error", message: "Forbidden" }, 403);

      const paymentReference = String(body.payment_reference || "").trim();
      const itemId = String(body.item_id || "").trim();
      const nextStatus = String(body.fulfilment_status || "").trim().toLowerCase();
      const allowedStatuses = ["not_started", "processing", "ready_for_delivery", "delivered", "cancelled"];
      if (!paymentReference && !itemId) return jsonResponse({ status: "error", message: "Missing payment_reference or item_id" }, 400);
      if (!allowedStatuses.includes(nextStatus))
        return jsonResponse({ status: "error", message: "Invalid fulfilment_status", allowed_statuses: allowedStatuses }, 400);

      let result;
      if (itemId) {
        result = await env.DB.prepare(
          `UPDATE order_items SET fulfilment_status = ?, updated_at = datetime('now') WHERE item_id = ?`
        )
          .bind(nextStatus, itemId)
          .run();
      } else {
        result = await env.DB.prepare(
          `UPDATE order_items SET fulfilment_status = ?, updated_at = datetime('now') WHERE payment_reference = ?`
        )
          .bind(nextStatus, paymentReference)
          .run();
      }
      return jsonResponse({
        status: "success",
        message: "Fulfilment status updated",
        payment_reference: paymentReference,
        item_id: itemId,
        fulfilment_status: nextStatus,
        rows_changed: result?.meta?.changes || 0
      });
    }

    // ───── REVENUE & DASHBOARD HELPERS ────────────────────────
    function normalizeRevenueStreamType(productType, productName) {
      const value = `${productType || ""} ${productName || ""}`.toLowerCase();
      if (value.includes("vip") || value.includes("subscription") || value.includes("member") || value.includes("exclusive access")) return "vip";
      if (value.includes("merch") || value.includes("tshirt") || value.includes("hoodie") || value.includes("cap")) return "merch";
      return "music";
    }

    function emptyRevenueStream(label, splitTerms, payoutBasis) {
      return { label, confirmed_revenue: 0, units_sold: 0, brand_share: 0, zvakho_share: 0, split_terms: splitTerms, payout_basis: payoutBasis };
    }

    function buildRevenueBreakdown(rows) {
      const breakdown = {
        music: emptyRevenueStream("Music Sales", "80% Artist / 20% ZVAKHO from confirmed revenue.", "gross_revenue"),
        vip: emptyRevenueStream("VIP Revenue", "80% Artist / 20% ZVAKHO from confirmed revenue.", "gross_revenue"),
        merch: emptyRevenueStream("Merch Revenue", "Commission = retail price minus ZVAKHO's production cost, snapshotted per sale.", "retail_minus_base_cost")
      };
      let merchBaseCostTotal = 0;
      for (const row of rows || []) {
        const stream = normalizeRevenueStreamType(row.product_type, row.product_name);
        const revenue = Number(row.revenue || 0);
        const units = Number(row.units_sold || 0);
        const ownerCommission = Number(row.owner_commission || 0);
        breakdown[stream].confirmed_revenue += revenue;
        breakdown[stream].units_sold += units;
        if (stream === "merch") {
          breakdown.merch.brand_share = (breakdown.merch.brand_share || 0) + ownerCommission;
          merchBaseCostTotal += Number(row.base_cost_total || 0);
        } else {
          breakdown[stream].brand_share = (breakdown[stream].brand_share || 0) + ownerCommission;
        }
      }
      breakdown.music.zvakho_share = breakdown.music.confirmed_revenue - breakdown.music.brand_share;
      breakdown.vip.zvakho_share = breakdown.vip.confirmed_revenue - breakdown.vip.brand_share;
      breakdown.merch.zvakho_share = merchBaseCostTotal;
      breakdown.merch.gross_revenue = breakdown.merch.confirmed_revenue;
      breakdown.merch.base_cost_total = merchBaseCostTotal;
      breakdown.merch.cost_status = "confirmed";
      breakdown.merch.note = "Commission reflects real catalog base costs at the time of each sale. If this looks off, check that products have a catalog_id/base_cost set.";
      const combinedConfirmedRevenue =
        breakdown.music.confirmed_revenue + breakdown.vip.confirmed_revenue + breakdown.merch.confirmed_revenue;
      const combinedUnits = breakdown.music.units_sold + breakdown.vip.units_sold + breakdown.merch.units_sold;
      const combinedBrandShare = breakdown.music.brand_share + breakdown.vip.brand_share + breakdown.merch.brand_share;
      breakdown.combined = {
        label: "Combined Total",
        confirmed_revenue: combinedConfirmedRevenue,
        units_sold: combinedUnits,
        brand_share: combinedBrandShare,
        zvakho_share: combinedConfirmedRevenue - combinedBrandShare,
        split_terms: "Music/VIP: 80% Artist / 20% ZVAKHO. Merch: retail minus real base cost, snapshotted per sale.",
        payout_basis: "music_vip_gross_plus_merch_commission"
      };
      return breakdown;
    }

    function buildProductPerformance(rows) {
      const map = new Map();
      for (const row of rows || []) {
        const productName = String(row.product_name || "Product").trim() || "Product";
        const stream = normalizeRevenueStreamType(row.product_type, productName);
        const key = `${stream}::${productName}`;
        const revenue = Number(row.revenue || 0);
        const units = Number(row.units_sold || 0);
        const ownerCommission = Number(row.owner_commission || 0);
        if (!map.has(key)) {
          map.set(key, {
            product_name: productName,
            product_type: stream,
            product_type_label: stream === "vip" ? "VIP" : stream === "merch" ? "Merch" : "Music",
            units_sold: 0,
            revenue: 0,
            brand_share: 0,
            zvakho_share: 0,
            split_terms: stream === "merch" ? "Retail minus base cost, snapshotted per sale" : "80% Artist / 20% ZVAKHO",
            payout_basis: stream === "merch" ? "retail_minus_base_cost" : "gross_revenue"
          });
        }
        const current = map.get(key);
        current.units_sold += units;
        current.revenue += revenue;
        current.brand_share += ownerCommission;
        current.zvakho_share = current.revenue - current.brand_share;
      }
      return Array.from(map.values()).sort((a, b) => Number(b.revenue || 0) - Number(a.revenue || 0));
    }

    function buildBrandGuidance(summary, bestProduct, revenueBreakdown = null) {
      const guidance = [];
      const totalSales = Number(summary?.paid_orders || 0);
      const revenue = Number(summary?.total_revenue || 0);
      const pending = Number(summary?.pending_orders || 0);
      const musicRevenue = Number(revenueBreakdown?.music?.confirmed_revenue || 0);
      const vipRevenue = Number(revenueBreakdown?.vip?.confirmed_revenue || 0);
      const merchRevenue = Number(revenueBreakdown?.merch?.confirmed_revenue || 0);
      if (totalSales === 0) guidance.push("No confirmed sales yet. Share your official ZVAKHO purchase link and focus on one clear release.");
      if (revenue > 0 && bestProduct?.product_name) guidance.push(`"${bestProduct.product_name}" is currently your strongest product. Keep directing fans to that offer.`);
      if (musicRevenue > 0 && vipRevenue === 0) guidance.push("Music sales are active. Consider building toward VIP access once you have consistent buyers.");
      if (merchRevenue > 0) guidance.push("Merch revenue is being tracked separately. Final merch payout must be calculated after production, packaging, and fulfilment costs.");
      if (pending > 0) guidance.push("Some transactions are pending. Fans may need to approve the mobile payment prompt.");
      if (totalSales >= 3) guidance.push("You have early traction. Consider preparing a release campaign or preorder structure.");
      if (!guidance.length) guidance.push("Continue promoting your official store link consistently. Revenue visibility improves as confirmed transactions grow.");
      return guidance;
    }

    function buildOwnerGuidance(summary, pendingOrders, brandLeaderboard) {
      const guidance = [];
      const pending = Number(summary?.pending_orders || 0);
      if (pending > 0) guidance.push(`Review ${pending} pending order(s). These may require payment follow-up or support.`);
      if (brandLeaderboard?.length) guidance.push(`Current leading brand: ${brandLeaderboard[0].brand_name}. Use this as a proof case.`);
      guidance.push("Monitor confirmed revenue, pending transactions, and brand performance before expanding product categories.");
      return guidance;
    }

    // ───── ARTIST DASHBOARD ────────────────────────────────────
    async function handleBrandDashboard(request, env) {
      try {
        const url = new URL(request.url);
        const auth = await authenticateRequest(request, env);
        if (!auth.ok) return jsonResponse({ status: "error", message: "Unauthorized" }, 401);
        const authUser = auth.user;
        const role = String(authUser.role || "").toLowerCase();
        let brandId = "";
        if (role === "artist") {
          brandId = authUser.brand_id;
        } else if (role === "owner" || role === "admin") {
          brandId = url.searchParams.get("brand_id") || url.searchParams.get("artist_id") || url.searchParams.get("artist") || env.DEFAULT_BRAND_ID || "";
        } else {
          return jsonResponse({ status: "error", message: "Forbidden" }, 403);
        }
        const brand = await resolveBrand(env, brandId);
        if (!brand) return jsonResponse({ status: "error", message: "Invalid brand_id" }, 400);

        const summary = await env.DB.prepare(
          `
          SELECT
            COUNT(*) as total_orders,
            SUM(CASE WHEN payment_status = 'paid' THEN amount ELSE 0 END) as total_revenue,
            SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END) as paid_orders,
            SUM(CASE WHEN payment_status != 'paid' THEN 1 ELSE 0 END) as pending_orders,
            SUM(CASE WHEN payment_status != 'paid' THEN amount ELSE 0 END) as pending_revenue,
            COUNT(DISTINCT CASE WHEN payment_status = 'paid' THEN user_id END) as unique_buyers
          FROM orders
          WHERE brand_id = ?
        `
        )
          .bind(brand.brand_id)
          .first();

        const today = await env.DB.prepare(
          `
          SELECT
            SUM(CASE WHEN payment_status = 'paid' THEN amount ELSE 0 END) as today_revenue,
            SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END) as today_sales
          FROM orders
          WHERE brand_id = ? AND DATE(created_at) = DATE('now')
        `
        )
          .bind(brand.brand_id)
          .first();

        const sevenDays = await env.DB.prepare(
          `
          SELECT
            SUM(CASE WHEN payment_status = 'paid' THEN amount ELSE 0 END) as revenue_7_days,
            SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END) as sales_7_days
          FROM orders
          WHERE brand_id = ? AND DATE(created_at) >= DATE('now', '-7 days')
        `
        )
          .bind(brand.brand_id)
          .first();

        const recentRaw = await env.DB.prepare(
          `
          SELECT product_name, order_type, amount, payment_status, paynow_status, paynow_reference, created_at, paid_at
          FROM orders
          WHERE brand_id = ?
          ORDER BY created_at DESC
          LIMIT 20
        `
        )
          .bind(brand.brand_id)
          .all();

        const streamSourceRaw = await env.DB.prepare(
          `
          SELECT
            LOWER(COALESCE(oi.product_type, '')) as product_type,
            oi.product_name as product_name,
            SUM(COALESCE(oi.quantity, 1)) as units_sold,
            SUM(COALESCE(oi.line_total, oi.quantity * oi.unit_price, 0)) as revenue,
            SUM(COALESCE(oi.owner_commission, 0)) as owner_commission,
            SUM(COALESCE(oi.base_cost, 0) * COALESCE(oi.quantity, 1)) as base_cost_total
          FROM order_items oi
          INNER JOIN orders o ON o.payment_reference = oi.payment_reference
          WHERE oi.brand_id = ? AND o.payment_status = 'paid'
          GROUP BY LOWER(COALESCE(oi.product_type, '')), oi.product_name

          UNION ALL

          SELECT
            LOWER(COALESCE(o.order_type, '')) as product_type,
            o.product_name as product_name,
            SUM(COALESCE(o.quantity, 1)) as units_sold,
            SUM(COALESCE(o.amount, 0)) as revenue,
            SUM(COALESCE(o.amount, 0) * 0.8) as owner_commission,
            0 as base_cost_total
          FROM orders o
          WHERE o.brand_id = ? AND o.payment_status = 'paid'
            AND NOT EXISTS (SELECT 1 FROM order_items oi WHERE oi.payment_reference = o.payment_reference)
          GROUP BY LOWER(COALESCE(o.order_type, '')), o.product_name
        `
        )
          .bind(brand.brand_id, brand.brand_id)
          .all();

        const streamRows = streamSourceRaw?.results || [];
        const revenueBreakdown = buildRevenueBreakdown(streamRows);
        const productPerformance = buildProductPerformance(streamRows);
        const bestProduct = productPerformance.length ? productPerformance[0] : null;

        const confirmedRevenue = Number(summary?.total_revenue || 0);
        const pendingRevenue = Number(summary?.pending_revenue || 0);
        const musicGross = revenueBreakdown.music.confirmed_revenue;
        const vipGross = revenueBreakdown.vip.confirmed_revenue;
        const merchGross = revenueBreakdown.merch.confirmed_revenue;
        const musicVipGross = musicGross + vipGross;
        const musicVipArtistShare = musicGross * 0.8 + vipGross * 0.8;
        const musicVipZvakhoShare = musicGross * 0.2 + vipGross * 0.2;

        return jsonResponse({
          status: "success",
          auth_mode: "token_only",
          viewer_role: role,
          brand_id: brand.brand_id,
          brand_name: brand.brand_name,
          updated_at: new Date().toISOString(),
          summary: {
            total_orders: Number(summary?.total_orders || 0),
            total_sales: Number(summary?.paid_orders || 0),
            total_revenue: confirmedRevenue,
            paid_orders: Number(summary?.paid_orders || 0),
            pending_orders: Number(summary?.pending_orders || 0),
            pending_revenue: pendingRevenue,
            unique_buyers: Number(summary?.unique_buyers || 0),
            today_revenue: Number(today?.today_revenue || 0),
            today_sales: Number(today?.today_sales || 0),
            revenue_7_days: Number(sevenDays?.revenue_7_days || 0),
            sales_7_days: Number(sevenDays?.sales_7_days || 0)
          },
          revenue_breakdown: revenueBreakdown,
          payout_estimate: {
            model: "music_vip_80_20_plus_merch_real_commission",
            note: "Music/VIP use 80% artist share. Merch commission is retail minus real catalog base cost, snapshotted per sale — not an estimate.",
            confirmed_revenue: confirmedRevenue,
            combined_confirmed_revenue: confirmedRevenue,
            music_vip_confirmed_revenue: musicVipGross,
            merch_gross_revenue: merchGross,
            artist_share_rate_music_vip: 0.8,
            zvakho_share_rate_music_vip: 0.2,
            estimated_artist_share: musicVipArtistShare + revenueBreakdown.merch.brand_share,
            estimated_zvakho_share: musicVipZvakhoShare + revenueBreakdown.merch.zvakho_share,
            merch_commission: revenueBreakdown.merch.brand_share,
            merch_base_cost_total: revenueBreakdown.merch.base_cost_total || 0,
            pending_revenue: pendingRevenue,
            estimated_pending_artist_share: pendingRevenue * 0.8
          },
          best_product: bestProduct,
          recent_sales: recentRaw?.results || [],
          product_performance: productPerformance,
          dashboard_guidance: buildBrandGuidance(summary, bestProduct, revenueBreakdown)
        });
      } catch (err) {
        return jsonResponse({ status: "error", message: err.message || "Artist dashboard error" }, 500);
      }
    }

    // ───── OWNER DASHBOARD ─────────────────────────────────────
    async function handleOwnerDashboard(request, env) {
      try {
        const zeroTrustEmail = request.headers.get("Cf-Access-Authenticated-User-Email");
        if (!zeroTrustEmail) {
          return jsonResponse({ status: "error", message: "Zero Trust authentication required" }, 401);
        }
        const allowedEmails = env.ADMIN_EMAILS ? env.ADMIN_EMAILS.split(",").map(e => e.trim().toLowerCase()) : [];
        if (allowedEmails.length && !allowedEmails.includes(zeroTrustEmail.toLowerCase())) {
          return jsonResponse({ status: "error", message: "Unauthorized" }, 403);
        }

        const auth = await authenticateRequest(request, env);
        if (!auth.ok) return jsonResponse({ status: "error", message: "Bearer token required" }, 401);
        if (!canViewOwnerDashboard(auth.user)) return jsonResponse({ status: "error", message: "Forbidden" }, 403);

        const url = new URL(request.url);
        const key = String(url.searchParams.get("key") || "");
        const ownerKey = env.OWNER_DASHBOARD_KEY || "";
        if (ownerKey && key !== ownerKey) return jsonResponse({ status: "error", message: "Invalid key" }, 401);

        const summary = await env.DB.prepare(
          `
          SELECT
            COUNT(*) as total_orders,
            SUM(CASE WHEN payment_status = 'paid' THEN amount ELSE 0 END) as total_revenue,
            SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END) as paid_orders,
            SUM(CASE WHEN payment_status != 'paid' THEN 1 ELSE 0 END) as pending_orders,
            COUNT(DISTINCT brand_id) as active_brands,
            COUNT(DISTINCT user_id) as unique_customers
          FROM orders
          WHERE brand_id IS NOT NULL
        `
        ).first();

        const today = await env.DB.prepare(
          `
          SELECT
            SUM(CASE WHEN payment_status = 'paid' THEN amount ELSE 0 END) as today_revenue,
            SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END) as today_paid_orders,
            COUNT(*) as today_total_orders
          FROM orders
          WHERE DATE(created_at) = DATE('now')
        `
        ).first();

        const sevenDays = await env.DB.prepare(
          `
          SELECT
            SUM(CASE WHEN payment_status = 'paid' THEN amount ELSE 0 END) as revenue_7_days,
            SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END) as paid_orders_7_days,
            COUNT(*) as total_orders_7_days
          FROM orders
          WHERE DATE(created_at) >= DATE('now', '-7 days')
        `
        ).first();

        const brandLeaderboardRaw = await env.DB.prepare(
          `
          SELECT
            o.brand_id as brand_id,
            b.brand_name,
            COUNT(*) as total_orders,
            SUM(CASE WHEN o.payment_status = 'paid' THEN 1 ELSE 0 END) as paid_orders,
            SUM(CASE WHEN o.payment_status = 'paid' THEN o.amount ELSE 0 END) as revenue,
            SUM(CASE WHEN o.payment_status != 'paid' THEN 1 ELSE 0 END) as pending_orders
          FROM orders o
          LEFT JOIN brands b ON b.brand_id = o.brand_id
          WHERE o.brand_id IS NOT NULL
          GROUP BY o.brand_id
          ORDER BY revenue DESC
        `
        ).all();

        const productLeaderboardRaw = await env.DB.prepare(
          `
          SELECT
            o.brand_id as brand_id,
            b.brand_name,
            o.product_name,
            COUNT(*) as sales_count,
            SUM(o.amount) as revenue
          FROM orders o
          LEFT JOIN brands b ON b.brand_id = o.brand_id
          WHERE o.payment_status = 'paid' AND o.brand_id IS NOT NULL
          GROUP BY o.brand_id, o.product_name
          ORDER BY revenue DESC
          LIMIT 20
        `
        ).all();

        const recentOrdersRaw = await env.DB.prepare(
          `
          SELECT o.payment_reference, o.brand_id, b.brand_name, o.product_name, o.amount, o.payment_status, o.paynow_status, o.created_at, o.paid_at
          FROM orders o
          LEFT JOIN brands b ON b.brand_id = o.brand_id
          WHERE o.brand_id IS NOT NULL
          ORDER BY o.created_at DESC
          LIMIT 30
        `
        ).all();

        const pendingOrdersRaw = await env.DB.prepare(
          `
          SELECT o.payment_reference, o.brand_id, b.brand_name, o.product_name, o.amount, o.payment_status, o.paynow_status, o.created_at
          FROM orders o
          LEFT JOIN brands b ON b.brand_id = o.brand_id
          WHERE o.payment_status != 'paid' AND o.brand_id IS NOT NULL
          ORDER BY o.created_at DESC
          LIMIT 30
        `
        ).all();

        const dailyRevenueRaw = await env.DB.prepare(
          `
          SELECT DATE(created_at) as day,
            SUM(CASE WHEN payment_status = 'paid' THEN amount ELSE 0 END) as revenue,
            SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END) as paid_orders
          FROM orders
          WHERE DATE(created_at) >= DATE('now', '-7 days')
          GROUP BY DATE(created_at)
          ORDER BY day ASC
        `
        ).all();

        const fulfilmentRaw = await env.DB.prepare(
          `
          SELECT
            oi.item_id, oi.payment_reference, oi.order_id, oi.brand_id, b.brand_name, oi.product_id, oi.variant_id,
            oi.product_name, oi.product_type, oi.color, oi.size_code, oi.size_label,
            oi.quantity, oi.unit_price, oi.line_total, oi.fulfilment_status, oi.stock_deducted,
            oi.created_at, oi.updated_at,
            o.payment_status, o.paynow_status, o.amount, o.created_at as order_created_at, o.paid_at
          FROM order_items oi
          LEFT JOIN orders o ON o.payment_reference = oi.payment_reference
          LEFT JOIN brands b ON b.brand_id = oi.brand_id
          ORDER BY oi.created_at DESC
          LIMIT 50
        `
        ).all();

        const brandLeaderboard = brandLeaderboardRaw?.results || [];
        const productLeaderboard = productLeaderboardRaw?.results || [];
        const recent_orders = recentOrdersRaw?.results || [];
        const pending_orders = pendingOrdersRaw?.results || [];
        const fulfilment_items = fulfilmentRaw?.results || [];

        return jsonResponse({
          status: "success",
          platform: "ZVAKHO",
          updated_at: new Date().toISOString(),
          summary: {
            total_orders: Number(summary?.total_orders || 0),
            total_revenue: Number(summary?.total_revenue || 0),
            paid_orders: Number(summary?.paid_orders || 0),
            pending_orders: Number(summary?.pending_orders || 0),
            active_brands: Number(summary?.active_brands || 0),
            unique_customers: Number(summary?.unique_customers || 0),
            today_revenue: Number(today?.today_revenue || 0),
            today_paid_orders: Number(today?.today_paid_orders || 0),
            today_total_orders: Number(today?.today_total_orders || 0),
            revenue_7_days: Number(sevenDays?.revenue_7_days || 0),
            paid_orders_7_days: Number(sevenDays?.paid_orders_7_days || 0),
            total_orders_7_days: Number(sevenDays?.total_orders_7_days || 0)
          },
          brand_leaderboard: brandLeaderboard,
          product_leaderboard: productLeaderboard,
          recent_orders,
          pending_orders,
          fulfilment_items,
          daily_revenue: dailyRevenueRaw?.results || [],
          owner_guidance: buildOwnerGuidance(summary, pending_orders, brandLeaderboard)
        });
      } catch (err) {
        return jsonResponse({ status: "error", message: err.message || "Owner dashboard error" }, 500);
      }
    }

    // ───── ARTIST STORE (DB-driven) ────────────────────────────
    async function handleBrandStoreDB(request, env) {
      const url = new URL(request.url);
      const identifier = String(url.searchParams.get("brand_id") || url.searchParams.get("artist_id") || "").trim();
      if (!identifier) return jsonResponse({ status: "error", message: "Missing brand_id" }, 400);

      const brand = await resolveBrand(env, identifier);
      if (!brand) return jsonResponse({ status: "error", message: "Brand not found" }, 404);

      const rows = await env.DB.prepare(
        `
        SELECT product_id, product_name, price, product_type, main_image_url, file_url, preview_url
        FROM products
        WHERE brand_id = ? AND active = 1
        ORDER BY created_at DESC
      `
      )
        .bind(brand.brand_id)
        .all();

      const products = (rows.results || []).map(p => ({
        product_id: p.product_id,
        product_name: p.product_name,
        product_type: p.product_type,
        description: p.product_type === "music" ? "Delivered instantly after payment" : "Fulfilled after confirmed payment",
        price: Number(p.price || 0),
        price_label: `$${Number(p.price || 0).toFixed(2)}`,
        image_url: p.main_image_url || "",
        main_image_url: p.main_image_url || "",
        file_url: p.file_url || "",
        preview_url: p.preview_url || ""
      }));

      return jsonResponse({ status: "success", brand_id: brand.brand_id, count: products.length, products }, 200, 120);
    }

    // ───── SUBSCRIPTION PLANS ───────────────────────────────────
    // No platform transaction fee. ZVAKHO's margin lives in the catalog
    // base_cost (see product_catalog / catalog_variants), not a % skim on
    // top of the owner's sale. These tiers gate product count, white-label
    // branding, and custom domains only.
    const SUBSCRIPTION_PLANS = {
      free: {
        plan_id: 'free',
        name: 'Free',
        price_monthly: 0,
        price_yearly: 0,
        max_products: 1,
        custom_domain: 0,
        white_label: 0,
        ai_features: 0
      },
      grow: {
        plan_id: 'grow',
        name: 'Grow',
        price_monthly: 8,
        price_yearly: 80,
        max_products: 15,
        custom_domain: 0,
        white_label: 1,
        ai_features: 1
      },
      pro: {
        plan_id: 'pro',
        name: 'Pro',
        price_monthly: 20,
        price_yearly: 200,
        max_products: 9999,
        custom_domain: 1,
        white_label: 1,
        ai_features: 1
      }
    };

    // ───── SUBSCRIPTION HELPERS (using brands table) ──────────
    // Lazy expiry: if a paid plan's current billing period has lapsed and
    // it isn't billing_exempt (demo/founder accounts), it's downgraded to
    // free right here rather than needing a cron. Cheap, correct on every
    // read, and matches the known technical-debt pattern already flagged
    // elsewhere in this codebase (renewal-cron.js) — this avoids repeating it.
    async function getBrandSubscription(env, brandId) {
      const brand = await env.DB.prepare(`
        SELECT brand_id, subscription_plan, subscription_status
        FROM brands
        WHERE brand_id = ?
        LIMIT 1
      `).bind(brandId).first();

      if (!brand) return null;

      const billing = await env.DB.prepare(`
        SELECT status, current_period_end, billing_exempt
        FROM brand_subscriptions
        WHERE brand_id = ?
        LIMIT 1
      `).bind(brandId).first().catch(() => null);

      let planKey = (brand.subscription_plan || 'free').toLowerCase();

      if (billing && !Number(billing.billing_exempt) && planKey !== 'free') {
        const periodEnd = billing.current_period_end ? new Date(billing.current_period_end).getTime() : 0;
        if (periodEnd && periodEnd < Date.now()) {
          await env.DB.prepare(
            `UPDATE brands SET subscription_plan = 'free', subscription_status = 'active', updated_at = datetime('now') WHERE brand_id = ?`
          ).bind(brandId).run();
          await env.DB.prepare(
            `UPDATE brand_subscriptions SET status = 'expired', updated_at = datetime('now') WHERE brand_id = ?`
          ).bind(brandId).run();
          planKey = 'free';
        }
      }

      const plan = SUBSCRIPTION_PLANS[planKey] || SUBSCRIPTION_PLANS.free;

      return {
        ...brand,
        ...plan,
        subscription_plan: planKey,
        status: brand.subscription_status || 'active',
        current_period_end: billing?.current_period_end || null,
        billing_exempt: Boolean(billing?.billing_exempt)
      };
    }

    async function checkSubscriptionFeature(env, brandId, feature) {
      const sub = await getBrandSubscription(env, brandId);
      if (!sub) return false;
      return sub[feature] === 1;
    }

    async function getProductCount(env, brandId) {
      const row = await env.DB.prepare(
        `SELECT COUNT(*) as n FROM products WHERE brand_id = ? AND active = 1`
      ).bind(brandId).first();
      return Number(row?.n || 0);
    }

    // ───── SUBSCRIPTION BILLING (EcoCash push, same pattern as
    // handleCreatePayment — mirrors the Bookings/Store-Payments billing
    // gate already proven on websites.co.zw) ────────────────────
    async function handleSubscriptionPurchase(request, env) {
      const auth = await authenticateRequest(request, env);
      if (!auth.ok) return jsonResponse({ status: "error", message: "Unauthorized" }, 401);

      let body;
      try { body = await request.json(); } catch { return jsonResponse({ status: "error", message: "Invalid JSON body" }, 400); }

      const planKey = String(body.plan || "").toLowerCase().trim();
      const billingCycle = String(body.billing_cycle || "monthly").toLowerCase().trim();
      const phone = formatZimPhone(body.phone || "");
      const email = String(body.email || auth.user.email || "").trim();

      const plan = SUBSCRIPTION_PLANS[planKey];
      if (!plan || planKey === "free") return jsonResponse({ status: "error", message: "Invalid plan for purchase" }, 400);
      if (!phone) return jsonResponse({ status: "error", message: "Missing phone" }, 400);
      if (!email) return jsonResponse({ status: "error", message: "Missing email" }, 400);

      const brand = await resolveBrand(env, auth.user.brand_id);
      if (!brand) return jsonResponse({ status: "error", message: "No brand on this account" }, 400);

      const amount = billingCycle === "yearly" ? plan.price_yearly : plan.price_monthly;
      const reference = `ZVAKHO_SUB_${sanitizeId(brand.brand_id)}_${Date.now()}`;
      const baseUrl = env.BASE_URL || "https://zvakho-workers-universal.yasibomedia.workers.dev";

      const fields = {
        resulturl: `${baseUrl}/paynow-result`,
        returnurl: `${baseUrl}/return`,
        reference,
        amount: amount.toFixed(2),
        id: env.PAYNOW_INTEGRATION_ID,
        additionalinfo: `ZVAKHO ${plan.name} subscription (${billingCycle}) - ${brand.brand_name}`,
        authemail: email,
        phone,
        method: "ecocash",
        status: "Message"
      };

      const hash = await generateHash(fields, env.PAYNOW_INTEGRATION_KEY);
      const response = await fetch("https://www.paynow.co.zw/interface/remotetransaction", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ ...fields, hash })
      });

      const text = await response.text();
      const parsed = parsePaynowResponse(text);
      const pollUrl = parsed.pollurl || "";
      const browserUrl = parsed.browserurl || "";

      if (!pollUrl) {
        return jsonResponse({
          status: "error",
          reference,
          paynow_status: parsed.status || "",
          paynow_error: parsed.error || "Paynow did not return poll_url",
          raw_paynow_response: text
        }, 400);
      }

      await env.DB.prepare(`
        INSERT OR REPLACE INTO brand_subscriptions (
          brand_id, plan, status, billing_cycle, amount, poll_url, browser_url,
          payment_reference, billing_exempt, created_at, updated_at
        ) VALUES (
          ?, ?, 'pending_payment', ?, ?, ?, ?, ?,
          COALESCE((SELECT billing_exempt FROM brand_subscriptions WHERE brand_id = ?), 0),
          COALESCE((SELECT created_at FROM brand_subscriptions WHERE brand_id = ?), datetime('now')),
          datetime('now')
        )
      `).bind(brand.brand_id, planKey, billingCycle, amount, pollUrl, browserUrl, reference, brand.brand_id, brand.brand_id).run();

      return jsonResponse({
        status: "success",
        reference,
        plan: planKey,
        amount,
        billing_cycle: billingCycle,
        payment_url: browserUrl,
        poll_url_received: true,
        payment_status: "pending"
      });
    }

    async function handleSubscriptionPurchaseStatus(request, env) {
      const url = new URL(request.url);
      const reference = url.searchParams.get("reference");
      if (!reference) return jsonResponse({ status: "error", message: "Missing reference" }, 400);

      const sub = await env.DB.prepare(
        `SELECT * FROM brand_subscriptions WHERE payment_reference = ? LIMIT 1`
      ).bind(reference).first();
      if (!sub) return jsonResponse({ status: "error", message: "Subscription payment not found" }, 404);

      if (sub.status === "active") {
        return jsonResponse({ status: "success", payment_status: "paid", plan: sub.plan, current_period_end: sub.current_period_end });
      }

      if (!sub.poll_url) return jsonResponse({ status: "error", message: "Missing poll_url" }, 400);

      const res = await fetch(sub.poll_url);
      const text = await res.text();
      const parsed = parsePaynowResponse(text);
      const paynowStatus = String(parsed.status || "").toLowerCase();

      if (paynowStatus === "paid" || paynowStatus === "awaiting delivery") {
        const cycleDays = sub.billing_cycle === "yearly" ? 365 : 30;
        const periodEnd = new Date(Date.now() + cycleDays * 24 * 60 * 60 * 1000).toISOString();

        await env.DB.prepare(`
          UPDATE brand_subscriptions
          SET status = 'active', current_period_end = ?, updated_at = datetime('now')
          WHERE payment_reference = ?
        `).bind(periodEnd, reference).run();

        await env.DB.prepare(`
          UPDATE brands SET subscription_plan = ?, subscription_status = 'active', updated_at = datetime('now')
          WHERE brand_id = ?
        `).bind(sub.plan, sub.brand_id).run();

        try {
          await env.DB.prepare(`
            INSERT INTO subscription_history (history_id, brand_id, plan, status, max_products, changed_at)
            VALUES (?, ?, ?, 'active', ?, datetime('now'))
          `).bind(uid("SUBH"), sub.brand_id, sub.plan, SUBSCRIPTION_PLANS[sub.plan]?.max_products || null).run();
        } catch {}

        return jsonResponse({ status: "success", payment_status: "paid", plan: sub.plan, current_period_end: periodEnd });
      }

      return jsonResponse({ status: "pending", payment_status: "pending", paynow_status: parsed.status || "Pending" });
    }

    async function handleSubscriptionLimitCheck(request, env) {
      const url = new URL(request.url);
      const identifier = String(url.searchParams.get("brand_id") || "").trim();
      if (!identifier) return jsonResponse({ status: "error", message: "Missing brand_id" }, 400);
      const brand = await resolveBrand(env, identifier);
      if (!brand) return jsonResponse({ status: "error", message: "Brand not found" }, 404);
      const sub = await getBrandSubscription(env, brand.brand_id);
      const plan = sub || SUBSCRIPTION_PLANS.free;
      const currentCount = await getProductCount(env, brand.brand_id);
      const maxProducts = plan.max_products;
      return jsonResponse({
        status: "success",
        brand_id: brand.brand_id,
        plan: plan.plan_id || plan.subscription_plan || "free",
        current_product_count: currentCount,
        max_products: maxProducts,
        can_add_product: currentCount < maxProducts,
        white_label: Boolean(plan.white_label)
      });
    }

    // ───── PRODUCT CATALOG (ZVAKHO's producible blanks) ─────────
    // base_cost already includes blank garment + print + packaging +
    // fulfilment labour + ZVAKHO's manufacturing margin. Owner commission
    // is always retail (products.price) minus this — never a % fee.
    async function handleCatalogList(request, env) {
      const rows = await env.DB.prepare(
        `SELECT catalog_id, product_type, name, base_cost, currency, print_method, active
         FROM product_catalog WHERE active = 1 ORDER BY product_type ASC, name ASC`
      ).all();
      const catalogRows = rows.results || [];
      const catalogIds = catalogRows.map(c => c.catalog_id);
      let variants = [];
      if (catalogIds.length) {
        const placeholders = catalogIds.map(() => "?").join(",");
        const variantRows = await env.DB.prepare(
          `SELECT variant_id, catalog_id, color_name, color_hex, size_code, size_label, cost_adjustment, active
           FROM catalog_variants WHERE catalog_id IN (${placeholders}) AND active = 1`
        ).bind(...catalogIds).all();
        variants = variantRows.results || [];
      }
      const byId = {};
      for (const v of variants) {
        if (!byId[v.catalog_id]) byId[v.catalog_id] = [];
        byId[v.catalog_id].push(v);
      }
      const items = catalogRows.map(c => ({ ...c, variants: byId[c.catalog_id] || [] }));
      return jsonResponse({ status: "success", count: items.length, items });
    }

    async function handleAdminCatalogCreate(request, env) {
      const auth = await authenticateRequest(request, env);
      if (!auth.ok || !canViewOwnerDashboard(auth.user)) return jsonResponse({ status: "error", message: "Forbidden" }, 403);
      let body;
      try { body = await request.json(); } catch { return jsonResponse({ status: "error", message: "Invalid JSON" }, 400); }

      const productType = String(body.product_type || "").trim();
      const name = String(body.name || "").trim();
      const baseCost = Number(body.base_cost);
      const printMethod = String(body.print_method || "dtf").trim();
      if (!productType || !name) return jsonResponse({ status: "error", message: "Missing product_type or name" }, 400);
      if (!baseCost || baseCost <= 0) return jsonResponse({ status: "error", message: "base_cost must be a positive number — this is the real cost sheet, not a placeholder" }, 400);

      const catalogId = uid("CAT");
      await env.DB.prepare(`
        INSERT INTO product_catalog (catalog_id, product_type, name, base_cost, currency, print_method, active, created_at)
        VALUES (?, ?, ?, ?, 'USD', ?, 1, datetime('now'))
      `).bind(catalogId, productType, name, baseCost, printMethod).run();

      const variants = Array.isArray(body.variants) ? body.variants : [];
      for (const v of variants) {
        await env.DB.prepare(`
          INSERT INTO catalog_variants (variant_id, catalog_id, color_name, color_hex, size_code, size_label, cost_adjustment, active, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, 1, datetime('now'))
        `).bind(
          uid("CV"), catalogId,
          String(v.color_name || "").trim(), String(v.color_hex || "").trim(),
          String(v.size_code || "").trim(), String(v.size_label || v.size_code || "").trim(),
          Number(v.cost_adjustment || 0)
        ).run();
      }

      return jsonResponse({ status: "success", catalog_id: catalogId, variants_added: variants.length });
    }

    async function handleAdminCatalogUpdate(request, env) {
      const auth = await authenticateRequest(request, env);
      if (!auth.ok || !canViewOwnerDashboard(auth.user)) return jsonResponse({ status: "error", message: "Forbidden" }, 403);
      let body;
      try { body = await request.json(); } catch { return jsonResponse({ status: "error", message: "Invalid JSON" }, 400); }
      const catalogId = String(body.catalog_id || "").trim();
      if (!catalogId) return jsonResponse({ status: "error", message: "Missing catalog_id" }, 400);

      const fields = [];
      const values = [];
      for (const [col, key] of [["name", "name"], ["base_cost", "base_cost"], ["print_method", "print_method"], ["active", "active"]]) {
        if (body[key] !== undefined) { fields.push(`${col} = ?`); values.push(body[key]); }
      }
      if (!fields.length) return jsonResponse({ status: "error", message: "No fields to update" }, 400);
      values.push(catalogId);
      await env.DB.prepare(`UPDATE product_catalog SET ${fields.join(", ")} WHERE catalog_id = ?`).bind(...values).run();
      return jsonResponse({ status: "success", catalog_id: catalogId });
    }

    // ───── ADMIN NOTIFICATIONS ───────────────────────────────────
    // ZVAKHO is the seller of record and the one who must act on every
    // paid order (produce + fulfil), so the admin/fulfilment team gets
    // pinged the instant a payment confirms — not just the customer.
    async function notifyAdminNewOrder(env, order) {
      try {
        const summary = `New ZVAKHO order paid\nRef: ${order.payment_reference || order.reference}\nBrand: ${order.artist_name || order.brand_name || ""}\nProduct: ${order.product_name || ""}\nAmount: $${order.amount || 0}\nPhone: ${order.phone || ""}`;

        if (env.ADMIN_WHATSAPP_NUMBER) {
          await notifyManyChat(env, {
            phone: env.ADMIN_WHATSAPP_NUMBER,
            customMessage: summary
          });
        }
        if (env.ADMIN_ORDER_EMAIL) {
          await sendResendEmail(
            env,
            env.ADMIN_ORDER_EMAIL,
            `New order — ${order.payment_reference || order.reference}`,
            `<pre style="font-family:monospace;white-space:pre-wrap;">${summary}</pre>`,
            summary,
            "orders@zvakho.co.zw"
          );
        }
      } catch {}
    }

    async function notifyAdminWholesaleInquiry(env, inquiry) {
      try {
        const summary = `New wholesale inquiry\nCompany: ${inquiry.company_name}\nContact: ${inquiry.contact_name} (${inquiry.phone})\nEmail: ${inquiry.email}\nItems: ${inquiry.items_requested}`;
        if (env.ADMIN_WHATSAPP_NUMBER) {
          await notifyManyChat(env, { phone: env.ADMIN_WHATSAPP_NUMBER, customMessage: summary });
        }
        if (env.ADMIN_ORDER_EMAIL) {
          await sendResendEmail(
            env,
            env.ADMIN_ORDER_EMAIL,
            `New wholesale inquiry — ${inquiry.company_name}`,
            `<pre style="font-family:monospace;white-space:pre-wrap;">${summary}</pre>`,
            summary,
            "orders@zvakho.co.zw"
          );
        }
      } catch {}
    }

    // ───── WHOLESALE MANUFACTURING (bulk B2B, manual quote queue —
    // same "wish-list plus manual fulfilment queue" pattern already used
    // for .co.zw domain registration; no automated bulk-pricing engine
    // yet, so a human quotes it, same as domain_wishes) ─────────
    async function handleWholesaleInquiry(request, env) {
      let body;
      try { body = await request.json(); } catch { return jsonResponse({ status: "error", message: "Invalid JSON" }, 400); }

      const companyName = String(body.company_name || "").trim();
      const contactName = String(body.contact_name || "").trim();
      const phone = formatZimPhone(body.phone || "");
      const email = String(body.email || "").trim();
      const items = Array.isArray(body.items) ? body.items : [];
      const notes = String(body.notes || "").trim();

      if (!companyName || !contactName) return jsonResponse({ status: "error", message: "Missing company_name or contact_name" }, 400);
      if (!phone && !email) return jsonResponse({ status: "error", message: "Missing phone or email" }, 400);
      if (!items.length) return jsonResponse({ status: "error", message: "Missing items" }, 400);

      const inquiryId = uid("WHSL");
      const itemsJson = JSON.stringify(items);
      await env.DB.prepare(`
        INSERT INTO wholesale_inquiries (
          inquiry_id, company_name, contact_name, phone, email, items_requested, notes, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'new', datetime('now'), datetime('now'))
      `).bind(inquiryId, companyName, contactName, phone, email, itemsJson, notes).run();

      await notifyAdminWholesaleInquiry(env, { company_name: companyName, contact_name: contactName, phone, email, items_requested: itemsJson });

      return jsonResponse({
        status: "success",
        inquiry_id: inquiryId,
        message: "Inquiry received. Our team will WhatsApp/email you a quote shortly."
      });
    }

    async function handleWholesaleList(request, env) {
      const auth = await authenticateRequest(request, env);
      if (!auth.ok || !canViewOwnerDashboard(auth.user)) return jsonResponse({ status: "error", message: "Forbidden" }, 403);
      const rows = await env.DB.prepare(
        `SELECT * FROM wholesale_inquiries ORDER BY created_at DESC LIMIT 100`
      ).all();
      return jsonResponse({ status: "success", inquiries: rows.results || [] });
    }

    async function handleWholesaleUpdate(request, env) {
      const auth = await authenticateRequest(request, env);
      if (!auth.ok || !canViewOwnerDashboard(auth.user)) return jsonResponse({ status: "error", message: "Forbidden" }, 403);
      let body;
      try { body = await request.json(); } catch { return jsonResponse({ status: "error", message: "Invalid JSON" }, 400); }
      const inquiryId = String(body.inquiry_id || "").trim();
      if (!inquiryId) return jsonResponse({ status: "error", message: "Missing inquiry_id" }, 400);

      const fields = [];
      const values = [];
      for (const [col, key] of [["status", "status"], ["quoted_amount", "quoted_amount"], ["admin_notes", "admin_notes"]]) {
        if (body[key] !== undefined) { fields.push(`${col} = ?`); values.push(body[key]); }
      }
      if (!fields.length) return jsonResponse({ status: "error", message: "No fields to update" }, 400);
      fields.push(`updated_at = datetime('now')`);
      values.push(inquiryId);
      await env.DB.prepare(`UPDATE wholesale_inquiries SET ${fields.join(", ")} WHERE inquiry_id = ?`).bind(...values).run();
      return jsonResponse({ status: "success", inquiry_id: inquiryId });
    }

    // ───── DOMAIN REGISTRATION (Cloudflare Registrar API) ──────
    /**
     * Search for domain name suggestions
     */
    async function searchDomains(query, limit, env) {
      const url = `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/registrar/domain-search`;
      const params = new URLSearchParams({ q: query, limit: limit || 10 });
      const response = await fetch(`${url}?${params}`, {
        headers: {
          'Authorization': `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.errors?.[0]?.message || 'Search failed');
      return data.result?.domains || [];
    }

    /**
     * Check real‑time availability and pricing
     */
    async function checkDomainAvailability(domain, env) {
      const url = `https://api.cloudflare.com/api/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/registrar/domain-check`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ domains: [domain] })
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.errors?.[0]?.message || 'Availability check failed');
      const result = data.result?.domains?.[0];
      if (!result) throw new Error('No result for domain');
      return {
        domain: result.domain,
        available: result.registrable === true,
        registrable: result.registrable,
        tier: result.tier || 'standard',
        price: result.pricing?.registration_cost || null,
        currency: result.pricing?.currency || 'USD',
        reason: result.reason || null
      };
    }

    /**
     * Register a domain via Cloudflare Registrar API
     */
    async function registerDomain(domain, years, autoRenew, env) {
      const check = await checkDomainAvailability(domain, env);
      if (!check.registrable) {
        throw new Error(`Domain is not registrable: ${check.reason || 'unknown reason'}`);
      }
      if (check.tier === 'premium') {
        throw new Error('Premium domains are not supported by the API. Please register via the Cloudflare dashboard.');
      }

      const url = `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/registrar/registrations`;
      const body = {
        domain_name: domain,
        years: years || 1,
        auto_renew: autoRenew || false
      };
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.errors?.[0]?.message || 'Registration failed');
      }
      return {
        registration_id: data.result?.registration_id,
        domain: data.result?.domain_name,
        status: data.result?.status,
        expires_at: data.result?.expires_at,
        auto_renew: data.result?.auto_renew,
        created_at: data.result?.created_at
      };
    }

    /**
     * Add a custom hostname for SSL for SaaS
     */
    async function addCustomHostname(domain, env) {
      const zoneId = env.ZVAKHO_ZONE_ID;
      if (!zoneId) {
        console.warn('⚠️ ZVAKHO_ZONE_ID not set – skipping custom hostname creation.');
        return null;
      }
      const url = `https://api.cloudflare.com/client/v4/zones/${zoneId}/custom_hostnames`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          hostname: domain,
          ssl: { method: 'http', type: 'dv' }
        })
      });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.errors?.[0]?.message || 'Custom hostname creation failed');
      }
      return data.result;
    }

    // ───── DOMAIN HANDLERS ─────────────────────────────────────
    async function handleDomainSearch(request, env) {
      const auth = await authenticateRequest(request, env);
      if (!auth.ok) return jsonResponse({ error: 'Unauthorized' }, 401);
      const url = new URL(request.url);
      const query = url.searchParams.get('q');
      const limit = parseInt(url.searchParams.get('limit')) || 10;
      if (!query) return jsonResponse({ error: 'Missing search query (q)' }, 400);
      try {
        const results = await searchDomains(query, limit, env);
        return jsonResponse({ results });
      } catch (err) {
        return jsonResponse({ error: err.message }, 500);
      }
    }

    async function handleDomainCheck(request, env) {
      const auth = await authenticateRequest(request, env);
      if (!auth.ok) return jsonResponse({ error: 'Unauthorized' }, 401);
      const url = new URL(request.url);
      const domain = url.searchParams.get('domain');
      if (!domain) return jsonResponse({ error: 'Missing domain parameter' }, 400);
      try {
        const result = await checkDomainAvailability(domain, env);
        return jsonResponse(result);
      } catch (err) {
        return jsonResponse({ error: err.message }, 500);
      }
    }

    async function handleDomainRegister(request, env) {
      const auth = await authenticateRequest(request, env);
      if (!auth.ok) return jsonResponse({ error: 'Unauthorized' }, 401);
      const body = await request.json();
      const { domain, years = 1, auto_renew = false } = body;
      if (!domain) return jsonResponse({ error: 'Missing domain' }, 400);

      // Check subscription plan allows custom domain
      const hasFeature = await checkSubscriptionFeature(env, auth.user.brand_id, 'custom_domain');
      if (!hasFeature) {
        return jsonResponse({ error: 'Your current plan does not support custom domains. Upgrade to Grow or Pro.' }, 403);
      }

      const existing = await env.DB.prepare(
        `SELECT domain_id FROM domains WHERE domain_name = ? AND brand_id = ?`
      ).bind(domain, auth.user.brand_id).first();
      if (existing) return jsonResponse({ error: 'Domain already registered for this brand' }, 400);

      try {
        const regResult = await registerDomain(domain, years, auto_renew, env);
        let hostnameResult = null;
        try {
          hostnameResult = await addCustomHostname(domain, env);
        } catch (err) {
          console.error('Custom hostname error:', err);
        }

        const domainId = uid('DOM');
        await env.DB.prepare(`
          INSERT INTO domains (domain_id, brand_id, domain_name, status, is_primary, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        `).bind(domainId, auth.user.brand_id, domain, 'active', 0).run();

        return jsonResponse({
          success: true,
          domain_id: domainId,
          domain: regResult.domain,
          registration_id: regResult.registration_id,
          status: regResult.status,
          expires_at: regResult.expires_at,
          auto_renew: regResult.auto_renew,
          ssl_status: hostnameResult ? 'provisioning' : 'not_configured',
          message: 'Domain registered successfully' + (hostnameResult ? '; SSL certificate provisioning started.' : '; SSL for SaaS not configured (zone ID missing).')
        });
      } catch (err) {
        return jsonResponse({ error: err.message }, 500);
      }
    }

    async function handleDomainList(request, env) {
      const auth = await authenticateRequest(request, env);
      if (!auth.ok) return jsonResponse({ error: 'Unauthorized' }, 401);
      const rows = await env.DB.prepare(
        `SELECT * FROM domains WHERE brand_id = ? ORDER BY created_at DESC`
      ).bind(auth.user.brand_id).all();
      return jsonResponse({ domains: rows.results || [] });
    }

    async function handleDomainRemove(request, env) {
      const auth = await authenticateRequest(request, env);
      if (!auth.ok) return jsonResponse({ error: 'Unauthorized' }, 401);
      const body = await request.json();
      const { domain_id } = body;
      if (!domain_id) return jsonResponse({ error: 'Missing domain_id' }, 400);

      const domain = await env.DB.prepare(
        `SELECT domain_name FROM domains WHERE domain_id = ? AND brand_id = ?`
      ).bind(domain_id, auth.user.brand_id).first();
      if (!domain) return jsonResponse({ error: 'Domain not found' }, 404);

      await env.DB.prepare(`DELETE FROM domains WHERE domain_id = ?`).bind(domain_id).run();
      return jsonResponse({
        success: true,
        message: 'Domain removed from your ZVAKHO dashboard. The domain registration at Cloudflare remains active.'
      });
    }

    // ───── SUBSCRIPTION HANDLERS ───────────────────────────────
    async function handleSubscriptionPlans(request, env) {
      const plans = Object.values(SUBSCRIPTION_PLANS);
      return jsonResponse({ plans });
    }

    async function handleSubscriptionCurrent(request, env) {
      const auth = await authenticateRequest(request, env);
      if (!auth.ok) return jsonResponse({ error: 'Unauthorized' }, 401);
      const sub = await getBrandSubscription(env, auth.user.brand_id);
      if (!sub) {
        return jsonResponse({ hasSubscription: false });
      }
      return jsonResponse({ hasSubscription: true, subscription: sub });
    }

    // ── Print Area Calibrator (internal tool, not part of the identity
    // API) -- served as a static page at /admin/calibrator, gated by HTTP
    // Basic Auth (env.CALIBRATOR_PASSWORD) rather than the normal Bearer
    // session auth, specifically so it can be opened as a plain bookmarked
    // URL in a browser -- a bare navigation can't attach a custom
    // Authorization: Bearer header, but the browser's native Basic Auth
    // login popup works from a simple GET with no JS/header wrangling.
    // HTML is embedded base64-encoded (avoids any escaping issues with the
    // tool's own template literals / backticks) and decoded UTF-8-safe at
    // request time.
    const IDENTITY_CALIBRATOR_HTML_B64 =
      "PCFET0NUWVBFIGh0bWw+CjxodG1sIGxhbmc9ImVuIj4KPGhlYWQ+CjxtZXRhIGNoYXJzZXQ9IlVURi04Ij4KPHRpdGxlPlpWQUtITyDigJQgUHJpbnQgQXJl" +
      "YSBDYWxpYnJhdG9yPC90aXRsZT4KPHN0eWxlPgogIDpyb290IHsKICAgIC0tYmc6ICMxMjEyMTI7CiAgICAtLXBhbmVsOiAjMWExYTFhOwogICAgLS1wYW5l" +
      "bC1ib3JkZXI6ICMyYzJjMmM7CiAgICAtLWluazogI2YwZWRlNjsKICAgIC0taW5rLWRpbTogIzlhOTU4YTsKICAgIC0tYWNjZW50OiAjZThjNTQ3OwogICAg" +
      "LS1hY2NlbnQtZGltOiAjNGE0MzI2OwogICAgLS16b25lLWxpbmU6ICNlOGM1NDc7CiAgICAtLW1vbm86ICdTRiBNb25vJywgJ0pldEJyYWlucyBNb25vJywg" +
      "dWktbW9ub3NwYWNlLCBNZW5sbywgQ29uc29sYXMsIG1vbm9zcGFjZTsKICAgIC0tc2FuczogLWFwcGxlLXN5c3RlbSwgJ0ludGVyJywgJ0hlbHZldGljYSBO" +
      "ZXVlJywgQXJpYWwsIHNhbnMtc2VyaWY7CiAgfQogICogeyBib3gtc2l6aW5nOiBib3JkZXItYm94OyB9CiAgYm9keSB7CiAgICBtYXJnaW46IDA7IGJhY2tn" +
      "cm91bmQ6IHZhcigtLWJnKTsgY29sb3I6IHZhcigtLWluayk7CiAgICBmb250LWZhbWlseTogdmFyKC0tc2Fucyk7IG1pbi1oZWlnaHQ6IDEwMHZoOyBwYWRk" +
      "aW5nOiAyOHB4OwogIH0KICBoMSB7CiAgICBmb250LXNpemU6IDE1cHg7IGZvbnQtd2VpZ2h0OiA2MDA7IGxldHRlci1zcGFjaW5nOiAwLjA2ZW07IHRleHQt" +
      "dHJhbnNmb3JtOiB1cHBlcmNhc2U7CiAgICBjb2xvcjogdmFyKC0tYWNjZW50KTsgbWFyZ2luOiAwIDAgNHB4OwogIH0KICAuc3ViIHsgY29sb3I6IHZhcigt" +
      "LWluay1kaW0pOyBmb250LXNpemU6IDEzcHg7IG1hcmdpbjogMCAwIDI0cHg7IG1heC13aWR0aDogNjQwcHg7IGxpbmUtaGVpZ2h0OiAxLjU7IH0KICAubGF5" +
      "b3V0IHsgZGlzcGxheTogZ3JpZDsgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiAxZnIgMzQwcHg7IGdhcDogMjBweDsgYWxpZ24taXRlbXM6IHN0YXJ0OyB9CiAg" +
      "QG1lZGlhIChtYXgtd2lkdGg6IDg2MHB4KSB7IC5sYXlvdXQgeyBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IDFmcjsgfSB9CgogIC5wYW5lbCB7IGJhY2tncm91" +
      "bmQ6IHZhcigtLXBhbmVsKTsgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tcGFuZWwtYm9yZGVyKTsgYm9yZGVyLXJhZGl1czogMTBweDsgcGFkZGluZzogMThw" +
      "eDsgfQogIC5jYW52YXMtd3JhcCB7CiAgICBwb3NpdGlvbjogcmVsYXRpdmU7IGRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7IGp1c3RpZnkt" +
      "Y29udGVudDogY2VudGVyOwogICAgbWluLWhlaWdodDogNDIwcHg7IGJhY2tncm91bmQ6CiAgICAgIHJlcGVhdGluZy1jb25pYy1ncmFkaWVudCgjMWUxZTFl" +
      "IDAlIDI1JSwgIzE3MTcxNyAwJSA1MCUpIDUwJSAvIDIwcHggMjBweDsKICAgIGJvcmRlci1yYWRpdXM6IDhweDsgb3ZlcmZsb3c6IGhpZGRlbjsKICB9CiAg" +
      "Y2FudmFzIHsgZGlzcGxheTogYmxvY2s7IGN1cnNvcjogY3Jvc3NoYWlyOyBtYXgtd2lkdGg6IDEwMCU7IH0KICAuZW1wdHktc3RhdGUgeyBjb2xvcjogdmFy" +
      "KC0taW5rLWRpbSk7IGZvbnQtc2l6ZTogMTNweDsgdGV4dC1hbGlnbjogY2VudGVyOyBwYWRkaW5nOiA0MHB4OyB9CgogIC5maWVsZCB7IG1hcmdpbi1ib3R0" +
      "b206IDE0cHg7IH0KICBsYWJlbCB7IGRpc3BsYXk6IGJsb2NrOyBmb250LXNpemU6IDExcHg7IHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7IGxldHRlci1z" +
      "cGFjaW5nOiAwLjA1ZW07IGNvbG9yOiB2YXIoLS1pbmstZGltKTsgbWFyZ2luLWJvdHRvbTogNnB4OyB9CiAgc2VsZWN0LCBpbnB1dFt0eXBlPXRleHRdIHsK" +
      "ICAgIHdpZHRoOiAxMDAlOyBiYWNrZ3JvdW5kOiAjMGUwZTBlOyBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1wYW5lbC1ib3JkZXIpOyBjb2xvcjogdmFyKC0t" +
      "aW5rKTsKICAgIHBhZGRpbmc6IDlweCAxMHB4OyBib3JkZXItcmFkaXVzOiA2cHg7IGZvbnQtc2l6ZTogMTNweDsgZm9udC1mYW1pbHk6IHZhcigtLXNhbnMp" +
      "OwogIH0KICBzZWxlY3Q6Zm9jdXMsIGlucHV0OmZvY3VzIHsgb3V0bGluZTogbm9uZTsgYm9yZGVyLWNvbG9yOiB2YXIoLS1hY2NlbnQpOyB9CgogIGlucHV0" +
      "W3R5cGU9ZmlsZV0geyBkaXNwbGF5OiBub25lOyB9CiAgLmZpbGUtYnRuIHsKICAgIGRpc3BsYXk6IGJsb2NrOyB0ZXh0LWFsaWduOiBjZW50ZXI7IHBhZGRp" +
      "bmc6IDEwcHg7IGJvcmRlci1yYWRpdXM6IDZweDsKICAgIGJvcmRlcjogMXB4IGRhc2hlZCB2YXIoLS1wYW5lbC1ib3JkZXIpOyBjb2xvcjogdmFyKC0taW5r" +
      "LWRpbSk7IGZvbnQtc2l6ZTogMTNweDsgY3Vyc29yOiBwb2ludGVyOwogICAgbWFyZ2luLWJvdHRvbTogMThweDsgdHJhbnNpdGlvbjogYm9yZGVyLWNvbG9y" +
      "IC4xNXMsIGNvbG9yIC4xNXM7CiAgfQogIC5maWxlLWJ0bjpob3ZlciB7IGJvcmRlci1jb2xvcjogdmFyKC0tYWNjZW50KTsgY29sb3I6IHZhcigtLWFjY2Vu" +
      "dCk7IH0KCiAgLnJlYWRvdXQgewogICAgZm9udC1mYW1pbHk6IHZhcigtLW1vbm8pOyBmb250LXNpemU6IDEycHg7IGJhY2tncm91bmQ6ICMwZTBlMGU7IGJv" +
      "cmRlcjogMXB4IHNvbGlkIHZhcigtLXBhbmVsLWJvcmRlcik7CiAgICBib3JkZXItcmFkaXVzOiA2cHg7IHBhZGRpbmc6IDEycHg7IG1hcmdpbi1ib3R0b206" +
      "IDE2cHg7IGxpbmUtaGVpZ2h0OiAxLjk7CiAgfQogIC5yZWFkb3V0IHNwYW4geyBjb2xvcjogdmFyKC0tYWNjZW50KTsgfQoKICBidXR0b24ucHJpbWFyeSB7" +
      "CiAgICB3aWR0aDogMTAwJTsgYmFja2dyb3VuZDogdmFyKC0tYWNjZW50KTsgY29sb3I6ICMxNDEyMGE7IGJvcmRlcjogbm9uZTsgYm9yZGVyLXJhZGl1czog" +
      "NnB4OwogICAgcGFkZGluZzogMTFweDsgZm9udC1zaXplOiAxM3B4OyBmb250LXdlaWdodDogNjAwOyBjdXJzb3I6IHBvaW50ZXI7IGxldHRlci1zcGFjaW5n" +
      "OiAwLjAyZW07CiAgfQogIGJ1dHRvbi5wcmltYXJ5OmRpc2FibGVkIHsgYmFja2dyb3VuZDogIzMzMzAxZjsgY29sb3I6ICM2YjY1NTI7IGN1cnNvcjogbm90" +
      "LWFsbG93ZWQ7IH0KICBidXR0b24ucHJpbWFyeTpob3Zlcjpub3QoOmRpc2FibGVkKSB7IGZpbHRlcjogYnJpZ2h0bmVzcygxLjA4KTsgfQoKICAubGlzdC1w" +
      "YW5lbCB7IGdyaWQtY29sdW1uOiAxIC8gLTE7IG1hcmdpbi10b3A6IDIwcHg7IH0KICAubGlzdC1oZWFkZXIgeyBkaXNwbGF5OiBmbGV4OyBqdXN0aWZ5LWNv" +
      "bnRlbnQ6IHNwYWNlLWJldHdlZW47IGFsaWduLWl0ZW1zOiBjZW50ZXI7IG1hcmdpbi1ib3R0b206IDEwcHg7IH0KICAubGlzdC1oZWFkZXIgaDIgeyBmb250" +
      "LXNpemU6IDEzcHg7IGZvbnQtd2VpZ2h0OiA2MDA7IGNvbG9yOiB2YXIoLS1pbmspOyBtYXJnaW46IDA7IH0KICAubGlzdC1oZWFkZXIgYnV0dG9uIHsKICAg" +
      "IGJhY2tncm91bmQ6IHRyYW5zcGFyZW50OyBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1wYW5lbC1ib3JkZXIpOyBjb2xvcjogdmFyKC0taW5rLWRpbSk7CiAg" +
      "ICBmb250LXNpemU6IDEycHg7IHBhZGRpbmc6IDZweCAxMnB4OyBib3JkZXItcmFkaXVzOiA2cHg7IGN1cnNvcjogcG9pbnRlcjsKICB9CiAgLmxpc3QtaGVh" +
      "ZGVyIGJ1dHRvbjpob3ZlciB7IGNvbG9yOiB2YXIoLS1hY2NlbnQpOyBib3JkZXItY29sb3I6IHZhcigtLWFjY2VudCk7IH0KICBwcmUjc3FsT3V0IHsKICAg" +
      "IGZvbnQtZmFtaWx5OiB2YXIoLS1tb25vKTsgZm9udC1zaXplOiAxMi41cHg7IGJhY2tncm91bmQ6ICMwZTBlMGU7IGJvcmRlcjogMXB4IHNvbGlkIHZhcigt" +
      "LXBhbmVsLWJvcmRlcik7CiAgICBib3JkZXItcmFkaXVzOiA4cHg7IHBhZGRpbmc6IDE2cHg7IHdoaXRlLXNwYWNlOiBwcmUtd3JhcDsgd29yZC1icmVhazog" +
      "YnJlYWstd29yZDsgbGluZS1oZWlnaHQ6IDEuNzsKICAgIGNvbG9yOiAjYzllNWMwOyBtaW4taGVpZ2h0OiA2MHB4OyBtYXJnaW46IDA7CiAgfQogIC5yb3ct" +
      "aXRlbSB7IGNvbG9yOiB2YXIoLS1pbmstZGltKTsgZm9udC1zaXplOiAxMnB4OyBtYXJnaW4tdG9wOiA4cHg7IH0KICAucm93LWl0ZW0gLmRlbCB7IGNvbG9y" +
      "OiAjYzA2MDVhOyBjdXJzb3I6IHBvaW50ZXI7IG1hcmdpbi1sZWZ0OiA4cHg7IH0KPC9zdHlsZT4KPC9oZWFkPgo8Ym9keT4KCiAgPGgxPlByaW50IEFyZWEg" +
      "Q2FsaWJyYXRvcjwvaDE+CiAgPHAgY2xhc3M9InN1YiI+TG9hZCBhIGdhcm1lbnQgcGhvdG8sIGRyYWcgYSByZWN0YW5nbGUgb3ZlciB0aGUgcHJpbnQgem9u" +
      "ZSwgZmlsbCBpbiB3aGljaCB0ZW1wbGF0ZSByb3cgdGhpcyBpcywgdGhlbiBhZGQgaXQgdG8gdGhlIGxpc3QuIFdoZW4geW91J3JlIGRvbmUgd2l0aCBhbGwg" +
      "eW91ciBwbGFjZW1lbnRzLCBjb3B5IHRoZSBTUUwgYmxvY2sgYXQgdGhlIGJvdHRvbSBhbmQgcnVuIGl0IGluIEQxLjwvcD4KCiAgPGRpdiBjbGFzcz0ibGF5" +
      "b3V0Ij4KICAgIDxkaXYgY2xhc3M9InBhbmVsIj4KICAgICAgPGRpdiBjbGFzcz0iY2FudmFzLXdyYXAiIGlkPSJjYW52YXNXcmFwIj4KICAgICAgICA8ZGl2" +
      "IGNsYXNzPSJlbXB0eS1zdGF0ZSIgaWQ9ImVtcHR5U3RhdGUiPk5vIGltYWdlIGxvYWRlZCB5ZXQg4oCUIGNob29zZSBhIGZpbGUgb24gdGhlIHJpZ2h0Ljwv" +
      "ZGl2PgogICAgICAgIDxjYW52YXMgaWQ9ImNhbnZhcyIgc3R5bGU9ImRpc3BsYXk6bm9uZTsiPjwvY2FudmFzPgogICAgICA8L2Rpdj4KICAgIDwvZGl2PgoK" +
      "ICAgIDxkaXYgY2xhc3M9InBhbmVsIj4KICAgICAgPGxhYmVsIGNsYXNzPSJmaWxlLWJ0biIgZm9yPSJmaWxlSW5wdXQiIGlkPSJmaWxlQnRuTGFiZWwiPkNo" +
      "b29zZSBnYXJtZW50IHBob3Rv4oCmPC9sYWJlbD4KICAgICAgPGlucHV0IHR5cGU9ImZpbGUiIGlkPSJmaWxlSW5wdXQiIGFjY2VwdD0iaW1hZ2UvKiI+Cgog" +
      "ICAgICA8ZGl2IGNsYXNzPSJmaWVsZCI+CiAgICAgICAgPGxhYmVsIGZvcj0idGVtcGxhdGVJZCI+dGVtcGxhdGVfaWQ8L2xhYmVsPgogICAgICAgIDxpbnB1" +
      "dCB0eXBlPSJ0ZXh0IiBpZD0idGVtcGxhdGVJZCIgcGxhY2Vob2xkZXI9IlBUX3RzaGlydF9ibGFja19mcm9udCI+CiAgICAgIDwvZGl2PgogICAgICA8ZGl2" +
      "IGNsYXNzPSJmaWVsZCI+CiAgICAgICAgPGxhYmVsIGZvcj0icHJvZHVjdFR5cGUiPnByb2R1Y3RfdHlwZTwvbGFiZWw+CiAgICAgICAgPGlucHV0IHR5cGU9" +
      "InRleHQiIGlkPSJwcm9kdWN0VHlwZSIgdmFsdWU9InRzaGlydCI+CiAgICAgIDwvZGl2PgogICAgICA8ZGl2IGNsYXNzPSJmaWVsZCI+CiAgICAgICAgPGxh" +
      "YmVsIGZvcj0iZ2FybWVudENvbG9yIj5nYXJtZW50X2NvbG9yPC9sYWJlbD4KICAgICAgICA8c2VsZWN0IGlkPSJnYXJtZW50Q29sb3IiPgogICAgICAgICAg" +
      "PG9wdGlvbiB2YWx1ZT0iYmxhY2siPmJsYWNrPC9vcHRpb24+CiAgICAgICAgICA8b3B0aW9uIHZhbHVlPSJ3aGl0ZSI+d2hpdGU8L29wdGlvbj4KICAgICAg" +
      "ICA8L3NlbGVjdD4KICAgICAgPC9kaXY+CiAgICAgIDxkaXYgY2xhc3M9ImZpZWxkIj4KICAgICAgICA8bGFiZWwgZm9yPSJwbGFjZW1lbnQiPnBsYWNlbWVu" +
      "dF9uYW1lPC9sYWJlbD4KICAgICAgICA8c2VsZWN0IGlkPSJwbGFjZW1lbnQiPgogICAgICAgICAgPG9wdGlvbiB2YWx1ZT0iZnJvbnRfY2hlc3QiPmZyb250" +
      "X2NoZXN0PC9vcHRpb24+CiAgICAgICAgICA8b3B0aW9uIHZhbHVlPSJiYWNrIj5iYWNrPC9vcHRpb24+CiAgICAgICAgICA8b3B0aW9uIHZhbHVlPSJwb2Nr" +
      "ZXQiPnBvY2tldDwvb3B0aW9uPgogICAgICAgIDwvc2VsZWN0PgogICAgICA8L2Rpdj4KCiAgICAgIDxkaXYgY2xhc3M9InJlYWRvdXQiIGlkPSJyZWFkb3V0" +
      "Ij4KICAgICAgICBhcmVhX3g6IDxzcGFuIGlkPSJyeCI+4oCUPC9zcGFuPiU8YnI+CiAgICAgICAgYXJlYV95OiA8c3BhbiBpZD0icnkiPuKAlDwvc3Bhbj4l" +
      "PGJyPgogICAgICAgIGFyZWFfdzogPHNwYW4gaWQ9InJ3Ij7igJQ8L3NwYW4+JTxicj4KICAgICAgICBhcmVhX2g6IDxzcGFuIGlkPSJyaCI+4oCUPC9zcGFu" +
      "PiUKICAgICAgPC9kaXY+CgogICAgICA8YnV0dG9uIGNsYXNzPSJwcmltYXJ5IiBpZD0iYWRkQnRuIiBkaXNhYmxlZD5BZGQgem9uZSB0byBTUUwgbGlzdDwv" +
      "YnV0dG9uPgogICAgPC9kaXY+CgogICAgPGRpdiBjbGFzcz0icGFuZWwgbGlzdC1wYW5lbCI+CiAgICAgIDxkaXYgY2xhc3M9Imxpc3QtaGVhZGVyIj4KICAg" +
      "ICAgICA8aDI+R2VuZXJhdGVkIFNRTCAoPHNwYW4gaWQ9ImNvdW50Ij4wPC9zcGFuPiByb3dzKTwvaDI+CiAgICAgICAgPGRpdiBzdHlsZT0iZGlzcGxheTpm" +
      "bGV4OyBnYXA6OHB4OyI+CiAgICAgICAgICA8YnV0dG9uIGlkPSJjb3B5QnRuIj5Db3B5IFNRTDwvYnV0dG9uPgogICAgICAgICAgPGJ1dHRvbiBpZD0ic2F2" +
      "ZUJ0biIgY2xhc3M9InByaW1hcnkiIHN0eWxlPSJ3aWR0aDphdXRvOyBwYWRkaW5nOjZweCAxNHB4OyI+U2F2ZSB0byBkYXRhYmFzZTwvYnV0dG9uPgogICAg" +
      "ICAgIDwvZGl2PgogICAgICA8L2Rpdj4KICAgICAgPGRpdiBpZD0ic2F2ZVN0YXR1cyIgc3R5bGU9ImZvbnQtc2l6ZToxMnB4OyBjb2xvcjp2YXIoLS1pbmst" +
      "ZGltKTsgbWFyZ2luLWJvdHRvbToxMHB4OyI+PC9kaXY+CiAgICAgIDxwcmUgaWQ9InNxbE91dCI+LS0gTm90aGluZyBhZGRlZCB5ZXQuPC9wcmU+CiAgICAg" +
      "IDxkaXYgaWQ9InJvd0xpc3QiPjwvZGl2PgogICAgPC9kaXY+CiAgPC9kaXY+Cgo8c2NyaXB0PgogIGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1l" +
      "bnRCeUlkKCdjYW52YXMnKTsKICBjb25zdCBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTsKICBjb25zdCBlbXB0eVN0YXRlID0gZG9jdW1lbnQuZ2V0" +
      "RWxlbWVudEJ5SWQoJ2VtcHR5U3RhdGUnKTsKICBjb25zdCBmaWxlSW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmlsZUlucHV0Jyk7CiAgY29u" +
      "c3QgZmlsZUJ0bkxhYmVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZpbGVCdG5MYWJlbCcpOwogIGNvbnN0IGFkZEJ0biA9IGRvY3VtZW50LmdldEVs" +
      "ZW1lbnRCeUlkKCdhZGRCdG4nKTsKCiAgbGV0IGltZyA9IG51bGw7CiAgbGV0IHNjYWxlID0gMTsKICBsZXQgem9uZSA9IG51bGw7IC8vIHt4LHksdyxofSBp" +
      "biBOQVRVUkFMIGltYWdlIHBpeGVscwogIGxldCBkcmFnZ2luZyA9IGZhbHNlOwogIGxldCBkcmFnU3RhcnQgPSBudWxsOwoKICBmaWxlSW5wdXQuYWRkRXZl" +
      "bnRMaXN0ZW5lcignY2hhbmdlJywgKGUpID0+IHsKICAgIGNvbnN0IGZpbGUgPSBlLnRhcmdldC5maWxlc1swXTsKICAgIGlmICghZmlsZSkgcmV0dXJuOwog" +
      "ICAgZmlsZUJ0bkxhYmVsLnRleHRDb250ZW50ID0gZmlsZS5uYW1lOwogICAgY29uc3QgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTsKICAgIHJlYWRlci5v" +
      "bmxvYWQgPSAoZXYpID0+IHsKICAgICAgaW1nID0gbmV3IEltYWdlKCk7CiAgICAgIGltZy5vbmxvYWQgPSAoKSA9PiB7CiAgICAgICAgZW1wdHlTdGF0ZS5z" +
      "dHlsZS5kaXNwbGF5ID0gJ25vbmUnOwogICAgICAgIGNhbnZhcy5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJzsKICAgICAgICBjb25zdCBtYXhXID0gNjQwLCBt" +
      "YXhIID0gNjQwOwogICAgICAgIHNjYWxlID0gTWF0aC5taW4obWF4VyAvIGltZy5uYXR1cmFsV2lkdGgsIG1heEggLyBpbWcubmF0dXJhbEhlaWdodCwgMSk7" +
      "CiAgICAgICAgY2FudmFzLndpZHRoID0gaW1nLm5hdHVyYWxXaWR0aCAqIHNjYWxlOwogICAgICAgIGNhbnZhcy5oZWlnaHQgPSBpbWcubmF0dXJhbEhlaWdo" +
      "dCAqIHNjYWxlOwogICAgICAgIHpvbmUgPSBudWxsOwogICAgICAgIGRyYXcoKTsKICAgICAgfTsKICAgICAgaW1nLnNyYyA9IGV2LnRhcmdldC5yZXN1bHQ7" +
      "CiAgICB9OwogICAgcmVhZGVyLnJlYWRBc0RhdGFVUkwoZmlsZSk7CiAgfSk7CgogIGZ1bmN0aW9uIGRyYXcoKSB7CiAgICBpZiAoIWltZykgcmV0dXJuOwog" +
      "ICAgY3R4LmNsZWFyUmVjdCgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpOwogICAgY3R4LmRyYXdJbWFnZShpbWcsIDAsIDAsIGNhbnZhcy53" +
      "aWR0aCwgY2FudmFzLmhlaWdodCk7CiAgICBpZiAoem9uZSkgewogICAgICBjb25zdCBkeCA9IHpvbmUueCAqIHNjYWxlLCBkeSA9IHpvbmUueSAqIHNjYWxl" +
      "LCBkdyA9IHpvbmUudyAqIHNjYWxlLCBkaCA9IHpvbmUuaCAqIHNjYWxlOwogICAgICBjdHguZmlsbFN0eWxlID0gJ3JnYmEoMjMyLCAxOTcsIDcxLCAwLjE2" +
      "KSc7CiAgICAgIGN0eC5maWxsUmVjdChkeCwgZHksIGR3LCBkaCk7CiAgICAgIGN0eC5zdHJva2VTdHlsZSA9ICcjZThjNTQ3JzsKICAgICAgY3R4LmxpbmVX" +
      "aWR0aCA9IDI7CiAgICAgIGN0eC5zZXRMaW5lRGFzaChbNiwgNV0pOwogICAgICBjdHguc3Ryb2tlUmVjdChkeCwgZHksIGR3LCBkaCk7CiAgICAgIGN0eC5z" +
      "ZXRMaW5lRGFzaChbXSk7CiAgICB9CiAgfQoKICBmdW5jdGlvbiBjYW52YXNQb3MoZSkgewogICAgY29uc3QgcmVjdCA9IGNhbnZhcy5nZXRCb3VuZGluZ0Ns" +
      "aWVudFJlY3QoKTsKICAgIGNvbnN0IGN4ID0gKGUuY2xpZW50WCAtIHJlY3QubGVmdCkgKiAoY2FudmFzLndpZHRoIC8gcmVjdC53aWR0aCk7CiAgICBjb25z" +
      "dCBjeSA9IChlLmNsaWVudFkgLSByZWN0LnRvcCkgKiAoY2FudmFzLmhlaWdodCAvIHJlY3QuaGVpZ2h0KTsKICAgIHJldHVybiB7IHg6IE1hdGgubWF4KDAs" +
      "IE1hdGgubWluKGN4LCBjYW52YXMud2lkdGgpKSwgeTogTWF0aC5tYXgoMCwgTWF0aC5taW4oY3ksIGNhbnZhcy5oZWlnaHQpKSB9OwogIH0KCiAgY2FudmFz" +
      "LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIChlKSA9PiB7CiAgICBpZiAoIWltZykgcmV0dXJuOwogICAgZHJhZ2dpbmcgPSB0cnVlOwogICAgZHJh" +
      "Z1N0YXJ0ID0gY2FudmFzUG9zKGUpOwogIH0pOwogIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCAoZSkgPT4gewogICAgaWYgKCFkcmFn" +
      "Z2luZyB8fCAhaW1nKSByZXR1cm47CiAgICBjb25zdCBwID0gY2FudmFzUG9zKGUpOwogICAgY29uc3QgeDAgPSBNYXRoLm1pbihkcmFnU3RhcnQueCwgcC54" +
      "KSwgeTAgPSBNYXRoLm1pbihkcmFnU3RhcnQueSwgcC55KTsKICAgIGNvbnN0IHcgPSBNYXRoLmFicyhwLnggLSBkcmFnU3RhcnQueCksIGggPSBNYXRoLmFi" +
      "cyhwLnkgLSBkcmFnU3RhcnQueSk7CiAgICB6b25lID0geyB4OiB4MCAvIHNjYWxlLCB5OiB5MCAvIHNjYWxlLCB3OiB3IC8gc2NhbGUsIGg6IGggLyBzY2Fs" +
      "ZSB9OwogICAgZHJhdygpOwogICAgdXBkYXRlUmVhZG91dCgpOwogIH0pOwogIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgKCkgPT4geyBk" +
      "cmFnZ2luZyA9IGZhbHNlOyB9KTsKCiAgZnVuY3Rpb24gdXBkYXRlUmVhZG91dCgpIHsKICAgIGlmICghaW1nIHx8ICF6b25lIHx8IHpvbmUudyA8IDIgfHwg" +
      "em9uZS5oIDwgMikgewogICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncngnKS50ZXh0Q29udGVudCA9ICfigJQnOwogICAgICBkb2N1bWVudC5nZXRF" +
      "bGVtZW50QnlJZCgncnknKS50ZXh0Q29udGVudCA9ICfigJQnOwogICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncncnKS50ZXh0Q29udGVudCA9ICfi" +
      "gJQnOwogICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmgnKS50ZXh0Q29udGVudCA9ICfigJQnOwogICAgICBhZGRCdG4uZGlzYWJsZWQgPSB0cnVl" +
      "OwogICAgICByZXR1cm47CiAgICB9CiAgICBjb25zdCBwY3QgPSAodiwgdG90YWwpID0+ICgodiAvIHRvdGFsKSAqIDEwMCkudG9GaXhlZCgxKTsKICAgIGRv" +
      "Y3VtZW50LmdldEVsZW1lbnRCeUlkKCdyeCcpLnRleHRDb250ZW50ID0gcGN0KHpvbmUueCwgaW1nLm5hdHVyYWxXaWR0aCk7CiAgICBkb2N1bWVudC5nZXRF" +
      "bGVtZW50QnlJZCgncnknKS50ZXh0Q29udGVudCA9IHBjdCh6b25lLnksIGltZy5uYXR1cmFsSGVpZ2h0KTsKICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlk" +
      "KCdydycpLnRleHRDb250ZW50ID0gcGN0KHpvbmUudywgaW1nLm5hdHVyYWxXaWR0aCk7CiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmgnKS50ZXh0" +
      "Q29udGVudCA9IHBjdCh6b25lLmgsIGltZy5uYXR1cmFsSGVpZ2h0KTsKICAgIGFkZEJ0bi5kaXNhYmxlZCA9IGZhbHNlOwogIH0KCiAgY29uc3Qgcm93cyA9" +
      "IFtdOwogIGFkZEJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHsKICAgIGlmICghaW1nIHx8ICF6b25lKSByZXR1cm47CiAgICBjb25zdCB0" +
      "ZW1wbGF0ZUlkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RlbXBsYXRlSWQnKS52YWx1ZS50cmltKCkgfHwgJ1BUX3VudGl0bGVkJzsKICAgIGNvbnN0" +
      "IHByb2R1Y3RUeXBlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Byb2R1Y3RUeXBlJykudmFsdWUudHJpbSgpIHx8ICd0c2hpcnQnOwogICAgY29uc3Qg" +
      "Z2FybWVudENvbG9yID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dhcm1lbnRDb2xvcicpLnZhbHVlOwogICAgY29uc3QgcGxhY2VtZW50ID0gZG9jdW1l" +
      "bnQuZ2V0RWxlbWVudEJ5SWQoJ3BsYWNlbWVudCcpLnZhbHVlOwogICAgY29uc3QgYXggPSAoKHpvbmUueCAvIGltZy5uYXR1cmFsV2lkdGgpICogMTAwKS50" +
      "b0ZpeGVkKDEpOwogICAgY29uc3QgYXkgPSAoKHpvbmUueSAvIGltZy5uYXR1cmFsSGVpZ2h0KSAqIDEwMCkudG9GaXhlZCgxKTsKICAgIGNvbnN0IGF3ID0g" +
      "KCh6b25lLncgLyBpbWcubmF0dXJhbFdpZHRoKSAqIDEwMCkudG9GaXhlZCgxKTsKICAgIGNvbnN0IGFoID0gKCh6b25lLmggLyBpbWcubmF0dXJhbEhlaWdo" +
      "dCkgKiAxMDApLnRvRml4ZWQoMSk7CgogICAgcm93cy5wdXNoKHsgdGVtcGxhdGVJZCwgcHJvZHVjdFR5cGUsIGdhcm1lbnRDb2xvciwgcGxhY2VtZW50LCBh" +
      "eCwgYXksIGF3LCBhaCwgaW1nVzogaW1nLm5hdHVyYWxXaWR0aCwgaW1nSDogaW1nLm5hdHVyYWxIZWlnaHQgfSk7CiAgICByZW5kZXJMaXN0KCk7CiAgfSk7" +
      "CgogIGZ1bmN0aW9uIHJlbmRlckxpc3QoKSB7CiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY291bnQnKS50ZXh0Q29udGVudCA9IHJvd3MubGVuZ3Ro" +
      "OwogICAgY29uc3Qgc3FsID0gcm93cy5tYXAociA9PgogICAgICBgVVBEQVRFIHByaW50X3RlbXBsYXRlcyBTRVQgYXJlYV94ID0gJHtyLmF4fSwgYXJlYV95" +
      "ID0gJHtyLmF5fSwgYXJlYV93ID0gJHtyLmF3fSwgYXJlYV9oID0gJHtyLmFofSwgaW1hZ2Vfd2lkdGggPSAke3IuaW1nV30sIGltYWdlX2hlaWdodCA9ICR7" +
      "ci5pbWdIfVxuICBXSEVSRSB0ZW1wbGF0ZV9pZCA9ICcke3IudGVtcGxhdGVJZH0nO2AKICAgICkuam9pbignXG5cbicpOwogICAgZG9jdW1lbnQuZ2V0RWxl" +
      "bWVudEJ5SWQoJ3NxbE91dCcpLnRleHRDb250ZW50ID0gc3FsIHx8ICctLSBOb3RoaW5nIGFkZGVkIHlldC4nOwoKICAgIGNvbnN0IGxpc3RFbCA9IGRvY3Vt" +
      "ZW50LmdldEVsZW1lbnRCeUlkKCdyb3dMaXN0Jyk7CiAgICBsaXN0RWwuaW5uZXJIVE1MID0gJyc7CiAgICByb3dzLmZvckVhY2goKHIsIGkpID0+IHsKICAg" +
      "ICAgY29uc3QgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7CiAgICAgIGRpdi5jbGFzc05hbWUgPSAncm93LWl0ZW0nOwogICAgICBkaXYu" +
      "aW5uZXJIVE1MID0gYCR7aSArIDF9LiAke3IudGVtcGxhdGVJZH0g4oCUICR7ci5wcm9kdWN0VHlwZX0vJHtyLmdhcm1lbnRDb2xvcn0vJHtyLnBsYWNlbWVu" +
      "dH0g4oCUIHg6JHtyLmF4fSUgeToke3IuYXl9JSB3OiR7ci5hd30lIGg6JHtyLmFofSUg4oCUIHBob3RvICR7ci5pbWdXfcOXJHtyLmltZ0h9PHNwYW4gY2xh" +
      "c3M9ImRlbCIgZGF0YS1pPSIke2l9Ij5yZW1vdmU8L3NwYW4+YDsKICAgICAgbGlzdEVsLmFwcGVuZENoaWxkKGRpdik7CiAgICB9KTsKICAgIGxpc3RFbC5x" +
      "dWVyeVNlbGVjdG9yQWxsKCcuZGVsJykuZm9yRWFjaChlbCA9PiB7CiAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gewogICAgICAg" +
      "IHJvd3Muc3BsaWNlKHBhcnNlSW50KGVsLmRhdGFzZXQuaSksIDEpOwogICAgICAgIHJlbmRlckxpc3QoKTsKICAgICAgfSk7CiAgICB9KTsKICB9CgogIGRv" +
      "Y3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb3B5QnRuJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7CiAgICBjb25zdCB0ZXh0ID0gZG9jdW1l" +
      "bnQuZ2V0RWxlbWVudEJ5SWQoJ3NxbE91dCcpLnRleHRDb250ZW50OwogICAgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQodGV4dCkudGhlbigoKSA9" +
      "PiB7CiAgICAgIGNvbnN0IGJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb3B5QnRuJyk7CiAgICAgIGNvbnN0IG9yaWdpbmFsID0gYnRuLnRleHRD" +
      "b250ZW50OwogICAgICBidG4udGV4dENvbnRlbnQgPSAnQ29waWVkJzsKICAgICAgc2V0VGltZW91dCgoKSA9PiB7IGJ0bi50ZXh0Q29udGVudCA9IG9yaWdp" +
      "bmFsOyB9LCAxMjAwKTsKICAgIH0pOwogIH0pOwoKICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2F2ZUJ0bicpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNr" +
      "JywgYXN5bmMgKCkgPT4gewogICAgY29uc3Qgc3RhdHVzRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2F2ZVN0YXR1cycpOwogICAgaWYgKCFyb3dz" +
      "Lmxlbmd0aCkgewogICAgICBzdGF0dXNFbC50ZXh0Q29udGVudCA9ICdOb3RoaW5nIHRvIHNhdmUg4oCUIGFkZCBhdCBsZWFzdCBvbmUgem9uZSBmaXJzdC4n" +
      "OwogICAgICBzdGF0dXNFbC5zdHlsZS5jb2xvciA9ICd2YXIoLS1pbmstZGltKSc7CiAgICAgIHJldHVybjsKICAgIH0KICAgIGNvbnN0IHNhdmVCdG4gPSBk" +
      "b2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2F2ZUJ0bicpOwogICAgc2F2ZUJ0bi5kaXNhYmxlZCA9IHRydWU7CiAgICBjb25zdCByZXN1bHRzID0gW107CiAg" +
      "ICBmb3IgKGNvbnN0IHIgb2Ygcm93cykgewogICAgICBzdGF0dXNFbC50ZXh0Q29udGVudCA9IGBTYXZpbmcgJHtyLnRlbXBsYXRlSWR94oCmYDsKICAgICAg" +
      "c3RhdHVzRWwuc3R5bGUuY29sb3IgPSAndmFyKC0taW5rLWRpbSknOwogICAgICB0cnkgewogICAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKCcvYWRt" +
      "aW4vY2FsaWJyYXRvci9zYXZlJywgewogICAgICAgICAgbWV0aG9kOiAnUE9TVCcsCiAgICAgICAgICBoZWFkZXJzOiB7ICdDb250ZW50LVR5cGUnOiAnYXBw" +
      "bGljYXRpb24vanNvbicgfSwKICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsKICAgICAgICAgICAgdGVtcGxhdGVfaWQ6IHIudGVtcGxhdGVJZCwK" +
      "ICAgICAgICAgICAgYXJlYV94OiBwYXJzZUZsb2F0KHIuYXgpLCBhcmVhX3k6IHBhcnNlRmxvYXQoci5heSksCiAgICAgICAgICAgIGFyZWFfdzogcGFyc2VG" +
      "bG9hdChyLmF3KSwgYXJlYV9oOiBwYXJzZUZsb2F0KHIuYWgpLAogICAgICAgICAgICBpbWFnZV93aWR0aDogci5pbWdXLCBpbWFnZV9oZWlnaHQ6IHIuaW1n" +
      "SAogICAgICAgICAgfSkKICAgICAgICB9KTsKICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzLmpzb24oKTsKICAgICAgICByZXN1bHRzLnB1c2goeyBp" +
      "ZDogci50ZW1wbGF0ZUlkLCBvazogcmVzLm9rICYmIGRhdGEuc3VjY2VzcywgbWVzc2FnZTogZGF0YS5lcnJvciB8fCAnc2F2ZWQnIH0pOwogICAgICB9IGNh" +
      "dGNoIChlcnIpIHsKICAgICAgICByZXN1bHRzLnB1c2goeyBpZDogci50ZW1wbGF0ZUlkLCBvazogZmFsc2UsIG1lc3NhZ2U6IFN0cmluZyhlcnIpIH0pOwog" +
      "ICAgICB9CiAgICB9CiAgICBzYXZlQnRuLmRpc2FibGVkID0gZmFsc2U7CiAgICBjb25zdCBmYWlsZWQgPSByZXN1bHRzLmZpbHRlcigocikgPT4gIXIub2sp" +
      "OwogICAgaWYgKCFmYWlsZWQubGVuZ3RoKSB7CiAgICAgIHN0YXR1c0VsLnRleHRDb250ZW50ID0gYFNhdmVkICR7cmVzdWx0cy5sZW5ndGh9IG9mICR7cmVz" +
      "dWx0cy5sZW5ndGh9IHRvIHRoZSBkYXRhYmFzZS5gOwogICAgICBzdGF0dXNFbC5zdHlsZS5jb2xvciA9ICd2YXIoLS1hY2NlbnQpJzsKICAgIH0gZWxzZSB7" +
      "CiAgICAgIHN0YXR1c0VsLnRleHRDb250ZW50ID0gYFNhdmVkICR7cmVzdWx0cy5sZW5ndGggLSBmYWlsZWQubGVuZ3RofSBvZiAke3Jlc3VsdHMubGVuZ3Ro" +
      "fS4gRmFpbGVkOiBgICsKICAgICAgICBmYWlsZWQubWFwKChyKSA9PiBgJHtyLmlkfSAoJHtyLm1lc3NhZ2V9KWApLmpvaW4oJywgJyk7CiAgICAgIHN0YXR1" +
      "c0VsLnN0eWxlLmNvbG9yID0gJyNjMDYwNWEnOwogICAgfQogIH0pOwo8L3NjcmlwdD4KPC9ib2R5Pgo8L2h0bWw+Cg==";
    function identityCheckBasicAuth(request, env) {
      const header = request.headers.get("Authorization") || "";
      if (!header.startsWith("Basic ")) return false;
      let decoded;
      try { decoded = atob(header.slice(6)); } catch { return false; }
      const sepIdx = decoded.indexOf(":");
      const pass = sepIdx >= 0 ? decoded.slice(sepIdx + 1) : decoded;
      return !!env.CALIBRATOR_PASSWORD && pass === env.CALIBRATOR_PASSWORD;
    }
    // ── Font Review (internal tool) ──────────────────────────────────
    // Answers the real problem behind "some generations look terrible" --
    // fonts were bulk-approved by license status alone (the only signal
    // available at the time), which says nothing about whether a font is
    // actually legible or well-designed for a brand wordmark. This page
    // renders every font with a real sample word using its own embedded
    // glyphs, so a human can actually SEE and reject bad ones -- same
    // Basic Auth pattern as the calibrator, same "the browser already has
    // credentials cached" trick for the toggle POSTs.
    const IDENTITY_FONT_REVIEW_SAMPLE = "Brand Name";
    const IDENTITY_FONT_REVIEW_PAGE_SIZE = 24;
    // Stamped visibly on every /admin/fonts* page. Bump this on every
    // deploy that touches this file. This exists specifically because
    // version confusion between what's pasted into the Cloudflare
    // dashboard and what's actually live has already caused real
    // confusion twice -- a visible stamp makes "which version is this?"
    // a glance instead of a guess.
    const WORKER_VERSION = "v50";

    async function handleAdminFontsPage(request, env) {
      if (!identityCheckBasicAuth(request, env)) {
        return new Response("Authentication required", {
          status: 401,
          headers: { "WWW-Authenticate": 'Basic realm="ZVAKHO internal tools"' }
        });
      }
      const url = new URL(request.url);
      const category = url.searchParams.get("category") || "";
      const status = url.searchParams.get("status") || "all"; // all | approved | pending
      const page = Math.max(0, parseInt(url.searchParams.get("page") || "0", 10) || 0);

      if (!category) {
        const rows = await env.DB.prepare(`
          SELECT category_tag, COUNT(*) as total, SUM(approved) as approved_count
          FROM fonts GROUP BY category_tag ORDER BY category_tag
        `).all();
        const cats = rows.results || [];
        const links = cats.map((c) => `
          <a class="cat-card" href="/admin/fonts?category=${encodeURIComponent(c.category_tag)}">
            <div class="cat-name">${c.category_tag}</div>
            <div class="cat-count">${c.approved_count} / ${c.total} approved</div>
          </a>`).join("");
        return new Response(`<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>ZVAKHO Font Review</title>
<style>
body{background:#121212;color:#f0ede6;font-family:-apple-system,sans-serif;padding:32px;margin:0;}
h1{font-size:15px;text-transform:uppercase;letter-spacing:.06em;color:#e8c547;margin:0 0 4px;}
.sub{color:#9a958a;font-size:13px;margin:0 0 20px;}
.sub a{color:#e8c547;text-decoration:none;}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:14px;}
.cat-card{display:block;background:#1a1a1a;border:1px solid #2c2c2c;border-radius:8px;padding:16px;text-decoration:none;color:inherit;}
.cat-card:hover{border-color:#e8c547;}
.cat-name{font-size:15px;font-weight:600;text-transform:capitalize;margin-bottom:6px;}
.cat-count{font-size:12px;color:#9a958a;}
.ver{color:#5a564c;font-weight:400;text-transform:none;letter-spacing:0;font-size:11px;margin-left:8px;}
</style></head><body>
<h1>Font Review — pick a category <span class="ver">${WORKER_VERSION}</span></h1>
<p class="sub"><a href="/admin/fonts/diagnose">Check all approved fonts against R2 &rarr;</a></p>
<div class="grid">${links}</div>
</body></html>`, { headers: { "Content-Type": "text/html;charset=utf-8" } });
      }

      let sql = `SELECT font_id, family_name, category_tag, r2_key, weight_class, approved, license_status, case_style FROM fonts WHERE category_tag = ?`;
      const params = [category];
      if (status === "approved") sql += " AND approved = 1";
      if (status === "pending") sql += " AND approved = 0";
      sql += ` ORDER BY family_name LIMIT ? OFFSET ?`;
      params.push(IDENTITY_FONT_REVIEW_PAGE_SIZE, page * IDENTITY_FONT_REVIEW_PAGE_SIZE);
      const res = await env.DB.prepare(sql).bind(...params).all();
      const fonts = res.results || [];

      // All known categories, for the move-to-category dropdown on each
      // card. Queried fresh each load so a category created elsewhere
      // shows up immediately, with no separate config to keep in sync.
      const allCatsRes = await env.DB.prepare(`SELECT DISTINCT category_tag FROM fonts ORDER BY category_tag`).all();
      const allCategories = (allCatsRes.results || []).map((r) => r.category_tag);
      function categoryOptionsHtml(current) {
        return allCategories.map((c) =>
          `<option value="${escapeXML(c)}" ${c === current ? "selected" : ""}>${escapeXML(c)}</option>`
        ).join("");
      }

      const fontCache = new Map();
      const cards = await Promise.all(fonts.map(async (f) => {
        let styleBlock = "";
        let failed = false;
        try {
          const base64 = await identityFetchFontBase64(env, f.r2_key, fontCache);
          styleBlock = `<style>@font-face{font-family:'rf_${f.font_id}';src:url(data:font/woff2;base64,${base64}) format('woff2');}</style>`;
        } catch {
          failed = true;
        }
        return `
        <div class="card ${f.approved ? "is-approved" : ""}" id="card_${f.font_id}">
          ${styleBlock}
          <div class="sample" style="font-family:${failed ? "sans-serif" : `'rf_${f.font_id}'`};">
            ${failed ? "(font failed to load)" : escapeXML(IDENTITY_FONT_REVIEW_SAMPLE)}
          </div>
          <div class="meta">
            <span class="fname">${escapeXML(f.family_name)}</span>
            <span class="license ${f.license_status === "included" ? "ok" : "warn"}">${escapeXML(f.license_status || "unknown")}</span>
          </div>
          <button class="toggle-btn" data-id="${f.font_id}" data-approved="${f.approved}">
            ${f.approved ? "Approved — click to reject" : "Pending — click to approve"}
          </button>
          <select class="cat-select" data-id="${f.font_id}" title="Move to category">
            ${categoryOptionsHtml(f.category_tag)}
          </select>
          <div class="moved-note" id="moved_${f.font_id}"></div>
          <select class="case-select" data-id="${f.font_id}" title="Brand name casing -- Upper forces caps (default, safe for all-caps-only fonts), Lower forces lowercase (deliberate minimal/modern brand look), Natural keeps the name as typed (for fonts with small-caps-style or script lowercase)">
            <option value="upper" ${f.case_style === "upper" || !f.case_style ? "selected" : ""}>Case: Upper</option>
            <option value="lower" ${f.case_style === "lower" ? "selected" : ""}>Case: Lower</option>
            <option value="natural" ${f.case_style === "natural" ? "selected" : ""}>Case: Natural</option>
          </select>
          <div class="case-note" id="case_${f.font_id}"></div>
        </div>`;
      }));

      const countRow = await env.DB.prepare(`SELECT COUNT(*) as n FROM fonts WHERE category_tag = ?${status === "approved" ? " AND approved=1" : status === "pending" ? " AND approved=0" : ""}`).bind(category).first();
      const totalInView = countRow?.n || 0;
      const totalPages = Math.max(1, Math.ceil(totalInView / IDENTITY_FONT_REVIEW_PAGE_SIZE));

      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>ZVAKHO Font Review — ${category}</title>
<style>
body{background:#121212;color:#f0ede6;font-family:-apple-system,sans-serif;padding:24px;margin:0;}
h1{font-size:15px;text-transform:uppercase;letter-spacing:.06em;color:#e8c547;margin:0 0 4px;}
.sub{color:#9a958a;font-size:13px;margin:0 0 18px;}
.sub a{color:#e8c547;}
.filters{margin-bottom:18px;font-size:13px;}
.filters a{color:#9a958a;text-decoration:none;margin-right:14px;padding:4px 0;border-bottom:2px solid transparent;}
.filters a.active{color:#e8c547;border-color:#e8c547;}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px;}
.card{background:#1a1a1a;border:1px solid #2c2c2c;border-radius:8px;padding:16px;}
.card.is-approved{border-color:#3a4a2c;}
.sample{font-size:28px;color:#f0ede6;min-height:40px;margin-bottom:10px;word-break:break-word;}
.meta{display:flex;justify-content:space-between;align-items:center;font-size:11px;margin-bottom:10px;}
.fname{color:#9a958a;}
.license{padding:2px 8px;border-radius:10px;}
.license.ok{background:#1e3a1e;color:#8fce8f;}
.license.warn{background:#3a2a1e;color:#ceab8f;}
.toggle-btn{width:100%;background:#0e0e0e;border:1px solid #2c2c2c;color:#f0ede6;padding:8px;border-radius:6px;font-size:12px;cursor:pointer;}
.toggle-btn:hover{border-color:#e8c547;}
.is-approved .toggle-btn{background:#1e3a1e;}
.cat-select{width:100%;background:#0e0e0e;border:1px solid #2c2c2c;color:#9a958a;padding:6px 8px;border-radius:6px;font-size:12px;margin-top:8px;cursor:pointer;}
.cat-select:hover{border-color:#e8c547;color:#f0ede6;}
.case-select{width:100%;background:#0e0e0e;border:1px solid #2c2c2c;color:#9a958a;padding:6px 8px;border-radius:6px;font-size:12px;margin-top:8px;cursor:pointer;}
.case-select:hover{border-color:#e8c547;color:#f0ede6;}
.moved-note{font-size:11px;color:#8fce8f;margin-top:6px;min-height:14px;}
.case-note{font-size:11px;color:#8fce8f;margin-top:6px;min-height:14px;}
.pager{margin-top:24px;font-size:13px;}
.pager a{color:#e8c547;text-decoration:none;margin-right:14px;}
.ver{color:#5a564c;font-weight:400;text-transform:none;letter-spacing:0;font-size:11px;margin-left:8px;}
</style></head><body>
<h1>Font Review — ${category} <span class="ver">${WORKER_VERSION}</span></h1>
<p class="sub"><a href="/admin/fonts">&larr; all categories</a> — ${totalInView} fonts, page ${page + 1} of ${totalPages}</p>
<div class="filters">
  <a href="?category=${category}&status=all" class="${status === "all" ? "active" : ""}">All</a>
  <a href="?category=${category}&status=approved" class="${status === "approved" ? "active" : ""}">Approved</a>
  <a href="?category=${category}&status=pending" class="${status === "pending" ? "active" : ""}">Pending</a>
</div>
<div class="grid">${cards.join("")}</div>
<div class="pager">
  ${page > 0 ? `<a href="?category=${category}&status=${status}&page=${page - 1}">&larr; Prev</a>` : ""}
  ${page + 1 < totalPages ? `<a href="?category=${category}&status=${status}&page=${page + 1}">Next &rarr;</a>` : ""}
</div>
<script>
document.querySelectorAll('.toggle-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const id = btn.dataset.id;
    const currentlyApproved = btn.dataset.approved === '1';
    const newApproved = !currentlyApproved;
    btn.disabled = true;
    btn.textContent = 'Saving...';
    try {
      const res = await fetch('/admin/fonts/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ font_id: id, approved: newApproved })
      });
      const data = await res.json();
      if (data.success) {
        btn.dataset.approved = newApproved ? '1' : '0';
        btn.textContent = newApproved ? 'Approved — click to reject' : 'Pending — click to approve';
        document.getElementById('card_' + id).classList.toggle('is-approved', newApproved);
      } else {
        btn.textContent = 'Error: ' + (data.error || 'failed');
      }
    } catch (err) {
      btn.textContent = 'Error: ' + String(err);
    }
    btn.disabled = false;
  });
});
document.querySelectorAll('.cat-select').forEach(sel => {
  const originalValue = sel.value;
  sel.addEventListener('change', async () => {
    const id = sel.dataset.id;
    const newCat = sel.value;
    const note = document.getElementById('moved_' + id);
    sel.disabled = true;
    note.textContent = 'Moving...';
    note.style.color = '#9a958a';
    try {
      const res = await fetch('/admin/fonts/recategorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ font_id: id, category_tag: newCat })
      });
      const data = await res.json();
      if (data.success) {
        document.getElementById('card_' + id).style.opacity = '0.5';
        note.textContent = 'Moved to ' + newCat + ' — reload to update the list';
        note.style.color = '#8fce8f';
        // Leave the dropdown disabled: the font no longer belongs in this
        // filtered view, so nothing useful to change here without a reload.
      } else {
        note.textContent = 'Error: ' + (data.error || 'failed');
        note.style.color = '#ce8f8f';
        sel.value = originalValue;
        sel.disabled = false;
      }
    } catch (err) {
      note.textContent = 'Error: ' + String(err);
      note.style.color = '#ce8f8f';
      sel.value = originalValue;
      sel.disabled = false;
    }
  });
});
document.querySelectorAll('.case-select').forEach(sel => {
  sel.dataset.confirmed = sel.value; // server-rendered value is the last known-good state
  sel.addEventListener('change', async () => {
    const id = sel.dataset.id;
    const newCase = sel.value;
    const note = document.getElementById('case_' + id);
    sel.disabled = true;
    note.textContent = 'Saving...';
    note.style.color = '#9a958a';
    try {
      const res = await fetch('/admin/fonts/set-case', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ font_id: id, case_style: newCase })
      });
      const data = await res.json();
      if (data.success) {
        sel.dataset.confirmed = newCase;
        note.textContent = 'Saved';
        note.style.color = '#8fce8f';
      } else {
        note.textContent = 'Error: ' + (data.error || 'failed');
        note.style.color = '#ce8f8f';
        sel.value = sel.dataset.confirmed;
      }
    } catch (err) {
      note.textContent = 'Error: ' + String(err);
      note.style.color = '#ce8f8f';
      sel.value = sel.dataset.confirmed;
    }
    sel.disabled = false;
  });
});
</script>
</body></html>`;

      return new Response(html, { headers: { "Content-Type": "text/html;charset=utf-8" } });
    }

    async function handleAdminFontsToggle(request, env) {
      if (!identityCheckBasicAuth(request, env)) {
        return jsonResponse({ error: "Unauthorized" }, 401);
      }
      let body;
      try { body = await request.json(); } catch { return jsonResponse({ error: "Invalid JSON" }, 400); }
      if (!body.font_id || typeof body.approved !== "boolean") {
        return jsonResponse({ error: "font_id and approved (boolean) required" }, 400);
      }
      const result = await env.DB.prepare(`UPDATE fonts SET approved = ? WHERE font_id = ?`)
        .bind(body.approved ? 1 : 0, body.font_id).run();
      if (!result.meta || result.meta.changes === 0) {
        return jsonResponse({ error: `No font found with font_id = '${body.font_id}'` }, 404);
      }
      return jsonResponse({ success: true, font_id: body.font_id, approved: body.approved });
    }

    // Moves a single font to a different category_tag -- e.g. correcting
    // one that landed in "experimental" but genuinely belongs in
    // "vintage" or "streetwear". Only allows moving into a category_tag
    // that already exists somewhere in the table: this is a recategorize
    // tool, not a category-creation tool, so a typo in the request body
    // can't silently spawn a stray new category with one font in it.
    async function handleAdminFontsRecategorize(request, env) {
      if (!identityCheckBasicAuth(request, env)) {
        return jsonResponse({ error: "Unauthorized" }, 401);
      }
      let body;
      try { body = await request.json(); } catch { return jsonResponse({ error: "Invalid JSON" }, 400); }
      if (!body.font_id || typeof body.category_tag !== "string" || !body.category_tag.trim()) {
        return jsonResponse({ error: "font_id and category_tag (non-empty string) required" }, 400);
      }
      const newCategory = body.category_tag.trim();
      const validCategory = await env.DB.prepare(`SELECT 1 FROM fonts WHERE category_tag = ? LIMIT 1`)
        .bind(newCategory).first();
      if (!validCategory) {
        return jsonResponse({ error: `'${newCategory}' is not an existing category_tag -- this tool moves fonts between existing categories, it does not create new ones` }, 400);
      }
      const result = await env.DB.prepare(`UPDATE fonts SET category_tag = ? WHERE font_id = ?`)
        .bind(newCategory, body.font_id).run();
      if (!result.meta || result.meta.changes === 0) {
        return jsonResponse({ error: `No font found with font_id = '${body.font_id}'` }, 404);
      }
      return jsonResponse({ success: true, font_id: body.font_id, category_tag: newCategory });
    }

    // Sets which case treatment applyBrandNameCase() should use for this
    // font's main wordmark text during real generation. 'upper' is the
    // safe default -- correct for fonts with no real lowercase, or where
    // lowercase is a genuinely broken/missing glyph rather than a design
    // choice. 'natural' preserves the brand name's real casing -- correct
    // for fonts whose lowercase is drawn as small caps (the contrast is
    // the whole point of the design) or script/handwritten fonts that
    // look worse forced into full caps. This is a visual call, not
    // something to infer automatically -- made once here per font while
    // looking at the review tool's mixed-case "Brand Name" sample.
    async function handleAdminFontsSetCase(request, env) {
      if (!identityCheckBasicAuth(request, env)) {
        return jsonResponse({ error: "Unauthorized" }, 401);
      }
      let body;
      try { body = await request.json(); } catch { return jsonResponse({ error: "Invalid JSON" }, 400); }
      if (!body.font_id || !["upper", "lower", "natural"].includes(body.case_style)) {
        return jsonResponse({ error: "font_id and case_style ('upper', 'lower', or 'natural') required" }, 400);
      }
      const result = await env.DB.prepare(`UPDATE fonts SET case_style = ? WHERE font_id = ?`)
        .bind(body.case_style, body.font_id).run();
      if (!result.meta || result.meta.changes === 0) {
        return jsonResponse({ error: `No font found with font_id = '${body.font_id}'` }, 404);
      }
      return jsonResponse({ success: true, font_id: body.font_id, case_style: body.case_style });
    }

    // Decommissions/reactivates an archetype -- flips `active` on the
    // archetypes table. buildComboPool already filters on `a.active`,
    // so this is the real, already-used gate: an inactive archetype is
    // never selected by generation, same principle as approved=0 for
    // fonts.
    async function handleAdminArchetypesToggle(request, env) {
      if (!identityCheckBasicAuth(request, env)) {
        return jsonResponse({ error: "Unauthorized" }, 401);
      }
      let body;
      try { body = await request.json(); } catch { return jsonResponse({ error: "Invalid JSON" }, 400); }
      if (!body.archetype_id || typeof body.active !== "boolean") {
        return jsonResponse({ error: "archetype_id and active (boolean) required" }, 400);
      }
      const result = await env.DB.prepare(`UPDATE archetypes SET active = ? WHERE archetype_id = ?`)
        .bind(body.active ? 1 : 0, body.archetype_id).run();
      if (!result.meta || result.meta.changes === 0) {
        return jsonResponse({ error: `No archetype found with archetype_id = '${body.archetype_id}'` }, 404);
      }
      return jsonResponse({ success: true, archetype_id: body.archetype_id, active: body.active });
    }

    const IDENTITY_COMBO_PREVIEW_SAMPLE = "Brand Name";
    const IDENTITY_COMBO_PREVIEW_COUNT = 6;

    // Picker + combo preview in one handler. No ?archetype= -> lists
    // every archetype with its real active status. With ?archetype=X
    // -> renders that archetype against a real sample of eligible,
    // approved fonts using the ACTUAL production render function and
    // ACTUAL embedded font data (identitySvgDoc, same as real
    // generation) -- not an approximation. This is the tool that was
    // missing: fonts could be reviewed alone, archetypes could only be
    // inspected as bare geometry, but there was no way to see what a
    // real archetype+font combination actually looks like, and no way
    // to decommission an archetype at all.
    async function handleAdminPreviewPage(request, env) {
      if (!identityCheckBasicAuth(request, env)) {
        return new Response("Authentication required", {
          status: 401,
          headers: { "WWW-Authenticate": 'Basic realm="ZVAKHO internal tools"' }
        });
      }
      const url = new URL(request.url);
      const archetypeId = url.searchParams.get("archetype");
      const styleBase = `
body{background:#121212;color:#f0ede6;font-family:-apple-system,sans-serif;padding:32px;margin:0;}
h1{font-size:15px;text-transform:uppercase;letter-spacing:.06em;color:#e8c547;margin:0 0 4px;}
.ver{color:#5a564c;font-weight:400;text-transform:none;letter-spacing:0;font-size:11px;margin-left:8px;}
.sub{color:#9a958a;font-size:13px;margin:0 0 20px;}
.sub a{color:#e8c547;text-decoration:none;}
.arch-list{max-width:760px;}
.arch-row{background:#1a1a1a;border:1px solid #2c2c2c;border-radius:8px;padding:14px 16px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;gap:16px;}
.arch-row.inactive{opacity:0.5;}
.arch-name{font-weight:600;font-size:14px;}
.arch-tags{color:#9a958a;font-size:11px;margin-top:3px;}
.arch-actions{display:flex;gap:8px;align-items:center;flex-shrink:0;}
.arch-actions a{color:#e8c547;text-decoration:none;font-size:12px;}
.arch-toggle{background:#0e0e0e;border:1px solid #2c2c2c;color:#f0ede6;padding:6px 12px;border-radius:6px;font-size:11px;cursor:pointer;}
.arch-row:not(.inactive) .arch-toggle{background:#1e3a1e;}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;margin-top:20px;}
.combo-card{background:#1a1a1a;border:1px solid #2c2c2c;border-radius:10px;padding:16px;}
.combo-card .swatch{background:#fff;border-radius:6px;padding:10px;margin-bottom:10px;min-height:120px;display:flex;align-items:center;justify-content:center;}
.combo-card .swatch svg{max-width:100%;height:auto;max-height:200px;}
.render-error{color:#ce8f8f;font-size:11px;font-family:monospace;padding:8px;text-align:center;word-break:break-word;}
.combo-meta{font-size:12px;color:#f0ede6;}
.combo-meta .fname{font-weight:600;}
.combo-meta .fdetail{color:#9a958a;font-size:11px;margin-top:2px;}
.decom-font-btn{width:100%;margin-top:10px;background:#0e0e0e;border:1px solid #5a2c2c;color:#ce8f8f;padding:6px;border-radius:6px;font-size:11px;cursor:pointer;}
.decom-font-btn:hover{border-color:#ce8f8f;}
.controls{display:flex;gap:10px;flex-wrap:wrap;margin:16px 0;align-items:center;}
.controls a, .controls select{background:#0e0e0e;border:1px solid #2c2c2c;color:#f0ede6;padding:8px 12px;border-radius:6px;font-size:12px;text-decoration:none;}
.controls .decom-arch-btn{background:#0e0e0e;border:1px solid #5a2c2c;color:#ce8f8f;padding:8px 12px;border-radius:6px;font-size:12px;cursor:pointer;}
`;

      if (!archetypeId) {
        const res = await env.DB.prepare(`SELECT archetype_id, tags, active FROM archetypes ORDER BY archetype_id`).all();
        const rows = res.results || [];
        const rowsHtml = rows.map((a) => {
          const tags = JSON.parse(a.tags);
          const firstTag = tags[0] || "modern";
          return `
        <div class="arch-row ${a.active ? "" : "inactive"}" id="row_${a.archetype_id}">
          <div>
            <div class="arch-name">${escapeXML(a.archetype_id)}</div>
            <div class="arch-tags">${escapeXML(tags.join(", "))}</div>
          </div>
          <div class="arch-actions">
            <a href="/admin/preview?archetype=${encodeURIComponent(a.archetype_id)}&tag=${encodeURIComponent(firstTag)}">Preview &rarr;</a>
            <button class="arch-toggle" data-id="${a.archetype_id}" data-active="${a.active}">${a.active ? "Active" : "Inactive"}</button>
          </div>
        </div>`;
        }).join("");
        const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>ZVAKHO Combo Preview</title>
<style>${styleBase}</style></head><body>
<h1>Archetype + Font Combo Preview <span class="ver">${WORKER_VERSION}</span></h1>
<p class="sub">Pick an archetype to see it rendered with real, approved fonts -- actual production output, not an approximation.</p>
<div class="arch-list">${rowsHtml}</div>
<script>
document.querySelectorAll('.arch-toggle').forEach(btn => {
  btn.addEventListener('click', async () => {
    const id = btn.dataset.id;
    const newActive = btn.dataset.active !== '1';
    btn.disabled = true;
    try {
      const res = await fetch('/admin/archetypes/toggle', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archetype_id: id, active: newActive })
      });
      const data = await res.json();
      if (data.success) {
        btn.dataset.active = newActive ? '1' : '0';
        btn.textContent = newActive ? 'Active' : 'Inactive';
        document.getElementById('row_' + id).classList.toggle('inactive', !newActive);
      } else {
        alert('Error: ' + (data.error || 'failed'));
      }
    } catch (err) { alert('Error: ' + String(err)); }
    btn.disabled = false;
  });
});
</script>
</body></html>`;
        return new Response(html, { headers: { "Content-Type": "text/html;charset=utf-8" } });
      }

      // Combo preview for a specific archetype.
      const archetypeRow = await env.DB.prepare(`SELECT archetype_id, tags, active FROM archetypes WHERE archetype_id = ?`)
        .bind(archetypeId).first();
      if (!archetypeRow) {
        return new Response(`Archetype '${archetypeId}' not found`, { status: 404 });
      }
      const renderFn = IDENTITY_ARCHETYPE_RENDERERS[archetypeId];
      if (!renderFn) {
        return new Response(`Archetype '${archetypeId}' has no render function`, { status: 500 });
      }
      const allTags = JSON.parse(archetypeRow.tags);
      const tag = url.searchParams.get("tag") || allTags[0] || "modern";
      const printMethod = "dtf";

      const fontPool = await getFontPoolForCategory(env, tag, printMethod);
      const sample = [...fontPool].sort(() => Math.random() - 0.5).slice(0, IDENTITY_COMBO_PREVIEW_COUNT);

      const needsSupport = IDENTITY_ARCHETYPES_NEEDING_SUPPORT_FONT.has(archetypeId);
      const fontCache = new Map();
      const iconCache = new Map();

      const cards = await Promise.all(sample.map(async (font) => {
        let svgMarkup = "";
        let errorMsg = null;
        try {
          const supportFont = needsSupport ? (await pickFontPairing(env, tag, true, printMethod)).support : null;
          svgMarkup = await renderFn(env, font, supportFont, IDENTITY_COMBO_PREVIEW_SAMPLE, "#000000", tag, {}, fontCache, iconCache);
        } catch (err) {
          errorMsg = err && err.message ? err.message : String(err);
          svgMarkup = "";
        }
        return `
        <div class="combo-card">
          <div class="swatch">${errorMsg ? `<span class="render-error">${escapeXML(errorMsg)}</span>` : svgMarkup}</div>
          <div class="combo-meta">
            <div class="fname">${escapeXML(font.family_name)}</div>
            <div class="fdetail">${escapeXML(font.category_tag)} · weight ${font.weight_class || "?"} · case: ${escapeXML(font.case_style || "upper")}</div>
          </div>
          <button class="decom-font-btn" data-id="${font.font_id}">Decommission this font</button>
        </div>`;
      }));

      const tagSwitcher = allTags.map((t) =>
        `<a href="/admin/preview?archetype=${encodeURIComponent(archetypeId)}&tag=${encodeURIComponent(t)}" style="${t === tag ? "border-color:#e8c547;color:#e8c547;" : ""}">${escapeXML(t)}</a>`
      ).join("");

      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>ZVAKHO Combo Preview -- ${escapeXML(archetypeId)}</title>
<style>${styleBase}</style></head><body>
<h1>${escapeXML(archetypeId)} <span class="ver">${WORKER_VERSION}</span></h1>
<p class="sub"><a href="/admin/preview">&larr; all archetypes</a> — ${sample.length} of ${fontPool.length} eligible fonts for "${escapeXML(tag)}"</p>
<div class="controls">
  ${tagSwitcher}
  <a href="/admin/preview?archetype=${encodeURIComponent(archetypeId)}&tag=${encodeURIComponent(tag)}">&#8635; Shuffle</a>
  <button class="decom-arch-btn" id="decomArchBtn" data-id="${archetypeId}" data-active="${archetypeRow.active}">
    ${archetypeRow.active ? "Decommission this archetype" : "Reactivate this archetype"}
  </button>
</div>
<div class="grid">${cards.join("")}</div>
<script>
document.getElementById('decomArchBtn').addEventListener('click', async () => {
  const btn = document.getElementById('decomArchBtn');
  const id = btn.dataset.id;
  const newActive = btn.dataset.active !== '1';
  btn.disabled = true;
  try {
    const res = await fetch('/admin/archetypes/toggle', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ archetype_id: id, active: newActive })
    });
    const data = await res.json();
    if (data.success) {
      btn.dataset.active = newActive ? '1' : '0';
      btn.textContent = newActive ? 'Decommission this archetype' : 'Reactivate this archetype';
    } else { alert('Error: ' + (data.error || 'failed')); }
  } catch (err) { alert('Error: ' + String(err)); }
  btn.disabled = false;
});
document.querySelectorAll('.decom-font-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const id = btn.dataset.id;
    btn.disabled = true;
    btn.textContent = 'Saving...';
    try {
      const res = await fetch('/admin/fonts/toggle', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ font_id: id, approved: false })
      });
      const data = await res.json();
      if (data.success) {
        btn.textContent = 'Decommissioned';
        btn.closest('.combo-card').style.opacity = '0.4';
      } else {
        btn.textContent = 'Error: ' + (data.error || 'failed');
        btn.disabled = false;
      }
    } catch (err) {
      btn.textContent = 'Error: ' + String(err);
      btn.disabled = false;
    }
  });
});
</script>
</body></html>`;
      return new Response(html, { headers: { "Content-Type": "text/html;charset=utf-8" } });
    }


    // Uses R2 .head() (metadata only, no body download) in small batches
    // so a few hundred fonts check quickly without overwhelming the R2
    // binding with unbounded concurrency.
    async function handleAdminFontsDiagnose(request, env) {
      if (!identityCheckBasicAuth(request, env)) {
        return new Response("Authentication required", {
          status: 401,
          headers: { "WWW-Authenticate": 'Basic realm="ZVAKHO internal tools"' }
        });
      }
      const res = await env.DB.prepare(
        `SELECT font_id, family_name, category_tag, r2_key FROM fonts WHERE approved = 1 ORDER BY category_tag, family_name`
      ).all();
      const fonts = res.results || [];

      const BATCH_SIZE = 25;
      const broken = [];
      let checked = 0;
      for (let i = 0; i < fonts.length; i += BATCH_SIZE) {
        const batch = fonts.slice(i, i + BATCH_SIZE);
        const results = await Promise.all(batch.map(async (f) => {
          try {
            const head = await env.R2.head(f.r2_key);
            return head ? null : f; // null head = key not found, same as identityFetchFontBase64's check
          } catch {
            return f; // any R2 error also counts as broken for this report
          }
        }));
        for (const r of results) if (r) broken.push(r);
        checked += batch.length;
      }

      const byCategory = {};
      for (const f of broken) {
        (byCategory[f.category_tag] = byCategory[f.category_tag] || []).push(f);
      }
      // "Decommission" reuses the existing /admin/fonts/toggle endpoint
      // (approved -> false) rather than inventing a separate mechanism --
      // approved=0 is already the real, already-tested gate that keeps a
      // font out of generation, so there's no new state to keep in sync.
      const categoryBlocks = Object.keys(byCategory).sort().map((cat) => `
        <h2>${escapeXML(cat)} (${byCategory[cat].length})</h2>
        <ul>${byCategory[cat].map((f) => `
          <li id="row_${f.font_id}">
            <div>
              <span class="fname">${escapeXML(f.family_name)}</span><br>
              <span class="key">${escapeXML(f.r2_key)}</span>
            </div>
            <button class="decom-btn" data-id="${f.font_id}">Decommission</button>
          </li>`).join("")}</ul>
      `).join("");

      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>ZVAKHO Font R2 Diagnostic</title>
<style>
body{background:#121212;color:#f0ede6;font-family:-apple-system,sans-serif;padding:32px;margin:0;max-width:760px;}
h1{font-size:15px;text-transform:uppercase;letter-spacing:.06em;color:#e8c547;margin:0 0 4px;}
.ver{color:#5a564c;font-weight:400;text-transform:none;letter-spacing:0;font-size:11px;margin-left:8px;}
.sub{color:#9a958a;font-size:13px;margin:0 0 24px;}
.sub a{color:#e8c547;}
.summary{background:#1a1a1a;border:1px solid #2c2c2c;border-radius:8px;padding:16px;margin-bottom:24px;font-size:13px;}
.summary strong{color:${broken.length ? "#ce8f8f" : "#8fce8f"};}
h2{font-size:13px;text-transform:capitalize;color:#e8c547;margin:20px 0 8px;border-bottom:1px solid #2c2c2c;padding-bottom:6px;}
ul{list-style:none;padding:0;margin:0;}
li{font-size:13px;padding:10px 0;border-bottom:1px solid #1e1e1e;display:flex;justify-content:space-between;align-items:center;gap:12px;}
li.is-decommissioned{opacity:0.4;}
.fname{color:#f0ede6;}
.key{color:#9a958a;font-family:monospace;font-size:11px;word-break:break-all;}
.decom-btn{flex-shrink:0;background:#0e0e0e;border:1px solid #5a2c2c;color:#ce8f8f;padding:6px 12px;border-radius:6px;font-size:11px;cursor:pointer;white-space:nowrap;}
.decom-btn:hover{border-color:#ce8f8f;}
</style></head><body>
<h1>Font R2 Diagnostic <span class="ver">${WORKER_VERSION}</span></h1>
<p class="sub"><a href="/admin/fonts">&larr; back to font review</a></p>
<div class="summary">
  Checked ${checked} approved fonts against R2.
  ${broken.length
    ? `<strong>${broken.length} have a broken r2_key</strong> -- these are picked into real generation and will fail with an unhandled error if selected.`
    : `<strong>All clear</strong> -- every approved font's r2_key resolves in R2.`}
</div>
${categoryBlocks || ""}
<script>
document.querySelectorAll('.decom-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const id = btn.dataset.id;
    btn.disabled = true;
    btn.textContent = 'Decommissioning...';
    try {
      const res = await fetch('/admin/fonts/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ font_id: id, approved: false })
      });
      const data = await res.json();
      if (data.success) {
        document.getElementById('row_' + id).classList.add('is-decommissioned');
        btn.textContent = 'Decommissioned';
      } else {
        btn.textContent = 'Error: ' + (data.error || 'failed');
        btn.disabled = false;
      }
    } catch (err) {
      btn.textContent = 'Error: ' + String(err);
      btn.disabled = false;
    }
  });
});
</script>
</body></html>`;
      return new Response(html, { headers: { "Content-Type": "text/html;charset=utf-8" } });
    }

    async function handleAdminCalibrator(request, env) {
      if (!identityCheckBasicAuth(request, env)) {
        return new Response("Authentication required", {
          status: 401,
          headers: { "WWW-Authenticate": 'Basic realm="ZVAKHO internal tools"' }
        });
      }
      const bytes = Uint8Array.from(atob(IDENTITY_CALIBRATOR_HTML_B64), (c) => c.charCodeAt(0));
      const html = new TextDecoder().decode(bytes);
      return new Response(html, { headers: { "Content-Type": "text/html;charset=utf-8" } });
    }
    // Real persistence for the calibrator -- writes straight to
    // print_templates, same Basic Auth as the page itself (the browser
    // already has the credentials cached from loading /admin/calibrator,
    // so this fetch() call succeeds with no extra login step). Only ever
    // touches the 6 known columns on an existing row matched by
    // template_id -- never inserts, never touches any other table.
    async function handleAdminCalibratorSave(request, env) {
      if (!identityCheckBasicAuth(request, env)) {
        return jsonResponse({ error: "Unauthorized" }, 401);
      }
      let body;
      try { body = await request.json(); } catch { return jsonResponse({ error: "Invalid JSON" }, 400); }
      const { template_id, area_x, area_y, area_w, area_h, image_width, image_height } = body;
      if (!template_id) return jsonResponse({ error: "template_id required" }, 400);
      const nums = [area_x, area_y, area_w, area_h, image_width, image_height];
      if (nums.some((n) => typeof n !== "number" || Number.isNaN(n))) {
        return jsonResponse({ error: "area_x/area_y/area_w/area_h/image_width/image_height must all be numbers" }, 400);
      }
      const result = await env.DB.prepare(`
        UPDATE print_templates
        SET area_x = ?, area_y = ?, area_w = ?, area_h = ?, image_width = ?, image_height = ?
        WHERE template_id = ?
      `).bind(area_x, area_y, area_w, area_h, image_width, image_height, template_id).run();
      if (!result.meta || result.meta.changes === 0) {
        return jsonResponse({ error: `No print_templates row found with template_id = '${template_id}'` }, 404);
      }
      return jsonResponse({ success: true, template_id });
    }

    // ═══════════════════════════════════════════════════════════════
    // BRAND IDENTITY / ARTWORK GENERATOR  (v2 — private/public split)
    // Ported from the standalone Brand Identity backend build into this
    // worker's own conventions: raw env.DB.prepare() (no query/queryOne
    // helper module), authenticateRequest()/jsonResponse() for consistency
    // with every other route in this file. No new imports, no new files --
    // this worker stays single-file.
    //
    // ACCESS MODEL — the R2 bucket itself is NEVER public (no r2.dev
    // subdomain, no custom domain, ever). Every byte flows through this
    // worker's own R2 binding:
    //   - Draft concepts (unpicked generate() output) live under
    //     brands/{brandId}/identity/drafts/... and are only reachable via
    //     GET /identity/preview/:key, which checks the caller's own
    //     brand_id against the key -- owner-only.
    //   - Once a concept is selected, its files are copied to
    //     brands/{brandId}/public/... and become reachable via the open,
    //     unauthenticated GET /assets/:key route -- same access level as
    //     any storefront product photo, which is what a selected logo
    //     functionally is (your existing store-config/public-brand routes
    //     already read brand.logo_url and show it to customers).
    //   - Raw font .woff2 files are NEVER served over HTTP at all, in
    //     either route -- only fetched server-side via env.R2.get() inside
    //     identityFetchFontBase64() and baked into generated SVGs as
    //     base64. No route in this file returns a raw font file.
    //
    // Requires (see deploy notes): an R2 bucket binding named `R2` on THIS
    // worker (Settings -> Bindings -> R2). No R2_PUBLIC_URL needed --
    // asset URLs are built from env.BASE_URL, same pattern already used
    // elsewhere in this file (line ~2149).
    // ═══════════════════════════════════════════════════════════════

    // Was 3 -- that number made sense if each generation cost a paid AI
    // API call, which this system never actually used (deterministic
    // font/archetype/color selection, no LLM). Raised per direct
    // decision: real infra cost per generation is negligible (Workers
    // CPU + a few small R2 writes), so cost isn't a real constraint here.
    // Kept finite rather than removed entirely -- unlimited regeneration
    // tends to produce decision paralysis rather than helping anyone
    // land on a brand identity, which is a real UX cost independent of
    // infra cost. 10 comfortably covers even the smallest category pool
    // (handwritten, 22 combos) without leaning on the repeat-fallback.
    const IDENTITY_MAX_GENERATIONS = 10;

    function identityBaseUrl(env) {
      // env.BASE_URL is configured with a trailing slash in the dashboard
      // (confirmed via a real /identity/generate call returning
      // "...dev//identity/preview/..." -- a double slash that fails the
      // route's startsWith() prefix check). Strip any trailing slash here
      // so every caller gets a clean base regardless of how the env var
      // is configured.
      const raw = env.BASE_URL || "https://zvakho-workers-universal.yasibomedia.workers.dev";
      return raw.replace(/\/+$/, "");
    }
    function identityAssetContentType(key) {
      if (key.endsWith(".svg")) return "image/svg+xml";
      if (key.endsWith(".png")) return "image/png";
      if (key.endsWith(".jpg") || key.endsWith(".jpeg")) return "image/jpeg";
      if (key.endsWith(".webp")) return "image/webp";
      return "application/octet-stream";
    }
    // Garment reference photos live in the SAME bucket as fonts (env.R2)
    // -- corrected after an earlier wrong assumption that they were in
    // the second bucket. Served via the same open /assets/ route as
    // selected brand identities, under a dedicated mock-up/ prefix (see
    // handleAssetServe's allowlist below).
    function identityGarmentImageUrl(env, r2Key) {
      if (/^https?:\/\//.test(r2Key)) return r2Key; // already-absolute override, used as-is
      const encoded = r2Key.split("/").map(encodeURIComponent).join("/");
      return `${identityBaseUrl(env)}/assets/${encoded}`;
    }

    // ── small SVG helpers ──
    function escapeXML(s) {
      return String(s ?? "").replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
    }
    function autoFitFontSize(text, maxWidth) {
      const avgCharWidthRatio = 0.62;
      const len = Math.max(String(text).length, 1);
      let size = maxWidth / (len * avgCharWidthRatio);
      return Math.round(Math.max(Math.min(size, 110), 22));
    }
    function splitForStack(text, maxParts = 2) {
      const words = String(text).trim().split(/\s+/);
      if (words.length >= maxParts) return words;
      const mid = Math.ceil(text.length / 2);
      return [text.slice(0, mid), text.slice(mid)];
    }
    function inkAndBg(ink) {
      return ink === "#ffffff" ? "#141210" : "#ffffff";
    }

    // ── font fetch from R2, cached per-request via a plain Map. This is
    // the ONLY place fonts are ever read, and it's always server-side --
    // no route returns these bytes to a client. ──
    async function identityFetchFontBase64(env, r2Key, fontCache) {
      if (fontCache.has(r2Key)) return fontCache.get(r2Key);
      const obj = await env.R2.get(r2Key);
      if (!obj) throw new Error(`Font not found in R2: ${r2Key}`);
      const bytes = await obj.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(bytes)));
      fontCache.set(r2Key, base64);
      return base64;
    }
    async function identityFontFaceStyleBlock(env, fontEntries, fontCache) {
      const rules = [];
      for (const f of fontEntries) {
        const base64 = await identityFetchFontBase64(env, f.r2_key, fontCache);
        // weightRange (e.g. [100, 900]) declares a variable range on the
        // @font-face itself, so separate <tspan>s can each request a
        // different explicit weight from the SAME embedded file -- a
        // fixed single weight (the normal case below) would lock every
        // element using this face to one weight regardless of what any
        // individual text element asks for. Only meaningful when the
        // underlying font file actually is variable -- callers check
        // font.variable before using this.
        const weightDecl = f.weightRange ? `${f.weightRange[0]} ${f.weightRange[1]}` : (f.weight || 400);
        rules.push(`@font-face{font-family:'${f.family_name}';src:url(data:font/woff2;base64,${base64}) format('woff2');font-weight:${weightDecl};font-style:${f.style || "normal"};}`);
      }
      return `<style>${rules.join("")}</style>`;
    }
    async function identitySvgDoc(env, w, h, bg, fontEntries, inner, fontCache) {
      // Artwork is ALWAYS transparent -- no background rect, ever. Real
      // print production never bakes a background into the artwork file;
      // ink sits directly on whatever the garment color is. The earlier
      // version drew a `bg`-colored rect here purely so a white-ink logo
      // wasn't invisible when eyeballed on its own -- but baking that into
      // the STORED artwork was the actual mistake (v33's regex-strip in
      // compositeMockup was a patch on top of that mistake, not a real
      // fix). `bg` is intentionally unused now -- kept as a parameter so
      // none of the 11 archetype call sites needed changing.
      const styleBlock = await identityFontFaceStyleBlock(env, fontEntries, fontCache);
      return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">${styleBlock}${inner}</svg>`;
    }

    // Every archetype's main wordmark text goes through this instead of
    // hardcoding .toUpperCase() -- the RIGHT case treatment depends on
    // the font that landed in this generation, not on which archetype
    // happened to pick it. A font with no real lowercase (or one where
    // lowercase is a genuinely broken glyph, not a design choice) needs
    // 'upper' -- the current universal default, correct for most bold
    // display fonts. A font whose lowercase is drawn as small caps, or
    // a script/handwritten font whose whole appeal is its natural
    // connecting strokes, needs 'natural' -- forcing those to full caps
    // flattens the exact contrast the type designer built in. Which
    // fonts need which is a visual call made once in /admin/fonts (the
    // review sample is deliberately mixed-case "Brand Name" so a
    // uppercase-only font already shows broken glyphs on sight), stored
    // per font, and respected here regardless of which archetype uses it.
    function applyBrandNameCase(brandName, primaryFont) {
      const name = String(brandName);
      if (primaryFont.case_style === "natural") return name;
      if (primaryFont.case_style === "lower") return name.toLowerCase();
      return name.toUpperCase();
    }

    // ── archetype renderers (all 11 registered archetypes now have a
    // render function) ──
    async function renderWordmark(env, primaryFont, supportFont, brandName, ink, tag, meta, fontCache) {
      const bg = inkAndBg(ink);
      const text = applyBrandNameCase(brandName, primaryFont);
      const w = 600, h = 300;
      const fontSize = autoFitFontSize(text, w - 60);
      const weight = primaryFont.weight_class || 700;
      // Small supporting label beneath -- matches the "oversized
      // minimalism" register (huge word, tiny real supporting text, no
      // icon) directly. Only ever real structural data (city, or a
      // founded year with a safe current-year fallback, same pattern
      // bootleg_stack already established) -- never invented copy.
      const label = meta.city
        ? String(meta.city).toUpperCase()
        : `SINCE ${meta.foundedYear || new Date().getFullYear()}`;
      const inner = `
    <text x="${w / 2}" y="${h / 2 - 8}" text-anchor="middle" dominant-baseline="middle"
          style="font-family:'${primaryFont.family_name}';font-weight:${weight};" fill="${ink}"
          font-size="${fontSize}">${escapeXML(text)}</text>
    <text x="${w / 2}" y="${h / 2 + fontSize * 0.55}" text-anchor="middle"
          style="font-family:'${primaryFont.family_name}';font-weight:400;" fill="${ink}"
          font-size="13" letter-spacing="0.28em">${escapeXML(label)}</text>`;
      return identitySvgDoc(env, w, h, bg, [{ family_name: primaryFont.family_name, r2_key: primaryFont.r2_key, weight }], inner, fontCache);
    }

    async function renderArcLabelStack(env, primaryFont, supportFont, brandName, ink, tag, meta, fontCache) {
      const bg = inkAndBg(ink);
      const text = applyBrandNameCase(brandName, primaryFont);
      const w = 600;
      const r = w * 0.34, cx = w / 2;
      const pathId = `arc_${Math.random().toString(36).slice(2, 8)}`;
      const year = meta.foundedYear || new Date().getFullYear();
      const fontSize = autoFitFontSize(text, r * 3.05);
      const weight = primaryFont.weight_class || 600;
      const ascenderMargin = fontSize * 0.85 + 14;
      const cy = r + ascenderMargin;
      const h = Math.round(cy + 110);
      const inner = `
    <path id="${pathId}" d="M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}" fill="none"/>
    <text style="font-family:'${primaryFont.family_name}';font-weight:${weight};" fill="${ink}"
          font-size="${fontSize}" letter-spacing="0.05em">
      <textPath href="#${pathId}" startOffset="50%" text-anchor="middle">${escapeXML(text)}</textPath>
    </text>
    <text x="${cx}" y="${cy + 55}" text-anchor="middle"
          style="font-family:'${primaryFont.family_name}';font-weight:${weight};" fill="${ink}"
          font-size="15" letter-spacing="0.2em">EST.</text>
    <text x="${cx}" y="${cy + 92}" text-anchor="middle"
          style="font-family:'${primaryFont.family_name}';font-weight:${weight};" fill="none" stroke="${ink}"
          stroke-width="1.4" font-size="26">${year}</text>`;
      return identitySvgDoc(env, w, h, bg, [{ family_name: primaryFont.family_name, r2_key: primaryFont.r2_key, weight }], inner, fontCache);
    }

    async function renderSplitConnector(env, primaryFont, supportFont, brandName, ink, tag, meta, fontCache) {
      const bg = inkAndBg(ink);
      const words = splitForStack(applyBrandNameCase(brandName, primaryFont), 2);
      const w = 600, h = 300;
      const weight = primaryFont.weight_class || 700;
      const connFont = supportFont || primaryFont;
      const connWeight = supportFont ? (supportFont.weight_class || 400) : 400;
      const fontSize = Math.round(autoFitFontSize(words[0] + (words[1] || ""), w - 80) * 0.78);
      const inner = `
    <text x="${w / 2}" y="${h * 0.32}" text-anchor="middle" dominant-baseline="middle"
          style="font-family:'${primaryFont.family_name}';font-weight:${weight};" fill="${ink}"
          font-size="${fontSize}">${escapeXML(words[0])}</text>
    <text x="${w / 2}" y="${h * 0.54}" text-anchor="middle" dominant-baseline="middle"
          style="font-family:'${connFont.family_name}';font-style:italic;font-weight:${connWeight};"
          fill="${ink}" font-size="${Math.round(fontSize * 0.42)}">&amp;</text>
    <text x="${w / 2}" y="${h * 0.78}" text-anchor="middle" dominant-baseline="middle"
          style="font-family:'${primaryFont.family_name}';font-weight:${weight};" fill="${ink}"
          font-size="${fontSize}">${escapeXML(words[1] || "")}</text>`;
      const fontEntries = [{ family_name: primaryFont.family_name, r2_key: primaryFont.r2_key, weight }];
      if (supportFont) fontEntries.push({ family_name: supportFont.family_name, r2_key: supportFont.r2_key, weight: connWeight, style: "italic" });
      return identitySvgDoc(env, w, h, bg, fontEntries, inner, fontCache);
    }

    async function renderCircleBadge(env, primaryFont, supportFont, brandName, ink, tag, meta, fontCache) {
      const bg = inkAndBg(ink);
      const text = applyBrandNameCase(brandName, primaryFont);
      const w = 600;
      const cx = w / 2;
      const weight = primaryFont.weight_class || 700;
      const R = 175;
      const marginTop = 40;
      const cyCenter = R + marginTop;
      const textArcR = R - 30;
      const topPathId = `bt_${Math.random().toString(36).slice(2, 8)}`;
      const bottomPathId = `bb_${Math.random().toString(36).slice(2, 8)}`;
      const topLabel = (tag || "ORIGINAL").toUpperCase();
      const bottomLabel = "SINCE " + (meta.foundedYear || new Date().getFullYear());
      const fontSize = autoFitFontSize(text, textArcR * 1.5);
      const h = Math.round(cyCenter + R + 40);
      const inner = `
    <circle cx="${cx}" cy="${cyCenter}" r="${R}" fill="none" stroke="${ink}" stroke-width="2.5"/>
    <circle cx="${cx}" cy="${cyCenter}" r="${R - 10}" fill="none" stroke="${ink}" stroke-width="1"/>
    <path id="${topPathId}" d="M ${cx - textArcR} ${cyCenter} A ${textArcR} ${textArcR} 0 0 1 ${cx + textArcR} ${cyCenter}" fill="none"/>
    <text style="font-family:'${primaryFont.family_name}';font-weight:${weight};" fill="${ink}" font-size="13" letter-spacing="0.15em">
      <textPath href="#${topPathId}" startOffset="50%" text-anchor="middle">${escapeXML(topLabel)}</textPath>
    </text>
    <text x="${cx}" y="${cyCenter}" text-anchor="middle" dominant-baseline="middle"
          style="font-family:'${primaryFont.family_name}';font-weight:${weight};" fill="${ink}"
          font-size="${fontSize}">${escapeXML(text)}</text>
    <path id="${bottomPathId}" d="M ${cx - textArcR} ${cyCenter} A ${textArcR} ${textArcR} 0 0 0 ${cx + textArcR} ${cyCenter}" fill="none"/>
    <text style="font-family:'${primaryFont.family_name}';font-weight:${weight};" fill="${ink}" font-size="13" letter-spacing="0.15em">
      <textPath href="#${bottomPathId}" startOffset="50%" text-anchor="middle">${escapeXML(bottomLabel)}</textPath>
    </text>`;
      return identitySvgDoc(env, w, h, bg, [{ family_name: primaryFont.family_name, r2_key: primaryFont.r2_key, weight }], inner, fontCache);
    }

    function buildBootlegLines(brandName, tag, meta = {}) {
      const year = meta.foundedYear || new Date().getFullYear();
      const lines = [`EST. ${year}`];
      if (meta.city) lines.push(String(meta.city).toUpperCase());
      lines.push(`${(tag || "ORIGINAL").toUpperCase()} DIVISION`);
      if (meta.tagline) lines.push(String(meta.tagline).toUpperCase());
      lines.push(`#${String(brandName).replace(/\s+/g, "").toUpperCase()}`);
      return lines.slice(0, 4);
    }
    async function renderBootlegStack(env, primaryFont, supportFont, brandName, ink, tag, meta, fontCache) {
      const bg = inkAndBg(ink);
      const text = applyBrandNameCase(brandName, primaryFont);
      const w = 640;
      const weight = primaryFont.weight_class || 800;
      const heroFontSize = autoFitFontSize(text, w - 60);
      const lines = buildBootlegLines(brandName, tag, meta);
      const lineFontSize = 20, lineGap = 34;
      const heroY = 95, ruleY = 150;
      const stackStartY = ruleY + 50;
      const framePadding = 36;
      const h = Math.round(stackStartY + lines.length * lineGap + framePadding);
      const stackedText = lines.map((line, i) => `
    <text x="${w / 2}" y="${stackStartY + i * lineGap}" text-anchor="middle"
          style="font-family:'${primaryFont.family_name}';font-weight:${weight};" fill="${ink}"
          font-size="${lineFontSize}" letter-spacing="0.12em">${escapeXML(line)}</text>`).join("");
      const inner = `
    <text x="${w / 2}" y="${heroY}" text-anchor="middle" dominant-baseline="middle"
          style="font-family:'${primaryFont.family_name}';font-weight:${weight};" fill="${ink}"
          font-size="${heroFontSize}">${escapeXML(text)}</text>
    <line x1="${framePadding}" y1="${ruleY}" x2="${w - framePadding}" y2="${ruleY}" stroke="${ink}" stroke-width="3"/>
    ${stackedText}
    <rect x="14" y="14" width="${w - 28}" height="${h - 28}" fill="none" stroke="${ink}" stroke-width="2"/>`;
      return identitySvgDoc(env, w, h, bg, [{ family_name: primaryFont.family_name, r2_key: primaryFont.r2_key, weight }], inner, fontCache);
    }

    function extractInitials(brandName) {
      const words = String(brandName).trim().split(/\s+/).filter(Boolean);
      if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
      return (words[0] || "?").slice(0, 1).toUpperCase();
    }
    const MONOGRAM_SHAPE_BY_CATEGORY = {
      premium: "circle", elegant: "circle", vintage: "circle", handwritten: "circle",
      streetwear: "hexagon", athletic: "hexagon", experimental: "hexagon",
      modern: "square", creative: "square"
    };
    function shapePathForVariant(variant, w, h, ink) {
      const cx = w / 2, cy = h / 2;
      if (variant === "hexagon") {
        const r = Math.min(w, h) * 0.46;
        const pts = [];
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i - Math.PI / 2;
          pts.push(`${(cx + r * Math.cos(angle)).toFixed(1)},${(cy + r * Math.sin(angle)).toFixed(1)}`);
        }
        return `<polygon points="${pts.join(" ")}" fill="none" stroke="${ink}" stroke-width="5"/>`;
      }
      if (variant === "square") {
        const s = Math.min(w, h) * 0.8;
        return `<rect x="${cx - s / 2}" y="${cy - s / 2}" width="${s}" height="${s}" rx="18" fill="none" stroke="${ink}" stroke-width="5"/>`;
      }
      const r = Math.min(w, h) * 0.46;
      return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${ink}" stroke-width="5"/>`;
    }
    async function renderMonogramMark(env, primaryFont, supportFont, brandName, ink, tag, meta, fontCache) {
      const bg = inkAndBg(ink);
      const initials = extractInitials(brandName);
      const w = 400, h = 400;
      const weight = primaryFont.weight_class || 700;
      const shapeVariant = MONOGRAM_SHAPE_BY_CATEGORY[tag] || "circle";
      const fontSize = initials.length > 1 ? 130 : 170;
      const inner = `
    ${shapePathForVariant(shapeVariant, w, h, ink)}
    <text x="${w / 2}" y="${h / 2}" text-anchor="middle" dominant-baseline="middle"
          style="font-family:'${primaryFont.family_name}';font-weight:${weight};" fill="${ink}"
          font-size="${fontSize}">${escapeXML(initials)}</text>`;
      return identitySvgDoc(env, w, h, bg, [{ family_name: primaryFont.family_name, r2_key: primaryFont.r2_key, weight }], inner, fontCache);
    }

    // 7. ORNATE_TAGLINE -- centered wordmark with a small flourish rule
    // above and a hairline-divided tagline below. Never invents copy: if
    // no real tagline was supplied, falls back to the personality tag
    // itself (real structural data, same principle as bootleg_stack's
    // EST. year fallback) rather than making up brand voice.
    async function renderOrnateTagline(env, primaryFont, supportFont, brandName, ink, tag, meta, fontCache) {
      const bg = inkAndBg(ink);
      const text = applyBrandNameCase(brandName, primaryFont);
      const w = 600, h = 240;
      const weight = primaryFont.weight_class || 500;
      const fontSize = autoFitFontSize(text, w - 120);
      const subLabel = meta.tagline ? String(meta.tagline).toUpperCase() : (tag || "").toUpperCase();
      const supFont = supportFont || primaryFont;
      const supWeight = supportFont ? (supportFont.weight_class || 400) : 400;
      const inner = `
    <line x1="${w / 2 - 70}" y1="70" x2="${w / 2 - 18}" y2="70" stroke="${ink}" stroke-width="1"/>
    <circle cx="${w / 2}" cy="70" r="3.5" fill="${ink}"/>
    <line x1="${w / 2 + 18}" y1="70" x2="${w / 2 + 70}" y2="70" stroke="${ink}" stroke-width="1"/>
    <text x="${w / 2}" y="120" text-anchor="middle" dominant-baseline="middle"
          style="font-family:'${primaryFont.family_name}';font-weight:${weight};" fill="${ink}"
          font-size="${fontSize}">${escapeXML(text)}</text>
    <line x1="${w / 2 - 90}" y1="155" x2="${w / 2 + 90}" y2="155" stroke="${ink}" stroke-width="0.75"/>
    ${subLabel ? `<text x="${w / 2}" y="185" text-anchor="middle"
          style="font-family:'${supFont.family_name}';font-weight:${supWeight};font-style:italic;" fill="${ink}"
          font-size="14" letter-spacing="0.15em">${escapeXML(subLabel)}</text>` : ""}`;
      const fontEntries = [{ family_name: primaryFont.family_name, r2_key: primaryFont.r2_key, weight }];
      if (supportFont) fontEntries.push({ family_name: supportFont.family_name, r2_key: supportFont.r2_key, weight: supWeight, style: "italic" });
      return identitySvgDoc(env, w, h, bg, fontEntries, inner, fontCache);
    }

    // 8. SCRIPT_SERIF_SCRIPT -- primary font set large and italicized to
    // read as script, a plain serif/sans support-font label underneath.
    // Same no-invented-copy fallback as above for the sub-label.
    async function renderScriptSerifScript(env, primaryFont, supportFont, brandName, ink, tag, meta, fontCache) {
      const bg = inkAndBg(ink);
      const text = applyBrandNameCase(brandName, primaryFont);
      const w = 600, h = 220;
      const weight = primaryFont.weight_class || 500;
      const fontSize = autoFitFontSize(text, w - 100);
      const subFont = supportFont || primaryFont;
      const subWeight = supportFont ? (supportFont.weight_class || 400) : 400;
      const subLabel = meta.tagline ? String(meta.tagline).toUpperCase() : (tag || "").toUpperCase();
      const inner = `
    <text x="${w / 2}" y="105" text-anchor="middle" dominant-baseline="middle"
          style="font-family:'${primaryFont.family_name}';font-weight:${weight};font-style:italic;" fill="${ink}"
          font-size="${fontSize}">${escapeXML(text)}</text>
    ${subLabel ? `<text x="${w / 2}" y="150" text-anchor="middle"
          style="font-family:'${subFont.family_name}';font-weight:${subWeight};" fill="${ink}"
          font-size="13" letter-spacing="0.3em">${escapeXML(subLabel)}</text>` : ""}`;
      const fontEntries = [{ family_name: primaryFont.family_name, r2_key: primaryFont.r2_key, weight, style: "italic" }];
      if (supportFont) fontEntries.push({ family_name: supportFont.family_name, r2_key: supportFont.r2_key, weight: subWeight });
      return identitySvgDoc(env, w, h, bg, fontEntries, inner, fontCache);
    }

    // 9. ARC_LABEL_SHADOW_WORD -- curved category label above a bold word
    // with an offset duplicate behind it for a drop-shadow effect.
    // Seeded with vinyl_geometry_caution=1 -- buildComboPool() already
    // filters this out automatically for print_method="vinyl" (the
    // overlapping shapes are hard to weed on vinyl), no extra code needed
    // here for that safety check.
    async function renderArcLabelShadowWord(env, primaryFont, supportFont, brandName, ink, tag, meta, fontCache) {
      const bg = inkAndBg(ink);
      const text = applyBrandNameCase(brandName, primaryFont);
      const w = 600, h = 260;
      const weight = primaryFont.weight_class || 700;
      const fontSize = autoFitFontSize(text, w - 140);
      const r = w * 0.32, cx = w / 2, cy = 100;
      const pathId = `arcsw_${Math.random().toString(36).slice(2, 8)}`;
      const shadowOffset = Math.max(4, Math.round(fontSize * 0.08));
      const shadowColor = ink === "#ffffff" ? "#8a8578" : "#c9c4b6";
      const inner = `
    <path id="${pathId}" d="M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}" fill="none"/>
    <text style="font-family:'${primaryFont.family_name}';font-weight:${weight};" fill="${ink}"
          font-size="14" letter-spacing="0.2em">
      <textPath href="#${pathId}" startOffset="50%" text-anchor="middle">${escapeXML((tag || "ORIGINAL").toUpperCase())}</textPath>
    </text>
    <text x="${cx + shadowOffset}" y="${190 + shadowOffset}" text-anchor="middle" dominant-baseline="middle"
          style="font-family:'${primaryFont.family_name}';font-weight:${weight};" fill="${shadowColor}"
          font-size="${fontSize}">${escapeXML(text)}</text>
    <text x="${cx}" y="190" text-anchor="middle" dominant-baseline="middle"
          style="font-family:'${primaryFont.family_name}';font-weight:${weight};" fill="${ink}"
          font-size="${fontSize}">${escapeXML(text)}</text>`;
      return identitySvgDoc(env, w, h, bg, [{ family_name: primaryFont.family_name, r2_key: primaryFont.r2_key, weight }], inner, fontCache);
    }

    // 10. BOXED_TAGLINE -- wordmark with a bordered banner beneath it.
    // Same no-invented-copy rule: falls back to "EST. <year>" (real
    // structural data) when no real tagline is supplied, matching
    // bootleg_stack's existing fallback pattern exactly.
    async function renderBoxedTagline(env, primaryFont, supportFont, brandName, ink, tag, meta, fontCache) {
      const bg = inkAndBg(ink);
      const text = applyBrandNameCase(brandName, primaryFont);
      const w = 600, h = 220;
      const weight = primaryFont.weight_class || 700;
      const fontSize = autoFitFontSize(text, w - 80);
      const boxLabel = meta.tagline ? String(meta.tagline).toUpperCase() : `EST. ${meta.foundedYear || new Date().getFullYear()}`;
      const boxW = Math.max(120, boxLabel.length * 8 + 40);
      const boxX = (w - boxW) / 2;
      const inner = `
    <text x="${w / 2}" y="95" text-anchor="middle" dominant-baseline="middle"
          style="font-family:'${primaryFont.family_name}';font-weight:${weight};" fill="${ink}"
          font-size="${fontSize}">${escapeXML(text)}</text>
    <rect x="${boxX}" y="130" width="${boxW}" height="34" fill="none" stroke="${ink}" stroke-width="1.5"/>
    <text x="${w / 2}" y="152" text-anchor="middle" dominant-baseline="middle"
          style="font-family:'${primaryFont.family_name}';font-weight:${weight};" fill="${ink}"
          font-size="12" letter-spacing="0.12em">${escapeXML(boxLabel)}</text>`;
      return identitySvgDoc(env, w, h, bg, [{ family_name: primaryFont.family_name, r2_key: primaryFont.r2_key, weight }], inner, fontCache);
    }

    // 11. WEIGHT_CONTRAST_WORD -- the brand name split in two, each half
    // in a different weight of the SAME font. Genuine weight contrast
    // only works when the font is actually variable (one embedded file,
    // a font-weight RANGE on its @font-face, each <tspan> requesting a
    // different explicit weight -- see identityFontFaceStyleBlock above).
    // For a non-variable font there is no second weight to reach for, so
    // this falls back to a tint-based faux-contrast instead of silently
    // rendering both halves identically.
    function splitWordForWeightContrast(text) {
      const s = String(text);
      const spaceIdx = s.indexOf(" ");
      if (spaceIdx > 0) return [s.slice(0, spaceIdx), s.slice(spaceIdx + 1)];
      const mid = Math.ceil(s.length / 2);
      return [s.slice(0, mid), s.slice(mid)];
    }
    async function renderWeightContrastWord(env, primaryFont, supportFont, brandName, ink, tag, meta, fontCache) {
      const bg = inkAndBg(ink);
      const [partA, partB] = splitWordForWeightContrast(applyBrandNameCase(brandName, primaryFont));
      const w = 600, h = 240;
      const fontSize = autoFitFontSize(partA + partB, w - 80);
      const isVariable = !!primaryFont.variable;
      const heavyWeight = isVariable ? 800 : (primaryFont.weight_class || 700);
      const lightWeight = isVariable ? 300 : (primaryFont.weight_class || 700);
      const lightFill = isVariable ? ink : (ink === "#ffffff" ? "#a8a396" : "#8a8578");
      const label = meta.city
        ? String(meta.city).toUpperCase()
        : `SINCE ${meta.foundedYear || new Date().getFullYear()}`;
      const inner = `
    <text x="${w / 2}" y="${h / 2 - 12}" text-anchor="middle" dominant-baseline="middle"
          font-size="${fontSize}"><tspan
          style="font-family:'${primaryFont.family_name}';font-weight:${heavyWeight};" fill="${ink}">${escapeXML(partA)}</tspan><tspan
          style="font-family:'${primaryFont.family_name}';font-weight:${lightWeight};" fill="${lightFill}">${escapeXML(partB)}</tspan></text>
    <text x="${w / 2}" y="${h / 2 + fontSize * 0.5}" text-anchor="middle"
          style="font-family:'${primaryFont.family_name}';font-weight:400;" fill="${ink}"
          font-size="12" letter-spacing="0.26em">${escapeXML(label)}</text>`;
      const fontEntry = isVariable
        ? { family_name: primaryFont.family_name, r2_key: primaryFont.r2_key, weightRange: [100, 900] }
        : { family_name: primaryFont.family_name, r2_key: primaryFont.r2_key, weight: primaryFont.weight_class || 700 };
      return identitySvgDoc(env, w, h, bg, [fontEntry], inner, fontCache);
    }

    // 12. LAUREL BADGE -- wordmark flanked by laurel branches, a grounding
    // rule beneath. Heritage/premium register -- fills the elegant/
    // premium gap identified earlier (nothing with real ceremonial
    // structure existed before this).
    function laurelLeafPath(size, ink) {
      return `<path d="M0,0 Q${size * 0.5},-${size * 0.32} ${size},0 Q${size * 0.5},${size * 0.32} 0,0 Z" fill="none" stroke="${ink}" stroke-width="1.6"/>`;
    }
    function laurelBranch(cx, cy, r0, r1, startDeg, endDeg, count, leafSize, side, ink) {
      let out = "";
      for (let i = 0; i < count; i++) {
        const t = count === 1 ? 0 : i / (count - 1);
        const deg = startDeg + t * (endDeg - startDeg);
        const r = r0 + t * (r1 - r0);
        const rad = (deg * Math.PI) / 180;
        const x = cx + side * r * Math.cos(rad);
        const y = cy - r * Math.sin(rad);
        const size = leafSize * (0.65 + 0.45 * t);
        const rot = side === 1 ? 90 - deg : 90 + deg + 180;
        out += `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${rot.toFixed(1)})">${laurelLeafPath(size, ink)}</g>`;
      }
      return out;
    }
    async function renderLaurelBadge(env, primaryFont, supportFont, brandName, ink, tag, meta, fontCache) {
      const bg = inkAndBg(ink);
      const text = applyBrandNameCase(brandName, primaryFont);
      const w = 640, h = 320;
      const weight = primaryFont.weight_class || 600;
      const cx = w / 2, cy = h / 2 + 10;
      const fontSize = autoFitFontSize(text, 260);
      const inner = `
    ${laurelBranch(cx, cy, 90, 130, -75, 75, 7, 26, -1, ink)}
    ${laurelBranch(cx, cy, 90, 130, -75, 75, 7, 26, 1, ink)}
    <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle"
          style="font-family:'${primaryFont.family_name}';font-weight:${weight};" fill="${ink}"
          font-size="${fontSize}">${escapeXML(text)}</text>
    <line x1="${cx - 70}" y1="${cy + 34}" x2="${cx + 70}" y2="${cy + 34}" stroke="${ink}" stroke-width="1"/>
    <text x="${cx}" y="${cy + 56}" text-anchor="middle"
          style="font-family:'${primaryFont.family_name}';font-weight:400;" fill="${ink}"
          font-size="13" letter-spacing="0.22em">EST. ${meta.foundedYear || new Date().getFullYear()}</text>`;
      return identitySvgDoc(env, w, h + 30, bg, [{ family_name: primaryFont.family_name, r2_key: primaryFont.r2_key, weight }], inner, fontCache);
    }

    // 13. RIBBON BANNER -- text on a fishtail-notched banner shape.
    // Vintage/athletic register.
    async function renderRibbonBanner(env, primaryFont, supportFont, brandName, ink, tag, meta, fontCache) {
      const bg = inkAndBg(ink);
      const text = applyBrandNameCase(brandName, primaryFont);
      const w = 640, h = 220;
      const weight = primaryFont.weight_class || 700;
      const bandY = 80, bandH = 90, bandX = 100, bandW = w - 200, notch = 26;
      const fontSize = autoFitFontSize(text, bandW - 60);
      const path = `M${bandX},${bandY} L${bandX + bandW},${bandY} L${bandX + bandW - notch},${bandY + bandH / 2} L${bandX + bandW},${bandY + bandH} L${bandX},${bandY + bandH} L${bandX + notch},${bandY + bandH / 2} Z`;
      const inner = `
    <path d="${path}" fill="none" stroke="${ink}" stroke-width="2.5"/>
    <text x="${w / 2}" y="${bandY + bandH / 2}" text-anchor="middle" dominant-baseline="middle"
          style="font-family:'${primaryFont.family_name}';font-weight:${weight};" fill="${ink}"
          font-size="${fontSize}" letter-spacing="0.05em">${escapeXML(text)}</text>`;
      return identitySvgDoc(env, w, h, bg, [{ family_name: primaryFont.family_name, r2_key: primaryFont.r2_key, weight }], inner, fontCache);
    }

    // 14. ORNATE STAMP SEAL -- double-ring border with radial tick marks
    // around the perimeter, like a wax seal or certification stamp.
    // Distinct from circle_badge (that one's a clean minimal ring with
    // curved text labels top/bottom); this one is deliberately more
    // ornate/decorative. Premium/vintage register.
    async function renderStampSeal(env, primaryFont, supportFont, brandName, ink, tag, meta, fontCache) {
      const bg = inkAndBg(ink);
      const text = applyBrandNameCase(brandName, primaryFont);
      const w = 500, h = 500;
      const weight = primaryFont.weight_class || 600;
      const cx = w / 2, cy = h / 2;
      const R = 190, r2 = 170;
      const fontSize = autoFitFontSize(text, R * 1.1);
      const ticks = [];
      const tickCount = 40;
      for (let i = 0; i < tickCount; i++) {
        const deg = (360 / tickCount) * i;
        const rad = (deg * Math.PI) / 180;
        const x1 = cx + (R + 6) * Math.cos(rad), y1 = cy + (R + 6) * Math.sin(rad);
        const x2 = cx + (R + 16) * Math.cos(rad), y2 = cy + (R + 16) * Math.sin(rad);
        ticks.push(`<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${ink}" stroke-width="2"/>`);
      }
      const stampPathId = `stamplabel_${Math.random().toString(36).slice(2, 8)}`;
      const stampLabel = `SINCE ${meta.foundedYear || new Date().getFullYear()}`;
      const inner = `
    ${ticks.join("")}
    <circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${ink}" stroke-width="2.5"/>
    <circle cx="${cx}" cy="${cy}" r="${r2}" fill="none" stroke="${ink}" stroke-width="1"/>
    <path id="${stampPathId}" d="M ${cx - r2 + 24} ${cy + 10} A ${r2 - 24} ${r2 - 24} 0 0 0 ${cx + r2 - 24} ${cy + 10}" fill="none"/>
    <text style="font-family:'${primaryFont.family_name}';font-weight:400;" fill="${ink}" font-size="11" letter-spacing="0.2em">
      <textPath href="#${stampPathId}" startOffset="50%" text-anchor="middle">${escapeXML(stampLabel)}</textPath>
    </text>
    <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle"
          style="font-family:'${primaryFont.family_name}';font-weight:${weight};" fill="${ink}"
          font-size="${fontSize}">${escapeXML(text)}</text>`;
      return identitySvgDoc(env, w, h, bg, [{ family_name: primaryFont.family_name, r2_key: primaryFont.r2_key, weight }], inner, fontCache);
    }

    // 15. SPLIT PANEL BLOCK -- two-tone color-blocked background with the
    // wordmark crossing the seam: knocked out (reads as background color)
    // over the filled panel via an SVG mask, solid ink over the empty
    // side via a proper clipPath (clipPathUnits="userSpaceOnUse" --
    // deliberately NOT an inline CSS clip-path with percentages, which
    // resolves against the text's own bounding box, not the canvas, and
    // would clip in the wrong place). Modern/bold/graphic register.
    async function renderSplitPanel(env, primaryFont, supportFont, brandName, ink, tag, meta, fontCache) {
      const bg = inkAndBg(ink);
      const text = applyBrandNameCase(brandName, primaryFont);
      const w = 640, h = 300;
      const weight = primaryFont.weight_class || 800;
      const fontSize = autoFitFontSize(text, w - 60);
      const leftPoly = `0,0 ${w * 0.55},0 ${w * 0.4},${h} 0,${h}`;
      const maskId = `splitmask_${Math.random().toString(36).slice(2, 8)}`;
      const clipId = `rightclip_${Math.random().toString(36).slice(2, 8)}`;
      const inner = `
    <defs>
      <mask id="${maskId}">
        <rect width="100%" height="100%" fill="white"/>
        <text x="${w / 2}" y="${h / 2}" text-anchor="middle" dominant-baseline="middle"
              style="font-family:'${primaryFont.family_name}';font-weight:${weight};" font-size="${fontSize}" fill="black">${escapeXML(text)}</text>
      </mask>
      <clipPath id="${clipId}" clipPathUnits="userSpaceOnUse">
        <polygon points="${w * 0.55},0 ${w},0 ${w},${h} ${w * 0.4},${h}"/>
      </clipPath>
    </defs>
    <polygon points="${leftPoly}" fill="${ink}" mask="url(#${maskId})"/>
    <g clip-path="url(#${clipId})">
      <text x="${w / 2}" y="${h / 2}" text-anchor="middle" dominant-baseline="middle"
            style="font-family:'${primaryFont.family_name}';font-weight:${weight};" fill="${ink}"
            font-size="${fontSize}">${escapeXML(text)}</text>
    </g>
    <rect x="0" y="0" width="${w}" height="${h}" fill="none" stroke="${ink}" stroke-width="1.5"/>`;
      return identitySvgDoc(env, w, h, bg, [{ family_name: primaryFont.family_name, r2_key: primaryFont.r2_key, weight }], inner, fontCache);
    }

    // 16. COMBINATION LOCKUP -- a real icon+wordmark lockup: monogram
    // initials in a bordered square on the left, full brand name +
    // personality-tag label stacked beside it. Different from
    // monogram_mark (initials alone) -- this is the combined mark real
    // brand systems use when both the icon and the full name need to
    // appear together. Broadly applicable register, same breadth as
    // monogram_mark.
    async function renderCombinationLockup(env, primaryFont, supportFont, brandName, ink, tag, meta, fontCache) {
      const bg = inkAndBg(ink);
      const initials = extractInitials(brandName);
      const text = applyBrandNameCase(brandName, primaryFont);
      const w = 640, h = 260;
      const weight = primaryFont.weight_class || 700;
      const markSize = 150;
      const markCx = 130, markCy = h / 2;
      const nameFontSize = autoFitFontSize(text, w - 280);
      const inner = `
    <rect x="${markCx - markSize / 2}" y="${markCy - markSize / 2}" width="${markSize}" height="${markSize}" rx="14" fill="none" stroke="${ink}" stroke-width="3"/>
    <text x="${markCx}" y="${markCy}" text-anchor="middle" dominant-baseline="middle"
          style="font-family:'${primaryFont.family_name}';font-weight:${weight};" fill="${ink}"
          font-size="${markSize * 0.42}">${escapeXML(initials)}</text>
    <line x1="240" y1="${h / 2 - 30}" x2="240" y2="${h / 2 + 30}" stroke="${ink}" stroke-width="1"/>
    <text x="270" y="${h / 2 - 6}" text-anchor="start" dominant-baseline="middle"
          style="font-family:'${primaryFont.family_name}';font-weight:${weight};" fill="${ink}"
          font-size="${nameFontSize}">${escapeXML(text)}</text>
    <text x="270" y="${h / 2 + 22}" text-anchor="start" dominant-baseline="middle" fill="${ink}"
          font-size="14" letter-spacing="0.2em">${escapeXML((tag || "ORIGINAL").toUpperCase())}</text>`;
      return identitySvgDoc(env, w, h, bg, [{ family_name: primaryFont.family_name, r2_key: primaryFont.r2_key, weight }], inner, fontCache);
    }

    // 17. PATTERN TILE MARK -- a repeating dot pattern fills a bordered
    // panel, with the wordmark knocked out of it (mask, same technique as
    // split_panel's filled side) so the letters read as background color
    // against the textured fill. Creative/experimental/graphic register.
    async function renderPatternTile(env, primaryFont, supportFont, brandName, ink, tag, meta, fontCache) {
      const bg = inkAndBg(ink);
      const text = applyBrandNameCase(brandName, primaryFont);
      const w = 640, h = 320;
      const weight = primaryFont.weight_class || 800;
      // Tighter fit width than a normal wordmark -- this leaves real
      // margin for the solid text plate below to stay well inside the
      // bordered pattern area rather than overflowing it. Verified
      // numerically before shipping: for a 10-char name this leaves
      // ~47px of visible pattern on each side of the plate, and a
      // 23-char stress-test name still fits inside the border.
      const fontSize = autoFitFontSize(text, w - 220);
      const patId = `dotpat_${Math.random().toString(36).slice(2, 8)}`;
      // A knockout mask (text carved as empty space out of the dot
      // field) looked clean with a plain "Brand Name" sample, but real
      // names showed a genuine legibility problem: a dot-based pattern
      // can't tile cleanly against curved letter strokes, so the
      // knocked-out letterforms read as noisy/jagged rather than clean
      // text. Fixed by giving the text its own solid background-color
      // plate to sit on, sized from the same char-width estimate
      // autoFitFontSize itself uses, so it's never fighting the pattern
      // -- the dots remain a genuine border/frame effect around the
      // text instead of a background the text has to compete with.
      const estTextWidth = text.length * fontSize * 0.62;
      const plateW = estTextWidth + 64;
      const plateH = fontSize * 1.5;
      const inner = `
    <defs>
      <pattern id="${patId}" width="18" height="18" patternUnits="userSpaceOnUse">
        <circle cx="4" cy="4" r="2" fill="${ink}"/>
      </pattern>
    </defs>
    <rect x="30" y="30" width="${w - 60}" height="${h - 60}" fill="url(#${patId})"/>
    <rect x="30" y="30" width="${w - 60}" height="${h - 60}" fill="none" stroke="${ink}" stroke-width="2"/>
    <rect x="${(w / 2 - plateW / 2).toFixed(1)}" y="${(h / 2 - plateH / 2).toFixed(1)}" width="${plateW.toFixed(1)}" height="${plateH.toFixed(1)}" fill="${bg}"/>
    <text x="${w / 2}" y="${h / 2}" text-anchor="middle" dominant-baseline="middle"
          style="font-family:'${primaryFont.family_name}';font-weight:${weight};" font-size="${fontSize}" fill="${ink}">${escapeXML(text)}</text>`;
      return identitySvgDoc(env, w, h, bg, [{ family_name: primaryFont.family_name, r2_key: primaryFont.r2_key, weight }], inner, fontCache);
    }


    // 18. INTERLOCK MONOGRAM -- two initials genuinely interlocked via
    // SVG masking, not just placed side by side: the second letter is
    // cut away wherever it overlaps the first letter's real rendered
    // glyph shape, giving a woven look like real fashion-house
    // monograms (LV, CC, GG). This uses actual rendered text as the
    // mask, so it works correctly with real embedded custom fonts, not
    // just as a system-font approximation -- verified against real
    // coordinate output before this went in, not just eyeballed.
    //
    // Three treatment styles, chosen per generation:
    //   - weight: same font, contrasting weight. Variable fonts get a
    //     real weight range (matches weight_contrast_word's proven
    //     approach); static fonts can't actually render two different
    //     weights from one file, so the back letter's fill is muted
    //     instead -- same compensation weight_contrast_word already
    //     uses for the identical limitation.
    //   - size: one dominant letter, one smaller letter nested into it.
    //   - pairing: primaryFont for the front letter, supportFont for
    //     the back -- a genuine two-font pairing, not a same-family
    //     variation. Falls back to weight-contrast if no supportFont
    //     was assigned for this generation.
    //
    // Positioning uses text-anchor="end"/"start" around a shared center
    // point rather than hand-tuned absolute coordinates, so the overlap
    // zone adapts to each letter's actual rendered width instead of
    // only looking right for the specific "M"/"B" pair it was
    // prototyped with.
    // Icons are stored as raw inner-SVG markup (not a full <svg> wrapper)
    // in the `icons` table, single-color via currentColor so they take
    // on whatever `ink` the archetype is using. Small in-request cache
    // (icons are tiny -- a few hundred bytes to a few KB of path data --
    // so no R2/base64 round trip needed at all, unlike fonts).
    async function identityFetchIcon(env, iconId, iconCache) {
      if (iconCache && iconCache.has(iconId)) return iconCache.get(iconId);
      const row = await env.DB.prepare(`SELECT svg_content FROM icons WHERE icon_id = ? AND approved = 1`)
        .bind(iconId).first();
      if (!row) throw new Error(`Icon '${iconId}' not found or not approved`);
      if (iconCache) iconCache.set(iconId, row.svg_content);
      return row.svg_content;
    }

    // Wraps fetched icon markup in a positioned, scaled <g> -- icons are
    // authored on a 0-200 viewBox, so scale = size/200 maps consistently
    // regardless of where in a composition they're placed.
    function iconGroup(svgContent, cx, cy, size, ink) {
      const scale = size / 200;
      return `<g transform="translate(${(cx - size / 2).toFixed(1)},${(cy - size / 2).toFixed(1)}) scale(${scale.toFixed(4)})" style="color:${ink};">${svgContent}</g>`;
    }

    // Pool-based icon selection -- same principle getFontPoolForCategory
    // already uses for fonts: query a real pool, prefer tag-matched rows,
    // fall back to the broader pool if nothing matches the current
    // personality tag exactly, pick randomly. This is what lets a
    // handful of generic archetypes each draw from many real icons
    // instead of needing one bespoke archetype per icon. selector is
    // either { registers: [...] } for a broad register-based pool, or
    // { iconIds: [...] } for an explicit whitelist -- some icons are
    // shape-specific (a linear divider element doesn't work squeezed
    // into a circular medallion slot), so a whitelist stays available
    // for archetypes that need one, rather than only ever allowing
    // free-for-all register-wide picking.
    async function identityPickIcon(env, tag, selector, iconCache) {
      let sql, params;
      if (selector.iconIds && selector.iconIds.length) {
        const placeholders = selector.iconIds.map(() => "?").join(",");
        sql = `SELECT icon_id, svg_content, tags FROM icons WHERE icon_id IN (${placeholders}) AND approved = 1`;
        params = selector.iconIds;
      } else {
        const placeholders = selector.registers.map(() => "?").join(",");
        sql = `SELECT icon_id, svg_content, tags FROM icons WHERE register IN (${placeholders}) AND approved = 1`;
        params = selector.registers;
      }
      const res = await env.DB.prepare(sql).bind(...params).all();
      const rows = res.results || [];
      if (!rows.length) throw new Error(`No approved icons found for selector ${JSON.stringify(selector)}`);
      const tagMatched = tag ? rows.filter((r) => JSON.parse(r.tags).includes(tag)) : [];
      const pool = tagMatched.length ? tagMatched : rows;
      const picked = pool[Math.floor(Math.random() * pool.length)];
      if (iconCache) iconCache.set(picked.icon_id, picked.svg_content);
      return picked;
    }

    async function renderInterlockMonogram(env, primaryFont, supportFont, brandName, ink, tag, meta, fontCache) {
      const bg = inkAndBg(ink);
      const initials = extractInitials(brandName);
      const letterA = initials[0] || "?";
      const letterB = initials[1] || initials[0] || "?";
      const w = 320, h = 320;
      const cx = w / 2, cy = h / 2 + 30;
      const isVariable = !!primaryFont.variable;

      let style = ["weight", "size", "pairing"][Math.floor(Math.random() * 3)];
      if (style === "pairing" && !supportFont) style = "weight";

      let faWeight, fbWeight, faSize, fbSize, fbFamily, fbR2Key, fbFillMuted = false;
      const baseSize = 190;

      if (style === "pairing") {
        faWeight = primaryFont.weight_class || 700;
        fbWeight = supportFont.weight_class || 400;
        faSize = baseSize; fbSize = baseSize;
        fbFamily = supportFont.family_name; fbR2Key = supportFont.r2_key;
      } else if (style === "size") {
        faWeight = primaryFont.weight_class || 700;
        fbWeight = faWeight;
        faSize = 220; fbSize = 130;
        fbFamily = primaryFont.family_name; fbR2Key = primaryFont.r2_key;
      } else { // weight
        faSize = baseSize; fbSize = baseSize;
        fbFamily = primaryFont.family_name; fbR2Key = primaryFont.r2_key;
        if (isVariable) {
          faWeight = 800; fbWeight = 300;
        } else {
          faWeight = primaryFont.weight_class || 700;
          fbWeight = faWeight;
          fbFillMuted = true;
        }
      }

      const overlap = style === "size" ? 0 : 14;
      const fbFill = fbFillMuted ? (ink === "#ffffff" ? "#a8a396" : "#8a8578") : ink;
      const maskId = `interlockmask_${Math.random().toString(36).slice(2, 8)}`;

      let letterAMarkup, letterBMarkup;
      if (style === "size") {
        letterAMarkup = `<text x="${cx - 20}" y="${cy}" text-anchor="middle" dominant-baseline="middle" style="font-family:'${primaryFont.family_name}';font-weight:${faWeight};" font-size="${faSize}">${escapeXML(letterA)}</text>`;
        letterBMarkup = `<text x="${cx + 42}" y="${cy - 34}" text-anchor="middle" dominant-baseline="middle" style="font-family:'${fbFamily}';font-weight:${fbWeight};" font-size="${fbSize}">${escapeXML(letterB)}</text>`;
      } else {
        letterAMarkup = `<text x="${cx + overlap}" y="${cy}" text-anchor="end" dominant-baseline="middle" style="font-family:'${primaryFont.family_name}';font-weight:${faWeight};" font-size="${faSize}">${escapeXML(letterA)}</text>`;
        letterBMarkup = `<text x="${cx - overlap}" y="${cy}" text-anchor="start" dominant-baseline="middle" style="font-family:'${fbFamily}';font-weight:${fbWeight};" font-size="${fbSize}">${escapeXML(letterB)}</text>`;
      }

      const inner = `
    <defs>
      <mask id="${maskId}">
        <rect width="100%" height="100%" fill="white"/>
        <g fill="black">${letterAMarkup}</g>
      </mask>
    </defs>
    <g fill="${ink}">${letterAMarkup}</g>
    <g mask="url(#${maskId})" fill="${fbFill}">${letterBMarkup}</g>`;

      const fontEntries = [];
      if (style === "pairing") {
        fontEntries.push({ family_name: primaryFont.family_name, r2_key: primaryFont.r2_key, weight: faWeight });
        fontEntries.push({ family_name: supportFont.family_name, r2_key: supportFont.r2_key, weight: fbWeight });
      } else if (style === "weight" && isVariable) {
        fontEntries.push({ family_name: primaryFont.family_name, r2_key: primaryFont.r2_key, weightRange: [100, 900] });
      } else {
        fontEntries.push({ family_name: primaryFont.family_name, r2_key: primaryFont.r2_key, weight: primaryFont.weight_class || 700 });
      }
      return identitySvgDoc(env, w, h, bg, fontEntries, inner, fontCache);
    }

    // 19. WREATH LOCKUP -- the closed badge-wreath-mini icon wrapped
    // around a full two-line brand name (name + tagline/category
    // label), not just initials. Icon fetched from the icons table at
    // generation time, same tag-eligibility principle as fonts.
    async function renderWreathLockup(env, primaryFont, supportFont, brandName, ink, tag, meta, fontCache, iconCache) {
      const bg = inkAndBg(ink);
      const text = applyBrandNameCase(brandName, primaryFont);
      const w = 360, h = 360;
      const cx = 180, cy = 180;
      const weight = primaryFont.weight_class || 700;
      const iconSvg = await identityFetchIcon(env, "badge-wreath-mini", iconCache);
      const nameFontSize = autoFitFontSize(text, 190);
      const label = (tag || "ORIGINAL").toUpperCase();
      const inner = `
    ${iconGroup(iconSvg, cx, cy, 250, ink)}
    <text x="${cx}" y="${cy - 6}" text-anchor="middle" style="font-family:'${primaryFont.family_name}';font-weight:${weight};" font-size="${nameFontSize}" fill="${ink}">${escapeXML(text)}</text>
    <line x1="${cx - 36}" y1="${cy + 12}" x2="${cx + 36}" y2="${cy + 12}" stroke="${ink}" stroke-width="1"/>
    <text x="${cx}" y="${cy + 30}" text-anchor="middle" font-weight="400" font-size="11" letter-spacing="0.2em" fill="${ink}">${escapeXML(label)}</text>`;
      return identitySvgDoc(env, w, h, bg, [{ family_name: primaryFont.family_name, r2_key: primaryFont.r2_key, weight }], inner, fontCache);
    }

    // 20. SEAL MEDALLION -- the badge-seal-scallop icon with two
    // independent curved text paths (name on top, category label on
    // bottom) inside the ring, same textPath mechanism stamp_seal
    // already uses. Icon fetched from the icons table.
    async function renderSealMedallion(env, primaryFont, supportFont, brandName, ink, tag, meta, fontCache, iconCache) {
      const bg = inkAndBg(ink);
      const text = applyBrandNameCase(brandName, primaryFont);
      const w = 360, h = 360;
      const cx = 180, cy = 180;
      const weight = primaryFont.weight_class || 700;
      const iconSvg = await identityFetchIcon(env, "badge-seal-scallop", iconCache);
      const nameFontSize = autoFitFontSize(text, 92);
      const label = (tag || "GOODS CO.").toUpperCase();
      const topId = `sealtop_${Math.random().toString(36).slice(2, 8)}`;
      const botId = `sealbot_${Math.random().toString(36).slice(2, 8)}`;
      const inner = `
    ${iconGroup(iconSvg, cx, cy, 260, ink)}
    <path id="${topId}" d="M ${cx - 46} ${cy + 6} A 46 46 0 0 1 ${cx + 46} ${cy + 6}" fill="none"/>
    <path id="${botId}" d="M ${cx - 40} ${cy + 18} A 40 40 0 0 0 ${cx + 40} ${cy + 18}" fill="none"/>
    <text style="font-family:'${primaryFont.family_name}';font-weight:${weight};" font-size="${nameFontSize}" letter-spacing="0.06em" fill="${ink}">
      <textPath href="#${topId}" startOffset="50%" text-anchor="middle">${escapeXML(text)}</textPath>
    </text>
    <text font-weight="400" font-size="10" letter-spacing="0.18em" fill="${ink}">
      <textPath href="#${botId}" startOffset="50%" text-anchor="middle">${escapeXML(label)}</textPath>
    </text>`;
      return identitySvgDoc(env, w, h, bg, [{ family_name: primaryFont.family_name, r2_key: primaryFont.r2_key, weight }], inner, fontCache);
    }

    // 22. ICON ACCENT WORDMARK -- small icon above a bold centered
    // wordmark. Draws from a broad pool (y2k/fun/line-art/geo-floral),
    // tag-preferred, so this single archetype expresses many different
    // icons rather than needing one archetype per icon.
    async function renderIconAccentWordmark(env, primaryFont, supportFont, brandName, ink, tag, meta, fontCache, iconCache) {
      const bg = inkAndBg(ink);
      const text = applyBrandNameCase(brandName, primaryFont);
      const w = 480, h = 280;
      const weight = primaryFont.weight_class || 700;
      const icon = await identityPickIcon(env, tag, { registers: ["y2k", "fun", "line-art", "geo-floral"] }, iconCache);
      const fontSize = autoFitFontSize(text, w - 60);
      const inner = `
    ${iconGroup(icon.svg_content, w / 2, 80, 68, ink)}
    <text x="${w / 2}" y="200" text-anchor="middle" style="font-family:'${primaryFont.family_name}';font-weight:${weight};" font-size="${fontSize}" fill="${ink}">${escapeXML(text)}</text>`;
      return identitySvgDoc(env, w, h, bg, [{ family_name: primaryFont.family_name, r2_key: primaryFont.r2_key, weight }], inner, fontCache);
    }

    // 23. ICON MEDALLION HERO -- the icon is the dominant centerpiece,
    // brand name sits smaller beneath it. Pool is y2k specifically --
    // that register's icons are generally compact/radial shapes
    // (flame, smiley, heart-dagger, spiderweb, spiky-star etc.), which
    // reads as a genuine hero image at large scale, unlike the two
    // deliberately-linear icons (barbed wire, chain link) that are
    // reserved for icon_divider_rule instead.
    async function renderIconMedallionHero(env, primaryFont, supportFont, brandName, ink, tag, meta, fontCache, iconCache) {
      const bg = inkAndBg(ink);
      const text = applyBrandNameCase(brandName, primaryFont);
      const w = 360, h = 380;
      const weight = primaryFont.weight_class || 700;
      const icon = await identityPickIcon(env, tag, { registers: ["y2k"] }, iconCache);
      const fontSize = autoFitFontSize(text, w - 60);
      const inner = `
    ${iconGroup(icon.svg_content, w / 2, 150, 200, ink)}
    <text x="${w / 2}" y="300" text-anchor="middle" style="font-family:'${primaryFont.family_name}';font-weight:${weight};" font-size="${fontSize}" fill="${ink}">${escapeXML(text)}</text>`;
      return identitySvgDoc(env, w, h, bg, [{ family_name: primaryFont.family_name, r2_key: primaryFont.r2_key, weight }], inner, fontCache);
    }

    // 24. ICON DIVIDER RULE -- brand name, then a real decorative
    // element standing in for a plain rule line, then a small label.
    // Explicit icon_id whitelist rather than a register: barbed wire
    // and chain link are the only two current icons genuinely shaped
    // for a horizontal divider slot -- a flame or smiley squeezed into
    // this shape wouldn't read correctly, so this deliberately does not
    // pull from the whole y2k register the way the hero archetype does.
    async function renderIconDividerRule(env, primaryFont, supportFont, brandName, ink, tag, meta, fontCache, iconCache) {
      const bg = inkAndBg(ink);
      const text = applyBrandNameCase(brandName, primaryFont);
      const w = 460, h = 220;
      const weight = primaryFont.weight_class || 700;
      const icon = await identityPickIcon(env, tag, { iconIds: ["y2k-barbed-wire", "streetwear-chain-link"] }, iconCache);
      const fontSize = autoFitFontSize(text, w - 60);
      const label = (tag || "ORIGINAL").toUpperCase();
      const inner = `
    <text x="${w / 2}" y="90" text-anchor="middle" style="font-family:'${primaryFont.family_name}';font-weight:${weight};" font-size="${fontSize}" fill="${ink}">${escapeXML(text)}</text>
    ${iconGroup(icon.svg_content, w / 2, 140, 60, ink)}
    <text x="${w / 2}" y="185" text-anchor="middle" font-weight="400" font-size="11" letter-spacing="0.2em" fill="${ink}">${escapeXML(label)}</text>`;
      return identitySvgDoc(env, w, h, bg, [{ family_name: primaryFont.family_name, r2_key: primaryFont.r2_key, weight }], inner, fontCache);
    }

    // 25. TEXTURE PANEL BADGE -- the halftone/distressed texture fills a
    // bordered panel as a genuine border/frame effect. Originally a
    // knockout (text carved as empty space out of the texture), same
    // fix as pattern_tile: real names showed the knocked-out letterforms
    // reading as noisy/jagged against the texture's own randomness, so
    // the text now sits on its own solid background-color plate instead
    // -- always cleanly legible regardless of the pattern.
    async function renderTexturePanelBadge(env, primaryFont, supportFont, brandName, ink, tag, meta, fontCache, iconCache) {
      const bg = inkAndBg(ink);
      const text = applyBrandNameCase(brandName, primaryFont);
      const w = 340, h = 340;
      const weight = primaryFont.weight_class || 800;
      const icon = await identityFetchIcon(env, "texture-halftone-distressed", iconCache);
      // Tighter fit width leaves real margin for the plate -- verified
      // numerically before shipping: ~27px of visible texture on each
      // side of the plate for a typical name.
      const fontSize = autoFitFontSize(text, w - 140);
      const estTextWidth = text.length * fontSize * 0.62;
      const plateW = estTextWidth + 48;
      const plateH = fontSize * 1.5;
      const inner = `
    <rect x="20" y="20" width="${w - 40}" height="${h - 40}" fill="none" stroke="${ink}" stroke-width="3"/>
    ${iconGroup(icon, w / 2, h / 2, w - 40, ink)}
    <rect x="${(w / 2 - plateW / 2).toFixed(1)}" y="${(h / 2 - plateH / 2).toFixed(1)}" width="${plateW.toFixed(1)}" height="${plateH.toFixed(1)}" fill="${bg}"/>
    <text x="${w / 2}" y="${h / 2}" text-anchor="middle" dominant-baseline="middle"
          style="font-family:'${primaryFont.family_name}';font-weight:${weight};" font-size="${fontSize}" fill="${ink}">${escapeXML(text)}</text>`;
      return identitySvgDoc(env, w, h, bg, [{ family_name: primaryFont.family_name, r2_key: primaryFont.r2_key, weight }], inner, fontCache);
    }

    const IDENTITY_ARCHETYPE_RENDERERS = {
      wordmark: renderWordmark,
      arc_label_stack: renderArcLabelStack,
      split_connector: renderSplitConnector,
      circle_badge: renderCircleBadge,
      bootleg_stack: renderBootlegStack,
      monogram_mark: renderMonogramMark,
      interlock_monogram: renderInterlockMonogram,
      ornate_tagline: renderOrnateTagline,
      script_serif_script: renderScriptSerifScript,
      arc_label_shadow_word: renderArcLabelShadowWord,
      boxed_tagline: renderBoxedTagline,
      weight_contrast_word: renderWeightContrastWord,
      laurel_badge: renderLaurelBadge,
      ribbon_banner: renderRibbonBanner,
      stamp_seal: renderStampSeal,
      split_panel: renderSplitPanel,
      combination_lockup: renderCombinationLockup,
      pattern_tile: renderPatternTile,
      wreath_lockup: renderWreathLockup,
      seal_medallion: renderSealMedallion,
      icon_accent_wordmark: renderIconAccentWordmark,
      icon_medallion_hero: renderIconMedallionHero,
      icon_divider_rule: renderIconDividerRule,
      texture_panel_badge: renderTexturePanelBadge
    };
    const IDENTITY_ARCHETYPES_NEEDING_SUPPORT_FONT = new Set(["split_connector", "ornate_tagline", "script_serif_script", "interlock_monogram"]);

    // ── color engine (unchanged, pure math, no D1/R2 dependency) ──
    const IDENTITY_CATEGORY_HUE_RANGES = {
      premium: [220, 260], elegant: [330, 350], vintage: [20, 45], athletic: [10, 30],
      streetwear: [0, 0], modern: [190, 210], creative: [40, 60], handwritten: [340, 20],
      experimental: [270, 300]
    };
    function identityHslToHex(h, s, l) {
      s /= 100; l /= 100;
      const k = (n) => (n + h / 30) % 12;
      const a = s * Math.min(l, 1 - l);
      const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
      const toHex = (x) => Math.round(255 * x).toString(16).padStart(2, "0");
      return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
    }
    function identityHexToHsl(hex) {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      let h, s, l = (max + min) / 2;
      if (max === min) { h = s = 0; }
      else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h *= 60;
      }
      return { h, s: s * 100, l: l * 100 };
    }
    function identityIsDark(hex) {
      const { l } = identityHexToHsl(hex);
      return l < 50;
    }
    function derivePalette(categoryTag, baseColorHex = null) {
      let h, s, l;
      if (baseColorHex) {
        ({ h, s, l } = identityHexToHsl(baseColorHex));
      } else {
        const range = IDENTITY_CATEGORY_HUE_RANGES[categoryTag] || [200, 220];
        h = range[0] === range[1] ? range[0] : range[0] + Math.random() * (range[1] - range[0]);
        s = categoryTag === "streetwear" ? 5 : 55;
        l = 45;
      }
      const base = baseColorHex || identityHslToHex(h, s, l);
      const shade = identityHslToHex(h, s, Math.max(l - 28, 8));
      const tint = identityHslToHex(h, Math.max(s - 20, 5), Math.min(l + 42, 95));
      const ink = identityIsDark(base) ? "#ffffff" : "#000000";
      return { base, shade, tint, ink, category_tag: categoryTag };
    }

    // ── font engine, rewritten against raw env.DB.prepare() ──
    async function getFontPoolForCategory(env, categoryTag, printMethod = "dtf") {
      let sql = `SELECT font_id, family_name, category_tag, r2_key, variable, weight_class, vinyl_capable, case_style
                 FROM fonts WHERE category_tag = ? AND approved = 1`;
      const params = [categoryTag];
      if (printMethod === "vinyl") sql += " AND vinyl_capable = 1";
      const res = await env.DB.prepare(sql).bind(...params).all();
      return res.results || [];
    }
    async function getPairingPartnerPool(env, primaryCategoryTag, printMethod = "dtf") {
      const partnersRes = await env.DB.prepare(`SELECT partner_category FROM font_pairing_partners WHERE primary_category = ?`).bind(primaryCategoryTag).all();
      const partners = partnersRes.results || [];
      if (!partners.length) return [];
      const categories = partners.map((p) => p.partner_category);
      const placeholders = categories.map(() => "?").join(",");
      let sql = `SELECT font_id, family_name, category_tag, r2_key, variable, weight_class, case_style
                 FROM fonts WHERE category_tag IN (${placeholders}) AND approved = 1`;
      if (printMethod === "vinyl") sql += " AND vinyl_capable = 1";
      const res = await env.DB.prepare(sql).bind(...categories).all();
      return res.results || [];
    }
    function canSelfPair(font) {
      return !!font.variable;
    }
    async function pickFontPairing(env, primaryCategoryTag, needsSupport, printMethod = "dtf") {
      const primaryPool = await getFontPoolForCategory(env, primaryCategoryTag, printMethod);
      if (!primaryPool.length) {
        throw new Error(`No approved, print-eligible fonts in category "${primaryCategoryTag}" for print_method="${printMethod}"`);
      }
      const primary = primaryPool[Math.floor(Math.random() * primaryPool.length)];
      if (!needsSupport) return { primary, support: null };
      if (canSelfPair(primary)) return { primary, support: primary };
      const partnerPool = await getPairingPartnerPool(env, primaryCategoryTag, printMethod);
      if (partnerPool.length) {
        const support = partnerPool[Math.floor(Math.random() * partnerPool.length)];
        return { primary, support };
      }
      const workhorsePool = await getFontPoolForCategory(env, "modern", printMethod);
      if (workhorsePool.length) {
        const support = workhorsePool[Math.floor(Math.random() * workhorsePool.length)];
        return { primary, support };
      }
      return { primary, support: primary };
    }
    async function buildComboPool(env, archetypeRows, personalityTag, printMethod, productType) {
      const eligibleArchetypes = archetypeRows.filter((a) => {
        const tags = JSON.parse(a.tags);
        return tags.includes(personalityTag) && a.active;
      });
      if (productType === "cap") {
        eligibleArchetypes.sort((a, b) => b.curved_friendly - a.curved_friendly);
      }
      const filtered = printMethod === "vinyl" ? eligibleArchetypes.filter((a) => !a.vinyl_geometry_caution) : eligibleArchetypes;
      const pool = [];
      for (const archetype of (filtered.length ? filtered : eligibleArchetypes)) {
        if (!IDENTITY_ARCHETYPE_RENDERERS[archetype.archetype_id]) continue; // defensive: skip any archetype seeded without a matching render function
        const fonts = await getFontPoolForCategory(env, personalityTag, printMethod);
        for (const font of fonts) {
          pool.push({ combo_id: `${archetype.archetype_id}::${font.font_id}`, archetype_id: archetype.archetype_id, font, curved_friendly: !!archetype.curved_friendly });
        }
      }
      return pool;
    }
    // Picks n combos from a pool, preferring distinct archetypes first,
    // then filling with anything not-yet-picked, then -- only if the pool
    // is genuinely too small to avoid it -- falling back to allowing a
    // repeat of something already shown in an earlier round. This is the
    // "never return fewer than requested" guarantee: a small pool (few
    // approved fonts x few eligible archetypes) degrades to an occasional
    // repeat rather than silently shortchanging the round.
    function pickNFromPool(pool, n, excludeComboIds = []) {
      if (!pool.length) return { picks: [], usedFallback: false };
      const available = pool.filter((c) => !excludeComboIds.includes(c.combo_id));
      const distinctArchetypeCount = new Set(available.map((c) => c.archetype_id)).size;
      const shuffled = [...available].sort(() => Math.random() - 0.5);
      const picks = [];
      const usedArchetypes = new Set();
      for (const combo of shuffled) {
        if (picks.length >= n) break;
        if (usedArchetypes.has(combo.archetype_id) && usedArchetypes.size < distinctArchetypeCount) continue;
        picks.push(combo);
        usedArchetypes.add(combo.archetype_id);
      }
      for (const combo of shuffled) {
        if (picks.length >= n) break;
        if (!picks.includes(combo)) picks.push(combo);
      }
      let usedFallback = false;
      if (picks.length < n) {
        // Pool (after excluding already-shown) is smaller than what's
        // needed -- fall back to the FULL pool, repeats allowed, rather
        // than returning short.
        usedFallback = true;
        const fullShuffled = [...pool].sort(() => Math.random() - 0.5);
        for (const combo of fullShuffled) {
          if (picks.length >= n) break;
          if (!picks.includes(combo)) picks.push(combo);
        }
      }
      return { picks: picks.slice(0, n), usedFallback };
    }
    // Every round: 2 concepts from the requested personality tag, and
    // ALWAYS 1 from the "experimental" tag specifically -- a standing
    // guarantee, not gated behind creative_mode anymore (creative_mode is
    // still accepted for backward compatibility but no longer changes
    // this behavior -- it was already folding experimental into the same
    // pool rather than reserving it a real slot, which is what was
    // actually requested).
    async function pickConceptsForRound(mainPool, experimentalPool, excludeComboIds) {
      const mainResult = pickNFromPool(mainPool, 2, excludeComboIds);
      let experimentalResult = pickNFromPool(experimentalPool, 1, excludeComboIds);
      let experimentalSubstituted = false;
      if (!experimentalResult.picks.length) {
        // No experimental combos exist at all for this product/print
        // method (e.g. no experimental fonts approved yet) -- rather than
        // returning only 2, fill the 3rd slot from the main pool instead
        // and say so explicitly in the response, so this is visible
        // rather than silently degrading the "always 1 experimental"
        // guarantee.
        experimentalSubstituted = true;
        const usedIds = mainResult.picks.map((p) => p.combo_id);
        experimentalResult = pickNFromPool(mainPool, 1, [...excludeComboIds, ...usedIds]);
      }
      const picks = [...mainResult.picks, ...experimentalResult.picks];
      return {
        picks,
        poolExhausted: mainResult.usedFallback || experimentalResult.usedFallback,
        experimentalSubstituted
      };
    }


    // ── brand-identity model helpers (raw D1; resolveBrand() above is
    // reused directly for brand lookup rather than duplicating it) ──
    async function getArchetypeRows(env) {
      const res = await env.DB.prepare(`SELECT * FROM archetypes WHERE active = 1`).all();
      return res.results || [];
    }
    async function getProductPrintMethod(env, productId) {
      if (!productId) return "dtf";
      const spec = await env.DB.prepare(`SELECT print_method FROM product_print_specs WHERE product_id = ?`).bind(productId).first();
      return spec?.print_method || "dtf";
    }
    async function incrementGenerationRound(env, brandId, newShownComboIds) {
      const brand = await resolveBrand(env, brandId);
      const round = (brand?.identity_generation_count || 0) + 1;
      await env.DB.prepare(`UPDATE brands SET identity_generation_count = ?, identity_shown_combo_ids = ?, updated_at = datetime('now') WHERE brand_id = ?`)
        .bind(round, JSON.stringify(newShownComboIds), brandId).run();
      return round;
    }
    async function saveConcept(env, brandId, round, concept) {
      const conceptId = crypto.randomUUID();
      await env.DB.prepare(`
        INSERT INTO brand_identity_concepts (
          concept_id, brand_id, generation_round, archetype_id, font_family,
          support_font_family, combo_id, svg_black_r2_key, svg_white_r2_key,
          mockup_r2_keys, palette_json, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `).bind(
        conceptId, brandId, round, concept.archetype_id, concept.font_family,
        concept.support_font_family || null, concept.combo_id,
        concept.svg_black_r2_key, concept.svg_white_r2_key,
        JSON.stringify(concept.mockup_r2_keys || []), JSON.stringify(concept.palette || {})
      ).run();
      return conceptId;
    }
    // Copies an R2 object from one key to another (R2 has no native
    // server-side copy in the Workers binding API -- this reads the bytes
    // then re-puts them, which is fine at this size/frequency: once per
    // brand, only on selection, a handful of small SVGs).
    async function identityCopyR2Object(env, fromKey, toKey, contentType) {
      const obj = await env.R2.get(fromKey);
      if (!obj) throw new Error(`Cannot copy — source not found in R2: ${fromKey}`);
      const bytes = await obj.arrayBuffer();
      await env.R2.put(toKey, bytes, { httpMetadata: { contentType, cacheControl: "public, max-age=3600" } });
    }
    async function selectConcept(env, brandId, conceptId) {
      const concept = await env.DB.prepare(`SELECT * FROM brand_identity_concepts WHERE concept_id = ? AND brand_id = ?`).bind(conceptId, brandId).first();
      if (!concept) return null;
      await env.DB.prepare(`UPDATE brand_identity_concepts SET is_selected = 0 WHERE brand_id = ?`).bind(brandId).run();
      await env.DB.prepare(`UPDATE brand_identity_concepts SET is_selected = 1 WHERE concept_id = ?`).bind(conceptId).run();
      const palette = JSON.parse(concept.palette_json || "{}");

      // Promote the selected concept's files from the private draft prefix
      // to the public prefix -- this is the only point at which anything
      // becomes reachable by the open /assets/ route.
      const publicBlackKey = `brands/${brandId}/public/logo_black.svg`;
      const publicWhiteKey = `brands/${brandId}/public/logo_white.svg`;
      await identityCopyR2Object(env, concept.svg_black_r2_key, publicBlackKey, "image/svg+xml");
      await identityCopyR2Object(env, concept.svg_white_r2_key, publicWhiteKey, "image/svg+xml");

      const draftMockupKeys = JSON.parse(concept.mockup_r2_keys || "[]");
      const publicMockupUrls = [];
      const baseUrl = identityBaseUrl(env);
      for (let i = 0; i < draftMockupKeys.length; i++) {
        const publicMockupKey = `brands/${brandId}/public/mockup_${i}.svg`;
        await identityCopyR2Object(env, draftMockupKeys[i], publicMockupKey, "image/svg+xml");
        publicMockupUrls.push(`${baseUrl}/assets/${publicMockupKey}`);
      }

      const logoUrl = `${baseUrl}/assets/${publicBlackKey}`;
      const logoWhiteUrl = `${baseUrl}/assets/${publicWhiteKey}`;
      await env.DB.prepare(`
        UPDATE brands SET
          identity_archetype_id = ?, identity_selected_concept_id = ?,
          font_primary = ?, font_secondary = ?,
          primary_color = ?, secondary_color = ?, accent_color = ?,
          logo_url = ?, logo_black_url = ?, logo_white_url = ?, updated_at = datetime('now')
        WHERE brand_id = ?
      `).bind(
        concept.archetype_id, conceptId, concept.font_family,
        concept.support_font_family || concept.font_family,
        palette.base || "#000000", palette.shade || "#333333", palette.tint || "#f5f5f5",
        logoUrl, logoUrl, logoWhiteUrl, brandId
      ).run();
      return { ...concept, logo_url: logoUrl, logo_white_url: logoWhiteUrl, mockup_urls: publicMockupUrls };
    }

    // ── mockup compositor ──
    async function getDefaultPrintTemplate(env, productType, ink, placement = "front_chest") {
      const garmentColor = ink === "#ffffff" ? "black" : "white";
      let template = await env.DB.prepare(`
        SELECT * FROM print_templates WHERE product_type = ? AND garment_color = ? AND placement_name = ? AND active = 1
        LIMIT 1
      `).bind(productType || "tshirt", garmentColor, placement).first();
      if (template) return template;
      // Fall back to whatever front-facing template exists for this
      // garment/color before giving up entirely -- better a front mockup
      // than an error if a specific placement (e.g. "pocket") hasn't been
      // calibrated yet for this product.
      template = await env.DB.prepare(`
        SELECT * FROM print_templates WHERE product_type = ? AND garment_color = ? AND active = 1
        ORDER BY placement_name = 'front_chest' DESC LIMIT 1
      `).bind(productType || "tshirt", garmentColor).first();
      if (template) return template;
      return await env.DB.prepare(`SELECT * FROM print_templates WHERE product_type = ? AND active = 1 LIMIT 1`).bind(productType || "tshirt").first();
    }
    async function compositeMockup(env, conceptSvgR2Key, template) {
      if (!template) throw new Error("No print_template available for this product type/color/placement -- cannot generate a mockup.");
      const conceptObj = await env.R2.get(conceptSvgR2Key);
      if (!conceptObj) throw new Error(`Concept SVG not found in R2: ${conceptSvgR2Key}`);
      const conceptSvg = await conceptObj.text();
      const innerMatch = conceptSvg.match(/<svg[^>]*>([\s\S]*)<\/svg>/);
      // No stripping needed as of v34 -- identitySvgDoc() no longer bakes
      // a background rect into the artwork at all, so this inner content
      // is already just the transparent logo shapes/text + the @font-face
      // style block. (v33 patched around the old baked-in background with
      // a regex strip here; that's gone now that the root cause is fixed.)
      const conceptInner = innerMatch ? innerMatch[1] : conceptSvg;
      const viewBoxMatch = conceptSvg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
      const conceptW = viewBoxMatch ? parseFloat(viewBoxMatch[1]) : 600;
      const conceptH = viewBoxMatch ? parseFloat(viewBoxMatch[2]) : 300;
      // Canvas now matches the REAL photo's dimensions (image_width/height,
      // set by the print-area-calibrator tool, same values it read via
      // img.naturalWidth/naturalHeight when you marked the print zone) --
      // not a hardcoded 800x800 square. Forcing a real, likely-non-square
      // photo into a square canvas with preserveAspectRatio="slice"
      // (crop-to-cover) was the actual bug: it aggressively cropped the
      // photo, which is what looked like "mush" rather than a shirt. Using
      // "meet" (contain, never crops) as the fallback too, so even
      // untouched/uncalibrated templates degrade to letterboxing at worst,
      // never a destructive crop.
      const canvasW = template.image_width || 800;
      const canvasH = template.image_height || 800;
      const zoneX = (template.area_x / 100) * canvasW;
      const zoneY = (template.area_y / 100) * canvasH;
      const zoneW = (template.area_w / 100) * canvasW;
      const zoneH = (template.area_h / 100) * canvasH;
      const scale = Math.min(zoneW / conceptW, zoneH / conceptH) * 0.9;
      const drawW = conceptW * scale, drawH = conceptH * scale;
      const drawX = zoneX + (zoneW - drawW) / 2;
      const drawY = zoneY + (zoneH - drawH) / 2;
      const garmentImageUrl = identityGarmentImageUrl(env, template.base_image_url);
      return `<svg viewBox="0 0 ${canvasW} ${canvasH}" xmlns="http://www.w3.org/2000/svg">
  <image href="${garmentImageUrl}" x="0" y="0" width="${canvasW}" height="${canvasH}" preserveAspectRatio="xMidYMid meet"/>
  <g transform="translate(${drawX.toFixed(1)}, ${drawY.toFixed(1)}) scale(${scale.toFixed(4)})">
    ${conceptInner}
  </g>
</svg>`;
    }
    // Always writes to the DRAFT prefix and returns the raw R2 key (not a
    // URL) -- callers decide the URL shape (preview vs public) based on
    // whether the parent concept is selected.
    async function generateDraftMockup(env, brandId, conceptId, conceptSvgR2Key, productType, ink, placement = "front_chest") {
      const template = await getDefaultPrintTemplate(env, productType, ink, placement);
      const compositeSvg = await compositeMockup(env, conceptSvgR2Key, template);
      const mockupKey = `brands/${brandId}/identity/drafts/mockup_${conceptId}_${placement}.svg`;
      await env.R2.put(mockupKey, compositeSvg, { httpMetadata: { contentType: "image/svg+xml", cacheControl: "private, max-age=0" } });
      return mockupKey;
    }

    // ── asset-serving routes ──
    // Open, unauthenticated -- but only ever serves keys under two
    // deliberate prefixes, checked with a hard match:
    //   brands/{id}/public/  -- a brand's selected identity, once picked
    //   mock-up/              -- shared garment reference photography
    //                            (blank tshirts etc.), same bucket as
    //                            fonts, not brand-specific, nothing
    //                            sensitive about it
    // Even a correctly-guessed draft key under .../identity/drafts/...
    // gets a 404 here; that path only exists in /identity/preview/, which
    // requires owner auth.
    async function handleAssetServe(env, key) {
      if (!/^brands\/[^/]+\/public\//.test(key) && !/^mock-up\//.test(key)) {
        return jsonResponse({ error: "Not found" }, 404);
      }
      const obj = await env.R2.get(key);
      if (!obj) return jsonResponse({ error: "Not found" }, 404);
      return new Response(obj.body, {
        headers: { "Content-Type": identityAssetContentType(key), "Cache-Control": "public, max-age=3600" }
      });
    }
    async function handleIdentityPreviewServe(request, env, key) {
      const auth = await authenticateRequest(request, env);
      if (!auth.ok) return jsonResponse({ error: "Unauthorized" }, auth.status || 401);
      if (!key.startsWith(`brands/${auth.user.brand_id}/`)) {
        return jsonResponse({ error: "Not found" }, 404);
      }
      const obj = await env.R2.get(key);
      if (!obj) return jsonResponse({ error: "Not found" }, 404);
      return new Response(obj.body, {
        headers: { "Content-Type": identityAssetContentType(key), "Cache-Control": "private, max-age=0" }
      });
    }

    // ── route handlers ──
    async function handleIdentityGenerate(request, env) {
      const auth = await authenticateRequest(request, env);
      if (!auth.ok) return jsonResponse({ error: "Unauthorized" }, auth.status || 401);
      const brandId = auth.user.brand_id;
      if (!brandId) return jsonResponse({ error: "Brand required" }, 404);

      const brand = await resolveBrand(env, brandId);
      if (!brand) return jsonResponse({ error: "Brand not found" }, 404);

      const currentRound = brand.identity_generation_count || 0;
      if (currentRound >= IDENTITY_MAX_GENERATIONS) {
        return jsonResponse({ error: `Maximum of ${IDENTITY_MAX_GENERATIONS} generations reached for this brand.`, generations_remaining: 0 }, 400);
      }

      let body;
      try { body = await request.json(); } catch { return jsonResponse({ error: "Invalid JSON" }, 400); }

      const personalityTag = body.personality_tag || brand.brand_feeling;
      if (!personalityTag) return jsonResponse({ error: "personality_tag required (or set brand_feeling on the brand first)" }, 400);

      const productType = body.product_type || "tshirt";
      const placement = body.placement || "front_chest"; // front_chest | pocket | back
      const productId = body.product_id || null;
      // creative_mode is still accepted in the request body for backward
      // compatibility but no longer changes anything -- 1 experimental
      // concept is now ALWAYS included every round (see
      // pickConceptsForRound below), which is what this flag used to
      // gate behind an opt-in. Left unread deliberately.
      void body.creative_mode;
      const printMethod = await getProductPrintMethod(env, productId);
      const meta = {
        city: body.city || brand.identity_city || null,
        foundedYear: body.founded_year || brand.identity_founded_year || null,
        tagline: body.tagline || brand.identity_tagline || null
      };

      const archetypeRows = await getArchetypeRows(env);
      const mainPool = await buildComboPool(env, archetypeRows, personalityTag, printMethod, productType);
      const experimentalPool = personalityTag === "experimental"
        ? []
        : await buildComboPool(env, archetypeRows, "experimental", printMethod, productType);
      if (!mainPool.length) {
        return jsonResponse({ error: `No eligible archetype/font combinations for tag="${personalityTag}", print_method="${printMethod}". Check that fonts are approved=1 in this category.` }, 500);
      }

      const shownComboIds = JSON.parse(brand.identity_shown_combo_ids || "[]");
      const { picks, poolExhausted, experimentalSubstituted } = await pickConceptsForRound(mainPool, experimentalPool, shownComboIds);
      // Last 1 of `picks` is always the intended experimental slot (see
      // pickConceptsForRound) unless experimentalSubstituted is true, in
      // which case it's a second main-pool pick instead -- reflected
      // below in each concept's is_experimental flag.
      const experimentalComboId = experimentalSubstituted ? null : picks[picks.length - 1]?.combo_id;

      const fontCache = new Map();
      const iconCache = new Map();
      const baseUrl = identityBaseUrl(env);
      const concepts = [];
      for (const combo of picks) {
        const archetypeId = combo.archetype_id;
        const renderFn = IDENTITY_ARCHETYPE_RENDERERS[archetypeId];
        if (!renderFn) continue;

        const needsSupport = IDENTITY_ARCHETYPES_NEEDING_SUPPORT_FONT.has(archetypeId);
        const supportFont = needsSupport ? (await pickFontPairing(env, personalityTag, true, printMethod)).support : null;
        const palette = derivePalette(personalityTag, body.base_color || null);

        const svgBlack = await renderFn(env, combo.font, supportFont, brand.brand_name, "#000000", personalityTag, meta, fontCache, iconCache);
        const svgWhite = await renderFn(env, combo.font, supportFont, brand.brand_name, "#ffffff", personalityTag, meta, fontCache, iconCache);

        // Draft prefix -- private, owner-only via /identity/preview/.
        const svgBlackKey = `brands/${brandId}/identity/drafts/${combo.combo_id}_black_${Date.now()}.svg`;
        const svgWhiteKey = `brands/${brandId}/identity/drafts/${combo.combo_id}_white_${Date.now()}.svg`;
        await env.R2.put(svgBlackKey, svgBlack, { httpMetadata: { contentType: "image/svg+xml", cacheControl: "private, max-age=0" } });
        await env.R2.put(svgWhiteKey, svgWhite, { httpMetadata: { contentType: "image/svg+xml", cacheControl: "private, max-age=0" } });

        const conceptId = await saveConcept(env, brandId, currentRound + 1, {
          archetype_id: archetypeId, font_family: combo.font.family_name,
          support_font_family: supportFont?.family_name || null, combo_id: combo.combo_id,
          svg_black_r2_key: svgBlackKey, svg_white_r2_key: svgWhiteKey, palette, mockup_r2_keys: []
        });

        const mockupKey = await generateDraftMockup(env, brandId, conceptId, svgBlackKey, productType, "#000000", placement);
        await env.DB.prepare(`UPDATE brand_identity_concepts SET mockup_r2_keys = ? WHERE concept_id = ?`).bind(JSON.stringify([mockupKey]), conceptId).run();

        concepts.push({
          concept_id: conceptId, archetype_id: archetypeId, font_family: combo.font.family_name,
          support_font_family: supportFont?.family_name || null,
          is_experimental: combo.combo_id === experimentalComboId,
          // Private preview URLs -- require the owner's own Bearer token to load.
          preview_url: `${baseUrl}/identity/preview/${encodeURIComponent(svgBlackKey)}`,
          mockup_preview_url: `${baseUrl}/identity/preview/${encodeURIComponent(mockupKey)}`,
          palette
        });
      }

      const newShownIds = [...shownComboIds, ...picks.map((p) => p.combo_id)];
      const round = await incrementGenerationRound(env, brandId, newShownIds);

      return jsonResponse({
        success: true, generation_round: round, generations_remaining: IDENTITY_MAX_GENERATIONS - round,
        pool_exhausted: poolExhausted, experimental_substituted: experimentalSubstituted,
        print_method: printMethod, concepts
      });
    }

    async function handleIdentitySelect(request, env) {
      const auth = await authenticateRequest(request, env);
      if (!auth.ok) return jsonResponse({ error: "Unauthorized" }, auth.status || 401);
      const brandId = auth.user.brand_id;
      if (!brandId) return jsonResponse({ error: "Brand required" }, 404);

      let body;
      try { body = await request.json(); } catch { return jsonResponse({ error: "Invalid JSON" }, 400); }
      if (!body.concept_id) return jsonResponse({ error: "concept_id required" }, 400);

      const concept = await selectConcept(env, brandId, body.concept_id);
      if (!concept) return jsonResponse({ error: "Concept not found for this brand" }, 404);

      return jsonResponse({
        success: true,
        selected: {
          concept_id: concept.concept_id, archetype_id: concept.archetype_id, font_family: concept.font_family,
          logo_url: concept.logo_url, logo_white_url: concept.logo_white_url, mockup_urls: concept.mockup_urls
        }
      });
    }

    async function handleIdentityGet(request, env) {
      const auth = await authenticateRequest(request, env);
      if (!auth.ok) return jsonResponse({ error: "Unauthorized" }, auth.status || 401);
      const brand = await resolveBrand(env, auth.user.brand_id);
      if (!brand) return jsonResponse({ error: "Brand not found" }, 404);

      return jsonResponse({
        success: true,
        identity: {
          archetype_id: brand.identity_archetype_id, font_primary: brand.font_primary, font_secondary: brand.font_secondary,
          primary_color: brand.primary_color, secondary_color: brand.secondary_color, accent_color: brand.accent_color,
          logo_url: brand.logo_url, logo_white_url: brand.logo_white_url,
          generations_used: brand.identity_generation_count || 0,
          generations_remaining: IDENTITY_MAX_GENERATIONS - (brand.identity_generation_count || 0)
        }
      });
    }

    async function handleIdentityMockup(request, env) {
      const auth = await authenticateRequest(request, env);
      if (!auth.ok) return jsonResponse({ error: "Unauthorized" }, auth.status || 401);
      let body;
      try { body = await request.json(); } catch { return jsonResponse({ error: "Invalid JSON" }, 400); }
      if (!body.concept_id) return jsonResponse({ error: "concept_id required" }, 400);

      const concept = await env.DB.prepare(`SELECT * FROM brand_identity_concepts WHERE concept_id = ? AND brand_id = ?`).bind(body.concept_id, auth.user.brand_id).first();
      if (!concept) return jsonResponse({ error: "Concept not found" }, 404);

      const productType = body.product_type || "tshirt";
      const placement = body.placement || "front_chest"; // front_chest | pocket | back
      const baseUrl = identityBaseUrl(env);

      if (concept.is_selected) {
        // Already public — regenerate straight into the public prefix and
        // return an open URL, consistent with everything else about a
        // selected identity.
        const template = await getDefaultPrintTemplate(env, productType, "#000000", placement);
        const compositeSvg = await compositeMockup(env, concept.svg_black_r2_key, template);
        const idx = JSON.parse(concept.mockup_r2_keys || "[]").length;
        const publicKey = `brands/${auth.user.brand_id}/public/mockup_${idx}_${placement}.svg`;
        await env.R2.put(publicKey, compositeSvg, { httpMetadata: { contentType: "image/svg+xml", cacheControl: "public, max-age=3600" } });
        return jsonResponse({ success: true, mockup_url: `${baseUrl}/assets/${publicKey}`, placement });
      }

      const mockupKey = await generateDraftMockup(env, auth.user.brand_id, body.concept_id, concept.svg_black_r2_key, productType, "#000000", placement);
      return jsonResponse({ success: true, mockup_preview_url: `${baseUrl}/identity/preview/${encodeURIComponent(mockupKey)}`, placement });
    }

    // ───── MAIN FETCH HANDLER ──────────────────────────────────
    const url = new URL(request.url);
    const path = url.pathname;

    if (!env.DB) {
      return json({ status: "error", message: "Missing DB binding" }, 500);
    }

    try {
      // ─── PUBLIC ROUTES ────────────────────────────────────────
      if (path === "/" && request.method === "GET") {
        return json({
          status: "ok",
          service: "zvakho-universal-worker",
          version: "v23-real-merch-commission",
          binding: "DB",
          ssl_for_saas: env.ZVAKHO_ZONE_ID ? "enabled" : "disabled (set ZVAKHO_ZONE_ID)",
          zero_trust: env.ADMIN_EMAILS ? "enabled" : "disabled (set ADMIN_EMAILS)",
          google_oauth: env.GOOGLE_CLIENT_ID ? "enabled" : "disabled (set GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET)",
          resend_email: env.RESEND_API_KEY ? "enabled" : "disabled (set RESEND_API_KEY)",
          endpoints: [
            "GET  /",
            "GET  /homepage",
            "GET  /artists",
            "GET  /launches",
            "GET  /launch/:slug",
            "POST /launch/:slug/join",
            "GET  /launch/:slug/products",
            "GET  /launch/:slug/unlock",
            "GET  /launch/:slug/page",
            "POST /launch/:slug/capture",
            "POST /launch/:slug/preorder",
            "GET  /launch/:slug/status",
            "GET  /store-config?artist=",
            "GET  /artist-store?artist_id=",
            "GET  /products",
            "GET  /variants",
            "POST /events",
            // ─── AUTH ───
            "POST /set-password",
            "POST /login",
            "GET  /me",
            "POST /logout",
            "POST /api/auth/signup",
            "POST /api/auth/send-otp",
            "POST /api/auth/verify-otp",
            "GET  /api/auth/verify-email",
            "POST /api/auth/resend-verification",
            "GET  /api/auth/google",
            "GET  /api/auth/google/callback",
            // ─── UNSUBSCRIBE ───
            "GET  /unsubscribe",
            // ─── PAYMENTS ───
            "POST /create-payment",
            "GET  /poll-status",
            "GET  /check-payment",
            // ─── DASHBOARDS ───
            "GET  /artist-dashboard",
            "GET  /owner-dashboard (Zero Trust + Bearer)",
            // ─── FULFILMENT ───
            "POST /update-fulfilment",
            "POST /web-checkout",
            "POST /generate-shipping-label",
            // ─── STORE CONFIG ───
            "POST /update-artist-skin",
            "GET  /artist-store-config",
            // ─── DOMAINS ───
            "GET  /domains/search?q=",
            "GET  /domains/check?domain=",
            "POST /domains/register",
            "GET  /domains/list",
            "POST /domains/remove",
            // ─── SUBSCRIPTIONS ───
            "GET  /subscription/plans",
            "GET  /subscription/current",
            "POST /subscription/purchase",
            "GET  /subscription/purchase/status?reference=",
            "GET  /subscription/limit-check?brand_id=",
            // ─── PRODUCT CATALOG (base-cost blanks) ───
            "GET  /catalog",
            "POST /admin/catalog/create",
            "POST /admin/catalog/update",
            // ─── WHOLESALE MANUFACTURING (bulk B2B) ───
            "POST /wholesale/inquiry",
            "GET  /wholesale/list (owner/admin)",
            "POST /wholesale/update (owner/admin)"
          ]
        });
      }

      // ─── UNSUBSCRIBE ROUTE ────────────────────────────────────
      if (path === "/unsubscribe" && request.method === "GET") {
        return await handleUnsubscribe(request, env);
      }

      // ─── STORE ROUTES ──────────────────────────────────────────
      if (path === "/homepage" && request.method === "GET") {
        const [brandRows, campaignRows] = await Promise.all([
          env.DB.prepare(
            `
            SELECT brand_id, brand_slug, brand_name, genre, brand_feeling, hero_image_url, logo_url, store_status
            FROM brands
            WHERE store_status = 'active'
            ORDER BY brand_name ASC
          `
          ).all(),
          env.DB.prepare(
            `
            SELECT c.campaign_id, c.brand_id, c.title, c.slug, c.campaign_type, c.description, c.cover_image, c.release_date, c.status,
                   b.brand_name, b.brand_slug AS brand_slug, b.logo_url
            FROM campaigns c
            LEFT JOIN brands b ON b.brand_id = c.brand_id
            WHERE c.status = 'active'
            ORDER BY c.release_date ASC, c.created_at DESC
            LIMIT 10
          `
          ).all()
        ]);
        return json(
          {
            status: "success",
            artists: brandRows.results || [],
            brands: brandRows.results || [],
            launches: campaignRows.results || []
          },
          200,
          120
        );
      }

      if (path === "/artists" && request.method === "GET") {
        const rows = await env.DB.prepare(
          `SELECT brand_id, brand_slug, brand_name, store_status, whatsapp_number FROM brands WHERE store_status = 'active' ORDER BY brand_name ASC`
        ).all();
        return json({
          status: "success",
          artists: (rows.results || []).map(b => publicBrand(b)),
          brands: (rows.results || []).map(b => publicBrand(b))
        });
      }

      if (path === "/launches" && request.method === "GET") {
        const artistSlug = String(url.searchParams.get("artist") || "").trim().toLowerCase();
        let rows;
        if (artistSlug) {
          rows = await env.DB.prepare(
            `
            SELECT c.campaign_id, c.brand_id, c.title, c.slug, c.campaign_type, c.description, c.cover_image, c.release_date, c.status,
                   b.brand_name, b.brand_slug AS brand_slug, b.logo_url, b.whatsapp_number
            FROM campaigns c
            LEFT JOIN brands b ON b.brand_id = c.brand_id
            WHERE c.status = 'active' AND LOWER(b.brand_slug) = ?
            ORDER BY c.release_date ASC, c.created_at DESC
          `
          )
            .bind(artistSlug)
            .all();
        } else {
          rows = await env.DB.prepare(
            `
            SELECT c.campaign_id, c.brand_id, c.title, c.slug, c.campaign_type, c.description, c.cover_image, c.release_date, c.status,
                   b.brand_name, b.brand_slug AS brand_slug, b.logo_url, b.whatsapp_number
            FROM campaigns c
            LEFT JOIN brands b ON b.brand_id = c.brand_id
            WHERE c.status = 'active'
            ORDER BY c.release_date ASC, c.created_at DESC
            LIMIT 20
          `
          ).all();
        }
        const launches = (rows.results || []).map(r => ({
          campaign_id: r.campaign_id,
          brand_id: r.brand_id,
          title: r.title || "",
          slug: r.slug || "",
          campaign_type: r.campaign_type || "Launch",
          description: r.description || "",
          cover_image: r.cover_image || "",
          release_date: r.release_date || null,
          status: r.status || "active",
          brand_name: r.brand_name || "",
          brand_slug: r.brand_slug || "",
          logo_url: r.logo_url || "",
          whatsapp_number: r.whatsapp_number || ""
        }));
        return json({ status: "success", count: launches.length, launches }, 200, 120);
      }

      // Single launch
      const launchSlugFromPath = path.match(/^\/launch\/([^\/]+)$/)?.[1] || null;
      if (
        request.method === "GET" &&
        ((path === "/launch" && url.searchParams.get("slug")) || launchSlugFromPath)
      ) {
        const slug = String(launchSlugFromPath || url.searchParams.get("slug") || "").trim().toLowerCase();
        if (!slug) return json({ status: "error", message: "Missing launch slug" }, 400);
        const campaign = await env.DB.prepare(
          `
          SELECT c.*,
                 b.brand_name, b.brand_slug AS brand_slug, b.genre, b.bio, b.logo_url, b.hero_image_url,
                 b.whatsapp_number, b.instagram_url, b.tiktok_url, b.youtube_url
          FROM campaigns c
          LEFT JOIN brands b ON b.brand_id = c.brand_id
          WHERE LOWER(c.slug) = ?
          LIMIT 1
        `
        )
          .bind(slug)
          .first();
        if (!campaign) return json({ status: "error", message: "Launch not found" }, 404);
        const productsRows = await env.DB.prepare(
          `
          SELECT product_id, brand_id, campaign_id, product_type, product_name, description, price, currency,
                 stock, active, main_image_url, image_url, file_url, preview_url, created_at
          FROM products
          WHERE campaign_id = ? AND active = 1
          ORDER BY created_at DESC
        `
        )
          .bind(campaign.campaign_id)
          .all();
        const products = (productsRows.results || []).map(p => ({
          product_id: p.product_id,
          brand_id: p.brand_id,
          campaign_id: p.campaign_id,
          product_type: p.product_type,
          product_name: p.product_name,
          description: p.description || "",
          price: Number(p.price || 0),
          currency: p.currency || "USD",
          price_label: `$${Number(p.price || 0).toFixed(2)}`,
          stock: p.stock ?? null,
          active: Boolean(p.active),
          image: p.main_image_url || p.image_url || campaign.cover_image || "",
          main_image_url: p.main_image_url || p.image_url || "",
          file_url: p.file_url || "",
          preview_url: p.preview_url || ""
        }));
        return json({ status: "success", campaign, products, count: products.length }, 200, 60);
      }

      // POST /launch/:slug/join
      const joinMatch = path.match(/^\/launch\/([^\/]+)\/join$/);
      if (request.method === "POST" && joinMatch) {
        const slug = joinMatch[1];
        let body;
        try { body = await request.json(); } catch { return json({ status: "error", message: "Invalid JSON body" }, 400); }
        const phone = String(body.phone || "").trim();
        if (!phone) return json({ status: "error", message: "Phone required" }, 400);
        const campaign = await env.DB.prepare(
          `SELECT campaign_id, brand_id, title FROM campaigns WHERE slug = ? LIMIT 1`
        )
          .bind(slug)
          .first();
        if (!campaign) return json({ status: "error", message: "Campaign not found" }, 404);
        const existing = await env.DB.prepare(
          `SELECT supporter_id FROM campaign_supporters WHERE campaign_id = ? AND phone = ? LIMIT 1`
        )
          .bind(campaign.campaign_id, phone)
          .first();
        if (existing) return json({ status: "success", message: "Already joined" });
        const supporterId = crypto.randomUUID();
        await env.DB.prepare(
          `INSERT INTO campaign_supporters (supporter_id, campaign_id, phone, tag) VALUES (?, ?, ?, 'launch_supporter')`
        )
          .bind(supporterId, campaign.campaign_id, phone)
          .run();
        await env.DB.prepare(
          `INSERT INTO launch_events (event_id, campaign_id, brand_id, event_type, reference_id, metadata)
           VALUES (?, ?, ?, 'supporter_joined', ?, ?)`
        )
          .bind(
            crypto.randomUUID(),
            campaign.campaign_id,
            campaign.brand_id,
            supporterId,
            JSON.stringify({ phone })
          )
          .run();
        return json({ status: "success", message: "Joined campaign" });
      }

      // GET /launch/:slug/products
      const productsPathMatch = path.match(/^\/launch\/([^\/]+)\/products$/);
      if (request.method === "GET" && productsPathMatch) {
        const slug = productsPathMatch[1];
        const campaign = await env.DB.prepare(
          `SELECT campaign_id FROM campaigns WHERE slug = ? LIMIT 1`
        )
          .bind(slug)
          .first();
        if (!campaign) return json({ status: "error", message: "Campaign not found" }, 404);
        const rows = await env.DB.prepare(
          `
          SELECT product_id, brand_id, campaign_id, product_type, product_name, description, price, currency,
                 stock, active, main_image_url, image_url, file_url, preview_url
          FROM products
          WHERE campaign_id = ? AND active = 1
        `
        )
          .bind(campaign.campaign_id)
          .all();
        return json({ status: "success", products: rows.results || [] }, 200, 60);
      }

      // GET /launch/:slug/unlock
      const unlockMatch = path.match(/^\/launch\/([^\/]+)\/unlock$/);
      if (request.method === "GET" && unlockMatch) {
        const slug = unlockMatch[1];
        const phone = String(url.searchParams.get("phone") || "").trim();
        if (!phone) return json({ status: "error", message: "Phone required" }, 400);
        const campaign = await env.DB.prepare(
          `SELECT campaign_id, release_date FROM campaigns WHERE slug = ? LIMIT 1`
        )
          .bind(slug)
          .first();
        if (!campaign) return json({ status: "error", message: "Campaign not found" }, 404);
        const supporter = await env.DB.prepare(
          `SELECT supporter_id FROM campaign_supporters WHERE campaign_id = ? AND phone = ? LIMIT 1`
        )
          .bind(campaign.campaign_id, phone)
          .first();
        if (!supporter) return json({ status: "error", message: "Supporter not found" }, 403);
        const now = Date.now();
        const releaseTime = new Date(campaign.release_date).getTime();
        if (now < releaseTime) {
          return json({ status: "success", locked: true, message: "Content not unlocked yet", unlocks_at: campaign.release_date });
        }
        const rows = await env.DB.prepare(
          `
          SELECT product_id, brand_id, campaign_id, product_type, product_name, description, price, currency,
                 stock, active, main_image_url, image_url, file_url, preview_url
          FROM products
          WHERE campaign_id = ? AND active = 1
        `
        )
          .bind(campaign.campaign_id)
          .all();
        return json({ status: "success", locked: false, products: rows.results || [] });
      }

      // GET /launch/:slug/page
      const pageMatch = path.match(/^\/launch\/([^\/]+)\/page$/);
      if (request.method === "GET" && pageMatch) {
        const slug = pageMatch[1].toLowerCase();
        const campaign = await env.DB.prepare(
          `
          SELECT c.*,
                 b.brand_id, b.brand_name, b.brand_slug AS brand_slug, b.genre, b.bio, b.identity_tagline,
                 b.logo_url, b.hero_image_url, b.logo_url, b.logo_white_url,
                 b.whatsapp_number, b.instagram_url, b.tiktok_url, b.youtube_url,
                 at.primary_color, at.secondary_color, at.background_color, at.text_color,
                 at.accent_color AS theme_accent_color, at.ticker_text,
                 tp.button_style, tp.preset_name
          FROM campaigns c
          LEFT JOIN brands b ON b.brand_id = c.brand_id
          LEFT JOIN artist_themes at ON at.brand_id = c.brand_id
          LEFT JOIN theme_presets tp ON tp.preset_id = at.preset_id
          WHERE LOWER(c.slug) = ?
          LIMIT 1
        `
        )
          .bind(slug)
          .first();
        if (!campaign) return json({ status: "error", message: "Launch not found" }, 404);
        const productsRows = await env.DB.prepare(
          `
          SELECT p.product_id, p.product_type, p.product_name, p.description, p.price, p.currency, p.stock,
                 p.main_image_url, p.image_url, p.file_url, p.preview_url,
                 p.preorder_enabled, p.preorder_close_date, p.preorder_count,
                 p.limited_release, p.launch_slot
          FROM products p
          WHERE p.campaign_id = ? AND p.active = 1
          ORDER BY p.launch_slot ASC, p.created_at DESC
        `
        )
          .bind(campaign.campaign_id)
          .all();
        const products = (productsRows.results || []).map(p => ({
          product_id: p.product_id,
          product_type: p.product_type,
          product_name: p.product_name,
          description: p.description || "",
          price: Number(p.price || 0),
          currency: p.currency || "USD",
          price_label: `$${Number(p.price || 0).toFixed(2)}`,
          stock: p.stock ?? null,
          image: p.main_image_url || p.image_url || campaign.cover_image || "",
          file_url: p.file_url || "",
          preview_url: p.preview_url || "",
          preorder_enabled: Boolean(p.preorder_enabled),
          preorder_close_date: p.preorder_close_date || null,
          preorder_count: Number(p.preorder_count || 0),
          limited_release: Boolean(p.limited_release),
          launch_slot: Number(p.launch_slot || 0)
        }));
        const countRow = await env.DB.prepare(
          `SELECT COUNT(*) AS n FROM campaign_supporters WHERE campaign_id = ?`
        )
          .bind(campaign.campaign_id)
          .first();
        const supporter_count = Number(countRow?.n || 0);
        const now = Date.now();
        const launchTime = campaign.launch_date ? new Date(campaign.launch_date).getTime() : null;
        const countdown = launchTime
          ? {
              enabled: Boolean(campaign.countdown_enabled),
              launch_date: campaign.launch_date,
              ms_remaining: Math.max(0, launchTime - now),
              launched: now >= launchTime
            }
          : { enabled: false, launched: true };
        const theme = {
          primary_color: campaign.bg_color || campaign.background_color || "#0b0b0b",
          accent_color: campaign.accent_color || campaign.theme_accent_color || "#f5a400",
          text_color: campaign.text_color || "#ffffff",
          secondary_color: campaign.secondary_color || "#ffffff",
          button_style: campaign.button_style || "solid",
          ticker_text: campaign.ticker_text || "",
          logo_url: campaign.logo_override_url || campaign.logo_white_url || campaign.logo_url || ""
        };
        return json({
          status: "success",
          campaign: {
            campaign_id: campaign.campaign_id,
            slug: campaign.slug,
            title: campaign.title || "",
            campaign_type: campaign.campaign_type || "Launch",
            description: campaign.description || "",
            cover_image: campaign.cover_image || "",
            hero_video_url: campaign.hero_video_url || "",
            release_date: campaign.release_date || null,
            launch_date: campaign.launch_date || null,
            status: campaign.status || "active",
            preorder_enabled: Boolean(campaign.preorder_enabled),
            preorder_limit: campaign.preorder_limit ?? null,
            email_capture: Boolean(campaign.email_capture ?? 1),
            whatsapp_capture: Boolean(campaign.whatsapp_capture ?? 1),
            capture_headline: campaign.capture_headline || "Be the first to know",
            capture_subtext: campaign.capture_subtext || "Drop your details and we'll hit you when it's live.",
            supporter_count_visible: Boolean(campaign.supporter_count_visible ?? 1)
          },
          brand: {
            brand_id: campaign.brand_id,
            brand_name: campaign.brand_name || "",
            slug: campaign.brand_slug || "",
            genre: campaign.genre || "",
            tagline: campaign.identity_tagline || "",
            bio: campaign.bio || "",
            logo_url: campaign.logo_url || "",
            hero_image_url: campaign.hero_image_url || "",
            whatsapp_number: campaign.whatsapp_number || "",
            instagram_url: campaign.instagram_url || "",
            tiktok_url: campaign.tiktok_url || "",
            youtube_url: campaign.youtube_url || ""
          },
          theme,
          countdown,
          supporter_count: campaign.supporter_count_visible ? supporter_count : null,
          products,
          product_count: products.length
        }, 200, 30);
      }

      // POST /launch/:slug/capture
      const captureMatch = path.match(/^\/launch\/([^\/]+)\/capture$/);
      if (request.method === "POST" && captureMatch) {
        const slug = captureMatch[1].toLowerCase();
        let body;
        try { body = await request.json(); } catch { return json({ status: "error", message: "Invalid JSON body" }, 400); }
        const phone = String(body.phone || "").trim();
        const email = String(body.email || "").trim().toLowerCase();
        const name = String(body.name || "").trim();
        if (!phone && !email) return json({ status: "error", message: "Phone or email required" }, 400);
        const campaign = await env.DB.prepare(
          `SELECT campaign_id, brand_id, title, whatsapp_capture, whatsapp_number FROM campaigns WHERE LOWER(slug) = ? LIMIT 1`
        )
          .bind(slug)
          .first();
        if (!campaign) return json({ status: "error", message: "Campaign not found" }, 404);
        const lookupKey = phone || email;
        const lookupCol = phone ? "phone" : "email";
        const existing = await env.DB.prepare(
          `SELECT supporter_id, phone, email FROM campaign_supporters WHERE campaign_id = ? AND ${lookupCol} = ? LIMIT 1`
        )
          .bind(campaign.campaign_id, lookupKey)
          .first();
        let supporterId;
        if (existing) {
          supporterId = existing.supporter_id;
          if (email && !existing.email) {
            await env.DB.prepare(
              `UPDATE campaign_supporters SET email = ? WHERE supporter_id = ?`
            )
              .bind(email, supporterId)
              .run();
          }
        } else {
          supporterId = crypto.randomUUID();
          await env.DB.prepare(
            `INSERT INTO campaign_supporters (supporter_id, campaign_id, phone, email, tag, capture_source)
             VALUES (?, ?, ?, ?, 'launch_fan', 'launch_page')`
          )
            .bind(supporterId, campaign.campaign_id, phone || null, email || null)
            .run();
        }
        try {
          await env.DB.prepare(
            `INSERT INTO launch_events (event_id, campaign_id, brand_id, event_type, reference_id, metadata)
             VALUES (?, ?, ?, 'fan_captured', ?, ?)`
          )
            .bind(
              crypto.randomUUID(),
              campaign.campaign_id,
              campaign.brand_id,
              supporterId,
              JSON.stringify({ phone: phone || null, email: email || null, name: name || null })
            )
            .run();
        } catch {}
        const countRow = await env.DB.prepare(
          `SELECT COUNT(*) AS n FROM campaign_supporters WHERE campaign_id = ?`
        )
          .bind(campaign.campaign_id)
          .first();
        let whatsapp_redirect = null;
        if (campaign.whatsapp_capture) {
          const number = String(campaign.whatsapp_number || "").replace(/\D/g, "");
          if (number) {
            const text = encodeURIComponent(
              `Hey! I just signed up for the ${campaign.title || "launch"} — count me in 🔥`
            );
            whatsapp_redirect = `https://wa.me/${number}?text=${text}`;
          }
        }
        return json({
          status: "success",
          message: existing ? "Already registered" : "Registered",
          supporter_id: supporterId,
          supporter_count: Number(countRow?.n || 0),
          whatsapp_redirect
        });
      }

      // GET /launch/:slug/status
      const statusMatch = path.match(/^\/launch\/([^\/]+)\/status$/);
      if (request.method === "GET" && statusMatch) {
        const slug = statusMatch[1].toLowerCase();
        const campaign = await env.DB.prepare(
          `SELECT campaign_id, launch_date, countdown_enabled, preorder_enabled, preorder_limit, supporter_count_visible, status
           FROM campaigns WHERE LOWER(slug) = ? LIMIT 1`
        )
          .bind(slug)
          .first();
        if (!campaign) return json({ status: "error", message: "Campaign not found" }, 404);
        const now = Date.now();
        const launchTime = campaign.launch_date ? new Date(campaign.launch_date).getTime() : null;
        const [countRow, preorderRow] = await Promise.all([
          env.DB.prepare(`SELECT COUNT(*) AS n FROM campaign_supporters WHERE campaign_id = ?`)
            .bind(campaign.campaign_id)
            .first(),
          campaign.preorder_enabled && campaign.preorder_limit
            ? env.DB.prepare(
                `SELECT COUNT(*) AS n FROM launch_preorders WHERE campaign_id = ? AND status NOT IN ('cancelled','refunded')`
              )
                .bind(campaign.campaign_id)
                .first()
            : Promise.resolve(null)
        ]);
        const supporter_count = Number(countRow?.n || 0);
        const preorders_taken = Number(preorderRow?.n || 0);
        const preorders_left = campaign.preorder_limit ? Math.max(0, campaign.preorder_limit - preorders_taken) : null;
        return json({
          status: "success",
          campaign_status: campaign.status,
          supporter_count: campaign.supporter_count_visible ? supporter_count : null,
          preorders_left,
          countdown: launchTime
            ? {
                enabled: Boolean(campaign.countdown_enabled),
                launch_date: campaign.launch_date,
                ms_remaining: Math.max(0, launchTime - now),
                launched: now >= launchTime
              }
            : { enabled: false, launched: true }
        }, 200, 15);
      }

      // GET /campaign/:id/events
      const campaignEventsMatch = path.match(/^\/campaign\/([^\/]+)\/events$/);
      if (request.method === "GET" && campaignEventsMatch) {
        const campaignId = campaignEventsMatch[1];
        const rows = await env.DB.prepare(
          `SELECT * FROM launch_events WHERE campaign_id = ? ORDER BY created_at DESC LIMIT 100`
        )
          .bind(campaignId)
          .all();
        return json({ status: "success", events: rows.results || [] });
      }

      // GET /store-config
      if (path === "/store-config" && request.method === "GET") {
        const identifier = String(
          url.searchParams.get("brand") || url.searchParams.get("brand_id") ||
          url.searchParams.get("artist") || url.searchParams.get("artist_id") ||
          url.searchParams.get("slug") || ""
        ).trim();
        if (!identifier) {
          return json({ status: "error", message: "Missing brand" }, 400);
        }
        const brand = await resolveBrand(env, identifier);
        if (!brand) return json({ status: "error", message: "Brand not found" }, 404);

        const theme = await env.DB.prepare(
          `
          SELECT at.brand_id, at.preset_id,
            COALESCE(at.primary_color, tp.primary_color) AS primary_color,
            COALESCE(at.secondary_color, tp.secondary_color) AS secondary_color,
            COALESCE(at.background_color, tp.background_color) AS background_color,
            COALESCE(at.text_color, tp.text_color) AS text_color,
            COALESCE(at.accent_color, tp.accent_color) AS accent_color,
            at.hero_title,
            at.ticker_text, at.custom_css,
            tp.preset_name, tp.button_style, tp.ticker_enabled
          FROM artist_themes at
          LEFT JOIN theme_presets tp ON tp.preset_id = at.preset_id
          WHERE at.brand_id = ? LIMIT 1
        `
        )
          .bind(brand.brand_id)
          .first();

        const productsRows = await env.DB.prepare(
          `
          SELECT product_id, brand_id, campaign_id, product_type, product_name, description, price, currency,
                 main_image_url, image_url, active, limited_release, preorder_enabled, preorder_close_date,
                 created_at, updated_at, stock, file_url, preview_url, metadata
          FROM products
          WHERE brand_id = ? AND active = 1
          ORDER BY
            CASE product_type WHEN 'merch' THEN 1 WHEN 'music' THEN 2 WHEN 'vip' THEN 3 ELSE 4 END,
            created_at DESC
        `
        )
          .bind(brand.brand_id)
          .all();

        const rawProducts = productsRows.results || [];
        const productIds = rawProducts.map(p => p.product_id);
        let allVariants = [];
        if (productIds.length) {
          const placeholders = productIds.map(() => "?").join(",");
          const variantsRows = await env.DB.prepare(
            `
            SELECT variant_id, product_id, color, size_code, size_label, image_url, stock_qty, active, created_at
            FROM product_variants
            WHERE product_id IN (${placeholders}) AND active = 1
            ORDER BY
              product_id ASC,
              CASE UPPER(size_code) WHEN 'XS' THEN 1 WHEN 'S' THEN 2 WHEN 'M' THEN 3 WHEN 'L' THEN 4 WHEN 'XL' THEN 5 WHEN 'XXL' THEN 6 ELSE 99 END
          `
          )
            .bind(...productIds)
            .all();
          allVariants = variantsRows.results || [];
        }
        const variantsByProduct = allVariants.reduce((acc, v) => {
          if (!acc[v.product_id]) acc[v.product_id] = [];
          acc[v.product_id].push({
            variant_id: v.variant_id,
            product_id: v.product_id,
            color: v.color || "",
            size_code: v.size_code || "",
            size_label: v.size_label || "",
            image_url: v.image_url || "",
            stock_qty: v.stock_qty ?? null,
            active: Boolean(v.active),
            created_at: v.created_at || null
          });
          return acc;
        }, {});

        const products = rawProducts.map(p => ({
          product_id: p.product_id,
          brand_id: p.brand_id,
          campaign_id: p.campaign_id || null,
          product_type: p.product_type,
          product_name: p.product_name,
          description: p.description || "",
          price: Number(p.price || 0),
          currency: p.currency || "USD",
          price_label: `$${Number(p.price || 0).toFixed(2)}`,
          main_image_url: p.main_image_url || p.image_url || "",
          image_url: p.main_image_url || p.image_url || "",
          active: Boolean(p.active),
          limited_release: Boolean(p.limited_release),
          preorder_enabled: Boolean(p.preorder_enabled),
          preorder_close_date: p.preorder_close_date || null,
          stock: p.stock ?? null,
          file_url: p.file_url || "",
          preview_url: p.preview_url || "",
          metadata: p.metadata || null,
          variants: variantsByProduct[p.product_id] || [],
          has_variants: Boolean((variantsByProduct[p.product_id] || []).length)
        }));

        const featuredProduct =
          products.find(p => p.product_id === brand.featured_product_id) ||
          products.find(p => p.product_type === "merch") ||
          products[0] ||
          null;

        const musicProducts = products.filter(p => p.product_type === "music");
        const merchProducts = products.filter(p => p.product_type === "merch");

        const brandSub = await getBrandSubscription(env, brand.brand_id);
        const whiteLabel = Boolean(brandSub?.white_label);
        const subscriptionPlan = brandSub?.subscription_plan || "free";

        const safeTheme = theme || {
          brand_id: brand.brand_id,
          preset_id: "default",
          primary_color: "#111111",
          secondary_color: "#FFFFFF",
          background_color: "#FFFFFF",
          text_color: "#111111",
          accent_color: "#C6A15B",
          hero_title: brand.brand_name,
          ticker_text: "MUSIC • MERCH • EXCLUSIVE DROPS •",
          button_style: "solid",
          ticker_enabled: 1
        };

        return json({
          status: "success",
          brand: {
            brand_id: brand.brand_id,
            slug: brand.brand_slug,
            brand_name: brand.brand_name,
            genre: brand.genre || "",
            tagline: brand.identity_tagline || "",
            bio: brand.bio || "",
            whatsapp_number: brand.whatsapp_number || "",
            logo_url: brand.logo_url || "",
            logo_white_url: brand.logo_white_url || brand.logo_url || "",
            logo_black_url: brand.logo_black_url || brand.logo_url || "",
            hero_image_url: brand.hero_image_url || "",
            instagram_url: brand.instagram_url || "",
            tiktok_url: brand.tiktok_url || "",
            youtube_url: brand.youtube_url || "",
            spotify_url: brand.spotify_url || "",
            apple_music_url: brand.apple_music_url || "",
            featured_product_id: brand.featured_product_id || "",
            store_mode: brand.store_mode || "hybrid",
            visual_style: brand.brand_feeling || safeTheme.preset_id || "default",
            preorder_end_date: brand.preorder_end_date || null,
            footer_quote: brand.footer_quote || brand.identity_tagline || "",
            is_active: brand.store_status === "active",
            subscription_plan: subscriptionPlan,
            white_label: whiteLabel
          },
          theme: safeTheme,
          layout: {
            store_mode: brand.store_mode || "hybrid",
            visual_style: brand.brand_feeling || safeTheme.preset_id || "default",
            merch_first: true,
            music_player_enabled: musicProducts.length > 0,
            ticker_enabled: Boolean(safeTheme.ticker_enabled),
            button_style: safeTheme.button_style || "solid"
          },
          featured_product: featuredProduct,
          products,
          merch_products: merchProducts,
          music_products: musicProducts,
          variants: allVariants,
          count: products.length,
          variant_count: allVariants.length
        }, 200, 180);
      }

      // GET /artist-store
      if (path === "/artist-store" && request.method === "GET") {
        return await handleBrandStoreDB(request, env);
      }

      // GET /products
      if (path === "/products" && request.method === "GET") {
        const rows = await env.DB.prepare(
          `SELECT * FROM products ORDER BY brand_id ASC, created_at DESC`
        ).all();
        return json({ status: "success", count: rows.results.length, products: rows.results || [] });
      }

      // GET /variants
      if (path === "/variants" && request.method === "GET") {
        const rows = await env.DB.prepare(
          `SELECT * FROM product_variants ORDER BY product_id ASC, size_code ASC`
        ).all();
        return json({ status: "success", count: rows.results.length, variants: rows.results || [] });
      }

      // POST /events
      if (path === "/events" && request.method === "POST") {
        let body;
        try { body = await request.json(); } catch { return json({ status: "error", message: "Invalid JSON body" }, 400); }
        const event_type = String(body.event_type || "").trim();
        const identifier = String(body.brand_id || body.artist_id || "").trim();
        const brand = identifier ? await resolveBrand(env, identifier) : null;
        const product_id = String(body.product_id || "").trim() || null;
        const session_id = String(body.session_id || "").trim() || null;
        const metadata = body.metadata ? JSON.stringify(body.metadata) : null;
        if (!event_type) return json({ status: "error", message: "Missing event_type" }, 400);
        const ALLOWED_EVENTS = [
          "store_view", "product_view", "add_to_cart", "remove_from_cart",
          "checkout_start", "checkout_complete", "whatsapp_click", "social_click",
          "launch_view"
        ];
        if (!ALLOWED_EVENTS.includes(event_type)) {
          return json({ status: "ok", note: "event_type not tracked" });
        }
        const event_id = uid("EVT");
        await env.DB.prepare(
          `INSERT INTO store_events (event_id, event_type, brand_id, product_id, session_id, metadata)
           VALUES (?, ?, ?, ?, ?, ?)`
        )
          .bind(event_id, event_type, brand?.brand_id || null, product_id, session_id, metadata)
          .run();
        return json({ status: "success", event_id });
      }

      // ─── NEW AUTH / EMAIL ROUTES ─────────────────────────────
      if (path === "/api/auth/signup" && request.method === "POST") {
        return await handleSignup(request, env);
      }
      if (path === "/api/auth/send-otp" && request.method === "POST") {
        return await handleSendOTP(request, env);
      }
      if (path === "/api/auth/verify-otp" && request.method === "POST") {
        return await handleVerifyOTP(request, env);
      }
      if (path === "/api/auth/verify-email" && request.method === "GET") {
        return await handleVerifyEmailLink(request, env);
      }
      if (path === "/api/auth/resend-verification" && request.method === "POST") {
        return await handleResendVerification(request, env);
      }

      // ─── EXISTING AUTH ROUTES ────────────────────────────────
      if (path === "/set-password" && request.method === "POST") return await handleSetPassword(request, env);
      if (path === "/login" && request.method === "POST") return await handleLogin(request, env);
      if (path === "/me" && request.method === "GET") return await handleMe(request, env);
      if (path === "/logout" && request.method === "POST") return await handleLogout(request, env);

      // ─── GOOGLE OAUTH ROUTES ──────────────────────────────────
      if (path === "/api/auth/google" && request.method === "GET") {
        return await handleGoogleAuth(request, env);
      }
      if (path === "/api/auth/google/callback" && request.method === "GET") {
        return await handleGoogleCallback(request, env);
      }

      // ─── PAYMENT ROUTES ──────────────────────────────────────
      if (path === "/create-payment" && request.method === "POST") return await handleCreatePayment(request, env);
      if (path === "/poll-status" && request.method === "GET") return await handlePollStatus(request, env);
      if (path === "/check-payment" && request.method === "GET") return await handlePollStatus(request, env);
      if (path === "/artist-dashboard" && request.method === "GET") return await handleBrandDashboard(request, env);
      if (path === "/owner-dashboard" && request.method === "GET") {
        return await handleOwnerDashboard(request, env);
      }
      if (path === "/update-fulfilment" && request.method === "POST") return await handleUpdateFulfilment(request, env);

      // ─── UPDATE BRAND SKIN (path kept as /update-artist-skin for
      // dashboard compatibility; writes to brands now, not artists) ──
      if (path === "/update-artist-skin" && request.method === "POST") {
        let data;
        try { data = await request.json(); } catch { return json({ status: "error", message: "Invalid JSON body" }, 400); }
        const identifier = data.brand_id || data.artist_id;
        const industry_preference = data.brand_feeling || data.industry_preference || data.visual_style;
        if (!identifier) return json({ status: "error", message: "Missing brand_id" }, 400);
        if (!industry_preference) return json({ status: "error", message: "Missing industry_preference" }, 400);
        const brand = await resolveBrand(env, identifier);
        if (!brand) return json({ status: "error", message: "Brand not found" }, 404);
        await env.DB.prepare(`UPDATE brands SET brand_feeling = ?, updated_at = datetime('now') WHERE brand_id = ?`)
          .bind(industry_preference, brand.brand_id)
          .run();
        return json({
          status: "success",
          message: `Skin updated to ${industry_preference}`,
          brand_id: brand.brand_id,
          industry_preference
        });
      }

      // ─── GET BRAND STORE CONFIG (path kept as /artist-store-config
      // for dashboard compatibility; reads from brands now) ──────
      if (path === "/artist-store-config" && request.method === "GET") {
        const auth = await authenticateRequest(request, env);
        if (!auth.ok) return json({ status: "error", message: "Unauthorized" }, 401);
        const user = auth.user;
        const brandId = user.brand_id || "";
        if (!brandId) return json({ status: "error", message: "No brand associated with this account" }, 400);
        const brand = await resolveBrand(env, brandId);
        if (!brand) return json({ status: "error", message: "Brand not found" }, 404);
        return json({
          status: "success",
          artist: {
            brand_id: brand.brand_id,
            brand_name: brand.brand_name,
            slug: brand.brand_slug,
            industry_preference: brand.brand_feeling || 'streetwear',
            visual_style: brand.brand_feeling || 'streetwear',
            store_type: brand.store_mode || 'music'
          },
          brand: {
            brand_id: brand.brand_id,
            brand_name: brand.brand_name,
            slug: brand.brand_slug,
            brand_feeling: brand.brand_feeling || 'streetwear',
            store_mode: brand.store_mode || 'hybrid'
          }
        });
      }

      // ─── WEB CHECKOUT ──────────────────────────────────────────
      if (path === "/web-checkout" && request.method === "POST") {
        let body;
        try { body = await request.json(); } catch { return json({ status: "error", message: "Invalid JSON body" }, 400); }

        const identifier = String(body.brand_id || body.artist_id || "").trim();
        const customer_name = String(body.customer_name || "Guest");
        const phone = String(body.customer_phone || body.phone || "").trim();
        const email = String(body.customer_email || body.email || "").trim();
        const items = Array.isArray(body.items) ? body.items : [];

        const shipping_address = String(body.shipping_address || "").trim();
        const shipping_city = String(body.shipping_city || "").trim();
        const shipping_province = String(body.shipping_province || "").trim();
        const shipping_postal_code = String(body.shipping_postal_code || "").trim();
        const shipping_country = String(body.shipping_country || "Zimbabwe").trim();

        if (!identifier) return json({ status: "error", message: "Missing brand_id" }, 400);
        if (!phone) return json({ status: "error", message: "Missing phone" }, 400);
        if (!email) return json({ status: "error", message: "Missing email" }, 400);
        if (!items.length) return json({ status: "error", message: "Cart is empty" }, 400);

        const brand = await resolveBrand(env, identifier);
        if (!brand) return json({ status: "error", message: "Invalid brand" }, 400);

        let total_amount = 0;
        const savedItems = [];
        for (const item of items) {
          const product_id = String(item.product_id || "").trim();
          const quantity = Math.max(1, Number(item.quantity || 1));
          if (!product_id) continue;
          const product = await env.DB.prepare(
            `SELECT product_id, product_name, product_type, price, active FROM products WHERE product_id = ? AND active = 1 LIMIT 1`
          )
            .bind(product_id)
            .first();
          if (!product) continue;
          const unit_price = Number(product.price || 0);
          const line_total = unit_price * quantity;
          total_amount += line_total;
          savedItems.push({
            product_id: product.product_id,
            product_name: product.product_name,
            product_type: product.product_type,
            quantity,
            unit_price,
            line_total
          });
        }
        if (!savedItems.length) return json({ status: "error", message: "No valid items in cart" }, 400);
        if (total_amount <= 0) return json({ status: "error", message: "Invalid cart total" }, 400);

        const productName = savedItems[0].product_name || "Cart items";

        const paymentPayload = {
          brand_id: brand.brand_id,
          brand_name: brand.brand_name,
          customer_name,
          phone,
          customer_phone: phone,
          email,
          customer_email: email,
          order_type: "web_cart",
          platform: "web_store",
          total_amount,
          order_total: total_amount,
          currency: "USD",
          items: savedItems,
          shipping_address,
          shipping_city,
          shipping_province,
          shipping_postal_code,
          shipping_country,
          product_name: productName,
          product_id: savedItems[0].product_id
        };

        const fakeRequest = new Request("https://internal/create-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(paymentPayload)
        });
        return await handleCreatePayment(fakeRequest, env);
      }

      // ─── GENERATE SHIPPING LABEL ──────────────────────────────
      if (path === "/generate-shipping-label" && request.method === "POST") {
        const auth = await authenticateRequest(request, env);
        if (!auth.ok) return jsonResponse({ status: "error", message: "Unauthorized" }, 401);
        if (!canUpdateFulfilment(auth.user)) return jsonResponse({ status: "error", message: "Forbidden" }, 403);

        let body;
        try { body = await request.json(); } catch { return jsonResponse({ status: "error", message: "Invalid JSON" }, 400); }
        const orderId = body.order_id;
        if (!orderId) return jsonResponse({ status: "error", message: "Missing order_id" }, 400);

        return await generateShippingLabel(request, env, auth.user, orderId);
      }

      // ─── DOMAIN ROUTES ─────────────────────────────────────────
      if (path === "/domains/search" && request.method === "GET") {
        return await handleDomainSearch(request, env);
      }
      if (path === "/domains/check" && request.method === "GET") {
        return await handleDomainCheck(request, env);
      }
      if (path === "/domains/register" && request.method === "POST") {
        return await handleDomainRegister(request, env);
      }
      if (path === "/domains/list" && request.method === "GET") {
        return await handleDomainList(request, env);
      }
      if (path === "/domains/remove" && request.method === "POST") {
        return await handleDomainRemove(request, env);
      }

      // ─── SUBSCRIPTION ROUTES ──────────────────────────────────
      if (path === "/subscription/plans" && request.method === "GET") {
        return await handleSubscriptionPlans(request, env);
      }
      if (path === "/subscription/current" && request.method === "GET") {
        return await handleSubscriptionCurrent(request, env);
      }
      if (path === "/subscription/purchase" && request.method === "POST") {
        return await handleSubscriptionPurchase(request, env);
      }
      if (path === "/subscription/purchase/status" && request.method === "GET") {
        return await handleSubscriptionPurchaseStatus(request, env);
      }
      if (path === "/subscription/limit-check" && request.method === "GET") {
        return await handleSubscriptionLimitCheck(request, env);
      }

      // ─── PRODUCT CATALOG ROUTES ───────────────────────────────
      if (path === "/catalog" && request.method === "GET") {
        return await handleCatalogList(request, env);
      }
      if (path === "/admin/catalog/create" && request.method === "POST") {
        return await handleAdminCatalogCreate(request, env);
      }
      if (path === "/admin/catalog/update" && request.method === "POST") {
        return await handleAdminCatalogUpdate(request, env);
      }

      // ─── BRAND IDENTITY / ARTWORK GENERATOR ROUTES ─────────────
      if (path === "/identity/generate" && request.method === "POST") {
        return await handleIdentityGenerate(request, env);
      }
      if (path === "/identity/select" && request.method === "POST") {
        return await handleIdentitySelect(request, env);
      }
      if (path === "/identity" && request.method === "GET") {
        return await handleIdentityGet(request, env);
      }
      if (path === "/identity/mockup" && request.method === "POST") {
        return await handleIdentityMockup(request, env);
      }
      // Open, unauthenticated — but handleAssetServe hard-checks the key
      // is under brands/*/public/ before returning anything. Everything
      // else 404s regardless of whether the object actually exists.
      if (path.startsWith("/assets/") && request.method === "GET") {
        return await handleAssetServe(env, decodeURIComponent(path.slice("/assets/".length)));
      }
      // Auth-gated — only the owning brand's Bearer token can read a
      // draft key here; handleIdentityPreviewServe checks brand_id itself.
      if (path.startsWith("/identity/preview/") && request.method === "GET") {
        return await handleIdentityPreviewServe(request, env, decodeURIComponent(path.slice("/identity/preview/".length)));
      }
      // Internal tool, Basic-Auth gated (not the normal Bearer session
      // auth) so it opens from a plain bookmarked browser URL.
      if (path === "/admin/calibrator" && request.method === "GET") {
        return await handleAdminCalibrator(request, env);
      }
      if (path === "/admin/calibrator/save" && request.method === "POST") {
        return await handleAdminCalibratorSave(request, env);
      }
      if (path === "/admin/fonts" && request.method === "GET") {
        return await handleAdminFontsPage(request, env);
      }
      if (path === "/admin/fonts/toggle" && request.method === "POST") {
        return await handleAdminFontsToggle(request, env);
      }
      if (path === "/admin/fonts/recategorize" && request.method === "POST") {
        return await handleAdminFontsRecategorize(request, env);
      }
      if (path === "/admin/fonts/set-case" && request.method === "POST") {
        return await handleAdminFontsSetCase(request, env);
      }
      if (path === "/admin/fonts/diagnose" && request.method === "GET") {
        return await handleAdminFontsDiagnose(request, env);
      }
      if (path === "/admin/preview" && request.method === "GET") {
        return await handleAdminPreviewPage(request, env);
      }
      if (path === "/admin/archetypes/toggle" && request.method === "POST") {
        return await handleAdminArchetypesToggle(request, env);
      }

      // ─── WHOLESALE MANUFACTURING ROUTES ───────────────────────
      if (path === "/wholesale/inquiry" && request.method === "POST") {
        return await handleWholesaleInquiry(request, env);
      }
      if (path === "/wholesale/list" && request.method === "GET") {
        return await handleWholesaleList(request, env);
      }
      if (path === "/wholesale/update" && request.method === "POST") {
        return await handleWholesaleUpdate(request, env);
      }

      // ─── TEMPORARY TEST EMAIL ROUTE (REMOVE AFTER TESTING) ──
      if (path === "/test-email" && request.method === "POST") {
        let body;
        try { body = await request.json(); } catch { return json({ status: "error", message: "Invalid JSON" }, 400); }
        const to = body.to || "junzatv@gmail.com";
        const subject = body.subject || "Test from Worker";
        const html = body.html || "<p>This is a test email sent directly from the Worker.</p>";
        const from = body.from || "noreply@zvakho.co.zw";
        const result = await sendResendEmail(env, to, subject, html, "", from);
        return json({ result });
      }

      // ─── 404 ──────────────────────────────────────────────────
      return json({ status: "error", message: "Route not found" }, 404);
    } catch (err) {
      return json({ status: "error", message: err.message || "Internal server error" }, 500);
    }
  }
};