// ── Import Skin System ──────────────────────────────
// Skin system is loaded from store-skins.js
// Make sure store-skins.js is loaded before store.js

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

/**
 * Artist slug detection order:
 * 1. Query string: /store/?artist=absoll
 * 2. Artist subdomain: absoll.zvakho.co.zw
 * 3. Path fallback: /absoll or /store/absoll
 */
function slugFromURL() {
  const params = new URLSearchParams(location.search);
  const query = params.get("artist") || params.get("slug");

  if (query) {
    return String(query).trim().toLowerCase();
  }

  const host = location.hostname.toLowerCase();
  const hostParts = host.split(".");
  const firstHostPart = hostParts[0];

  const ignoredSubdomains = [
    "www",
    "zvakho",
    "store",
    "api",
    "assets",
    "localhost",
    "127"
  ];

  if (
    host.endsWith("zvakho.co.zw") &&
    hostParts.length >= 4 &&
    !ignoredSubdomains.includes(firstHostPart)
  ) {
    return firstHostPart;
  }

  if (
    hostParts.length > 2 &&
    !ignoredSubdomains.includes(firstHostPart)
  ) {
    return firstHostPart;
  }

  const pathParts = location.pathname.split("/").filter(Boolean);

  if (pathParts[0] && pathParts[0] !== "store") {
    return pathParts[0].toLowerCase();
  }

  if (pathParts[0] === "store" && pathParts[1]) {
    return pathParts[1].toLowerCase();
  }

  return "";
}

