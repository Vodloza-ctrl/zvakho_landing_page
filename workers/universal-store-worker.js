export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    const json = (data, status = 200) =>
      new Response(JSON.stringify(data, null, 2), {
        status,
        headers: { "Content-Type": "application/json", ...cors }
      });

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors });
    }

    try {
      if (!env.STORE_DB) {
        return json({ status: "error", message: "Missing STORE_DB binding" }, 500);
      }

      if (url.pathname === "/") {
        return json({ status: "ok", service: "zvakho-universal-store-api", binding: "STORE_DB" });
      }

      if (url.pathname === "/artists" && request.method === "GET") {
        const rows = await env.STORE_DB.prepare(`
          SELECT *
          FROM artists
          WHERE is_active = 1
          ORDER BY artist_name ASC
        `).all();

        return json({
          status: "success",
          count: rows.results.length,
          artists: rows.results
        });
      }

      if (url.pathname === "/store-config" && request.method === "GET") {
        const artistParam = String(
          url.searchParams.get("artist") ||
          url.searchParams.get("slug") ||
          ""
        ).trim().toLowerCase();

        const artistIdParam = String(url.searchParams.get("artist_id") || "").trim().toUpperCase();

        if (!artistParam && !artistIdParam) {
          return json({ status: "error", message: "Missing artist or artist_id" }, 400);
        }

        const artist = artistIdParam
          ? await env.STORE_DB.prepare(`
              SELECT *
              FROM artists
              WHERE artist_id = ? AND is_active = 1
              LIMIT 1
            `).bind(artistIdParam).first()
          : await env.STORE_DB.prepare(`
              SELECT *
              FROM artists
              WHERE LOWER(slug) = ? AND is_active = 1
              LIMIT 1
            `).bind(artistParam).first();

        if (!artist) {
          return json({ status: "error", message: "Artist not found" }, 404);
        }

        const theme = await env.STORE_DB.prepare(`
          SELECT
            at.artist_id,
            at.preset_id,
            COALESCE(at.primary_color, tp.primary_color) AS primary_color,
            COALESCE(at.secondary_color, tp.secondary_color) AS secondary_color,
            COALESCE(at.background_color, tp.background_color) AS background_color,
            COALESCE(at.text_color, tp.text_color) AS text_color,
            COALESCE(at.accent_color, tp.accent_color) AS accent_color,
            COALESCE(at.hero_title, artists.artist_name) AS hero_title,
            at.ticker_text,
            at.custom_css,
            tp.preset_name,
            tp.button_style,
            tp.ticker_enabled
          FROM artist_themes at
          LEFT JOIN theme_presets tp ON tp.preset_id = at.preset_id
          LEFT JOIN artists ON artists.artist_id = at.artist_id
          WHERE at.artist_id = ?
          LIMIT 1
        `).bind(artist.artist_id).first();

        const productsRows = await env.STORE_DB.prepare(`
          SELECT
            product_id,
            artist_id,
            product_type,
            product_name,
            description,
            price,
            currency,
            main_image_url,
            active,
            limited_release,
            preorder_enabled,
            preorder_close_date,
            created_at,
            updated_at,
            stock,
            file_url,
            preview_url,
            metadata
          FROM products
          WHERE artist_id = ? AND active = 1
          ORDER BY
            CASE product_type
              WHEN 'merch' THEN 1
              WHEN 'vip' THEN 2
              WHEN 'music' THEN 3
              ELSE 4
            END,
            created_at DESC
        `).bind(artist.artist_id).all();

        const products = (productsRows.results || []).map((p) => ({
          product_id: p.product_id,
          artist_id: p.artist_id,
          product_type: p.product_type,
          product_name: p.product_name,
          description: p.description || "",
          price: Number(p.price || 0),
          currency: p.currency || "USD",
          price_label: `$${Number(p.price || 0).toFixed(2)}`,
          main_image_url: p.main_image_url || "",
          image_url: p.main_image_url || "",
          active: Boolean(p.active),
          limited_release: Boolean(p.limited_release),
          preorder_enabled: Boolean(p.preorder_enabled),
          preorder_close_date: p.preorder_close_date || null,
          stock: p.stock ?? null,
          file_url: p.file_url || "",
          preview_url: p.preview_url || "",
          metadata: p.metadata || null
        }));

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
            spotify_url: artist.spotify_url || "",
            apple_music_url: artist.apple_music_url || "",
            featured_product_id: artist.featured_product_id || "",
            store_mode: artist.store_mode || "hybrid",
            visual_style: artist.visual_style || "",
            preorder_end_date: artist.preorder_end_date || "",
            footer_quote: artist.footer_quote || "",
            is_active: Boolean(artist.is_active)
          },
          theme: theme || {
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
          },
          products,
          count: products.length
        });
      }

      if (url.pathname === "/artist-store" && request.method === "GET") {
        const artist_id = String(url.searchParams.get("artist_id") || "").toUpperCase();
        if (!artist_id) return json({ status: "error", message: "Missing artist_id" }, 400);

        const rows = await env.STORE_DB.prepare(`
          SELECT product_id, product_name, price, product_type, main_image_url, file_url, preview_url
          FROM products
          WHERE artist_id = ? AND active = 1
          ORDER BY created_at DESC
        `).bind(artist_id).all();

        const products = (rows.results || []).map((p) => ({
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

        return json({ status: "success", artist_id, count: products.length, products });
      }

      if (url.pathname === "/products" && request.method === "GET") {
        const rows = await env.STORE_DB.prepare(`
          SELECT *
          FROM products
          ORDER BY artist_id ASC, created_at DESC
        `).all();

        return json({ status: "success", count: rows.results.length, products: rows.results });
      }

      if (url.pathname === "/web-checkout" && request.method === "POST") {
        const body = await request.json();

        const artist_id = String(body.artist_id || "").toUpperCase();
        const artist_name = String(body.artist_name || artist_id);
        const customer_name = String(body.customer_name || "Guest");
        const phone = String(body.customer_phone || body.phone || "").trim();
        const email = String(body.customer_email || body.email || "").trim();
        const items = Array.isArray(body.items) ? body.items : [];

        if (!artist_id) return json({ status: "error", message: "Missing artist_id" }, 400);
        if (!phone) return json({ status: "error", message: "Missing phone" }, 400);
        if (!email) return json({ status: "error", message: "Missing email" }, 400);
        if (!items.length) return json({ status: "error", message: "Cart is empty" }, 400);

        const artist = await env.STORE_DB.prepare(`
          SELECT artist_id, artist_name
          FROM artists
          WHERE artist_id = ? AND is_active = 1
          LIMIT 1
        `).bind(artist_id).first();

        if (!artist) return json({ status: "error", message: "Invalid artist" }, 400);

        let total_amount = 0;
        const savedItems = [];

        for (const item of items) {
          const product_id = String(item.product_id || "").trim();
          const quantity = Math.max(1, Number(item.quantity || 1));
          if (!product_id) return json({ status: "error", message: "Missing product_id in cart item" }, 400);

          const product = await env.STORE_DB.prepare(`
            SELECT product_id, artist_id, product_name, product_type, price, active
            FROM products
            WHERE product_id = ? AND artist_id = ? AND active = 1
            LIMIT 1
          `).bind(product_id, artist_id).first();

          if (!product) return json({ status: "error", message: `Invalid product: ${product_id}` }, 400);

          const unit_price = Number(product.price || 0);
          const line_total = quantity * unit_price;
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

        if (total_amount <= 0) return json({ status: "error", message: "Invalid cart total" }, 400);

        const itemSummary = savedItems.map(i => `${i.product_name} x${i.quantity}`).join(", ");
        const product_name = itemSummary.length > 90 ? `ZVAKHO Cart - ${savedItems.length} item(s)` : `Cart: ${itemSummary}`;

        const paymentWorkerUrl = env.PAYMENT_WORKER_URL || "https://zvakho-payments-v2.yasibomedia.workers.dev/create-payment";

        const paymentPayload = {
          artist_id,
          artist_name: artist.artist_name || artist_name,
          customer_name,
          phone,
          customer_phone: phone,
          email,
          customer_email: email,
          product_name,
          order_product: product_name,
          order_type: "web_cart",
          platform: "web_store",
          delivery_method: "mixed",
          quantity: 1,
          unit_price: total_amount,
          total_amount,
          order_total: total_amount,
          currency: "USD",
          items: savedItems
        };

        const payRes = await fetch(paymentWorkerUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(paymentPayload)
        });

        const paymentText = await payRes.text();
        let payment = null;
        try { payment = JSON.parse(paymentText); } catch (e) { payment = null; }

        if (!payRes.ok || !payment || payment.status === "error") {
          return json({
            status: "error",
            message: "Payment worker failed",
            payment_status_code: payRes.status,
            raw_payment_response: paymentText,
            payment_payload_sent: paymentPayload,
            payment
          }, 400);
        }

        const payment_reference = payment.reference || payment.transaction_reference || payment.payment_reference || `WEB_${artist_id}_${Date.now()}`;

        return json({
          status: "success",
          source: "web_checkout",
          artist_id,
          payment_reference,
          total_amount,
          total_label: `$${total_amount.toFixed(2)}`,
          product_name,
          items: savedItems,
          payment
        });
      }

      return json({ status: "error", message: "Route not found" }, 404);
    } catch (err) {
      return json({ status: "error", message: err.message || "Server error" }, 500);
    }
  }
};
