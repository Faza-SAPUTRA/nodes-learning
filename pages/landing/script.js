/* ============================================
   NODES — Awwwards-Level Landing
   Lenis + GSAP + ScrollTrigger + Particles
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);
  initLenis();
  initCursor();
  initNavbar();
  initHeroAnimation();
  initParticles();
  initParallax();
  initScrollReveals();
  initCounters();
  initMagneticButtons();
  initSmoothNav();
  initMobileMenu();
  initTextScramble();
});

/* ============================================
   LENIS SMOOTH SCROLL
   ============================================ */
let lenis;
function initLenis() {
  lenis = new Lenis({
    duration: 1.4,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 0.8,
    touchMultiplier: 1.5,
  });

  // Connect Lenis to GSAP ScrollTrigger
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* ============================================
   CUSTOM CURSOR
   ============================================ */
function initCursor() {
  const cursor = document.getElementById('cursor');
  const ring = document.getElementById('cursorRing');
  if (!cursor || !ring) return;

  let mx = 0, my = 0, cx = 0, cy = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; });

  function animate() {
    cx += (mx - cx) * 0.2;
    cy += (my - cy) * 0.2;
    cursor.style.left = cx + 'px';
    cursor.style.top = cy + 'px';

    rx += (mx - rx) * 0.08;
    ry += (my - ry) * 0.08;
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
    requestAnimationFrame(animate);
  }
  animate();

  const hoverEls = document.querySelectorAll('a, button, [data-hover], .mini-canvas-block, .challenge-card, .bento-card, .process-step-dot');
  hoverEls.forEach(el => {
    el.addEventListener('mouseenter', () => { cursor.classList.add('hover'); ring.classList.add('hover'); });
    el.addEventListener('mouseleave', () => { cursor.classList.remove('hover'); ring.classList.remove('hover'); });
  });
}

/* ============================================
   NAVBAR
   ============================================ */
function initNavbar() {
  const nav = document.getElementById('nav');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 60);
    // Hide navbar on scroll down, show on scroll up
    if (y > 300) {
      nav.classList.toggle('nav-hidden', y > lastScroll);
    } else {
      nav.classList.remove('nav-hidden');
    }
    lastScroll = y;
  });
}

/* ============================================
   HERO CINEMATIC ENTRANCE
   ============================================ */
function initHeroAnimation() {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  tl.to('.hero-title .line-inner', {
    y: 0, duration: 1.2, stagger: 0.12,
  })
  .to('.hero-eyebrow', {
    opacity: 1, y: 0, duration: 0.8,
  }, '-=0.8')
  .to('.hero-desc', {
    opacity: 1, y: 0, duration: 0.8,
  }, '-=0.5')
  .to('.hero-actions', {
    opacity: 1, y: 0, duration: 0.8,
  }, '-=0.5')
  .to('.hero-metrics', {
    opacity: 1, y: 0, duration: 0.8,
  }, '-=0.5');

  setTimeout(() => {
    document.querySelectorAll('.hero-title .em').forEach(em => {
      em.style.setProperty('--underline-scale', '1');
    });
  }, 1200);
}

/* ============================================
   FLOATING PARTICLES (Canvas)
   ============================================ */
