export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const host = url.hostname;

    // ── 1. Redirect main domain root to home.html ──
    if ((host === 'zvakho.co.zw' || host === 'www.zvakho.co.zw') && url.pathname === '/') {
      return Response.redirect('/home.html', 302);
    }

    // ── 2. Try to serve the requested static asset ──
    // env.ASSETS is the built-in binding for static files.
    try {
      const asset = await env.ASSETS.fetch(request.clone());

      // If the asset exists, return it
      if (asset.status !== 404) {
        return asset;
      }

      // ── 3. Asset not found: SPA fallback for subdomains ──
      // If it's a subdomain, serve index.html (store page)
      if (!(host === 'zvakho.co.zw' || host === 'www.zvakho.co.zw')) {
        const index = await env.ASSETS.fetch(new Request(new URL('/', request.url), request));
        return index;
      }

      // Otherwise, return the 404
      return asset;

    } catch (error) {
      // ── 4. Fallback if anything goes wrong ──
      // This prevents crashing and gives a clear error message.
      console.error('Worker error:', error);
      return new Response('Internal server error', { status: 500 });
    }
  }
};
