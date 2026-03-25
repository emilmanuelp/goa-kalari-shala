/* =========================================================
   KALARI DEVA ACADEMY — Main JavaScript
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
  toggle?.addEventListener('click', () => {
    toggle.classList.toggle('open');
    navLinks.classList.toggle('open');
    document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
  });
  // Close on link click
  navLinks?.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      toggle?.classList.remove('open');
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    });
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
    phone:   v => /^[6-9]\d{9}$/.test(v.replace(/\s/g,'')) ? '' : 'Enter a valid 10-digit Indian mobile number.',
    email:   v => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Please enter a valid email address.',
    batch:   v => v !== ''               ? '' : 'Please select a preferred batch.',
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
      access_key: 'YOUR_WEB3FORMS_ACCESS_KEY', // ← Replace with your Web3Forms key
      subject: 'New Admission Inquiry — Kalari Deva Academy',
      from_name: 'Kalari Deva Academy Website',
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
