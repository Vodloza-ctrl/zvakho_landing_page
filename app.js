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
  ) || (CONFIG.artists || [])[0];
}

async function fetchJSON(url) {
  const res = await fetch(url, { cache: 'no-store' });
  const data = await res.json();
  if (!res.ok || data.status === 'error') throw new Error(data.message);
  return data;
}

function setText(id, value) {
  const el = $(id);
  if (el) el.textContent = value;
}

// =====================
// CART
// =====================
function cartTotal() {
  return CART.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function updateCartUI() {
  const box = $('#cartBox');
  const items = $('#cartItems');
  const total = $('#cartTotal');

  if (!box) return;

  if (!CART.length) {
    box.style.display = 'none';
    return;
  }

  box.style.display = 'block';

  items.innerHTML = CART.map(i => `
    <div class="list-row">
      <span>${i.product_name} × ${i.quantity}</span>
      <strong>${money(i.price * i.quantity)}</strong>
    </div>
  `).join('');

  total.textContent = money(cartTotal());
}

function addToCart(id, name, price) {
  const existing = CART.find(i => i.product_id === id);

  if (existing) existing.quantity++;
  else CART.push({ product_id: id, product_name: name, price, quantity: 1 });

  updateCartUI();
}

window.addToCart = addToCart;

// =====================
// CHECKOUT + PAYMENT (UPDATED)
// =====================
async function checkout() {
  const artist = currentArtist();

  if (!CART.length) {
    alert('Cart is empty');
    return;
  }

  // ✅ GET USER INPUT
  const phone = document.getElementById("customerPhone")?.value.trim();
  const email = document.getElementById("customerEmail")?.value.trim();

  if (!phone) {
    alert("Enter your EcoCash number");
    return;
  }

  if (!email) {
    alert("Enter your email");
    return;
  }

  try {
    // =====================
    // 1. CREATE ORDER
    // =====================
    const orderRes = await fetch(api('/create-cart-order'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        artist_id: artist.id,
        customer_name: 'Guest',
        customer_phone: phone,
        customer_email: email,
        items: CART.map(i => ({
          product_id: i.product_id,
          quantity: i.quantity
        }))
      })
    });

    const order = await orderRes.json();

    if (order.status !== 'success') {
      alert(order.message || 'Order failed');
      return;
    }

    // =====================
    // 2. TRIGGER PAYMENT
    // =====================
    const payRes = await fetch("https://zvakho-payments-v2.yasibomedia.workers.dev/create-payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        reference: order.payment_reference,
        amount: order.total_amount,
        email: email,
        phone: phone
      })
    });

    const pay = await payRes.json();

    if (pay.status === "ok" || pay.status === "success") {
      alert("Payment prompt sent. Enter your EcoCash PIN on your phone.");
    } else {
      alert("Payment initiation failed.");
      console.log(pay);
    }

    console.log("ORDER:", order);
    console.log("PAYMENT:", pay);

    CART = [];
    updateCartUI();

  } catch (err) {
    alert(err.message);
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

  document.title = `${artist.name} — Store`;

  setText('#artistName', artist.name);
  setText('#artistSub', 'Official purchases');

  const wa = $('#artistWa');
  if (wa) wa.href = artist.wa;

  try {
    const data = await fetchJSON(api(`/artist-store?artist_id=${artist.id}`));
    const products = data.products || [];

    root.innerHTML = products.map(p => `
      <div class="track">
        <div>
          <strong>${p.product_name}</strong><br>
          <span>${p.description}</span>
        </div>
        <div class="price">${p.price_label}</div>
        <button class="btn primary"
          onclick="addToCart('${p.product_id}', '${p.product_name}', ${p.price})">
          Add to Cart
        </button>
      </div>
    `).join('');

  } catch {
    root.innerHTML = `<div class="empty">Store unavailable</div>`;
  }
}

// =====================
renderStore();
