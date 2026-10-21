document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);
  initGreeting();
  initSidebar();
  initReveal();
  initStreak();
  initProgress();
  initContinueProgress();
});

/* ---- Time-based greeting ---- */
function initGreeting() {
  const el = document.getElementById('welcomeTime');
  if (!el) return;
  const h = new Date().getHours();
  if (h < 12) el.textContent = 'Selamat pagi';
  else if (h < 17) el.textContent = 'Selamat siang';
  else if (h < 20) el.textContent = 'Selamat sore';
  else el.textContent = 'Selamat malam';
}

/* ---- Sidebar collapse & mobile ---- */
function initSidebar() {
  const sb = document.getElementById('sidebar');
  const collapse = document.getElementById('sbCollapse');
  const menuBtn = document.getElementById('topbarMenu');
  const main = document.getElementById('main');

  if (collapse) {
    collapse.addEventListener('click', () => {
      sb.classList.toggle('collapsed');
      if (main) main.classList.toggle('sb-collapsed');
    });
  }
  if (menuBtn) {
    menuBtn.addEventListener('click', () => sb.classList.toggle('open'));
  }

  // Close on outside click (mobile)
  document.addEventListener('click', e => {
    if (window.innerWidth <= 1024 && sb.classList.contains('open') && !sb.contains(e.target) && e.target !== menuBtn) {
      sb.classList.remove('open');
    }
  });
}

/* ---- Scroll reveals ---- */
function initReveal() {
  gsap.utils.toArray('[data-reveal]').forEach((el, i) => {
    gsap.to(el, {
      scrollTrigger: { trigger: el, start: 'top 90%', scroller: '.content' },
      opacity: 1, y: 0, duration: .7, delay: i * .08, ease: 'power3.out',
    });
  });
}

/* ---- Streak ring animation ---- */
function initStreak() {
  const arc = document.getElementById('streakArc');
  const num = document.getElementById('streakNum');
  if (!arc || !num) return;

  const streakDays = 6;
  const pct = (streakDays / 7) * 100;
  const circ = 2 * Math.PI * 52; // ~327
  const dashLen = (pct / 100) * circ;

  // Animate arc
  gsap.to(arc, {
    attr: { 'stroke-dasharray': `${dashLen} ${circ - dashLen}` },
    duration: 1.5, delay: .5, ease: 'power3.out'
  });

  // Count up
  gsap.to(num, {
    innerText: streakDays,
    duration: 1.2, delay: .5,
    snap: { innerText: 1 },
    ease: 'power2.out'
  });
}

/* ---- Progress donut ---- */
function initProgress() {
  const arc = document.getElementById('progArc');
  const pct = document.getElementById('progPct');
  if (!arc || !pct) return;

  const completed = 8;
  const total = 16;
  const percent = Math.round((completed / total) * 100);
  const circ = 2 * Math.PI * 48; // ~302
  const dashLen = (percent / 100) * circ;

  gsap.to(arc, {
    attr: { 'stroke-dasharray': `${dashLen} ${circ - dashLen}` },
    duration: 1.5, delay: .8, ease: 'power3.out'
  });

  gsap.to(pct, {
    innerText: percent,
    duration: 1.2, delay: .8,
    snap: { innerText: 1 },
    ease: 'power2.out'
  });
}

/* ---- Continue card progress bar ---- */
function initContinueProgress() {
  const fill = document.getElementById('ccFill');
  const pctEl = document.getElementById('ccPct');
  if (!fill || !pctEl) return;

  const pct = 60;

  setTimeout(() => {
    fill.style.width = pct + '%';
    // Animate percentage text
    gsap.to({ v: 0 }, {
      v: pct, duration: 1.2, ease: 'power2.out',
      onUpdate() { pctEl.textContent = Math.round(this.targets()[0].v) + '%'; }
    });
  }, 600);
}
