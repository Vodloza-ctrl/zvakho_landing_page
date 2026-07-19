// src/api/brands/media.js
export async function handleMediaUpload(request, env, user) {
    try {
        const brandId = user.brand_id;
        if (!brandId) {
            return new Response(JSON.stringify({ error: 'Brand not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Check subscription for gallery access
        const sub = await env.DB.prepare(
            `SELECT plan FROM subscription_history WHERE brand_id = ? AND status = 'active' ORDER BY changed_at DESC LIMIT 1`
        ).bind(brandId).first();
        const plan = sub?.plan || 'launch';
        if (plan === 'launch' || plan === 'free') {
            return new Response(JSON.stringify({
                error: 'Upgrade to Grow to enable media gallery',
                upgrade_required: true
            }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const formData = await request.formData();
        const files = formData.getAll('images');
        const layout = formData.get('layout') || 'mosaic';
        const visible = formData.get('visible') !== 'false';
        const videoUrl = formData.get('video_url') || '';
        const videoTitle = formData.get('video_title') || '';
        const videoVisible = formData.get('video_visible') !== 'false';
        const position = formData.get('position') || 'above_products';

        // Process images
        const uploadedUrls = [];
        for (const file of files) {
            if (!file || !file.name) continue;
            const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
            if (!allowedTypes.includes(file.type)) {
                continue; // skip invalid types
            }
            const ext = file.name.split('.').pop();
            const key = `brands/${brandId}/gallery/${Date.now()}-${Math.random().toString(36).slice(2,6)}.${ext}`;
            await env.R2.put(key, file.stream(), {
                httpMetadata: {
                    contentType: file.type,
                    cacheControl: 'public, max-age=31536000'
                }
            });
            const url = `${env.R2_PUBLIC_URL}/${key}`;
            uploadedUrls.push(url);
        }

        // Get existing gallery
        const brand = await env.DB.prepare(
            `SELECT gallery_images FROM brands WHERE brand_id = ?`
        ).bind(brandId).first();
        let existing = [];
        if (brand?.gallery_images) {
            try { existing = JSON.parse(brand.gallery_images); } catch {}
        }
        const newGallery = [...existing, ...uploadedUrls];

        // Update brand record
        await env.DB.prepare(`
            UPDATE brands
            SET gallery_images = ?,
                gallery_layout = ?,
                gallery_visible = ?,
                video_url = ?,
                video_title = ?,
                video_visible = ?,
                media_position = ?,
                updated_at = ?
            WHERE brand_id = ?
        `).bind(
            JSON.stringify(newGallery),
            layout,
            visible ? 1 : 0,
            videoUrl,
            videoTitle,
            videoVisible ? 1 : 0,
            position,
            new Date().toISOString(),
            brandId
        ).run();

        return new Response(JSON.stringify({
            success: true,
            gallery_images: newGallery,
            gallery_layout: layout,
            gallery_visible: visible,
            video_url: videoUrl,
            video_title: videoTitle,
            video_visible: videoVisible,
            media_position: position
        }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Media upload error:', error);
        return new Response(JSON.stringify({
            error: 'Failed to upload media: ' + error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Delete image from gallery
export async function deleteGalleryImage(request, env, user) {
    try {
        const brandId = user.brand_id;
        if (!brandId) {
            return new Response(JSON.stringify({ error: 'Brand not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const { image_url } = await request.json();
        if (!image_url) {
            return new Response(JSON.stringify({ error: 'Image URL required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Get current gallery
        const brand = await env.DB.prepare(
            `SELECT gallery_images FROM brands WHERE brand_id = ?`
        ).bind(brandId).first();
        let gallery = [];
        if (brand?.gallery_images) {
            try { gallery = JSON.parse(brand.gallery_images); } catch {}
        }

        const newGallery = gallery.filter(url => url !== image_url);

        // Optionally delete from R2 (skip for now)
        // We can implement R2 deletion if needed.

        await env.DB.prepare(`
            UPDATE brands
            SET gallery_images = ?, updated_at = ?
            WHERE brand_id = ?
        `).bind(
            JSON.stringify(newGallery),
            new Date().toISOString(),
            brandId
        ).run();

        return new Response(JSON.stringify({
            success: true,
            gallery_images: newGallery
        }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Delete image error:', error);
        return new Response(JSON.stringify({
            error: 'Failed to delete image: ' + error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}