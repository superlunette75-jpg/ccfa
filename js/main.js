// ============================================================
//  CCFA — Centre Casablancais de Formation Appliquée
//  TOP 1% Premium Interaction Engine
// ============================================================

/* ── Utility ─────────────────────────────────────────────── */
const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

/* ══════════════════════════════════════════════════════════
   1. PRELOADER
══════════════════════════════════════════════════════════ */
(function preloader() {
  const loader  = qs('#preloader');
  const bar     = qs('#preloader-bar');
  const pct     = qs('#preloader-pct');
  if (!loader) return;

  let progress = 0;
  const target = 100;
  const speed  = 18; // ms per tick

  // Accelerate toward 100
  const tick = setInterval(() => {
    const remaining = target - progress;
    const step = Math.max(1, remaining * 0.065);
    progress = Math.min(target, progress + step);

    if (bar)  bar.style.width  = progress + '%';
    if (pct)  pct.textContent  = Math.floor(progress) + '%';

    if (progress >= target) {
      clearInterval(tick);
      setTimeout(() => {
        loader.classList.add('done');
        document.body.style.overflow = '';
        // Trigger hero word reveal after preloader exits
        setTimeout(triggerHeroReveal, 300);
      }, 350);
    }
  }, speed);

  // Prevent scroll during load
  document.body.style.overflow = 'hidden';
})();


/* ══════════════════════════════════════════════════════════
   2. CUSTOM CURSOR
══════════════════════════════════════════════════════════ */
(function cursor() {
  const dot  = qs('#cursor-dot');
  const ring = qs('#cursor-ring');
  if (!dot || !ring) return;

  // Only on true pointer devices
  if (!window.matchMedia('(hover: hover)').matches) return;

  let mx = -100, my = -100;
  let rx = -100, ry = -100;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  // Ring follows with lag via rAF
  (function animRing() {
    rx += (mx - rx) * 0.14;
    ry += (my - ry) * 0.14;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animRing);
  })();

  // Expand on interactive elements
  const hoverTargets = 'a, button, .btn, .partner-logo, .slide-dot, .prog-tab, .gallery-item';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(hoverTargets)) document.body.classList.add('cursor-hover');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(hoverTargets)) document.body.classList.remove('cursor-hover');
  });

  // Click burst
  document.addEventListener('mousedown', () => document.body.classList.add('cursor-click'));
  document.addEventListener('mouseup',   () => document.body.classList.remove('cursor-click'));
})();


/* ══════════════════════════════════════════════════════════
   3. SCROLL PROGRESS BAR
══════════════════════════════════════════════════════════ */
(function scrollProgress() {
  const bar = qs('#scroll-progress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const h = document.documentElement;
    const pct = h.scrollTop / (h.scrollHeight - h.clientHeight) * 100;
    bar.style.width = clamp(pct, 0, 100) + '%';
  }, { passive: true });
})();


/* ══════════════════════════════════════════════════════════
   4. NAVBAR
══════════════════════════════════════════════════════════ */
(function navbar() {
  const nav = qs('#navbar');
  if (!nav) return;

  // Scroll class
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
    // Back to top
    const btn = qs('#back-to-top');
    if (btn) btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  // Active section highlight
  const sections  = qsa('section[id]');
  const navLinks  = qsa('.nav-links a');
  const observer  = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navLinks.forEach(a => a.classList.remove('nav-active'));
        const active = navLinks.find(a => a.getAttribute('href') === '#' + e.target.id);
        if (active) active.classList.add('nav-active');
      }
    });
  }, { threshold: 0.35 });
  sections.forEach(s => observer.observe(s));
})();


/* ══════════════════════════════════════════════════════════
   5. MOBILE NAV
══════════════════════════════════════════════════════════ */
(function mobileNav() {
  const hamburger   = qs('#hamburger');
  const mobileNav   = qs('#mobile-nav');
  const mobileClose = qs('#mobile-nav-close');
  if (!hamburger || !mobileNav) return;

  hamburger.addEventListener('click',   () => { mobileNav.classList.add('open'); document.body.style.overflow = 'hidden'; });
  mobileClose?.addEventListener('click',() => { mobileNav.classList.remove('open'); document.body.style.overflow = ''; });
  qsa('a', mobileNav).forEach(a =>
    a.addEventListener('click', () => { mobileNav.classList.remove('open'); document.body.style.overflow = ''; })
  );
})();


/* ══════════════════════════════════════════════════════════
   6. HERO SLIDESHOW — Ken Burns
══════════════════════════════════════════════════════════ */
(function heroSlideshow() {
  const slides = qsa('.hero-slide');
  const dots   = qsa('.slide-dot');
  if (!slides.length) return;

  let current = 0;
  let interval;

  function goTo(n) {
    slides[current].classList.remove('active');
    dots[current]?.classList.remove('active');
    current = (n + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current]?.classList.add('active');
  }

  function start() { interval = setInterval(() => goTo(current + 1), 6000); }

  slides[0].classList.add('active');
  dots[0]?.classList.add('active');
  start();

  dots.forEach((dot, i) => dot.addEventListener('click', () => {
    clearInterval(interval); goTo(i); start();
  }));
})();


