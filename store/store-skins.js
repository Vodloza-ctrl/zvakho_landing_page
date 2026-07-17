// ============================================
// SKIN SYSTEM - Complete Theme Engine
// ============================================

const SKIN_SYSTEM = {
  skins: {
    streetwear: {
      id: 'streetwear',
      label: 'Streetwear',
      icon: '👕',
      
      // Full theme configuration
      theme: {
        // Hero
        hero_height: '680px',
        hero_overlay: 'rgba(10, 10, 10, 0.7)',
        
        // Colors
        background: '#0a0a0a',
        surface: '#141414',
        surface_light: 'rgba(255,255,255,0.05)',
        text: '#ffffff',
        text_muted: 'rgba(255,255,255,0.7)',
        primary: '#f5a400',
        primary_dark: '#c88400',
        secondary: '#ffd700',
        accent: '#ff6b6b',
        accent_2: '#ff3366',
        line: 'rgba(255,255,255,0.1)',
        
        // Buttons
        button_primary_bg: '#f5a400',
        button_primary_text: '#080808',
        button_secondary_bg: 'rgba(255,255,255,0.08)',
        button_secondary_text: '#ffffff',
        button_radius: '999px',
        
        // Cards
        card_bg: 'rgba(255,255,255,0.05)',
        card_border: 'rgba(255,255,255,0.08)',
        card_radius: '16px',
        card_hover_scale: '1.03',
        card_shadow: '0 20px 60px rgba(245, 164, 0, 0.15)',
        
        // Typography
        font_heading: "'Oswald', 'Impact', sans-serif",
        font_body: "'Inter', 'Helvetica Neue', sans-serif",
        font_accent: "'Bebas Neue', 'Arial Black', sans-serif",
        heading_weight: '900',
        heading_transform: 'uppercase',
        
        // Grid
        grid_cols: '3',
        gap: '20px',
      },
      
      css: `
        /* Hero */
        .experience-hero { min-height: 680px; }
        .hero-overlay { background: linear-gradient(180deg, rgba(10,10,10,0.3), rgba(10,10,10,0.9)) !important; }
        .hero-copy h1 { font-family: 'Oswald', sans-serif; text-transform: uppercase; letter-spacing: -0.03em; }
        .hero-copy p { color: rgba(255,255,255,0.7); }
        
        /* Nav */
        .store-nav { background: rgba(10,10,10,0.95) !important; border-bottom: 2px solid #f5a400; }
        
        /* Cards */
        .product-card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; transition: all 0.3s ease; }
        .product-card:hover { transform: translateY(-8px) scale(1.02); box-shadow: 0 20px 60px rgba(245,164,0,0.15); border-color: #f5a400; }
        
        /* Buttons */
        .product-add { background: linear-gradient(135deg, #f5a400, #ff6b6b); border: none; text-transform: uppercase; letter-spacing: 0.08em; }
        .hero-primary { background: #f5a400; color: #080808; border: none; }
        
        /* Ticker */
        .store-ticker { background: #f5a400; color: #080808; }
        
        /* Grid */
        .product-grid { grid-template-columns: repeat(3, 1fr); gap: 20px; }
      `
    },
    
    sports: {
      id: 'sports',
      label: 'Sports',
      icon: '⚽',
      
      theme: {
        hero_height: '640px',
        hero_overlay: 'rgba(15, 26, 46, 0.85)',
        
        background: '#0f1a2e',
        surface: '#162338',
        surface_light: 'rgba(255,255,255,0.06)',
        text: '#ffffff',
        text_muted: 'rgba(255,255,255,0.7)',
        primary: '#e8432b',
        primary_dark: '#c0392b',
        secondary: '#f5c842',
        accent: '#ffffff',
        accent_2: '#f5c842',
        line: 'rgba(255,255,255,0.1)',
        
        button_primary_bg: '#e8432b',
        button_primary_text: '#ffffff',
        button_secondary_bg: 'rgba(255,255,255,0.1)',
        button_secondary_text: '#ffffff',
        button_radius: '12px',
        
        card_bg: 'rgba(22, 35, 56, 0.8)',
        card_border: 'rgba(255,255,255,0.08)',
        card_radius: '12px',
        card_hover_scale: '1.04',
        card_shadow: '0 20px 60px rgba(232, 67, 43, 0.2)',
        
        font_heading: "'Bebas Neue', 'Arial Black', sans-serif",
        font_body: "'Inter', 'Helvetica', sans-serif",
        font_accent: "'Bebas Neue', sans-serif",
        heading_weight: '900',
        heading_transform: 'uppercase',
        
        grid_cols: '4',
        gap: '20px',
      },
      
      css: `
        /* Hero */
        .experience-hero { min-height: 640px; }
        .hero-overlay { background: linear-gradient(180deg, rgba(15,26,46,0.4), rgba(15,26,46,0.9)) !important; }
        .hero-copy h1 { font-family: 'Bebas Neue', sans-serif; text-transform: uppercase; letter-spacing: 0.05em; color: #fff; }
        .hero-copy p { color: rgba(255,255,255,0.7); }
        
        /* Nav */
        .store-nav { background: rgba(15,26,46,0.95) !important; border-bottom: 3px solid #e8432b; }
        .store-nav-links a { color: #fff; }
        .store-nav-links a:hover { color: #f5c842; }
        
        /* Cards */
        .product-card { background: rgba(22,35,56,0.8); border: 2px solid rgba(255,255,255,0.08); border-radius: 12px; transition: all 0.3s ease; }
        .product-card:hover { transform: scale(1.04); border-color: #e8432b; box-shadow: 0 20px 60px rgba(232,67,43,0.2); }
        .product-card h3 { color: #fff; font-family: 'Bebas Neue', sans-serif; }
        
        /* Buttons */
        .product-add { background: #e8432b; border: none; color: #fff; text-transform: uppercase; font-weight: 900; border-radius: 12px; }
        .hero-primary { background: #e8432b; color: #fff; border: none; border-radius: 12px; font-weight: 900; text-transform: uppercase; }
        .hero-secondary { border: 2px solid rgba(255,255,255,0.3); color: #fff; border-radius: 12px; }
        
        /* Ticker */
        .store-ticker { background: #e8432b; color: #fff; font-weight: 900; }
        
        /* Price */
        .product-price { color: #f5c842; }
        
        /* Badges */
        .badge.hot { background: #e8432b; color: #fff; }
        
        /* Grid */
        .product-grid { grid-template-columns: repeat(4, 1fr); gap: 20px; }
        
        /* Sections */
        .section-intro h2 { font-family: 'Bebas Neue', sans-serif; text-transform: uppercase; letter-spacing: 0.05em; color: #fff; }
        .section-intro p { color: rgba(255,255,255,0.7); }
      `
    },
    
    luxury: {
      id: 'luxury',
      label: 'Luxury',
      icon: '💎',
      
      theme: {
        hero_height: '720px',
        hero_overlay: 'rgba(13, 11, 10, 0.9)',
        
        background: '#0d0b0a',
        surface: '#1a1715',
        surface_light: 'rgba(201,168,76,0.05)',
        text: '#f5f0eb',
        text_muted: 'rgba(245,240,235,0.6)',
        primary: '#c9a84c',
        primary_dark: '#a8893a',
        secondary: '#d4b87a',
        accent: '#e8d5a3',
        accent_2: '#c9a84c',
        line: 'rgba(201,168,76,0.15)',
        
        button_primary_bg: '#c9a84c',
        button_primary_text: '#0d0b0a',
        button_secondary_bg: 'rgba(255,255,255,0.05)',
        button_secondary_text: '#f5f0eb',
        button_radius: '999px',
        
        card_bg: 'rgba(26, 23, 21, 0.8)',
        card_border: 'rgba(201,168,76,0.12)',
        card_radius: '24px',
        card_hover_scale: '1.02',
        card_shadow: '0 16px 80px rgba(201,168,76,0.08)',
        
        font_heading: "'Didot', 'Bodoni', serif",
        font_body: "'Inter', 'Helvetica', sans-serif",
        font_accent: "'Playfair Display', serif",
        heading_weight: '300',
        heading_transform: 'none',
        
        grid_cols: '2',
        gap: '32px',
      },
      
      css: `
        .experience-hero { min-height: 720px; }
        .hero-overlay { background: linear-gradient(180deg, rgba(13,11,10,0.3), rgba(13,11,10,0.95)) !important; }
        .hero-copy h1 { font-family: 'Didot', serif; font-weight: 300; letter-spacing: 0.02em; color: #f5f0eb; }
        .hero-copy p { color: rgba(245,240,235,0.6); }
        
        .store-nav { background: rgba(13,11,10,0.95) !important; border-bottom: 1px solid rgba(201,168,76,0.2); }
        
        .product-card { background: rgba(26,23,21,0.8); border: 1px solid rgba(201,168,76,0.12); border-radius: 24px; backdrop-filter: blur(20px); transition: all 0.4s ease; }
        .product-card:hover { border-color: rgba(201,168,76,0.4); box-shadow: 0 16px 80px rgba(201,168,76,0.08); transform: translateY(-4px) scale(1.02); }
        .product-card h3 { font-family: 'Didot', serif; font-weight: 300; color: #f5f0eb; }
        
        .product-add { background: #c9a84c; border: none; color: #0d0b0a; font-weight: 700; letter-spacing: 0.05em; border-radius: 999px; }
        .hero-primary { background: #c9a84c; color: #0d0b0a; border: none; border-radius: 999px; font-weight: 700; letter-spacing: 0.05em; }
        .hero-secondary { border: 1px solid rgba(201,168,76,0.3); color: #f5f0eb; border-radius: 999px; }
        
        .store-ticker { background: transparent; color: #f5f0eb; border-top: 1px solid rgba(201,168,76,0.1); border-bottom: 1px solid rgba(201,168,76,0.1); }
        .store-pill { border-color: rgba(201,168,76,0.3); color: #c9a84c; }
        .product-price { color: #c9a84c; }
        
        .product-grid { grid-template-columns: repeat(2, 1fr); gap: 32px; }
        
        .section-intro h2 { font-family: 'Didot', serif; font-weight: 300; letter-spacing: 0.02em; color: #f5f0eb; }
        .section-intro p { color: rgba(245,240,235,0.6); }
      `
    }
  }
};

