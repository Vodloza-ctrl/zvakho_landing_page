const CONFIG = window.ZVAKHO_CONFIG || {};
const $ = (s, r = document) => r.querySelector(s);

const money = (n) => `$${Number(n || 0).toFixed(2)}`;
const norm = (s) => String(s || '').trim().toLowerCase();
const api = (path) => `${String(CONFIG.apiBase || '').replace(/\/$/, '')}${path}`;

function isArchivedStatus(status) {
  const s = norm(status);
  return s === 'archived' || s === 'test' || s === 'void' || s === 'cancelled' || s.includes('excluded');
}

function isPaid(row) {
  return norm(row?.payment_status) === 'paid' || norm(row?.status) === 'paid';
}

function isPending(row) {
  const s = norm(row?.payment_status || row?.status);
  return !isArchivedStatus(s) && ['pending', 'created', 'processing'].includes(s);
}

function amount(row) {
  return Number(row?.amount ?? row?.total_amount ?? row?.order_total ?? row?.price ?? row?.revenue ?? 0);
}

function orderDate(row) {
  return row?.paid_at || row?.created_at || row?.updated_at || '';
}

function niceDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString();
}

function cleanRows(rows = []) {
  return rows.filter((row) => !isArchivedStatus(row.payment_status) && !isArchivedStatus(row.paynow_status));
}

function confirmedRows(rows = []) {
  return cleanRows(rows).filter(isPaid);
}

function pendingRows(rows = []) {
  return cleanRows(rows).filter(isPending);
}

function artistById(id) {
  const key = String(id || '').toUpperCase();
  return (CONFIG.artists || []).find((a) => a.id === key || a.slug === norm(id));
}

function currentArtist() {
  const params = new URLSearchParams(location.search);
  const query = norm(params.get('artist') || params.get('artist_id'));
  const hostPart = norm(location.hostname.split('.')[0]);
  const pathPart = norm(location.pathname.split('/').filter(Boolean)[0]);

  const candidates = [query, hostPart, pathPart].filter(Boolean);
  return (CONFIG.artists || []).find((a) =>
    candidates.includes(a.slug) || candidates.includes(norm(a.id))
  ) || (CONFIG.artists || [])[0];
}