/* ══════════════════════════════════════════════════════════
   7. HERO WORD REVEAL
══════════════════════════════════════════════════════════ */
function triggerHeroReveal() {
  const title = qs('.hero-title');
  if (!title) return;

  // Split each text node into word spans
  function wrapWords(el) {
    el.childNodes.forEach(node => {
      if (node.nodeType === 3) { // text node
        const words = node.textContent.split(/(\s+)/);
        const frag  = document.createDocumentFragment();
        words.forEach(w => {
          if (/^\s+$/.test(w)) {
            frag.appendChild(document.createTextNode(w));
          } else if (w) {
            const wrap = document.createElement('span');
            wrap.className = 'word-reveal';
            const inner = document.createElement('span');
            inner.textContent = w;
            wrap.appendChild(inner);
            frag.appendChild(wrap);
          }
        });
        node.replaceWith(frag);
      } else if (node.nodeType === 1 && node.tagName !== 'BR') {
        wrapWords(node);
      }
    });
  }

  wrapWords(title);

  // Trigger reveal with staggered delay per word
  const reveals = qsa('.word-reveal', title);
  reveals.forEach((el, i) => {
    setTimeout(() => el.classList.add('revealed'), i * 80);
  });

  // Animate subtitle and actions
  ['.hero-subtitle', '.hero-actions', '.hero-stats', '.hero-badge'].forEach((sel, i) => {
    const el = qs(sel);
    if (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = 'opacity .7s ease, transform .7s ease';
      setTimeout(() => {
        el.style.opacity = '';
        el.style.transform = '';
      }, 400 + i * 150);
    }
  });
}


/* ══════════════════════════════════════════════════════════
   8. REVEAL ON SCROLL (enhanced)
══════════════════════════════════════════════════════════ */
(function scrollReveal() {
  const els = qsa('.reveal, .reveal-left, .reveal-right');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
  els.forEach(el => obs.observe(el));
})();


/* ══════════════════════════════════════════════════════════
   9. COUNT-UP with easing
══════════════════════════════════════════════════════════ */
(function countUp() {
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  const counters = qsa('[data-count]');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      obs.unobserve(e.target);
      const el       = e.target;
      const target   = parseInt(el.dataset.count);
      const duration = 2200;
      const start    = performance.now();

      (function animate(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        el.textContent = Math.floor(easeOutCubic(progress) * target).toLocaleString('fr-MA');
        if (progress < 1) requestAnimationFrame(animate);
        else el.textContent = target.toLocaleString('fr-MA');
      })(start);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => obs.observe(c));
})();


/* ══════════════════════════════════════════════════════════
   10. BUTTON RIPPLE EFFECT
══════════════════════════════════════════════════════════ */
(function buttonRipple() {
  qsa('.btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const rect   = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'btn-ripple';
      ripple.style.left = (e.clientX - rect.left - 3) + 'px';
      ripple.style.top  = (e.clientY - rect.top  - 3) + 'px';
      btn.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });
})();


