const CONFIG = window.ZVAKHO_CONFIG || {};
const $ = (s, r = document) => r.querySelector(s);

let CART = [];

const money = (n) => `$${Number(n || 0).toFixed(2)}`;
const norm = (s) => String(s || '').trim().toLowerCase();
const api = (path) => `${String(CONFIG.apiBase || '').replace(/\/$/, '')}${path}`;

// =====================
// CORE HELPERS
// =====================
function artistById(id) {
  const key = String(id || '').toUpperCase();
  return (CONFIG.artists || []).find((a) => a.id === key || a.slug === norm(id));
}

function currentArtist() {
  const params = new URLSearchParams(location.search);
  const query = norm(params.get('artist') || params.get('artist_id'));
  const pathPart = norm(location.pathname.split('/').filter(Boolean)[0]);

  const candidates = [query, pathPart].filter(Boolean);

  return (CONFIG.artists || []).find((a) =>
    candidates.includes(a.slug) || candidates.includes(norm(a.id))
  ) || null;
}

async function fetchJSON(url) {
  const res = await fetch(url, { cache: 'no-store' });
  const data = await res.json();
  if (!res.ok || data.status === 'error') throw new Error(data.message || 'Request failed');
  return data;
}

function setText(id, value) {
  const el = $(id);
  if (el) el.textContent = value;
}

// =====================
// HOMEPAGE ARTISTS GRID
// =====================
function renderArtistsGrid() {
  const grid = $('#artistsGrid');
  if (!grid) return;

  const artists = (CONFIG.artists || []).filter(a => a.active !== false);

  if (!artists.length) {
    grid.innerHTML = `<div class="empty">No active artists yet.</div>`;
    return;
  }

  grid.innerHTML = artists.map(a => `
    <article class="artist-card">
      <div class="artist-image">
        <img src="${a.image || a.header || '/assets/brand/favicon.png'}" alt="${a.name || 'ZVAKHO artist'}">
      </div>
      <div class="artist-content">
        <div class="eyebrow">${a.genre || 'ZVAKHO Artist'}</div>
        <h3>${a.name || a.id}</h3>
        <p>${a.description || 'Official direct-to-fan store connected to ZVAKHO.'}</p>
        <a class="btn primary" href="/store/?artist=${a.slug || norm(a.id)}">View store</a>
      </div>
    </article>
  `).join('');
}

// =====================
// CART
// =====================
function cartTotal() {
  return CART.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0);
}

function updateCartUI() {
  const box = $('#cartBox');
  const items = $('#cartItems');
  const total = $('#cartTotal');

  if (!box || !items || !total) return;

  if (!CART.length) {
    box.style.display = 'none';
    items.innerHTML = '';
    total.textContent = '$0.00';
    return;
  }

  box.style.display = 'block';

  items.innerHTML = CART.map(i => `
    <div class="list-row">
      <span>${i.product_name} × ${i.quantity}</span>
      <strong>${money(Number(i.price) * Number(i.quantity))}</strong>
    </div>
  `).join('');

  total.textContent = money(cartTotal());
}

function addToCart(id, name, price) {
  const existing = CART.find(i => i.product_id === id);

  if (existing) {
    existing.quantity += 1;
  } else {
    CART.push({
      product_id: id,
      product_name: name,
      price: Number(price || 0),
      quantity: 1
    });
  }

  updateCartUI();
}

window.addToCart = addToCart;

// =====================
// CHECKOUT VIA STORE WORKER ADAPTER
// =====================
async function checkout() {
  const artist = currentArtist();

  if (!artist) {
    alert('Artist not found.');
    return;
  }

  if (!CART.length) {
    alert('Cart is empty.');
    return;
  }

  const phone = document.getElementById('customerPhone')?.value.trim();
  const email = document.getElementById('customerEmail')?.value.trim();

  if (!phone) {
    alert('Enter your EcoCash number.');
    return;
  }

  if (!email) {
    alert('Enter your email.');
    return;
  }

  try {
    const checkoutRes = await fetch(api('/web-checkout'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        artist_id: artist.id,
        artist_name: artist.name,
        customer_name: 'Guest',
        customer_phone: phone,
        customer_email: email,
        items: CART.map(i => ({
          product_id: i.product_id,
          quantity: i.quantity
        }))
      })
    });

    const checkoutData = await checkoutRes.json();

    if (checkoutData.status !== 'success') {
      alert(checkoutData.message || 'Checkout failed.');
      console.log('CHECKOUT ERROR:', checkoutData);
      return;
    }

    alert('Payment prompt sent. Enter your EcoCash PIN on your phone.');

    console.log('WEB CHECKOUT:', checkoutData);

    CART = [];
    updateCartUI();

  } catch (err) {
    alert(err.message || 'Checkout failed.');
  }
}

window.checkout = checkout;

// =====================
// STORE RENDER
// =====================
async function renderStore() {
  const root = $('#tracks');
  if (!root) return;

  const artist = currentArtist();

  if (!artist) {
    root.innerHTML = `<div class="empty">Artist not found.</div>`;
    return;
  }

  document.title = `${artist.name} — Store`;

  setText('#artistName', artist.name);
  setText('#artistSub', 'Official purchases');

  const wa = $('#artistWa');
  if (wa) {
    wa.href = artist.wa;
    wa.textContent = `Buy ${artist.name} via WhatsApp`;
  }

  const hero = $('#storeHero');
  if (hero && artist.header) {
    hero.style.backgroundImage = `url('${artist.header}')`;
  }

  try {
    const data = await fetchJSON(api(`/artist-store?artist_id=${encodeURIComponent(artist.id)}`));
    const products = data.products || [];

    if (!products.length) {
      root.innerHTML = `<div class="empty">No products available yet.</div>`;
      return;
    }

    root.innerHTML = products.map(p => {
      const safeName = String(p.product_name || 'Product').replace(/'/g, "\\'");
      return `
        <div class="track">
          <div>
            <strong>${p.product_name || 'Product'}</strong><br>
            <span>${p.description || 'Fulfilled after confirmed payment.'}</span>
          </div>
          <div class="price">${p.price_label || money(p.price)}</div>
          <button class="btn primary"
            onclick="addToCart('${p.product_id}', '${safeName}', ${Number(p.price || 0)})">
            Add to Cart
          </button>
        </div>
      `;
    }).join('');

  } catch (err) {
    root.innerHTML = `<div class="empty">Store unavailable: ${err.message || 'Unknown error'}</div>`;
  }
}

// =====================
// INIT
// =====================
renderArtistsGrid();
renderStore();
