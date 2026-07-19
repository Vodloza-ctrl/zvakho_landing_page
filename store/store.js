// store.js — v2.0 (Brand-Centric, Dynamic Storefront)
const CONFIG = window.ZVAKHO_CONFIG || {};
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

let STORE = null;
let CART = [];
let ACTIVE_PREVIEW_PRODUCT = null;
let SELECTED_VARIANTS = {};

const api = (path) => `${String(CONFIG.apiBase || "").replace(/\/$/, "")}${path}`;
const money = (n) => `$${Number(n || 0).toFixed(2)}`;

function escapeHTML(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function attr(value) {
  return escapeHTML(value).replace(/`/g, "&#096;");
}

// ── Slug Detection (same as before) ──
function slugFromURL() {
  const params = new URLSearchParams(location.search);
  const query = params.get("brand") || params.get("slug") || params.get("artist");
  if (query) return String(query).trim().toLowerCase();

  const host = location.hostname.toLowerCase();
  const hostParts = host.split(".");
  const first = hostParts[0];
  const ignored = ["www", "zvakho", "store", "api", "assets", "localhost", "127"];
  if (host.endsWith("zvakho.co.zw") && hostParts.length >= 4 && !ignored.includes(first)) return first;
  if (hostParts.length > 2 && !ignored.includes(first)) return first;

  const pathParts = location.pathname.split("/").filter(Boolean);
  if (pathParts[0] && pathParts[0] !== "store") return pathParts[0].toLowerCase();
  if (pathParts[0] === "store" && pathParts[1]) return pathParts[1].toLowerCase();

  return "";
}

async function fetchJSON(url) {
  const response = await fetch(url, { cache: "no-store" });
  const data = await response.json();
  if (!response.ok || data.status === "error") throw new Error(data.message || "Request failed");
  return data;
}

// ── Theme / Logo Helpers ──
function isDarkColor(hex) {
  const value = String(hex || "").replace("#", "");
  if (value.length !== 6) return true;
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 150;
}

function applyTheme(brand, theme) {
  const root = document.documentElement;
  const bg = theme.background_color || "#0b0b0b";
  const text = theme.text_color || (isDarkColor(bg) ? "#ffffff" : "#111111");
  const primary = theme.primary_color || "#f5a400";
  const secondary = theme.secondary_color || "#ffffff";
  const accent = theme.accent_color || primary;

  root.style.setProperty("--store-bg", bg);
  root.style.setProperty("--store-text", text);
  root.style.setProperty("--store-primary", primary);
  root.style.setProperty("--store-secondary", secondary);
  root.style.setProperty("--store-accent", accent);
  root.style.setProperty("--store-surface", isDarkColor(bg) ? "#141414" : "#ffffff");
  root.style.setProperty("--store-muted", isDarkColor(bg) ? "rgba(255,255,255,.72)" : "rgba(17,17,17,.68)");
  root.style.setProperty("--store-line", isDarkColor(bg) ? "rgba(255,255,255,.16)" : "rgba(17,17,17,.13)");
}

function pickLogo(brand) {
  return brand.logo_url || "/assets/brand/zvakho-logo.webp";
}

function setFavicon(url) {
  const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
  link.type = 'image/x-icon';
  link.rel = 'shortcut icon';
  link.href = url;
  document.head.appendChild(link);
}

function setImage(selector, src, fallback = "/assets/brand/favicon.png") {
  const image = $(selector);
  if (!image) return;
  image.src = src || fallback;
  image.onerror = () => { image.src = fallback; };
}

// ── UI Render Functions ──
function updateGlobalUI() {
  const { artist, brand, theme, subscription, store_type } = STORE;
  const isClothing = store_type === 'clothing';
  const isMusic = store_type === 'music';
  const isHybrid = store_type === 'hybrid';

  // Store name & description
  const storeName = brand?.brand_name || artist?.artist_name || "Store";
  document.title = `${storeName} — Official Store`;
  document.body.classList.remove("is-loading");

  // Hero
  $("#storeName").textContent = storeName;
  $("#storeSub").textContent = brand?.tagline || artist?.tagline || "Official store";
  $("#storeKicker").textContent = brand?.store_mode ? `${brand.store_mode} store` : "Official Store";
  if (brand?.hero_image_url) {
    const heroMedia = $(".hero-media");
    if (heroMedia) heroMedia.style.backgroundImage = `url('${brand.hero_image_url}')`;
  }

  // Artist card (for backwards compatibility)
  $("#artistCardName").textContent = storeName;
  $("#artistGenre").textContent = brand?.genre || "Brand";

  // Logo and favicon
  const logo = pickLogo(brand || artist);
  setImage("#navLogo", logo);
  setImage("#footerLogo", logo);
  setImage("#artistProfile", logo);
  setImage("#storyProfileImage", logo);
  setFavicon(logo);

  // Story section
  $("#storyTitle").textContent = `${storeName} world`;
  $("#artistBio").textContent = brand?.bio || artist?.bio || "Official store powered by ZVAKHO.";
  $("#footerQuote").textContent = brand?.footer_quote || artist?.footer_quote || "Official store powered by ZVAKHO.";
  $("#footerArtistName").textContent = `${storeName} Official Store`;
  $("#footerMeta").textContent = brand?.genre ? `${brand.genre} • Clothing` : "Clothing • Merch";

  // ZVAKHO branding visibility based on subscription
  const isPaidPlan = subscription?.plan && !['launch', 'free'].includes(subscription.plan);
  const brandingEls = document.querySelectorAll("[data-zvakho-branding]");
  brandingEls.forEach(el => {
    el.style.display = isPaidPlan ? 'none' : 'block';
  });

  // Store type section visibility
  const musicSection = document.getElementById("musicSection");
  const merchSection = document.getElementById("merchSection");
  if (musicSection) musicSection.style.display = (isMusic || isHybrid) ? 'block' : 'none';
  if (merchSection) merchSection.style.display = (isClothing || isHybrid) ? 'block' : 'none';

  // Ticker text
  const tickerText = theme?.ticker_text || `${storeName} • OFFICIAL STORE •`;
  $("#tickerTrack").innerHTML = `
    <span>${escapeHTML(tickerText)}</span>
    <span>${escapeHTML(tickerText)}</span>
    <span>${escapeHTML(tickerText)}</span>
  `;

  renderSocials();
}

function renderSocials() {
  const row = $("#socialRow");
  const brand = STORE.brand || STORE.artist;
  const socials = [
    ["Instagram", brand?.instagram_url],
    ["TikTok", brand?.tiktok_url],
    ["YouTube", brand?.youtube_url],
    ["WhatsApp", brand?.whatsapp_number ? `https://wa.me/${brand.whatsapp_number}` : null]
  ].filter(([, url]) => url);

  if (!row) return;
  if (!socials.length) {
    row.innerHTML = `<span class="badge">Social links coming soon</span>`;
    return;
  }
  row.innerHTML = socials.map(([label, url]) => `
    <a href="${attr(url)}" target="_blank" rel="noopener" class="social-link">${escapeHTML(label)}</a>
  `).join("");
}

// ── Product Helpers (unchanged) ──
function productImage(product) { return product.main_image_url || product.image_url || "/assets/brand/favicon.png"; }
function productDescription(product) {
  if (product.description) return product.description;
  if (product.product_type === "music") return "Preview the track and buy directly from the artist.";
  if (product.preorder_enabled) return "Limited preorder item fulfilled after the drop closes.";
  return "Official product fulfilled through ZVAKHO.";
}

function productBadges(product) {
  const badges = [];
  if (product.limited_release) badges.push(`<span class="badge hot">Limited</span>`);
  if (product.preorder_enabled) badges.push(`<span class="badge">Preorder</span>`);
  if (product.product_type === "music") badges.push(`<span class="badge">Instant delivery</span>`);
  if (product.has_variants) badges.push(`<span class="badge">Choose size</span>`);
  return badges.join("");
}

function renderVariantSelector(product, context = "card") {
  if (!product.has_variants || !product.variants.length) return "";
  const selectedId = SELECTED_VARIANTS[product.product_id] || "";
  return `
    <div class="variant-block" data-variant-block="${attr(product.product_id)}">
      <div class="variant-label">Choose size</div>
      <div class="variant-options">
        ${product.variants.map(v => {
          const disabled = Number(v.stock_qty ?? 1) <= 0;
          const active = selectedId && v.variant_id === selectedId;
          return `<button class="variant-option ${active ? 'is-selected' : ''}" type="button" data-variant-select="${attr(product.product_id)}" data-variant-id="${attr(v.variant_id)}" ${disabled ? 'disabled' : ''}>${escapeHTML(v.size || 'Size')}</button>`;
        }).join('')}
      </div>
      <div class="variant-note ${selectedId ? 'is-selected' : 'needs-selection'}">
        ${selectedId ? 'Selected' : 'Please select a size before adding to cart'}
      </div>
    </div>
  `;
}

// ── Featured Card (unchanged but uses new data) ──
function renderFeatured() {
  const product = STORE.featured_product || null;
  const box = $("#featuredProduct");
  if (!box) return;
  if (!product) {
    box.innerHTML = `<div class="featured-placeholder">No featured product yet.</div>`;
    return;
  }

  $("#featuredTitle").textContent = product.product_name || "Featured drop";
  $("#featuredCopy").textContent = productDescription(product);

  box.innerHTML = `
    <div class="featured-card-inner">
      <div class="featured-image">
        <img src="${attr(productImage(product))}" alt="${attr(product.product_name)}" onerror="this.parentElement.innerHTML='<div class=&quot;product-media-fallback&quot;>${escapeHTML((product.product_name || 'Z').slice(0,2).toUpperCase())}</div>'">
      </div>
      <div class="featured-info">
        <div class="featured-badges">${productBadges(product)}</div>
        <h3>${escapeHTML(product.product_name)}</h3>
        <p>${escapeHTML(productDescription(product))}</p>
        ${renderVariantSelector(product, "featured")}
        <div class="featured-price">${escapeHTML(product.price_label || money(product.price))}</div>
        <div class="featured-actions">
          <button class="btn hero-primary" type="button" data-add="${attr(product.product_id)}">Add to cart</button>
          ${product.preview_url ? `<button class="btn hero-secondary" type="button" data-preview="${attr(product.product_id)}">Play preview</button>` : ''}
        </div>
      </div>
    </div>
  `;
}

// ── Product Grid ──
function renderProducts() {
  const grid = $("#productGrid");
  const products = STORE.products || [];
  if (!grid) return;
  if (!products.length) {
    grid.innerHTML = `<div class="empty">No products available yet.</div>`;
    return;
  }

  // Sort: clothing first, then music
  const sorted = [...products].sort((a, b) => {
    if (a.product_type === 'music' && b.product_type !== 'music') return 1;
    if (b.product_type === 'music' && a.product_type !== 'music') return -1;
    return 0;
  });

  grid.innerHTML = sorted.map(product => `
    <article class="product-card">
      <div class="product-media">
        <img src="${attr(productImage(product))}" alt="${attr(product.product_name)}" loading="lazy" onerror="this.remove();this.parentElement.textContent='${escapeHTML((product.product_name || 'Z').slice(0,2).toUpperCase())}'">
      </div>
      <div class="product-body">
        <div class="product-type">${escapeHTML(product.product_type || "Apparel")}</div>
        <h3>${escapeHTML(product.product_name)}</h3>
        <p>${escapeHTML(productDescription(product))}</p>
        <div class="featured-badges">${productBadges(product)}</div>
        ${renderVariantSelector(product, "card")}
        <div class="product-foot">
          <span class="product-price">${escapeHTML(product.price_label || money(product.price))}</span>
          <button class="product-add" type="button" data-add="${attr(product.product_id)}">Add</button>
        </div>
      </div>
    </article>
  `).join("");
}

// ── Music Section (optional) ──
function renderMusic() {
  const list = $("#musicList");
  const musicProducts = STORE.products?.filter(p => p.product_type === "music") || [];
  if (!list) return;
  if (!musicProducts.length) {
    list.innerHTML = `<div class="empty">No music previews available yet.</div>`;
    $("#floatingPlayer").hidden = true;
    return;
  }

  list.innerHTML = musicProducts.map(track => `
    <article class="music-row">
      <div class="music-art">
        <img src="${attr(productImage(track))}" alt="${attr(track.product_name)}" onerror="this.remove();this.parentElement.textContent='${escapeHTML((track.product_name || 'Z').slice(0,2).toUpperCase())}'">
      </div>
      <div>
        <h3>${escapeHTML(track.product_name)}</h3>
        <p>${escapeHTML(track.price_label || money(track.price))} • Direct purchase</p>
      </div>
      <button class="preview-btn" type="button" ${track.preview_url ? `data-preview="${attr(track.product_id)}"` : "disabled"}>${track.preview_url ? "Play" : "No preview"}</button>
      <button class="mini-add" type="button" data-add="${attr(track.product_id)}">Buy</button>
    </article>
  `).join("");

  const firstPlayable = musicProducts.find(t => t.preview_url);
  if (firstPlayable) setActivePreview(firstPlayable, false);
}

// ── Cart (mostly unchanged) ──
function addToCart(productId, quantity = 1) {
  const product = STORE.products?.find(p => p.product_id === productId);
  if (!product) return;
  let variant = null;
  if (product.has_variants) {
    const selectedId = SELECTED_VARIANTS[productId];
    variant = product.variants.find(v => v.variant_id === selectedId);
    if (!variant) { alert("Please select a size first."); return; }
  }
  const cartKey = variant ? `${productId}::${variant.variant_id}` : productId;
  const existing = CART.find(item => item.cart_key === cartKey);
  if (existing) existing.quantity += quantity;
  else {
    CART.push({
      cart_key: cartKey,
      product_id: productId,
      variant_id: variant ? variant.variant_id : "",
      product_name: product.product_name,
      product_type: product.product_type,
      color: variant?.color || "",
      size: variant?.size || "",
      price: Number(product.price || 0),
      quantity
    });
  }
  updateCartUI();
  openCart();
}

function cartTotal() { return CART.reduce((t, i) => t + Number(i.price) * Number(i.quantity), 0); }
function cartCount() { return CART.reduce((t, i) => t + Number(i.quantity), 0); }

function updateCartUI() {
  const count = cartCount();
  $("#cartCount").textContent = count;
  $("#mobileCartCount").textContent = count;
  $("#cartTotal").textContent = money(cartTotal());
  const bar = $("#mobileBuyBar");
  if (bar) bar.hidden = count === 0;
  const items = $("#cartItems");
  if (!items) return;
  if (!CART.length) {
    items.innerHTML = `<div class="cart-empty">Your cart is empty.</div>`;
    return;
  }
  items.innerHTML = CART.map(item => `
    <div class="cart-item">
      <div>
        <strong>${escapeHTML(item.product_name + (item.size ? ` (${item.size})` : ''))}</strong><br>
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
  `).join("");
}

function changeQuantity(cartKey, step) {
  const item = CART.find(i => i.cart_key === cartKey);
  if (!item) return;
  item.quantity += step;
  if (item.quantity <= 0) CART = CART.filter(i => i.cart_key !== cartKey);
  updateCartUI();
}

function removeFromCart(cartKey) {
  CART = CART.filter(i => i.cart_key !== cartKey);
  updateCartUI();
}

function openCart() { document.getElementById("cartDrawer").classList.add("is-open"); }
function closeCart() { document.getElementById("cartDrawer").classList.remove("is-open"); }

function setActivePreview(product, autoplay = true) {
  if (!product || !product.preview_url) return;
  ACTIVE_PREVIEW_PRODUCT = product;
  const player = $("#floatingPlayer");
  const audio = $("#audioPreview");
  $("#playerTitle").textContent = product.product_name;
  $("#playerArtist").textContent = STORE.brand?.brand_name || STORE.artist?.artist_name || "Store";
  audio.src = product.preview_url;
  player.hidden = false;
  $("#playerToggle").textContent = "▶";
  if (autoplay) {
    audio.play().then(() => { $("#playerToggle").textContent = "Ⅱ"; }).catch(() => {});
  }
}

function togglePreview() {
  const audio = $("#audioPreview");
  if (!audio.src) return;
  if (audio.paused) {
    audio.play();
    $("#playerToggle").textContent = "Ⅱ";
  } else {
    audio.pause();
    $("#playerToggle").textContent = "▶";
  }
}

// ── Checkout ──
async function checkout() {
  if (!STORE || !CART.length) { openCart(); return; }
  const phone = $("#customerPhone").value.trim();
  const email = $("#customerEmail").value.trim();
  const note = $("#checkoutNote");
  const btn = $("#checkoutBtn");
  if (!phone) { note.textContent = "Enter your EcoCash number first."; return; }
  if (!email) { note.textContent = "Enter your email first. Paynow requires an email."; return; }
  btn.disabled = true;
  btn.textContent = "Sending prompt...";
  note.textContent = "Creating your order and sending the mobile payment prompt...";

  try {
    const artistId = STORE.brand?.brand_id || STORE.artist?.artist_id || "general";
    const artistName = STORE.brand?.brand_name || STORE.artist?.artist_name || "Store";
    const response = await fetch(api("/web-checkout"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        artist_id: artistId,
        artist_name: artistName,
        customer_name: "Guest",
        customer_phone: phone,
        customer_email: email,
        items: CART.map(item => ({
          product_id: item.product_id,
          variant_id: item.variant_id || "",
          quantity: item.quantity
        }))
      })
    });
    const data = await response.json();
    if (!response.ok || data.status !== "success") throw new Error(data.message || "Checkout failed.");
    note.textContent = "Payment prompt sent. Enter your PIN on your phone.";
    btn.textContent = "Prompt sent";
    CART = [];
    updateCartUI();
  } catch (error) {
    note.textContent = error.message || "Checkout failed. Please try again.";
    btn.disabled = false;
    btn.textContent = "Checkout";
  }
}

