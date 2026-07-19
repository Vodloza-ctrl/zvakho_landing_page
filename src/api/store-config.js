// src/api/store-config.js
export async function handleStoreConfig(request, env, user) {
    const url = new URL(request.url);
    const brandSlug = url.searchParams.get('brand') || url.searchParams.get('slug') || '';
    const brandId = url.searchParams.get('brand_id') || '';

    if (!brandSlug && !brandId) {
        return new Response(JSON.stringify({
            status: 'error',
            message: 'Missing brand or slug parameter'
        }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        // 1. Fetch brand
        let brand;
        if (brandId) {
            brand = await env.DB.prepare(
                `SELECT * FROM brands WHERE brand_id = ? AND deleted_at IS NULL`
            ).bind(brandId).first();
        } else {
            brand = await env.DB.prepare(
                `SELECT * FROM brands WHERE brand_slug = ? AND deleted_at IS NULL`
            ).bind(brandSlug.toLowerCase()).first();
        }

        if (!brand) {
            return new Response(JSON.stringify({
                status: 'error',
                message: 'Brand not found'
            }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 2. Fetch subscription
        const subscription = await env.DB.prepare(`
            SELECT plan, status, fee_percentage, max_products
            FROM subscription_history
            WHERE brand_id = ? AND status = 'active'
            ORDER BY changed_at DESC
            LIMIT 1
        `).bind(brand.brand_id).first();

        const defaultSubscription = {
            plan: 'launch',
            status: 'active',
            fee_percentage: 12,
            max_products: 5
        };
        const sub = subscription || defaultSubscription;

        // 3. Fetch products (only published for storefront)
        const productsRows = await env.DB.prepare(`
            SELECT 
                product_id, product_type, product_name, description,
                price, currency, main_image_url, image_url,
                stock, active, limited_release, preorder_enabled,
                preorder_close_date, sku, status, created_at
            FROM products
            WHERE brand_id = ? AND status = 'published'
            ORDER BY created_at DESC
        `).bind(brand.brand_id).all();

        const rawProducts = productsRows.results || [];

        // 4. Fetch variants
        const productIds = rawProducts.map(p => p.product_id);
        let allVariants = [];
        if (productIds.length) {
            const placeholders = productIds.map(() => '?').join(',');
            const variantsRows = await env.DB.prepare(`
                SELECT 
                    variant_id, product_id, color_name, color_hex,
                    size, price_adjustment, stock_quantity, mockup_url
                FROM product_variants
                WHERE product_id IN (${placeholders})
                ORDER BY product_id, size
            `).bind(...productIds).all();
            allVariants = variantsRows.results || [];
        }

        const variantsByProduct = allVariants.reduce((acc, v) => {
            if (!acc[v.product_id]) acc[v.product_id] = [];
            acc[v.product_id].push({
                variant_id: v.variant_id,
                color: v.color_name || '',
                color_hex: v.color_hex || '',
                size: v.size || '',
                price_adjustment: Number(v.price_adjustment || 0),
                stock_qty: Number(v.stock_quantity || 0),
                mockup_url: v.mockup_url || ''
            });
            return acc;
        }, {});

        // 5. Build product objects
        const products = rawProducts.map(p => ({
            product_id: p.product_id,
            product_type: p.product_type,
            product_name: p.product_name,
            description: p.description || '',
            price: Number(p.price || 0),
            currency: p.currency || 'USD',
            price_label: `$${Number(p.price || 0).toFixed(2)}`,
            main_image_url: p.main_image_url || p.image_url || '',
            image_url: p.main_image_url || p.image_url || '',
            active: Boolean(p.active),
            limited_release: Boolean(p.limited_release),
            preorder_enabled: Boolean(p.preorder_enabled),
            preorder_close_date: p.preorder_close_date || null,
            stock: p.stock ?? null,
            variants: variantsByProduct[p.product_id] || [],
            has_variants: Boolean((variantsByProduct[p.product_id] || []).length)
        }));

        // 6. Determine store type
        const musicCount = products.filter(p => p.product_type === 'music').length;
        const merchCount = products.filter(p => p.product_type !== 'music').length;
        let storeType = 'hybrid';
        if (musicCount > 0 && merchCount === 0) storeType = 'music';
        else if (merchCount > 0 && musicCount === 0) storeType = 'clothing';

        // 7. Featured product (first one or specific)
        const featuredProduct = products.find(p => p.product_id === brand.featured_product_id) || products[0] || null;

        // 8. Theme (use brand colors or defaults)
        const theme = {
            primary_color: brand.primary_color || '#f5a400',
            secondary_color: brand.secondary_color || '#ffffff',
            accent_color: brand.accent_color || '#ff6b6b',
            background_color: '#0b0b0b',
            text_color: '#ffffff',
            button_style: 'solid',
            ticker_text: brand.brand_name ? `${brand.brand_name} • OFFICIAL STORE •` : 'OFFICIAL STORE •'
        };

        // 9. Prepare artist/brand object (mapped to frontend expectations)
        const artist = {
            artist_id: brand.brand_id,
            slug: brand.brand_slug,
            artist_name: brand.brand_name,
            genre: '',
            tagline: brand.tagline || '',
            bio: brand.bio || '',
            logo_url: brand.logo_url || '',
            logo_white_url: brand.logo_url || '',
            logo_black_url: brand.logo_url || '',
            hero_image_url: brand.hero_image_url || '',
            profile_image_url: brand.logo_url || '',
            whatsapp_number: brand.whatsapp_number || '',
            instagram_url: brand.instagram_url || '',
            tiktok_url: brand.tiktok_url || '',
            youtube_url: brand.youtube_url || '',
            featured_product_id: brand.featured_product_id || '',
            store_mode: 'hybrid',
            visual_style: brand.visual_style || 'default',
            industry_preference: brand.industry_preference || '',
            footer_quote: brand.footer_quote || brand.tagline || '',
            is_active: true
        };

        // ── Media Configuration with Paywall ──
        const plan = sub?.plan || 'launch';
        const isPaidPlan = plan !== 'launch' && plan !== 'free';

        // Determine feature availability
        const galleryEnabled = isPaidPlan; // Grow+ gets gallery
        const videoEnabled = plan === 'business' || plan === 'pro'; // Business+ gets video

        let media = {
            gallery_enabled: galleryEnabled,
            video_enabled: videoEnabled,
            gallery_images: [],
            gallery_layout: brand.gallery_layout || 'mosaic',
            gallery_visible: brand.gallery_visible !== 0, // default true
            video_url: brand.video_url || '',
            video_visible: brand.video_visible !== 0,
            video_title: brand.video_title || '',
            media_position: brand.media_position || 'above_products',
            upgrade_message: null
        };

        // If gallery enabled but no images, still return an empty array
        if (galleryEnabled && brand.gallery_images) {
            try {
                media.gallery_images = JSON.parse(brand.gallery_images);
            } catch {
                media.gallery_images = [];
            }
        }

        // If video disabled, blank out the URL
        if (!videoEnabled) {
            media.video_url = '';
            media.video_visible = false;
        }

        // Add upgrade message if trying to use media on free plan
        if (!isPaidPlan && (brand.gallery_images || brand.video_url)) {
            media.upgrade_message = 'Upgrade to Grow (or higher) to enable media gallery and showcase your brand visually.';
        } else if (!videoEnabled && brand.video_url) {
            media.upgrade_message = 'Upgrade to Business to enable video showcases.';
        }

        // 10. Return
        return new Response(JSON.stringify({
            status: 'success',
            brand: artist,
            artist: artist,
            theme: theme,
            subscription: sub,
            store_type: storeType,
            products: products,
            featured_product: featuredProduct,
            count: products.length,
            variants: allVariants,
            media: media   // <-- Added media object
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'public, max-age=300, s-maxage=300'
            }
        });

    } catch (error) {
        console.error('❌ Store config error:', error);
        return new Response(JSON.stringify({
            status: 'error',
            message: 'Failed to load store: ' + error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}