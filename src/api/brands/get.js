// src/api/brands/get.js
import { queryOne } from '../../lib/db.js';

export async function getBrand(request, env, user, brandId) {
    try {
        // Check permission
        if (user.brand_id !== brandId && user.role !== 'admin') {
            return new Response(JSON.stringify({ 
                error: 'Unauthorized' 
            }), { 
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        const brand = await queryOne(env, `
            SELECT * FROM brands 
            WHERE brand_id = ? AND deleted_at IS NULL
        `, [brandId]);
        
        if (!brand) {
            return new Response(JSON.stringify({ 
                error: 'Brand not found' 
            }), { 
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        return new Response(JSON.stringify({
            success: true,
            brand: brand
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Get brand error:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to get brand' 
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
