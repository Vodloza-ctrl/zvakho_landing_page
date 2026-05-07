const CONFIG = window.ZVAKHO_CONFIG || {};
const $ = (selector, root = document) => root.querySelector(selector);
const api = (path) => `${String(CONFIG.apiBase || "").replace(/\/$/, "")}${path}`;

async function fetchJSON(url) {
  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json();
  if (!res.ok || data.status === "error") throw new Error(data.message || "Request failed");
  return data;
}

function safeText(value, fallback = "") {
  return String(value || fallback)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function initials(name) {
  return String(name || "ZV")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

async function renderArtistsGrid() {
  const grid = $("#artistsGrid");
  if (!grid) return;

  grid.innerHTML = `<div class="empty">Loading active artists...</div>`;

  try {
    const data = await fetchJSON(api("/artists"));
    const artists = (data.artists || []).filter((artist) => artist.is_active !== 0);

    if (!artists.length) {
      grid.innerHTML = `<div class="empty">No active artists yet.</div>`;
      return;
    }

    grid.innerHTML = artists.map((artist) => {
      const image = artist.profile_image_url || artist.hero_image_url || artist.logo_black_url || artist.logo_url || "/assets/brand/favicon.png";
      const slug = artist.slug || String(artist.artist_id || "").toLowerCase();

      return `
        <article class="artist-card">
          <img src="${safeText(image)}" alt="${safeText(artist.artist_name)}" onerror="this.src='/assets/brand/favicon.png'">
          <div class="pad">
            <div class="eyebrow">${safeText(artist.genre || "ZVAKHO Artist")}</div>
            <h3>${safeText(artist.artist_name)}</h3>
            <p>${safeText(artist.tagline || artist.bio || "Official direct-to-fan store connected to ZVAKHO.")}</p>
            <a class="btn primary" href="/store/?artist=${encodeURIComponent(slug)}">View store</a>
          </div>
        </article>
      `;
    }).join("");
  } catch (error) {
    grid.innerHTML = `
      <div class="empty">
        <strong>Artist stores are temporarily unavailable.</strong><br>
        ${safeText(error.message || "Please try again.")}
      </div>
    `;
  }
}

renderArtistsGrid();