/* ══════════════════════════════════════════════════════════
   11. MAGNETIC BUTTONS
══════════════════════════════════════════════════════════ */
(function magneticButtons() {
  if (!window.matchMedia('(hover: hover)').matches) return;

  // Apply to primary CTA buttons
  qsa('#nav-cta-inscriptions, #hero-discover-programs, .btn-primary').forEach(btn => {
    btn.classList.add('btn-magnetic');

    btn.addEventListener('mousemove', e => {
      const rect   = btn.getBoundingClientRect();
      const cx     = rect.left + rect.width  / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = (e.clientX - cx) * 0.28;
      const dy     = (e.clientY - cy) * 0.28;
      btn.style.transform = `translate(${dx}px, ${dy}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
})();


/* ══════════════════════════════════════════════════════════
   12. 3D CARD TILT
══════════════════════════════════════════════════════════ */
(function cardTilt() {
  if (!window.matchMedia('(hover: hover)').matches) return;

  qsa('.program-card, .career-card, .quality-card').forEach(card => {
    card.classList.add('tilt-card');

    card.addEventListener('mousemove', e => {
      const rect   = card.getBoundingClientRect();
      const cx     = rect.left + rect.width  / 2;
      const cy     = rect.top  + rect.height / 2;
      const rx     = clamp((e.clientY - cy) / (rect.height / 2) * -8, -8, 8);
      const ry     = clamp((e.clientX - cx) / (rect.width  / 2) *  8, -8, 8);
      card.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();


/* ══════════════════════════════════════════════════════════
   13. PROGRAMS TAB FILTER
══════════════════════════════════════════════════════════ */
(function programsTabs() {
  const tabs  = qsa('.prog-tab');
  const cards = qsa('.program-card');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const filter = tab.dataset.filter;
      cards.forEach(card => {
        const show = filter === 'all' || card.dataset.category === filter;
        card.style.display   = show ? 'block' : 'none';
        card.style.animation = show ? 'fadeDown .4s ease both' : '';
      });
    });
  });
})();


/* ══════════════════════════════════════════════════════════
   14. GALLERY LIGHTBOX
══════════════════════════════════════════════════════════ */
(function lightbox() {
  const lb      = qs('#lightbox');
  const lbImg   = qs('#lightbox-img');
  const lbClose = qs('#lightbox-close');
  if (!lb) return;

  const open = src => {
    lbImg.src = src;
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  };
  const close = () => {
    lb.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { lbImg.src = ''; }, 300);
  };

  qsa('.gallery-item img').forEach(img => img.addEventListener('click', () => open(img.src)));
  lbClose?.addEventListener('click', close);
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
})();


/* ══════════════════════════════════════════════════════════
   15. CONTACT FORM
══════════════════════════════════════════════════════════ */
(function contactForm() {
  const form = qs('#contact-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = qs('.form-submit', form);
    if (!btn) return;
    const orig = btn.textContent;
    btn.textContent = '✓ Message envoyé !';
    btn.style.background = 'linear-gradient(135deg, #16a34a, #15803d)';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent  = orig;
      btn.style.background = '';
      btn.disabled = false;
      form.reset();
    }, 3500);
  });
})();


/* ══════════════════════════════════════════════════════════
   16. SMOOTH ANCHOR SCROLL
══════════════════════════════════════════════════════════ */
(function smoothScroll() {
  qsa('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = qs(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navH = qs('#navbar')?.offsetHeight ?? 80;
      const top  = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();


/* ══════════════════════════════════════════════════════════
   17. BACK TO TOP
══════════════════════════════════════════════════════════ */
(function backToTop() {
  // Inject button
  const btn = document.createElement('button');
  btn.id = 'back-to-top';
  btn.setAttribute('aria-label', 'Retour en haut');
  btn.innerHTML = '<i class="fa-solid fa-chevron-up"></i>';
  document.body.appendChild(btn);
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();


/* ══════════════════════════════════════════════════════════
   18. PARALLAX on hero text (subtle)
══════════════════════════════════════════════════════════ */
(function heroParallax() {
  const hero    = qs('#hero');
  const content = qs('.hero-content');
  if (!hero || !content) return;
  if (!window.matchMedia('(hover: hover)').matches) return;

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    if (scrolled > window.innerHeight) return;
    content.style.transform = `translateY(${scrolled * 0.18}px)`;
    content.style.opacity   = `${1 - scrolled / (window.innerHeight * 0.85)}`;
  }, { passive: true });
})();


/* ══════════════════════════════════════════════════════════
   19. LANGUAGE TOGGLE (FR / EN via Google Translate)
══════════════════════════════════════════════════════════ */
(function langToggle() {
  const btn   = qs('#lang-toggle');
  const frBtn = qs('#lang-fr');
  const enBtn = qs('#lang-en');
  if (!btn) return;

  // Detect current language from cookie
  function getCurrentLang() {
    const match = document.cookie.match(/googtrans=\/fr\/(\w+)/);
    return match ? match[1] : 'fr';
  }

  // Set active state on button
  function updateUI(lang) {
    if (lang === 'en') {
      frBtn.classList.remove('active');
      enBtn.classList.add('active');
      btn.title = 'Traduire en français';
    } else {
      enBtn.classList.remove('active');
      frBtn.classList.add('active');
      btn.title = 'Translate to English';
    }
  }

  // Apply translation by setting Google Translate cookie then reloading
  function setLanguage(lang) {
    // Clear old cookies
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' + location.hostname;

    if (lang === 'en') {
      document.cookie = 'googtrans=/fr/en; path=/';
      document.cookie = 'googtrans=/fr/en; path=/; domain=' + location.hostname;
    }
    // Use Google Translate's internal select if available, otherwise reload
    const select = document.querySelector('.goog-te-combo');
    if (select) {
      select.value = lang;
      select.dispatchEvent(new Event('change'));
      updateUI(lang);
    } else {
      location.reload();
    }
  }

  // Init UI based on current state
  updateUI(getCurrentLang());

  // Toggle on click
  btn.addEventListener('click', () => {
    const current = getCurrentLang();
    setLanguage(current === 'fr' ? 'en' : 'fr');
  });

  // Also wait for Google Translate to load, then sync state
  window.addEventListener('load', () => {
    setTimeout(() => updateUI(getCurrentLang()), 1500);
  });
})();
