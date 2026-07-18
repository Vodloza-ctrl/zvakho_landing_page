// ============================================
// ZVAKHO ULTIMATE SKIN SYSTEM - Premium Edition v3.4
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
        background: '#0a0a0a',
        surface: '#141414',
        surface_light: 'rgba(255,255,255,0.08)',
        text: '#ffffff',
        text_muted: 'rgba(255,255,255,0.92)',
        text_inverse: '#0a0a0a',
        primary: '#f5a400',
        primary_dark: '#c88400',
        primary_text: '#0a0a0a',
        secondary: '#ffd700',
        accent: '#ff6b6b',
        accent_2: '#ff3366',
        line: 'rgba(255,255,255,0.15)',
        glow: 'rgba(245, 164, 0, 0.3)',
        card_bg: 'rgba(20,20,20,0.95)',
        button_radius: '999px',
        card_radius: '16px',
        card_shadow: '0 8px 40px rgba(0,0,0,0.4)',
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
          background: linear-gradient(180deg, rgba(10,10,10,0.2), rgba(10,10,10,0.95)) !important; 
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
          color: #ffffff !important;
          font-weight: 400;
          text-shadow: 0 2px 20px rgba(0,0,0,0.6);
          opacity: 1 !important;
        }
        body[data-skin="streetwear"] .store-pill {
          border: 1px solid rgba(245,164,0,0.3);
          color: #f5a400 !important;
          background: rgba(245,164,0,0.1);
          font-weight: 700;
          padding: 6px 14px;
          border-radius: 999px;
          font-size: 11px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        body[data-skin="streetwear"] .micro-label {
          color: #f5a400 !important;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          font-size: 11px;
        }
        
        /* ── Navigation ── */
        body[data-skin="streetwear"] .store-nav { 
          background: rgba(10,10,10,0.98) !important; 
          border-bottom: 2px solid #f5a400; 
        }
        body[data-skin="streetwear"] .store-nav-links a {
          color: rgba(255,255,255,0.85) !important;
          transition: color 0.3s;
          font-weight: 600;
        }
        body[data-skin="streetwear"] .store-nav-links a:hover {
          color: #f5a400 !important;
        }
        
        /* ── Cart Button ── */
        body[data-skin="streetwear"] .store-cart-trigger {
          border: 1px solid rgba(255,255,255,0.2) !important;
          background: rgba(255,255,255,0.08) !important;
          color: #ffffff !important;
        }
        body[data-skin="streetwear"] .store-cart-trigger span {
          color: #ffffff !important;
        }
        body[data-skin="streetwear"] .store-cart-trigger strong {
          background: #f5a400 !important;
          color: #0a0a0a !important;
        }
        
        /* ── Hero Buttons ── */
        body[data-skin="streetwear"] .hero-primary {
          background: linear-gradient(135deg, #f5a400, #ff6b6b);
          color: #0a0a0a !important;
          border: none;
          border-radius: 999px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 14px 32px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px rgba(245,164,0,0.3);
        }
        body[data-skin="streetwear"] .hero-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 40px rgba(245,164,0,0.4);
        }
        body[data-skin="streetwear"] .hero-secondary {
          border: 1px solid rgba(255,255,255,0.25);
          color: #ffffff !important;
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
          color: #0a0a0a !important;
          font-weight: 900;
        }
        body[data-skin="streetwear"] .store-ticker-track span {
          color: #0a0a0a !important;
        }
        
        /* ── Product Cards - FIXED ── */
        body[data-skin="streetwear"] .product-card {
          background: rgba(20,20,20,0.95) !important;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          backdrop-filter: blur(10px);
          box-shadow: 0 8px 40px rgba(0,0,0,0.4);
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
          color: #ffffff !important;
          font-weight: 700;
          font-size: 20px;
        }
        body[data-skin="streetwear"] .product-card p {
          color: rgba(255,255,255,0.85) !important;
          font-weight: 400;
          font-size: 14px;
          line-height: 1.5;
        }
        body[data-skin="streetwear"] .product-type {
          color: #f5a400 !important;
          font-weight: 900;
          font-size: 12px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        
        /* ── Price - FIXED ── */
        body[data-skin="streetwear"] .product-price {
          color: #f5a400 !important;
          font-weight: 900;
          font-size: 22px;
          text-shadow: 0 0 20px rgba(245,164,0,0.2);
        }
        body[data-skin="streetwear"] .featured-price {
          color: #f5a400 !important;
          font-weight: 900;
          font-size: 28px;
          text-shadow: 0 0 30px rgba(245,164,0,0.3);
        }
        
        /* ── Buttons ── */
        body[data-skin="streetwear"] .product-add {
          background: linear-gradient(135deg, #f5a400, #ff6b6b);
          border: none;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 900;
          border-radius: 999px;
          color: #0a0a0a !important;
          padding: 12px 24px;
          transition: all 0.3s ease;
          font-size: 14px;
        }
        body[data-skin="streetwear"] .product-add:hover {
          transform: scale(1.05);
          box-shadow: 0 8px 30px rgba(245,164,0,0.4);
        }
        body[data-skin="streetwear"] .mini-add {
          background: linear-gradient(135deg, #f5a400, #ff6b6b);
          color: #0a0a0a !important;
          border: none;
          border-radius: 999px;
          padding: 8px 20px;
          font-weight: 700;
          transition: all 0.3s ease;
        }
        body[data-skin="streetwear"] .mini-add:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 20px rgba(245,164,0,0.3);
        }
        
        /* ── Grid ── */
        body[data-skin="streetwear"] .product-grid {
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        
        /* ── Badges ── */
        body[data-skin="streetwear"] .badge {
          color: rgba(255,255,255,0.85) !important;
          border-color: rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.05);
        }
        body[data-skin="streetwear"] .badge.hot {
          background: linear-gradient(135deg, #f5a400, #ff6b6b);
          color: #0a0a0a !important;
          border: none;
        }
        
        /* ── Section Titles ── */
        body[data-skin="streetwear"] .section-intro h2 {
          font-family: 'Oswald', sans-serif;
          text-transform: uppercase;
          letter-spacing: -0.02em;
          color: #ffffff !important;
          font-weight: 900;
        }
        body[data-skin="streetwear"] .section-intro p {
          color: rgba(255,255,255,0.85) !important;
          font-weight: 400;
        }
        
        /* ── Featured Product - FIXED ── */
        body[data-skin="streetwear"] .featured-card {
          background: rgba(20,20,20,0.95) !important;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          overflow: hidden;
        }
        body[data-skin="streetwear"] .featured-info h3 {
          color: #ffffff !important;
          font-family: 'Oswald', sans-serif;
          text-transform: uppercase;
          font-size: 32px;
          font-weight: 700;
        }
        body[data-skin="streetwear"] .featured-info p {
          color: rgba(255,255,255,0.85) !important;
          font-size: 15px;
          line-height: 1.5;
          font-weight: 400;
        }
        body[data-skin="streetwear"] .featured-badges .badge {
          color: rgba(255,255,255,0.85) !important;
        }
        
        /* ── Variant Selector - FIXED ── */
        body[data-skin="streetwear"] .variant-block {
          margin: 14px 0 8px 0;
        }
        body[data-skin="streetwear"] .variant-label {
          color: rgba(255,255,255,0.85) !important;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        body[data-skin="streetwear"] .variant-options {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        body[data-skin="streetwear"] .variant-option {
          border: 1px solid rgba(255,255,255,0.2);
          color: rgba(255,255,255,0.85) !important;
          background: rgba(255,255,255,0.05);
          border-radius: 999px;
          padding: 8px 18px;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.3s ease;
          cursor: pointer;
          min-width: 42px;
        }
        body[data-skin="streetwear"] .variant-option:hover {
          border-color: #f5a400;
          color: #f5a400 !important;
          background: rgba(245,164,0,0.1);
        }
        body[data-skin="streetwear"] .variant-option.is-selected {
          background: #f5a400;
          border-color: #f5a400;
          color: #0a0a0a !important;
        }
        body[data-skin="streetwear"] .variant-option:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }
        body[data-skin="streetwear"] .variant-note {
          color: rgba(255,255,255,0.7) !important;
          font-size: 13px;
          margin-top: 8px;
          font-weight: 400;
        }
        /* ── "Please select a size" - FIXED ── */
        body[data-skin="streetwear"] .variant-note.needs-selection {
          color: #f5a400 !important;
          font-weight: 700;
          font-size: 14px;
          text-shadow: 0 0 20px rgba(245,164,0,0.2);
        }
        body[data-skin="streetwear"] .variant-note.is-selected {
          color: rgba(255,255,255,0.7) !important;
        }
        
        /* ── Music Section - FIXED ── */
        body[data-skin="streetwear"] .music-section {
          background: rgba(10,10,10,0.9);
          border-top: 1px solid rgba(255,255,255,0.06);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        body[data-skin="streetwear"] .music-row {
          background: rgba(20,20,20,0.95) !important;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 16px;
        }
        body[data-skin="streetwear"] .music-row h3 {
          color: #ffffff !important;
          font-weight: 700;
          font-size: 18px;
        }
        body[data-skin="streetwear"] .music-row p {
          color: rgba(255,255,255,0.8) !important;
          font-size: 14px;
        }
        body[data-skin="streetwear"] .preview-btn {
          border: 1px solid rgba(255,255,255,0.2);
          color: rgba(255,255,255,0.85) !important;
          background: rgba(255,255,255,0.05);
          border-radius: 999px;
          padding: 8px 16px;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        body[data-skin="streetwear"] .preview-btn:hover {
          background: rgba(255,255,255,0.15);
          border-color: #f5a400;
          color: #f5a400 !important;
        }
        
        /* ── Story Card / Artist World - FIXED ── */
        body[data-skin="streetwear"] .story-card {
          background: rgba(20,20,20,0.95) !important;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 28px;
        }
        body[data-skin="streetwear"] .story-card h2 {
          color: #ffffff !important;
          font-family: 'Oswald', sans-serif;
          text-transform: uppercase;
          font-size: 28px;
          font-weight: 700;
        }
        body[data-skin="streetwear"] .story-card p {
          color: rgba(255,255,255,0.85) !important;
          font-size: 15px;
          line-height: 1.6;
          font-weight: 400;
        }
        body[data-skin="streetwear"] .story-card .micro-label {
          color: #f5a400 !important;
        }
        body[data-skin="streetwear"] .social-row a {
          border: 1px solid rgba(255,255,255,0.15);
          color: rgba(255,255,255,0.8) !important;
          padding: 8px 18px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        body[data-skin="streetwear"] .social-row a:hover {
          border-color: #f5a400;
          color: #f5a400 !important;
          background: rgba(245,164,0,0.1);
        }
        body[data-skin="streetwear"] .social-row .badge {
          color: rgba(255,255,255,0.7) !important;
          border-color: rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.05);
        }
        
        /* ── "Social links coming soon" - FIXED ── */
        body[data-skin="streetwear"] .social-row .badge,
        body[data-skin="streetwear"] .social-row span.badge {
          color: rgba(255,255,255,0.8) !important;
          border-color: rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.05);
          font-weight: 600;
        }
        
        /* ── Footer ── */
        body[data-skin="streetwear"] .artist-footer {
          color: rgba(255,255,255,0.8) !important;
          border-top: 1px solid rgba(255,255,255,0.06);
          padding: 50px 0;
          background: rgba(10,10,10,0.95);
        }
        body[data-skin="streetwear"] .artist-footer strong {
          color: #ffffff !important;
        }
        body[data-skin="streetwear"] .artist-footer p {
          color: rgba(255,255,255,0.7) !important;
        }
        
        /* ── Background Pattern ── */
        body[data-skin="streetwear"] {
          background: #0a0a0a;
          background-image: 
            repeating-linear-gradient(0deg, 
              rgba(245,164,0,0.02) 0px, 
              rgba(245,164,0,0.02) 1px, 
              transparent 1px, 
              transparent 3px
            );
        }
        
        /* ── "Buy track" text - FIXED ── */
        body[data-skin="streetwear"] .player-buy {
          color: #ffffff !important;
          border: 1px solid rgba(255,255,255,0.2);
          background: rgba(255,255,255,0.05);
        }
        body[data-skin="streetwear"] .player-buy:hover {
          background: rgba(245,164,0,0.2);
          border-color: #f5a400;
          color: #f5a400 !important;
        }
        body[data-skin="streetwear"] .player-meta strong {
          color: #ffffff !important;
        }
        body[data-skin="streetwear"] .player-meta span {
          color: rgba(255,255,255,0.7) !important;
        }
        
        /* ── Floating Player ── */
        body[data-skin="streetwear"] .floating-player {
          background: rgba(10,10,10,0.95) !important;
          border: 1px solid rgba(255,255,255,0.1);
        }
        body[data-skin="streetwear"] .floating-player .player-btn {
          background: linear-gradient(135deg, #f5a400, #ff6b6b);
          color: #0a0a0a !important;
        }
        
        /* ── Cart Panel ── */
        body[data-skin="streetwear"] .cart-panel {
          background: #0a0a0a !important;
          color: #ffffff !important;
        }
        body[data-skin="streetwear"] .cart-panel h3 {
          color: #ffffff !important;
        }
        body[data-skin="streetwear"] .cart-panel .micro-label {
          color: #f5a400 !important;
        }
        body[data-skin="streetwear"] .cart-item {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 14px;
        }
        body[data-skin="streetwear"] .cart-item strong {
          color: #ffffff !important;
        }
        body[data-skin="streetwear"] .cart-item span {
          color: rgba(255,255,255,0.8) !important;
        }
        body[data-skin="streetwear"] .cart-total-row {
          border-top: 1px solid rgba(255,255,255,0.1);
          color: #ffffff !important;
          padding-top: 14px;
        }
        body[data-skin="streetwear"] .cart-total-row strong {
          color: #f5a400 !important;
        }
        body[data-skin="streetwear"] .checkout-fields input {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.1);
          color: #ffffff !important;
          border-radius: 12px;
          padding: 12px;
        }
        body[data-skin="streetwear"] .checkout-fields input::placeholder {
          color: rgba(255,255,255,0.4) !important;
        }
        body[data-skin="streetwear"] .checkout-btn {
          background: linear-gradient(135deg, #f5a400, #ff6b6b);
          color: #0a0a0a !important;
          border: none;
          border-radius: 999px;
          font-weight: 900;
          padding: 14px;
        }
        body[data-skin="streetwear"] .checkout-note {
          color: rgba(255,255,255,0.6) !important;
        }
        body[data-skin="streetwear"] .cart-close {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.1);
          color: #ffffff !important;
        }
        body[data-skin="streetwear"] .remove-item {
          color: #ff6b6b !important;
        }
        body[data-skin="streetwear"] .qty-controls button {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.1);
          color: #ffffff !important;
        }
        body[data-skin="streetwear"] .cart-empty {
          color: rgba(255,255,255,0.6) !important;
          border: 1px dashed rgba(255,255,255,0.15);
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
        background: '#0a1428',
        surface: '#0f1a2e',
        surface_light: 'rgba(255,255,255,0.08)',
        text: '#ffffff',
        text_muted: 'rgba(255,255,255,0.92)',
        text_inverse: '#0a1428',
        primary: '#e8432b',
        primary_dark: '#c0392b',
        primary_text: '#ffffff',
        secondary: '#f5c842',
        accent: '#ffffff',
        accent_2: '#f5c842',
        line: 'rgba(255,255,255,0.12)',
        glow: 'rgba(232, 67, 43, 0.3)',
        card_bg: 'rgba(15,26,46,0.95)',
        button_radius: '12px',
        card_radius: '12px',
        card_shadow: '0 10px 40px rgba(0,0,0,0.5)',
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
          background: linear-gradient(180deg, rgba(10,20,40,0.2), rgba(10,20,40,0.95)) !important; 
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
          color: #ffffff !important;
          font-weight: 400;
          text-shadow: 0 2px 20px rgba(0,0,0,0.6);
          opacity: 1 !important;
        }
        body[data-skin="sports"] .store-pill {
          background: rgba(232,67,43,0.2);
          border: 1px solid #e8432b;
          color: #f5c842 !important;
          font-weight: 700;
          padding: 6px 14px;
          border-radius: 12px;
          font-size: 11px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        body[data-skin="sports"] .micro-label {
          color: #f5c842 !important;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          font-size: 11px;
        }
        
        /* ── Navigation ── */
        body[data-skin="sports"] .store-nav { 
          background: rgba(10,20,40,0.98) !important; 
          border-bottom: 3px solid #e8432b; 
        }
        body[data-skin="sports"] .store-nav-links a {
          color: rgba(255,255,255,0.85) !important;
          transition: color 0.3s;
          font-weight: 600;
        }
        body[data-skin="sports"] .store-nav-links a:hover {
          color: #f5c842 !important;
        }
        
        /* ── Cart Button ── */
        body[data-skin="sports"] .store-cart-trigger {
          border: 1px solid rgba(255,255,255,0.2) !important;
          background: rgba(255,255,255,0.08) !important;
          color: #ffffff !important;
        }
        body[data-skin="sports"] .store-cart-trigger span {
          color: #ffffff !important;
        }
        body[data-skin="sports"] .store-cart-trigger strong {
          background: #e8432b !important;
          color: #ffffff !important;
        }
        
        /* ── Hero Buttons ── */
        body[data-skin="sports"] .hero-primary {
          background: linear-gradient(135deg, #e8432b, #c0392b);
          color: #ffffff !important;
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
          color: #ffffff !important;
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
        
        /* ── Ticker ── */
        body[data-skin="sports"] .store-ticker {
          background: linear-gradient(90deg, #e8432b, #c0392b, #e8432b);
          background-size: 200% 100%;
          animation: tickerGradient 3s ease infinite;
          color: #ffffff !important;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        body[data-skin="sports"] .store-ticker-track span {
          color: #ffffff !important;
        }
        
        /* ── Product Cards - FIXED ── */
        body[data-skin="sports"] .product-card {
          background: rgba(15,26,46,0.95) !important;
          border: 2px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 10px 40px rgba(0,0,0,0.5);
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
          color: #ffffff !important;
          font-size: 20px;
          font-weight: 900;
        }
        body[data-skin="sports"] .product-card p {
          color: rgba(255,255,255,0.85) !important;
          font-size: 14px;
          line-height: 1.5;
          font-weight: 400;
        }
        body[data-skin="sports"] .product-type {
          color: #f5c842 !important;
          font-weight: 900;
          font-size: 12px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        
        /* ── Price - FIXED ── */
        body[data-skin="sports"] .product-price {
          color: #f5c842 !important;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 24px;
          text-shadow: 0 0 20px rgba(245,200,66,0.2);
          font-weight: 900;
        }
        body[data-skin="sports"] .featured-price {
          color: #f5c842 !important;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 30px;
          text-shadow: 0 0 30px rgba(245,200,66,0.3);
          font-weight: 900;
        }
        
        /* ── Buttons ── */
        body[data-skin="sports"] .product-add {
          background: linear-gradient(135deg, #e8432b, #c0392b);
          border: none;
          color: #ffffff !important;
          text-transform: uppercase;
          font-weight: 900;
          border-radius: 12px;
          letter-spacing: 0.05em;
          box-shadow: 0 4px 20px rgba(232,67,43,0.3);
          transition: all 0.3s ease;
          padding: 12px 24px;
          font-size: 14px;
        }
        body[data-skin="sports"] .product-add:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(232,67,43,0.4);
        }
        body[data-skin="sports"] .mini-add {
          background: #e8432b;
          color: #ffffff !important;
          border: none;
          border-radius: 12px;
          padding: 8px 20px;
          font-weight: 700;
          transition: all 0.3s ease;
        }
        body[data-skin="sports"] .mini-add:hover {
          background: #c0392b;
          transform: scale(1.05);
        }
        
        /* ── Grid ── */
        body[data-skin="sports"] .product-grid {
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }
        
        /* ── Badges ── */
        body[data-skin="sports"] .badge {
          color: rgba(255,255,255,0.85) !important;
          border-color: rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.05);
        }
        body[data-skin="sports"] .badge.hot {
          background: #e8432b;
          color: #ffffff !important;
          border: none;
        }
        
        /* ── Section Titles ── */
        body[data-skin="sports"] .section-intro h2 {
          font-family: 'Bebas Neue', sans-serif;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #ffffff !important;
          font-weight: 900;
        }
        body[data-skin="sports"] .section-intro p {
          color: rgba(255,255,255,0.85) !important;
          font-weight: 400;
        }
        
        /* ── Featured Product - FIXED ── */
        body[data-skin="sports"] .featured-card {
          background: rgba(15,26,46,0.95) !important;
          border: 2px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          overflow: hidden;
        }
        body[data-skin="sports"] .featured-info h3 {
          color: #ffffff !important;
          font-family: 'Bebas Neue', sans-serif;
          text-transform: uppercase;
          font-size: 32px;
          font-weight: 900;
        }
        body[data-skin="sports"] .featured-info p {
          color: rgba(255,255,255,0.85) !important;
          font-size: 15px;
          line-height: 1.5;
          font-weight: 400;
        }
        body[data-skin="sports"] .featured-badges .badge {
          color: rgba(255,255,255,0.85) !important;
        }
        
        /* ── Variant Selector - FIXED ── */
        body[data-skin="sports"] .variant-block {
          margin: 14px 0 8px 0;
        }
        body[data-skin="sports"] .variant-label {
          color: rgba(255,255,255,0.85) !important;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        body[data-skin="sports"] .variant-options {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        body[data-skin="sports"] .variant-option {
          border: 1px solid rgba(255,255,255,0.2);
          color: rgba(255,255,255,0.85) !important;
          background: rgba(255,255,255,0.05);
          border-radius: 12px;
          padding: 8px 18px;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.3s ease;
          cursor: pointer;
          min-width: 42px;
        }
        body[data-skin="sports"] .variant-option:hover {
          border-color: #e8432b;
          color: #e8432b !important;
          background: rgba(232,67,43,0.1);
        }
        body[data-skin="sports"] .variant-option.is-selected {
          background: #e8432b;
          border-color: #e8432b;
          color: #ffffff !important;
        }
        body[data-skin="sports"] .variant-option:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }
        body[data-skin="sports"] .variant-note {
          color: rgba(255,255,255,0.7) !important;
          font-size: 13px;
          margin-top: 8px;
          font-weight: 400;
        }
        /* ── "Please select a size" - FIXED ── */
        body[data-skin="sports"] .variant-note.needs-selection {
          color: #f5c842 !important;
          font-weight: 700;
          font-size: 14px;
          text-shadow: 0 0 20px rgba(245,200,66,0.2);
        }
        body[data-skin="sports"] .variant-note.is-selected {
          color: rgba(255,255,255,0.7) !important;
        }
        
        /* ── Music Section - FIXED ── */
        body[data-skin="sports"] .music-section {
          background: rgba(10,20,40,0.9);
          border-top: 1px solid rgba(255,255,255,0.06);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        body[data-skin="sports"] .music-row {
          background: rgba(15,26,46,0.95) !important;
          border: 2px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          padding: 16px;
        }
        body[data-skin="sports"] .music-row h3 {
          color: #ffffff !important;
          font-weight: 700;
          font-size: 18px;
        }
        body[data-skin="sports"] .music-row p {
          color: rgba(255,255,255,0.8) !important;
          font-size: 14px;
        }
        body[data-skin="sports"] .preview-btn {
          border: 1px solid rgba(255,255,255,0.2);
          color: rgba(255,255,255,0.85) !important;
          background: rgba(255,255,255,0.05);
          border-radius: 12px;
          padding: 8px 16px;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        body[data-skin="sports"] .preview-btn:hover {
          background: rgba(255,255,255,0.15);
          border-color: #e8432b;
          color: #e8432b !important;
        }
        
        /* ── Story Card / Artist World - FIXED ── */
        body[data-skin="sports"] .story-card {
          background: rgba(15,26,46,0.95) !important;
          border: 2px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 28px;
        }
        body[data-skin="sports"] .story-card h2 {
          color: #ffffff !important;
          font-family: 'Bebas Neue', sans-serif;
          text-transform: uppercase;
          font-size: 28px;
          font-weight: 900;
        }
        body[data-skin="sports"] .story-card p {
          color: rgba(255,255,255,0.85) !important;
          font-size: 15px;
          line-height: 1.6;
          font-weight: 400;
        }
        body[data-skin="sports"] .story-card .micro-label {
          color: #f5c842 !important;
        }
        body[data-skin="sports"] .social-row a {
          border: 1px solid rgba(255,255,255,0.15);
          color: rgba(255,255,255,0.8) !important;
          padding: 8px 18px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        body[data-skin="sports"] .social-row a:hover {
          border-color: #e8432b;
          color: #e8432b !important;
          background: rgba(232,67,43,0.1);
        }
        body[data-skin="sports"] .social-row .badge {
          color: rgba(255,255,255,0.7) !important;
          border-color: rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.05);
        }
        
        /* ── "Social links coming soon" - FIXED ── */
        body[data-skin="sports"] .social-row .badge,
        body[data-skin="sports"] .social-row span.badge {
          color: rgba(255,255,255,0.8) !important;
          border-color: rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.05);
          font-weight: 600;
        }
        
        /* ── Footer ── */
        body[data-skin="sports"] .artist-footer {
          color: rgba(255,255,255,0.8) !important;
          border-top: 1px solid rgba(255,255,255,0.06);
          padding: 50px 0;
          background: rgba(10,20,40,0.95);
        }
        body[data-skin="sports"] .artist-footer strong {
          color: #ffffff !important;
        }
        body[data-skin="sports"] .artist-footer p {
          color: rgba(255,255,255,0.7) !important;
        }
        body[data-skin="sports"] .artist-footer .footer-logo {
          filter: brightness(1.2);
        }
        
        /* ── Background Pattern ── */
        body[data-skin="sports"] {
          background: #0a1428;
          background-image: 
            radial-gradient(circle at 80% 20%, rgba(232,67,43,0.05) 0%, transparent 50%),
            radial-gradient(circle at 20% 80%, rgba(232,67,43,0.03) 0%, transparent 50%);
        }
        
        /* ── "Buy track" text - FIXED ── */
        body[data-skin="sports"] .player-buy {
          color: #ffffff !important;
          border: 1px solid rgba(255,255,255,0.2);
          background: rgba(255,255,255,0.05);
        }
        body[data-skin="sports"] .player-buy:hover {
          background: rgba(232,67,43,0.2);
          border-color: #e8432b;
          color: #e8432b !important;
        }
        body[data-skin="sports"] .player-meta strong {
          color: #ffffff !important;
        }
        body[data-skin="sports"] .player-meta span {
          color: rgba(255,255,255,0.7) !important;
        }
        
        /* ── Floating Player ── */
        body[data-skin="sports"] .floating-player {
          background: rgba(10,20,40,0.95) !important;
          border: 1px solid rgba(255,255,255,0.1);
        }
        body[data-skin="sports"] .floating-player .player-btn {
          background: #e8432b;
          color: #ffffff !important;
        }
        
        /* ── Cart Panel ── */
        body[data-skin="sports"] .cart-panel {
          background: #0a1428 !important;
          color: #ffffff !important;
        }
        body[data-skin="sports"] .cart-panel h3 {
          color: #ffffff !important;
        }
        body[data-skin="sports"] .cart-panel .micro-label {
          color: #f5c842 !important;
        }
        body[data-skin="sports"] .cart-item {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 14px;
        }
        body[data-skin="sports"] .cart-item strong {
          color: #ffffff !important;
        }
        body[data-skin="sports"] .cart-item span {
          color: rgba(255,255,255,0.8) !important;
        }
        body[data-skin="sports"] .cart-total-row {
          border-top: 1px solid rgba(255,255,255,0.1);
          color: #ffffff !important;
          padding-top: 14px;
        }
        body[data-skin="sports"] .cart-total-row strong {
          color: #f5c842 !important;
        }
        body[data-skin="sports"] .checkout-fields input {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.1);
          color: #ffffff !important;
          border-radius: 12px;
          padding: 12px;
        }
        body[data-skin="sports"] .checkout-fields input::placeholder {
          color: rgba(255,255,255,0.4) !important;
        }
        body[data-skin="sports"] .checkout-btn {
          background: linear-gradient(135deg, #e8432b, #c0392b);
          color: #ffffff !important;
          border: none;
          border-radius: 12px;
          font-weight: 900;
          padding: 14px;
        }
        body[data-skin="sports"] .checkout-note {
          color: rgba(255,255,255,0.6) !important;
        }
        body[data-skin="sports"] .cart-close {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.1);
          color: #ffffff !important;
        }
        body[data-skin="sports"] .remove-item {
          color: #e8432b !important;
        }
        body[data-skin="sports"] .qty-controls button {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.1);
          color: #ffffff !important;
        }
        body[data-skin="sports"] .cart-empty {
          color: rgba(255,255,255,0.6) !important;
          border: 1px dashed rgba(255,255,255,0.15);
        }
      `
    },
    
    // ── LUXURY SKIN ──
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
        text_muted: 'rgba(245,240,235,0.92)',
        text_inverse: '#0d0b0a',
        primary: '#c9a84c',
        primary_dark: '#a8893a',
        primary_text: '#0d0b0a',
        secondary: '#d4b87a',
        accent: '#e8d5a3',
        accent_2: '#c9a84c',
        line: 'rgba(201,168,76,0.12)',
        glow: 'rgba(201, 168, 76, 0.2)',
        card_bg: 'rgba(26,23,21,0.95)',
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
        body[data-skin="luxury"] .experience-hero { min-height: 720px; }
        body[data-skin="luxury"] .hero-overlay { 
          background: linear-gradient(180deg, rgba(13,11,10,0.2), rgba(13,11,10,0.95)) !important; 
        }
        body[data-skin="luxury"] .hero-copy h1 {
          font-family: 'Playfair Display', serif;
          font-weight: 300;
          letter-spacing: 0.02em;
          color: #f5f0eb !important;
          text-shadow: 0 4px 60px rgba(201,168,76,0.1);
        }
        body[data-skin="luxury"] .hero-copy p { 
          color: #f5f0eb !important;
          font-weight: 300;
          text-shadow: 0 2px 20px rgba(0,0,0,0.6);
          opacity: 1 !important;
        }
        body[data-skin="luxury"] .store-pill {
          border: 1px solid rgba(201,168,76,0.3);
          color: #c9a84c !important;
          background: rgba(201,168,76,0.05);
          font-weight: 600;
          padding: 6px 14px;
          border-radius: 999px;
          font-size: 11px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        body[data-skin="luxury"] .micro-label {
          color: #c9a84c !important;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          font-size: 11px;
        }
        body[data-skin="luxury"] .store-nav { 
          background: rgba(13,11,10,0.98) !important; 
          border-bottom: 1px solid rgba(201,168,76,0.15); 
        }
        body[data-skin="luxury"] .store-nav-links a {
          color: rgba(245,240,235,0.85) !important;
          transition: color 0.3s;
        }
        body[data-skin="luxury"] .store-nav-links a:hover {
          color: #c9a84c !important;
        }
        body[data-skin="luxury"] .store-cart-trigger {
          border: 1px solid rgba(201,168,76,0.2) !important;
          background: rgba(201,168,76,0.05) !important;
          color: #f5f0eb !important;
        }
        body[data-skin="luxury"] .store-cart-trigger span {
          color: #f5f0eb !important;
        }
        body[data-skin="luxury"] .store-cart-trigger strong {
          background: #c9a84c !important;
          color: #0d0b0a !important;
        }
        body[data-skin="luxury"] .hero-primary {
          background: #c9a84c;
          color: #0d0b0a !important;
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
          color: #f5f0eb !important;
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
        body[data-skin="luxury"] .store-ticker {
          background: transparent;
          color: #f5f0eb !important;
          border-top: 1px solid rgba(201,168,76,0.1);
          border-bottom: 1px solid rgba(201,168,76,0.1);
        }
        body[data-skin="luxury"] .store-ticker-track span {
          color: #f5f0eb !important;
        }
        body[data-skin="luxury"] .product-card {
          background: rgba(26,23,21,0.95) !important;
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
          color: #f5f0eb !important;
        }
        body[data-skin="luxury"] .product-card p {
          color: rgba(245,240,235,0.85) !important;
        }
        body[data-skin="luxury"] .product-type {
          color: #c9a84c !important;
          font-weight: 600;
          letter-spacing: 0.1em;
          font-size: 12px;
        }
        body[data-skin="luxury"] .product-price {
          color: #c9a84c !important;
          font-size: 28px;
          font-weight: 300;
          text-shadow: 0 0 30px rgba(201,168,76,0.2);
        }
        body[data-skin="luxury"] .featured-price {
          color: #c9a84c !important;
          font-size: 34px;
          font-weight: 300;
          text-shadow: 0 0 40px rgba(201,168,76,0.3);
        }
        body[data-skin="luxury"] .product-add {
          background: #c9a84c;
          border: none;
          color: #0d0b0a !important;
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
        body[data-skin="luxury"] .product-grid {
          grid-template-columns: repeat(2, 1fr);
          gap: 32px;
        }
        body[data-skin="luxury"] .badge {
          color: rgba(245,240,235,0.85) !important;
          border-color: rgba(201,168,76,0.15);
          background: rgba(201,168,76,0.05);
        }
        body[data-skin="luxury"] .badge.hot {
          background: #c9a84c;
          color: #0d0b0a !important;
          border: none;
        }
        body[data-skin="luxury"] .section-intro h2 {
          font-family: 'Playfair Display', serif;
          font-weight: 300;
          letter-spacing: 0.02em;
          color: #f5f0eb !important;
        }
        body[data-skin="luxury"] .section-intro p {
          color: rgba(245,240,235,0.85) !important;
        }
        body[data-skin="luxury"] .featured-card {
          background: rgba(26,23,21,0.95) !important;
          border: 1px solid rgba(201,168,76,0.08);
          border-radius: 24px;
          overflow: hidden;
        }
        body[data-skin="luxury"] .featured-info h3 {
          color: #f5f0eb !important;
          font-family: 'Playfair Display', serif;
          font-weight: 300;
          font-size: 32px;
        }
        body[data-skin="luxury"] .featured-info p {
          color: rgba(245,240,235,0.85) !important;
        }
        body[data-skin="luxury"] .variant-block {
          margin: 14px 0 8px 0;
        }
        body[data-skin="luxury"] .variant-label {
          color: rgba(245,240,235,0.85) !important;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        body[data-skin="luxury"] .variant-options {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        body[data-skin="luxury"] .variant-option {
          border: 1px solid rgba(201,168,76,0.2);
          color: rgba(245,240,235,0.85) !important;
          background: rgba(201,168,76,0.05);
          border-radius: 999px;
          padding: 8px 18px;
          font-weight: 500;
          font-size: 14px;
          transition: all 0.4s ease;
          cursor: pointer;
          min-width: 42px;
        }
        body[data-skin="luxury"] .variant-option:hover {
          border-color: rgba(201,168,76,0.4);
          color: #c9a84c !important;
        }
        body[data-skin="luxury"] .variant-option.is-selected {
          background: #c9a84c;
          border-color: #c9a84c;
          color: #0d0b0a !important;
        }
        body[data-skin="luxury"] .variant-option:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }
        body[data-skin="luxury"] .variant-note {
          color: rgba(245,240,235,0.7) !important;
          font-size: 13px;
          margin-top: 8px;
          font-weight: 400;
        }
        body[data-skin="luxury"] .variant-note.needs-selection {
          color: #c9a84c !important;
          font-weight: 600;
          font-size: 14px;
          text-shadow: 0 0 20px rgba(201,168,76,0.2);
        }
        body[data-skin="luxury"] .variant-note.is-selected {
          color: rgba(245,240,235,0.7) !important;
        }
        body[data-skin="luxury"] .music-section {
          background: rgba(26,23,21,0.6);
        }
        body[data-skin="luxury"] .music-row {
          background: rgba(26,23,21,0.95) !important;
          border: 1px solid rgba(201,168,76,0.08);
          border-radius: 20px;
          padding: 16px;
          transition: all 0.4s ease;
        }
        body[data-skin="luxury"] .music-row:hover {
          border-color: rgba(201,168,76,0.2);
        }
        body[data-skin="luxury"] .music-row h3 {
          color: #f5f0eb !important;
          font-weight: 400;
        }
        body[data-skin="luxury"] .music-row p {
          color: rgba(245,240,235,0.8) !important;
        }
        body[data-skin="luxury"] .preview-btn {
          border: 1px solid rgba(201,168,76,0.2);
          color: rgba(245,240,235,0.85) !important;
          background: rgba(201,168,76,0.05);
          border-radius: 999px;
          padding: 8px 16px;
          font-weight: 500;
          transition: all 0.4s ease;
        }
        body[data-skin="luxury"] .preview-btn:hover {
          background: rgba(201,168,76,0.1);
          border-color: #c9a84c;
          color: #c9a84c !important;
        }
        body[data-skin="luxury"] .mini-add {
          background: #c9a84c;
          color: #0d0b0a !important;
          border: none;
          border-radius: 999px;
          padding: 8px 20px;
          font-weight: 700;
          transition: all 0.4s ease;
        }
        body[data-skin="luxury"] .mini-add:hover {
          background: #d4b87a;
          transform: scale(1.05);
        }
        body[data-skin="luxury"] .story-card {
          background: rgba(26,23,21,0.95) !important;
          border: 1px solid rgba(201,168,76,0.08);
          border-radius: 24px;
          padding: 28px;
          transition: all 0.4s ease;
        }
        body[data-skin="luxury"] .story-card:hover {
          border-color: rgba(201,168,76,0.2);
        }
        body[data-skin="luxury"] .story-card h2 {
          color: #f5f0eb !important;
          font-family: 'Playfair Display', serif;
          font-weight: 300;
          font-size: 28px;
        }
        body[data-skin="luxury"] .story-card p {
          color: rgba(245,240,235,0.85) !important;
        }
        body[data-skin="luxury"] .social-row a {
          border: 1px solid rgba(201,168,76,0.15);
          color: rgba(245,240,235,0.8) !important;
          padding: 8px 18px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 500;
          transition: all 0.4s ease;
        }
        body[data-skin="luxury"] .social-row a:hover {
          border-color: #c9a84c;
          color: #c9a84c !important;
          background: rgba(201,168,76,0.05);
        }
        body[data-skin="luxury"] .social-row .badge {
          color: rgba(245,240,235,0.7) !important;
          border-color: rgba(201,168,76,0.12);
          background: rgba(201,168,76,0.05);
        }
        body[data-skin="luxury"] .artist-footer {
          color: rgba(245,240,235,0.8) !important;
          border-top: 1px solid rgba(201,168,76,0.08);
          padding: 50px 0;
          background: rgba(13,11,10,0.95);
        }
        body[data-skin="luxury"] .artist-footer strong {
          color: #f5f0eb !important;
        }
        body[data-skin="luxury"] .artist-footer p {
          color: rgba(245,240,235,0.7) !important;
        }
        body[data-skin="luxury"] {
          background: #0d0b0a;
          background-image: 
            repeating-linear-gradient(45deg, 
              rgba(201,168,76,0.02) 0px, 
              rgba(201,168,76,0.02) 2px, 
              transparent 2px, 
              transparent 4px
            );
        }
        body[data-skin="luxury"] .player-buy {
          color: #f5f0eb !important;
          border: 1px solid rgba(201,168,76,0.2);
          background: rgba(201,168,76,0.05);
        }
        body[data-skin="luxury"] .player-buy:hover {
          background: rgba(201,168,76,0.15);
          border-color: #c9a84c;
          color: #c9a84c !important;
        }
        body[data-skin="luxury"] .player-meta strong {
          color: #f5f0eb !important;
        }
        body[data-skin="luxury"] .player-meta span {
          color: rgba(245,240,235,0.7) !important;
        }
        body[data-skin="luxury"] .floating-player {
          background: rgba(13,11,10,0.95) !important;
          border: 1px solid rgba(201,168,76,0.1);
        }
        body[data-skin="luxury"] .floating-player .player-btn {
          background: #c9a84c;
          color: #0d0b0a !important;
        }
        body[data-skin="luxury"] .cart-panel {
          background: #1a1715 !important;
          color: #f5f0eb !important;
        }
        body[data-skin="luxury"] .cart-panel h3 {
          color: #f5f0eb !important;
        }
        body[data-skin="luxury"] .cart-panel .micro-label {
          color: #c9a84c !important;
        }
        body[data-skin="luxury"] .cart-item {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(201,168,76,0.08);
          border-radius: 16px;
          padding: 14px;
        }
        body[data-skin="luxury"] .cart-item strong {
          color: #f5f0eb !important;
        }
        body[data-skin="luxury"] .cart-item span {
          color: rgba(245,240,235,0.8) !important;
        }
        body[data-skin="luxury"] .cart-total-row {
          border-top: 1px solid rgba(201,168,76,0.1);
          color: #f5f0eb !important;
          padding-top: 14px;
        }
        body[data-skin="luxury"] .cart-total-row strong {
          color: #c9a84c !important;
        }
        body[data-skin="luxury"] .checkout-fields input {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(201,168,76,0.1);
          color: #f5f0eb !important;
          border-radius: 999px;
          padding: 12px;
        }
        body[data-skin="luxury"] .checkout-fields input::placeholder {
          color: rgba(245,240,235,0.4) !important;
        }
        body[data-skin="luxury"] .checkout-btn {
          background: #c9a84c;
          color: #0d0b0a !important;
          border: none;
          border-radius: 999px;
          font-weight: 700;
          padding: 14px;
        }
        body[data-skin="luxury"] .checkout-note {
          color: rgba(245,240,235,0.6) !important;
        }
        body[data-skin="luxury"] .cart-close {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(201,168,76,0.1);
          color: #f5f0eb !important;
        }
        body[data-skin="luxury"] .remove-item {
          color: #c9a84c !important;
        }
        body[data-skin="luxury"] .qty-controls button {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(201,168,76,0.1);
          color: #f5f0eb !important;
        }
        body[data-skin="luxury"] .cart-empty {
          color: rgba(245,240,235,0.6) !important;
          border: 1px dashed rgba(201,168,76,0.15);
        }
      `
    },
    
    // ── CORPORATE SKIN ──
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
        text_muted: 'rgba(26,26,26,0.85)',
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
        body[data-skin="corporate"] .experience-hero { min-height: 560px; }
        body[data-skin="corporate"] .hero-overlay { 
          background: linear-gradient(180deg, rgba(248,246,243,0.2), rgba(248,246,243,0.92)) !important; 
        }
        body[data-skin="corporate"] .hero-copy h1 {
          font-family: 'Inter', sans-serif;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: #1a1a1a !important;
        }
        body[data-skin="corporate"] .hero-copy p { 
          color: rgba(26,26,26,0.85) !important;
          font-weight: 400;
        }
        body[data-skin="corporate"] .store-pill {
          border: 1px solid rgba(26,60,52,0.2);
          color: #1a3c34 !important;
          background: rgba(26,60,52,0.05);
          font-weight: 600;
          padding: 6px 14px;
          border-radius: 8px;
          font-size: 11px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        body[data-skin="corporate"] .micro-label {
          color: #1a3c34 !important;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          font-size: 11px;
        }
        body[data-skin="corporate"] .store-nav { 
          background: rgba(248,246,243,0.98) !important; 
          border-bottom: 2px solid #1a3c34; 
        }
        body[data-skin="corporate"] .store-nav-links a {
          color: rgba(26,26,26,0.8) !important;
          transition: color 0.3s;
          font-weight: 600;
        }
        body[data-skin="corporate"] .store-nav-links a:hover {
          color: #1a3c34 !important;
        }
        body[data-skin="corporate"] .store-cart-trigger {
          border: 1px solid rgba(26,26,26,0.15) !important;
          background: rgba(26,26,26,0.03) !important;
          color: #1a1a1a !important;
        }
        body[data-skin="corporate"] .store-cart-trigger span {
          color: #1a1a1a !important;
        }
        body[data-skin="corporate"] .store-cart-trigger strong {
          background: #1a3c34 !important;
          color: #ffffff !important;
        }
        body[data-skin="corporate"] .hero-primary {
          background: #1a3c34;
          color: #ffffff !important;
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
          color: #1a1a1a !important;
          border-radius: 8px;
          background: transparent;
          padding: 14px 32px;
          transition: all 0.3s ease;
        }
        body[data-skin="corporate"] .hero-secondary:hover {
          background: rgba(26,26,26,0.04);
          border-color: rgba(26,26,26,0.3);
        }
        body[data-skin="corporate"] .store-ticker {
          background: #1a3c34;
          color: #ffffff !important;
          font-weight: 600;
        }
        body[data-skin="corporate"] .store-ticker-track span {
          color: #ffffff !important;
        }
        body[data-skin="corporate"] .product-card {
          background: #ffffff !important;
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
          color: #1a1a1a !important;
          font-weight: 700;
        }
        body[data-skin="corporate"] .product-card p {
          color: rgba(26,26,26,0.8) !important;
        }
        body[data-skin="corporate"] .product-type {
          color: #1a3c34 !important;
          font-weight: 600;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        body[data-skin="corporate"] .product-price {
          color: #1a3c34 !important;
          font-weight: 700;
          font-size: 20px;
        }
        body[data-skin="corporate"] .featured-price {
          color: #1a3c34 !important;
          font-weight: 700;
          font-size: 26px;
        }
        body[data-skin="corporate"] .product-add {
          background: #1a3c34;
          border: none;
          color: #ffffff !important;
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
        body[data-skin="corporate"] .mini-add {
          background: #1a3c34;
          color: #ffffff !important;
          border: none;
          border-radius: 8px;
          padding: 8px 20px;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        body[data-skin="corporate"] .mini-add:hover {
          background: #0f2a24;
        }
        body[data-skin="corporate"] .product-grid {
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        body[data-skin="corporate"] .badge {
          color: rgba(26,26,26,0.8) !important;
          border-color: rgba(26,26,26,0.1);
          background: rgba(26,26,26,0.03);
        }
        body[data-skin="corporate"] .badge.hot {
          background: #1a3c34;
          color: #ffffff !important;
          border: none;
        }
        body[data-skin="corporate"] .section-intro h2 {
          font-family: 'Inter', sans-serif;
          font-weight: 700;
          color: #1a1a1a !important;
        }
        body[data-skin="corporate"] .section-intro p {
          color: rgba(26,26,26,0.8) !important;
        }
        body[data-skin="corporate"] .featured-card {
          background: #ffffff !important;
          border: 1px solid rgba(26,26,26,0.06);
          border-radius: 8px;
          overflow: hidden;
        }
        body[data-skin="corporate"] .featured-info h3 {
          color: #1a1a1a !important;
          font-weight: 700;
        }
        body[data-skin="corporate"] .featured-info p {
          color: rgba(26,26,26,0.8) !important;
        }
        body[data-skin="corporate"] .variant-block {
          margin: 14px 0 8px 0;
        }
        body[data-skin="corporate"] .variant-label {
          color: rgba(26,26,26,0.7) !important;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        body[data-skin="corporate"] .variant-options {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        body[data-skin="corporate"] .variant-option {
          border: 1px solid rgba(26,26,26,0.15);
          color: rgba(26,26,26,0.85) !important;
          background: transparent;
          border-radius: 8px;
          padding: 8px 18px;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.3s ease;
          cursor: pointer;
          min-width: 42px;
        }
        body[data-skin="corporate"] .variant-option:hover {
          background: rgba(26,26,26,0.04);
          border-color: #1a3c34;
        }
        body[data-skin="corporate"] .variant-option.is-selected {
          background: #1a3c34;
          border-color: #1a3c34;
          color: #ffffff !important;
        }
        body[data-skin="corporate"] .variant-option:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }
        body[data-skin="corporate"] .variant-note {
          color: rgba(26,26,26,0.6) !important;
          font-size: 13px;
          margin-top: 8px;
          font-weight: 400;
        }
        body[data-skin="corporate"] .variant-note.needs-selection {
          color: #1a3c34 !important;
          font-weight: 600;
          font-size: 14px;
        }
        body[data-skin="corporate"] .variant-note.is-selected {
          color: rgba(26,26,26,0.6) !important;
        }
        body[data-skin="corporate"] .music-section {
          background: #f0eeea;
        }
        body[data-skin="corporate"] .music-row {
          background: #ffffff !important;
          border: 1px solid rgba(26,26,26,0.06);
          border-radius: 8px;
          padding: 16px;
        }
        body[data-skin="corporate"] .music-row h3 {
          color: #1a1a1a !important;
        }
        body[data-skin="corporate"] .music-row p {
          color: rgba(26,26,26,0.7) !important;
        }
        body[data-skin="corporate"] .preview-btn {
          border: 1px solid rgba(26,26,26,0.1);
          color: rgba(26,26,26,0.8) !important;
          background: transparent;
          border-radius: 8px;
          padding: 8px 16px;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        body[data-skin="corporate"] .preview-btn:hover {
          background: rgba(26,26,26,0.04);
          border-color: #1a3c34;
        }
        body[data-skin="corporate"] .story-card {
          background: #ffffff !important;
          border: 1px solid rgba(26,26,26,0.06);
          border-radius: 8px;
          padding: 28px;
        }
        body[data-skin="corporate"] .story-card h2 {
          color: #1a1a1a !important;
        }
        body[data-skin="corporate"] .story-card p {
          color: rgba(26,26,26,0.8) !important;
        }
        body[data-skin="corporate"] .social-row a {
          border: 1px solid rgba(26,26,26,0.1);
          color: rgba(26,26,26,0.8) !important;
          padding: 8px 18px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        body[data-skin="corporate"] .social-row a:hover {
          border-color: #1a3c34;
          color: #1a3c34 !important;
          background: rgba(26,60,52,0.05);
        }
        body[data-skin="corporate"] .social-row .badge {
          color: rgba(26,26,26,0.7) !important;
          border-color: rgba(26,26,26,0.08);
          background: rgba(26,26,26,0.02);
        }
        body[data-skin="corporate"] .artist-footer {
          color: rgba(26,26,26,0.8) !important;
          border-top: 1px solid rgba(26,26,26,0.06);
          padding: 50px 0;
          background: #f8f6f3;
        }
        body[data-skin="corporate"] .artist-footer strong {
          color: #1a1a1a !important;
        }
        body[data-skin="corporate"] .artist-footer p {
          color: rgba(26,26,26,0.7) !important;
        }
        body[data-skin="corporate"] .player-buy {
          color: #1a1a1a !important;
          border: 1px solid rgba(26,26,26,0.15);
          background: transparent;
        }
        body[data-skin="corporate"] .player-buy:hover {
          background: rgba(26,60,52,0.05);
          border-color: #1a3c34;
          color: #1a3c34 !important;
        }
        body[data-skin="corporate"] .player-meta strong {
          color: #1a1a1a !important;
        }
        body[data-skin="corporate"] .player-meta span {
          color: rgba(26,26,26,0.7) !important;
        }
        body[data-skin="corporate"] .floating-player {
          background: rgba(248,246,243,0.95) !important;
          border: 1px solid rgba(26,26,26,0.1);
        }
        body[data-skin="corporate"] .floating-player .player-btn {
          background: #1a3c34;
          color: #ffffff !important;
        }
        body[data-skin="corporate"] .cart-panel {
          background: #ffffff !important;
          color: #1a1a1a !important;
        }
        body[data-skin="corporate"] .cart-panel h3 {
          color: #1a1a1a !important;
        }
        body[data-skin="corporate"] .cart-item {
          background: rgba(26,26,26,0.02);
          border: 1px solid rgba(26,26,26,0.06);
          border-radius: 8px;
          padding: 14px;
        }
        body[data-skin="corporate"] .cart-item strong {
          color: #1a1a1a !important;
        }
        body[data-skin="corporate"] .cart-total-row {
          border-top: 1px solid rgba(26,26,26,0.08);
          color: #1a1a1a !important;
          padding-top: 14px;
        }
        body[data-skin="corporate"] .cart-total-row strong {
          color: #1a3c34 !important;
        }
        body[data-skin="corporate"] .checkout-fields input {
          background: rgba(26,26,26,0.03);
          border: 1px solid rgba(26,26,26,0.1);
          color: #1a1a1a !important;
          border-radius: 8px;
          padding: 12px;
        }
        body[data-skin="corporate"] .checkout-btn {
          background: #1a3c34;
          color: #ffffff !important;
          border: none;
          border-radius: 8px;
          font-weight: 700;
          padding: 14px;
        }
        body[data-skin="corporate"] .checkout-note {
          color: rgba(26,26,26,0.6) !important;
        }
        body[data-skin="corporate"] .cart-close {
          background: rgba(26,26,26,0.03);
          border: 1px solid rgba(26,26,26,0.08);
          color: #1a1a1a !important;
        }
        body[data-skin="corporate"] .remove-item {
          color: #c0392b !important;
        }
        body[data-skin="corporate"] .qty-controls button {
          background: rgba(26,26,26,0.03);
          border: 1px solid rgba(26,26,26,0.08);
          color: #1a1a1a !important;
        }
        body[data-skin="corporate"] .cart-empty {
          color: rgba(26,26,26,0.6) !important;
          border: 1px dashed rgba(26,26,26,0.1);
        }
      `
    },
    
    // ── EARTHY/NATURAL SKIN ──
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
        text_muted: 'rgba(45,42,36,0.85)',
        text_inverse: '#ffffff',
        primary: '#6b8f71',
        primary_dark: '#4d6b52',
        primary_text: '#ffffff',
        secondary: '#8faa8b',
        accent: '#b8966a',
        accent_2: '#6b8f71',
        line: 'rgba(107,143,113,0.15)',
        glow: 'rgba(107, 143, 113, 0.1)',
        card_bg: 'rgba(255,255,255,0.9)',
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
        body[data-skin="earthy_natural"] .experience-hero { min-height: 600px; }
        body[data-skin="earthy_natural"] .hero-overlay { 
          background: linear-gradient(180deg, rgba(245,240,235,0.2), rgba(245,240,235,0.92)) !important; 
        }
        body[data-skin="earthy_natural"] .hero-copy h1 {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 400;
          color: #2d2a24 !important;
        }
        body[data-skin="earthy_natural"] .hero-copy p { 
          color: rgba(45,42,36,0.85) !important;
          font-weight: 400;
        }
        body[data-skin="earthy_natural"] .store-pill {
          border: 1px solid rgba(107,143,113,0.3);
          color: #6b8f71 !important;
          background: rgba(107,143,113,0.05);
          font-weight: 600;
          padding: 6px 14px;
          border-radius: 999px;
          font-size: 11px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        body[data-skin="earthy_natural"] .micro-label {
          color: #6b8f71 !important;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          font-size: 11px;
        }
        body[data-skin="earthy_natural"] .store-nav { 
          background: rgba(245,240,235,0.98) !important; 
          border-bottom: 2px solid #6b8f71; 
        }
        body[data-skin="earthy_natural"] .store-nav-links a {
          color: rgba(45,42,36,0.8) !important;
          transition: color 0.3s;
        }
        body[data-skin="earthy_natural"] .store-nav-links a:hover {
          color: #6b8f71 !important;
        }
        body[data-skin="earthy_natural"] .store-cart-trigger {
          border: 1px solid rgba(107,143,113,0.2) !important;
          background: rgba(107,143,113,0.05) !important;
          color: #2d2a24 !important;
        }
        body[data-skin="earthy_natural"] .store-cart-trigger span {
          color: #2d2a24 !important;
        }
        body[data-skin="earthy_natural"] .store-cart-trigger strong {
          background: #6b8f71 !important;
          color: #ffffff !important;
        }
        body[data-skin="earthy_natural"] .hero-primary {
          background: #6b8f71;
          color: #ffffff !important;
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
          color: #2d2a24 !important;
          border-radius: 999px;
          background: transparent;
          padding: 14px 32px;
          transition: all 0.3s ease;
        }
        body[data-skin="earthy_natural"] .hero-secondary:hover {
          background: rgba(107,143,113,0.05);
          border-color: #6b8f71;
        }
        body[data-skin="earthy_natural"] .store-ticker {
          background: #6b8f71;
          color: #ffffff !important;
          font-weight: 500;
        }
        body[data-skin="earthy_natural"] .store-ticker-track span {
          color: #ffffff !important;
        }
        body[data-skin="earthy_natural"] .product-card {
          background: rgba(255,255,255,0.9) !important;
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
          color: #2d2a24 !important;
        }
        body[data-skin="earthy_natural"] .product-card p {
          color: rgba(45,42,36,0.8) !important;
        }
        body[data-skin="earthy_natural"] .product-type {
          color: #6b8f71 !important;
          font-weight: 600;
        }
        body[data-skin="earthy_natural"] .product-price {
          color: #6b8f71 !important;
          font-weight: 600;
          font-size: 20px;
        }
        body[data-skin="earthy_natural"] .featured-price {
          color: #6b8f71 !important;
          font-weight: 600;
          font-size: 26px;
        }
        body[data-skin="earthy_natural"] .product-add {
          background: #6b8f71;
          border: none;
          color: #ffffff !important;
          border-radius: 999px;
          padding: 10px 20px;
          transition: all 0.3s ease;
        }
        body[data-skin="earthy_natural"] .product-add:hover {
          background: #4d6b52;
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(107,143,113,0.3);
        }
        body[data-skin="earthy_natural"] .mini-add {
          background: #6b8f71;
          color: #ffffff !important;
          border: none;
          border-radius: 999px;
          padding: 8px 20px;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        body[data-skin="earthy_natural"] .mini-add:hover {
          background: #4d6b52;
        }
        body[data-skin="earthy_natural"] .product-grid {
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        body[data-skin="earthy_natural"] .badge {
          color: rgba(45,42,36,0.8) !important;
          border-color: rgba(107,143,113,0.2);
          background: rgba(107,143,113,0.05);
        }
        body[data-skin="earthy_natural"] .badge.hot {
          background: #6b8f71;
          color: #ffffff !important;
          border: none;
        }
        body[data-skin="earthy_natural"] .section-intro h2 {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 400;
          color: #2d2a24 !important;
        }
        body[data-skin="earthy_natural"] .section-intro p {
          color: rgba(45,42,36,0.8) !important;
        }
        body[data-skin="earthy_natural"] .featured-card {
          background: rgba(255,255,255,0.9) !important;
          border: 1px solid rgba(107,143,113,0.12);
          border-radius: 20px;
          overflow: hidden;
        }
        body[data-skin="earthy_natural"] .featured-info h3 {
          color: #2d2a24 !important;
        }
        body[data-skin="earthy_natural"] .featured-info p {
          color: rgba(45,42,36,0.8) !important;
        }
        body[data-skin="earthy_natural"] .variant-block {
          margin: 14px 0 8px 0;
        }
        body[data-skin="earthy_natural"] .variant-label {
          color: rgba(45,42,36,0.7) !important;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        body[data-skin="earthy_natural"] .variant-options {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        body[data-skin="earthy_natural"] .variant-option {
          border: 1px solid rgba(107,143,113,0.2);
          color: rgba(45,42,36,0.85) !important;
          background: transparent;
          border-radius: 999px;
          padding: 8px 18px;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.3s ease;
          cursor: pointer;
          min-width: 42px;
        }
        body[data-skin="earthy_natural"] .variant-option:hover {
          background: rgba(107,143,113,0.05);
          border-color: #6b8f71;
        }
        body[data-skin="earthy_natural"] .variant-option.is-selected {
          background: #6b8f71;
          border-color: #6b8f71;
          color: #ffffff !important;
        }
        body[data-skin="earthy_natural"] .variant-option:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }
        body[data-skin="earthy_natural"] .variant-note {
          color: rgba(45,42,36,0.6) !important;
          font-size: 13px;
          margin-top: 8px;
          font-weight: 400;
        }
        body[data-skin="earthy_natural"] .variant-note.needs-selection {
          color: #6b8f71 !important;
          font-weight: 600;
          font-size: 14px;
        }
        body[data-skin="earthy_natural"] .variant-note.is-selected {
          color: rgba(45,42,36,0.6) !important;
        }
        body[data-skin="earthy_natural"] .music-section {
          background: #ece7e1;
        }
        body[data-skin="earthy_natural"] .music-row {
          background: rgba(255,255,255,0.9) !important;
          border: 1px solid rgba(107,143,113,0.12);
          border-radius: 16px;
          padding: 16px;
        }
        body[data-skin="earthy_natural"] .music-row h3 {
          color: #2d2a24 !important;
        }
        body[data-skin="earthy_natural"] .music-row p {
          color: rgba(45,42,36,0.7) !important;
        }
        body[data-skin="earthy_natural"] .preview-btn {
          border: 1px solid rgba(107,143,113,0.2);
          color: rgba(45,42,36,0.8) !important;
          background: transparent;
          border-radius: 999px;
          padding: 8px 16px;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        body[data-skin="earthy_natural"] .preview-btn:hover {
          background: rgba(107,143,113,0.05);
          border-color: #6b8f71;
        }
        body[data-skin="earthy_natural"] .story-card {
          background: rgba(255,255,255,0.9) !important;
          border: 1px solid rgba(107,143,113,0.12);
          border-radius: 20px;
          padding: 28px;
        }
        body[data-skin="earthy_natural"] .story-card h2 {
          color: #2d2a24 !important;
        }
        body[data-skin="earthy_natural"] .story-card p {
          color: rgba(45,42,36,0.8) !important;
        }
        body[data-skin="earthy_natural"] .social-row a {
          border: 1px solid rgba(107,143,113,0.15);
          color: rgba(45,42,36,0.8) !important;
          padding: 8px 18px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        body[data-skin="earthy_natural"] .social-row a:hover {
          border-color: #6b8f71;
          color: #6b8f71 !important;
          background: rgba(107,143,113,0.05);
        }
        body[data-skin="earthy_natural"] .social-row .badge {
          color: rgba(45,42,36,0.7) !important;
          border-color: rgba(107,143,113,0.12);
          background: rgba(107,143,113,0.03);
        }
        body[data-skin="earthy_natural"] .artist-footer {
          color: rgba(45,42,36,0.8) !important;
          border-top: 1px solid rgba(107,143,113,0.1);
          padding: 50px 0;
          background: #f5f0eb;
        }
        body[data-skin="earthy_natural"] .artist-footer strong {
          color: #2d2a24 !important;
        }
        body[data-skin="earthy_natural"] .artist-footer p {
          color: rgba(45,42,36,0.7) !important;
        }
        body[data-skin="earthy_natural"] .player-buy {
          color: #2d2a24 !important;
          border: 1px solid rgba(107,143,113,0.2);
          background: transparent;
        }
        body[data-skin="earthy_natural"] .player-buy:hover {
          background: rgba(107,143,113,0.05);
          border-color: #6b8f71;
          color: #6b8f71 !important;
        }
        body[data-skin="earthy_natural"] .player-meta strong {
          color: #2d2a24 !important;
        }
        body[data-skin="earthy_natural"] .player-meta span {
          color: rgba(45,42,36,0.7) !important;
        }
        body[data-skin="earthy_natural"] .floating-player {
          background: rgba(245,240,235,0.95) !important;
          border: 1px solid rgba(107,143,113,0.1);
        }
        body[data-skin="earthy_natural"] .floating-player .player-btn {
          background: #6b8f71;
          color: #ffffff !important;
        }
        body[data-skin="earthy_natural"] .cart-panel {
          background: #ffffff !important;
          color: #2d2a24 !important;
        }
        body[data-skin="earthy_natural"] .cart-panel h3 {
          color: #2d2a24 !important;
        }
        body[data-skin="earthy_natural"] .cart-item {
          background: rgba(107,143,113,0.03);
          border: 1px solid rgba(107,143,113,0.1);
          border-radius: 16px;
          padding: 14px;
        }
        body[data-skin="earthy_natural"] .cart-item strong {
          color: #2d2a24 !important;
        }
        body[data-skin="earthy_natural"] .cart-total-row {
          border-top: 1px solid rgba(107,143,113,0.1);
          color: #2d2a24 !important;
          padding-top: 14px;
        }
        body[data-skin="earthy_natural"] .cart-total-row strong {
          color: #6b8f71 !important;
        }
        body[data-skin="earthy_natural"] .checkout-fields input {
          background: rgba(107,143,113,0.03);
          border: 1px solid rgba(107,143,113,0.1);
          color: #2d2a24 !important;
          border-radius: 999px;
          padding: 12px;
        }
        body[data-skin="earthy_natural"] .checkout-btn {
          background: #6b8f71;
          color: #ffffff !important;
          border: none;
          border-radius: 999px;
          font-weight: 600;
          padding: 14px;
        }
        body[data-skin="earthy_natural"] .checkout-note {
          color: rgba(45,42,36,0.6) !important;
        }
        body[data-skin="earthy_natural"] .cart-close {
          background: rgba(107,143,113,0.03);
          border: 1px solid rgba(107,143,113,0.1);
          color: #2d2a24 !important;
        }
        body[data-skin="earthy_natural"] .remove-item {
          color: #c0392b !important;
        }
        body[data-skin="earthy_natural"] .qty-controls button {
          background: rgba(107,143,113,0.03);
          border: 1px solid rgba(107,143,113,0.1);
          color: #2d2a24 !important;
        }
        body[data-skin="earthy_natural"] .cart-empty {
          color: rgba(45,42,36,0.6) !important;
          border: 1px dashed rgba(107,143,113,0.15);
        }
      `
    },
    
    // ── GOSPEL SKIN ──
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
        text_muted: 'rgba(26,26,26,0.85)',
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
        body[data-skin="gospel"] .experience-hero { min-height: 560px; }
        body[data-skin="gospel"] .hero-overlay { 
          background: linear-gradient(180deg, rgba(250,248,245,0.2), rgba(250,248,245,0.92)) !important; 
        }
        body[data-skin="gospel"] .hero-copy h1 {
          font-family: 'Georgia', serif;
          font-weight: 400;
          color: #1a1a1a !important;
        }
        body[data-skin="gospel"] .hero-copy p { 
          color: rgba(26,26,26,0.85) !important;
          font-weight: 400;
        }
        body[data-skin="gospel"] .store-pill {
          border: 1px solid rgba(193,154,107,0.3);
          color: #c19a6b !important;
          background: rgba(193,154,107,0.05);
          font-weight: 600;
          padding: 6px 14px;
          border-radius: 8px;
          font-size: 11px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        body[data-skin="gospel"] .micro-label {
          color: #c19a6b !important;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          font-size: 11px;
        }
        body[data-skin="gospel"] .store-nav { 
          background: rgba(250,248,245,0.98) !important; 
          border-bottom: 2px solid #c19a6b; 
        }
        body[data-skin="gospel"] .store-nav-links a {
          color: rgba(26,26,26,0.8) !important;
          transition: color 0.3s;
        }
        body[data-skin="gospel"] .store-nav-links a:hover {
          color: #c19a6b !important;
        }
        body[data-skin="gospel"] .store-cart-trigger {
          border: 1px solid rgba(193,154,107,0.2) !important;
          background: rgba(193,154,107,0.05) !important;
          color: #1a1a1a !important;
        }
        body[data-skin="gospel"] .store-cart-trigger span {
          color: #1a1a1a !important;
        }
        body[data-skin="gospel"] .store-cart-trigger strong {
          background: #c19a6b !important;
          color: #ffffff !important;
        }
        body[data-skin="gospel"] .hero-primary {
          background: #c19a6b;
          color: #ffffff !important;
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
          color: #1a1a1a !important;
          border-radius: 8px;
          background: transparent;
          padding: 14px 32px;
          transition: all 0.3s ease;
        }
        body[data-skin="gospel"] .hero-secondary:hover {
          background: rgba(193,154,107,0.05);
          border-color: #c19a6b;
        }
        body[data-skin="gospel"] .store-ticker {
          background: #c19a6b;
          color: #ffffff !important;
          font-weight: 500;
        }
        body[data-skin="gospel"] .store-ticker-track span {
          color: #ffffff !important;
        }
        body[data-skin="gospel"] .product-card {
          background: rgba(255,255,255,0.9) !important;
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
          color: #1a1a1a !important;
        }
        body[data-skin="gospel"] .product-card p {
          color: rgba(26,26,26,0.8) !important;
        }
        body[data-skin="gospel"] .product-type {
          color: #c19a6b !important;
          font-weight: 600;
        }
        body[data-skin="gospel"] .product-price {
          color: #c19a6b !important;
          font-weight: 600;
        }
        body[data-skin="gospel"] .featured-price {
          color: #c19a6b !important;
          font-weight: 600;
          font-size: 26px;
        }
        body[data-skin="gospel"] .product-add {
          background: #c19a6b;
          border: none;
          color: #ffffff !important;
          border-radius: 8px;
          padding: 10px 20px;
          transition: all 0.3s ease;
        }
        body[data-skin="gospel"] .product-add:hover {
          background: #a07d55;
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(193,154,107,0.3);
        }
        body[data-skin="gospel"] .mini-add {
          background: #c19a6b;
          color: #ffffff !important;
          border: none;
          border-radius: 8px;
          padding: 8px 20px;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        body[data-skin="gospel"] .mini-add:hover {
          background: #a07d55;
        }
        body[data-skin="gospel"] .product-grid {
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        body[data-skin="gospel"] .badge {
          color: rgba(26,26,26,0.8) !important;
          border-color: rgba(193,154,107,0.15);
          background: rgba(193,154,107,0.05);
        }
        body[data-skin="gospel"] .badge.hot {
          background: #c19a6b;
          color: #ffffff !important;
          border: none;
        }
        body[data-skin="gospel"] .section-intro h2 {
          font-family: 'Georgia', serif;
          font-weight: 400;
          color: #1a1a1a !important;
        }
        body[data-skin="gospel"] .section-intro p {
          color: rgba(26,26,26,0.8) !important;
        }
        body[data-skin="gospel"] .featured-card {
          background: rgba(255,255,255,0.9) !important;
          border: 1px solid rgba(193,154,107,0.1);
          border-radius: 12px;
          overflow: hidden;
        }
        body[data-skin="gospel"] .featured-info h3 {
          color: #1a1a1a !important;
        }
        body[data-skin="gospel"] .featured-info p {
          color: rgba(26,26,26,0.8) !important;
        }
        body[data-skin="gospel"] .variant-block {
          margin: 14px 0 8px 0;
        }
        body[data-skin="gospel"] .variant-label {
          color: rgba(26,26,26,0.7) !important;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        body[data-skin="gospel"] .variant-options {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        body[data-skin="gospel"] .variant-option {
          border: 1px solid rgba(193,154,107,0.2);
          color: rgba(26,26,26,0.85) !important;
          background: transparent;
          border-radius: 8px;
          padding: 8px 18px;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.3s ease;
          cursor: pointer;
          min-width: 42px;
        }
        body[data-skin="gospel"] .variant-option:hover {
          background: rgba(193,154,107,0.05);
          border-color: #c19a6b;
        }
        body[data-skin="gospel"] .variant-option.is-selected {
          background: #c19a6b;
          border-color: #c19a6b;
          color: #ffffff !important;
        }
        body[data-skin="gospel"] .variant-option:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }
        body[data-skin="gospel"] .variant-note {
          color: rgba(26,26,26,0.6) !important;
          font-size: 13px;
          margin-top: 8px;
          font-weight: 400;
        }
        body[data-skin="gospel"] .variant-note.needs-selection {
          color: #c19a6b !important;
          font-weight: 600;
          font-size: 14px;
        }
        body[data-skin="gospel"] .variant-note.is-selected {
          color: rgba(26,26,26,0.6) !important;
        }
        body[data-skin="gospel"] .music-section {
          background: #f2efe9;
        }
        body[data-skin="gospel"] .music-row {
          background: rgba(255,255,255,0.9) !important;
          border: 1px solid rgba(193,154,107,0.1);
          border-radius: 12px;
          padding: 16px;
        }
        body[data-skin="gospel"] .music-row h3 {
          color: #1a1a1a !important;
        }
        body[data-skin="gospel"] .music-row p {
          color: rgba(26,26,26,0.7) !important;
        }
        body[data-skin="gospel"] .preview-btn {
          border: 1px solid rgba(193,154,107,0.2);
          color: rgba(26,26,26,0.8) !important;
          background: transparent;
          border-radius: 8px;
          padding: 8px 16px;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        body[data-skin="gospel"] .preview-btn:hover {
          background: rgba(193,154,107,0.05);
          border-color: #c19a6b;
        }
        body[data-skin="gospel"] .story-card {
          background: rgba(255,255,255,0.9) !important;
          border: 1px solid rgba(193,154,107,0.1);
          border-radius: 12px;
          padding: 28px;
        }
        body[data-skin="gospel"] .story-card h2 {
          color: #1a1a1a !important;
        }
        body[data-skin="gospel"] .story-card p {
          color: rgba(26,26,26,0.8) !important;
        }
        body[data-skin="gospel"] .social-row a {
          border: 1px solid rgba(193,154,107,0.15);
          color: rgba(26,26,26,0.8) !important;
          padding: 8px 18px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        body[data-skin="gospel"] .social-row a:hover {
          border-color: #c19a6b;
          color: #c19a6b !important;
          background: rgba(193,154,107,0.05);
        }
        body[data-skin="gospel"] .social-row .badge {
          color: rgba(26,26,26,0.7) !important;
          border-color: rgba(193,154,107,0.12);
          background: rgba(193,154,107,0.03);
        }
        body[data-skin="gospel"] .artist-footer {
          color: rgba(26,26,26,0.8) !important;
          border-top: 1px solid rgba(193,154,107,0.1);
          padding: 50px 0;
          background: #faf8f5;
        }
        body[data-skin="gospel"] .artist-footer strong {
          color: #1a1a1a !important;
        }
        body[data-skin="gospel"] .artist-footer p {
          color: rgba(26,26,26,0.7) !important;
        }
        body[data-skin="gospel"] .player-buy {
          color: #1a1a1a !important;
          border: 1px solid rgba(193,154,107,0.2);
          background: transparent;
        }
        body[data-skin="gospel"] .player-buy:hover {
          background: rgba(193,154,107,0.05);
          border-color: #c19a6b;
          color: #c19a6b !important;
        }
        body[data-skin="gospel"] .player-meta strong {
          color: #1a1a1a !important;
        }
        body[data-skin="gospel"] .player-meta span {
          color: rgba(26,26,26,0.7) !important;
        }
        body[data-skin="gospel"] .floating-player {
          background: rgba(250,248,245,0.95) !important;
          border: 1px solid rgba(193,154,107,0.1);
        }
        body[data-skin="gospel"] .floating-player .player-btn {
          background: #c19a6b;
          color: #ffffff !important;
        }
        body[data-skin="gospel"] .cart-panel {
          background: #ffffff !important;
          color: #1a1a1a !important;
        }
        body[data-skin="gospel"] .cart-panel h3 {
          color: #1a1a1a !important;
        }
        body[data-skin="gospel"] .cart-item {
          background: rgba(193,154,107,0.03);
          border: 1px solid rgba(193,154,107,0.08);
          border-radius: 12px;
          padding: 14px;
        }
        body[data-skin="gospel"] .cart-item strong {
          color: #1a1a1a !important;
        }
        body[data-skin="gospel"] .cart-total-row {
          border-top: 1px solid rgba(193,154,107,0.1);
          color: #1a1a1a !important;
          padding-top: 14px;
        }
        body[data-skin="gospel"] .cart-total-row strong {
          color: #c19a6b !important;
        }
        body[data-skin="gospel"] .checkout-fields input {
          background: rgba(193,154,107,0.03);
          border: 1px solid rgba(193,154,107,0.1);
          color: #1a1a1a !important;
          border-radius: 8px;
          padding: 12px;
        }
        body[data-skin="gospel"] .checkout-btn {
          background: #c19a6b;
          color: #ffffff !important;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          padding: 14px;
        }
        body[data-skin="gospel"] .checkout-note {
          color: rgba(26,26,26,0.6) !important;
        }
        body[data-skin="gospel"] .cart-close {
          background: rgba(193,154,107,0.03);
          border: 1px solid rgba(193,154,107,0.08);
          color: #1a1a1a !important;
        }
        body[data-skin="gospel"] .remove-item {
          color: #c0392b !important;
        }
        body[data-skin="gospel"] .qty-controls button {
          background: rgba(193,154,107,0.03);
          border: 1px solid rgba(193,154,107,0.08);
          color: #1a1a1a !important;
        }
        body[data-skin="gospel"] .cart-empty {
          color: rgba(26,26,26,0.6) !important;
          border: 1px dashed rgba(193,154,107,0.12);
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
    this.isApplied = false;
  }
  
  applySkin(skinId) {
    if (this.isApplied) return this.currentSkin;
    
    const skin = this.skinSystem.skins[skinId];
    if (!skin) {
      console.warn(`Skin "${skinId}" not found, using default`);
      return this.applySkin('streetwear');
    }
    
    this.currentSkin = skin;
    this.isApplied = true;
    
    try {
      this.applyCSSVariables(skin);
      this.loadFonts(skin);
      this.applySkinCSS(skin);
      this.updateDOM(skin);
      this.triggerAnimations(skin);
    } catch (error) {
      console.warn('Skin application error:', error);
    }
    
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
    root.style.setProperty('--skin-font-heading', t.font_heading);
    root.style.setProperty('--skin-font-body', t.font_body);
    root.style.setProperty('--skin-font-accent', t.font_accent);
    root.style.setProperty('--skin-grid-cols', t.grid_cols || '3');
    root.style.setProperty('--skin-gap', t.grid_gap || '20px');
    root.style.setProperty('--skin-card-radius', t.card_radius || '16px');
    root.style.setProperty('--skin-card-shadow', t.card_shadow || 'none');
    root.style.setProperty('--skin-card-hover-shadow', t.card_hover_shadow || 'none');
    root.style.setProperty('--skin-button-radius', t.button_radius || '999px');
    
    document.body.dataset.skin = skin.id;
  }
  
  applySkinCSS(skin) {
    const oldStyle = document.getElementById('skin-styles');
    if (oldStyle) oldStyle.remove();
    
    if (skin.css) {
      const style = document.createElement('style');
      style.id = 'skin-styles';
      style.textContent = skin.css;
      document.head.appendChild(style);
    }
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
      
      if (fontUrl && !document.querySelector(`link[href*="${encodeURIComponent(baseFont.toLowerCase())}"]`)) {
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
    document.body.classList.remove('is-loading');
    
    const cards = document.querySelectorAll('.product-card');
    cards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.animation = `skinFadeIn 0.6s ease ${index * 0.08}s forwards`;
    });
  }
  
  detectIndustry(artist) {
    if (!artist) return 'streetwear';
    
    const industryPref = artist.industry_preference || '';
    const visualStyle = artist.visual_style || '';
    const genre = artist.genre || '';
    const storeMode = artist.store_mode || '';
    
    if (industryPref && this.skinSystem.skins[industryPref]) {
      return industryPref;
    }
    if (visualStyle.includes('sports')) return 'sports';
    if (visualStyle.includes('luxury') || visualStyle.includes('premium')) return 'luxury';
    if (visualStyle.includes('corporate') || visualStyle.includes('business')) return 'corporate';
    if (visualStyle.includes('earthy') || visualStyle.includes('natural')) return 'earthy_natural';
    if (visualStyle.includes('gospel') || visualStyle.includes('faith')) return 'gospel';
    if (visualStyle.includes('streetwear') || visualStyle.includes('urban')) return 'streetwear';
    
    const g = genre.toLowerCase();
    if (g.includes('gospel')) return 'gospel';
    if (g.includes('sports')) return 'sports';
    if (g.includes('hip hop') || g.includes('rap')) return 'streetwear';
    if (storeMode === 'fashion' || storeMode === 'clothing') return 'streetwear';
    
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
    body[data-skin="luxury"] .product-card,
    body[data-skin="luxury"] .hero-primary,
    body[data-skin="luxury"] .hero-secondary {
      transition-duration: 0.6s !important;
    }
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

console.log('🎨 ZVAKHO Ultimate Skin System v3.4 loaded');
