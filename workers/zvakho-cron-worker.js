// ================================================================
// ZVAKHO Cron Worker — Scheduled Tasks
// Runs every 5 minutes, hourly, daily, etc.
// ================================================================

export default {
  async scheduled(event, env, ctx) {
    // ─── Run all tasks ──────────────────────────────────────────
    console.log('🕒 Cron worker started at', new Date().toISOString());

    try {
      // 1. Payment reconciliation (every 5 min)
      await reconcilePendingPayments(env);

      // 2. Subscription & billing (daily)
      await handleSubscriptions(env);

      // 3. Automated email campaigns (daily)
      await sendAutomatedEmails(env);

      // 4. Dashboard analytics cache (hourly)
      await cacheAnalytics(env);

      // 5. Data cleanup & maintenance (daily)
      await cleanupData(env);

      console.log('✅ All cron tasks completed');
    } catch (err) {
      console.error('❌ Cron error:', err);
    }
  },

  // Optional: keep fetch for health checks
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/cron/status') {
      return new Response(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return new Response('Not found', { status: 404 });
  }
};

// ─────────────────────────────────────────────────────────────
// 1. PAYMENT RECONCILIATION
// ─────────────────────────────────────────────────────────────
async function reconcilePendingPayments(env) {
  console.log('⏳ Reconciling pending payments...');

  // Get pending orders that have a poll_url and are not older than 7 days
  const orders = await env.DB.prepare(`
    SELECT payment_reference, poll_url, phone, product_name, artist_name, amount, email, product_id
    FROM orders
    WHERE payment_status = 'pending'
      AND poll_url IS NOT NULL
      AND created_at > datetime('now', '-7 days')
    LIMIT 100
  `).all();

  let updated = 0;
  for (const order of orders.results || []) {
    try {
      const res = await fetch(order.poll_url);
      const text = await res.text();
      const parsed = parsePaynowResponse(text);
      const paynowStatus = String(parsed.status || '').toLowerCase();

      if (paynowStatus === 'paid' || paynowStatus === 'awaiting delivery') {
        // Update order
        await env.DB.prepare(`
          UPDATE orders
          SET payment_status = 'paid',
              paynow_reference = ?,
              paynow_status = ?,
              paid_at = datetime('now'),
              updated_at = datetime('now')
          WHERE payment_reference = ?
        `).bind(parsed.paynowreference || parsed.reference || '', parsed.status || 'Paid', order.payment_reference).run();

        // Send confirmation email if email exists
        if (order.email) {
          await sendOrderConfirmationEmail(env, order.email, {
            orderId: order.payment_reference,
            amount: order.amount,
            productName: order.product_name,
            artistName: order.artist_name
          });
        }

        // Notify ManyChat if phone exists
        if (order.phone) {
          await notifyManyChat(env, {
            phone: order.phone,
            productName: order.product_name,
            artistName: order.artist_name,
            reference: order.payment_reference,
            amount: order.amount
          });
        }

        updated++;
        console.log(`✅ Order ${order.payment_reference} marked as paid`);
      }
    } catch (err) {
      console.error(`❌ Error reconciling order ${order.payment_reference}:`, err);
    }
  }

  console.log(`✅ Reconciled ${updated} orders`);
}

