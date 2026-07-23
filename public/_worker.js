export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const host = url.hostname;
    const path = url.pathname;

    // ── 1. Main domain root → home.html ──
    if ((host === 'zvakho.co.zw' || host === 'www.zvakho.co.zw') && path === '/') {
      return Response.redirect('/home.html', 302);
    }

    // ── 2. Dashboard subdomain → serve dashboard.html ──
    if (host === 'dashboard.zvakho.co.zw') {
      // Serve dashboard.html for any path (or just root)
      // We can serve the static file via ASSETS.
      // We'll try to fetch the requested file first, but if it's not found, serve dashboard.html.
      try {
        const asset = await env.ASSETS.fetch(request.clone());
        if (asset.status !== 404) {
          return asset;
        }
        // If not found, serve dashboard.html
        const dashboard = await env.ASSETS.fetch(new Request(new URL('/dashboard.html', request.url), request));
        return dashboard;
      } catch (e) {
        // fallback
        return new Response('Dashboard not available', { status: 500 });
      }
    }

    // ── 3. All other subdomains and main domain paths → serve static assets ──
    // If the requested file exists, serve it. Otherwise, serve index.html (SPA) for subdomains.
    try {
      const asset = await env.ASSETS.fetch(request.clone());
      if (asset.status !== 404) {
        return asset;
      }
      // Not found: for subdomains (non-main), serve index.html
      if (!(host === 'zvakho.co.zw' || host === 'www.zvakho.co.zw')) {
        const index = await env.ASSETS.fetch(new Request(new URL('/', request.url), request));
        return index;
      }
      // Main domain: just return the 404
      return asset;
    } catch (e) {
      console.error('Error in _worker.js:', e);
      return new Response('Internal server error', { status: 500 });
    }
  }
};
