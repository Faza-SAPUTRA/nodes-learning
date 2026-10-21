document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initHeatmap();
  initCountUp();
  initEntrance();
});

/* ============================================
   TABS
   ============================================ */
function initTabs() {
  const tabs = document.querySelectorAll('.ct-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden'));
      const panel = document.getElementById('tab-' + tab.dataset.tab);
      if (panel) {
        panel.classList.remove('hidden');
        gsap.from(panel.children, { opacity: 0, y: 10, duration: .3, stagger: .05, ease: 'power2.out' });
      }
    });
  });
}

/* ============================================
   HEATMAP (Github-style)
   ============================================ */
function initHeatmap() {
  const container = document.getElementById('heatmap');
  if (!container) return;
  const levels = [0, 1, 2, 3, 4];
  const colors = ['var(--ink-7)', 'rgba(13,148,136,.2)', 'rgba(13,148,136,.4)', 'rgba(13,148,136,.7)', 'var(--teal)'];
  const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

  // 7 rows x 12 cols = 84 cells
  for (let i = 0; i < 84; i++) {
    const cell = document.createElement('div');
    cell.className = 'hm-cell';
    const level = Math.random() < 0.3 ? 0 : Math.floor(Math.random() * 5);
    cell.style.background = colors[level];
    const week = Math.floor(i / 7) + 1;
    const day = days[i % 7];
    cell.title = `${day}, Minggu ${week}: ${level === 0 ? 'Tidak aktif' : level + ' aktivitas'}`;
    container.appendChild(cell);
  }
}

/* ============================================
   COUNT UP ANIMATION
   ============================================ */
function initCountUp() {
  document.querySelectorAll('.sc-num').forEach(el => {
    const target = parseInt(el.dataset.count) || 0;
    gsap.to(el, {
      textContent: target,
      duration: 1.5,
      ease: 'power2.out',
      snap: { textContent: 1 },
      delay: .5,
    });
  });
}

/* ============================================
   ENTRANCE
   ============================================ */
function initEntrance() {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.from('.rail-item', { opacity: 0, x: -8, duration: .25, stagger: .04 })
    .from('.ph-avatar', { opacity: 0, scale: .8, duration: .4 }, '-=.15')
    .from('.ph-info', { opacity: 0, x: -12, duration: .35 }, '-=.2')
    .from('.ph-actions', { opacity: 0, x: 8, duration: .3 }, '-=.2')
    .from('.stat-card', { opacity: 0, y: 10, duration: .3, stagger: .06 }, '-=.15')
    .from('.ct-tab', { opacity: 0, y: 4, duration: .2, stagger: .04 }, '-=.15')
    .from('.card', { opacity: 0, y: 12, duration: .35, stagger: .08 }, '-=.1')
    .from('.hm-cell', { opacity: 0, scale: 0, duration: .15, stagger: .005 }, '-=.2');
}
