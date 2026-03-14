/* ===================================================
   Choi Sukun Gallery — script.js
   =================================================== */

// ── Header scroll effect ─────────────────────────
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
}, { passive: true });

// ── Active nav highlight ─────────────────────────
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-link');

function updateActiveNav() {
  let current = '';
  sections.forEach(sec => {
    const top = sec.offsetTop - 120;
    if (window.scrollY >= top) current = sec.id;
  });
  navLinks.forEach(link => {
    const item = link.closest('.nav-item');
    if (item) {
        item.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            item.classList.add('active');
        }
    }
  });
}
window.addEventListener('scroll', updateActiveNav, { passive: true });

// ── Hamburger / Mobile nav ───────────────────────
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileNav.classList.toggle('open');
});

document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileNav.classList.remove('open');
  });
});

// ── Smooth anchor scroll ─────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const href = anchor.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    const offset = parseInt(getComputedStyle(document.documentElement)
      .getPropertyValue('--header-h')) || 72;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// ── Scroll reveal ────────────────────────────────
function addRevealClass() {
  const targets = [
    ...document.querySelectorAll('.section-header'),
    ...document.querySelectorAll('.gallery-group'),
    ...document.querySelectorAll('.essay-card'),
    ...document.querySelectorAll('.statement-inner > *'),
    ...document.querySelectorAll('.bio-text'),
    ...document.querySelectorAll('.bio-info-item'),
    ...document.querySelectorAll('.contact-item'),
    ...document.querySelectorAll('.bio-portrait'),
  ];

  targets.forEach((el) => {
    el.classList.add('reveal');
    const group = el.closest('.gallery-grid, .essays-grid, .bio-info-grid, .contact-info');
    if (group) {
      const siblings = [...group.children];
      const idx = siblings.indexOf(el);
      if (idx >= 0) el.classList.add(`reveal-delay-${Math.min(idx + 1, 4)}`);
    }
  });
}

function observeReveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
}

addRevealClass();
observeReveal();

// ── Gallery item: subtle parallax tilt ───────────
document.querySelectorAll('.gallery-img').forEach(card => {
  const img = card.querySelector('img');
  if (!img) return;
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    img.style.transform = `scale(1.1) rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    img.style.transform = '';
  });
});

// ── Lightbox Logic ───────────────────────────────
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxTitle = document.getElementById('lightboxTitle');
const lightboxInfo = document.getElementById('lightboxInfo');
const closeBtn = document.querySelector('.lightbox-close');
const prevBtn = document.querySelector('.lightbox-prev');
const nextBtn = document.querySelector('.lightbox-next');

let currentIndex = 0;
const galleryItems = [...document.querySelectorAll('.gallery-item')];

function openLightbox(index) {
  currentIndex = index;
  const item = galleryItems[currentIndex];
  const img = item.querySelector('img');
  const title = item.querySelector('.gallery-work-title').textContent;
  const info = item.querySelector('.gallery-work-info').textContent;

  lightboxImg.src = img.src;
  lightboxImg.alt = img.alt;
  lightboxTitle.textContent = title;
  lightboxInfo.textContent = info;

  lightbox.classList.add('active');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('active');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function showPrev() {
  currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
  openLightbox(currentIndex);
}

function showNext() {
  currentIndex = (currentIndex + 1) % galleryItems.length;
  openLightbox(currentIndex);
}

galleryItems.forEach((item, index) => {
  item.addEventListener('click', () => openLightbox(index));
});

closeBtn.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});

prevBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  showPrev();
});

nextBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  showNext();
});

window.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('active')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') showPrev();
  if (e.key === 'ArrowRight') showNext();
});

// ── Noise texture on hero canvas ─────────────────
(function paintHero() {
  const container = document.getElementById('heroCanvas');
  if (!container) return;

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;opacity:0.04;pointer-events:none;';
  container.appendChild(canvas);

  function resize() {
    canvas.width  = container.offsetWidth;
    canvas.height = container.offsetHeight;
    draw();
  }

  function draw() {
    const ctx = canvas.getContext('2d');
    const idata = ctx.createImageData(canvas.width, canvas.height);
    const buf   = idata.data;
    for (let i = 0; i < buf.length; i += 4) {
      const v = Math.random() * 255 | 0;
      buf[i] = buf[i+1] = buf[i+2] = v;
      buf[i+3] = 255;
    }
    ctx.putImageData(idata, 0, 0);
  }

  window.addEventListener('resize', resize);
  resize();
})();
