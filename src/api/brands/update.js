// src/api/brands/update.js
import { execute, queryOne } from '../../lib/db.js';
import { validateBrandName, validateEmail, validatePhone, slugify } from '../../lib/validators.js';

export async function updateBrand(request, env, user, brandId) {
    try {
        // Check permission
        if (user.brand_id !== brandId) {
            return new Response(JSON.stringify({ 
                error: 'Unauthorized' 
            }), { 
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        const body = await request.json();
        const updates = [];
        const values = [];
        
        // ── Allowed fields to update ──
        const allowedFields = {
            // Existing fields
            'brand_name': validateBrandName,
            'brand_email': validateEmail,
            'brand_phone': validatePhone,
            'brand_feeling': (val) => {
                const valid = ['premium', 'modern', 'streetwear', 'minimal', 'vintage'];
                return valid.includes(val) ? { valid: true } : { valid: false, error: 'Invalid brand feeling' };
            },
            'primary_color': (val) => {
                const hexRegex = /^#[0-9A-Fa-f]{6}$/;
                return hexRegex.test(val) ? { valid: true } : { valid: false, error: 'Invalid hex color' };
            },
            'secondary_color': (val) => {
                const hexRegex = /^#[0-9A-Fa-f]{6}$/;
                return hexRegex.test(val) ? { valid: true } : { valid: false, error: 'Invalid hex color' };
            },
            'accent_color': (val) => {
                const hexRegex = /^#[0-9A-Fa-f]{6}$/;
                return hexRegex.test(val) ? { valid: true } : { valid: false, error: 'Invalid hex color' };
            },
            'font_primary': (val) => {
                const fonts = ['Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 
                              'Playfair Display', 'Bebas Neue', 'Cormorant Garamond', 'Raleway'];
                return fonts.includes(val) ? { valid: true } : { valid: false, error: 'Invalid font' };
            },
            'font_secondary': (val) => {
                const fonts = ['Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 
                              'Playfair Display', 'Bebas Neue', 'Cormorant Garamond', 'Raleway'];
                return fonts.includes(val) ? { valid: true } : { valid: false, error: 'Invalid font' };
            },
            'store_status': (val) => {
                const valid = ['draft', 'active', 'paused', 'closed'];
                return valid.includes(val) ? { valid: true } : { valid: false, error: 'Invalid store status' };
            },
            'store_hours': (val) => ({ valid: true }),
            'whatsapp_number': validatePhone,
            'logo_url': (val) => ({ valid: true }),
            'custom_domain': (val) => ({ valid: true }),
            
            // ── New media fields ──
            'gallery_layout': (val) => {
                const valid = ['mosaic', 'grid', 'carousel'];
                return valid.includes(val) ? { valid: true } : { valid: false, error: 'Invalid gallery layout' };
            },
            'gallery_visible': (val) => {
                // Accept boolean or number; convert later
                const bool = val === true || val === 1 || val === 'true';
                return { valid: true, value: bool ? 1 : 0 };
            },
            'video_url': (val) => {
                // Accept any string, optional
                return { valid: true };
            },
            'video_visible': (val) => {
                const bool = val === true || val === 1 || val === 'true';
                return { valid: true, value: bool ? 1 : 0 };
            },
            'video_title': (val) => ({ valid: true }),
            'media_position': (val) => {
                const valid = ['above_products', 'below_products', 'before_hero'];
                return valid.includes(val) ? { valid: true } : { valid: false, error: 'Invalid media position' };
            }
        };
        
        for (const [field, validator] of Object.entries(allowedFields)) {
            if (body[field] !== undefined) {
                const validation = validator(body[field]);
                if (!validation.valid) {
                    return new Response(JSON.stringify({ 
                        error: validation.error 
                    }), { 
                        status: 400,
                        headers: { 'Content-Type': 'application/json' }
                    });
                }
                // If validator returns a transformed value (e.g., boolean to int), use it
                const value = validation.value !== undefined ? validation.value : body[field];
                updates.push(`${field} = ?`);
                values.push(value);
            }
        }
        
        if (updates.length === 0) {
            return new Response(JSON.stringify({ 
                error: 'No fields to update' 
            }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // If brand name changed, update slug too
        if (body.brand_name) {
            const newSlug = slugify(body.brand_name);
            const existing = await queryOne(env, `
                SELECT brand_id FROM brands 
                WHERE brand_slug = ? AND brand_id != ? AND deleted_at IS NULL
            `, [newSlug, brandId]);
            
            if (existing) {
                return new Response(JSON.stringify({ 
                    error: 'Brand name already taken' 
                }), { 
                    status: 409,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
            updates.push('brand_slug = ?');
            values.push(newSlug);
        }
        
        values.push(new Date().toISOString(), brandId);
        
        await execute(env, `
            UPDATE brands 
            SET ${updates.join(', ')}, updated_at = ?
            WHERE brand_id = ?
        `, values);
        
        const brand = await queryOne(env, `
            SELECT * FROM brands WHERE brand_id = ?
        `, [brandId]);
        
        return new Response(JSON.stringify({
            success: true,
            brand: brand,
            message: 'Brand updated successfully!'
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Update brand error:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to update brand' 
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}