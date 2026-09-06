const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;
const cards = document.querySelectorAll('[data-tilt]');
const ring = document.querySelector('.cursor-ring');
const dot = document.querySelector('.cursor-dot');
const header = document.querySelector('.site-header');
const progress = document.querySelector('.page-progress');

/* Performance-first pointer system: one animation frame handles cursor + active card. */
if (finePointer && !reduceMotion) {
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;
  let activeCard = null;
  let activeMagnetic = null;
  let pointerFrame = 0;

  window.addEventListener('pointermove', (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;

    if (!pointerFrame) pointerFrame = requestAnimationFrame(updatePointer);
  }, { passive: true });

  function updatePointer() {
    pointerFrame = 0;
    ringX += (mouseX - ringX) * 0.2;
    ringY += (mouseY - ringY) * 0.2;

    ring.style.transform = `translate3d(${ringX}px,${ringY}px,0) translate(-50%,-50%)`;
    dot.style.transform = `translate3d(${mouseX}px,${mouseY}px,0) translate(-50%,-50%)`;

    if (activeCard) {
      const rect = activeCard.getBoundingClientRect();
      const x = mouseX - rect.left;
      const y = mouseY - rect.top;
      const px = x / rect.width;
      const py = y / rect.height;
      const rotateY = (px - 0.5) * 5;
      const rotateX = (0.5 - py) * 5;
      activeCard.style.setProperty('--mx', `${x}px`);
      activeCard.style.setProperty('--my', `${y}px`);
      activeCard.style.transform = `perspective(1100px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
    }

    if (activeMagnetic) {
      const rect = activeMagnetic.getBoundingClientRect();
      const x = (mouseX - rect.left - rect.width / 2) * 0.12;
      const y = (mouseY - rect.top - rect.height / 2) * 0.12;
      activeMagnetic.style.transform = `translate3d(${x}px,${y}px,0)`;
    }

    if (Math.abs(mouseX - ringX) > 0.5 || Math.abs(mouseY - ringY) > 0.5 || activeCard || activeMagnetic) {
      pointerFrame = requestAnimationFrame(updatePointer);
    }
  }

  const interactive = document.querySelectorAll('a,.tilt-card,.magnetic');
  interactive.forEach((element) => {
    element.addEventListener('pointerenter', () => ring.classList.add('is-hover'));
    element.addEventListener('pointerleave', () => ring.classList.remove('is-hover'));
  });

  cards.forEach((card) => {
    card.addEventListener('pointerenter', () => {
      activeCard = card;
      if (!pointerFrame) pointerFrame = requestAnimationFrame(updatePointer);
    });
    card.addEventListener('pointerleave', () => {
      if (activeCard === card) activeCard = null;
      card.style.transform = '';
      card.style.setProperty('--mx', '50%');
      card.style.setProperty('--my', '50%');
    });
  });

  document.querySelectorAll('.magnetic').forEach((element) => {
    element.addEventListener('pointerenter', () => {
      activeMagnetic = element;
      if (!pointerFrame) pointerFrame = requestAnimationFrame(updatePointer);
    });
    element.addEventListener('pointerleave', () => {
      if (activeMagnetic === element) activeMagnetic = null;
      element.style.transform = '';
    });
  });
}

/* Reveal sections only once; CSS handles the visual transition. */
const revealTargets = document.querySelectorAll('.section-label,.about-grid h2,.about-grid > div,.section-heading,.skill-card,.project-card,.contact-box');
if (reduceMotion) {
  revealTargets.forEach((el) => { el.style.opacity = '1'; el.style.transform = 'none'; });
} else {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -5% 0px' });
  revealTargets.forEach((el, index) => {
    el.style.setProperty('--reveal-delay', `${(index % 4) * 45}ms`);
    revealObserver.observe(el);
  });
}

const sections = [...document.querySelectorAll('main section[id]')];
const navLinks = [...document.querySelectorAll('.nav a')];
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
  });
}, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });
sections.forEach((section) => sectionObserver.observe(section));

let scrollTicking = false;
const updateScrollUI = () => {
  const scrollTop = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  header.classList.toggle('scrolled', scrollTop > 30);
  progress.style.transform = `scaleX(${max > 0 ? scrollTop / max : 0})`;
  scrollTicking = false;
};
window.addEventListener('scroll', () => {
  if (!scrollTicking) {
    scrollTicking = true;
    requestAnimationFrame(updateScrollUI);
  }
}, { passive: true });
updateScrollUI();
