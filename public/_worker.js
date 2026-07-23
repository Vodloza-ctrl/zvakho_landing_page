// ── Pages Function for host‑based routing ──
// Uses Module Worker syntax (required for _worker.js advanced mode)

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const host = url.hostname;

    // ── Main domain: redirect root to home.html ──
    if ((host === 'zvakho.co.zw' || host === 'www.zvakho.co.zw') && url.pathname === '/') {
      return Response.redirect('/home.html', 302);
    }

    // ── For all other requests: try to serve static assets ──
    // env.ASSETS is the default binding that serves your Pages static files.
    // If the asset exists, it will be served. If not, Pages will handle the 404.
    // This also handles subdomain SPA routing: if a file isn't found,
    // we can optionally serve index.html for subdomains.

    try {
      // Attempt to serve the requested static asset
      const assetResponse = await env.ASSETS.fetch(request.clone());

      // If the asset exists and is not a 404, return it.
      if (assetResponse.status !== 404) {
        return assetResponse;
      }

      // ── If asset is not found (404) and it's a subdomain ──
      // Serve index.html for SPA routing (subdomains only)
      if (!(host === 'zvakho.co.zw' || host === 'www.zvakho.co.zw')) {
        const indexResponse = await env.ASSETS.fetch(new Request(new URL('/', request.url), request));
        return indexResponse;
      }

      // ── Main domain: return the 404 response ──
      return assetResponse;

    } catch (error) {
      // Fallback: if ASSETS fails, return a simple error
      return new Response('Server error', { status: 500 });
    }
  }
};