async function fetchJSON(url) {
  const response = await fetch(url, { cache: "no-store" });
  const data = await response.json();

  if (!response.ok || data.status === "error") {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

function isDarkColor(hex) {
  const value = String(hex || "").replace("#", "");
  if (value.length !== 6) return true;

  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);

  return (r * 299 + g * 587 + b * 114) / 1000 < 150;
}

function layoutFromStore(artist, theme) {
  const style = String(artist.visual_style || theme.preset_id || "streetwear_dark").toLowerCase();

  if (style.includes("gospel")) return "gospel_clean";
  if (style.includes("luxury") || style.includes("minimal")) return "minimal_luxury";
  if (style.includes("fashion")) return "fashion_brand";

  return "streetwear_dark";
}

function applyTheme(artist, theme) {
  const layout = layoutFromStore(artist, theme);
  document.body.dataset.layout = layout;

  const root = document.documentElement;
  const bg = theme.background_color || "#050505";
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

function pickLogo(artist, theme) {
  const bg = theme.background_color || "#050505";

  return isDarkColor(bg)
    ? (artist.logo_white_url || artist.logo_url || "/assets/brand/zvakho-logo.webp")
    : (artist.logo_black_url || artist.logo_url || "/assets/brand/zvakho-logo.webp");
}

function setImage(selector, src, fallback = "/assets/brand/favicon.png") {
  const image = $(selector);
  if (!image) return;

  image.src = src || fallback;
  image.onerror = () => {
    image.src = fallback;
  };
}

function productsByType(type) {
  return (STORE?.products || []).filter((product) =>
    String(product.product_type || "").toLowerCase() === type
  );
}

function featuredProduct() {
  const products = STORE.products || [];
  const id = STORE.artist.featured_product_id;

  return products.find((product) => product.product_id === id)
    || products.find((product) => product.product_type === "merch")
    || products[0]
    || null;
}

function getProduct(productId) {
  return (STORE.products || []).find((product) => product.product_id === productId);
}

function getVariant(product, variantId) {
  return (product?.variants || []).find((variant) => variant.variant_id === variantId) || null;
}

function isMerch(product) {
  return String(product?.product_type || "").toLowerCase() === "merch";
}

function selectedVariantForProduct(product) {
  if (!product) return null;

  const selectedId = SELECTED_VARIANTS[product.product_id];
  return getVariant(product, selectedId);
}

function updateGlobalUI() {
  const { artist, theme } = STORE;

  document.title = `${artist.artist_name} — Official Store`;
  document.body.classList.remove("is-loading");

  const heroMedia = $(".hero-media");
  if (heroMedia && artist.hero_image_url) {
    heroMedia.style.backgroundImage = `url('${artist.hero_image_url}')`;
  }

  $("#artistName").textContent = theme.hero_title || artist.artist_name;
  $("#artistSub").textContent = artist.bio || artist.tagline || artist.genre || "Official music and merch store powered by ZVAKHO.";
  $("#artistGenre").textContent = artist.genre || "Artist";
  $("#artistCardName").textContent = artist.artist_name;
  $("#storeKicker").textContent = artist.store_mode ? `${artist.store_mode} store` : "Official Store";

  const logo = pickLogo(artist, theme);

  setImage("#navLogo", logo);
  setImage("#footerLogo", logo);
  setImage("#artistProfile", artist.profile_image_url || artist.hero_image_url || logo);
  setImage("#storyProfileImage", artist.profile_image_url || artist.hero_image_url || logo);

  $("#storyTitle").textContent = `${artist.artist_name} world`;
  $("#artistBio").textContent = artist.bio || artist.tagline || "Official music, merch and direct-to-fan releases powered by ZVAKHO.";
  $("#footerQuote").textContent = artist.footer_quote || artist.tagline || "Official store powered by ZVAKHO.";
  $("#footerArtistName").textContent = `${artist.artist_name} Official Store`;
  $("#footerMeta").textContent = [artist.genre, "Music", "Merch"].filter(Boolean).join(" • ");

  const tickerText = theme.ticker_text || `${artist.artist_name} • OFFICIAL STORE • MUSIC • MERCH • LIMITED RELEASES •`;
  $("#tickerTrack").innerHTML = `
    <span>${escapeHTML(tickerText)}</span>
    <span>${escapeHTML(tickerText)}</span>
    <span>${escapeHTML(tickerText)}</span>
  `;

  renderSocials();
}

function renderSocials() {
  const row = $("#socialRow");
  const artist = STORE.artist;

  const socials = [
    ["Instagram", artist.instagram_url],
    ["TikTok", artist.tiktok_url],
    ["YouTube", artist.youtube_url],
    ["Spotify", artist.spotify_url],
    ["Apple Music", artist.apple_music_url]
  ].filter(([, url]) => url);

  if (!socials.length) {
    row.innerHTML = `<span class="badge">Social links coming soon</span>`;
    return;
  }

  row.innerHTML = socials.map(([label, url]) => `
    <a href="${attr(url)}" target="_blank" rel="noopener">${escapeHTML(label)}</a>
  `).join("");
}

function productImage(product) {
  return product.main_image_url || product.image_url || "/assets/brand/favicon.png";
}

function productDescription(product) {
  if (product.description) return product.description;
  if (product.product_type === "music") return "Preview the track and buy directly from the artist.";
  if (product.preorder_enabled) return "Limited preorder item fulfilled after the drop closes.";
  return "Official artist product fulfilled through ZVAKHO.";
}

function productBadges(product) {
  const badges = [];

  if (product.limited_release) badges.push(`<span class="badge hot">Limited</span>`);
  if (product.preorder_enabled) badges.push(`<span class="badge">Preorder</span>`);
  if (product.product_type === "music") badges.push(`<span class="badge">Instant delivery</span>`);
  if (isMerch(product) && product.has_variants) badges.push(`<span class="badge">Choose size</span>`);

  return badges.join("");
}

function renderVariantSelector(product, context = "card") {
  if (!isMerch(product) || !product.has_variants || !(product.variants || []).length) {
    return "";
  }

  const selectedVariant = selectedVariantForProduct(product);
  const selectedId = selectedVariant?.variant_id || "";

  return `
    <div class="variant-block" data-variant-block="${attr(product.product_id)}">
      <div class="variant-label">Choose size</div>

      <div class="variant-options">
        ${(product.variants || []).map((variant) => {
          const disabled = Number(variant.stock_qty ?? 1) <= 0;
          const active = selectedId && variant.variant_id === selectedId;

          return `
            <button
              class="variant-option ${active ? "is-selected" : ""}"
              type="button"
              data-variant-select="${attr(product.product_id)}"
              data-variant-id="${attr(variant.variant_id)}"
              ${disabled ? "disabled" : ""}
            >
              ${escapeHTML(variant.size_code || variant.size_label || "Size")}
            </button>
          `;
        }).join("")}
      </div>

      <div class="variant-note ${selectedVariant ? "is-selected" : "needs-selection"}">
        ${
          selectedVariant
            ? escapeHTML(`${selectedVariant.color || ""} ${selectedVariant.size_label || selectedVariant.size_code || ""}`.trim())
            : "Please select a size before adding to cart"
        }
      </div>
    </div>
  `;
}

function renderFeatured() {
  const product = featuredProduct();
  const box = $("#featuredProduct");
  if (!box) return;

  if (!product) {
    box.innerHTML = `<div class="featured-placeholder">No featured product yet.</div>`;
    return;
  }

  $("#featuredTitle").textContent = product.product_name || "Featured drop";
  $("#featuredCopy").textContent = productDescription(product);

  box.innerHTML = `
    <div class="featured-image">
      <img
        src="${attr(productImage(product))}"
        alt="${attr(product.product_name)}"
        onerror="this.parentElement.innerHTML='<div class=&quot;product-media&quot;>${escapeHTML((product.product_name || 'Z').slice(0,2).toUpperCase())}'</div>'"
      >
    </div>

    <div class="featured-info">
      <div class="featured-badges">${productBadges(product)}</div>

      <h3>${escapeHTML(product.product_name)}</h3>

      <p>${escapeHTML(productDescription(product))}</p>

      ${renderVariantSelector(product, "featured")}

      <div class="featured-price">${escapeHTML(product.price_label || money(product.price))}</div>

      <div class="featured-actions">
        <button class="btn hero-primary" type="button" data-add="${attr(product.product_id)}">
          Add to cart
        </button>

        ${product.preview_url ? `
          <button class="btn hero-secondary" type="button" data-preview="${attr(product.product_id)}">
            Play preview
          </button>
        ` : ``}
      </div>
    </div>
  `;
}

function renderProducts() {
  const grid = $("#productGrid");
  const products = STORE.products || [];

  if (!grid) return;

  if (!products.length) {
    grid.innerHTML = `<div class="empty">No products available yet.</div>`;
    return;
  }

  // Get skin-based sorting order
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

  // Get grid columns from skin
  const gridCols = skin.layout?.grid_cols || '3';
  
  // Apply grid class
  grid.style.gridTemplateColumns = 
    gridCols === '2' ? 'repeat(2, 1fr)' : 
    gridCols === '3' ? 'repeat(3, 1fr)' : 
    gridCols === '4' ? 'repeat(4, 1fr)' : 
    'repeat(3, 1fr)';

  grid.innerHTML = sorted.map((product) => `
    <article class="product-card" data-skin="${skin.id}">
      <div class="product-media">
        <img
          src="${attr(productImage(product))}"
          alt="${attr(product.product_name)}"
          loading="lazy"
          onerror="this.remove();this.parentElement.textContent='${escapeHTML((product.product_name || 'Z').slice(0,2).toUpperCase())}'"
        >
      </div>

      <div class="product-body">
        <div class="product-type">${escapeHTML(product.product_type || "Apparel")}</div>

        <h3 style="font-family:var(--skin-font-heading, inherit)">${escapeHTML(product.product_name)}</h3>

        <p>${escapeHTML(productDescription(product))}</p>

        <div class="featured-badges">${productBadges(product)}</div>

        ${renderVariantSelector(product, "card")}

        <div class="product-foot">
          <span class="product-price">${escapeHTML(product.price_label || money(product.price))}</span>
          <button class="product-add" type="button" data-add="${attr(product.product_id)}">
            Add
          </button>
        </div>
      </div>
    </article>
  `).join("");
}

function renderMusic() {
  const list = $("#musicList");
  const tracks = productsByType("music");

  if (!list) return;

  if (!tracks.length) {
    list.innerHTML = `<div class="empty">No music previews available yet.</div>`;
    $("#floatingPlayer").hidden = true;
    return;
  }

  list.innerHTML = tracks.map((track) => `
    <article class="music-row">
      <div class="music-art">
        <img
          src="${attr(productImage(track))}"
          alt="${attr(track.product_name)}"
          onerror="this.remove();this.parentElement.textContent='${escapeHTML((track.product_name || 'Z').slice(0,2).toUpperCase())}'"
        >
      </div>

      <div>
        <h3>${escapeHTML(track.product_name)}</h3>
        <p>${escapeHTML(track.price_label || money(track.price))} • Direct artist purchase</p>
      </div>

      <button class="preview-btn" type="button" ${track.preview_url ? `data-preview="${attr(track.product_id)}"` : `disabled`}>
        ${track.preview_url ? "Play" : "No preview"}
      </button>

      <button class="mini-add" type="button" data-add="${attr(track.product_id)}">
        Buy
      </button>
    </article>
  `).join("");

  const firstPlayable = tracks.find((track) => track.preview_url);
  if (firstPlayable) setActivePreview(firstPlayable, false);
}

function addToCart(productId, quantity = 1) {
  const product = getProduct(productId);
  if (!product) return;

  let variant = null;

  if (isMerch(product)) {
    if (product.has_variants) {
      variant = selectedVariantForProduct(product);

      if (!variant) {
        alert("Please select a size first.");
        return;
      }
    } else {
      alert("This merch item is missing sizes. Please contact ZVAKHO.");
      return;
    }
  }

  const cartKey = variant
    ? `${product.product_id}::${variant.variant_id}`
    : product.product_id;

  const existing = CART.find((item) => item.cart_key === cartKey);

  if (existing) {
    existing.quantity += quantity;
  } else {
    CART.push({
      cart_key: cartKey,
      product_id: product.product_id,
      variant_id: variant ? variant.variant_id : "",
      product_name: product.product_name,
      product_type: product.product_type,
      color: variant ? variant.color : "",
      size_code: variant ? variant.size_code : "",
      size_label: variant ? variant.size_label : "",
      price: Number(product.price || 0),
      quantity
    });
  }

  updateCartUI();
  openCart();
}

function cartTotal() {
  return CART.reduce((total, item) =>
    total + Number(item.price || 0) * Number(item.quantity || 1), 0
  );
}

function cartCount() {
  return CART.reduce((total, item) =>
    total + Number(item.quantity || 1), 0
  );
}

function cartItemLabel(item) {
  const variantLabel = [item.color, item.size_code].filter(Boolean).join(" ");
  return variantLabel
    ? `${item.product_name} (${variantLabel})`
    : item.product_name;
}

function updateCartUI() {
  const count = cartCount();

  $("#cartCount").textContent = count;
  $("#mobileCartCount").textContent = count;
  $("#cartTotal").textContent = money(cartTotal());
  $("#mobileBuyBar").hidden = count === 0;

  const items = $("#cartItems");
  if (!items) return;

  if (!CART.length) {
    items.innerHTML = `<div class="cart-empty">Your cart is empty.</div>`;
    return;
  }

  items.innerHTML = CART.map((item) => `
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
        <button class="remove-item" type="button" data-remove="${attr(item.cart_key)}">
          Remove
        </button>
      </div>
    </div>
  `).join("");
}

function changeQuantity(cartKey, step) {
  const item = CART.find((cartItem) => cartItem.cart_key === cartKey);
  if (!item) return;

  item.quantity += step;

  if (item.quantity <= 0) {
    CART = CART.filter((cartItem) => cartItem.cart_key !== cartKey);
  }

  updateCartUI();
}

function removeFromCart(cartKey) {
  CART = CART.filter((item) => item.cart_key !== cartKey);
  updateCartUI();
}

function openCart() {
  const drawer = $("#cartDrawer");
  drawer.classList.add("is-open");
  drawer.setAttribute("aria-hidden", "false");
}

function closeCart() {
  const drawer = $("#cartDrawer");
  drawer.classList.remove("is-open");
  drawer.setAttribute("aria-hidden", "true");
}

function setActivePreview(product, autoplay = true) {
  if (!product || !product.preview_url) return;

  ACTIVE_PREVIEW_PRODUCT = product;

  const player = $("#floatingPlayer");
  const audio = $("#audioPreview");

  $("#playerTitle").textContent = product.product_name;
  $("#playerArtist").textContent = STORE.artist.artist_name;

  audio.src = product.preview_url;
  player.hidden = false;
  $("#playerToggle").textContent = "▶";

  if (autoplay) {
    audio.play().then(() => {
      $("#playerToggle").textContent = "Ⅱ";
    }).catch(() => {});
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

async function checkout() {
  if (!STORE || !CART.length) {
    openCart();
    return;
  }

  const phone = $("#customerPhone").value.trim();
  const email = $("#customerEmail").value.trim();
  const note = $("#checkoutNote");
  const btn = $("#checkoutBtn");

  if (!phone) {
    note.textContent = "Enter your EcoCash number first.";
    return;
  }

  if (!email) {
    note.textContent = "Enter your email first. Paynow requires an email.";
    return;
  }

  btn.disabled = true;
  btn.textContent = "Sending prompt...";
  note.textContent = "Creating your order and sending the mobile payment prompt...";

  try {
    const response = await fetch(api("/web-checkout"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        artist_id: STORE.artist.artist_id,
        artist_name: STORE.artist.artist_name,
        customer_name: "Guest",
        customer_phone: phone,
        customer_email: email,
        items: CART.map((item) => ({
          product_id: item.product_id,
          variant_id: item.variant_id || "",
          quantity: item.quantity
        }))
      })
    });

    const data = await response.json();

    if (!response.ok || data.status !== "success") {
      throw new Error(data.message || "Checkout failed.");
    }

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

function rerenderVariantProduct(productId) {
  const product = getProduct(productId);
  if (!product) return;

  renderFeatured();
  renderProducts();
}

function bindEvents() {
  document.addEventListener("click", (event) => {
    const variantButton = event.target.closest("[data-variant-select]");
    if (variantButton) {
      const productId = variantButton.dataset.variantSelect;
      const variantId = variantButton.dataset.variantId;

      SELECTED_VARIANTS[productId] = variantId;
      rerenderVariantProduct(productId);
      return;
    }

    const add = event.target.closest("[data-add]");
    if (add) {
      addToCart(add.dataset.add);
      return;
    }

    const preview = event.target.closest("[data-preview]");
    if (preview) {
      const product = getProduct(preview.dataset.preview);
      setActivePreview(product, true);
      return;
    }

    const open = event.target.closest("[data-cart-open]");
    if (open) {
      openCart();
      return;
    }

    const close = event.target.closest("[data-cart-close]");
    if (close) {
      closeCart();
      return;
    }

    const qty = event.target.closest("[data-qty]");
    if (qty) {
      changeQuantity(qty.dataset.qty, Number(qty.dataset.step || 0));
      return;
    }

    const remove = event.target.closest("[data-remove]");
    if (remove) {
      removeFromCart(remove.dataset.remove);
    }
  });

  const checkoutBtn = $("#checkoutBtn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", checkout);
  }

  const playerToggle = $("#playerToggle");
  if (playerToggle) {
    playerToggle.addEventListener("click", togglePreview);
  }

  const playerBuy = $("#playerBuy");
  if (playerBuy) {
    playerBuy.addEventListener("click", () => {
      if (ACTIVE_PREVIEW_PRODUCT) {
        addToCart(ACTIVE_PREVIEW_PRODUCT.product_id);
      }
    });
  }

  const audioPreview = $("#audioPreview");
  if (audioPreview) {
    audioPreview.addEventListener("ended", () => {
      $("#playerToggle").textContent = "▶";
    });
  }
}

async function initStore() {
  bindEvents();

  const slug = slugFromURL();
  const productGrid = $("#productGrid");

  if (!slug) {
    if (productGrid) {
      productGrid.innerHTML = `
        <div class="empty">
          Artist not found. Open a store with <strong>/store/?artist=artist-slug</strong>.
        </div>
      `;
    }
    return;
  }

  try {
    STORE = await fetchJSON(api(`/store-config?artist=${encodeURIComponent(slug)}`));

    // ── NEW: Initialize Skin System ──────────────────
    if (typeof SkinManager !== 'undefined') {
      const skinManager = new SkinManager();
      
      // Detect industry from artist data
      const detectedSkin = skinManager.detectIndustry(STORE.artist);
      const skin = skinManager.applySkin(detectedSkin);
      
      // Store skin info for later use
      STORE.active_skin = skin;
    }

    applyTheme(STORE.artist, STORE.theme || {});
    updateGlobalUI();
    renderFeatured();
    renderProducts();
    renderMusic();
    updateCartUI();

  } catch (error) {
    if (productGrid) {
      productGrid.innerHTML = `
        <div class="empty">
          <strong>Store unavailable.</strong><br>
          ${escapeHTML(error.message || "Please try again.")}
        </div>
      `;
    }

    const artistName = $("#artistName");
    if (artistName) {
      artistName.textContent = "Store unavailable";
    }
    
    const artistSub = $("#artistSub");
    if (artistSub) {
      artistSub.textContent = error.message || "Please try again.";
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initStore);
} else {
  initStore();
}
