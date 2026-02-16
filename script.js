/* =========================
   ZVAKHO — POWER JS ADD-ON
   Drop this AFTER your current <script> (or replace your script with this by merging)
   It complements your existing code, doesn’t fight it.
   ========================= */

(() => {
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  // ===== Ripple effect on buttons
  function addRipple(e){
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';

    btn.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  }
  $$('.btn').forEach(btn => btn.addEventListener('click', addRipple));

  // ===== Stronger modal open/close animations (adds classes)
  const overlay = $('[data-overlay]');
  const modals = $$('[data-modal]');
  function getOpenModal(){
    return modals.find(m => !m.hidden);
  }

  function markModalOpenState(isOpen){
    if(!overlay) return;
    overlay.classList.toggle('is-open', isOpen);
    const m = getOpenModal();
    if(m) m.classList.toggle('is-open', isOpen);
  }

  // Hook into your existing open/close behavior by observing attribute changes
  // (so you don’t have to rewrite your modal system)
  const obs = new MutationObserver(() => {
    const anyOpen = !!getOpenModal();
    markModalOpenState(anyOpen);
  });
  modals.forEach(m => obs.observe(m, { attributes:true, attributeFilter:['hidden'] }));
  if(overlay) obs.observe(overlay, { attributes:true, attributeFilter:['hidden'] });

  // ===== Add dynamic “copy link” feedback on button (instead of alert)
  const copyBtn = $('#copyLink');
  if(copyBtn){
    const original = copyBtn.textContent.trim();
    copyBtn.addEventListener('click', async () => {
      // Your existing handler may already run; this just improves feedback text.
      // If clipboard fails, your code already prompts.
      setTimeout(() => {
        copyBtn.textContent = 'Copied ✓';
        copyBtn.style.borderColor = 'var(--accent)';
        setTimeout(() => {
          copyBtn.textContent = original;
          copyBtn.style.borderColor = '';
        }, 1200);
      }, 0);
    });
  }

  // ===== CTA urgency: swap kicker text as user scrolls (subtle, not spammy)
  const kicker = $('.kicker');
  if(kicker){
    const lines = [
      "Launch announcement • Zimbabwe & diaspora",
      "Opt-in only • No spam • Direct revenue",
      "Subscriptions + music sales • Delivered in WhatsApp"
    ];
    let idx = 0;
    let lastSwap = 0;

    const swap = () => {
      const now = Date.now();
      if(now - lastSwap < 2400) return;
      lastSwap = now;
      idx = (idx + 1) % lines.length;

      kicker.animate?.([
        { opacity: 1, transform: 'translateY(0px)' },
        { opacity: .15, transform: 'translateY(3px)' },
        { opacity: 1, transform: 'translateY(0px)' }
      ], { duration: 420, easing: 'ease-out' });

      // keep dot + rest structure
      const dot = kicker.querySelector('.dot');
      kicker.innerHTML = '';
      if(dot) kicker.appendChild(dot);
      const t = document.createElement('span');
      t.textContent = lines[idx];
      kicker.appendChild(t);
    };

    document.addEventListener('scroll', () => {
      const y = window.scrollY || document.documentElement.scrollTop;
      if(y > 40 && y < 900) swap();
    }, { passive:true });
  }

  // ===== Improve WhatsApp number guard: highlight CTA buttons if not configured
  const waNumberLooksDefault = () => {
    // Reads WHATSAPP_NUMBER if it exists in global scope
    try{
      // eslint-disable-next-line no-undef
      return (typeof WHATSAPP_NUMBER !== 'undefined') && (WHATSAPP_NUMBER === "263700000000");
    }catch(e){
      return false;
    }
  };

  function warnWhatsAppNotSet(){
    const ctas = ['#joinTop','#joinHero','#joinCard','#joinBottom','#joinSticky'];
    ctas.forEach(sel => {
      const el = $(sel);
      if(!el) return;
      el.style.boxShadow = '0 0 0 4px rgba(184,92,59,.18), var(--shadow-lg)';
      el.title = 'Set your WhatsApp number in the code first.';
    });
  }
  if(waNumberLooksDefault()) warnWhatsAppNotSet();

  // ===== Smart smooth scroll for nav links (keeps URL clean)
  $$('.nav-links a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      const target = $(id);
      if(!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', id);
    });
  });

  // ===== Slight “tilt” on the right card for premium feel (desktop only)
  const card = $('.video-container');
  if(card && window.matchMedia('(pointer:fine)').matches){
    const onMove = (e) => {
      const r = card.getBoundingClientRect();
      const cx = r.left + r.width/2;
      const cy = r.top + r.height/2;
      const dx = (e.clientX - cx) / (r.width/2);
      const dy = (e.clientY - cy) / (r.height/2);
      const rx = (-dy * 3);
      const ry = (dx * 4);
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-1px)`;
    };
    const reset = () => { card.style.transform = ''; };

    card.addEventListener('mousemove', onMove);
    card.addEventListener('mouseleave', reset);
  }
})();