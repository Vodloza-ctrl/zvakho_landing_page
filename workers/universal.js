// ================================================================
// ZVAKHO Universal Worker — v19 (Custom Sender Addresses)
// Uses brands.subscription_plan for subscription data – no subscription_plans table.
// Sends from any @zvakho.co.zw address via Resend.
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
        artist_id: user.artist_id || ""
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
          u.artist_id,
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
          artist_id: session.artist_id
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
      const { orderId, amount, items, artistName } = orderDetails;
      const html = `
        <h2>✅ Order Confirmed</h2>
        <p>Your order #${orderId} has been confirmed.</p>
        <p><strong>Total:</strong> $${amount}</p>
        <p><strong>Artist:</strong> ${artistName}</p>
        <p>We'll notify you when it's ready.</p>
      `;
      // Use support@ for order confirmations (or you can use noreply)
      await sendResendEmail(env, email, `Your ZVAKHO order #${orderId} is confirmed`, html, "", "support@zvakho.co.zw");
    }

    // ───── RE-ENGAGEMENT EMAIL (MARKETING) ──────────────────
    async function sendReengagementEmail(env, email, artistName) {
      // Check consent first
      const user = await env.DB.prepare(
        `SELECT marketing_consent, unsubscribe_token FROM users WHERE LOWER(email) = LOWER(?)`
      ).bind(email).first();
      if (!user || user.marketing_consent !== 1) return; // skip if no consent

      const unsubscribeLink = `https://${env.APP_DOMAIN.replace(/^https?:\/\//, '')}/unsubscribe?email=${encodeURIComponent(email)}&token=${user.unsubscribe_token}`;

      const html = `
        <h2>👋 It's been a while</h2>
        <p>Hi ${artistName || 'Artist'},</p>
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
        `SELECT user_id, email, name, role, artist_id, is_active, email_verified FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1`
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
          `SELECT user_id, email, name, role, artist_id, is_active, email_verified FROM users WHERE user_id = ?`
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
        `SELECT user_id, email, name, role, artist_id, is_active FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1`
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
        SELECT user_id, email, name, role, artist_id, password_hash, password_salt, is_active, email_verified
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

    // ───── ARTIST CONFIG (hardcoded fallback) ──────────────────
    const ARTISTS = {
      MDUSEVAN: {
        artist_id: "MDUSEVAN",
        slug: "mdusevan",
        artist_name: "Mdu Sevan",
        dashboard_key: "abc123",
        whatsapp_store_link: "https://wa.me/263719362231?text=MDUSEVAN",
        status: "active",
        store_title: "Official Mdu Sevan Store",
        store_subtitle: "Direct music purchases through ZVAKHO.",
        products: [
          {
            product_id: "MDUSEVAN_MUSIC",
            product_name: "Mdu Sevan Music",
            product_type: "music",
            price_label: "Priced by release",
            description: "Purchase available tracks and releases directly through WhatsApp.",
            cta_label: "Purchase music via WhatsApp",
            whatsapp_link: "https://wa.me/263719362231?text=MDUSEVAN"
          }
        ]
      },
      VUSAMANGENA: {
        artist_id: "VUSAMANGENA",
        slug: "vusamangena",
        artist_name: "Vusa Mangena",
        dashboard_key: "xyz456",
        whatsapp_store_link: "https://wa.me/263719362231?text=VUSAMANGENA",
        status: "active",
        store_title: "Official Vusa Mangena Store",
        store_subtitle: "Direct music purchases through ZVAKHO.",
        products: [
          {
            product_id: "VUSAMANGENA_MUSIC",
            product_name: "Vusa Mangena Music",
            product_type: "music",
            price_label: "Priced by release",
            description: "Purchase available tracks and releases directly through WhatsApp.",
            cta_label: "Purchase music via WhatsApp",
            whatsapp_link: "https://wa.me/263719362231?text=VUSAMANGENA"
          }
        ]
      },
      ABSOLL: {
        artist_id: "ABSOLL",
        slug: "absoll",
        artist_name: "Absoll Luz",
        dashboard_key: "key789",
        whatsapp_store_link: "https://wa.me/263719362231?text=ABSOLL",
        status: "active",
        store_title: "Official Absoll Luz Store",
        store_subtitle: "Direct music purchases through ZVAKHO.",
        products: [
          {
            product_id: "ABSOLL_MUSIC",
            product_name: "Absoll Luz Music",
            product_type: "music",
            price_label: "Priced by release",
            description: "Purchase available tracks and releases directly through WhatsApp.",
            cta_label: "Purchase music via WhatsApp",
            whatsapp_link: "https://wa.me/263719362231?text=ABSOLL"
          }
        ]
      }
    };

    function publicArtist(artist) {
      return {
        artist_id: artist.artist_id,
        slug: artist.slug,
        artist_name: artist.artist_name,
        status: artist.status,
        whatsapp_store_link: artist.whatsapp_store_link
      };
    }

    function normalizeArtistId(value) {
      const cleaned = String(value || "").trim().replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
      if (!cleaned || cleaned === "WWW" || cleaned === "ZVAKHO") return "MDUSEVAN";
      if (ARTISTS[cleaned]) return cleaned;
      const bySlug = Object.values(ARTISTS).find((a) => a.slug.toUpperCase() === cleaned);
      return bySlug ? bySlug.artist_id : cleaned;
    }

    function getArtist(artistId) {
      return ARTISTS[normalizeArtistId(artistId)] || null;
    }

    function getArtistName(artistId) {
      const artist = getArtist(artistId);
      return artist?.artist_name || normalizeArtistId(artistId);
    }

    // ───── SAVE ORDER ITEMS ─────────────────────────────────────
    async function saveOrderItems(env, options) {
      const {
        orderId,
        paymentReference,
        fallbackArtistId,
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
        const artistId = String(item.artist_id || fallbackArtistId || "").trim();
        const productName = String(item.product_name || fallbackProductName || "Product").trim();
        const productType = String(item.product_type || fallbackProductType || "item").trim();
        const color = String(item.color || "").trim();
        const sizeCode = String(item.size_code || "").trim();
        const sizeLabel = String(item.size_label || "").trim();
        const quantity = Math.max(1, Number(item.quantity || fallbackQuantity || 1));
        const unitPrice = Number(item.unit_price ?? fallbackUnitPrice ?? 0);
        const lineTotal = Number(item.line_total ?? quantity * unitPrice);

        if (!productId || !artistId || !productName || !productType) continue;

        const itemId = `${paymentReference}_${index + 1}_${sanitizeId(productId).slice(0, 32)}`;
        await env.DB.prepare(
          `
          INSERT OR REPLACE INTO order_items (
            item_id, order_id, payment_reference, artist_id, product_id, variant_id,
            product_name, product_type, color, size_code, size_label,
            quantity, unit_price, line_total, fulfilment_status, stock_deducted,
            created_at, updated_at
          )
          VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'not_started', 0, datetime('now'), datetime('now')
          )
        `
        )
          .bind(
            itemId,
            orderId,
            paymentReference,
            artistId,
            productId,
            variantId,
            productName,
            productType,
            color,
            sizeCode,
            sizeLabel,
            quantity,
            unitPrice,
            lineTotal
          )
          .run();
        saved++;
      }
      return saved;
    }

    // ───── MANYCHAT NOTIFICATION ──────────────────────────────
    async function notifyManyChat(env, { phone, productName, artistName, reference, amount, customMessage }) {
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
                { field_name: "artist_name", field_value: String(artistName || "") }
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
            SELECT * FROM orders WHERE order_id = ? AND artist_id = ?
          `).bind(orderId, user.artist_id).first();
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
          artistName: order.artist_name,
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
      const artistId = String(body.artist_id || "general");
      const artistName = String(body.artist_name || "");
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
      if (!artistId) return jsonResponse({ status: "error", message: "Missing artist_id" }, 400);

      if (userId) {
        const existing = await env.DB.prepare(
          `
          SELECT payment_reference, poll_url, browser_url
          FROM orders
          WHERE user_id = ? AND artist_id = ? AND product_name = ? AND amount = ? AND payment_status = 'pending'
          LIMIT 1
        `
        )
          .bind(userId, artistId, productName, totalAmount)
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

      const safeArtistId = sanitizeId(artistId);
      const reference = `ZVAKHO_${safeArtistId}_${Date.now()}`;
      const baseUrl = env.BASE_URL || "https://zvakho-payments-v2.yasibomedia.workers.dev";

      const fields = {
        resulturl: `${baseUrl}/paynow-result`,
        returnurl: `${baseUrl}/return`,
        reference,
        amount: totalAmount.toFixed(2),
        id: env.PAYNOW_INTEGRATION_ID,
        additionalinfo: `${artistName || artistId} - ${productName} x${quantity}`,
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
          order_id, user_id, artist_id, artist_name, product_id, product_name, track_file,
          order_type, quantity, unit_price, delivery_fee, amount, currency, platform,
          delivery_method, payment_reference, payment_status, poll_url, browser_url,
          paynow_status, paynow_error, phone,
          shipping_address, shipping_city, shipping_province, shipping_postal_code, shipping_country,
          fulfilment_status,
          created_at, updated_at
        )
        VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          'pending',
          datetime('now'), datetime('now')
        )
      `
      )
        .bind(
          reference,
          userId,
          artistId,
          artistName,
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
          shipping_country
        )
        .run();

      let orderItemsSaved = 0;
      let orderItemsError = "";
      if (items.length > 0) {
        try {
          orderItemsSaved = await saveOrderItems(env, {
            orderId: reference,
            paymentReference: reference,
            fallbackArtistId: artistId,
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
          artistName: order.artist_name || "",
          reference,
          amount: order.amount || 0
        });

        // Send order confirmation email if email exists
        if (order.email) {
          await sendOrderConfirmation(env, order.email, {
            orderId: reference,
            amount: order.amount || 0,
            items: [],
            artistName: order.artist_name || ""
          });
        }

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
      else if (ownerKey && key === ownerKey) authUser = { role: "owner", artist_id: "" };
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
      return { label, confirmed_revenue: 0, units_sold: 0, artist_share: 0, zvakho_share: 0, split_terms: splitTerms, payout_basis: payoutBasis };
    }

    function buildRevenueBreakdown(rows) {
      const breakdown = {
        music: emptyRevenueStream("Music Sales", "80% Artist / 20% ZVAKHO from confirmed revenue.", "gross_revenue"),
        vip: emptyRevenueStream("VIP Revenue", "80% Artist / 20% ZVAKHO from confirmed revenue.", "gross_revenue"),
        merch: emptyRevenueStream("Merch Revenue", "50% Artist / 50% ZVAKHO from net profit after production, packaging, and fulfilment costs.", "net_profit_after_costs")
      };
      for (const row of rows || []) {
        const stream = normalizeRevenueStreamType(row.product_type, row.product_name);
        const revenue = Number(row.revenue || 0);
        const units = Number(row.units_sold || 0);
        breakdown[stream].confirmed_revenue += revenue;
        breakdown[stream].units_sold += units;
      }
      breakdown.music.artist_share = breakdown.music.confirmed_revenue * 0.8;
      breakdown.music.zvakho_share = breakdown.music.confirmed_revenue * 0.2;
      breakdown.vip.artist_share = breakdown.vip.confirmed_revenue * 0.8;
      breakdown.vip.zvakho_share = breakdown.vip.confirmed_revenue * 0.2;
      breakdown.merch.artist_share = null;
      breakdown.merch.zvakho_share = null;
      breakdown.merch.gross_revenue = breakdown.merch.confirmed_revenue;
      breakdown.merch.cost_status = "pending_cost_confirmation";
      breakdown.merch.note = "Merch payout is calculated from net profit, not gross sales. Add production, packaging, and fulfilment costs before confirming artist share.";
      const combinedConfirmedRevenue =
        breakdown.music.confirmed_revenue + breakdown.vip.confirmed_revenue + breakdown.merch.confirmed_revenue;
      const combinedUnits = breakdown.music.units_sold + breakdown.vip.units_sold + breakdown.merch.units_sold;
      breakdown.combined = {
        label: "Combined Total",
        confirmed_revenue: combinedConfirmedRevenue,
        units_sold: combinedUnits,
        artist_share: breakdown.music.artist_share + breakdown.vip.artist_share,
        zvakho_share: breakdown.music.zvakho_share + breakdown.vip.zvakho_share,
        merch_artist_share_status: "pending_cost_confirmation",
        split_terms: "Music/VIP use 80% Artist / 20% ZVAKHO. Merch uses 50/50 net profit after costs.",
        payout_basis: "music_vip_gross_plus_merch_net_profit_pending"
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
        if (!map.has(key)) {
          map.set(key, {
            product_name: productName,
            product_type: stream,
            product_type_label: stream === "vip" ? "VIP" : stream === "merch" ? "Merch" : "Music",
            units_sold: 0,
            revenue: 0,
            artist_share: 0,
            zvakho_share: 0,
            split_terms: stream === "merch" ? "50/50 net profit after costs" : "80% Artist / 20% ZVAKHO",
            payout_basis: stream === "merch" ? "net_profit_after_costs" : "gross_revenue"
          });
        }
        const current = map.get(key);
        current.units_sold += units;
        current.revenue += revenue;
        if (stream === "merch") {
          current.artist_share = null;
          current.zvakho_share = null;
          current.cost_status = "pending_cost_confirmation";
        } else {
          current.artist_share = current.revenue * 0.8;
          current.zvakho_share = current.revenue * 0.2;
        }
      }
      return Array.from(map.values()).sort((a, b) => Number(b.revenue || 0) - Number(a.revenue || 0));
    }

    function buildArtistGuidance(summary, bestProduct, revenueBreakdown = null) {
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

    function buildOwnerGuidance(summary, pendingOrders, artistLeaderboard) {
      const guidance = [];
      const pending = Number(summary?.pending_orders || 0);
      if (pending > 0) guidance.push(`Review ${pending} pending order(s). These may require payment follow-up or support.`);
      if (artistLeaderboard?.length) guidance.push(`Current leading artist: ${artistLeaderboard[0].artist_name}. Use this as a proof case.`);
      guidance.push("Monitor confirmed revenue, pending transactions, and artist performance before expanding product categories.");
      return guidance;
    }

    // ───── ARTIST DASHBOARD ────────────────────────────────────
    async function handleArtistDashboard(request, env) {
      try {
        const url = new URL(request.url);
        const auth = await authenticateRequest(request, env);
        if (!auth.ok) return jsonResponse({ status: "error", message: "Unauthorized" }, 401);
        const authUser = auth.user;
        const role = String(authUser.role || "").toLowerCase();
        let artistId = "";
        if (role === "artist") {
          artistId = normalizeArtistId(authUser.artist_id);
        } else if (role === "owner" || role === "admin") {
          artistId = normalizeArtistId(url.searchParams.get("artist_id") || url.searchParams.get("artist") || "MDUSEVAN");
        } else {
          return jsonResponse({ status: "error", message: "Forbidden" }, 403);
        }
        const artist = getArtist(artistId);
        if (!artist) return jsonResponse({ status: "error", message: "Invalid artist_id" }, 400);

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
          WHERE UPPER(artist_id) = ?
        `
        )
          .bind(artist.artist_id)
          .first();

        const today = await env.DB.prepare(
          `
          SELECT
            SUM(CASE WHEN payment_status = 'paid' THEN amount ELSE 0 END) as today_revenue,
            SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END) as today_sales
          FROM orders
          WHERE UPPER(artist_id) = ? AND DATE(created_at) = DATE('now')
        `
        )
          .bind(artist.artist_id)
          .first();

        const sevenDays = await env.DB.prepare(
          `
          SELECT
            SUM(CASE WHEN payment_status = 'paid' THEN amount ELSE 0 END) as revenue_7_days,
            SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END) as sales_7_days
          FROM orders
          WHERE UPPER(artist_id) = ? AND DATE(created_at) >= DATE('now', '-7 days')
        `
        )
          .bind(artist.artist_id)
          .first();

        const recentRaw = await env.DB.prepare(
          `
          SELECT product_name, order_type, amount, payment_status, paynow_status, paynow_reference, created_at, paid_at
          FROM orders
          WHERE UPPER(artist_id) = ?
          ORDER BY created_at DESC
          LIMIT 20
        `
        )
          .bind(artist.artist_id)
          .all();

        const streamSourceRaw = await env.DB.prepare(
          `
          SELECT
            LOWER(COALESCE(oi.product_type, '')) as product_type,
            oi.product_name as product_name,
            SUM(COALESCE(oi.quantity, 1)) as units_sold,
            SUM(COALESCE(oi.line_total, oi.quantity * oi.unit_price, 0)) as revenue
          FROM order_items oi
          INNER JOIN orders o ON o.payment_reference = oi.payment_reference
          WHERE UPPER(oi.artist_id) = ? AND o.payment_status = 'paid'
          GROUP BY LOWER(COALESCE(oi.product_type, '')), oi.product_name

          UNION ALL

          SELECT
            LOWER(COALESCE(o.order_type, '')) as product_type,
            o.product_name as product_name,
            SUM(COALESCE(o.quantity, 1)) as units_sold,
            SUM(COALESCE(o.amount, 0)) as revenue
          FROM orders o
          WHERE UPPER(o.artist_id) = ? AND o.payment_status = 'paid'
            AND NOT EXISTS (SELECT 1 FROM order_items oi WHERE oi.payment_reference = o.payment_reference)
          GROUP BY LOWER(COALESCE(o.order_type, '')), o.product_name
        `
        )
          .bind(artist.artist_id, artist.artist_id)
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
          artist_id: artist.artist_id,
          artist_name: artist.artist_name,
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
            model: "mixed_streams_music_vip_80_20_merch_profit_pending",
            note: "Estimated payout currently uses confirmed music/VIP revenue at 80% artist share. Merch is shown as gross revenue and must be calculated separately after production, packaging, and fulfilment costs are confirmed.",
            confirmed_revenue: confirmedRevenue,
            combined_confirmed_revenue: confirmedRevenue,
            music_vip_confirmed_revenue: musicVipGross,
            merch_gross_revenue: merchGross,
            artist_share_rate_music_vip: 0.8,
            zvakho_share_rate_music_vip: 0.2,
            estimated_artist_share: musicVipArtistShare,
            estimated_zvakho_share: musicVipZvakhoShare,
            merch_artist_share_status: "pending_cost_confirmation",
            merch_split_terms: "50% Artist / 50% ZVAKHO from net profit after production, packaging, and fulfilment costs.",
            pending_revenue: pendingRevenue,
            estimated_pending_artist_share: pendingRevenue * 0.8
          },
          best_product: bestProduct,
          recent_sales: recentRaw?.results || [],
          product_performance: productPerformance,
          dashboard_guidance: buildArtistGuidance(summary, bestProduct, revenueBreakdown)
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
            COUNT(DISTINCT artist_id) as active_artists,
            COUNT(DISTINCT user_id) as unique_customers
          FROM orders
          WHERE artist_id IS NOT NULL
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

        const artistLeaderboardRaw = await env.DB.prepare(
          `
          SELECT
            UPPER(artist_id) as artist_id,
            COUNT(*) as total_orders,
            SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END) as paid_orders,
            SUM(CASE WHEN payment_status = 'paid' THEN amount ELSE 0 END) as revenue,
            SUM(CASE WHEN payment_status != 'paid' THEN 1 ELSE 0 END) as pending_orders
          FROM orders
          WHERE artist_id IS NOT NULL
          GROUP BY UPPER(artist_id)
          ORDER BY revenue DESC
        `
        ).all();

        const productLeaderboardRaw = await env.DB.prepare(
          `
          SELECT
            UPPER(artist_id) as artist_id,
            product_name,
            COUNT(*) as sales_count,
            SUM(amount) as revenue
          FROM orders
          WHERE payment_status = 'paid' AND artist_id IS NOT NULL
          GROUP BY UPPER(artist_id), product_name
          ORDER BY revenue DESC
          LIMIT 20
        `
        ).all();

        const recentOrdersRaw = await env.DB.prepare(
          `
          SELECT payment_reference, UPPER(artist_id) as artist_id, product_name, amount, payment_status, paynow_status, created_at, paid_at
          FROM orders
          WHERE artist_id IS NOT NULL
          ORDER BY created_at DESC
          LIMIT 30
        `
        ).all();

        const pendingOrdersRaw = await env.DB.prepare(
          `
          SELECT payment_reference, UPPER(artist_id) as artist_id, product_name, amount, payment_status, paynow_status, created_at
          FROM orders
          WHERE payment_status != 'paid' AND artist_id IS NOT NULL
          ORDER BY created_at DESC
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
            oi.item_id, oi.payment_reference, oi.order_id, oi.artist_id, oi.product_id, oi.variant_id,
            oi.product_name, oi.product_type, oi.color, oi.size_code, oi.size_label,
            oi.quantity, oi.unit_price, oi.line_total, oi.fulfilment_status, oi.stock_deducted,
            oi.created_at, oi.updated_at,
            o.payment_status, o.paynow_status, o.amount, o.created_at as order_created_at, o.paid_at
          FROM order_items oi
          LEFT JOIN orders o ON o.payment_reference = oi.payment_reference
          ORDER BY oi.created_at DESC
          LIMIT 50
        `
        ).all();

        const artistLeaderboard = (artistLeaderboardRaw?.results || []).map(row => ({
          ...row,
          artist_name: getArtistName(row.artist_id)
        }));
        const productLeaderboard = (productLeaderboardRaw?.results || []).map(row => ({
          ...row,
          artist_name: getArtistName(row.artist_id)
        }));
        const recent_orders = (recentOrdersRaw?.results || []).map(row => ({
          ...row,
          artist_name: getArtistName(row.artist_id)
        }));
        const pending_orders = (pendingOrdersRaw?.results || []).map(row => ({
          ...row,
          artist_name: getArtistName(row.artist_id)
        }));
        const fulfilment_items = (fulfilmentRaw?.results || []).map(row => ({
          ...row,
          artist_name: getArtistName(row.artist_id)
        }));

        return jsonResponse({
          status: "success",
          platform: "ZVAKHO",
          updated_at: new Date().toISOString(),
          summary: {
            total_orders: Number(summary?.total_orders || 0),
            total_revenue: Number(summary?.total_revenue || 0),
            paid_orders: Number(summary?.paid_orders || 0),
            pending_orders: Number(summary?.pending_orders || 0),
            active_artists: Number(summary?.active_artists || 0),
            unique_customers: Number(summary?.unique_customers || 0),
            today_revenue: Number(today?.today_revenue || 0),
            today_paid_orders: Number(today?.today_paid_orders || 0),
            today_total_orders: Number(today?.today_total_orders || 0),
            revenue_7_days: Number(sevenDays?.revenue_7_days || 0),
            paid_orders_7_days: Number(sevenDays?.paid_orders_7_days || 0),
            total_orders_7_days: Number(sevenDays?.total_orders_7_days || 0)
          },
          artist_leaderboard: artistLeaderboard,
          product_leaderboard: productLeaderboard,
          recent_orders,
          pending_orders,
          fulfilment_items,
          daily_revenue: dailyRevenueRaw?.results || [],
          owner_guidance: buildOwnerGuidance(summary, pending_orders, artistLeaderboard)
        });
      } catch (err) {
        return jsonResponse({ status: "error", message: err.message || "Owner dashboard error" }, 500);
      }
    }

    // ───── ARTIST STORE (DB-driven) ────────────────────────────
    async function handleArtistStoreDB(request, env) {
      const url = new URL(request.url);
      const artist_id = String(url.searchParams.get("artist_id") || "").trim().toUpperCase();
      if (!artist_id) return jsonResponse({ status: "error", message: "Missing artist_id" }, 400);

      const rows = await env.DB.prepare(
        `
        SELECT product_id, product_name, price, product_type, main_image_url, file_url, preview_url
        FROM products
        WHERE artist_id = ? AND active = 1
        ORDER BY created_at DESC
      `
      )
        .bind(artist_id)
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

      return jsonResponse({ status: "success", artist_id, count: products.length, products }, 200, 120);
    }

    // ───── SUBSCRIPTION PLANS (hardcoded, new pricing) ─────────
    const SUBSCRIPTION_PLANS = {
      free: {
        plan_id: 'free',
        name: 'Free',
        price_monthly: 0,
        price_yearly: 0,
        max_products: 1,
        custom_domain: 0,
        ai_features: 0,
        transaction_fee_percent: 25
      },
      launch: {
        plan_id: 'launch',
        name: 'Launch',
        price_monthly: 5,
        price_yearly: 50,
        max_products: 5,
        custom_domain: 0,
        ai_features: 0,
        transaction_fee_percent: 20
      },
      grow: {
        plan_id: 'grow',
        name: 'Grow',
        price_monthly: 15,
        price_yearly: 150,
        max_products: 25,
        custom_domain: 1,
        ai_features: 1,
        transaction_fee_percent: 12
      },
      pro: {
        plan_id: 'pro',
        name: 'Pro',
        price_monthly: 35,
        price_yearly: 350,
        max_products: 100,
        custom_domain: 1,
        ai_features: 1,
        transaction_fee_percent: 7
      },
      enterprise: {
        plan_id: 'enterprise',
        name: 'Enterprise',
        price_monthly: 149,
        price_yearly: 1490,
        max_products: 9999,
        custom_domain: 1,
        ai_features: 1,
        transaction_fee_percent: 2
      }
    };

    // ───── SUBSCRIPTION HELPERS (using brands table) ──────────
    async function getArtistSubscription(env, artistId) {
      // Get the brand (artist) record from the brands table
      const brand = await env.DB.prepare(`
        SELECT brand_id, artist_id, subscription_plan, subscription_status
        FROM brands
        WHERE artist_id = ?
        LIMIT 1
      `).bind(artistId).first();

      if (!brand) return null;
      if (!brand.subscription_plan) return null; // no plan assigned

      const planKey = brand.subscription_plan.toLowerCase();
      const plan = SUBSCRIPTION_PLANS[planKey];
      if (!plan) return null;

      // Merge brand subscription data with static plan details
      return {
        ...brand,
        ...plan,
        status: brand.subscription_status || 'active'
      };
    }

    async function checkSubscriptionFeature(env, artistId, feature) {
      const sub = await getArtistSubscription(env, artistId);
      if (!sub) return false;
      return sub[feature] === 1;
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
      const hasFeature = await checkSubscriptionFeature(env, auth.user.artist_id, 'custom_domain');
      if (!hasFeature) {
        return jsonResponse({ error: 'Your current plan does not support custom domains. Upgrade to Grow or Pro.' }, 403);
      }

      const existing = await env.DB.prepare(
        `SELECT domain_id FROM domains WHERE domain_name = ? AND artist_id = ?`
      ).bind(domain, auth.user.artist_id).first();
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
          INSERT INTO domains (domain_id, artist_id, domain_name, status, is_primary, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        `).bind(domainId, auth.user.artist_id, domain, 'active', 0).run();

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
        `SELECT * FROM domains WHERE artist_id = ? ORDER BY created_at DESC`
      ).bind(auth.user.artist_id).all();
      return jsonResponse({ domains: rows.results || [] });
    }

    async function handleDomainRemove(request, env) {
      const auth = await authenticateRequest(request, env);
      if (!auth.ok) return jsonResponse({ error: 'Unauthorized' }, 401);
      const body = await request.json();
      const { domain_id } = body;
      if (!domain_id) return jsonResponse({ error: 'Missing domain_id' }, 400);

      const domain = await env.DB.prepare(
        `SELECT domain_name FROM domains WHERE domain_id = ? AND artist_id = ?`
      ).bind(domain_id, auth.user.artist_id).first();
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
      const sub = await getArtistSubscription(env, auth.user.artist_id);
      if (!sub) {
        return jsonResponse({ hasSubscription: false });
      }
      return jsonResponse({ hasSubscription: true, subscription: sub });
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
          version: "v19-custom-sender-addresses",
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
            "GET  /subscription/current"
          ]
        });
      }

      // ─── UNSUBSCRIBE ROUTE ────────────────────────────────────
      if (path === "/unsubscribe" && request.method === "GET") {
        return await handleUnsubscribe(request, env);
      }

      // ─── STORE ROUTES ──────────────────────────────────────────
      if (path === "/homepage" && request.method === "GET") {
        const [artistRows, campaignRows] = await Promise.all([
          env.DB.prepare(
            `
            SELECT artist_id, slug, artist_name, genre, tagline, profile_image_url, hero_image_url, logo_url, is_active
            FROM artists
            WHERE is_active = 1
            ORDER BY artist_name ASC
          `
          ).all(),
          env.DB.prepare(
            `
            SELECT c.campaign_id, c.artist_id, c.title, c.slug, c.campaign_type, c.description, c.cover_image, c.release_date, c.status,
                   a.artist_name, a.slug AS artist_slug, a.profile_image_url
            FROM campaigns c
            LEFT JOIN artists a ON a.artist_id = c.artist_id
            WHERE c.status = 'active'
            ORDER BY c.release_date ASC, c.created_at DESC
            LIMIT 10
          `
          ).all()
        ]);
        return json(
          {
            status: "success",
            artists: artistRows.results || [],
            launches: campaignRows.results || []
          },
          200,
          120
        );
      }

      if (path === "/artists" && request.method === "GET") {
        return json({
          status: "success",
          artists: Object.values(ARTISTS).map(publicArtist)
        });
      }

      if (path === "/launches" && request.method === "GET") {
        const artistSlug = String(url.searchParams.get("artist") || "").trim().toLowerCase();
        let rows;
        if (artistSlug) {
          rows = await env.DB.prepare(
            `
            SELECT c.campaign_id, c.artist_id, c.title, c.slug, c.campaign_type, c.description, c.cover_image, c.release_date, c.status,
                   a.artist_name, a.slug AS artist_slug, a.profile_image_url, a.whatsapp_number
            FROM campaigns c
            LEFT JOIN artists a ON a.artist_id = c.artist_id
            WHERE c.status = 'active' AND LOWER(a.slug) = ?
            ORDER BY c.release_date ASC, c.created_at DESC
          `
          )
            .bind(artistSlug)
            .all();
        } else {
          rows = await env.DB.prepare(
            `
            SELECT c.campaign_id, c.artist_id, c.title, c.slug, c.campaign_type, c.description, c.cover_image, c.release_date, c.status,
                   a.artist_name, a.slug AS artist_slug, a.profile_image_url, a.whatsapp_number
            FROM campaigns c
            LEFT JOIN artists a ON a.artist_id = c.artist_id
            WHERE c.status = 'active'
            ORDER BY c.release_date ASC, c.created_at DESC
            LIMIT 20
          `
          ).all();
        }
        const launches = (rows.results || []).map(r => ({
          campaign_id: r.campaign_id,
          artist_id: r.artist_id,
          title: r.title || "",
          slug: r.slug || "",
          campaign_type: r.campaign_type || "Launch",
          description: r.description || "",
          cover_image: r.cover_image || "",
          release_date: r.release_date || null,
          status: r.status || "active",
          artist_name: r.artist_name || "",
          artist_slug: r.artist_slug || "",
          profile_image_url: r.profile_image_url || "",
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
                 a.artist_name, a.slug AS artist_slug, a.genre, a.bio, a.profile_image_url, a.hero_image_url,
                 a.whatsapp_number, a.instagram_url, a.tiktok_url, a.youtube_url
          FROM campaigns c
          LEFT JOIN artists a ON a.artist_id = c.artist_id
          WHERE LOWER(c.slug) = ?
          LIMIT 1
        `
        )
          .bind(slug)
          .first();
        if (!campaign) return json({ status: "error", message: "Launch not found" }, 404);
        const productsRows = await env.DB.prepare(
          `
          SELECT product_id, artist_id, campaign_id, product_type, product_name, description, price, currency,
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
          artist_id: p.artist_id,
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
          `SELECT campaign_id, artist_id, title FROM campaigns WHERE slug = ? LIMIT 1`
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
          `INSERT INTO launch_events (event_id, campaign_id, artist_id, event_type, reference_id, metadata)
           VALUES (?, ?, ?, 'supporter_joined', ?, ?)`
        )
          .bind(
            crypto.randomUUID(),
            campaign.campaign_id,
            campaign.artist_id,
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
          SELECT product_id, artist_id, campaign_id, product_type, product_name, description, price, currency,
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
          SELECT product_id, artist_id, campaign_id, product_type, product_name, description, price, currency,
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
                 a.artist_id, a.artist_name, a.slug AS artist_slug, a.genre, a.bio, a.tagline,
                 a.profile_image_url, a.hero_image_url, a.logo_url, a.logo_white_url,
                 a.whatsapp_number, a.instagram_url, a.tiktok_url, a.youtube_url,
                 at.primary_color, at.secondary_color, at.background_color, at.text_color,
                 at.accent_color AS theme_accent_color, at.ticker_text,
                 tp.button_style, tp.preset_name
          FROM campaigns c
          LEFT JOIN artists a ON a.artist_id = c.artist_id
          LEFT JOIN artist_themes at ON at.artist_id = c.artist_id
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
          artist: {
            artist_id: campaign.artist_id,
            artist_name: campaign.artist_name || "",
            slug: campaign.artist_slug || "",
            genre: campaign.genre || "",
            tagline: campaign.tagline || "",
            bio: campaign.bio || "",
            profile_image_url: campaign.profile_image_url || "",
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
          `SELECT campaign_id, artist_id, title, whatsapp_capture, whatsapp_number FROM campaigns WHERE LOWER(slug) = ? LIMIT 1`
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
            `INSERT INTO launch_events (event_id, campaign_id, artist_id, event_type, reference_id, metadata)
             VALUES (?, ?, ?, 'fan_captured', ?, ?)`
          )
            .bind(
              crypto.randomUUID(),
              campaign.campaign_id,
              campaign.artist_id,
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
        const artistParam = String(url.searchParams.get("artist") || url.searchParams.get("slug") || "").trim().toLowerCase();
        const artistIdParam = String(url.searchParams.get("artist_id") || "").trim().toUpperCase();
        if (!artistParam && !artistIdParam) {
          return json({ status: "error", message: "Missing artist or artist_id" }, 400);
        }
        const artist = artistIdParam
          ? await env.DB.prepare(
              `SELECT * FROM artists WHERE artist_id = ? AND is_active = 1 LIMIT 1`
            )
              .bind(artistIdParam)
              .first()
          : await env.DB.prepare(
              `SELECT * FROM artists WHERE LOWER(slug) = ? AND is_active = 1 LIMIT 1`
            )
              .bind(artistParam)
              .first();
        if (!artist) return json({ status: "error", message: "Artist not found" }, 404);

        const theme = await env.DB.prepare(
          `
          SELECT at.artist_id, at.preset_id,
            COALESCE(at.primary_color, tp.primary_color) AS primary_color,
            COALESCE(at.secondary_color, tp.secondary_color) AS secondary_color,
            COALESCE(at.background_color, tp.background_color) AS background_color,
            COALESCE(at.text_color, tp.text_color) AS text_color,
            COALESCE(at.accent_color, tp.accent_color) AS accent_color,
            COALESCE(at.hero_title, artists.artist_name) AS hero_title,
            at.ticker_text, at.custom_css,
            tp.preset_name, tp.button_style, tp.ticker_enabled
          FROM artist_themes at
          LEFT JOIN theme_presets tp ON tp.preset_id = at.preset_id
          LEFT JOIN artists ON artists.artist_id = at.artist_id
          WHERE at.artist_id = ? LIMIT 1
        `
        )
          .bind(artist.artist_id)
          .first();

        const productsRows = await env.DB.prepare(
          `
          SELECT product_id, artist_id, campaign_id, product_type, product_name, description, price, currency,
                 main_image_url, image_url, active, limited_release, preorder_enabled, preorder_close_date,
                 created_at, updated_at, stock, file_url, preview_url, metadata
          FROM products
          WHERE artist_id = ? AND active = 1
          ORDER BY
            CASE product_type WHEN 'merch' THEN 1 WHEN 'music' THEN 2 WHEN 'vip' THEN 3 ELSE 4 END,
            created_at DESC
        `
        )
          .bind(artist.artist_id)
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
          artist_id: p.artist_id,
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
          products.find(p => p.product_id === artist.featured_product_id) ||
          products.find(p => p.product_type === "merch") ||
          products[0] ||
          null;

        const musicProducts = products.filter(p => p.product_type === "music");
        const merchProducts = products.filter(p => p.product_type === "merch");

        const safeTheme = theme || {
          artist_id: artist.artist_id,
          preset_id: "default",
          primary_color: "#111111",
          secondary_color: "#FFFFFF",
          background_color: "#FFFFFF",
          text_color: "#111111",
          accent_color: "#C6A15B",
          hero_title: artist.artist_name,
          ticker_text: "MUSIC • MERCH • EXCLUSIVE DROPS •",
          button_style: "solid",
          ticker_enabled: 1
        };

        return json({
          status: "success",
          artist: {
            artist_id: artist.artist_id,
            slug: artist.slug,
            artist_name: artist.artist_name,
            genre: artist.genre || "",
            tagline: artist.tagline || "",
            bio: artist.bio || "",
            whatsapp_number: artist.whatsapp_number || "",
            logo_url: artist.logo_url || "",
            logo_white_url: artist.logo_white_url || artist.logo_url || "",
            logo_black_url: artist.logo_black_url || artist.logo_url || "",
            hero_image_url: artist.hero_image_url || "",
            profile_image_url: artist.profile_image_url || "",
            instagram_url: artist.instagram_url || "",
            tiktok_url: artist.tiktok_url || "",
            youtube_url: artist.youtube_url || "",
            featured_product_id: artist.featured_product_id || "",
            store_mode: artist.store_mode || "hybrid",
            visual_style: artist.visual_style || safeTheme.preset_id || "default",
            industry_preference: artist.industry_preference || "",
            preorder_end_date: artist.preorder_end_date || null,
            footer_quote: artist.footer_quote || artist.tagline || "",
            is_active: Boolean(artist.is_active)
          },
          theme: safeTheme,
          layout: {
            store_mode: artist.store_mode || "hybrid",
            visual_style: artist.visual_style || safeTheme.preset_id || "default",
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
        return await handleArtistStoreDB(request, env);
      }

      // GET /products
      if (path === "/products" && request.method === "GET") {
        const rows = await env.DB.prepare(
          `SELECT * FROM products ORDER BY artist_id ASC, created_at DESC`
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
        const artist_id = String(body.artist_id || "").toUpperCase() || null;
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
          `INSERT INTO store_events (event_id, event_type, artist_id, product_id, session_id, metadata)
           VALUES (?, ?, ?, ?, ?, ?)`
        )
          .bind(event_id, event_type, artist_id, product_id, session_id, metadata)
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
      if (path === "/artist-dashboard" && request.method === "GET") return await handleArtistDashboard(request, env);
      if (path === "/owner-dashboard" && request.method === "GET") {
        return await handleOwnerDashboard(request, env);
      }
      if (path === "/update-fulfilment" && request.method === "POST") return await handleUpdateFulfilment(request, env);

      // ─── UPDATE ARTIST SKIN ──────────────────────────────────
      if (path === "/update-artist-skin" && request.method === "POST") {
        let data;
        try { data = await request.json(); } catch { return json({ status: "error", message: "Invalid JSON body" }, 400); }
        const { artist_id, industry_preference } = data;
        if (!artist_id) return json({ status: "error", message: "Missing artist_id" }, 400);
        if (!industry_preference) return json({ status: "error", message: "Missing industry_preference" }, 400);
        const artist = await env.DB.prepare(`SELECT artist_id FROM artists WHERE artist_id = ?`)
          .bind(artist_id)
          .first();
        if (!artist) return json({ status: "error", message: "Artist not found" }, 404);
        await env.DB.prepare(`UPDATE artists SET industry_preference = ?, updated_at = datetime('now') WHERE artist_id = ?`)
          .bind(industry_preference, artist_id)
          .run();
        return json({
          status: "success",
          message: `Skin updated to ${industry_preference}`,
          artist_id,
          industry_preference
        });
      }

      // ─── GET ARTIST STORE CONFIG ─────────────────────────────
      if (path === "/artist-store-config" && request.method === "GET") {
        const auth = await authenticateRequest(request, env);
        if (!auth.ok) return json({ status: "error", message: "Unauthorized" }, 401);
        const user = auth.user;
        const artistId = user.artist_id || "";
        if (!artistId) return json({ status: "error", message: "No artist associated with this account" }, 400);
        const artist = await env.DB.prepare(
          `SELECT artist_id, artist_name, slug, industry_preference, visual_style, store_type
           FROM artists WHERE artist_id = ?`
        )
          .bind(artistId)
          .first();
        if (!artist) return json({ status: "error", message: "Artist not found" }, 404);
        return json({
          status: "success",
          artist: {
            artist_id: artist.artist_id,
            artist_name: artist.artist_name,
            slug: artist.slug,
            industry_preference: artist.industry_preference || 'streetwear',
            visual_style: artist.visual_style || 'streetwear',
            store_type: artist.store_type || 'music'
          }
        });
      }

      // ─── WEB CHECKOUT ──────────────────────────────────────────
      if (path === "/web-checkout" && request.method === "POST") {
        let body;
        try { body = await request.json(); } catch { return json({ status: "error", message: "Invalid JSON body" }, 400); }

        const artist_id = String(body.artist_id || "").trim().toUpperCase();
        const customer_name = String(body.customer_name || "Guest");
        const phone = String(body.customer_phone || body.phone || "").trim();
        const email = String(body.customer_email || body.email || "").trim();
        const items = Array.isArray(body.items) ? body.items : [];

        const shipping_address = String(body.shipping_address || "").trim();
        const shipping_city = String(body.shipping_city || "").trim();
        const shipping_province = String(body.shipping_province || "").trim();
        const shipping_postal_code = String(body.shipping_postal_code || "").trim();
        const shipping_country = String(body.shipping_country || "Zimbabwe").trim();

        if (!artist_id) return json({ status: "error", message: "Missing artist_id" }, 400);
        if (!phone) return json({ status: "error", message: "Missing phone" }, 400);
        if (!email) return json({ status: "error", message: "Missing email" }, 400);
        if (!items.length) return json({ status: "error", message: "Cart is empty" }, 400);

        const artist = await env.DB.prepare(`SELECT artist_id, artist_name FROM artists WHERE artist_id = ? AND is_active = 1 LIMIT 1`)
          .bind(artist_id)
          .first();
        if (!artist) return json({ status: "error", message: "Invalid artist" }, 400);

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
          artist_id,
          artist_name: artist.artist_name,
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

      // ─── 404 ──────────────────────────────────────────────────
      return json({ status: "error", message: "Route not found" }, 404);
    } catch (err) {
      return json({ status: "error", message: err.message || "Internal server error" }, 500);
    }
  }
};
