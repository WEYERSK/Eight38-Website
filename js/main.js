/* ===========================
   EIGHT38 — Main JavaScript
   Vanilla ES6+, progressive enhancement
   =========================== */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initSmoothScroll();
  initFaqAccordion();
  initStickyHeader();
  initForms();
  initShareButtons();
  initScrollReveal();
  initActiveNav();
});

/* --- Mobile Navigation --- */
function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');
  const links = document.querySelectorAll('.nav-list a');

  if (!toggle || !nav) return;

  function open() {
    toggle.setAttribute('aria-expanded', 'true');
    nav.classList.add('open');
    document.body.classList.add('nav-open');
  }

  function close() {
    toggle.setAttribute('aria-expanded', 'false');
    nav.classList.remove('open');
    document.body.classList.remove('nav-open');
  }

  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    isOpen ? close() : open();
  });

  links.forEach(link => {
    link.addEventListener('click', close);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });

  // Close on click outside
  nav.addEventListener('click', (e) => {
    if (e.target === nav) close();
  });
}

/* --- Smooth Scroll --- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

/* --- FAQ Accordion --- */
function initFaqAccordion() {
  const items = document.querySelectorAll('.faq-item');

  items.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    if (!question || !answer) return;

    question.addEventListener('click', () => {
      const isOpen = question.getAttribute('aria-expanded') === 'true';

      // Close all other items
      items.forEach(other => {
        if (other !== item) {
          other.classList.remove('active');
          other.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
          const otherAnswer = other.querySelector('.faq-answer');
          if (otherAnswer) otherAnswer.setAttribute('aria-hidden', 'true');
        }
      });

      // Toggle current
      if (isOpen) {
        item.classList.remove('active');
        question.setAttribute('aria-expanded', 'false');
        answer.setAttribute('aria-hidden', 'true');
      } else {
        item.classList.add('active');
        question.setAttribute('aria-expanded', 'true');
        answer.setAttribute('aria-hidden', 'false');
      }
    });
  });
}

/* --- Sticky Header --- */
function initStickyHeader() {
  const header = document.querySelector('.header');
  if (!header) return;

  const sentinel = document.querySelector('.hero') || document.querySelector('main');
  if (!sentinel) {
    // Fallback: use scroll position
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          header.classList.toggle('header--scrolled', window.scrollY > 50);
          ticking = false;
        });
        ticking = true;
      }
    });
    return;
  }

  const observer = new IntersectionObserver(
    ([entry]) => {
      header.classList.toggle('header--scrolled', !entry.isIntersecting);
    },
    { threshold: 0, rootMargin: `-${parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 72}px 0px 0px 0px` }
  );

  observer.observe(sentinel);
}

/* --- Form Handling --- */
function initForms() {
  document.querySelectorAll('form[data-action]').forEach(form => {
    form.addEventListener('submit', handleFormSubmit);
  });
}

async function handleFormSubmit(e) {
  e.preventDefault();

  const form = e.target;
  const submitBtn = form.querySelector('[type="submit"]');
  const successEl = form.querySelector('.form-success');
  const errorEl = form.querySelector('.form-error');

  // Prevent double submission
  if (form.dataset.submitting === 'true') return;
  form.dataset.submitting = 'true';

  // Client-side validation
  const email = form.querySelector('[type="email"]');
  if (email && !isValidEmail(email.value)) {
    showFormMessage(errorEl, 'Please enter a valid email address.');
    form.dataset.submitting = 'false';
    return;
  }

  // Update button state
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Sending...';
  submitBtn.disabled = true;

  try {
    const action = form.dataset.action;
    const formData = new FormData(form);

    const response = await fetch(action, {
      method: 'POST',
      body: formData,
      headers: { 'Accept': 'application/json' }
    });

    if (response.ok) {
      showFormMessage(successEl, successEl?.textContent || 'Thanks! We\'ll be in touch shortly.');
      hideFormMessage(errorEl);
      form.reset();

      // Redirect if specified
      const redirect = form.dataset.redirect;
      if (redirect) {
        setTimeout(() => { window.location.href = redirect; }, 1500);
      }
    } else {
      throw new Error('Form submission failed');
    }
  } catch {
    showFormMessage(errorEl, 'Something went wrong. Please try again or email us directly.');
    hideFormMessage(successEl);
  } finally {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
    form.dataset.submitting = 'false';
  }
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showFormMessage(el, text) {
  if (!el) return;
  el.textContent = text;
  el.style.display = 'block';
}

function hideFormMessage(el) {
  if (!el) return;
  el.style.display = 'none';
}

/* --- Social Sharing --- */
function initShareButtons() {
  document.querySelectorAll('.share-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();

      const platform = btn.dataset.platform;
      const url = encodeURIComponent(btn.dataset.url || window.location.href);
      const title = encodeURIComponent(btn.dataset.title || document.title);

      let shareUrl = '';

      switch (platform) {
        case 'twitter':
          shareUrl = `https://twitter.com/intent/tweet?text=${title}&url=${url}`;
          break;
        case 'linkedin':
          shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
          break;
        case 'email':
          window.location.href = `mailto:?subject=${title}&body=${url}`;
          return;
        case 'copy':
          navigator.clipboard.writeText(decodeURIComponent(url)).then(() => {
            const original = btn.getAttribute('aria-label');
            btn.setAttribute('aria-label', 'Copied!');
            btn.classList.add('share-btn--copied');
            setTimeout(() => {
              btn.setAttribute('aria-label', original);
              btn.classList.remove('share-btn--copied');
            }, 2000);
          });
          return;
      }

      if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400,menubar=no,toolbar=no');
      }
    });
  });
}

/* --- Scroll Reveal --- */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  // Respect reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    reveals.forEach(el => el.classList.add('revealed'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  reveals.forEach(el => observer.observe(el));
}

/* --- Active Nav Highlight --- */
function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-list a');

  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(link => {
            link.classList.toggle('active',
              link.getAttribute('href') === `#${id}` ||
              link.getAttribute('href') === `/#${id}`
            );
          });
        }
      });
    },
    { threshold: 0.3, rootMargin: `-${parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 72}px 0px -50% 0px` }
  );

  sections.forEach(section => observer.observe(section));
}
