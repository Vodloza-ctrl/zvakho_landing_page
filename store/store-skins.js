// ============================================
// ZVAKHO ULTIMATE SKIN SYSTEM - Premium Edition
// ============================================

const SKIN_SYSTEM = {
  skins: {
    streetwear: {
      id: 'streetwear',
      label: 'Streetwear',
      icon: '👕',
      
      theme: {
        // Hero
        hero_height: '680px',
        hero_overlay: 'rgba(10, 10, 10, 0.85)',
        
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
        glow: 'rgba(245, 164, 0, 0.3)',
        
        // Buttons
        button_radius: '999px',
        
        // Cards
        card_radius: '16px',
        
        // Typography
        font_heading: "'Oswald', 'Impact', sans-serif",
        font_body: "'Inter', 'Helvetica Neue', sans-serif",
        font_accent: "'Bebas Neue', 'Arial Black', sans-serif",
        heading_transform: 'uppercase',
        heading_weight: '900',
        
        // Grid
        grid_cols: '3',
        grid_gap: '20px',
        
        // Effects
        card_hover: 'scale',
        has_glow: true,
        has_pattern: true,
      },
      
      css: `
        /* ── Hero ── */
        body[data-skin="streetwear"] .experience-hero { min-height: 680px; }
        body[data-skin="streetwear"] .hero-overlay { 
          background: linear-gradient(180deg, rgba(10,10,10,0.3), rgba(10,10,10,0.9)) !important; 
        }
        body[data-skin="streetwear"] .hero-copy h1 {
          font-family: 'Oswald', sans-serif;
          text-transform: uppercase;
          letter-spacing: -0.03em;
          background: linear-gradient(135deg, #ffffff, #f5a400);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: 0 4px 60px rgba(245,164,0,0.3);
        }
        body[data-skin="streetwear"] .hero-copy p { color: rgba(255,255,255,0.7); }
        
        /* ── Navigation ── */
        body[data-skin="streetwear"] .store-nav { 
          background: rgba(10,10,10,0.95) !important; 
          border-bottom: 2px solid #f5a400; 
        }
        
        /* ── Cards ── */
        body[data-skin="streetwear"] .product-card {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        body[data-skin="streetwear"] .product-card:hover {
          transform: translateY(-8px) scale(1.02);
          border-color: #f5a400;
          box-shadow: 0 20px 60px rgba(245,164,0,0.15);
        }
        body[data-skin="streetwear"] .product-card h3 {
          font-family: 'Oswald', sans-serif;
          text-transform: uppercase;
          letter-spacing: -0.02em;
        }
        
        /* ── Buttons ── */
        body[data-skin="streetwear"] .product-add {
          background: linear-gradient(135deg, #f5a400, #ff6b6b);
          border: none;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 900;
          border-radius: 999px;
        }
        body[data-skin="streetwear"] .hero-primary {
          background: linear-gradient(135deg, #f5a400, #ff6b6b);
          color: #080808;
          border: none;
          border-radius: 999px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        body[data-skin="streetwear"] .hero-secondary {
          border: 1px solid rgba(255,255,255,0.2);
          color: #fff;
          border-radius: 999px;
          backdrop-filter: blur(10px);
        }
        
        /* ── Ticker ── */
        body[data-skin="streetwear"] .store-ticker {
          background: linear-gradient(90deg, #f5a400, #ff6b6b, #f5a400);
          background-size: 200% 100%;
          animation: tickerGradient 4s ease infinite;
          color: #080808;
          font-weight: 900;
        }
        @keyframes tickerGradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        /* ── Price ── */
        body[data-skin="streetwear"] .product-price {
          color: #f5a400;
          font-weight: 900;
          font-size: 20px;
        }
        
        /* ── Grid ── */
        body[data-skin="streetwear"] .product-grid {
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        
        /* ── Badges ── */
        body[data-skin="streetwear"] .badge.hot {
          background: linear-gradient(135deg, #f5a400, #ff6b6b);
          color: #080808;
          border: none;
        }
        
        /* ── Section Titles ── */
        body[data-skin="streetwear"] .section-intro h2 {
          font-family: 'Oswald', sans-serif;
          text-transform: uppercase;
          letter-spacing: -0.02em;
        }
        
        /* ── Background Pattern ── */
        body[data-skin="streetwear"] {
          background-image: 
            repeating-linear-gradient(0deg, 
              rgba(245,164,0,0.02) 0px, 
              rgba(245,164,0,0.02) 1px, 
              transparent 1px, 
              transparent 3px
            );
        }
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
        glow: 'rgba(232, 67, 43, 0.3)',
        
        button_radius: '12px',
        card_radius: '12px',
        
        font_heading: "'Bebas Neue', 'Arial Black', sans-serif",
        font_body: "'Inter', 'Helvetica', sans-serif",
        font_accent: "'Bebas Neue', sans-serif",
        heading_transform: 'uppercase',
        heading_weight: '900',
        
        grid_cols: '4',
        grid_gap: '20px',
        
        card_hover: 'zoom',
        has_glow: true,
        has_pattern: true,
      },
      
      css: `
        /* ── Hero ── */
        body[data-skin="sports"] .experience-hero { min-height: 640px; }
        body[data-skin="sports"] .hero-overlay { 
          background: linear-gradient(180deg, rgba(15,26,46,0.3), rgba(15,26,46,0.9)) !important; 
        }
        body[data-skin="sports"] .hero-copy h1 {
          font-family: 'Bebas Neue', sans-serif;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          background: linear-gradient(135deg, #ffffff, #f5c842);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: 0 4px 60px rgba(232,67,43,0.3);
        }
        body[data-skin="sports"] .hero-copy p { color: rgba(255,255,255,0.7); }
        body[data-skin="sports"] .hero-primary {
          background: linear-gradient(135deg, #e8432b, #c0392b);
          color: #fff;
          border: none;
          border-radius: 12px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          box-shadow: 0 8px 30px rgba(232,67,43,0.3);
        }
        body[data-skin="sports"] .hero-secondary {
          border: 2px solid rgba(255,255,255,0.2);
          color: #fff;
          border-radius: 12px;
          backdrop-filter: blur(10px);
        }
        
        /* ── Navigation ── */
        body[data-skin="sports"] .store-nav { 
          background: rgba(15,26,46,0.95) !important; 
          border-bottom: 3px solid #e8432b; 
        }
        
        /* ── Cards ── */
        body[data-skin="sports"] .product-card {
          background: rgba(22,35,56,0.85);
          border: 2px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        }
        body[data-skin="sports"] .product-card:hover {
          transform: scale(1.04);
          border-color: #e8432b;
          box-shadow: 0 20px 60px rgba(232,67,43,0.25);
        }
        body[data-skin="sports"] .product-card h3 {
          font-family: 'Bebas Neue', sans-serif;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }
        
        /* ── Buttons ── */
        body[data-skin="sports"] .product-add {
          background: linear-gradient(135deg, #e8432b, #c0392b);
          border: none;
          color: #fff;
          text-transform: uppercase;
          font-weight: 900;
          border-radius: 12px;
          letter-spacing: 0.05em;
          box-shadow: 0 4px 20px rgba(232,67,43,0.3);
          transition: all 0.3s ease;
        }
        body[data-skin="sports"] .product-add:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(232,67,43,0.4);
        }
        
        /* ── Price ── */
        body[data-skin="sports"] .product-price {
          color: #f5c842;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 24px;
        }
        
        /* ── Ticker ── */
        body[data-skin="sports"] .store-ticker {
          background: linear-gradient(90deg, #e8432b, #c0392b, #e8432b);
          background-size: 200% 100%;
          animation: tickerGradient 3s ease infinite;
          color: #fff;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        
        /* ── Grid ── */
        body[data-skin="sports"] .product-grid {
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }
        
        /* ── Badges ── */
        body[data-skin="sports"] .badge.hot {
          background: #e8432b;
          color: #fff;
          border: none;
        }
        
        /* ── Section Titles ── */
        body[data-skin="sports"] .section-intro h2 {
          font-family: 'Bebas Neue', sans-serif;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #fff;
        }
        body[data-skin="sports"] .section-intro p {
          color: rgba(255,255,255,0.7);
        }
        
        /* ── Background Pattern ── */
        body[data-skin="sports"] {
          background-image: 
            radial-gradient(circle at 80% 20%, rgba(232,67,43,0.05) 0%, transparent 50%),
            radial-gradient(circle at 20% 80%, rgba(232,67,43,0.03) 0%, transparent 50%);
        }
        
        /* ── Store Pill ── */
        body[data-skin="sports"] .store-pill {
          background: rgba(232,67,43,0.15);
          border-color: #e8432b;
          color: #f5c842;
        }
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
        line: 'rgba(201,168,76,0.12)',
        glow: 'rgba(201, 168, 76, 0.2)',
        
        button_radius: '999px',
        card_radius: '24px',
        
        font_heading: "'Playfair Display', 'Georgia', serif",
        font_body: "'Inter', 'Helvetica', sans-serif",
        font_accent: "'Playfair Display', serif",
        heading_transform: 'none',
        heading_weight: '300',
        
        grid_cols: '2',
        grid_gap: '32px',
        
        card_hover: 'elegant',
        has_glow: true,
        has_pattern: true,
      },
      
      css: `
        /* ── Hero ── */
        body[data-skin="luxury"] .experience-hero { min-height: 720px; }
        body[data-skin="luxury"] .hero-overlay { 
          background: linear-gradient(180deg, rgba(13,11,10,0.2), rgba(13,11,10,0.95)) !important; 
        }
        body[data-skin="luxury"] .hero-copy h1 {
          font-family: 'Playfair Display', serif;
          font-weight: 300;
          letter-spacing: 0.02em;
          color: #f5f0eb;
          text-shadow: 0 4px 60px rgba(201,168,76,0.1);
        }
        body[data-skin="luxury"] .hero-copy p { color: rgba(245,240,235,0.6); }
        
        /* ── Navigation ── */
        body[data-skin="luxury"] .store-nav { 
          background: rgba(13,11,10,0.95) !important; 
          border-bottom: 1px solid rgba(201,168,76,0.15); 
        }
        
        /* ── Cards ── */
        body[data-skin="luxury"] .product-card {
          background: rgba(26,23,21,0.9);
          border: 1px solid rgba(201,168,76,0.08);
          border-radius: 24px;
          backdrop-filter: blur(20px);
          transition: all 0.6s ease;
          box-shadow: 0 8px 40px rgba(0,0,0,0.4);
        }
        body[data-skin="luxury"] .product-card:hover {
          transform: translateY(-8px);
          border-color: rgba(201,168,76,0.3);
          box-shadow: 0 16px 80px rgba(201,168,76,0.08);
        }
        body[data-skin="luxury"] .product-card h3 {
          font-family: 'Playfair Display', serif;
          font-weight: 300;
          letter-spacing: 0.02em;
        }
        
        /* ── Buttons ── */
        body[data-skin="luxury"] .product-add {
          background: #c9a84c;
          border: none;
          color: #0d0b0a;
          font-weight: 700;
          letter-spacing: 0.05em;
          border-radius: 999px;
          padding: 12px 24px;
          transition: all 0.4s ease;
        }
        body[data-skin="luxury"] .product-add:hover {
          background: #d4b87a;
          transform: translateY(-2px);
          box-shadow: 0 8px 40px rgba(201,168,76,0.3);
        }
        body[data-skin="luxury"] .hero-primary {
          background: #c9a84c;
          color: #0d0b0a;
          border: none;
          border-radius: 999px;
          font-weight: 700;
          letter-spacing: 0.05em;
          padding: 14px 32px;
          transition: all 0.4s ease;
        }
        body[data-skin="luxury"] .hero-primary:hover {
          background: #d4b87a;
          transform: translateY(-2px);
          box-shadow: 0 8px 40px rgba(201,168,76,0.3);
        }
        body[data-skin="luxury"] .hero-secondary {
          border: 1px solid rgba(201,168,76,0.3);
          color: #f5f0eb;
          border-radius: 999px;
          backdrop-filter: blur(10px);
        }
        
        /* ── Price ── */
        body[data-skin="luxury"] .product-price {
          color: #c9a84c;
          font-size: 28px;
          font-weight: 300;
        }
        
        /* ── Ticker ── */
        body[data-skin="luxury"] .store-ticker {
          background: transparent;
          color: #f5f0eb;
          border-top: 1px solid rgba(201,168,76,0.1);
          border-bottom: 1px solid rgba(201,168,76,0.1);
        }
        
        /* ── Grid ── */
        body[data-skin="luxury"] .product-grid {
          grid-template-columns: repeat(2, 1fr);
          gap: 32px;
        }
        
        /* ── Section Titles ── */
        body[data-skin="luxury"] .section-intro h2 {
          font-family: 'Playfair Display', serif;
          font-weight: 300;
          letter-spacing: 0.02em;
          color: #f5f0eb;
        }
        body[data-skin="luxury"] .section-intro p {
          color: rgba(245,240,235,0.6);
        }
        
        /* ── Store Pill ── */
        body[data-skin="luxury"] .store-pill {
          border-color: rgba(201,168,76,0.3);
          color: #c9a84c;
          background: rgba(201,168,76,0.05);
        }
        
        /* ── Background Pattern ── */
        body[data-skin="luxury"] {
          background-image: 
            repeating-linear-gradient(45deg, 
              rgba(201,168,76,0.02) 0px, 
              rgba(201,168,76,0.02) 2px, 
              transparent 2px, 
              transparent 4px
            );
        }
      `
    },
    
    corporate: {
      id: 'corporate',
      label: 'Corporate',
      icon: '🏢',
      
      theme: {
        hero_height: '560px',
        hero_overlay: 'rgba(248, 246, 243, 0.85)',
        
        background: '#f8f6f3',
        surface: '#ffffff',
        surface_light: 'rgba(26,26,26,0.03)',
        text: '#1a1a1a',
        text_muted: 'rgba(26,26,26,0.6)',
        primary: '#1a3c34',
        primary_dark: '#0f2a24',
        secondary: '#2d6b5a',
        accent: '#c17a3e',
        accent_2: '#1a3c34',
        line: 'rgba(26,26,26,0.08)',
        glow: 'rgba(26, 60, 52, 0.1)',
        
        button_radius: '8px',
        card_radius: '8px',
        
        font_heading: "'Inter', 'Helvetica', sans-serif",
        font_body: "'Inter', 'Helvetica', sans-serif",
        font_accent: "'Montserrat', sans-serif",
        heading_transform: 'none',
        heading_weight: '700',
        
        grid_cols: '4',
        grid_gap: '16px',
        
        card_hover: 'fade',
        has_glow: false,
        has_pattern: false,
      },
      
      css: `
        body[data-skin="corporate"] .experience-hero { min-height: 560px; }
        body[data-skin="corporate"] .hero-overlay { 
          background: linear-gradient(180deg, rgba(248,246,243,0.2), rgba(248,246,243,0.9)) !important; 
        }
        body[data-skin="corporate"] .hero-copy h1 {
          font-family: 'Inter', sans-serif;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: #1a1a1a;
        }
        body[data-skin="corporate"] .hero-copy p { color: rgba(26,26,26,0.6); }
        
        body[data-skin="corporate"] .store-nav { 
          background: rgba(248,246,243,0.95) !important; 
          border-bottom: 2px solid #1a3c34; 
        }
        
        body[data-skin="corporate"] .product-card {
          background: #ffffff;
          border: 1px solid rgba(26,26,26,0.06);
          border-radius: 8px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
          transition: all 0.3s ease;
        }
        body[data-skin="corporate"] .product-card:hover {
          box-shadow: 0 8px 32px rgba(0,0,0,0.08);
          transform: translateY(-4px);
        }
        
        body[data-skin="corporate"] .product-add {
          background: #1a3c34;
          border: none;
          color: #fff;
          font-weight: 600;
          border-radius: 8px;
          padding: 10px 20px;
        }
        body[data-skin="corporate"] .hero-primary {
          background: #1a3c34;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-weight: 700;
        }
        body[data-skin="corporate"] .hero-secondary {
          border: 1px solid rgba(26,26,26,0.2);
          color: #1a1a1a;
          border-radius: 8px;
        }
        
        body[data-skin="corporate"] .product-grid {
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        
        body[data-skin="corporate"] .product-price {
          color: #1a3c34;
          font-weight: 700;
        }
        
        body[data-skin="corporate"] .store-ticker {
          background: #1a3c34;
          color: #fff;
        }
        
        body[data-skin="corporate"] .section-intro h2 {
          font-family: 'Inter', sans-serif;
          font-weight: 700;
          color: #1a1a1a;
        }
      `
    },
    
    earthy_natural: {
      id: 'earthy_natural',
      label: 'Earthy & Natural',
      icon: '🌿',
      
      theme: {
        hero_height: '600px',
        hero_overlay: 'rgba(245, 240, 235, 0.85)',
        
        background: '#f5f0eb',
        surface: '#ffffff',
        surface_light: 'rgba(107,143,113,0.05)',
        text: '#2d2a24',
        text_muted: 'rgba(45,42,36,0.6)',
        primary: '#6b8f71',
        primary_dark: '#4d6b52',
        secondary: '#8faa8b',
        accent: '#b8966a',
        accent_2: '#6b8f71',
        line: 'rgba(107,143,113,0.15)',
        glow: 'rgba(107, 143, 113, 0.1)',
        
        button_radius: '999px',
        card_radius: '20px',
        
        font_heading: "'Cormorant Garamond', 'Georgia', serif",
        font_body: "'Inter', 'Helvetica', sans-serif",
        font_accent: "'Alegreya', serif",
        heading_transform: 'none',
        heading_weight: '400',
        
        grid_cols: '3',
        grid_gap: '20px',
        
        card_hover: 'fade',
        has_glow: true,
        has_pattern: false,
      },
      
      css: `
        body[data-skin="earthy_natural"] .experience-hero { min-height: 600px; }
        body[data-skin="earthy_natural"] .hero-overlay { 
          background: linear-gradient(180deg, rgba(245,240,235,0.2), rgba(245,240,235,0.9)) !important; 
        }
        body[data-skin="earthy_natural"] .hero-copy h1 {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 400;
          color: #2d2a24;
        }
        
        body[data-skin="earthy_natural"] .store-nav { 
          background: rgba(245,240,235,0.95) !important; 
          border-bottom: 2px solid #6b8f71; 
        }
        
        body[data-skin="earthy_natural"] .product-card {
          background: rgba(255,255,255,0.7);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(107,143,113,0.15);
          border-radius: 20px;
          transition: all 0.3s ease;
        }
        body[data-skin="earthy_natural"] .product-card:hover {
          box-shadow: 0 8px 40px rgba(107,143,113,0.12);
          transform: translateY(-4px);
        }
        
        body[data-skin="earthy_natural"] .product-add {
          background: #6b8f71;
          border: none;
          color: #fff;
          border-radius: 999px;
          padding: 10px 20px;
        }
        body[data-skin="earthy_natural"] .hero-primary {
          background: #6b8f71;
          color: #fff;
          border: none;
          border-radius: 999px;
        }
        
        body[data-skin="earthy_natural"] .product-grid {
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        
        body[data-skin="earthy_natural"] .product-price {
          color: #6b8f71;
          font-weight: 600;
        }
        
        body[data-skin="earthy_natural"] .store-ticker {
          background: #6b8f71;
          color: #fff;
        }
      `
    },
    
    gospel: {
      id: 'gospel',
      label: 'Gospel',
      icon: '✝️',
      
      theme: {
        hero_height: '560px',
        hero_overlay: 'rgba(250, 248, 245, 0.85)',
        
        background: '#faf8f5',
        surface: '#ffffff',
        surface_light: 'rgba(193,154,107,0.05)',
        text: '#1a1a1a',
        text_muted: 'rgba(26,26,26,0.6)',
        primary: '#c19a6b',
        primary_dark: '#a07d55',
        secondary: '#e8d5c4',
        accent: '#b8860b',
        accent_2: '#c19a6b',
        line: 'rgba(193,154,107,0.15)',
        glow: 'rgba(193, 154, 107, 0.1)',
        
        button_radius: '8px',
        card_radius: '12px',
        
        font_heading: "'Georgia', 'Times New Roman', serif",
        font_body: "'Inter', 'Helvetica', sans-serif",
        font_accent: "'Georgia', serif",
        heading_transform: 'none',
        heading_weight: '400',
        
        grid_cols: '3',
        grid_gap: '16px',
        
        card_hover: 'fade',
        has_glow: true,
        has_pattern: false,
      },
      
      css: `
        body[data-skin="gospel"] .experience-hero { min-height: 560px; }
        body[data-skin="gospel"] .hero-overlay { 
          background: linear-gradient(180deg, rgba(250,248,245,0.2), rgba(250,248,245,0.9)) !important; 
        }
        body[data-skin="gospel"] .hero-copy h1 {
          font-family: 'Georgia', serif;
          font-weight: 400;
          color: #1a1a1a;
        }
        
        body[data-skin="gospel"] .store-nav { 
          background: rgba(250,248,245,0.95) !important; 
          border-bottom: 2px solid #c19a6b; 
        }
        
        body[data-skin="gospel"] .product-card {
          background: rgba(255,255,255,0.9);
          border: 1px solid rgba(193,154,107,0.12);
          border-radius: 12px;
          box-shadow: 0 4px 24px rgba(193,154,107,0.06);
          transition: all 0.3s ease;
        }
        body[data-skin="gospel"] .product-card:hover {
          box-shadow: 0 8px 32px rgba(193,154,107,0.1);
          transform: translateY(-4px);
        }
        
        body[data-skin="gospel"] .product-add {
          background: #c19a6b;
          border: none;
          color: #fff;
          border-radius: 8px;
          padding: 10px 20px;
        }
        body[data-skin="gospel"] .hero-primary {
          background: #c19a6b;
          color: #fff;
          border: none;
          border-radius: 8px;
        }
        
        body[data-skin="gospel"] .product-grid {
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        
        body[data-skin="gospel"] .product-price {
          color: #c19a6b;
          font-weight: 600;
        }
        
        body[data-skin="gospel"] .store-ticker {
          background: #c19a6b;
          color: #fff;
        }
        
        body[data-skin="gospel"] .store-pill {
          border-color: rgba(193,154,107,0.3);
          color: #c19a6b;
        }
      `
    }
  },
  
  // ── Font Loading ──────────────────────────────────
  fonts: {
    'Oswald': 'https://fonts.googleapis.com/css2?family=Oswald:wght@400;700;900&display=swap',
    'Bebas Neue': 'https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap',
    'Playfair Display': 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;0,400;0,700;1,400&display=swap',
    'Cormorant Garamond': 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,700;1,400&display=swap',
    'Inter': 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;900&display=swap',
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
    
    // 3. Apply skin CSS
    this.applySkinCSS(skin);
    
    // 4. Update DOM
    this.updateDOM(skin);
    
    // 5. Trigger animations
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
    root.style.setProperty('--skin-glow', t.glow || 'transparent');
    
    // Fonts
    root.style.setProperty('--skin-font-heading', t.font_heading);
    root.style.setProperty('--skin-font-body', t.font_body);
    root.style.setProperty('--skin-font-accent', t.font_accent);
    
    // Grid
    const colMap = { '2': '2', '3': '3', '4': '4' };
    root.style.setProperty('--skin-grid-cols', colMap[t.grid_cols] || '3');
    root.style.setProperty('--skin-gap', t.grid_gap || '20px');
    
    // Set body data-skin
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
    const fontMap = this.skinSystem.fonts;
    const fontFamilies = [
      skin.theme.font_heading,
      skin.theme.font_body,
      skin.theme.font_accent
    ];
    
    for (const fontFamily of fontFamilies) {
      const baseFont = fontFamily.split(',')[0].trim().replace(/['"]/g, '');
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
    
    // Update hero heading
    const heading = document.querySelector('.hero-copy h1');
    if (heading) {
      heading.style.fontFamily = skin.theme.font_heading;
      heading.style.textTransform = skin.theme.heading_transform || 'none';
      heading.style.fontWeight = skin.theme.heading_weight || '700';
    }
    
    // Update hero subtitle
    const sub = document.querySelector('.hero-copy p');
    if (sub) {
      sub.style.fontFamily = skin.theme.font_body;
    }
  }
  
  triggerAnimations(skin) {
    const cards = document.querySelectorAll('.product-card');
    cards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.animation = `skinFadeIn 0.6s ease ${index * 0.08}s forwards`;
    });
  }
  
  // Detect industry from artist data
  detectIndustry(artist) {
    const industryPref = artist.industry_preference || '';
    const visualStyle = artist.visual_style || '';
    const genre = artist.genre || '';
    const storeMode = artist.store_mode || '';
    
    console.log('🔍 Detecting industry from:', { industryPref, visualStyle, genre, storeMode });
    
    // Check explicit industry preference
    if (industryPref && this.skinSystem.skins[industryPref]) {
      console.log('✅ Using explicit industry preference:', industryPref);
      return industryPref;
    }
    
    // Check visual style
    if (visualStyle.includes('sports')) {
      console.log('✅ Detected sports from visual_style');
      return 'sports';
    }
    if (visualStyle.includes('luxury') || visualStyle.includes('premium')) {
      console.log('✅ Detected luxury from visual_style');
      return 'luxury';
    }
    if (visualStyle.includes('corporate') || visualStyle.includes('business')) {
      console.log('✅ Detected corporate from visual_style');
      return 'corporate';
    }
    if (visualStyle.includes('earthy') || visualStyle.includes('natural') || visualStyle.includes('organic')) {
      console.log('✅ Detected earthy from visual_style');
      return 'earthy_natural';
    }
    if (visualStyle.includes('gospel') || visualStyle.includes('faith')) {
      console.log('✅ Detected gospel from visual_style');
      return 'gospel';
    }
    if (visualStyle.includes('streetwear') || visualStyle.includes('urban')) {
      console.log('✅ Detected streetwear from visual_style');
      return 'streetwear';
    }
    
    // Check genre
    const g = genre.toLowerCase();
    if (g.includes('gospel') || g.includes('faith')) {
      console.log('✅ Detected gospel from genre');
      return 'gospel';
    }
    if (g.includes('sports')) {
      console.log('✅ Detected sports from genre');
      return 'sports';
    }
    if (g.includes('hip hop') || g.includes('rap') || g.includes('urban')) {
      console.log('✅ Detected streetwear from genre');
      return 'streetwear';
    }
    
    // Check store mode
    if (storeMode === 'fashion' || storeMode === 'clothing') {
      console.log('✅ Detected streetwear from store_mode');
      return 'streetwear';
    }
    
    console.log('⚠️ No industry detected, using default: streetwear');
    return 'streetwear';
  }
}

// ── Add animation keyframes ──────────────────────
(function addAnimations() {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes skinFadeIn {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes tickerGradient {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }
    
    /* Card hover effects per skin */
    body[data-skin="sports"] .product-card {
      transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    
    body[data-skin="streetwear"] .product-card {
      transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    
    body[data-skin="luxury"] .product-card {
      transition: all 0.6s ease;
    }
    
    body[data-skin="corporate"] .product-card {
      transition: all 0.3s ease;
    }
    
    body[data-skin="earthy_natural"] .product-card {
      transition: all 0.3s ease;
    }
    
    body[data-skin="gospel"] .product-card {
      transition: all 0.3s ease;
    }
  `;
  document.head.appendChild(styleSheet);
})();

// ── Export for use ─────────────────────────────────
window.SkinManager = SkinManager;
window.SKIN_SYSTEM = SKIN_SYSTEM;

console.log('🎨 ZVAKHO Ultimate Skin System v2 loaded');
