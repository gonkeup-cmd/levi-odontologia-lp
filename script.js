(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  // Hero entrance, synced to the exact moment the intro curtain finishes
  // (running this on a fixed CSS delay let the draw animation finish
  // before the curtain lifted, so the user never saw it play out)
  const revealHero = () => {
    const titleSpans = document.querySelectorAll('.hero__title .line > span');

    if (reduceMotion) {
      titleSpans.forEach((s) => { s.style.transform = 'none'; });
      return;
    }

    const heroDraw = document.querySelector('.hero__draw');
    if (heroDraw) heroDraw.classList.add('is-active');

    if (titleSpans.length) {
      if (hasGsap) {
        gsap.to(titleSpans, { y: '0%', duration: 0.9, ease: 'power3.out', stagger: 0.12 });
      } else {
        titleSpans.forEach((s, i) => {
          s.style.transition = `transform 0.8s cubic-bezier(0.16,1,0.3,1) ${i * 0.12}s`;
          requestAnimationFrame(() => { s.style.transform = 'translateY(0)'; });
        });
      }
    }
  };

  // Intro curtain
  const intro = document.getElementById('intro');
  if (intro) {
    const dismiss = () => {
      intro.classList.add('is-done');
      revealHero();
    };
    if (reduceMotion) {
      dismiss();
    } else {
      window.setTimeout(dismiss, 1400);
    }
  } else {
    revealHero();
  }

  // Section reveal (fallback: plain fade-up via IntersectionObserver)
  const revealEls = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach((el) => observer.observe(el));
  }

  // Hero tilt (mouse parallax) - interaction, kept even under reduced motion
  const heroTilt = document.getElementById('heroTilt');
  if (heroTilt && !reduceMotion) {
    heroTilt.addEventListener('mousemove', (e) => {
      const r = heroTilt.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      heroTilt.style.transform = `perspective(900px) rotateX(${py * -6}deg) rotateY(${px * 6}deg)`;
    });
    heroTilt.addEventListener('mouseleave', () => {
      heroTilt.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
    });
  }

  // Before / after compare slider - user-driven, always active
  const compareRange = document.getElementById('compareRange');
  const compareSlider = document.getElementById('compareSlider');
  if (compareRange && compareSlider) {
    const afterSide = compareSlider.querySelector('.compare__side--after');
    compareRange.addEventListener('input', () => {
      afterSide.style.clipPath = `inset(0 ${100 - compareRange.value}% 0 0)`;
    });
  }

  // Count-up animation for rating badge
  const countEls = document.querySelectorAll('.count-up');
  if (countEls.length) {
    if (!('IntersectionObserver' in window)) {
      countEls.forEach((el) => { el.textContent = parseFloat(el.dataset.target).toFixed(1); });
    } else {
      const countObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const target = parseFloat(el.dataset.target);
            if (reduceMotion) {
              el.textContent = target.toFixed(1);
            } else {
              const duration = 900;
              const start = performance.now();
              const step = (now) => {
                const progress = Math.min((now - start) / duration, 1);
                el.textContent = (target * progress).toFixed(1);
                if (progress < 1) requestAnimationFrame(step);
              };
              requestAnimationFrame(step);
            }
            countObserver.unobserve(el);
          });
        },
        { threshold: 0.5 }
      );
      countEls.forEach((el) => countObserver.observe(el));
    }
  }

  // Cinematic parallax on decorative blobs (background depth, hierarchy-motivated)
  if (hasGsap && !reduceMotion) {
    gsap.utils.toArray('.hero__blob').forEach((blob, i) => {
      gsap.to(blob, {
        y: i === 0 ? 80 : -60,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    });

    const ctaBlob = document.querySelector('.cta-final__blob');
    if (ctaBlob) {
      gsap.to(ctaBlob, {
        y: 60,
        x: -30,
        ease: 'none',
        scrollTrigger: {
          trigger: '.cta-final',
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    }

    // Ambient depth for the remaining sections (same hierarchy-motivated parallax as hero/CTA)
    const sectionBlobs = [
      { selector: '.about__blob', section: '.about', y: 70 },
      { selector: '.spotlight__blob', section: '.spotlight', y: -50 },
      { selector: '.testimonials__blob', section: '.testimonials', y: 60 },
      { selector: '.location__blob', section: '.location', y: -40 },
    ];
    sectionBlobs.forEach(({ selector, section, y }) => {
      const blob = document.querySelector(selector);
      if (!blob) return;
      gsap.to(blob, {
        y,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    });
  }
})();
