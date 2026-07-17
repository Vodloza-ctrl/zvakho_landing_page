// ============================================
// SKIN SYSTEM - ZVAKHO Store Skin Manager
// ============================================

const SKIN_SYSTEM = {
  // ── Industry Skins ──────────────────────────────
  skins: {
    streetwear: {
      id: 'streetwear',
      label: 'Streetwear',
      icon: '👕',
      
      theme: {
        background: '#0a0a0a',
        surface: '#141414',
        text: '#ffffff',
        muted: 'rgba(255,255,255,0.72)',
        primary: '#f5a400',
        secondary: '#ffd700',
        accent: '#ff6b6b',
        line: 'rgba(255,255,255,0.16)'
      },
      
      fonts: {
        heading: "'Oswald', 'Impact', sans-serif",
        body: "'Inter', 'Helvetica Neue', sans-serif",
        accent: "'Bebas Neue', 'Arial Black', sans-serif"
      },
      
      layout: {
        hero_height: '680px',
        grid_cols: '3',
        card_radius: '16px',
        card_style: 'bold',
        show_hero: true,
        show_ticker: true,
        show_artist_orb: true
      },
      
      css: `
        --skin-hero-height: 680px;
        --skin-grid-cols: repeat(3, 1fr);
        --skin-card-radius: 16px;
        --skin-card-style: bold;
        --skin-glow: 0 0 60px rgba(245, 164, 0, 0.15);
      `,
      
      product_display: {
        show_badges: true,
        show_sizes: true,
        show_colors: true,
        card_animation: 'scale',
        image_style: 'cover'
      },
      
      features: {
        bulk_orders: true,
        custom_design: true,
        limited_drops: true
      }
    },
    
    corporate: {
      id: 'corporate',
      label: 'Corporate',
      icon: '🏢',
      
      theme: {
        background: '#f8f6f3',
        surface: '#ffffff',
        text: '#1a1a1a',
        muted: 'rgba(26,26,26,0.68)',
        primary: '#1a3c34',
        secondary: '#2d6b5a',
        accent: '#c17a3e',
        line: 'rgba(26,26,26,0.13)'
      },
      
      fonts: {
        heading: "'Playfair Display', 'Georgia', serif",
        body: "'Inter', 'Helvetica', sans-serif",
        accent: "'Montserrat', 'Helvetica Neue', sans-serif"
      },
      
      layout: {
        hero_height: '560px',
        grid_cols: '4',
        card_radius: '8px',
        card_style: 'clean',
        show_hero: true,
        show_ticker: false,
        show_artist_orb: true
      },
      
      css: `
        --skin-hero-height: 560px;
        --skin-grid-cols: repeat(4, 1fr);
        --skin-card-radius: 8px;
        --skin-card-style: clean;
        --skin-shadow: 0 2px 12px rgba(0,0,0,0.06);
      `,
      
      product_display: {
        show_badges: true,
        show_sizes: true,
        show_colors: false,
        card_animation: 'fade',
        image_style: 'contain'
      },
      
      features: {
        bulk_orders: true,
        custom_design: true,
        limited_drops: false
      }
    },
    
    earthy_natural: {
      id: 'earthy_natural',
      label: 'Earthy & Natural',
      icon: '🌿',
      
      theme: {
        background: '#f5f0eb',
        surface: '#ffffff',
        text: '#2d2a24',
        muted: 'rgba(45,42,36,0.68)',
        primary: '#6b8f71',
        secondary: '#8faa8b',
        accent: '#b8966a',
        line: 'rgba(45,42,36,0.13)'
      },
      
      fonts: {
        heading: "'Cormorant Garamond', 'Georgia', serif",
        body: "'Inter', 'Helvetica', sans-serif",
        accent: "'Alegreya', 'Georgia', serif"
      },
      
      layout: {
        hero_height: '600px',
        grid_cols: '3',
        card_radius: '20px',
        card_style: 'soft',
        show_hero: true,
        show_ticker: true,
        show_artist_orb: false
      },
      
      css: `
        --skin-hero-height: 600px;
        --skin-grid-cols: repeat(3, 1fr);
        --skin-card-radius: 20px;
        --skin-card-style: soft;
        --skin-shadow: 0 8px 40px rgba(107, 143, 113, 0.12);
        --skin-border: 1px solid rgba(107, 143, 113, 0.2);
      `,
      
      product_display: {
        show_badges: false,
        show_sizes: true,
        show_colors: true,
        card_animation: 'none',
        image_style: 'cover'
      },
      
      features: {
        bulk_orders: false,
        custom_design: false,
        limited_drops: false
      }
    },
    
    luxury: {
      id: 'luxury',
      label: 'Luxury',
      icon: '💎',
      
      theme: {
        background: '#0d0b0a',
        surface: '#1a1715',
        text: '#f5f0eb',
        muted: 'rgba(245,240,235,0.68)',
        primary: '#c9a84c',
        secondary: '#d4b87a',
        accent: '#e8d5a3',
        line: 'rgba(245,240,235,0.12)'
      },
      
      fonts: {
        heading: "'Didot', 'Bodoni', serif",
        body: "'Inter', 'Helvetica', sans-serif",
        accent: "'Playfair Display', serif"
      },
      
      layout: {
        hero_height: '720px',
        grid_cols: '2',
        card_radius: '24px',
        card_style: 'elegant',
        show_hero: true,
        show_ticker: false,
        show_artist_orb: true
      },
      
      css: `
        --skin-hero-height: 720px;
        --skin-grid-cols: repeat(2, 1fr);
        --skin-card-radius: 24px;
        --skin-card-style: elegant;
        --skin-shadow: 0 16px 80px rgba(201, 168, 76, 0.08);
        --skin-gold-glow: 0 0 120px rgba(201, 168, 76, 0.06);
      `,
      
      product_display: {
        show_badges: false,
        show_sizes: false,
        show_colors: false,
        card_animation: 'none',
        image_style: 'cover'
      },
      
      features: {
        bulk_orders: false,
        custom_design: false,
        limited_drops: true
      }
    },
    
    sports: {
      id: 'sports',
      label: 'Sports',
      icon: '⚽',
      
      theme: {
        background: '#0f1a2e',
        surface: '#162338',
        text: '#ffffff',
        muted: 'rgba(255,255,255,0.72)',
        primary: '#e8432b',
        secondary: '#ffffff',
        accent: '#f5c842',
        line: 'rgba(255,255,255,0.16)'
      },
      
      fonts: {
        heading: "'Bebas Neue', 'Arial Black', sans-serif",
        body: "'Inter', 'Helvetica', sans-serif",
        accent: "'Bebas Neue', sans-serif"
      },
      
      layout: {
        hero_height: '640px',
        grid_cols: '4',
        card_radius: '12px',
        card_style: 'dynamic',
        show_hero: true,
        show_ticker: true,
        show_artist_orb: true
      },
      
      css: `
        --skin-hero-height: 640px;
        --skin-grid-cols: repeat(4, 1fr);
        --skin-card-radius: 12px;
        --skin-card-style: dynamic;
        --skin-glow: 0 0 80px rgba(232, 67, 43, 0.12);
      `,
      
      product_display: {
        show_badges: true,
        show_sizes: true,
        show_colors: true,
        card_animation: 'scale',
        image_style: 'cover'
      },
      
      features: {
        bulk_orders: true,
        custom_design: true,
        limited_drops: false
      }
    },
    
    gospel: {
      id: 'gospel',
      label: 'Gospel',
      icon: '✝️',
      
      theme: {
        background: '#faf8f5',
        surface: '#ffffff',
        text: '#1a1a1a',
        muted: 'rgba(26,26,26,0.62)',
        primary: '#c19a6b',
        secondary: '#e8d5c4',
        accent: '#b8860b',
        line: 'rgba(26,26,26,0.1)'
      },
      
      fonts: {
        heading: "'Georgia', 'Times New Roman', serif",
        body: "'Inter', 'Helvetica', sans-serif",
        accent: "'Georgia', serif"
      },
      
      layout: {
        hero_height: '560px',
        grid_cols: '3',
        card_radius: '12px',
        card_style: 'warm',
        show_hero: true,
        show_ticker: false,
        show_artist_orb: true
      },
      
      css: `
        --skin-hero-height: 560px;
        --skin-grid-cols: repeat(3, 1fr);
        --skin-card-radius: 12px;
        --skin-card-style: warm;
        --skin-shadow: 0 4px 24px rgba(193, 154, 107, 0.08);
      `,
      
      product_display: {
        show_badges: false,
        show_sizes: true,
        show_colors: true,
        card_animation: 'fade',
        image_style: 'cover'
      },
      
      features: {
        bulk_orders: false,
        custom_design: false,
        limited_drops: false
      }
    }
  },
  
  // ── Font Loading ──────────────────────────────────
  fonts: {
    'Oswald': 'https://fonts.googleapis.com/css2?family=Oswald:wght@400;700&display=swap',
    'Bebas Neue': 'https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap',
    'Playfair Display': 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap',
    'Cormorant Garamond': 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,700;1,400&display=swap',
    'Didot': 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap',
    'Montserrat': 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap',
    'Alegreya': 'https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,400;0,700;1,400&display=swap'
  }
};

