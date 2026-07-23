function updateGlobalUI() {
  const { artist, theme } = STORE;

  document.title = `${artist.artist_name} — Official Store`;
  document.body.classList.remove('is-loading');

  const heroMedia = $('.hero-media');
  if (heroMedia && artist.hero_image_url) {
    heroMedia.style.backgroundImage = `url('${artist.hero_image_url}')`;
  }

  // ── FIX: Use #storeName instead of #artistName ──
  const nameEl = $('#storeName');
  if (nameEl) nameEl.textContent = theme.hero_title || artist.artist_name;

  const subEl = $('#storeSub');
  if (subEl) subEl.textContent = artist.bio || artist.tagline || artist.genre || 'Official music and merch store powered by ZVAKHO.';
  // ... rest unchanged
}
