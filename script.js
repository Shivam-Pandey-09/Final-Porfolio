const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!reduceMotion && 'IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal:not(.hero-title):not(.eyebrow):not(.hero-bottom)').forEach((item) => revealObserver.observe(item));
} else {
  document.querySelectorAll('.reveal').forEach((item) => item.classList.add('visible'));
}

const portrait = document.querySelector('#portrait-source');
const portraitShell = document.querySelector('.portrait-shell');
const heroArt = document.querySelector('#hero-art');

if (window.gsap && !reduceMotion) {
  const gsap = window.gsap;
  const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });

  intro.fromTo('.eyebrow', { y: 10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.65 }, 0)
    .fromTo('.hero-particle-field', { scale: 0.72, autoAlpha: 0 }, { scale: 1, autoAlpha: 0.7, duration: 1.4, ease: 'power2.out' }, 0.08)
    .fromTo(portrait, {
      clipPath: 'inset(100% 0 0 0 round 48% 48% 3% 3%)',
      scale: 1.28,
      filter: 'grayscale(1) brightness(.35)',
    }, {
      clipPath: 'inset(0% 0 0 0 round 48% 48% 3% 3%)',
      scale: 1.38,
      filter: 'grayscale(.22) saturate(.72) brightness(.67) contrast(1.12)',
      duration: 1.35,
      ease: 'power4.out',
    }, 0.05)
    .fromTo('.hero-side', { x: -18, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.7 }, 0.48)
    .fromTo('.hero-title', { y: 40, autoAlpha: 0, filter: 'blur(7px)' }, { y: 0, autoAlpha: 1, filter: 'blur(0px)', duration: 1.05, ease: 'power4.out' }, 0.62)
    .fromTo('.hero-bottom', { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.75 }, 1.05)
    .fromTo('.hero-index span', { y: 8, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, stagger: 0.12 }, 1.25);

  gsap.to(portraitShell, { y: -7, duration: 4.4, delay: 1.8, repeat: -1, yoyo: true, ease: 'sine.inOut' });
  gsap.to('.sun-disc', { scale: 1.18, opacity: 0.28, duration: 4.8, repeat: -1, yoyo: true, ease: 'sine.inOut' });
  gsap.to('.hero-particle-field', { rotation: 8, scale: 1.05, duration: 12, repeat: -1, yoyo: true, ease: 'sine.inOut' });

  if (portraitShell && heroArt) {
    const rotateX = gsap.quickTo(portraitShell, 'rotationX', { duration: 0.55, ease: 'power3.out' });
    const rotateY = gsap.quickTo(portraitShell, 'rotationY', { duration: 0.55, ease: 'power3.out' });
    heroArt.addEventListener('pointermove', (event) => {
      const bounds = heroArt.getBoundingClientRect();
      rotateX(((event.clientY - bounds.top) / bounds.height - 0.5) * -4);
      rotateY(((event.clientX - bounds.left) / bounds.width - 0.5) * 6);
    });
    heroArt.addEventListener('pointerenter', () => {
      gsap.to(portrait, { scale: 1.46, filter: 'grayscale(.12) saturate(.82) brightness(.78) contrast(1.1)', duration: 0.45, ease: 'power2.out' });
      gsap.to('.hero-particle-field', { opacity: 1, duration: 0.45, ease: 'power2.out' });
    });
    heroArt.addEventListener('pointerleave', () => { rotateX(0); rotateY(0); });
    heroArt.addEventListener('pointerleave', () => {
      gsap.to(portrait, { scale: 1.42, filter: 'grayscale(.22) saturate(.72) brightness(.67) contrast(1.12)', duration: 0.6, ease: 'power3.out' });
      gsap.to('.hero-particle-field', { opacity: 0.7, duration: 0.6, ease: 'power2.out' });
    });
  }

  document.querySelectorAll('.project-card').forEach((card) => {
    const preview = card.querySelector('.threat-window');
    if (!preview) return;
    card.addEventListener('pointerenter', () => gsap.to(preview, { y: -8, rotateX: 0, duration: 0.45, ease: 'power3.out' }));
    card.addEventListener('pointerleave', () => gsap.to(preview, { y: 0, rotateX: 2, duration: 0.65, ease: 'elastic.out(1, 0.55)' }));
  });

  document.querySelectorAll('.skill-pills span, .socials a, .menu-link, .hero-actions a').forEach((item) => {
    item.addEventListener('pointerenter', () => gsap.to(item, { y: -4, duration: 0.22, ease: 'power2.out' }));
    item.addEventListener('pointerleave', () => gsap.to(item, { y: 0, duration: 0.35, ease: 'back.out(2)' }));
  });
} else {
  document.querySelectorAll('.reveal').forEach((item) => item.classList.add('visible'));
  if (portrait) portrait.style.clipPath = 'none';
}
