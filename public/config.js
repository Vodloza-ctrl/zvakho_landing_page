// ================================================================
// ZVAKHO — Frontend Configuration (Multi‑tenant)
// ================================================================

// ─── API Base URL ──────────────────────────────────────────────
// The Worker’s public URL. Use a custom domain if available.
const API_BASE = 'https://zvakho-workers-universal.yasibomedia.workers.dev';

// ─── Frontend Base URL ─────────────────────────────────────────
const APP_BASE = 'https://zvakho.co.zw';

// ─── Environment Detection ────────────────────────────────────
function isDev() {
  return window.location.hostname === 'localhost' ||
         window.location.hostname === '127.0.0.1' ||
         window.location.hostname.includes('pages.dev');
}

// ─── Helper to get current artist ID from subdomain ───────────
function getArtistIdFromHost() {
  const host = window.location.hostname;
  const parts = host.split('.');
  // If it's a subdomain like mdusevan.zvakho.co.zw, extract "mdusevan"
  if (parts.length >= 3 && parts[0] !== 'www' && parts[0] !== 'api' && parts[0] !== 'admin' && parts[0] !== 'dashboard') {
    return parts[0].toUpperCase(); // e.g., 'MDUSEVAN'
  }
  // Fallback: check URL query param
  const urlParams = new URLSearchParams(window.location.search);
  const artistParam = urlParams.get('artist_id');
  if (artistParam) return artistParam.toUpperCase();
  // Default to null or a default brand
  return null;
}

// ─── Expose globally (no `export`) ──────────────────────────
window.ZVAKHO_CONFIG = {
  API_BASE,
  APP_BASE,
  isDev: isDev(),
  getArtistIdFromHost,
};

// Also set shortcuts for convenience
window.API_BASE = API_BASE;
window.APP_BASE = APP_BASE;
