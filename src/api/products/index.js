// src/api/products/index.js
import { createProduct } from './create.js';
import { listProducts } from './list.js';
import { getProduct } from './get.js';
import { updateProduct } from './update.js';
import { deleteProduct } from './delete.js';
import { addVariant, updateVariant, deleteVariant } from './variants.js';

export async function handleProducts(request, env, user) {
    const url = new URL(request.url);
    const path = url.pathname.replace('/api/products', '');
    
    // GET /api/products - List products
    if (request.method === 'GET' && (path === '' || path === '/')) {
        return listProducts(request, env, user);
    }
    
    // POST /api/products - Create product
    if (request.method === 'POST' && (path === '' || path === '/')) {
        return createProduct(request, env, user);
    }
    
    // GET /api/products/:id - Get single product
    if (request.method === 'GET' && path.startsWith('/')) {
        const id = path.slice(1);
        return getProduct(request, env, user, id);
    }
    
    // PUT /api/products/:id - Update product
    if (request.method === 'PUT' && path.startsWith('/')) {
        const id = path.slice(1);
        return updateProduct(request, env, user, id);
    }
    
    // DELETE /api/products/:id - Delete product
    if (request.method === 'DELETE' && path.startsWith('/')) {
        const id = path.slice(1);
        return deleteProduct(request, env, user, id);
    }
    
    // POST /api/products/:id/variants - Add variant
    if (request.method === 'POST' && path.includes('/variants')) {
        const id = path.split('/')[1];
        return addVariant(request, env, user, id);
    }
    
    // PUT /api/products/:id/variants/:variantId - Update variant
    if (request.method === 'PUT' && path.includes('/variants/')) {
        const parts = path.split('/');
        const productId = parts[1];
        const variantId = parts[3];
        return updateVariant(request, env, user, productId, variantId);
    }
    
    // DELETE /api/products/:id/variants/:variantId - Delete variant
    if (request.method === 'DELETE' && path.includes('/variants/')) {
        const parts = path.split('/');
        const productId = parts[1];
        const variantId = parts[3];
        return deleteVariant(request, env, user, productId, variantId);
    }
    
    return new Response(JSON.stringify({ 
        error: 'Not found' 
    }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
    });
}