// ─────────────────────────────────────────────────────────────
// 2. SUBSCRIPTION & BILLING MANAGEMENT
// ─────────────────────────────────────────────────────────────
async function handleSubscriptions(env) {
  console.log('⏳ Checking subscriptions...');

  // Get brands with active subscriptions that are about to expire
  // Assume subscription_history stores end_date or we compute from subscription_plan + start_date
  // Since your schema has subscription_history with changed_at, we treat the latest as active.
  // For simplicity, we'll check brands that have subscription_status='active' and we'll mark as expired if no recent activity.
  // We'll also send reminder emails 7 days before expiry (if we had expiry date).
  // Since we don't have explicit expiry in schema, we can use a grace period: if no subscription_history entry in last 30 days, set to grace.
  // But we'll implement a simple version: send monthly reminders to active brands.

  // Get all brands with active subscription
  const brands = await env.DB.prepare(`
    SELECT brand_id, artist_id, brand_name, brand_email, subscription_plan, subscription_status
    FROM brands
    WHERE subscription_status = 'active'
  `).all();

  // For each, check if we need to send renewal reminder (e.g., if last subscription_history entry > 25 days ago)
  for (const brand of brands.results || []) {
    const lastHistory = await env.DB.prepare(`
      SELECT changed_at FROM subscription_history
      WHERE brand_id = ?
      ORDER BY changed_at DESC
      LIMIT 1
    `).bind(brand.brand_id).first();

    if (lastHistory) {
      const daysSince = (Date.now() - new Date(lastHistory.changed_at).getTime()) / (1000*60*60*24);
      if (daysSince > 25 && daysSince < 30) {
        // Send reminder email
        await sendSubscriptionReminder(env, brand.brand_email, brand.brand_name, brand.subscription_plan);
        console.log(`📧 Sent renewal reminder to ${brand.brand_email}`);
      } else if (daysSince > 35) {
        // Mark as expired (grace period over)
        await env.DB.prepare(`
          UPDATE brands SET subscription_status = 'expired' WHERE brand_id = ?
        `).bind(brand.brand_id).run();
        console.log(`⏹️ Subscription expired for ${brand.brand_name}`);
      }
    }
  }

  console.log('✅ Subscription check complete');
}

// ─────────────────────────────────────────────────────────────
// 3. AUTOMATED EMAIL CAMPAIGNS
// ─────────────────────────────────────────────────────────────
async function sendAutomatedEmails(env) {
  console.log('⏳ Sending automated emails...');

  // Welcome emails for new users who haven't received one
  const newUsers = await env.DB.prepare(`
    SELECT user_id, email, name, created_at
    FROM users
    WHERE email_verified = 1
      AND (welcome_sent IS NULL OR welcome_sent = 0)
      AND created_at > datetime('now', '-7 days')
    LIMIT 50
  `).all();

  for (const user of newUsers.results || []) {
    await sendWelcomeEmail(env, user.email, user.name || '');
    await env.DB.prepare(`
      UPDATE users SET welcome_sent = 1 WHERE user_id = ?
    `).bind(user.user_id).run();
    console.log(`📧 Welcome email sent to ${user.email}`);
  }

  // Re-engagement: artists with no sales in last 30 days
  const inactiveArtists = await env.DB.prepare(`
    SELECT DISTINCT artist_id, artist_name, email
    FROM orders
    WHERE payment_status = 'paid'
      AND paid_at < datetime('now', '-30 days')
    GROUP BY artist_id
    HAVING COUNT(*) = 0
    LIMIT 50
  `).all();

  for (const artist of inactiveArtists.results || []) {
    await sendReengagementEmail(env, artist.email, artist.artist_name);
    console.log(`📧 Re-engagement email sent to ${artist.email}`);
  }

  console.log('✅ Automated emails sent');
}

// ─────────────────────────────────────────────────────────────
// 4. DASHBOARD ANALYTICS CACHE
// ─────────────────────────────────────────────────────────────
async function cacheAnalytics(env) {
  console.log('⏳ Caching analytics...');

  // Compute platform stats
  const stats = await env.DB.prepare(`
    SELECT
      COUNT(*) as total_orders,
      SUM(CASE WHEN payment_status = 'paid' THEN amount ELSE 0 END) as total_revenue,
      SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END) as paid_orders,
      SUM(CASE WHEN payment_status != 'paid' THEN 1 ELSE 0 END) as pending_orders,
      COUNT(DISTINCT artist_id) as active_artists,
      COUNT(DISTINCT user_id) as unique_customers
    FROM orders
  `).first();

  // Store in KV (if you have a KV namespace)
  if (env.ANALYTICS_KV) {
    await env.ANALYTICS_KV.put('platform_stats', JSON.stringify(stats), { expirationTtl: 3600 }); // 1 hour
    console.log('✅ Analytics cached in KV');
  } else {
    // Fallback: store in D1 (create a cache table)
    await env.DB.prepare(`
      INSERT OR REPLACE INTO analytics_cache (key, value, updated_at)
      VALUES ('platform_stats', ?, datetime('now'))
    `).bind(JSON.stringify(stats)).run();
    console.log('✅ Analytics stored in D1 cache');
  }
}