// ── Event Binding ──
function bindEvents() {
  document.addEventListener("click", (e) => {
    // Variant selection
    const variantButton = e.target.closest("[data-variant-select]");
    if (variantButton) {
      const productId = variantButton.dataset.variantSelect;
      const variantId = variantButton.dataset.variantId;
      SELECTED_VARIANTS[productId] = variantId;
      renderFeatured();
      renderProducts();
      return;
    }
    // Add to cart
    const add = e.target.closest("[data-add]");
    if (add) { addToCart(add.dataset.add); return; }
    // Preview
    const preview = e.target.closest("[data-preview]");
    if (preview) {
      const product = STORE.products?.find(p => p.product_id === preview.dataset.preview);
      if (product) setActivePreview(product, true);
      return;
    }
    // Cart open/close
    if (e.target.closest("[data-cart-open]")) { openCart(); return; }
    if (e.target.closest("[data-cart-close]")) { closeCart(); return; }
    // Quantity
    const qty = e.target.closest("[data-qty]");
    if (qty) { changeQuantity(qty.dataset.qty, Number(qty.dataset.step || 0)); return; }
    // Remove
    const remove = e.target.closest("[data-remove]");
    if (remove) { removeFromCart(remove.dataset.remove); return; }
  });

  document.getElementById("checkoutBtn")?.addEventListener("click", checkout);
  document.getElementById("playerToggle")?.addEventListener("click", togglePreview);
  document.getElementById("playerBuy")?.addEventListener("click", () => {
    if (ACTIVE_PREVIEW_PRODUCT) addToCart(ACTIVE_PREVIEW_PRODUCT.product_id);
  });
  document.getElementById("audioPreview")?.addEventListener("ended", () => {
    document.getElementById("playerToggle").textContent = "▶";
  });
}

// ── Init ──
async function initStore() {
  bindEvents();
  const slug = slugFromURL();
  const grid = $("#productGrid");
  if (!slug) {
    if (grid) grid.innerHTML = `<div class="empty">Brand not found. Use ?brand=your-brand-slug</div>`;
    return;
  }

  try {
    STORE = await fetchJSON(api(`/store-config?brand=${encodeURIComponent(slug)}`));
    // Ensure brand exists
    if (!STORE.brand && STORE.artist) STORE.brand = STORE.artist;
    applyTheme(STORE.brand, STORE.theme || {});
    updateGlobalUI();
    renderFeatured();
    renderProducts();
    renderMusic();
    updateCartUI();
  } catch (error) {
    if (grid) grid.innerHTML = `<div class="empty"><strong>Store unavailable.</strong><br>${escapeHTML(error.message || "Please try again.")}</div>`;
    document.getElementById("storeName").textContent = "Store unavailable";
    document.getElementById("storeSub").textContent = error.message || "Please try again.";
  }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initStore);
else initStore();