// ── Skin Application Engine ──────────────────────
class SkinManager {
  constructor() {
    this.currentSkin = null;
    this.skinSystem = SKIN_SYSTEM;
  }
  
  // Apply skin to page
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
    
    // 3. Apply layout modifications
    this.applyLayout(skin);
    
    // 4. Update DOM classes
    this.updateDOM(skin);
    
    // 5. Trigger any custom animations
    this.triggerAnimations(skin);
    
    return skin;
  }
  
  applyCSSVariables(skin) {
    const root = document.documentElement;
    const t = skin.theme;
    
    // Theme colors
    root.style.setProperty('--store-bg', t.background);
    root.style.setProperty('--store-surface', t.surface);
    root.style.setProperty('--store-text', t.text);
    root.style.setProperty('--store-muted', t.muted);
    root.style.setProperty('--store-primary', t.primary);
    root.style.setProperty('--store-secondary', t.secondary);
    root.style.setProperty('--store-accent', t.accent);
    root.style.setProperty('--store-line', t.line);
    
    // Layout variables
    if (skin.css) {
      const matches = skin.css.matchAll(/--skin-([\w-]+):\s*([^;]+);/g);
      for (const match of matches) {
        root.style.setProperty(`--${match[1]}`, match[2].trim());
      }
    }
    
    // Set body class for skin
    document.body.dataset.skin = skin.id;
  }
  
  loadFonts(skin) {
    // Load all fonts used by this skin
    const fontFamilies = Object.values(skin.fonts);
    
    for (const fontFamily of fontFamilies) {
      const baseFont = fontFamily.split(',')[0].trim().replace(/['"]/g, '');
      
      if (document.querySelector(`link[href*="${baseFont.toLowerCase()}"]`)) {
        continue;
      }
      
      const fontUrl = this.skinSystem.fonts[baseFont];
      if (fontUrl) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = fontUrl;
        document.head.appendChild(link);
      }
    }
    
    // Apply font families
    document.documentElement.style.setProperty('--skin-font-heading', skin.fonts.heading);
    document.documentElement.style.setProperty('--skin-font-body', skin.fonts.body);
    document.documentElement.style.setProperty('--skin-font-accent', skin.fonts.accent);
  }
  
  applyLayout(skin) {
    const layout = skin.layout;
    
    // Hero height
    const hero = document.querySelector('.experience-hero');
    if (hero) {
      hero.style.minHeight = layout.hero_height;
    }
    
    // Grid columns
    const grid = document.querySelector('.product-grid');
    if (grid) {
      const colMap = {
        '2': 'repeat(2, 1fr)',
        '3': 'repeat(3, 1fr)',
        '4': 'repeat(4, 1fr)'
      };
      grid.style.gridTemplateColumns = colMap[layout.grid_cols] || 'repeat(3, 1fr)';
    }
    
    // Card radius
    document.querySelectorAll('.product-card, .featured-card, .story-card').forEach(el => {
      el.style.borderRadius = layout.card_radius;
    });
    
    // Ticker visibility
    const ticker = document.getElementById('ticker');
    if (ticker) {
      ticker.style.display = layout.show_ticker ? 'flex' : 'none';
    }
    
    // Artist orb visibility
    const orb = document.getElementById('artistOrbCard');
    if (orb) {
      orb.style.display = layout.show_artist_orb ? 'flex' : 'none';
    }
  }
  
  updateDOM(skin) {
    // Update body class
    document.body.dataset.skin = skin.id;
    document.body.dataset.cardStyle = skin.layout.card_style;
    
    // Update store pill text
    const pill = document.getElementById('storeKicker');
    if (pill) {
      const industryLabels = {
        streetwear: 'Streetwear Brand',
        corporate: 'Corporate Apparel',
        earthy_natural: 'Natural Goods',
        luxury: 'Luxury House',
        sports: 'Sports Gear',
        gospel: 'Faith & Community'
      };
      pill.textContent = industryLabels[skin.id] || 'Brand Store';
    }
    
    // Update hero title styling
    const heroTitle = document.querySelector('.hero-copy h1');
    if (heroTitle) {
      heroTitle.style.fontFamily = skin.fonts.heading;
    }
  }
  
  triggerAnimations(skin) {
    const cards = document.querySelectorAll('.product-card');
    cards.forEach((card, index) => {
      const style = skin.product_display.card_animation;
      
      if (style === 'scale') {
        card.style.animation = `scaleIn 0.4s ease ${index * 0.05}s both`;
      } else if (style === 'fade') {
        card.style.animation = `fadeIn 0.5s ease ${index * 0.05}s both`;
      } else {
        card.style.opacity = '1';
      }
    });
  }
  
  // Detect industry from artist data
  detectIndustry(artist) {
    const visualStyle = artist.visual_style || '';
    const genre = artist.genre || '';
    const storeMode = artist.store_mode || '';
    const industryPref = artist.industry_preference || '';
    
    // Check explicit industry preference
    if (industryPref && this.skinSystem.skins[industryPref]) {
      return industryPref;
    }
    
    // Check visual style
    if (visualStyle.includes('streetwear')) return 'streetwear';
    if (visualStyle.includes('corporate')) return 'corporate';
    if (visualStyle.includes('earthy') || visualStyle.includes('natural')) return 'earthy_natural';
    if (visualStyle.includes('luxury')) return 'luxury';
    if (visualStyle.includes('sports')) return 'sports';
    if (visualStyle.includes('gospel')) return 'gospel';
    
    // Check genre
    const g = genre.toLowerCase();
    if (g.includes('gospel')) return 'gospel';
    if (g.includes('sports')) return 'sports';
    if (g.includes('hip hop') || g.includes('rap')) return 'streetwear';
    
    // Check store mode
    if (storeMode === 'fashion') return 'streetwear';
    
    // Default
    return 'streetwear';
  }
}

// ── Export for use ─────────────────────────────────
window.SkinManager = SkinManager;
window.SKIN_SYSTEM = SKIN_SYSTEM;

console.log('🎨 ZVAKHO Skin System loaded');
