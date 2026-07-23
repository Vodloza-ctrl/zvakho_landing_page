// ── Pages Function for host‑based routing ──
// This runs before static assets are served.

export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);
  const host = url.hostname;

  // ── Determine which page to serve ──
  // Main domain → root path serves home.html
  // Subdomains → root path serves index.html (store)
  // Other paths: serve the requested file if it exists, else fallback to SPA behavior.

  if (host === 'zvakho.co.zw' || host === 'www.zvakho.co.zw') {
    // Main domain: / → home.html
    if (url.pathname === '/') {
      // Redirect to /home.html (or serve directly)
      return new Response(null, {
        status: 302,
        headers: { Location: '/home.html' }
      });
    }
  }

  // ── For subdomains (or any other host) ──
  // Serve the requested file, or fallback to index.html for SPA routing
  // This uses the default static asset handling.
  // We'll let the standard asset serving handle it, but we need to ensure that
  // unknown paths on subdomains serve index.html (SPA).

  // The built-in Pages routing already serves static files.
  // We just need to intercept the root path for main domain.
  // For all other paths, we let the standard Pages logic handle it.
  // Since we only changed the root path for main domain, we can just call next().

  // However, to make subdomains SPA, we need to ensure any path serves index.html.
  // We can achieve that with a catch‑all in _redirects, but it might interfere.
  // Instead, we can handle it here:
  // If the requested file doesn't exist, serve index.html (for subdomains).

  // We'll use the built-in Pages assets with a custom fallback.
  // Pages Functions can use the `env.ASSETS` binding to serve static files.

  // Option 1: Use ASSETS to serve files, with fallback to index.html.
  // We need to check if the file exists before serving.
  // Since Pages Functions automatically handles static assets, we can just call next()
  // and let the normal Pages logic serve the file. If it's a 404, we can serve index.html.
  // But we need to differentiate between main domain and subdomains.

  // Simpler approach: use a try/catch with ASSETS to serve files.
  try {
    // Try to serve the requested file from the asset directory.
    // The ASSETS binding is available in Pages Functions.
    const asset = await env.ASSETS.fetch(request.clone());
    if (asset.status !== 404) {
      return asset;
    }
  } catch (e) {
    // If ASSETS throws, fall through.
  }

  // File not found – if it's a subdomain, serve index.html (SPA).
  if (!(host === 'zvakho.co.zw' || host === 'www.zvakho.co.zw')) {
    // Subdomain: serve index.html
    const index = await env.ASSETS.fetch(new Request(new URL('/', request.url), request));
    return index;
  }

  // Otherwise, return 404.
  return new Response('Not found', { status: 404 });
}
