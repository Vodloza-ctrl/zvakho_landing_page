// src/api/brands/index.js
import { createBrand } from './create.js';
import { getBrand } from './get.js';
import { listBrands } from './list.js';
import { updateBrand } from './update.js';

export async function handleBrands(request, env, user) {
    const url = new URL(request.url);
    const path = url.pathname.replace('/api/brands', '');
    
    // GET /api/brands - List brands
    if (request.method === 'GET' && (path === '' || path === '/')) {
        return listBrands(request, env, user);
    }
    
    // POST /api/brands - Create brand
    if (request.method === 'POST' && (path === '' || path === '/')) {
        return createBrand(request, env, user);
    }
    
    // GET /api/brands/:id - Get single brand
    if (request.method === 'GET' && path.startsWith('/')) {
        const id = path.slice(1);
        return getBrand(request, env, user, id);
    }
    
    // PUT /api/brands/:id - Update brand
    if (request.method === 'PUT' && path.startsWith('/')) {
        const id = path.slice(1);
        return updateBrand(request, env, user, id);
    }
    
    return new Response(JSON.stringify({ 
        error: 'Not found' 
    }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
    });
}