// ─────────────────────────────────────────────────────────────
// 5. DATA CLEANUP & MAINTENANCE
// ─────────────────────────────────────────────────────────────
async function cleanupData(env) {
  console.log('⏳ Cleaning up data...');

  // Delete expired sessions (older than 30 days)
  const sessionsDeleted = await env.DB.prepare(`
    DELETE FROM sessions
    WHERE expires_at < datetime('now', '-30 days')
      OR (revoked_at IS NOT NULL AND revoked_at < datetime('now', '-7 days'))
  `).run();
  console.log(`🗑️ Deleted ${sessionsDeleted.meta?.changes || 0} expired sessions`);

  // Delete old store_events older than 90 days
  const eventsDeleted = await env.DB.prepare(`
    DELETE FROM store_events
    WHERE created_at < datetime('now', '-90 days')
  `).run();
  console.log(`🗑️ Deleted ${eventsDeleted.meta?.changes || 0} old store events`);

  // Delete unused OTPs older than 1 hour (verified ones can be kept for audit)
  const otpsDeleted = await env.DB.prepare(`
    DELETE FROM otps
    WHERE expires_at < datetime('now')
      OR (verified = 1 AND created_at < datetime('now', '-1 day'))
  `).run();
  console.log(`🗑️ Deleted ${otpsDeleted.meta?.changes || 0} old OTPs`);

  // Optionally archive old orders (move to archive table) – skipping for now

  console.log('✅ Data cleanup complete');
}

// ─────────────────────────────────────────────────────────────
// HELPERS (copied from main worker)
// ─────────────────────────────────────────────────────────────
function parsePaynowResponse(text) {
  const result = {};
  if (!text) return result;
  text.split('&').forEach((pair) => {
    const [k, v] = pair.split('=');
    if (!k) return;
    result[decodeURIComponent(k).toLowerCase()] = decodeURIComponent(v || '');
  });
  return result;
}

async function sendResendEmail(env, to, subject, html, text = '') {
  if (!env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set – email not sent.');
    return { success: false, error: 'Missing API key' };
  }
  const from = `ZVAKHO <noreply@zvakho.co.zw>`;
  const payload = { from, to: [to], subject, html, text: text || html.replace(/<[^>]*>/g, "") };
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

async function sendOrderConfirmationEmail(env, email, { orderId, amount, productName, artistName }) {
  const html = `
    <h2>✅ Order Confirmed</h2>
    <p>Your order #${orderId} has been confirmed.</p>
    <p><strong>Product:</strong> ${productName}</p>
    <p><strong>Amount:</strong> $${amount}</p>
    <p><strong>Artist:</strong> ${artistName}</p>
    <p>Thank you for supporting independent music!</p>
  `;
  await sendResendEmail(env, email, `Your ZVAKHO order #${orderId} is confirmed`, html);
}

async function sendSubscriptionReminder(env, email, brandName, plan) {
  const html = `
    <h2>⏳ Your ${plan} plan is expiring soon</h2>
    <p>Hi ${brandName},</p>
    <p>Your subscription will expire in a few days. Renew now to keep your store active.</p>
    <p><a href="https://zvakho.co.zw/dashboard">Renew now</a></p>
  `;
  await sendResendEmail(env, email, `Your ZVAKHO subscription is expiring`, html);
}

async function sendWelcomeEmail(env, email, name) {
  const html = `
    <h2>🎉 Welcome to ZVAKHO!</h2>
    <p>Hi ${name || 'there'},</p>
    <p>You're now part of the ZVAKHO community. Start selling your music and merchandise.</p>
    <p><a href="https://zvakho.co.zw/dashboard">Go to your dashboard</a></p>
  `;
  await sendResendEmail(env, email, 'Welcome to ZVAKHO!', html);
}

async function sendReengagementEmail(env, email, artistName) {
  const html = `
    <h2>👋 It's been a while</h2>
    <p>Hi ${artistName || 'Artist'},</p>
    <p>We noticed you haven't had any sales lately. Let's get you back on track.</p>
    <p><a href="https://zvakho.co.zw/dashboard">View your store</a></p>
  `;
  await sendResendEmail(env, email, 'How to boost your ZVAKHO sales', html);
}

async function notifyManyChat(env, { phone, productName, artistName, reference, amount }) {
  // ... (same as in main worker, but we keep it simple for cron)
  // We'll copy from main worker – but for brevity we reference it.
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
  } catch {}
}