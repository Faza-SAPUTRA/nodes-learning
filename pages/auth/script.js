document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initPasswordToggle();
  initPasswordStrength();
  initFormSubmit();
  initOrbParallax();
  initEntrance();
});

/* ---- Tab Switching ---- */
function initTabs() {
  const tabs = document.getElementById('authTabs');
  const tabLogin = document.getElementById('tabLogin');
  const tabRegister = document.getElementById('tabRegister');
  const formLogin = document.getElementById('formLogin');
  const formRegister = document.getElementById('formRegister');
  const avText = document.getElementById('avText');

  function switchTab(tab) {
    const isLogin = tab === 'login';
    tabs.dataset.active = tab;
    tabLogin.classList.toggle('active', isLogin);
    tabRegister.classList.toggle('active', !isLogin);

    // Animate form swap
    const hideForm = isLogin ? formRegister : formLogin;
    const showForm = isLogin ? formLogin : formRegister;

    hideForm.style.opacity = '0';
    hideForm.style.transform = 'translateY(12px)';
    setTimeout(() => {
      hideForm.style.display = 'none';
      showForm.style.display = 'block';
      showForm.style.opacity = '0';
      showForm.style.transform = 'translateY(12px)';
      requestAnimationFrame(() => {
        showForm.style.transition = 'opacity .4s, transform .4s cubic-bezier(.16,1,.3,1)';
        showForm.style.opacity = '1';
        showForm.style.transform = 'translateY(0)';
      });
    }, 200);

    // Update visual panel text
    if (avText) {
      const lines = avText.querySelectorAll('.av-line');
      const desc = avText.querySelector('.av-desc');
      lines.forEach(line => {
        gsap.to(line, {
          opacity: 0, y: -10, duration: .2,
          onComplete: () => {
            line.textContent = line.dataset[tab];
            gsap.to(line, { opacity: 1, y: 0, duration: .4, ease: 'power3.out' });
          }
        });
      });
      if (desc) {
        gsap.to(desc, {
          opacity: 0, y: -8, duration: .2,
          onComplete: () => {
            desc.textContent = desc.dataset[tab];
            gsap.to(desc, { opacity: 1, y: 0, duration: .4, delay: .1, ease: 'power3.out' });
          }
        });
      }
    }
  }

  tabLogin.addEventListener('click', () => switchTab('login'));
  tabRegister.addEventListener('click', () => switchTab('register'));
}

/* ---- Password Toggle ---- */
function initPasswordToggle() {
  document.querySelectorAll('.field-toggle-pw').forEach(btn => {
    btn.addEventListener('click', () => {
      const field = btn.closest('.field');
      const input = field.querySelector('input[type="password"], input[type="text"]');
      const eyeOpen = btn.querySelector('.eye-open');
      const eyeClosed = btn.querySelector('.eye-closed');

      if (input.type === 'password') {
        input.type = 'text';
        eyeOpen.style.display = 'none';
        eyeClosed.style.display = 'block';
      } else {
        input.type = 'password';
        eyeOpen.style.display = 'block';
        eyeClosed.style.display = 'none';
      }
    });
  });
}

/* ---- Password Strength Meter ---- */
function initPasswordStrength() {
  const input = document.getElementById('passwordRegister');
  const fill = document.getElementById('pwBarFill');
  const label = document.getElementById('pwLabel');
  if (!input || !fill || !label) return;

  input.addEventListener('input', () => {
    const val = input.value;
    let score = 0;
    if (val.length >= 6) score++;
    if (val.length >= 10) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;

    const levels = [
      { w: '0%', c: '', t: '' },
      { w: '20%', c: '#EF4444', t: 'Lemah' },
      { w: '40%', c: '#F59E0B', t: 'Cukup' },
      { w: '60%', c: '#F59E0B', t: 'Sedang' },
      { w: '80%', c: '#10B981', t: 'Kuat' },
      { w: '100%', c: '#10B981', t: 'Sangat kuat' },
    ];

    const lvl = levels[score] || levels[0];
    fill.style.width = lvl.w;
    fill.style.background = lvl.c;
    label.textContent = lvl.t;
    label.style.color = lvl.c;
  });
}

/* ---- Form Submit Animation ---- */
function initFormSubmit() {
  document.querySelectorAll('.auth-form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const btn = form.querySelector('.auth-submit');
      btn.classList.add('loading');

      // Simulate loading
      setTimeout(() => {
        btn.classList.remove('loading');
        window.location.href = '../dashboard/index.html';
      }, 2000);
    });
  });
}

/* ---- Orb Parallax on Mouse Move ---- */
function initOrbParallax() {
  const visual = document.getElementById('authVisual');
  if (!visual) return;

  const orbs = visual.querySelectorAll('.av-orb');

  visual.addEventListener('mousemove', e => {
    const rect = visual.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    orbs.forEach((orb, i) => {
      const factor = (i + 1) * 20;
      orb.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
    });
  });
}

/* ---- Entrance Animation ---- */
function initEntrance() {
  if (typeof gsap === 'undefined') return; // GSAP not loaded, elements stay visible
  try {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // Left panel: text lines (these start opacity:0 in CSS, so .to is fine)
    tl.to('.av-line', {
      opacity: 1, y: 0, duration: .8, stagger: .12
    })
    .to('.av-desc', {
      opacity: 1, y: 0, duration: .7
    }, '-=.4')
    // Cards float in
    .to('.av-card', {
      opacity: 1, x: 0, duration: .6, stagger: .1
    }, '-=.3')
    // Right panel: use fromTo so elements are never stuck invisible
    .fromTo('.auth-tabs',
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: .5, clearProps: 'all' }, '-=.5')
    .fromTo('.auth-heading',
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: .5, clearProps: 'all' }, '-=.3')
    .fromTo('.auth-subheading',
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: .4, clearProps: 'all' }, '-=.2')
    .fromTo('.field',
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: .4, stagger: .08, clearProps: 'all' }, '-=.2')
    .fromTo('.auth-extras',
      { opacity: 0 },
      { opacity: 1, duration: .3, clearProps: 'all' }, '-=.1')
    .fromTo('.auth-submit',
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: .4, clearProps: 'all' }, '-=.1')
    .fromTo('.auth-divider, .auth-socials',
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: .3, stagger: .08, clearProps: 'all' }, '-=.1');
  } catch (e) {
    // If GSAP errors, make sure everything is visible
    document.querySelectorAll('.auth-tabs,.auth-heading,.auth-subheading,.field,.auth-extras,.auth-submit,.auth-divider,.auth-socials').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  }
}