function initParticles() {
  const canvas = document.getElementById('heroParticles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, particles = [], mouse = { x: -999, y: -999 };
  const PARTICLE_COUNT = 60;

  function resize() {
    const hero = canvas.closest('.hero');
    w = canvas.width = hero.offsetWidth;
    h = canvas.height = hero.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  canvas.closest('.hero').addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * w;
      this.y = Math.random() * h;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.speedY = (Math.random() - 0.5) * 0.3;
      this.opacity = Math.random() * 0.5 + 0.1;
      this.pulse = Math.random() * Math.PI * 2;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.pulse += 0.02;
      // Mouse repel
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        const force = (120 - dist) / 120 * 0.8;
        this.x += (dx / dist) * force;
        this.y += (dy / dist) * force;
      }
      if (this.x < 0 || this.x > w) this.speedX *= -1;
      if (this.y < 0 || this.y > h) this.speedY *= -1;
    }
    draw() {
      const glow = this.opacity * (0.6 + 0.4 * Math.sin(this.pulse));
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(13,148,136,${glow})`;
      ctx.fill();
      // Glow ring
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(13,148,136,${glow * 0.15})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

  // Draw connections
  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(13,148,136,${0.08 * (1 - dist / 150)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    requestAnimationFrame(loop);
  }
  loop();
}

/* ============================================
   PARALLAX EFFECTS
   ============================================ */
function initParallax() {
  // Hero elements parallax on scroll
  gsap.to('.hero-bg-grid', {
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 },
    y: 200, ease: 'none'
  });
  gsap.to('.hero-glow-1', {
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 },
    y: 150, scale: 1.3, ease: 'none'
  });
  gsap.to('.hero-glow-2', {
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 },
    y: 100, scale: 0.8, ease: 'none'
  });
  gsap.to('.hero .container', {
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 },
    y: 80, opacity: 0, ease: 'none'
  });

  // Marquee speed up on scroll
  gsap.to('.marquee-track', {
    scrollTrigger: { trigger: '.marquee-section', start: 'top bottom', end: 'bottom top', scrub: 1 },
    x: -200, ease: 'none'
  });

  // Challenge section — cards stagger in with rotation
  gsap.utils.toArray('.challenge-card').forEach((card, i) => {
    gsap.fromTo(card,
      { y: 60, opacity: 0, rotateX: 8 },
      {
        scrollTrigger: { trigger: card, start: 'top 90%', toggleActions: 'play none none none' },
        y: 0, opacity: 1, rotateX: 0, duration: 1, delay: i * 0.15, ease: 'power3.out'
      }
    );
  });

  // Bento cards — scale up entrance
  gsap.utils.toArray('.bento-card').forEach((card, i) => {
    gsap.fromTo(card,
      { y: 80, opacity: 0, scale: 0.92 },
      {
        scrollTrigger: { trigger: card, start: 'top 90%', toggleActions: 'play none none none' },
        y: 0, opacity: 1, scale: 1, duration: 1.1, delay: i * 0.1, ease: 'power3.out'
      }
    );
  });

  // Process steps — slide from left with line drawing
  gsap.utils.toArray('.process-step').forEach((step, i) => {
    gsap.fromTo(step,
      { x: -60, opacity: 0 },
      {
        scrollTrigger: { trigger: step, start: 'top 88%', toggleActions: 'play none none none' },
        x: 0, opacity: 1, duration: 0.9, delay: i * 0.15, ease: 'power3.out'
      }
    );
  });

  // CTA section — zoom in
  gsap.fromTo('.cta-content',
    { scale: 0.85, opacity: 0 },
    {
      scrollTrigger: { trigger: '.cta', start: 'top 80%', toggleActions: 'play none none none' },
      scale: 1, opacity: 1, duration: 1.2, ease: 'power3.out'
    }
  );

  // Social proof — quote slide up
  gsap.fromTo('.proof-quote',
    { y: 60, opacity: 0 },
    {
      scrollTrigger: { trigger: '.social-proof', start: 'top 80%', toggleActions: 'play none none none' },
      y: 0, opacity: 1, duration: 1.2, ease: 'power3.out'
    }
  );
}

/* ============================================
   SCROLL REVEALS
   ============================================ */
function initScrollReveals() {
  const reveals = document.querySelectorAll('[data-reveal]');
  reveals.forEach(el => {
    // Skip elements already animated by initParallax
    if (el.closest('.hero')) return;
    if (el.classList.contains('challenge-card')) return;
    if (el.classList.contains('bento-card')) return;
    if (el.classList.contains('process-step')) return;
    if (el.classList.contains('cta-content')) return;
    if (el.classList.contains('proof-quote')) return;

    gsap.to(el, {
      scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
      opacity: 1, y: 0, duration: 0.9, delay: el.dataset.delay || 0, ease: 'power3.out',
    });
  });
}

/* ============================================
   COUNTER ANIMATION
   ============================================ */
function initCounters() {
  document.querySelectorAll('[data-count]').forEach(counter => {
    const target = parseInt(counter.dataset.count);
    ScrollTrigger.create({
      trigger: counter, start: 'top 85%',
      onEnter: () => {
        gsap.to(counter, { innerText: target, duration: 2, snap: { innerText: 1 }, ease: 'power2.out' });
      },
      once: true,
    });
  });
}

/* ============================================
   MAGNETIC BUTTONS
   ============================================ */
function initMagneticButtons() {
  const btns = document.querySelectorAll('.btn-main, .btn-outline, .btn-white, .btn-ghost, .nav-cta');
  btns.forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      gsap.to(btn, { x: x * 0.3, y: y * 0.3, duration: 0.4, ease: 'power2.out' });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1,0.4)' });
    });
  });
}

/* ============================================
   TEXT SCRAMBLE EFFECT
   ============================================ */
function initTextScramble() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
  gsap.utils.toArray('.challenge-heading, .bento-title, .process-title, .cta-title').forEach(el => {
    const original = el.innerHTML;
    
    el.addEventListener('mouseenter', () => {
      // Only scramble visible text, not HTML tags
      const textNodes = [];
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) textNodes.push(walker.currentNode);
      
      let frame = 0;
      const maxFrames = 8;
      const interval = setInterval(() => {
        textNodes.forEach(node => {
          const orig = node._original || (node._original = node.textContent);
          if (frame >= maxFrames) {
            node.textContent = orig;
          } else {
            node.textContent = orig.split('').map((c, i) => {
              if (c === ' ' || c === '\n') return c;
              return frame > i * 0.5 ? c : chars[Math.floor(Math.random() * chars.length)];
            }).join('');
          }
        });
        frame++;
        if (frame > maxFrames + 2) clearInterval(interval);
      }, 40);
    });
  });
}

/* ============================================
   SMOOTH SCROLL NAVIGATION
   ============================================ */
function initSmoothNav() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();

      // Use Lenis for smooth scrolling instead of native
      if (lenis) {
        lenis.scrollTo(target, { offset: -80, duration: 1.5 });
      } else {
        const navH = document.getElementById('nav').offsetHeight;
        window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - navH - 24, behavior: 'smooth' });
      }

      const links = document.getElementById('navLinks');
      if (links && links.classList.contains('open')) links.classList.remove('open');
    });
  });
}

/* ============================================
   MOBILE MENU
   ============================================ */
function initMobileMenu() {
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (!toggle || !links) return;
  toggle.addEventListener('click', () => links.classList.toggle('open'));
}
