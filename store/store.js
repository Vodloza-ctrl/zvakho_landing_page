// ============================================
// ZVAKHO ULTIMATE SKIN SYSTEM - Premium Edition v3
// ============================================

const SKIN_SYSTEM = {
  skins: {
    streetwear: {
      id: 'streetwear',
      label: 'Streetwear',
      icon: '👕',
      
      theme: {
        hero_height: '680px',
        hero_overlay: 'rgba(10, 10, 10, 0.85)',
        
        // ── Colors with WCAG contrast compliance ──
        background: '#0a0a0a',
        surface: '#141414',
        surface_light: 'rgba(255,255,255,0.08)',
        text: '#ffffff',
        text_muted: 'rgba(255,255,255,0.75)',
        text_inverse: '#0a0a0a',
        primary: '#f5a400',
        primary_dark: '#c88400',
        primary_text: '#0a0a0a', // Text on primary
        secondary: '#ffd700',
        accent: '#ff6b6b',
        accent_2: '#ff3366',
        line: 'rgba(255,255,255,0.12)',
        glow: 'rgba(245, 164, 0, 0.3)',
        card_bg: 'rgba(255,255,255,0.06)',
        
        button_radius: '999px',
        card_radius: '16px',
        card_shadow: '0 8px 40px rgba(0,0,0,0.3)',
        card_hover_shadow: '0 20px 60px rgba(245,164,0,0.15)',
        
        font_heading: "'Oswald','Impact',sans-serif",
        font_body: "'Inter','Helvetica Neue',sans-serif",
        font_accent: "'Bebas Neue','Arial Black',sans-serif",
        heading_transform: 'uppercase',
        heading_weight: '900',
        
        grid_cols: '3',
        grid_gap: '20px',
        
        card_hover: 'scale',
        has_glow: true,
        has_pattern: true,
      },
      
      css: `
        /* ── Hero ── */
        body[data-skin="streetwear"] .experience-hero { min-height: 680px; }
        body[data-skin="streetwear"] .hero-overlay { 
          background: linear-gradient(180deg, rgba(10,10,10,0.2), rgba(10,10,10,0.92)) !important; 
        }
        body[data-skin="streetwear"] .hero-copy h1 {
          font-family: 'Oswald', sans-serif;
          text-transform: uppercase;
          letter-spacing: -0.03em;
          background: linear-gradient(135deg, #ffffff, #f5a400);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: 0 4px 60px rgba(245,164,0,0.3);
          font-weight: 900;
        }
        body[data-skin="streetwear"] .hero-copy p { 
          color: rgba(255,255,255,0.8);
          font-weight: 400;
          text-shadow: 0 2px 20px rgba(0,0,0,0.5);
        }
        
        /* ── Navigation ── */
        body[data-skin="streetwear"] .store-nav { 
          background: rgba(10,10,10,0.95) !important; 
          border-bottom: 2px solid #f5a400; 
        }
        body[data-skin="streetwear"] .store-nav-links a {
          color: rgba(255,255,255,0.7);
          transition: color 0.3s;
        }
        body[data-skin="streetwear"] .store-nav-links a:hover {
          color: #f5a400;
        }
        
        /* ── Cards ── */
        body[data-skin="streetwear"] .product-card {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          backdrop-filter: blur(10px);
          box-shadow: 0 8px 40px rgba(0,0,0,0.3);
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
          color: #ffffff;
        }
        body[data-skin="streetwear"] .product-card p {
          color: rgba(255,255,255,0.7);
        }
        body[data-skin="streetwear"] .product-type {
          color: #f5a400;
          font-weight: 900;
        }
        
        /* ── Buttons ── */
        body[data-skin="streetwear"] .product-add {
          background: linear-gradient(135deg, #f5a400, #ff6b6b);
          border: none;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 900;
          border-radius: 999px;
          color: #0a0a0a;
          padding: 12px 24px;
          transition: all 0.3s ease;
        }
        body[data-skin="streetwear"] .product-add:hover {
          transform: scale(1.05);
          box-shadow: 0 8px 30px rgba(245,164,0,0.4);
        }
        body[data-skin="streetwear"] .hero-primary {
          background: linear-gradient(135deg, #f5a400, #ff6b6b);
          color: #0a0a0a;
          border: none;
          border-radius: 999px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 14px 32px;
          transition: all 0.3s ease;
        }
        body[data-skin="streetwear"] .hero-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 40px rgba(245,164,0,0.4);
        }
        body[data-skin="streetwear"] .hero-secondary {
          border: 1px solid rgba(255,255,255,0.25);
          color: #ffffff;
          border-radius: 999px;
          backdrop-filter: blur(10px);
          background: rgba(255,255,255,0.05);
          padding: 14px 32px;
          transition: all 0.3s ease;
        }
        body[data-skin="streetwear"] .hero-secondary:hover {
          background: rgba(255,255,255,0.15);
          border-color: #ffffff;
        }
        
        /* ── Ticker ── */
        body[data-skin="streetwear"] .store-ticker {
          background: linear-gradient(90deg, #f5a400, #ff6b6b, #f5a400);
          background-size: 200% 100%;
          animation: tickerGradient 4s ease infinite;
          color: #0a0a0a;
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
        body[data-skin="streetwear"] .badge {
          color: rgba(255,255,255,0.8);
          border-color: rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.05);
        }
        body[data-skin="streetwear"] .badge.hot {
          background: linear-gradient(135deg, #f5a400, #ff6b6b);
          color: #0a0a0a;
          border: none;
        }
        
        /* ── Section Titles ── */
        body[data-skin="streetwear"] .section-intro h2 {
          font-family: 'Oswald', sans-serif;
          text-transform: uppercase;
          letter-spacing: -0.02em;
          color: #ffffff;
        }
        body[data-skin="streetwear"] .section-intro p {
          color: rgba(255,255,255,0.7);
        }
        
        /* ── Music Section ── */
        body[data-skin="streetwear"] .music-row {
          background: rgba(255,255,255,0.06);
          border-color: rgba(255,255,255,0.08);
        }
        body[data-skin="streetwear"] .music-row h3 {
          color: #ffffff;
        }
        body[data-skin="streetwear"] .music-row p {
          color: rgba(255,255,255,0.6);
        }
        body[data-skin="streetwear"] .preview-btn {
          border-color: rgba(255,255,255,0.15);
          color: rgba(255,255,255,0.8);
          background: rgba(255,255,255,0.05);
        }
        body[data-skin="streetwear"] .preview-btn:hover {
          background: rgba(255,255,255,0.15);
          border-color: #f5a400;
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
        
        /* ── Variant Selector ── */
        body[data-skin="streetwear"] .variant-option {
          border-color: rgba(255,255,255,0.15);
          color: rgba(255,255,255,0.8);
          background: rgba(255,255,255,0.05);
        }
        body[data-skin="streetwear"] .variant-option.is-selected {
          background: #f5a400;
          border-color: #f5a400;
          color: #0a0a0a;
        }
        body[data-skin="streetwear"] .variant-label {
          color: rgba(255,255,255,0.6);
        }
        body[data-skin="streetwear"] .variant-note {
          color: rgba(255,255,255,0.5);
        }
        body[data-skin="streetwear"] .variant-note.needs-selection {
          color: #f5a400;
        }
        
        /* ── Story Card ── */
        body[data-skin="streetwear"] .story-card {
          background: rgba(255,255,255,0.06);
          border-color: rgba(255,255,255,0.08);
        }
        body[data-skin="streetwear"] .story-card h2 {
          color: #ffffff;
        }
        body[data-skin="streetwear"] .story-card p {
          color: rgba(255,255,255,0.7);
        }
        body[data-skin="streetwear"] .social-row a {
          border-color: rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.6);
          transition: all 0.3s ease;
        }
        body[data-skin="streetwear"] .social-row a:hover {
          border-color: #f5a400;
          color: #f5a400;
          background: rgba(245,164,0,0.1);
        }
        
        /* ── Footer ── */
        body[data-skin="streetwear"] .artist-footer {
          color: rgba(255,255,255,0.6);
        }
        body[data-skin="streetwear"] .artist-footer strong {
          color: #ffffff;
        }
        
        /* ── Store Pill ── */
        body[data-skin="streetwear"] .store-pill {
          border-color: rgba(245,164,0,0.3);
          color: #f5a400;
          background: rgba(245,164,0,0.1);
        }
      `
    },
    
    sports: {
      id: 'sports',
      label: 'Sports',
      icon: '⚽',
      
      theme: {
        hero_height: '640px',
        hero_overlay: 'rgba(15, 26, 46, 0.88)',
        
        background: '#0f1a2e',
        surface: '#162338',
        surface_light: 'rgba(255,255,255,0.06)',
        text: '#ffffff',
        text_muted: 'rgba(255,255,255,0.75)',
        text_inverse: '#ffffff',
        primary: '#e8432b',
        primary_dark: '#c0392b',
        primary_text: '#ffffff',
        secondary: '#f5c842',
        accent: '#ffffff',
        accent_2: '#f5c842',
        line: 'rgba(255,255,255,0.1)',
        glow: 'rgba(232, 67, 43, 0.3)',
        card_bg: 'rgba(22,35,56,0.85)',
        
        button_radius: '12px',
        card_radius: '12px',
        card_shadow: '0 10px 40px rgba(0,0,0,0.4)',
        card_hover_shadow: '0 20px 60px rgba(232,67,43,0.25)',
        
        font_heading: "'Bebas Neue','Arial Black',sans-serif",
        font_body: "'Inter','Helvetica',sans-serif",
        font_accent: "'Bebas Neue',sans-serif",
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
          background: linear-gradient(180deg, rgba(15,26,46,0.3), rgba(15,26,46,0.92)) !important; 
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
        body[data-skin="sports"] .hero-copy p { 
          color: rgba(255,255,255,0.8);
          font-weight: 400;
          text-shadow: 0 2px 20px rgba(0,0,0,0.5);
        }
        body[data-skin="sports"] .hero-primary {
          background: linear-gradient(135deg, #e8432b, #c0392b);
          color: #ffffff;
          border: none;
          border-radius: 12px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          box-shadow: 0 8px 30px rgba(232,67,43,0.3);
          padding: 14px 32px;
          transition: all 0.3s ease;
        }
        body[data-skin="sports"] .hero-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(232,67,43,0.4);
        }
        body[data-skin="sports"] .hero-secondary {
          border: 2px solid rgba(255,255,255,0.2);
          color: #ffffff;
          border-radius: 12px;
          backdrop-filter: blur(10px);
          background: rgba(255,255,255,0.05);
          padding: 14px 32px;
          transition: all 0.3s ease;
        }
        body[data-skin="sports"] .hero-secondary:hover {
          background: rgba(255,255,255,0.15);
          border-color: rgba(255,255,255,0.4);
        }
        
        /* ── Navigation ── */
        body[data-skin="sports"] .store-nav { 
          background: rgba(15,26,46,0.95) !important; 
          border-bottom: 3px solid #e8432b; 
        }
        body[data-skin="sports"] .store-nav-links a {
          color: rgba(255,255,255,0.7);
          transition: color 0.3s;
        }
        body[data-skin="sports"] .store-nav-links a:hover {
          color: #f5c842;
        }
        
        /* ── Cards ── */
        body[data-skin="sports"] .product-card {
          background: rgba(22,35,56,0.85);
          border: 2px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 10px 40px rgba(0,0,0,0.4);
          backdrop-filter: blur(10px);
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
          color: #ffffff;
        }
        body[data-skin="sports"] .product-card p {
          color: rgba(255,255,255,0.7);
        }
        body[data-skin="sports"] .product-type {
          color: #f5c842;
          font-weight: 900;
        }
        
        /* ── Buttons ── */
        body[data-skin="sports"] .product-add {
          background: linear-gradient(135deg, #e8432b, #c0392b);
          border: none;
          color: #ffffff;
          text-transform: uppercase;
          font-weight: 900;
          border-radius: 12px;
          letter-spacing: 0.05em;
          box-shadow: 0 4px 20px rgba(232,67,43,0.3);
          transition: all 0.3s ease;
          padding: 12px 24px;
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
          color: #ffffff;
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
        body[data-skin="sports"] .badge {
          color: rgba(255,255,255,0.8);
          border-color: rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.05);
        }
        body[data-skin="sports"] .badge.hot {
          background: #e8432b;
          color: #ffffff;
          border: none;
        }
        
        /* ── Section Titles ── */
        body[data-skin="sports"] .section-intro h2 {
          font-family: 'Bebas Neue', sans-serif;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #ffffff;
        }
        body[data-skin="sports"] .section-intro p {
          color: rgba(255,255,255,0.7);
        }
        
        /* ── Music Section ── */
        body[data-skin="sports"] .music-section {
          background: rgba(22,35,56,0.5);
        }
        body[data-skin="sports"] .music-row {
          background: rgba(255,255,255,0.06);
          border-color: rgba(255,255,255,0.08);
        }
        body[data-skin="sports"] .music-row h3 {
          color: #ffffff;
        }
        body[data-skin="sports"] .music-row p {
          color: rgba(255,255,255,0.6);
        }
        body[data-skin="sports"] .preview-btn {
          border-color: rgba(255,255,255,0.15);
          color: rgba(255,255,255,0.8);
          background: rgba(255,255,255,0.05);
        }
        body[data-skin="sports"] .preview-btn:hover {
          background: rgba(255,255,255,0.15);
          border-color: #e8432b;
        }
        body[data-skin="sports"] .mini-add {
          background: #e8432b;
          color: #ffffff;
          border-color: #e8432b;
        }
        body[data-skin="sports"] .mini-add:hover {
          background: #c0392b;
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
        
        /* ── Story Card ── */
        body[data-skin="sports"] .story-card {
          background: rgba(255,255,255,0.06);
          border-color: rgba(255,255,255,0.08);
        }
        body[data-skin="sports"] .story-card h2 {
          color: #ffffff;
        }
        body[data-skin="sports"] .story-card p {
          color: rgba(255,255,255,0.7);
        }
        body[data-skin="sports"] .social-row a {
          border-color: rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.6);
          transition: all 0.3s ease;
        }
        body[data-skin="sports"] .social-row a:hover {
          border-color: #e8432b;
          color: #e8432b;
          background: rgba(232,67,43,0.1);
        }
        
        /* ── Footer ── */
        body[data-skin="sports"] .artist-footer {
          color: rgba(255,255,255,0.6);
        }
        body[data-skin="sports"] .artist-footer strong {
          color: #ffffff;
        }
        
        /* ── Variant Selector ── */
        body[data-skin="sports"] .variant-option {
          border-color: rgba(255,255,255,0.15);
          color: rgba(255,255,255,0.8);
          background: rgba(255,255,255,0.05);
        }
        body[data-skin="sports"] .variant-option.is-selected {
          background: #e8432b;
          border-color: #e8432b;
          color: #ffffff;
        }
        body[data-skin="sports"] .variant-label {
          color: rgba(255,255,255,0.6);
        }
        body[data-skin="sports"] .variant-note {
          color: rgba(255,255,255,0.5);
        }
        body[data-skin="sports"] .variant-note.needs-selection {
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
        hero_overlay: 'rgba(13, 11, 10, 0.92)',
        
        background: '#0d0b0a',
        surface: '#1a1715',
        surface_light: 'rgba(201,168,76,0.06)',
        text: '#f5f0eb',
        text_muted: 'rgba(245,240,235,0.7)',
        text_inverse: '#0d0b0a',
        primary: '#c9a84c',
        primary_dark: '#a8893a',
        primary_text: '#0d0b0a',
        secondary: '#d4b87a',
        accent: '#e8d5a3',
        accent_2: '#c9a84c',
        line: 'rgba(201,168,76,0.12)',
        glow: 'rgba(201, 168, 76, 0.2)',
        card_bg: 'rgba(26,23,21,0.9)',
        
        button_radius: '999px',
        card_radius: '24px',
        card_shadow: '0 8px 40px rgba(0,0,0,0.5)',
        card_hover_shadow: '0 16px 80px rgba(201,168,76,0.08)',
        
        font_heading: "'Playfair Display','Georgia',serif",
        font_body: "'Inter','Helvetica',sans-serif",
        font_accent: "'Playfair Display',serif",
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
        body[data-skin="luxury"] .hero-copy p { 
          color: rgba(245,240,235,0.7);
          font-weight: 300;
          text-shadow: 0 2px 20px rgba(0,0,0,0.5);
        }
        
        /* ── Navigation ── */
        body[data-skin="luxury"] .store-nav { 
          background: rgba(13,11,10,0.95) !important; 
          border-bottom: 1px solid rgba(201,168,76,0.15); 
        }
        body[data-skin="luxury"] .store-nav-links a {
          color: rgba(245,240,235,0.6);
          transition: color 0.3s;
        }
        body[data-skin="luxury"] .store-nav-links a:hover {
          color: #c9a84c;
        }
        
        /* ── Cards ── */
        body[data-skin="luxury"] .product-card {
          background: rgba(26,23,21,0.9);
          border: 1px solid rgba(201,168,76,0.08);
          border-radius: 24px;
          backdrop-filter: blur(20px);
          transition: all 0.6s ease;
          box-shadow: 0 8px 40px rgba(0,0,0,0.5);
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
          color: #f5f0eb;
        }
        body[data-skin="luxury"] .product-card p {
          color: rgba(245,240,235,0.6);
        }
        body[data-skin="luxury"] .product-type {
          color: #c9a84c;
          font-weight: 600;
          letter-spacing: 0.1em;
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
          background: rgba(201,168,76,0.05);
          padding: 14px 32px;
          transition: all 0.4s ease;
        }
        body[data-skin="luxury"] .hero-secondary:hover {
          background: rgba(201,168,76,0.1);
          border-color: rgba(201,168,76,0.5);
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
        
        /* ── Badges ── */
        body[data-skin="luxury"] .badge {
          color: rgba(245,240,235,0.7);
          border-color: rgba(201,168,76,0.15);
          background: rgba(201,168,76,0.05);
        }
        body[data-skin="luxury"] .badge.hot {
          background: #c9a84c;
          color: #0d0b0a;
          border: none;
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
        
        /* ── Music Section ── */
        body[data-skin="luxury"] .music-section {
          background: rgba(26,23,21,0.5);
        }
        body[data-skin="luxury"] .music-row {
          background: rgba(26,23,21,0.6);
          border-color: rgba(201,168,76,0.08);
          transition: all 0.4s ease;
        }
        body[data-skin="luxury"] .music-row:hover {
          border-color: rgba(201,168,76,0.2);
        }
        body[data-skin="luxury"] .music-row h3 {
          color: #f5f0eb;
        }
        body[data-skin="luxury"] .music-row p {
          color: rgba(245,240,235,0.6);
        }
        body[data-skin="luxury"] .preview-btn {
          border-color: rgba(201,168,76,0.15);
          color: rgba(245,240,235,0.7);
          background: rgba(201,168,76,0.05);
          transition: all 0.4s ease;
        }
        body[data-skin="luxury"] .preview-btn:hover {
          background: rgba(201,168,76,0.1);
          border-color: #c9a84c;
          color: #c9a84c;
        }
        body[data-skin="luxury"] .mini-add {
          background: #c9a84c;
          color: #0d0b0a;
          border-color: #c9a84c;
        }
        body[data-skin="luxury"] .mini-add:hover {
          background: #d4b87a;
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
        
        /* ── Story Card ── */
        body[data-skin="luxury"] .story-card {
          background: rgba(26,23,21,0.6);
          border-color: rgba(201,168,76,0.08);
          transition: all 0.4s ease;
        }
        body[data-skin="luxury"] .story-card:hover {
          border-color: rgba(201,168,76,0.2);
        }
        body[data-skin="luxury"] .story-card h2 {
          color: #f5f0eb;
        }
        body[data-skin="luxury"] .story-card p {
          color: rgba(245,240,235,0.6);
        }
        body[data-skin="luxury"] .social-row a {
          border-color: rgba(201,168,76,0.12);
          color: rgba(245,240,235,0.6);
          transition: all 0.4s ease;
        }
        body[data-skin="luxury"] .social-row a:hover {
          border-color: #c9a84c;
          color: #c9a84c;
          background: rgba(201,168,76,0.05);
        }
        
        /* ── Footer ── */
        body[data-skin="luxury"] .artist-footer {
          color: rgba(245,240,235,0.6);
        }
        body[data-skin="luxury"] .artist-footer strong {
          color: #f5f0eb;
        }
        
        /* ── Variant Selector ── */
        body[data-skin="luxury"] .variant-option {
          border-color: rgba(201,168,76,0.15);
          color: rgba(245,240,235,0.7);
          background: rgba(201,168,76,0.05);
          transition: all 0.4s ease;
        }
        body[data-skin="luxury"] .variant-option:hover {
          border-color: rgba(201,168,76,0.3);
        }
        body[data-skin="luxury"] .variant-option.is-selected {
          background: #c9a84c;
          border-color: #c9a84c;
          color: #0d0b0a;
        }
        body[data-skin="luxury"] .variant-label {
          color: rgba(245,240,235,0.5);
        }
        body[data-skin="luxury"] .variant-note {
          color: rgba(245,240,235,0.5);
        }
        body[data-skin="luxury"] .variant-note.needs-selection {
          color: #c9a84c;
        }
      `
    },
    
    corporate: {
      id: 'corporate',
      label: 'Corporate',
      icon: '🏢',
      
      theme: {
        hero_height: '560px',
        hero_overlay: 'rgba(248, 246, 243, 0.88)',
        
        background: '#f8f6f3',
        surface: '#ffffff',
        surface_light: 'rgba(26,26,26,0.04)',
        text: '#1a1a1a',
        text_muted: 'rgba(26,26,26,0.65)',
        text_inverse: '#ffffff',
        primary: '#1a3c34',
        primary_dark: '#0f2a24',
        primary_text: '#ffffff',
        secondary: '#2d6b5a',
        accent: '#c17a3e',
        accent_2: '#1a3c34',
        line: 'rgba(26,26,26,0.08)',
        glow: 'rgba(26, 60, 52, 0.1)',
        card_bg: '#ffffff',
        
        button_radius: '8px',
        card_radius: '8px',
        card_shadow: '0 2px 12px rgba(0,0,0,0.04)',
        card_hover_shadow: '0 8px 32px rgba(0,0,0,0.08)',
        
        font_heading: "'Inter','Helvetica',sans-serif",
        font_body: "'Inter','Helvetica',sans-serif",
        font_accent: "'Montserrat',sans-serif",
        heading_transform: 'none',
        heading_weight: '700',
        
        grid_cols: '4',
        grid_gap: '16px',
        
        card_hover: 'fade',
        has_glow: false,
        has_pattern: false,
      },
      
      css: `
        /* ── Hero ── */
        body[data-skin="corporate"] .experience-hero { min-height: 560px; }
        body[data-skin="corporate"] .hero-overlay { 
          background: linear-gradient(180deg, rgba(248,246,243,0.2), rgba(248,246,243,0.92)) !important; 
        }
        body[data-skin="corporate"] .hero-copy h1 {
          font-family: 'Inter', sans-serif;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: #1a1a1a;
        }
        body[data-skin="corporate"] .hero-copy p { 
          color: rgba(26,26,26,0.65);
          font-weight: 400;
        }
        body[data-skin="corporate"] .hero-primary {
          background: #1a3c34;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-weight: 700;
          padding: 14px 32px;
          transition: all 0.3s ease;
        }
        body[data-skin="corporate"] .hero-primary:hover {
          background: #0f2a24;
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(26,60,52,0.2);
        }
        body[data-skin="corporate"] .hero-secondary {
          border: 1px solid rgba(26,26,26,0.2);
          color: #1a1a1a;
          border-radius: 8px;
          background: transparent;
          padding: 14px 32px;
          transition: all 0.3s ease;
        }
        body[data-skin="corporate"] .hero-secondary:hover {
          background: rgba(26,26,26,0.04);
          border-color: rgba(26,26,26,0.3);
        }
        
        /* ── Navigation ── */
        body[data-skin="corporate"] .store-nav { 
          background: rgba(248,246,243,0.95) !important; 
          border-bottom: 2px solid #1a3c34; 
        }
        body[data-skin="corporate"] .store-nav-links a {
          color: rgba(26,26,26,0.6);
          transition: color 0.3s;
        }
        body[data-skin="corporate"] .store-nav-links a:hover {
          color: #1a3c34;
        }
        
        /* ── Cards ── */
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
        body[data-skin="corporate"] .product-card h3 {
          color: #1a1a1a;
          font-weight: 700;
        }
        body[data-skin="corporate"] .product-card p {
          color: rgba(26,26,26,0.6);
        }
        body[data-skin="corporate"] .product-type {
          color: #1a3c34;
          font-weight: 600;
        }
        
        /* ── Buttons ── */
        body[data-skin="corporate"] .product-add {
          background: #1a3c34;
          border: none;
          color: #ffffff;
          font-weight: 600;
          border-radius: 8px;
          padding: 10px 20px;
          transition: all 0.3s ease;
        }
        body[data-skin="corporate"] .product-add:hover {
          background: #0f2a24;
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(26,60,52,0.2);
        }
        
        /* ── Price ── */
        body[data-skin="corporate"] .product-price {
          color: #1a3c34;
          font-weight: 700;
        }
        
        /* ── Ticker ── */
        body[data-skin="corporate"] .store-ticker {
          background: #1a3c34;
          color: #ffffff;
          font-weight: 600;
        }
        
        /* ── Grid ── */
        body[data-skin="corporate"] .product-grid {
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        
        /* ── Badges ── */
        body[data-skin="corporate"] .badge {
          color: rgba(26,26,26,0.6);
          border-color: rgba(26,26,26,0.1);
          background: rgba(26,26,26,0.03);
        }
        body[data-skin="corporate"] .badge.hot {
          background: #1a3c34;
          color: #ffffff;
          border: none;
        }
        
        /* ── Section Titles ── */
        body[data-skin="corporate"] .section-intro h2 {
          font-family: 'Inter', sans-serif;
          font-weight: 700;
          color: #1a1a1a;
        }
        body[data-skin="corporate"] .section-intro p {
          color: rgba(26,26,26,0.6);
        }
        
        /* ── Music Section ── */
        body[data-skin="corporate"] .music-section {
          background: #f0eeea;
        }
        body[data-skin="corporate"] .music-row {
          background: #ffffff;
          border-color: rgba(26,26,26,0.06);
        }
        body[data-skin="corporate"] .music-row h3 {
          color: #1a1a1a;
        }
        body[data-skin="corporate"] .music-row p {
          color: rgba(26,26,26,0.6);
        }
        body[data-skin="corporate"] .preview-btn {
          border-color: rgba(26,26,26,0.1);
          color: rgba(26,26,26,0.7);
          background: transparent;
          transition: all 0.3s ease;
        }
        body[data-skin="corporate"] .preview-btn:hover {
          background: rgba(26,26,26,0.04);
          border-color: #1a3c34;
        }
        body[data-skin="corporate"] .mini-add {
          background: #1a3c34;
          color: #ffffff;
          border-color: #1a3c34;
        }
        body[data-skin="corporate"] .mini-add:hover {
          background: #0f2a24;
        }
        
        /* ── Store Pill ── */
        body[data-skin="corporate"] .store-pill {
          border-color: rgba(26,60,52,0.2);
          color: #1a3c34;
          background: rgba(26,60,52,0.05);
        }
        
        /* ── Story Card ── */
        body[data-skin="corporate"] .story-card {
          background: #ffffff;
          border-color: rgba(26,26,26,0.06);
        }
        body[data-skin="corporate"] .story-card h2 {
          color: #1a1a1a;
        }
        body[data-skin="corporate"] .story-card p {
          color: rgba(26,26,26,0.6);
        }
        body[data-skin="corporate"] .social-row a {
          border-color: rgba(26,26,26,0.1);
          color: rgba(26,26,26,0.6);
          transition: all 0.3s ease;
        }
        body[data-skin="corporate"] .social-row a:hover {
          border-color: #1a3c34;
          color: #1a3c34;
          background: rgba(26,60,52,0.05);
        }
        
        /* ── Footer ── */
        body[data-skin="corporate"] .artist-footer {
          color: rgba(26,26,26,0.6);
        }
        body[data-skin="corporate"] .artist-footer strong {
          color: #1a1a1a;
        }
        
        /* ── Variant Selector ── */
        body[data-skin="corporate"] .variant-option {
          border-color: rgba(26,26,26,0.1);
          color: rgba(26,26,26,0.7);
          background: transparent;
          transition: all 0.3s ease;
        }
        body[data-skin="corporate"] .variant-option:hover {
          background: rgba(26,26,26,0.04);
        }
        body[data-skin="corporate"] .variant-option.is-selected {
          background: #1a3c34;
          border-color: #1a3c34;
          color: #ffffff;
        }
        body[data-skin="corporate"] .variant-label {
          color: rgba(26,26,26,0.5);
        }
        body[data-skin="corporate"] .variant-note {
          color: rgba(26,26,26,0.5);
        }
        body[data-skin="corporate"] .variant-note.needs-selection {
          color: #1a3c34;
        }
      `
    },
    
    earthy_natural: {
      id: 'earthy_natural',
      label: 'Earthy & Natural',
      icon: '🌿',
      
      theme: {
        hero_height: '600px',
        hero_overlay: 'rgba(245, 240, 235, 0.88)',
        
        background: '#f5f0eb',
        surface: '#ffffff',
        surface_light: 'rgba(107,143,113,0.06)',
        text: '#2d2a24',
        text_muted: 'rgba(45,42,36,0.65)',
        text_inverse: '#ffffff',
        primary: '#6b8f71',
        primary_dark: '#4d6b52',
        primary_text: '#ffffff',
        secondary: '#8faa8b',
        accent: '#b8966a',
        accent_2: '#6b8f71',
        line: 'rgba(107,143,113,0.15)',
        glow: 'rgba(107, 143, 113, 0.1)',
        card_bg: 'rgba(255,255,255,0.8)',
        
        button_radius: '999px',
        card_radius: '20px',
        card_shadow: 'none',
        card_hover_shadow: '0 8px 40px rgba(107,143,113,0.12)',
        
        font_heading: "'Cormorant Garamond','Georgia',serif",
        font_body: "'Inter','Helvetica',sans-serif",
        font_accent: "'Alegreya',serif",
        heading_transform: 'none',
        heading_weight: '400',
        
        grid_cols: '3',
        grid_gap: '20px',
        
        card_hover: 'fade',
        has_glow: true,
        has_pattern: false,
      },
      
      css: `
        /* ── Hero ── */
        body[data-skin="earthy_natural"] .experience-hero { min-height: 600px; }
        body[data-skin="earthy_natural"] .hero-overlay { 
          background: linear-gradient(180deg, rgba(245,240,235,0.2), rgba(245,240,235,0.92)) !important; 
        }
        body[data-skin="earthy_natural"] .hero-copy h1 {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 400;
          color: #2d2a24;
        }
        body[data-skin="earthy_natural"] .hero-copy p { 
          color: rgba(45,42,36,0.65);
          font-weight: 400;
        }
        body[data-skin="earthy_natural"] .hero-primary {
          background: #6b8f71;
          color: #ffffff;
          border: none;
          border-radius: 999px;
          padding: 14px 32px;
          transition: all 0.3s ease;
        }
        body[data-skin="earthy_natural"] .hero-primary:hover {
          background: #4d6b52;
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(107,143,113,0.3);
        }
        body[data-skin="earthy_natural"] .hero-secondary {
          border: 1px solid rgba(107,143,113,0.3);
          color: #2d2a24;
          border-radius: 999px;
          background: transparent;
          padding: 14px 32px;
          transition: all 0.3s ease;
        }
        body[data-skin="earthy_natural"] .hero-secondary:hover {
          background: rgba(107,143,113,0.05);
          border-color: #6b8f71;
        }
        
        /* ── Navigation ── */
        body[data-skin="earthy_natural"] .store-nav { 
          background: rgba(245,240,235,0.95) !important; 
          border-bottom: 2px solid #6b8f71; 
        }
        body[data-skin="earthy_natural"] .store-nav-links a {
          color: rgba(45,42,36,0.6);
          transition: color 0.3s;
        }
        body[data-skin="earthy_natural"] .store-nav-links a:hover {
          color: #6b8f71;
        }
        
        /* ── Cards ── */
        body[data-skin="earthy_natural"] .product-card {
          background: rgba(255,255,255,0.8);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(107,143,113,0.15);
          border-radius: 20px;
          transition: all 0.3s ease;
        }
        body[data-skin="earthy_natural"] .product-card:hover {
          box-shadow: 0 8px 40px rgba(107,143,113,0.12);
          transform: translateY(-4px);
        }
        body[data-skin="earthy_natural"] .product-card h3 {
          color: #2d2a24;
        }
        body[data-skin="earthy_natural"] .product-card p {
          color: rgba(45,42,36,0.6);
        }
        body[data-skin="earthy_natural"] .product-type {
          color: #6b8f71;
          font-weight: 600;
        }
        
        /* ── Buttons ── */
        body[data-skin="earthy_natural"] .product-add {
          background: #6b8f71;
          border: none;
          color: #ffffff;
          border-radius: 999px;
          padding: 10px 20px;
          transition: all 0.3s ease;
        }
        body[data-skin="earthy_natural"] .product-add:hover {
          background: #4d6b52;
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(107,143,113,0.3);
        }
        
        /* ── Price ── */
        body[data-skin="earthy_natural"] .product-price {
          color: #6b8f71;
          font-weight: 600;
        }
        
        /* ── Ticker ── */
        body[data-skin="earthy_natural"] .store-ticker {
          background: #6b8f71;
          color: #ffffff;
          font-weight: 500;
        }
        
        /* ── Grid ── */
        body[data-skin="earthy_natural"] .product-grid {
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        
        /* ── Badges ── */
        body[data-skin="earthy_natural"] .badge {
          color: rgba(45,42,36,0.6);
          border-color: rgba(107,143,113,0.2);
          background: rgba(107,143,113,0.05);
        }
        body[data-skin="earthy_natural"] .badge.hot {
          background: #6b8f71;
          color: #ffffff;
          border: none;
        }
        
        /* ── Section Titles ── */
        body[data-skin="earthy_natural"] .section-intro h2 {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 400;
          color: #2d2a24;
        }
        body[data-skin="earthy_natural"] .section-intro p {
          color: rgba(45,42,36,0.6);
        }
        
        /* ── Music Section ── */
        body[data-skin="earthy_natural"] .music-section {
          background: #ece7e1;
        }
        body[data-skin="earthy_natural"] .music-row {
          background: rgba(255,255,255,0.7);
          border-color: rgba(107,143,113,0.12);
        }
        body[data-skin="earthy_natural"] .music-row h3 {
          color: #2d2a24;
        }
        body[data-skin="earthy_natural"] .music-row p {
          color: rgba(45,42,36,0.6);
        }
        body[data-skin="earthy_natural"] .preview-btn {
          border-color: rgba(107,143,113,0.2);
          color: rgba(45,42,36,0.7);
          background: transparent;
          transition: all 0.3s ease;
        }
        body[data-skin="earthy_natural"] .preview-btn:hover {
          background: rgba(107,143,113,0.05);
          border-color: #6b8f71;
        }
        body[data-skin="earthy_natural"] .mini-add {
          background: #6b8f71;
          color: #ffffff;
          border-color: #6b8f71;
        }
        body[data-skin="earthy_natural"] .mini-add:hover {
          background: #4d6b52;
        }
        
        /* ── Store Pill ── */
        body[data-skin="earthy_natural"] .store-pill {
          border-color: rgba(107,143,113,0.3);
          color: #6b8f71;
          background: rgba(107,143,113,0.05);
        }
        
        /* ── Story Card ── */
        body[data-skin="earthy_natural"] .story-card {
          background: rgba(255,255,255,0.7);
          border-color: rgba(107,143,113,0.12);
        }
        body[data-skin="earthy_natural"] .story-card h2 {
          color: #2d2a24;
        }
        body[data-skin="earthy_natural"] .story-card p {
          color: rgba(45,42,36,0.6);
        }
        body[data-skin="earthy_natural"] .social-row a {
          border-color: rgba(107,143,113,0.15);
          color: rgba(45,42,36,0.6);
          transition: all 0.3s ease;
        }
        body[data-skin="earthy_natural"] .social-row a:hover {
          border-color: #6b8f71;
          color: #6b8f71;
          background: rgba(107,143,113,0.05);
        }
        
        /* ── Footer ── */
        body[data-skin="earthy_natural"] .artist-footer {
          color: rgba(45,42,36,0.6);
        }
        body[data-skin="earthy_natural"] .artist-footer strong {
          color: #2d2a24;
        }
        
        /* ── Variant Selector ── */
        body[data-skin="earthy_natural"] .variant-option {
          border-color: rgba(107,143,113,0.2);
          color: rgba(45,42,36,0.7);
          background: transparent;
          transition: all 0.3s ease;
        }
        body[data-skin="earthy_natural"] .variant-option:hover {
          background: rgba(107,143,113,0.05);
        }
        body[data-skin="earthy_natural"] .variant-option.is-selected {
          background: #6b8f71;
          border-color: #6b8f71;
          color: #ffffff;
        }
        body[data-skin="earthy_natural"] .variant-label {
          color: rgba(45,42,36,0.5);
        }
        body[data-skin="earthy_natural"] .variant-note {
          color: rgba(45,42,36,0.5);
        }
        body[data-skin="earthy_natural"] .variant-note.needs-selection {
          color: #6b8f71;
        }
      `
    },
    
    gospel: {
      id: 'gospel',
      label: 'Gospel',
      icon: '✝️',
      
      theme: {
        hero_height: '560px',
        hero_overlay: 'rgba(250, 248, 245, 0.88)',
        
        background: '#faf8f5',
        surface: '#ffffff',
        surface_light: 'rgba(193,154,107,0.06)',
        text: '#1a1a1a',
        text_muted: 'rgba(26,26,26,0.65)',
        text_inverse: '#ffffff',
        primary: '#c19a6b',
        primary_dark: '#a07d55',
        primary_text: '#ffffff',
        secondary: '#e8d5c4',
        accent: '#b8860b',
        accent_2: '#c19a6b',
        line: 'rgba(193,154,107,0.15)',
        glow: 'rgba(193, 154, 107, 0.1)',
        card_bg: 'rgba(255,255,255,0.9)',
        
        button_radius: '8px',
        card_radius: '12px',
        card_shadow: '0 4px 24px rgba(193,154,107,0.06)',
        card_hover_shadow: '0 8px 32px rgba(193,154,107,0.1)',
        
        font_heading: "'Georgia','Times New Roman',serif",
        font_body: "'Inter','Helvetica',sans-serif",
        font_accent: "'Georgia',serif",
        heading_transform: 'none',
        heading_weight: '400',
        
        grid_cols: '3',
        grid_gap: '16px',
        
        card_hover: 'fade',
        has_glow: true,
        has_pattern: false,
      },
      
      css: `
        /* ── Hero ── */
        body[data-skin="gospel"] .experience-hero { min-height: 560px; }
        body[data-skin="gospel"] .hero-overlay { 
          background: linear-gradient(180deg, rgba(250,248,245,0.2), rgba(250,248,245,0.92)) !important; 
        }
        body[data-skin="gospel"] .hero-copy h1 {
          font-family: 'Georgia', serif;
          font-weight: 400;
          color: #1a1a1a;
        }
        body[data-skin="gospel"] .hero-copy p { 
          color: rgba(26,26,26,0.65);
          font-weight: 400;
        }
        body[data-skin="gospel"] .hero-primary {
          background: #c19a6b;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          padding: 14px 32px;
          transition: all 0.3s ease;
        }
        body[data-skin="gospel"] .hero-primary:hover {
          background: #a07d55;
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(193,154,107,0.3);
        }
        body[data-skin="gospel"] .hero-secondary {
          border: 1px solid rgba(193,154,107,0.3);
          color: #1a1a1a;
          border-radius: 8px;
          background: transparent;
          padding: 14px 32px;
          transition: all 0.3s ease;
        }
        body[data-skin="gospel"] .hero-secondary:hover {
          background: rgba(193,154,107,0.05);
          border-color: #c19a6b;
        }
        
        /* ── Navigation ── */
        body[data-skin="gospel"] .store-nav { 
          background: rgba(250,248,245,0.95) !important; 
          border-bottom: 2px solid #c19a6b; 
        }
        body[data-skin="gospel"] .store-nav-links a {
          color: rgba(26,26,26,0.6);
          transition: color 0.3s;
        }
        body[data-skin="gospel"] .store-nav-links a:hover {
          color: #c19a6b;
        }
        
        /* ── Cards ── */
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
        body[data-skin="gospel"] .product-card h3 {
          color: #1a1a1a;
        }
        body[data-skin="gospel"] .product-card p {
          color: rgba(26,26,26,0.6);
        }
        body[data-skin="gospel"] .product-type {
          color: #c19a6b;
          font-weight: 600;
        }
        
        /* ── Buttons ── */
        body[data-skin="gospel"] .product-add {
          background: #c19a6b;
          border: none;
          color: #ffffff;
          border-radius: 8px;
          padding: 10px 20px;
          transition: all 0.3s ease;
        }
        body[data-skin="gospel"] .product-add:hover {
          background: #a07d55;
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(193,154,107,0.3);
        }
        
        /* ── Price ── */
        body[data-skin="gospel"] .product-price {
          color: #c19a6b;
          font-weight: 600;
        }
        
        /* ── Ticker ── */
        body[data-skin="gospel"] .store-ticker {
          background: #c19a6b;
          color: #ffffff;
          font-weight: 500;
        }
        
        /* ── Grid ── */
        body[data-skin="gospel"] .product-grid {
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        
        /* ── Badges ── */
        body[data-skin="gospel"] .badge {
          color: rgba(26,26,26,0.6);
          border-color: rgba(193,154,107,0.15);
          background: rgba(193,154,107,0.05);
        }
        body[data-skin="gospel"] .badge.hot {
          background: #c19a6b;
          color: #ffffff;
          border: none;
        }
        
        /* ── Section Titles ── */
        body[data-skin="gospel"] .section-intro h2 {
          font-family: 'Georgia', serif;
          font-weight: 400;
          color: #1a1a1a;
        }
        body[data-skin="gospel"] .section-intro p {
          color: rgba(26,26,26,0.6);
        }
        
        /* ── Music Section ── */
        body[data-skin="gospel"] .music-section {
          background: #f2efe9;
        }
        body[data-skin="gospel"] .music-row {
          background: rgba(255,255,255,0.8);
          border-color: rgba(193,154,107,0.1);
        }
        body[data-skin="gospel"] .music-row h3 {
          color: #1a1a1a;
        }
        body[data-skin="gospel"] .music-row p {
          color: rgba(26,26,26,0.6);
        }
        body[data-skin="gospel"] .preview-btn {
          border-color: rgba(193,154,107,0.2);
          color: rgba(26,26,26,0.7);
          background: transparent;
          transition: all 0.3s ease;
        }
        body[data-skin="gospel"] .preview-btn:hover {
          background: rgba(193,154,107,0.05);
          border-color: #c19a6b;
        }
        body[data-skin="gospel"] .mini-add {
          background: #c19a6b;
          color: #ffffff;
          border-color: #c19a6b;
        }
        body[data-skin="gospel"] .mini-add:hover {
          background: #a07d55;
        }
        
        /* ── Store Pill ── */
        body[data-skin="gospel"] .store-pill {
          border-color: rgba(193,154,107,0.3);
          color: #c19a6b;
          background: rgba(193,154,107,0.05);
        }
        
        /* ── Story Card ── */
        body[data-skin="gospel"] .story-card {
          background: rgba(255,255,255,0.8);
          border-color: rgba(193,154,107,0.1);
        }
        body[data-skin="gospel"] .story-card h2 {
          color: #1a1a1a;
        }
        body[data-skin="gospel"] .story-card p {
          color: rgba(26,26,26,0.6);
        }
        body[data-skin="gospel"] .social-row a {
          border-color: rgba(193,154,107,0.15);
          color: rgba(26,26,26,0.6);
          transition: all 0.3s ease;
        }
        body[data-skin="gospel"] .social-row a:hover {
          border-color: #c19a6b;
          color: #c19a6b;
          background: rgba(193,154,107,0.05);
        }
        
        /* ── Footer ── */
        body[data-skin="gospel"] .artist-footer {
          color: rgba(26,26,26,0.6);
        }
        body[data-skin="gospel"] .artist-footer strong {
          color: #1a1a1a;
        }
        
        /* ── Variant Selector ── */
        body[data-skin="gospel"] .variant-option {
          border-color: rgba(193,154,107,0.2);
          color: rgba(26,26,26,0.7);
          background: transparent;
          transition: all 0.3s ease;
        }
        body[data-skin="gospel"] .variant-option:hover {
          background: rgba(193,154,107,0.05);
        }
        body[data-skin="gospel"] .variant-option.is-selected {
          background: #c19a6b;
          border-color: #c19a6b;
          color: #ffffff;
        }
        body[data-skin="gospel"] .variant-label {
          color: rgba(26,26,26,0.5);
        }
        body[data-skin="gospel"] .variant-note {
          color: rgba(26,26,26,0.5);
        }
        body[data-skin="gospel"] .variant-note.needs-selection {
          color: #c19a6b;
        }
      `
    }
  },
  
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
  
  applySkin(skinId) {
    const skin = this.skinSystem.skins[skinId];
    if (!skin) {
      console.warn(`Skin "${skinId}" not found, using default`);
      return this.applySkin('streetwear');
    }
    
    this.currentSkin = skin;
    
    this.applyCSSVariables(skin);
    this.loadFonts(skin);
    this.applySkinCSS(skin);
    this.updateDOM(skin);
    this.triggerAnimations(skin);
    this.applyContrastFixes(skin);
    
    console.log(`🎨 Applied skin: ${skin.label}`);
    return skin;
  }
  
  applyCSSVariables(skin) {
    const root = document.documentElement;
    const t = skin.theme;
    
    root.style.setProperty('--store-bg', t.background);
    root.style.setProperty('--store-surface', t.surface);
    root.style.setProperty('--store-text', t.text);
    root.style.setProperty('--store-muted', t.text_muted);
    root.style.setProperty('--store-primary', t.primary);
    root.style.setProperty('--store-secondary', t.secondary);
    root.style.setProperty('--store-accent', t.accent);
    root.style.setProperty('--store-line', t.line);
    root.style.setProperty('--skin-glow', t.glow || 'transparent');
    root.style.setProperty('--skin-card-bg', t.card_bg || 'rgba(255,255,255,0.05)');
    
    // Fonts
    root.style.setProperty('--skin-font-heading', t.font_heading);
    root.style.setProperty('--skin-font-body', t.font_body);
    root.style.setProperty('--skin-font-accent', t.font_accent);
    
    // Grid
    const colMap = { '2': '2', '3': '3', '4': '4' };
    root.style.setProperty('--skin-grid-cols', colMap[t.grid_cols] || '3');
    root.style.setProperty('--skin-gap', t.grid_gap || '20px');
    
    // Card
    root.style.setProperty('--skin-card-radius', t.card_radius || '16px');
    root.style.setProperty('--skin-card-shadow', t.card_shadow || 'none');
    root.style.setProperty('--skin-card-hover-shadow', t.card_hover_shadow || 'none');
    root.style.setProperty('--skin-button-radius', t.button_radius || '999px');
    
    document.body.dataset.skin = skin.id;
  }
  
  applySkinCSS(skin) {
    const oldStyle = document.getElementById('skin-styles');
    if (oldStyle) oldStyle.remove();
    
    const style = document.createElement('style');
    style.id = 'skin-styles';
    style.textContent = skin.css;
    document.head.appendChild(style);
  }
  
  applyContrastFixes(skin) {
    // Ensure text contrast in all environments
    const style = document.createElement('style');
    style.id = 'contrast-fixes';
    style.textContent = `
      /* ── Global Contrast Fixes ── */
      body[data-skin] .hero-copy h1,
      body[data-skin] .hero-copy p,
      body[data-skin] .section-intro h2,
      body[data-skin] .section-intro p,
      body[data-skin] .product-card h3,
      body[data-skin] .product-card p,
      body[data-skin] .product-price,
      body[data-skin] .music-row h3,
      body[data-skin] .music-row p,
      body[data-skin] .story-card h2,
      body[data-skin] .story-card p,
      body[data-skin] .artist-footer,
      body[data-skin] .artist-footer strong,
      body[data-skin] .store-nav-links a,
      body[data-skin] .variant-option,
      body[data-skin] .variant-label,
      body[data-skin] .variant-note,
      body[data-skin] .badge,
      body[data-skin] .store-pill,
      body[data-skin] .social-row a {
        color: var(--store-text, #ffffff) !important;
      }
      
      /* ── Override for light themes ── */
      body[data-skin="corporate"] .hero-copy h1,
      body[data-skin="corporate"] .section-intro h2,
      body[data-skin="corporate"] .product-card h3,
      body[data-skin="corporate"] .music-row h3,
      body[data-skin="corporate"] .story-card h2,
      body[data-skin="corporate"] .artist-footer strong,
      body[data-skin="corporate"] .hero-secondary,
      body[data-skin="corporate"] .variant-option {
        color: #1a1a1a !important;
      }
      
      body[data-skin="earthy_natural"] .hero-copy h1,
      body[data-skin="earthy_natural"] .section-intro h2,
      body[data-skin="earthy_natural"] .product-card h3,
      body[data-skin="earthy_natural"] .music-row h3,
      body[data-skin="earthy_natural"] .story-card h2,
      body[data-skin="earthy_natural"] .artist-footer strong,
      body[data-skin="earthy_natural"] .hero-secondary,
      body[data-skin="earthy_natural"] .variant-option {
        color: #2d2a24 !important;
      }
      
      body[data-skin="gospel"] .hero-copy h1,
      body[data-skin="gospel"] .section-intro h2,
      body[data-skin="gospel"] .product-card h3,
      body[data-skin="gospel"] .music-row h3,
      body[data-skin="gospel"] .story-card h2,
      body[data-skin="gospel"] .artist-footer strong,
      body[data-skin="gospel"] .hero-secondary,
      body[data-skin="gospel"] .variant-option {
        color: #1a1a1a !important;
      }
      
      /* ── Ensure muted text has proper contrast ── */
      body[data-skin] .hero-copy p,
      body[data-skin] .section-intro p,
      body[data-skin] .product-card p,
      body[data-skin] .music-row p,
      body[data-skin] .story-card p,
      body[data-skin] .artist-footer {
        opacity: 0.75 !important;
      }
      
      body[data-skin="corporate"] .hero-copy p,
      body[data-skin="corporate"] .section-intro p,
      body[data-skin="corporate"] .product-card p,
      body[data-skin="corporate"] .music-row p,
      body[data-skin="corporate"] .story-card p {
        color: rgba(26,26,26,0.65) !important;
      }
      
      body[data-skin="earthy_natural"] .hero-copy p,
      body[data-skin="earthy_natural"] .section-intro p,
      body[data-skin="earthy_natural"] .product-card p,
      body[data-skin="earthy_natural"] .music-row p,
      body[data-skin="earthy_natural"] .story-card p {
        color: rgba(45,42,36,0.65) !important;
      }
      
      body[data-skin="gospel"] .hero-copy p,
      body[data-skin="gospel"] .section-intro p,
      body[data-skin="gospel"] .product-card p,
      body[data-skin="gospel"] .music-row p,
      body[data-skin="gospel"] .story-card p {
        color: rgba(26,26,26,0.65) !important;
      }
      
      /* ── Ensure buttons have good contrast ── */
      body[data-skin] .hero-primary,
      body[data-skin] .product-add,
      body[data-skin] .mini-add,
      body[data-skin] .checkout-btn {
        color: var(--store-text, #ffffff) !important;
        font-weight: 700 !important;
      }
      
      body[data-skin="streetwear"] .hero-primary,
      body[data-skin="streetwear"] .product-add {
        color: #0a0a0a !important;
      }
      
      body[data-skin="luxury"] .hero-primary,
      body[data-skin="luxury"] .product-add {
        color: #0d0b0a !important;
      }
      
      /* ── Ensure form inputs are visible ── */
      body[data-skin] .checkout-fields input {
        background: rgba(255,255,255,0.1) !important;
        color: var(--store-text, #ffffff) !important;
        border-color: var(--store-line, rgba(255,255,255,0.2)) !important;
      }
      
      body[data-skin="corporate"] .checkout-fields input,
      body[data-skin="earthy_natural"] .checkout-fields input,
      body[data-skin="gospel"] .checkout-fields input {
        background: rgba(0,0,0,0.05) !important;
        color: #1a1a1a !important;
        border-color: rgba(0,0,0,0.15) !important;
      }
      
      body[data-skin="corporate"] .checkout-fields input::placeholder,
      body[data-skin="earthy_natural"] .checkout-fields input::placeholder,
      body[data-skin="gospel"] .checkout-fields input::placeholder {
        color: rgba(0,0,0,0.4) !important;
      }
      
      body[data-skin="streetwear"] .checkout-fields input::placeholder,
      body[data-skin="sports"] .checkout-fields input::placeholder,
      body[data-skin="luxury"] .checkout-fields input::placeholder {
        color: rgba(255,255,255,0.4) !important;
      }
    `;
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
    
    const heading = document.querySelector('.hero-copy h1');
    if (heading) {
      heading.style.fontFamily = skin.theme.font_heading;
      heading.style.textTransform = skin.theme.heading_transform || 'none';
      heading.style.fontWeight = skin.theme.heading_weight || '700';
    }
    
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
  
  detectIndustry(artist) {
    const industryPref = artist.industry_preference || '';
    const visualStyle = artist.visual_style || '';
    const genre = artist.genre || '';
    const storeMode = artist.store_mode || '';
    
    console.log('🔍 Detecting industry from:', { industryPref, visualStyle, genre, storeMode });
    
    if (industryPref && this.skinSystem.skins[industryPref]) {
      console.log('✅ Using explicit industry preference:', industryPref);
      return industryPref;
    }
    
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
    
    @keyframes skinScaleIn {
      from { opacity: 0; transform: scale(0.9); }
      to { opacity: 1; transform: scale(1); }
    }
    
    @keyframes tickerGradient {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }
    
    /* ── Smooth transitions for all interactive elements ── */
    body[data-skin] .product-card,
    body[data-skin] .hero-primary,
    body[data-skin] .hero-secondary,
    body[data-skin] .product-add,
    body[data-skin] .preview-btn,
    body[data-skin] .mini-add,
    body[data-skin] .social-row a,
    body[data-skin] .variant-option,
    body[data-skin] .store-nav-links a {
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
    }
    
    /* ── Luxury skin gets slower, more elegant transitions ── */
    body[data-skin="luxury"] .product-card,
    body[data-skin="luxury"] .hero-primary,
    body[data-skin="luxury"] .hero-secondary {
      transition-duration: 0.6s !important;
    }
    
    /* ── Sports skin gets snappy transitions ── */
    body[data-skin="sports"] .product-card,
    body[data-skin="sports"] .product-add {
      transition-duration: 0.2s !important;
    }
    
    /* ── Prevent flash of unstyled content ── */
    body.is-loading .product-card,
    body.is-loading .featured-card,
    body.is-loading .music-row {
      opacity: 0;
    }
    
    body.is-loading .hero-copy h1,
    body.is-loading .hero-copy p {
      opacity: 0;
      transform: translateY(20px);
    }
  `;
  document.head.appendChild(styleSheet);
})();

window.SkinManager = SkinManager;
window.SKIN_SYSTEM = SKIN_SYSTEM;

console.log('🎨 ZVAKHO Ultimate Skin System v3 loaded');
