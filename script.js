(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof window.gsap !== 'undefined' && !reducedMotion;
  const gsap = window.gsap;
  const menuButton = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.site-menu');
  const menuLinks = menu ? menu.querySelectorAll('a') : [];
  let menuTimeline = hasGsap ? gsap.timeline({ paused: true }) : null;

  // The menu timeline is deliberately cleared and rebuilt for every toggle.
  function animateMenu(open) {
    if (!menu || !menuButton) return;
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu?.setAttribute('aria-hidden', String(!open));

    if (!hasGsap) {
      menu.classList.toggle('open', open);
      return;
    }

    // Stop the current pass, clear its children, then rebuild the desired direction.
    menuTimeline.pause(0).clear();
    menu.classList.add('open');
    menu.style.transition = 'none';
    menuTimeline.eventCallback('onComplete', () => {
      if (!open) menu.classList.remove('open');
    });
    gsap.set(menu, { autoAlpha: open ? 0 : 1, y: open ? -18 : 0 });
    gsap.set(menuLinks, { autoAlpha: open ? 0 : 1, y: open ? 16 : 0 });
    if (open) {
      menuTimeline.to(menu, { autoAlpha: 1, y: 0, duration: .36, ease: 'power3.out' })
        .to(menuLinks, { autoAlpha: 1, y: 0, duration: .32, stagger: .055, ease: 'power3.out' }, '-=.16');
    } else {
      menuTimeline.to(menuLinks, { autoAlpha: 0, y: -8, duration: .16, stagger: .025, ease: 'power2.in' })
        .to(menu, { autoAlpha: 0, y: -12, duration: .2, ease: 'power2.in' }, '-=.06');
    }
    menuTimeline.play(0);
  }

  if (menu && menuButton) {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.addEventListener('click', () => {
      animateMenu(menuButton.getAttribute('aria-expanded') !== 'true');
    });
    menuLinks.forEach(link => link.addEventListener('click', () => animateMenu(false)));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') animateMenu(false);
    });
  }

  if (!hasGsap) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
    return;
  }

  if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);

  // Every heading keeps its own motion style when replayed on hover.
  function replayHeadingOnHover(heading, kind = 'roll') {
    if (!heading || heading.dataset.hoverMotionReady) return;
    heading.dataset.hoverMotionReady = 'true';
    heading.addEventListener('pointerenter', () => {
      if (kind === 'horizontal' || kind === 'rise') {
        const lines = heading.querySelectorAll('.text-line');
        if (!lines.length) return;
        gsap.fromTo(lines,
          kind === 'horizontal'
            ? { x: (i) => i % 2 ? 110 : -110, autoAlpha: 0 }
            : { yPercent: 115, rotateX: -12, autoAlpha: 0 },
          { x: 0, yPercent: 0, rotateX: 0, autoAlpha: 1, duration: kind === 'horizontal' ? 1 : .9, stagger: .12, ease: 'power3.out', overwrite: true }
        );
        return;
      }
      if (kind === 'project') {
        const lines = heading.querySelectorAll('.project-text-line');
        gsap.fromTo(lines, { x: -46, filter: 'blur(5px)', autoAlpha: 0 },
          { x: 0, filter: 'blur(0px)', autoAlpha: 1, duration: .75, stagger: .14, ease: 'power3.out', overwrite: true });
        return;
      }
      if (kind === 'contact') {
        const words = heading.querySelectorAll('.contact-word');
        gsap.fromTo(words, { y: 26, rotateX: -35, filter: 'blur(4px)', autoAlpha: 0 },
          { y: 0, rotateX: 0, filter: 'blur(0px)', autoAlpha: 1, duration: .58, stagger: .09, ease: 'back.out(1.2)', overwrite: true });
        return;
      }
      const chars = heading.querySelectorAll('.rolling-char');
      if (chars.length) {
        if (kind === 'wave') {
          gsap.fromTo(chars, { y: (i) => i % 2 ? -9 : 8, rotate: (i) => i % 2 ? 7 : -7 },
            { y: 0, rotate: 0, duration: .65, stagger: .012, ease: 'elastic.out(1,.45)', overwrite: true });
          return;
        }
        if (kind === 'journey') {
          gsap.fromTo(chars, { yPercent: 70, rotateY: -75, scale: .75, autoAlpha: 0 },
            { yPercent: 0, rotateY: 0, scale: 1, autoAlpha: 1, duration: .7, stagger: .02, ease: 'back.out(1.3)', overwrite: true });
          return;
        }
        if (kind === 'about') {
          gsap.fromTo(chars, { x: -16, autoAlpha: 0 },
            { x: 0, autoAlpha: 1, duration: .48, stagger: .012, ease: 'power2.out', overwrite: true });
          return;
        }
        gsap.fromTo(chars,
          { yPercent: 115, rotateX: -78, autoAlpha: 0, transformOrigin: '50% 100%' },
          { yPercent: 0, rotateX: 0, autoAlpha: 1, duration: .68, stagger: .018, ease: 'power3.out', overwrite: true }
        );
        return;
      }
    });
  }

  // Roll the two name lines into view one character at a time.
  const name = document.querySelector('.hero h1');
  const nameChars = [];
  if (name) {
    name.setAttribute('aria-label', 'Shivam Pandey');
    name.querySelectorAll(':scope > span, :scope > em').forEach(line => {
      const original = line.textContent;
      line.textContent = '';
      [...original].forEach(char => {
        const span = document.createElement('span');
        span.className = 'rolling-char';
        span.setAttribute('aria-hidden', 'true');
        span.textContent = char === ' ' ? '\u00a0' : char;
        line.appendChild(span);
        nameChars.push(span);
      });
    });
  }
  replayHeadingOnHover(name);

  // Intro timeline: characters roll in, followed by the supporting copy and CTAs.
  const intro = gsap.timeline();
  intro.clear();
  if (nameChars.length) intro.fromTo(nameChars,
    { yPercent: 132, rotationX: -92, rotationY: 8, opacity: 0, transformPerspective: 700, transformOrigin: '50% 100%' },
    { yPercent: 0, rotationX: 0, rotationY: 0, opacity: 1, duration: .9, stagger: .045, ease: 'power4.out' }
  );
  intro.fromTo('.hero .eyebrow, .hero .hero-sub, .hero .hero-actions',
    { y: 22, opacity: 0 },
    { y: 0, opacity: 1, duration: .55, stagger: .12, ease: 'power3.out' }, '-=.35'
  );

  // Reveal content as each section enters view.
  document.querySelectorAll('.reveal').forEach(el => {
    gsap.fromTo(el, { y: 24, autoAlpha: 0 }, {
      y: 0, autoAlpha: 1, duration: .7, ease: 'power3.out',
      scrollTrigger: window.ScrollTrigger ? { trigger: el, start: 'top 88%', toggleActions: 'play none play none' } : undefined
    });
  });

  // Work headline moves in from opposite horizontal directions.
  const workLines = document.querySelectorAll('.work-title h2 .text-line');
  workLines.forEach((line, index) => {
    gsap.fromTo(line, { x: index % 2 ? 110 : -110, autoAlpha: 0 }, {
      x: 0, autoAlpha: 1, duration: 1, ease: 'power3.out',
      scrollTrigger: window.ScrollTrigger ? { trigger: line, start: 'top 86%', toggleActions: 'play none play none' } : undefined
    });
  });
  replayHeadingOnHover(document.querySelector('.work-title h2'), 'horizontal');

  // Process headline rises into view line by line, with the emphasized phrase following.
  const processHeading = document.querySelector('.approach-heading h2');
  const processLines = processHeading ? processHeading.querySelectorAll('.text-line') : [];
  if (processLines.length) {
    const processTimeline = gsap.timeline({
      scrollTrigger: window.ScrollTrigger ? {
        trigger: processHeading,
        start: 'top 82%',
        toggleActions: 'play none play none'
      } : undefined
    });
    processTimeline.clear();
    processTimeline.fromTo(processLines,
      { yPercent: 115, rotateX: -12, autoAlpha: 0, transformOrigin: '50% 100%' },
      { yPercent: 0, rotateX: 0, autoAlpha: 1, duration: .9, stagger: .16, ease: 'power3.out' }
    );
  }
  replayHeadingOnHover(processHeading, 'rise');

  // About headline rolls in character by character as the section enters view.
  const aboutHeading = document.querySelector('#about .about-grid h2');
  const aboutChars = [];
  if (aboutHeading) {
    aboutHeading.setAttribute('aria-label', 'Technology is the starting point. People are the point.');
    aboutHeading.querySelectorAll(':scope > .text-line').forEach(line => {
      const original = line.textContent;
      line.textContent = '';
      [...original].forEach(char => {
        const span = document.createElement('span');
        span.className = 'rolling-char';
        span.setAttribute('aria-hidden', 'true');
        span.textContent = char === ' ' ? '\u00a0' : char;
        line.appendChild(span);
        aboutChars.push(span);
      });
    });
    if (aboutChars.length) {
      const aboutTimeline = gsap.timeline({
        scrollTrigger: window.ScrollTrigger ? {
          trigger: aboutHeading,
          start: 'top 78%',
          toggleActions: 'play none play none'
        } : undefined
      });
      aboutTimeline.clear();
      aboutTimeline.fromTo(aboutChars,
        { yPercent: 115, rotateX: -82, autoAlpha: 0, transformOrigin: '50% 100%' },
        { yPercent: 0, rotateX: 0, autoAlpha: 1, duration: .72, stagger: .018, ease: 'power3.out' }
      );
    }
  }
  replayHeadingOnHover(aboutHeading, 'about');

  // Give the project and journey headlines a staggered, readable entrance.
  [
    { selector: '.impact-grid > div:first-child > .impact-index', trigger: '.impact-grid' },
    { selector: '.contact-grid > div:first-child > p, .contact-side', trigger: '.contact-grid' }
  ].forEach(({ selector, trigger }) => {
    const heading = document.querySelector(selector);
    if (!heading) return;
    gsap.fromTo(heading, { y: 42, autoAlpha: 0, rotateX: -5 }, {
      y: 0, autoAlpha: 1, rotateX: 0, duration: .95, ease: 'power3.out',
      scrollTrigger: window.ScrollTrigger ? { trigger, start: 'top 82%', toggleActions: 'play none play none' } : undefined
    });
  });

  // Project statement rolls in line by line, keeping its italic emphasis intact.
  const projectStatement = document.querySelector('.impact-grid > div:first-child h2');
  const projectChars = [];
  if (projectStatement) {
    projectStatement.setAttribute('aria-label', 'See the threat. Understand the story.');
    projectStatement.replaceChildren();
    [
      { text: 'See the threat.', emphasis: false },
      { text: 'Understand', emphasis: true },
      { text: 'the story.', emphasis: false }
    ].forEach(({ text, emphasis }) => {
      const line = document.createElement(emphasis ? 'em' : 'span');
      line.className = 'project-text-line';
      [...text].forEach(char => {
        const letter = document.createElement('span');
        letter.className = 'rolling-char';
        letter.setAttribute('aria-hidden', 'true');
        letter.textContent = char === ' ' ? '\u00a0' : char;
        line.appendChild(letter);
        projectChars.push(letter);
      });
      projectStatement.appendChild(line);
    });
    const projectTimeline = gsap.timeline({
      scrollTrigger: window.ScrollTrigger ? { trigger: projectStatement, start: 'top 82%', toggleActions: 'play none play none' } : undefined
    });
    projectTimeline.clear();
    projectTimeline.fromTo(projectChars,
      { yPercent: 120, rotateX: -78, autoAlpha: 0, transformOrigin: '50% 100%' },
      { yPercent: 0, rotateX: 0, autoAlpha: 1, duration: .76, stagger: .026, ease: 'power3.out' }
    );
  }
  replayHeadingOnHover(projectStatement, 'project');

  // Journey headline rolls in by line, then by character, on scroll.
  const journeyHeading = document.querySelector('.journey-heading h2');
  const journeyChars = [];
  if (journeyHeading) {
    journeyHeading.setAttribute('aria-label', 'Started with curiosity. Kept building.');
    journeyHeading.replaceChildren();
    [
      { text: 'Started with curiosity.', emphasized: false },
      { text: 'Kept building.', emphasized: true }
    ].forEach(({ text, emphasized }) => {
      const line = document.createElement(emphasized ? 'em' : 'span');
      line.className = 'journey-text-line';
      [...text].forEach(char => {
        const letter = document.createElement('span');
        letter.className = 'rolling-char';
        letter.setAttribute('aria-hidden', 'true');
        letter.textContent = char === ' ' ? '\u00a0' : char;
        line.appendChild(letter);
        journeyChars.push(letter);
      });
      journeyHeading.appendChild(line);
    });
    const journeyTimeline = gsap.timeline({
      scrollTrigger: window.ScrollTrigger ? { trigger: journeyHeading, start: 'top 82%', toggleActions: 'play none play none' } : undefined
    });
    journeyTimeline.clear();
    journeyTimeline.fromTo(journeyChars,
      { yPercent: 115, rotateX: -80, autoAlpha: 0, transformOrigin: '50% 100%' },
      { yPercent: 0, rotateX: 0, autoAlpha: 1, duration: .72, stagger: .022, ease: 'power3.out' }
    );
  }
  replayHeadingOnHover(journeyHeading, 'journey');

  // Roll the contact headline in as separate lines and characters.
  const contactHeading = document.querySelector('.contact-grid h2');
  const contactChars = [];
  if (contactHeading) {
    contactHeading.setAttribute('aria-label', 'Something good starts with hello.');
    const original = contactHeading.innerHTML;
    const appendAnimatedWords = (parent, text) => {
      text.trim().split(/\s+/).forEach((word, wordIndex) => {
        if (wordIndex) parent.appendChild(document.createTextNode(' '));
        const wordWrap = document.createElement('span');
        wordWrap.className = 'contact-word';
        [...word].forEach(char => {
          const letter = document.createElement('span');
          letter.className = 'rolling-char';
          letter.setAttribute('aria-hidden', 'true');
          letter.textContent = char;
          wordWrap.appendChild(letter);
          contactChars.push(letter);
        });
        parent.appendChild(wordWrap);
      });
    };
    contactHeading.innerHTML = original.split('<br>').map(line => {
      const scratch = document.createElement('span');
      scratch.innerHTML = line;
      const output = document.createElement('span');
      output.className = 'contact-text-line';
      [...scratch.childNodes].forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
          appendAnimatedWords(output, node.textContent);
        } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'EM') {
          const italic = document.createElement('em');
          appendAnimatedWords(italic, node.textContent);
          output.appendChild(italic);
        }
      });
      return output.outerHTML;
    }).join('');

    const contactTimeline = gsap.timeline({
      scrollTrigger: window.ScrollTrigger ? { trigger: contactHeading, start: 'top 84%', toggleActions: 'play none play none' } : undefined
    });
    contactTimeline.clear();
    contactTimeline.fromTo(contactChars,
      { yPercent: 115, rotateX: -78, autoAlpha: 0, transformOrigin: '50% 100%' },
      { yPercent: 0, rotateX: 0, autoAlpha: 1, duration: .68, stagger: .02, ease: 'power3.out' }
    );
  }
  replayHeadingOnHover(contactHeading, 'contact');

  // Bring the contact CTA and supporting copy in after the headline starts.
  const contactDetails = document.querySelectorAll('.contact-grid .contact-cta, .contact-grid .contact-side > *');
  if (contactDetails.length) {
    const detailsTimeline = gsap.timeline({
      scrollTrigger: window.ScrollTrigger ? { trigger: '.contact-grid', start: 'top 82%', toggleActions: 'play none play none' } : undefined
    });
    detailsTimeline.clear().fromTo(contactDetails,
      { y: 24, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: .65, stagger: .12, ease: 'power3.out' },
      .28
    );
  }

  // Skills headline rolls in on scroll and gets a compact hover wave.
  const skillsHeading = document.querySelector('#skills h2');
  if (skillsHeading) {
    const skillsChars = [];
    skillsHeading.setAttribute('aria-label', 'My developer toolkit.');
    skillsHeading.querySelectorAll(':scope > .text-line').forEach(line => {
      const original = line.textContent;
      line.replaceChildren();
      [...original].forEach(char => {
        const letter = document.createElement('span');
        letter.className = 'rolling-char';
        letter.setAttribute('aria-hidden', 'true');
        letter.textContent = char === ' ' ? '\u00a0' : char;
        line.appendChild(letter);
        skillsChars.push(letter);
      });
    });
    const skillsTimeline = gsap.timeline({
      scrollTrigger: window.ScrollTrigger ? { trigger: skillsHeading, start: 'top 82%', toggleActions: 'play none play none' } : undefined
    });
    skillsTimeline.clear();
    skillsTimeline.fromTo(skillsChars,
      { yPercent: 115, rotateX: -75, autoAlpha: 0, transformOrigin: '50% 100%' },
      { yPercent: 0, rotateX: 0, autoAlpha: 1, duration: .72, stagger: .025, ease: 'back.out(1.25)' }
    );
    replayHeadingOnHover(skillsHeading, 'wave');
  }

  // Small, consistent motion feedback for every interactive control.
  document.querySelectorAll('a, button').forEach(control => {
    control.addEventListener('pointerenter', () => gsap.to(control, { y: -2, duration: .2, ease: 'power2.out' }));
    control.addEventListener('pointerleave', () => gsap.to(control, { y: 0, scale: 1, duration: .25, ease: 'power2.out' }));
    control.addEventListener('pointerdown', () => gsap.to(control, { scale: .97, duration: .1, ease: 'power1.out' }));
    control.addEventListener('pointerup', () => gsap.to(control, { scale: 1, duration: .16, ease: 'power1.out' }));
  });
})();
