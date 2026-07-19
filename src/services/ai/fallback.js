// src/services/ai/fallback.js
export function getFallback(prompt) {
    console.log('📋 Using fallback (no AI)');
    
    // Rule-based responses
    if (prompt.includes('tagline') || prompt.includes('brand story')) {
        return 'Elevate your style. Define your brand.';
    }
    if (prompt.includes('description') && prompt.includes('product')) {
        return 'Premium quality. Designed for those who stand out.';
    }
    if (prompt.includes('font') || prompt.includes('typography')) {
        return 'Inter';
    }
    if (prompt.includes('campaign') || prompt.includes('marketing')) {
        return 'New collection dropping soon. Stay tuned.';
    }
    if (prompt.includes('artwork') || prompt.includes('design')) {
        return 'High-resolution artwork recommended. 300 DPI for best results.';
    }
    
    return 'ZVAKHO - Your brand, your way.';
}