const CONFIG = window.ZVAKHO_CONFIG || {};
const $ = (s, r = document) => r.querySelector(s);

let CART = [];
let STORE = null;

const money = (n) => `$${Number(n || 0).toFixed(2)}`;

const api = (path) =>
  `${String(CONFIG.apiBase || "").replace(/\/$/, "")}${path}`;

function currentArtistSlug() {
  const params = new URLSearchParams(location.search);

  const query =
    params.get("artist") ||
    params.get("slug");

  if (query) return String(query).trim().toLowerCase();

  const pathPart = location.pathname
    .split("/")
    .filter(Boolean)[0];

  return String(pathPart || "").trim().toLowerCase();
}

async function fetchJSON(url) {
  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json();

  if (!res.ok || data.status === "error") {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

function applyTheme(theme) {
  if (!theme) return;

  document.documentElement.style.setProperty(
    "--bg",
    theme.background_color || "#ffffff"
  );

  document.documentElement.style.setProperty(
    "--ink",
    theme.text_color || "#111111"
  );

  document.documentElement.style.setProperty(
    "--gold",
    theme.primary_color || "#b9822e"
  );

  document.documentElement.style.setProperty(
    "--brown",
    theme.secondary_color || "#111111"
  );
}

function updateArtistUI(artist, theme) {
  document.title = `${artist.artist_name} — Store`;

  const name = $("#artistName");
  if (name) {
    name.textContent =
      theme.hero_title || artist.artist_name;
  }

  const sub = $("#artistSub");
  if (sub) {
    sub.textContent =
      artist.tagline ||
      artist.genre ||
      "Official Store";
  }

  const hero = $("#storeHero");

  if (hero && artist.hero_image_url) {
    hero.style.backgroundImage =
      `url('${artist.hero_image_url}')`;
  }

  const wa = $("#artistWa");

  if (wa) {
    wa.href =
      `https://wa.me/${artist.whatsapp_number.replace(/\+/g, "")}?text=Buy%20${encodeURIComponent(artist.artist_name)}`;

    wa.textContent =
      `Buy ${artist.artist_name} via WhatsApp`;
  }

  // LOGO SWAP
  const navLogo = document.querySelector(".brand img");

  if (navLogo) {
    const bg =
      (theme.background_color || "").toLowerCase();

    const isDark =
      bg.includes("050505") ||
      bg.includes("111111");

    navLogo.src = isDark
      ? artist.logo_white_url
      : artist.logo_black_url;
  }
}

function cartTotal() {
  return CART.reduce(
    (sum, item) =>
      sum +
      Number(item.price || 0) *
      Number(item.quantity || 1),
    0
  );
}

function updateCartUI() {
  const box = $("#cartBox");
  const items = $("#cartItems");
  const total = $("#cartTotal");

  if (!box || !items || !total) return;

  if (!CART.length) {
    box.style.display = "none";
    items.innerHTML = "";
    total.textContent = "$0.00";
    return;
  }

  box.style.display = "block";

  items.innerHTML = CART.map(i => `
    <div class="list-row">
      <span>${i.product_name} × ${i.quantity}</span>
      <strong>${money(
        Number(i.price) * Number(i.quantity)
      )}</strong>
    </div>
  `).join("");

  total.textContent = money(cartTotal());
}

function addToCart(id, name, price) {
  const existing =
    CART.find(i => i.product_id === id);

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

async function checkout() {
  if (!STORE) {
    alert("Store unavailable.");
    return;
  }

  if (!CART.length) {
    alert("Cart is empty.");
    return;
  }

  const phone =
    $("#customerPhone")?.value.trim();

  const email =
    $("#customerEmail")?.value.trim();

  if (!phone) {
    alert("Enter your EcoCash number.");
    return;
  }

  if (!email) {
    alert("Enter your email.");
    return;
  }

  try {
    const checkoutRes = await fetch(
      api("/web-checkout"),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          artist_id: STORE.artist.artist_id,
          artist_name: STORE.artist.artist_name,
          customer_name: "Guest",
          customer_phone: phone,
          customer_email: email,
          items: CART.map(i => ({
            product_id: i.product_id,
            quantity: i.quantity
          }))
        })
      }
    );

    const checkoutData =
      await checkoutRes.json();

    if (
      checkoutData.status !== "success"
    ) {
      alert(
        checkoutData.message ||
        "Checkout failed."
      );

      console.log(checkoutData);
      return;
    }

    alert(
      "Payment prompt sent. Enter your EcoCash PIN."
    );

    CART = [];
    updateCartUI();

  } catch (err) {
    alert(err.message || "Checkout failed.");
  }
}

window.checkout = checkout;

async function renderStore() {
  const root = $("#tracks");

  if (!root) return;

  const slug = currentArtistSlug();

  if (!slug) {
    root.innerHTML =
      `<div class="empty">Artist not found.</div>`;
    return;
  }

  try {
    const data = await fetchJSON(
      api(`/store-config?artist=${slug}`)
    );

    STORE = data;

    applyTheme(data.theme);

    updateArtistUI(
      data.artist,
      data.theme
    );

    const products =
      data.products || [];

    if (!products.length) {
      root.innerHTML =
        `<div class="empty">No products available yet.</div>`;
      return;
    }

    root.innerHTML = products.map(p => {
      const safeName =
        String(
          p.product_name || "Product"
        ).replace(/'/g, "\\'");

      return `
        <div class="track-card">

          <div class="track-art">
            <img
              src="${p.main_image_url}"
              alt="${p.product_name}"
              style="
                width:100%;
                height:100%;
                object-fit:cover;
                border-radius:18px;
              "
            >
          </div>

          <div class="track-info">
            <div class="eyebrow">
              ${p.product_type}
            </div>

            <h3>${p.product_name}</h3>

            <p>
              ${p.description || ""}
            </p>

            <strong>
              ${p.price_label}
            </strong>
          </div>

          <div class="track-actions">
            <button
              class="btn primary"
              onclick="addToCart(
                '${p.product_id}',
                '${safeName}',
                ${Number(p.price || 0)}
              )"
            >
              Add to Cart
            </button>
          </div>

        </div>
      `;
    }).join("");

  } catch (err) {
    root.innerHTML = `
      <div class="empty">
        Store unavailable:
        ${err.message || "Unknown error"}
      </div>
    `;
  }
}

renderStore();
