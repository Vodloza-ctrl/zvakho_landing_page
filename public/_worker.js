export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const host = url.hostname;

    // ── 1. Main domain root → redirect to home.html ──
    if ((host === 'zvakho.co.zw' || host === 'www.zvakho.co.zw') && url.pathname === '/') {
      return Response.redirect('/home.html', 302);
    }

    // ── 2. Try to serve the requested static asset ──
    try {
      const asset = await env.ASSETS.fetch(request.clone());
      if (asset.status === 404) {
        // ── 3. On subdomain, if asset not found, serve index.html (SPA) ──
        if (!(host === 'zvakho.co.zw' || host === 'www.zvakho.co.zw')) {
          const index = await env.ASSETS.fetch(new Request(new URL('/', request.url), request));
          return index;
        }
        return asset;
      }
      return asset;
    } catch (error) {
      console.error('Worker error:', error);
      return new Response('Internal server error', { status: 500 });
    }
  }
};
