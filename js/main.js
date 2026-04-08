/* =========================================================
   GOA KALARI SHALA — Main JavaScript
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ── NAVBAR SCROLL BEHAVIOUR ── */
  const nav = document.querySelector('.nav');
  const onScroll = () => {
    nav?.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── MOBILE MENU TOGGLE ── */
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  function closeMobileMenu() {
    toggle?.classList.remove('open');
    navLinks?.classList.remove('open');
    toggle?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  function openMobileMenu() {
    toggle?.classList.add('open');
    navLinks?.classList.add('open');
    toggle?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  toggle?.addEventListener('click', () => {
    const isOpen = navLinks.classList.contains('open');
    if (isOpen) { closeMobileMenu(); } else { openMobileMenu(); }
  });

  // Close on link click
  navLinks?.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => closeMobileMenu());
  });

  // Close mobile menu on resize to desktop (orientation change, etc.)
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (window.innerWidth > 768 && navLinks?.classList.contains('open')) {
        closeMobileMenu();
      }
    }, 150);
  });

  // Close mobile menu on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks?.classList.contains('open')) {
      closeMobileMenu();
      toggle?.focus();
    }
  });

  /* ── ACTIVE NAV LINK ── */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  /* ── SCROLL REVEAL ── */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          observer.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => observer.observe(el));
  }

  /* ── COUNTER ANIMATION (hero stats) ── */
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          animateCounter(e.target);
          countObserver.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(c => countObserver.observe(c));
  }

  function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1600;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(ease * target) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ── GALLERY SLIDER ── */
  const track      = document.getElementById('gallery-track');
  const slides     = track ? track.querySelectorAll('.gallery-slide') : [];
  const dots       = document.querySelectorAll('.gallery-dot');
  const thumbs     = document.querySelectorAll('.gallery-thumb');
  const prevBtn    = document.getElementById('gallery-prev');
  const nextBtn    = document.getElementById('gallery-next');
  const currentEl  = document.getElementById('gallery-current');
  const totalEl    = document.getElementById('gallery-total');
  const TOTAL      = slides.length;
  const AUTO_MS    = 2000;          // 2-second autoplay interval

  if (track && TOTAL > 0) {
    let current   = 0;
    let autoTimer = null;
    let isPaused  = false;

    if (totalEl) totalEl.textContent = TOTAL;

    function goTo(idx, userAction = false) {
      // Clamp index into range (wrapping)
      current = (idx + TOTAL) % TOTAL;

      // Translate the track
      track.style.transform = `translateX(-${current * 100}%)`;

      // Active slide class (Ken Burns + caption fade)
      slides.forEach((s, i) => s.classList.toggle('is-active', i === current));

      // Dots
      dots.forEach((d, i) => {
        d.classList.toggle('active', i === current);
        d.setAttribute('aria-selected', i === current ? 'true' : 'false');
      });

      // Thumbnails
      thumbs.forEach((t, i) => t.classList.toggle('active', i === current));

      // Counter
      if (currentEl) currentEl.textContent = current + 1;

      // If user manually navigated, restart the timer
      if (userAction) restartAuto();
    }

    function startAuto() {
      if (autoTimer) clearInterval(autoTimer);
      autoTimer = setInterval(() => {
        if (!isPaused) goTo(current + 1);
      }, AUTO_MS);
    }

    function restartAuto() {
      clearInterval(autoTimer);
      startAuto();
    }

    // Pause autoplay while the user hovers over the slider
    const sliderWrap = document.querySelector('.gallery-slider-wrap');
    sliderWrap?.addEventListener('mouseenter', () => { isPaused = true; });
    sliderWrap?.addEventListener('mouseleave', () => { isPaused = false; });
    // Also pause on touch-focus for mobile accessibility
    sliderWrap?.addEventListener('focusin',  () => { isPaused = true; });
    sliderWrap?.addEventListener('focusout', () => { isPaused = false; });

    // Arrow buttons
    prevBtn?.addEventListener('click', () => goTo(current - 1, true));
    nextBtn?.addEventListener('click', () => goTo(current + 1, true));

    // Dot clicks
    dots.forEach(dot => {
      dot.addEventListener('click', () => goTo(+dot.dataset.index, true));
    });

    // Thumbnail clicks
    thumbs.forEach(thumb => {
      thumb.addEventListener('click', () => goTo(+thumb.dataset.index, true));
    });

    // Keyboard navigation when slider is focused
    sliderWrap?.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft')  { goTo(current - 1, true); e.preventDefault(); }
      if (e.key === 'ArrowRight') { goTo(current + 1, true); e.preventDefault(); }
    });

    // Touch / swipe support
    let touchStartX = 0;
    sliderWrap?.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    sliderWrap?.addEventListener('touchend', e => {
      const dx = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(dx) > 40) goTo(dx > 0 ? current + 1 : current - 1, true);
    }, { passive: true });

    // Kick off
    goTo(0);           // set initial active state
    startAuto();       // start 2-second autoplay
  }

  /* ── ADMISSIONS FORM (admissions.html only) ── */
  const form = document.getElementById('admissions-form');
  if (!form) return;

  const submitBtn = form.querySelector('.form-submit');
  const formBody = document.getElementById('form-body');
  const successMsg = document.getElementById('form-success');

  /* Client-side validation */
  const validators = {
    name:    v => v.trim().length >= 2   ? '' : 'Please enter your full name (min 2 characters).',
    age:     v => (+v >= 5 && +v <= 80)  ? '' : 'Please enter a valid age between 5 and 80.',
    phone:   v => /^\+?\d[\d\s\-()]{6,18}\d$/.test(v.trim()) ? '' : 'Please enter a valid phone number.',
    email:   v => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Please enter a valid email address.',
  };

  function validateField(input) {
    const name = input.name;
    const fn = validators[name];
    if (!fn) return true;
    const msg = fn(input.value);
    const errEl = document.getElementById(`err-${name}`);
    if (msg) {
      input.classList.add('error');
      if (errEl) { errEl.textContent = msg; errEl.classList.add('visible'); }
      return false;
    } else {
      input.classList.remove('error');
      if (errEl) errEl.classList.remove('visible');
      return true;
    }
  }

  // Live validation on blur
  form.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.classList.contains('error')) validateField(input);
    });
  });

  /* Submit handler */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validate all
    const fields = form.querySelectorAll('.form-input, .form-select, .form-textarea');
    let valid = true;
    fields.forEach(f => { if (!validateField(f)) valid = false; });
    if (!valid) {
      form.querySelector('.error')?.focus();
      return;
    }

    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    const data = new FormData(form);
    const payload = {
      access_key: '30c90183-8de5-4571-81b5-c654b03c04c1', // ← Replace with your Web3Forms key
      subject: 'New Admission Inquiry — Goa Kalari Shala',
      from_name: 'Goa Kalari Shala Website',
      botcheck: '',
      ...Object.fromEntries(data.entries()),
    };

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        formBody.style.display = 'none';
        successMsg.classList.add('visible');
        window.scrollTo({ top: form.closest('section')?.offsetTop ?? 0, behavior: 'smooth' });
      } else {
        throw new Error(json.message);
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong. Please try again or contact us directly by phone.');
    } finally {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
    }
  });

});