// ── Skin Application Engine ──────────────────────
class SkinManager {
  constructor() {
    this.currentSkin = null;
    this.skinSystem = SKIN_SYSTEM;
  }
  
  applySkin(skinId) {
    const skin = this.skinSystem.skins[skinId];
    if (!skin) {
      console.warn(`Skin "${skinId}" not found, using default`);
      return this.applySkin('streetwear');
    }
    
    this.currentSkin = skin;
    
    // 1. Apply CSS variables
    this.applyCSSVariables(skin);
    
    // 2. Load fonts
    this.loadFonts(skin);
    
    // 3. Apply CSS string
    this.applySkinCSS(skin);
    
    // 4. Update DOM
    this.updateDOM(skin);
    
    // 5. Apply animations
    this.triggerAnimations(skin);
    
    console.log(`🎨 Applied skin: ${skin.label}`);
    return skin;
  }
  
  applyCSSVariables(skin) {
    const root = document.documentElement;
    const t = skin.theme;
    
    // Colors
    root.style.setProperty('--store-bg', t.background);
    root.style.setProperty('--store-surface', t.surface);
    root.style.setProperty('--store-text', t.text);
    root.style.setProperty('--store-muted', t.text_muted);
    root.style.setProperty('--store-primary', t.primary);
    root.style.setProperty('--store-secondary', t.secondary);
    root.style.setProperty('--store-accent', t.accent);
    root.style.setProperty('--store-line', t.line);
    
    // Fonts
    root.style.setProperty('--skin-font-heading', t.font_heading);
    root.style.setProperty('--skin-font-body', t.font_body);
    root.style.setProperty('--skin-font-accent', t.font_accent);
    
    // Grid
    const colMap = { '2': '2', '3': '3', '4': '4' };
    root.style.setProperty('--skin-grid-cols', colMap[t.grid_cols] || '3');
    root.style.setProperty('--skin-gap', t.gap || '20px');
    
    document.body.dataset.skin = skin.id;
  }
  
