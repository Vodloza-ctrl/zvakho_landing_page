// ================================================================
// ZVAKHO — Frontend Configuration (Multi‑tenant)
// ================================================================

// ─── API Base URL ──────────────────────────────────────────────
// The Worker’s public URL. Use a custom domain if available.
export const API_BASE = 'https://zvakho-workers-universal.yasibomedia.workers.dev';

// ─── Frontend Base URL ─────────────────────────────────────────
// Used for redirects and links.
export const APP_BASE = 'https://zvakho.co.zw';

// ─── Environment Detection ────────────────────────────────────
export const isDev = () =>
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname.includes('pages.dev');

// ─── Helper to get current artist ID from subdomain ───────────
export function getArtistIdFromHost() {
  const host = window.location.hostname;
  // If it's a subdomain like mdusevan.zvakho.co.zw, extract "mdusevan"
  const parts = host.split('.');
  // Assuming the pattern: <artist>.zvakho.co.zw
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

// ─── Global object for non‑module usage ──────────────────────
window.ZVAKHO_CONFIG = {
  API_BASE,
  APP_BASE,
  isDev: isDev(),
  getArtistIdFromHost,
};
