// ── store.js (corrected) ──────────────────────────────
// Make sure store-skins.js is loaded before this file.

(function() {
  'use strict';

  // ── Configuration ─────────────────────────────────────
  const CONFIG = window.ZVAKHO_CONFIG || {};
  // Use API_BASE from config or fallback
  const API_BASE = CONFIG.API_BASE || window.API_BASE || 'https://zvakho-workers-universal.yasibomedia.workers.dev';
  const APP_BASE = CONFIG.APP_BASE || window.APP_BASE || 'https://zvakho.co.zw';

  // ── Helpers ───────────────────────────────────────────
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  let STORE = null;
  let CART = [];
  let ACTIVE_PREVIEW_PRODUCT = null;
  let SELECTED_VARIANTS = {};

  const api = (path) => `${API_BASE.replace(/\/$/, '')}${path}`;
  const money = (n) => `$${Number(n || 0).toFixed(2)}`;

  function escapeHTML(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function attr(value) {
    return escapeHTML(value).replace(/`/g, '&#096;');
  }

  // ── Artist Detection (subdomain, query, path) ──────
  function slugFromURL() {
    // 1. Query string: ?artist=slug or ?slug=slug
    const params = new URLSearchParams(location.search);
    const query = params.get('artist') || params.get('slug');
    if (query) return query.trim().toLowerCase();

    // 2. Subdomain detection (e.g., mdusevan.zvakho.co.zw)
    const host = location.hostname.toLowerCase();
    const hostParts = host.split('.');
    const first = hostParts[0];

    const ignored = ['www', 'zvakho', 'store', 'api', 'assets', 'localhost', '127', 'admin', 'dashboard'];
    if (
      (host.endsWith('zvakho.co.zw') || host.endsWith('pages.dev')) &&
      hostParts.length >= 3 &&
      !ignored.includes(first)
    ) {
      return first;
    }

    // 3. Path fallback: /store/absoll or /absoll
    const pathParts = location.pathname.split('/').filter(Boolean);
    if (pathParts[0] === 'store' && pathParts[1]) return pathParts[1].toLowerCase();
    if (pathParts[0] && pathParts[0] !== 'store') return pathParts[0].toLowerCase();

    // 4. Default: none found
    return '';
  }

  // ── Fetch JSON with error handling ──────────────────
  async function fetchJSON(url) {
    const response = await fetch(url, { cache: 'no-store' });
    const data = await response.json();
    if (!response.ok || data.status === 'error') {
      throw new Error(data.message || 'Request failed');
    }
    return data;
  }

  // ── Theme / UI Helpers ──────────────────────────────
  function isDarkColor(hex) {
    const value = String(hex || '').replace('#', '');
    if (value.length !== 6) return true;
    const r = parseInt(value.slice(0,2), 16);
    const g = parseInt(value.slice(2,4), 16);
    const b = parseInt(value.slice(4,6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 < 150;
  }

  function layoutFromStore(artist, theme) {
    const style = String(artist.visual_style || theme.preset_id || 'streetwear_dark').toLowerCase();
    if (style.includes('gospel')) return 'gospel_clean';
    if (style.includes('luxury') || style.includes('minimal')) return 'minimal_luxury';
    if (style.includes('fashion')) return 'fashion_brand';
    return 'streetwear_dark';
  }

  function applyTheme(artist, theme) {
    const layout = layoutFromStore(artist, theme);
    document.body.dataset.layout = layout;

    const root = document.documentElement;
    const bg = theme.background_color || '#050505';
    const text = theme.text_color || (isDarkColor(bg) ? '#ffffff' : '#111111');
    const primary = theme.primary_color || '#f5a400';
    const secondary = theme.secondary_color || '#ffffff';
    const accent = theme.accent_color || primary;

    root.style.setProperty('--store-bg', bg);
    root.style.setProperty('--store-text', text);
    root.style.setProperty('--store-primary', primary);
    root.style.setProperty('--store-secondary', secondary);
    root.style.setProperty('--store-accent', accent);
    root.style.setProperty('--store-surface', isDarkColor(bg) ? '#141414' : '#ffffff');
    root.style.setProperty('--store-muted', isDarkColor(bg) ? 'rgba(255,255,255,.72)' : 'rgba(17,17,17,.68)');
    root.style.setProperty('--store-line', isDarkColor(bg) ? 'rgba(255,255,255,.16)' : 'rgba(17,17,17,.13)');
  }

  function pickLogo(artist, theme) {
    const bg = theme.background_color || '#050505';
    return isDarkColor(bg)
      ? (artist.logo_white_url || artist.logo_url || '/assets/brand/zvakho-logo.webp')
      : (artist.logo_black_url || artist.logo_url || '/assets/brand/zvakho-logo.webp');
  }

  function setImage(selector, src, fallback = '/assets/brand/favicon.png') {
    const image = $(selector);
    if (!image) return;
    image.src = src || fallback;
    image.onerror = () => { image.src = fallback; };
  }

  function productsByType(type) {
    return (STORE?.products || []).filter(p => String(p.product_type || '').toLowerCase() === type);
  }

  function featuredProduct() {
    const products = STORE.products || [];
    const id = STORE.artist?.featured_product_id;
    return products.find(p => p.product_id === id)
      || products.find(p => p.product_type === 'merch')
      || products[0]
      || null;
  }

  function getProduct(productId) {
    return (STORE.products || []).find(p => p.product_id === productId);
  }

  function getVariant(product, variantId) {
    return (product?.variants || []).find(v => v.variant_id === variantId) || null;
  }

  function isMerch(product) {
    return String(product?.product_type || '').toLowerCase() === 'merch';
  }

  function selectedVariantForProduct(product) {
    if (!product) return null;
    const selectedId = SELECTED_VARIANTS[product.product_id];
    return getVariant(product, selectedId);
  }

  // ── Render Functions ──────────────────────────────────
  function updateGlobalUI() {
    const { artist, theme } = STORE;

    document.title = `${artist.artist_name} — Official Store`;
    document.body.classList.remove('is-loading');

    const heroMedia = $('.hero-media');
    if (heroMedia && artist.hero_image_url) {
      heroMedia.style.backgroundImage = `url('${artist.hero_image_url}')`;
    }

    const nameEl = $('#artistName');
    if (nameEl) nameEl.textContent = theme.hero_title || artist.artist_name;
    const subEl = $('#artistSub');
    if (subEl) subEl.textContent = artist.bio || artist.tagline || artist.genre || 'Official music and merch store powered by ZVAKHO.';
    const genreEl = $('#artistGenre');
    if (genreEl) genreEl.textContent = artist.genre || 'Artist';
    const cardName = $('#artistCardName');
    if (cardName) cardName.textContent = artist.artist_name;
    const kicker = $('#storeKicker');
    if (kicker) kicker.textContent = artist.store_mode ? `${artist.store_mode} store` : 'Official Store';

    const logo = pickLogo(artist, theme);
    setImage('#navLogo', logo);
    setImage('#footerLogo', logo);
    setImage('#artistProfile', artist.profile_image_url || artist.hero_image_url || logo);
    setImage('#storyProfileImage', artist.profile_image_url || artist.hero_image_url || logo);

    const storyTitle = $('#storyTitle');
    if (storyTitle) storyTitle.textContent = `${artist.artist_name} world`;
    const bio = $('#artistBio');
    if (bio) bio.textContent = artist.bio || artist.tagline || 'Official music, merch and direct-to-fan releases powered by ZVAKHO.';
    const footerQuote = $('#footerQuote');
    if (footerQuote) footerQuote.textContent = artist.footer_quote || artist.tagline || 'Official store powered by ZVAKHO.';
    const footerName = $('#footerArtistName');
    if (footerName) footerName.textContent = `${artist.artist_name} Official Store`;
    const footerMeta = $('#footerMeta');
    if (footerMeta) footerMeta.textContent = [artist.genre, 'Music', 'Merch'].filter(Boolean).join(' • ');

    const tickerText = theme.ticker_text || `${artist.artist_name} • OFFICIAL STORE • MUSIC • MERCH • LIMITED RELEASES •`;
    const tickerTrack = $('#tickerTrack');
    if (tickerTrack) {
      tickerTrack.innerHTML = `
        <span>${escapeHTML(tickerText)}</span>
        <span>${escapeHTML(tickerText)}</span>
        <span>${escapeHTML(tickerText)}</span>
      `;
    }

    renderSocials();
  }

  function renderSocials() {
    const row = $('#socialRow');
    const artist = STORE.artist;
    const socials = [
      ['Instagram', artist.instagram_url],
      ['TikTok', artist.tiktok_url],
      ['YouTube', artist.youtube_url],
      ['Spotify', artist.spotify_url],
      ['Apple Music', artist.apple_music_url]
    ].filter(([, url]) => url);

    if (!row) return;
    if (!socials.length) {
      row.innerHTML = `<span class="badge">Social links coming soon</span>`;
      return;
    }
    row.innerHTML = socials.map(([label, url]) =>
      `<a href="${attr(url)}" target="_blank" rel="noopener" class="social-link">${escapeHTML(label)}</a>`
    ).join('');
  }

  // ── Featured Product ──────────────────────────────────
  function renderFeatured() {
    const product = featuredProduct();
    const box = $('#featuredProduct');
    if (!box) return;

    if (!product) {
      box.innerHTML = `<div class="featured-placeholder">No featured product yet.</div>`;
      return;
    }

    const title = $('#featuredTitle');
    if (title) title.textContent = product.product_name || 'Featured drop';
    const copy = $('#featuredCopy');
    if (copy) copy.textContent = productDescription(product);

    box.innerHTML = `
      <div class="featured-card-inner">
        <div class="featured-image">
          <img
            src="${attr(productImage(product))}"
            alt="${attr(product.product_name)}"
            onerror="this.parentElement.innerHTML='<div class=&quot;product-media-fallback&quot;>${escapeHTML((product.product_name || 'Z').slice(0,2).toUpperCase())}</div>'"
          >
        </div>
        <div class="featured-info">
          <div class="featured-badges">${productBadges(product)}</div>
          <h3>${escapeHTML(product.product_name)}</h3>
          <p>${escapeHTML(productDescription(product))}</p>
          ${renderVariantSelector(product, 'featured')}
          <div class="featured-price">${escapeHTML(product.price_label || money(product.price))}</div>
          <div class="featured-actions">
            <button class="btn hero-primary" type="button" data-add="${attr(product.product_id)}">Add to cart</button>
            ${product.preview_url ? `<button class="btn hero-secondary" type="button" data-preview="${attr(product.product_id)}">Play preview</button>` : ''}
          </div>
        </div>
      </div>
    `;
  }

  function productImage(product) {
    return product.main_image_url || product.image_url || '/assets/brand/favicon.png';
  }

  function productDescription(product) {
    if (product.description) return product.description;
    if (product.product_type === 'music') return 'Preview the track and buy directly from the artist.';
    if (product.preorder_enabled) return 'Limited preorder item fulfilled after the drop closes.';
    return 'Official artist product fulfilled through ZVAKHO.';
  }

  function productBadges(product) {
    const badges = [];
    if (product.limited_release) badges.push(`<span class="badge hot">Limited</span>`);
    if (product.preorder_enabled) badges.push(`<span class="badge">Preorder</span>`);
    if (product.product_type === 'music') badges.push(`<span class="badge">Instant delivery</span>`);
    if (isMerch(product) && product.has_variants) badges.push(`<span class="badge">Choose size</span>`);
    return badges.join('');
  }

  function renderVariantSelector(product, context = 'card') {
    if (!isMerch(product) || !product.has_variants || !(product.variants || []).length) {
      return '';
    }
    const selectedVariant = selectedVariantForProduct(product);
    const selectedId = selectedVariant?.variant_id || '';
    return `
      <div class="variant-block" data-variant-block="${attr(product.product_id)}">
        <div class="variant-label">Choose size</div>
        <div class="variant-options">
          ${(product.variants || []).map(v => {
            const disabled = Number(v.stock_qty ?? 1) <= 0;
            const active = selectedId && v.variant_id === selectedId;
            return `<button class="variant-option ${active ? 'is-selected' : ''}" type="button" data-variant-select="${attr(product.product_id)}" data-variant-id="${attr(v.variant_id)}" ${disabled ? 'disabled' : ''}>${escapeHTML(v.size_code || v.size_label || 'Size')}</button>`;
          }).join('')}
        </div>
        <div class="variant-note ${selectedVariant ? 'is-selected' : 'needs-selection'}">
          ${selectedVariant ? escapeHTML(`${selectedVariant.color || ''} ${selectedVariant.size_label || selectedVariant.size_code || ''}`.trim()) : 'Please select a size before adding to cart'}
        </div>
      </div>
    `;
  }

  function rerenderVariantProduct(productId) {
    const product = getProduct(productId);
    if (!product) return;
    renderFeatured();
    renderProducts();
  }

  // ── Products Grid ─────────────────────────────────────
  function renderProducts() {
    const grid = $('#productGrid');
    const products = STORE.products || [];
    if (!grid) return;

    if (!products.length) {
      grid.innerHTML = `<div class="empty">No products available yet.</div>`;
      return;
    }

    const skin = STORE.active_skin || { id: 'streetwear', layout: { grid_cols: '3' } };
    const productWeight = {
      streetwear: { apparel: 1, merch: 2, music: 3 },
      corporate: { apparel: 1, merch: 1, music: 4 },
      earthy_natural: { apparel: 1, merch: 2, music: 3 },
      luxury: { apparel: 1, merch: 3, music: 4 },
      sports: { apparel: 1, merch: 2, music: 3 },
      gospel: { apparel: 1, merch: 2, music: 3 }
    };
    const weights = productWeight[skin.id] || { apparel: 1, merch: 2, music: 3 };
    const sorted = [...products].sort((a, b) => {
      const typeA = a.product_type || 'apparel';
      const typeB = b.product_type || 'apparel';
      return (weights[typeA] || 9) - (weights[typeB] || 9);
    });

    const gridCols = skin.layout?.grid_cols || '3';
    grid.style.gridTemplateColumns =
      gridCols === '2' ? 'repeat(2, 1fr)' :
      gridCols === '3' ? 'repeat(3, 1fr)' :
      gridCols === '4' ? 'repeat(4, 1fr)' :
      'repeat(3, 1fr)';

    grid.innerHTML = sorted.map(product => `
      <article class="product-card" data-skin="${skin.id}">
        <div class="product-media">
          <img src="${attr(productImage(product))}" alt="${attr(product.product_name)}" loading="lazy" onerror="this.remove();this.parentElement.textContent='${escapeHTML((product.product_name || 'Z').slice(0,2).toUpperCase())}'">
        </div>
        <div class="product-body">
          <div class="product-type">${escapeHTML(product.product_type || 'Apparel')}</div>
          <h3 style="font-family:var(--skin-font-heading, inherit)">${escapeHTML(product.product_name)}</h3>
          <p>${escapeHTML(productDescription(product))}</p>
          <div class="featured-badges">${productBadges(product)}</div>
          ${renderVariantSelector(product, 'card')}
          <div class="product-foot">
            <span class="product-price">${escapeHTML(product.price_label || money(product.price))}</span>
            <button class="product-add" type="button" data-add="${attr(product.product_id)}">Add</button>
          </div>
        </div>
      </article>
    `).join('');
  }

  // ── Music Player ──────────────────────────────────────
  function renderMusic() {
    const list = $('#musicList');
    const tracks = productsByType('music');
    if (!list) return;

    if (!tracks.length) {
      list.innerHTML = `<div class="empty">No music previews available yet.</div>`;
      $('#floatingPlayer').hidden = true;
      return;
    }

    list.innerHTML = tracks.map(track => `
      <article class="music-row">
        <div class="music-art">
          <img src="${attr(productImage(track))}" alt="${attr(track.product_name)}" onerror="this.remove();this.parentElement.textContent='${escapeHTML((track.product_name || 'Z').slice(0,2).toUpperCase())}'">
        </div>
        <div>
          <h3>${escapeHTML(track.product_name)}</h3>
          <p>${escapeHTML(track.price_label || money(track.price))} • Direct artist purchase</p>
        </div>
        <button class="preview-btn" type="button" ${track.preview_url ? `data-preview="${attr(track.product_id)}"` : 'disabled'}>
          ${track.preview_url ? 'Play' : 'No preview'}
        </button>
        <button class="mini-add" type="button" data-add="${attr(track.product_id)}">Buy</button>
      </article>
    `).join('');

    const firstPlayable = tracks.find(t => t.preview_url);
    if (firstPlayable) setActivePreview(firstPlayable, false);
  }

  // ── Gallery and Video ─────────────────────────────────
  function renderGallery() {
    const media = STORE.media || {};
    const section = document.getElementById('gallerySection');
    const grid = document.getElementById('galleryGrid');
    if (!section || !grid) return;

    if (!media.gallery_enabled || !media.gallery_images || media.gallery_images.length === 0) {
      section.style.display = 'none';
      return;
    }
    section.style.display = 'block';
    grid.className = 'gallery-grid ' + (media.gallery_layout || 'mosaic');
    grid.innerHTML = media.gallery_images.map(url =>
      `<div class="gallery-item"><img src="${escapeHTML(url)}" alt="Gallery image" loading="lazy"></div>`
    ).join('');
  }

  function renderVideo() {
    const media = STORE.media || {};
    const section = document.getElementById('videoSection');
    const embed = document.getElementById('videoEmbed');
    const title = document.getElementById('videoTitle');
    if (!section || !embed) return;

    if (!media.video_enabled || !media.video_url) {
      section.style.display = 'none';
      return;
    }
    section.style.display = 'block';
    if (title) title.textContent = media.video_title || 'Featured video';

    let videoId = '';
    const url = media.video_url;
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    } else if (url.includes('watch?v=')) {
      videoId = url.split('v=')[1].split('&')[0];
    } else if (url.includes('embed/')) {
      videoId = url.split('embed/')[1].split('?')[0];
    }
    if (videoId) {
      embed.innerHTML = `<iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
    } else {
      embed.innerHTML = `<p style="color:var(--store-muted);">Invalid video URL</p>`;
    }
  }

  // ─── Cart Functions ────────────────────────────────────
  function addToCart(productId, quantity = 1) {
    const product = getProduct(productId);
    if (!product) return;

    let variant = null;
    if (isMerch(product)) {
      if (product.has_variants) {
        variant = selectedVariantForProduct(product);
        if (!variant) {
          alert('Please select a size first.');
          return;
        }
      } else {
        alert('This merch item is missing sizes. Please contact ZVAKHO.');
        return;
      }
    }

    const cartKey = variant ? `${product.product_id}::${variant.variant_id}` : product.product_id;
    const existing = CART.find(item => item.cart_key === cartKey);
    if (existing) {
      existing.quantity += quantity;
    } else {
      CART.push({
        cart_key: cartKey,
        product_id: product.product_id,
        variant_id: variant ? variant.variant_id : '',
        product_name: product.product_name,
        product_type: product.product_type,
        color: variant ? variant.color : '',
        size_code: variant ? variant.size_code : '',
        size_label: variant ? variant.size_label : '',
        price: Number(product.price || 0),
        quantity
      });
    }
    updateCartUI();
    openCart();
  }

  function cartTotal() {
    return CART.reduce((total, item) => total + Number(item.price || 0) * Number(item.quantity || 1), 0);
  }

  function cartCount() {
    return CART.reduce((total, item) => total + Number(item.quantity || 1), 0);
  }

  function cartItemLabel(item) {
    const variantLabel = [item.color, item.size_code].filter(Boolean).join(' ');
    return variantLabel ? `${item.product_name} (${variantLabel})` : item.product_name;
  }

  function updateCartUI() {
    const count = cartCount();
    const countEl = $('#cartCount');
    if (countEl) countEl.textContent = count;
    const mobileCount = $('#mobileCartCount');
    if (mobileCount) mobileCount.textContent = count;
    const totalEl = $('#cartTotal');
    if (totalEl) totalEl.textContent = money(cartTotal());
    const mobileBar = $('#mobileBuyBar');
    if (mobileBar) mobileBar.hidden = count === 0;

    const items = $('#cartItems');
    if (!items) return;
    if (!CART.length) {
      items.innerHTML = `<div class="cart-empty">Your cart is empty.</div>`;
      return;
    }
    items.innerHTML = CART.map(item => `
      <div class="cart-item">
        <div>
          <strong>${escapeHTML(cartItemLabel(item))}</strong><br>
          <span>${escapeHTML(money(item.price))} × ${item.quantity}</span>
          <div class="qty-controls">
            <button type="button" data-qty="${attr(item.cart_key)}" data-step="-1">−</button>
            <span>${item.quantity}</span>
            <button type="button" data-qty="${attr(item.cart_key)}" data-step="1">+</button>
          </div>
        </div>
        <div>
          <strong>${escapeHTML(money(item.price * item.quantity))}</strong><br>
          <button class="remove-item" type="button" data-remove="${attr(item.cart_key)}">Remove</button>
        </div>
      </div>
    `).join('');
  }

  function changeQuantity(cartKey, step) {
    const item = CART.find(c => c.cart_key === cartKey);
    if (!item) return;
    item.quantity += step;
    if (item.quantity <= 0) {
      CART = CART.filter(c => c.cart_key !== cartKey);
    }
    updateCartUI();
  }

  function removeFromCart(cartKey) {
    CART = CART.filter(c => c.cart_key !== cartKey);
    updateCartUI();
  }

  function openCart() {
    const drawer = $('#cartDrawer');
    if (drawer) {
      drawer.classList.add('is-open');
      drawer.setAttribute('aria-hidden', 'false');
    }
  }

  function closeCart() {
    const drawer = $('#cartDrawer');
    if (drawer) {
      drawer.classList.remove('is-open');
      drawer.setAttribute('aria-hidden', 'true');
    }
  }

  // ─── Preview Player ───────────────────────────────────
  function setActivePreview(product, autoplay = true) {
    if (!product || !product.preview_url) return;
    ACTIVE_PREVIEW_PRODUCT = product;
    const player = $('#floatingPlayer');
    const audio = $('#audioPreview');
    const title = $('#playerTitle');
    const artist = $('#playerArtist');
    if (title) title.textContent = product.product_name;
    if (artist) artist.textContent = STORE.artist.artist_name;
    if (audio) audio.src = product.preview_url;
    if (player) player.hidden = false;
    const toggle = $('#playerToggle');
    if (toggle) toggle.textContent = '▶';
    if (autoplay && audio) {
      audio.play().then(() => {
        if (toggle) toggle.textContent = 'Ⅱ';
      }).catch(() => {});
    }
  }

  function togglePreview() {
    const audio = $('#audioPreview');
    if (!audio || !audio.src) return;
    const toggle = $('#playerToggle');
    if (audio.paused) {
      audio.play();
      if (toggle) toggle.textContent = 'Ⅱ';
    } else {
      audio.pause();
      if (toggle) toggle.textContent = '▶';
    }
  }

  // ─── Checkout ─────────────────────────────────────────
  async function checkout() {
    if (!STORE || !CART.length) {
      openCart();
      return;
    }

    const phone = $('#customerPhone')?.value?.trim() || '';
    const email = $('#customerEmail')?.value?.trim() || '';
    const note = $('#checkoutNote');
    const btn = $('#checkoutBtn');

    if (!phone) {
      if (note) note.textContent = 'Enter your EcoCash number first.';
      return;
    }
    if (!email) {
      if (note) note.textContent = 'Enter your email first. Paynow requires an email.';
      return;
    }

    if (btn) btn.disabled = true;
    if (btn) btn.textContent = 'Sending prompt...';
    if (note) note.textContent = 'Creating your order and sending the mobile payment prompt...';

    try {
      const response = await fetch(api('/web-checkout'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artist_id: STORE.artist.artist_id,
          artist_name: STORE.artist.artist_name,
          customer_name: 'Guest',
          customer_phone: phone,
          customer_email: email,
          items: CART.map(item => ({
            product_id: item.product_id,
            variant_id: item.variant_id || '',
            quantity: item.quantity
          }))
        })
      });

      const data = await response.json();
      if (!response.ok || data.status !== 'success') {
        throw new Error(data.message || 'Checkout failed.');
      }

      if (note) note.textContent = 'Payment prompt sent. Enter your PIN on your phone.';
      if (btn) btn.textContent = 'Prompt sent';

      CART = [];
      updateCartUI();

    } catch (error) {
      if (note) note.textContent = error.message || 'Checkout failed. Please try again.';
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Checkout';
      }
    }
  }

  // ─── Event Binding ────────────────────────────────────
  function bindEvents() {
    document.addEventListener('click', (event) => {
      const variantButton = event.target.closest('[data-variant-select]');
      if (variantButton) {
        const productId = variantButton.dataset.variantSelect;
        const variantId = variantButton.dataset.variantId;
        SELECTED_VARIANTS[productId] = variantId;
        rerenderVariantProduct(productId);
        return;
      }

      const add = event.target.closest('[data-add]');
      if (add) {
        addToCart(add.dataset.add);
        return;
      }

      const preview = event.target.closest('[data-preview]');
      if (preview) {
        const product = getProduct(preview.dataset.preview);
        setActivePreview(product, true);
        return;
      }

      const open = event.target.closest('[data-cart-open]');
      if (open) {
        openCart();
        return;
      }

      const close = event.target.closest('[data-cart-close]');
      if (close) {
        closeCart();
        return;
      }

      const qty = event.target.closest('[data-qty]');
      if (qty) {
        changeQuantity(qty.dataset.qty, Number(qty.dataset.step || 0));
        return;
      }

      const remove = event.target.closest('[data-remove]');
      if (remove) {
        removeFromCart(remove.dataset.remove);
        return;
      }
    });

    const checkoutBtn = $('#checkoutBtn');
    if (checkoutBtn) checkoutBtn.addEventListener('click', checkout);

    const playerToggle = $('#playerToggle');
    if (playerToggle) playerToggle.addEventListener('click', togglePreview);

    const playerBuy = $('#playerBuy');
    if (playerBuy) {
      playerBuy.addEventListener('click', () => {
        if (ACTIVE_PREVIEW_PRODUCT) {
          addToCart(ACTIVE_PREVIEW_PRODUCT.product_id);
        }
      });
    }

    const audioPreview = $('#audioPreview');
    if (audioPreview) {
      audioPreview.addEventListener('ended', () => {
        const toggle = $('#playerToggle');
        if (toggle) toggle.textContent = '▶';
      });
    }
  }

  // ─── Main Initialisation ──────────────────────────────
  async function initStore() {
    bindEvents();

    const slug = slugFromURL();
    const grid = $('#productGrid');

    if (!slug) {
      if (grid) {
        grid.innerHTML = `
          <div class="empty">
            Artist not found. Open a store with <strong>/store/?artist=artist-slug</strong>.
          </div>
        `;
      }
      return;
    }

    try {
      const url = api(`/store-config?artist=${encodeURIComponent(slug)}`);
      STORE = await fetchJSON(url);

      // Ensure industry_preference fallback
      if (STORE.artist && !STORE.artist.industry_preference) {
        STORE.artist.industry_preference = 'streetwear';
      }

      // Apply skin if available
      if (typeof SkinManager !== 'undefined') {
        const skinManager = new SkinManager();
        const detectedSkin = skinManager.detectIndustry(STORE.artist);
        const skin = skinManager.applySkin(detectedSkin);
        STORE.active_skin = skin;
      }

      applyTheme(STORE.artist, STORE.theme || {});
      updateGlobalUI();
      renderFeatured();
      renderProducts();
      renderMusic();
      renderGallery();
      renderVideo();
      updateCartUI();

    } catch (error) {
      if (grid) {
        grid.innerHTML = `
          <div class="empty">
            <strong>Store unavailable.</strong><br>
            ${escapeHTML(error.message || 'Please try again.')}
          </div>
        `;
      }
      const nameEl = $('#artistName');
      if (nameEl) nameEl.textContent = 'Store unavailable';
      const subEl = $('#artistSub');
      if (subEl) subEl.textContent = error.message || 'Please try again.';
    }
  }

  // ─── Start ─────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStore);
  } else {
    initStore();
  }

})();
