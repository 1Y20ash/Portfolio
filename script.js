const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;
const cards = document.querySelectorAll('[data-tilt]');
const ring = document.querySelector('.cursor-ring');
const dot = document.querySelector('.cursor-dot');
const header = document.querySelector('.site-header');
const progress = document.querySelector('.page-progress');

if (finePointer && !reduceMotion) {
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;

  window.addEventListener('pointermove', (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    dot.style.left = `${mouseX}px`;
    dot.style.top = `${mouseY}px`;
  }, { passive: true });

  const animateCursor = () => {
    ringX += (mouseX - ringX) * 0.16;
    ringY += (mouseY - ringY) * 0.16;
    ring.style.left = `${ringX}px`;
    ring.style.top = `${ringY}px`;
    requestAnimationFrame(animateCursor);
  };
  animateCursor();

  document.querySelectorAll('a,.tilt-card,.magnetic').forEach((element) => {
    element.addEventListener('pointerenter', () => ring.classList.add('is-hover'));
    element.addEventListener('pointerleave', () => ring.classList.remove('is-hover'));
  });

  document.querySelectorAll('.magnetic').forEach((element) => {
    element.addEventListener('pointermove', (event) => {
      const rect = element.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) * 0.16;
      const y = (event.clientY - rect.top - rect.height / 2) * 0.16;
      element.style.transform = `translate(${x}px, ${y}px)`;
    });
    element.addEventListener('pointerleave', () => { element.style.transform = ''; });
  });
}

cards.forEach((card) => {
  if (reduceMotion || !finePointer) return;
  card.addEventListener('pointermove', (event) => {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const px = x / rect.width;
    const py = y / rect.height;
    const rotateY = (px - 0.5) * 7;
    const rotateX = (0.5 - py) * 7;
    card.style.setProperty('--mx', `${x}px`);
    card.style.setProperty('--my', `${y}px`);
    card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
  });
  card.addEventListener('pointerleave', () => {
    card.style.transform = '';
    card.style.setProperty('--mx', '50%');
    card.style.setProperty('--my', '50%');
  });
});

const revealTargets = document.querySelectorAll('.section-label,.about-grid h2,.about-grid > div,.section-heading,.skill-card,.project-card,.contact-box');
if (reduceMotion) {
  revealTargets.forEach((el) => { el.style.opacity = '1'; el.style.transform = 'none'; });
} else {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.animate(
        [{ opacity: 0, transform: 'translateY(26px)' }, { opacity: 1, transform: 'translateY(0)' }],
        { duration: 720, delay: Number(entry.target.dataset.delay || 0), easing: 'cubic-bezier(.2,.75,.2,1)', fill: 'forwards' }
      );
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.08 });
  revealTargets.forEach((el, index) => {
    el.style.opacity = '0';
    el.dataset.delay = index % 4 * 65;
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

const updateScrollUI = () => {
  const scrollTop = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  header.classList.toggle('scrolled', scrollTop > 30);
  progress.style.width = `${max > 0 ? (scrollTop / max) * 100 : 0}%`;
};
window.addEventListener('scroll', updateScrollUI, { passive: true });
updateScrollUI();