async function fetchJSON(url) {
  const res = await fetch(url, { cache: 'no-store' });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data || data.status === 'error') {
    const msg = data?.message || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

function setText(id, value) {
  const el = $(id);
  if (el) el.textContent = value;
}

function renderError(container, message) {
  if (!container) return;
  container.innerHTML = `<tr><td colspan="7" class="empty"><strong>Unable to load dashboard.</strong><br>${message}</td></tr>`;
}

function renderList(el, rows, empty = 'No confirmed data yet.') {
  if (!el) return;
  el.innerHTML = rows && rows.length
    ? rows.map((r) => `
      <div class="list-row">
        <span>${r.name || r.product_name || r.artist_name || '—'}</span>
        <strong>${r.revenue !== undefined || r.total !== undefined ? `${money(r.revenue ?? r.total)} · ` : ''}${r.paid_orders ?? r.sales_count ?? r.count ?? 0}</strong>
      </div>
    `).join('')
    : `<div class="empty">${empty}</div>`;
}

function renderGuidance(el, items = []) {
  if (!el) return;
  el.innerHTML = items.length
    ? items.map((item) => `<div class="list-row"><span>${item}</span></div>`).join('')
    : `<div class="empty">No system guidance available yet.</div>`;
}

function renderRows(body, rows, mode) {
  if (!body) return;

  const visible = cleanRows(rows).slice(0, 50);
  if (!visible.length) {
    body.innerHTML = `<tr><td colspan="7" class="empty">No visible platform transactions. Archived, test, and excluded records are not displayed here.</td></tr>`;
    return;
  }

  body.innerHTML = visible.map((o) => {
    const artist = artistById(o.artist_id)?.name || o.artist_name || o.artist_id || '—';
    const status = o.payment_status || o.paynow_status || o.status || '—';
    const customer = o.customer_phone || o.phone || o.customer_email || o.email || 'Not stored';
    return `
      <tr>
        <td>${niceDate(orderDate(o))}</td>
        <td>${mode === 'artist' ? (o.artist_name || artist) : artist}</td>
        <td>${o.product_name || o.order_product || o.title || '—'}</td>
        <td>${money(amount(o))}</td>
        <td>${customer}</td>
        <td>${status}</td>
        <td>${o.payment_reference || o.transaction_reference || o.reference || '—'}</td>
      </tr>
    `;
  }).join('');
}

function getOwnerKey() {
  const params = new URLSearchParams(location.search);
  const fromUrl = params.get('key');
  if (fromUrl) {
    localStorage.setItem('zvakho_owner_key', fromUrl);
    return fromUrl;
  }

  const saved = localStorage.getItem('zvakho_owner_key');
  if (saved) return saved;

  const key = prompt('Enter your ZVAKHO owner dashboard key');
  if (key) localStorage.setItem('zvakho_owner_key', key);
  return key || '';
}

function renderArtists() {
  const el = $('#artistsGrid');
  if (!el) return;
  el.innerHTML = (CONFIG.artists || []).map((a) => `
    <article class="artist-card">
      <img src="${a.image}" alt="${a.name}">
      <div class="pad">
        <div class="eyebrow">Active artist</div>
        <h3>${a.name}</h3>
        <p>${a.positioning}</p>
        <a class="btn" href="/${a.slug}/">Open official store</a>
      </div>
    </article>
  `).join('');
}

async function renderStore() {
  const root = $('#tracks');
  if (!root) return;

  const artist = currentArtist();
  if (!artist) return;

  document.title = `${artist.name} — Official ZVAKHO Store`;

  const hero = $('#storeHero');
  if (hero) hero.style.backgroundImage = `url('${artist.header}')`;

  setText('#artistName', artist.name);
  setText('#artistSub', 'Official direct music purchases. Tracks, releases, and selected campaigns are completed through WhatsApp and fulfilled after confirmed payment.');

  const wa = $('#artistWa');
  if (wa) {
    wa.href = artist.wa;
    wa.textContent = `Enter ${artist.name} sales funnel`;
  }

  root.innerHTML = '<div class="empty">Loading official store…</div>';

  try {
    const data = await fetchJSON(api(`/artist-store?artist_id=${encodeURIComponent(artist.id)}`));
    const products = Array.isArray(data.products) ? data.products : [];

    if (!products.length) {
      root.innerHTML = `<div class="empty"><strong style="color:var(--ink)">Official catalogue opens in WhatsApp.</strong><br>No public product list is displayed yet. Use the button above to enter the artist’s active ZVAKHO sales funnel.</div>`;
      return;
    }

    root.innerHTML = products.map((p) => `
      <div class="track">
        <div>
          <strong>${p.product_name || 'Music release'}</strong><br>
          <span style="color:var(--muted)">${p.description || 'Delivered after confirmed payment.'}</span>
        </div>
        <div class="price">${p.price_label || 'Price shown in WhatsApp'}</div>
        <a class="btn primary" href="${p.whatsapp_link || artist.wa}">${p.cta_label || 'Purchase via WhatsApp'}</a>
      </div>
    `).join('');
  } catch (err) {
    root.innerHTML = `<div class="empty"><strong style="color:var(--ink)">Store data is temporarily unavailable.</strong><br>Use the WhatsApp sales funnel button above to continue.</div>`;
  }
}

async function renderDashboard(mode) {
  const body = $('#ordersBody');
  if (!body) return;

  const refresh = $('#refreshBtn');
  const artist = mode === 'artist' ? currentArtist() : null;

  if (mode === 'artist' && $('#dashArtistName') && artist) {
    $('#dashArtistName').textContent = `${artist.name} revenue dashboard`;
  }

  async function load() {
    body.innerHTML = '<tr><td colspan="7">Loading dashboard data…</td></tr>';

    try {
      let data;
      if (mode === 'artist') {
        data = await fetchJSON(api(`/artist-dashboard?artist_id=${encodeURIComponent(artist.id)}`));
      } else {
        const key = getOwnerKey();
        data = await fetchJSON(api(`/owner-dashboard?key=${encodeURIComponent(key)}`));
      }

      const summary = data.summary || {};
      const recent = mode === 'artist' ? (data.recent_sales || []) : (data.recent_orders || []);
      const cleanRecent = cleanRows(recent);
      const paidRecent = confirmedRows(recent);
      const pendingRecent = pendingRows(mode === 'artist' ? recent : (data.pending_orders || []));

      const confirmedRevenue = Number(summary.total_revenue || paidRecent.reduce((sum, row) => sum + amount(row), 0));
      const paidOrders = Number(summary.paid_orders || summary.total_sales || paidRecent.length || 0);
      const pendingCount = pendingRecent.length;

      setText('#mRevenue', money(confirmedRevenue));
      setText('#mOrders', String(mode === 'artist' ? paidOrders : (paidOrders + pendingCount)));
      setText('#mArtists', String(summary.active_artists || (mode === 'artist' ? 1 : (data.artist_leaderboard || []).length || 0)));
      setText('#mCustomers', String(summary.unique_customers || summary.unique_buyers || 0));
      setText('#mToday', money(summary.today_revenue || 0));
      setText('#mSeven', money(summary.revenue_7_days || 0));
      setText('#mPending', String(pendingCount));
      setText('#mUpdated', new Date().toLocaleTimeString());
      setText('#mBest', data.best_product?.product_name || (data.product_performance || [])[0]?.product_name || '—');

      if (mode === 'artist') {
        renderList(
          $('#productLeaderboard'),
          (data.product_performance || []).map((p) => ({ name: p.product_name, revenue: p.revenue, count: p.sales_count })),
          'No confirmed product performance yet.'
        );
        renderGuidance($('#nextActions'), data.dashboard_guidance || data.next_actions || []);
        renderRows(body, cleanRecent, mode);
      } else {
        renderList(
          $('#artistLeaderboard'),
          (data.artist_leaderboard || []).filter((a) => Number(a.revenue || 0) > 0).map((a) => ({ name: a.artist_name || a.artist_id, revenue: a.revenue, count: a.paid_orders })),
          'No confirmed artist revenue yet.'
        );
        renderList(
          $('#productLeaderboard'),
          (data.product_leaderboard || []).map((p) => ({ name: `${p.product_name} — ${p.artist_name || p.artist_id}`, revenue: p.revenue, count: p.sales_count })),
          'No confirmed product revenue yet.'
        );
        renderRows(body, cleanRecent, mode);
      }
    } catch (err) {
      renderError(body, err.message || 'Unknown error');
    }
  }

  if (refresh) refresh.addEventListener('click', load);
  load();
  setInterval(load, CONFIG.refreshMs || 20000);
}

renderArtists();
renderStore();
if (document.body.dataset.dashboard) renderDashboard(document.body.dataset.dashboard);
