// ============================================
// ULTIMATE SKIN SYSTEM - Premium Edition
// ============================================

const ULTIMATE_SKIN_SYSTEM = {
  skins: {
    sports: {
      id: 'sports',
      label: '⚽ Sports',
      
      theme: {
        // Hero
        hero_height: '640px',
        hero_parallax: true,
        hero_effect: 'gradient_glow',
        
        // Colors - Sports Edition
        background: '#0f1a2e',
        surface: 'rgba(22,35,56,0.85)',
        text: '#ffffff',
        text_muted: 'rgba(255,255,255,0.7)',
        primary: '#e8432b',
        secondary: '#f5c842',
        accent: '#ffffff',
        glow: 'rgba(232,67,43,0.3)',
        shadow: 'rgba(232,67,43,0.2)',
        
        // Typography - Bold & Dynamic
        typography: {
          heading: {
            font: "'Bebas Neue', 'Arial Black', sans-serif",
            weight: '900',
            transform: 'uppercase',
            letter_spacing: '0.05em',
            gradient: 'linear-gradient(135deg, #ffffff, #f5c842)',
            size: 'clamp(72px, 12vw, 140px)'
          },
          body: {
            font: "'Inter', sans-serif",
            weight: '400',
            size: '16px',
            line_height: '1.7'
          }
        },
        
        // Effects
        effects: {
          card_3d: true,
          parallax: true,
          ripple: true,
          glow: true,
          pattern: 'stadium'
        },
        
        // Components
        components: {
          match_day_banner: true,
          player_stats: true,
          live_indicator: true
        },
        
        // Grid
        grid: {
          cols: '4',
          gap: '20px',
          animation: 'sports_zoom'
        }
      },
      
      css: `
        /* Sports Theme CSS */
        body[data-skin="sports"] {
          background: #0f1a2e;
          background-image: 
            radial-gradient(circle at 80% 20%, rgba(232,67,43,0.08) 0%, transparent 50%),
            radial-gradient(circle at 20% 80%, rgba(232,67,43,0.05) 0%, transparent 50%);
        }
        
        /* Hero */
        .experience-hero { min-height: 640px; }
        .hero-overlay { 
          background: linear-gradient(180deg, rgba(15,26,46,0.3), rgba(15,26,46,0.9)) !important;
        }
        .hero-copy h1 {
          font-family: 'Bebas Neue', sans-serif;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          background: linear-gradient(135deg, #ffffff, #f5c842);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: 0 4px 60px rgba(232,67,43,0.3);
        }
        
        /* Navigation */
        .store-nav {
          background: rgba(15,26,46,0.95) !important;
          border-bottom: 3px solid #e8432b;
        }
        
        /* Cards */
        .product-card {
          background: rgba(22,35,56,0.85);
          border: 2px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        }
        
        .product-card:hover {
          transform: scale(1.04);
          border-color: #e8432b;
          box-shadow: 
            0 20px 60px rgba(232,67,43,0.25),
            0 0 40px rgba(232,67,43,0.1);
        }
        
        .product-card h3 {
          font-family: 'Bebas Neue', sans-serif;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }
        
        /* Buttons */
        .product-add, .hero-primary {
          background: linear-gradient(135deg, #e8432b, #c0392b);
          border: none;
          color: white;
          text-transform: uppercase;
          font-weight: 900;
          border-radius: 12px;
          letter-spacing: 0.05em;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        
        .product-add:hover, .hero-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(232,67,43,0.4);
        }
        
        /* Price */
        .product-price {
          color: #f5c842;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 24px;
        }
        
        /* Ticker */
        .store-ticker {
          background: linear-gradient(90deg, #e8432b, #c0392b, #e8432b);
          background-size: 200% 100%;
          animation: tickerGradient 3s ease infinite;
          color: white;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        
        @keyframes tickerGradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        /* Grid */
        .product-grid {
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }
        
        /* Match Day Banner */
        .match-day-banner {
          background: linear-gradient(135deg, #e8432b, #c0392b);
          padding: 12px 24px;
          border-radius: 12px;
          margin: 20px 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          animation: pulseGlow 2s ease infinite;
        }
        
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(232,67,43,0.2); }
          50% { box-shadow: 0 0 40px rgba(232,67,43,0.4); }
        }
      `
    },
    
    luxury: {
      id: 'luxury',
      label: '💎 Luxury',
      
      theme: {
        hero_height: '720px',
        hero_parallax: true,
        hero_effect: 'golden_dawn',
        
        colors: {
          background: '#0d0b0a',
          surface: 'rgba(26,23,21,0.9)',
          text: '#f5f0eb',
          text_muted: 'rgba(245,240,235,0.6)',
          primary: '#c9a84c',
          secondary: '#d4b87a',
          accent: '#e8d5a3',
          glow: 'rgba(201,168,76,0.2)',
          shadow: 'rgba(201,168,76,0.1)'
        },
        
        typography: {
          heading: {
            font: "'Didot', 'Bodoni', serif",
            weight: '300',
            transform: 'none',
            letter_spacing: '0.02em',
            size: 'clamp(56px, 10vw, 120px)'
          },
          body: {
            font: "'Inter', sans-serif",
            weight: '300',
            size: '17px',
            line_height: '1.8'
          }
        },
        
        effects: {
          glassmorphism: true,
          parallax: true,
          slow_reveal: true,
          pattern: 'marble'
        },
        
        components: {
          vip_badge: true,
          luxury_gallery: true,
          gold_filigree: true
        },
        
        grid: {
          cols: '2',
          gap: '32px',
          animation: 'luxury_reveal'
        }
      },
      
      css: `
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
        
        .experience-hero { min-height: 720px; }
        .hero-overlay { 
          background: linear-gradient(180deg, rgba(13,11,10,0.2), rgba(13,11,10,0.95)) !important;
        }
        .hero-copy h1 {
          font-family: 'Didot', serif;
          font-weight: 300;
          letter-spacing: 0.02em;
          color: #f5f0eb;
          text-shadow: 0 4px 60px rgba(201,168,76,0.1);
        }
        
        .store-nav {
          background: rgba(13,11,10,0.95) !important;
          border-bottom: 1px solid rgba(201,168,76,0.15);
        }
        
        .product-card {
          background: rgba(26,23,21,0.9);
          border: 1px solid rgba(201,168,76,0.08);
          border-radius: 24px;
          backdrop-filter: blur(20px);
          transition: all 0.6s ease;
          box-shadow: 0 8px 40px rgba(0,0,0,0.4);
        }
        
        .product-card:hover {
          transform: translateY(-8px);
          border-color: rgba(201,168,76,0.3);
          box-shadow: 0 16px 80px rgba(201,168,76,0.08);
        }
        
        .product-card h3 {
          font-family: 'Didot', serif;
          font-weight: 300;
          letter-spacing: 0.02em;
        }
        
        .product-add, .hero-primary {
          background: #c9a84c;
          border: none;
          color: #0d0b0a;
          font-weight: 700;
          letter-spacing: 0.05em;
          border-radius: 999px;
          padding: 14px 28px;
          transition: all 0.4s ease;
        }
        
        .product-add:hover, .hero-primary:hover {
          background: #d4b87a;
          transform: translateY(-2px);
          box-shadow: 0 8px 40px rgba(201,168,76,0.3);
        }
        
        .product-price {
          color: #c9a84c;
          font-size: 28px;
          font-weight: 300;
        }
        
        .product-grid {
          grid-template-columns: repeat(2, 1fr);
          gap: 32px;
        }
        
        /* Gold Filigree Decoration */
        .gold-filigree {
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, transparent, #c9a84c, transparent);
          margin: 20px 0;
          opacity: 0.3;
        }
      `
    }
  }
};

// Export for use
window.ULTIMATE_SKIN_SYSTEM = ULTIMATE_SKIN_SYSTEM;
