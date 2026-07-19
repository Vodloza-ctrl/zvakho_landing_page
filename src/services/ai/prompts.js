// src/services/ai/prompts.js
export const PROMPTS = {
    // Typography
    typography: (brandName, feeling, productType) => `
        Brand: ${brandName}
        Feeling: ${feeling}
        Product: ${productType}
        
        Recommend font family, weight, spacing, and layout.
        Return as JSON: { font, weight, spacing, layout, reasoning }
    `,
    
    // Brand Story
    brandStory: (name, feeling, audience) => `
        Brand: ${name}
        Style: ${feeling}
        Audience: ${audience}
        
        Write a brand tagline (60 chars), mission (150 chars), and story (200 words).
        Return as JSON: { tagline, mission, story, values }
    `,
    
    // Product Description
    productDescription: (name, type, style) => `
        Product: ${name}
        Type: ${type}
        Style: ${style}
        
        Write a product description (200 words), key features (5 bullets), and SEO title.
        Return as JSON: { description, features, seo_title }
    `,
    
    // Artwork Advice
    artworkAdvice: (type, dpi, dimensions) => `
        Artwork Type: ${type}
        DPI: ${dpi}
        Dimensions: ${dimensions}
        
        Check if artwork is print-ready. If not, suggest fixes.
        Return as JSON: { print_ready, issues, suggestions }
    `,
    
    // Campaign Copy
    campaignCopy: (name, platform, tone) => `
        Campaign: ${name}
        Platform: ${platform}
        Tone: ${tone}
        
        Write: slogan (50 chars), Instagram caption (220 chars), WhatsApp message (150 chars)
        Return as JSON: { slogan, instagram, whatsapp }
    `
};