  applySkinCSS(skin) {
    // Remove old skin styles
    const oldStyle = document.getElementById('skin-styles');
    if (oldStyle) oldStyle.remove();
    
    // Add new skin styles
    const style = document.createElement('style');
    style.id = 'skin-styles';
    style.textContent = skin.css;
    document.head.appendChild(style);
  }
  
  loadFonts(skin) {
    const fontMap = {
      'Oswald': 'https://fonts.googleapis.com/css2?family=Oswald:wght@400;700&display=swap',
      'Bebas Neue': 'https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap',
      'Didot': 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;0,400;0,700;1,400&display=swap',
      'Playfair Display': 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;0,400;0,700;1,400&display=swap'
    };
    
    const fonts = Object.values(skin.theme).filter(v => 
      typeof v === 'string' && v.includes('font')
    );
    
    for (const font of fonts) {
      const baseFont = font.split(',')[0].trim().replace(/['"]/g, '');
      const fontUrl = fontMap[baseFont];
      if (fontUrl && !document.querySelector(`link[href*="${baseFont.toLowerCase()}"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = fontUrl;
        document.head.appendChild(link);
      }
    }
  }
  
  updateDOM(skin) {
    document.body.dataset.skin = skin.id;
    
    // Update hero heading font
    const heading = document.querySelector('.hero-copy h1');
    if (heading) {
      heading.style.fontFamily = skin.theme.font_heading;
      heading.style.textTransform = skin.theme.heading_transform || 'none';
      heading.style.fontWeight = skin.theme.heading_weight || '700';
    }
  }
  
  triggerAnimations(skin) {
    const cards = document.querySelectorAll('.product-card');
    cards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.animation = `fadeInUp 0.5s ease ${index * 0.08}s forwards`;
    });
  }
  
  detectIndustry(artist) {
    const industryPref = artist.industry_preference || '';
    const visualStyle = artist.visual_style || '';
    
    if (industryPref && this.skinSystem.skins[industryPref]) {
      return industryPref;
    }
    
    if (visualStyle.includes('sports')) return 'sports';
    if (visualStyle.includes('luxury')) return 'luxury';
    if (visualStyle.includes('streetwear')) return 'streetwear';
    
    return 'streetwear';
  }
}

window.SkinManager = SkinManager;
window.SKIN_SYSTEM = SKIN_SYSTEM;

// Add animation keyframes
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(styleSheet);

console.log('🎨 ZVAKHO Skin System v2 loaded');
