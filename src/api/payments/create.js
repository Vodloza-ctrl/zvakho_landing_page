// src/api/payments/create.js
export async function createPayment(request, env, user) {
    try {
        const url = new URL(request.url);
        const orderId = url.searchParams.get('order_id');
        
        if (!orderId) {
            return new Response(JSON.stringify({ 
                error: 'Order ID required' 
            }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Get order
        const order = await env.DB.prepare(`
            SELECT * FROM orders 
            WHERE order_id = ? AND brand_id = ?
        `).bind(orderId, user.brand_id).first();
        
        if (!order) {
            return new Response(JSON.stringify({ 
                error: 'Order not found' 
            }), { 
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        if (order.payment_status === 'paid') {
            return new Response(JSON.stringify({
                success: true,
                message: 'Order already paid'
            }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Get order items
        const items = await env.DB.prepare(`
            SELECT * FROM order_items 
            WHERE order_id = ?
        `).bind(orderId).all();
        
        const firstItem = items.results?.[0];
        const productName = firstItem?.product_name || 'Product';
        const artistId = firstItem?.artist_id || user.brand_id || 'GENERAL';
        
        // Generate reference (matching your working format)
        const safeArtistId = sanitizeId(artistId);
        const reference = `ZVAKHO_${safeArtistId}_${Date.now()}`;
        
        const baseUrl = env.BASE_URL || "https://zvakho-payments-v2.yasibomedia.workers.dev";
        const integrationId = env.PAYNOW_INTEGRATION_ID;
        const integrationKey = env.PAYNOW_INTEGRATION_KEY;
        
        if (!integrationId || !integrationKey) {
            return new Response(JSON.stringify({ 
                error: 'Payment system not configured' 
            }), { 
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Format phone (same as your working code)
        const phone = formatZimPhone(order.customer_phone || '');
        
        // Build Paynow fields (EXACTLY like your working code)
        const fields = {
            resulturl: `${baseUrl}/api/payments/webhook`,
            returnurl: `${baseUrl}/api/payments/status?order_id=${orderId}`,
            reference: reference,
            amount: order.amount.toFixed(2),
            id: integrationId,
            additionalinfo: `${productName} - Order ${orderId}`,
            authemail: order.customer_email || '',
            phone: phone,
            method: "ecocash",
            status: "Message"
        };
        
        // Generate hash (using your working function)
        const hash = await generateHash(fields, integrationKey);
        
        // Send to Paynow
        const paynowResponse = await fetch("https://www.paynow.co.zw/interface/remotetransaction", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                ...fields,
                hash
            })
        });
        
        const responseText = await paynowResponse.text();
        const parsed = parsePaynowResponse(responseText);
        
        console.log('📨 Paynow Response:', parsed);
        
        const pollUrl = parsed.pollurl || '';
        const browserUrl = parsed.browserurl || '';
        const paynowStatus = parsed.status || '';
        const paynowError = parsed.error || '';
        
        if (!pollUrl) {
            return new Response(JSON.stringify({
                status: "error",
                reference: reference,
                payment_status: "failed",
                paynow_status: paynowStatus,
                paynow_error: paynowError || "Paynow did not return poll_url",
                raw_response: responseText
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Update order
        await env.DB.prepare(`
            UPDATE orders 
            SET payment_reference = ?,
                poll_url = ?,
                browser_url = ?,
                paynow_status = ?,
                paynow_error = ?,
                updated_at = ?
            WHERE order_id = ?
        `).bind(
            reference,
            pollUrl,
            browserUrl,
            paynowStatus,
            paynowError,
            new Date().toISOString(),
            orderId
        ).run();
        
        // Update order_items with payment reference
        await env.DB.prepare(`
            UPDATE order_items 
            SET payment_reference = ?
            WHERE order_id = ?
        `).bind(reference, orderId).run();
        
        return new Response(JSON.stringify({
            status: "success",
            reference: reference,
            transaction_reference: reference,
            payment_url: browserUrl || "",
            poll_url: pollUrl,
            poll_url_received: true,
            payment_status: "pending",
            paynow_status: paynowStatus,
            paynow_error: paynowError
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('❌ Create payment error:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to create payment: ' + error.message 
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// ==============================
// HELPERS (copied from your working code)
// ==============================

function formatZimPhone(phone) {
    if (!phone) return "";
    let cleaned = String(phone).replace(/\D/g, "");
    if (cleaned.startsWith("263")) {
        cleaned = "0" + cleaned.slice(3);
    }
    return cleaned;
}

function sanitizeId(value) {
    return String(value || "GENERAL")
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "");
}

function parsePaynowResponse(text) {
    const result = {};
    if (!text) return result;
    text.split("&").forEach(pair => {
        const [k, v] = pair.split("=");
        if (!k) return;
        result[decodeURIComponent(k).toLowerCase()] = decodeURIComponent(v || "");
    });
    return result;
}

async function generateHash(fields, key) {
    let str = "";
    Object.keys(fields).forEach(k => {
        if (k !== "hash") {
            str += fields[k];
        }
    });
    str += key;
    const buf = await crypto.subtle.digest(
        "SHA-512",
        new TextEncoder().encode(str)
    );
    return [...new Uint8Array(buf)]
        .map(b => b.toString(16).padStart(2, "0"))
        .join("")
        .toUpperCase();
}