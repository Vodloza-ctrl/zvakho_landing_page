// src/api/brands/list.js
import { query } from '../../lib/db.js';

export async function listBrands(request, env, user) {
    try {
        // Only allow admins to list all brands
        if (user.role !== 'admin') {
            // Regular users only see their own brand
            if (user.brand_id) {
                const brand = await query(env, `
                    SELECT * FROM brands 
                    WHERE brand_id = ? AND deleted_at IS NULL
                `, [user.brand_id]);
                
                return new Response(JSON.stringify({
                    success: true,
                    brands: brand
                }), {
                    headers: { 'Content-Type': 'application/json' }
                });
            }
            
            return new Response(JSON.stringify({
                success: true,
                brands: []
            }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Admin sees all brands
        const brands = await query(env, `
            SELECT * FROM brands 
            WHERE deleted_at IS NULL
            ORDER BY created_at DESC
        `);
        
        return new Response(JSON.stringify({
            success: true,
            brands: brands
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('List brands error:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to list brands' 
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
