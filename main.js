// Mina Textile Industries — shared site behavior
// Handles: scroll-reveal (.fade-up), animated stat counters ([data-target]),
// and the mobile hamburger nav toggle. Referenced by index/about/products/contact.

document.addEventListener('DOMContentLoaded', function () {

  // --- Scroll-reveal for .fade-up elements ---
  var revealTargets = document.querySelectorAll('.fade-up');
  if ('IntersectionObserver' in window && revealTargets.length) {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealTargets.forEach(function (el) { revealObserver.observe(el); });
  } else {
    // Fallback: just show everything if IO isn't supported
    revealTargets.forEach(function (el) { el.classList.add('visible'); });
  }

  // --- Animated stat counters ([data-target]) ---
  var counters = document.querySelectorAll('[data-target]');
  var animateCounter = function (el) {
    var target = parseInt(el.getAttribute('data-target'), 10) || 0;
    var duration = 1400;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target;
      }
    }
    requestAnimationFrame(step);
  };

  if ('IntersectionObserver' in window && counters.length) {
    var counterObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { counterObserver.observe(el); });
  } else {
    counters.forEach(function (el) { el.textContent = el.getAttribute('data-target'); });
  }

  // --- Mobile hamburger nav toggle ---
  var hamburger = document.querySelector('.hamburger');
  var navMenu = document.querySelector('.navbar__nav');
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', function () {
      var isOpen = navMenu.classList.toggle('open');
      hamburger.classList.toggle('is-active', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    // Close menu when a link is tapped (mobile UX)
    navMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navMenu.classList.remove('open');
        hamburger.classList.remove('is-active');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // --- Fullscreen image lightbox for clickable thumbnails ---
  var lightboxTargets = document.querySelectorAll('.prod-card__img, .highlight-card img');
  if (lightboxTargets.length) {
    var overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.innerHTML =
      '<button class="lightbox-close" aria-label="Close preview">' +
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
      '</button>' +
      '<img src="" alt="" />' +
      '<div class="lightbox-caption"></div>';
    document.body.appendChild(overlay);
    var lbImg = overlay.querySelector('img');
    var lbCaption = overlay.querySelector('.lightbox-caption');
    var lbClose = overlay.querySelector('.lightbox-close');

    function openLightbox(el) {
      lbImg.src = el.getAttribute('src');
      lbImg.alt = el.getAttribute('alt') || '';
      lbCaption.textContent = el.getAttribute('alt') || '';
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function closeLightbox() {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }

    lightboxTargets.forEach(function (img) {
      img.setAttribute('data-lightbox', 'true');
      img.addEventListener('click', function (e) {
        var parentLink = img.closest('a');
        if (parentLink) { e.preventDefault(); e.stopPropagation(); }
        openLightbox(img);
      });
    });
    lbClose.addEventListener('click', closeLightbox);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeLightbox();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeLightbox();
    });
  }

});
