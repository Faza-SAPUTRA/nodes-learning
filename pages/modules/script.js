document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);
  initSidebar();
  initReveal();
  initFilters();
  initLearningPath();
  initSearch();
});

/* ---- Sidebar ---- */
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
    menuBtn.addEventListener('click', () => sb && sb.classList.toggle('open'));
  }
  document.addEventListener('click', e => {
    if (window.innerWidth <= 1024 && sb && sb.classList.contains('open') && !sb.contains(e.target) && e.target !== menuBtn) {
      sb.classList.remove('open');
    }
  });
}

/* ---- Scroll reveals ---- */
function initReveal() {
  gsap.utils.toArray('[data-reveal]').forEach((el, i) => {
    gsap.to(el, {
      scrollTrigger: { trigger: el, start: 'top 92%', scroller: '.content' },
      opacity: 1, y: 0, duration: .6, delay: i * .04, ease: 'power3.out',
    });
  });
}

/* ---- Filter tabs ---- */
function initFilters() {
  const tabs = document.querySelectorAll('.filter-tab');
  const cards = document.querySelectorAll('.mod-card');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.dataset.filter;

      cards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.classList.remove('hidden');
          gsap.fromTo(card,
            { opacity: 0, y: 16 },
            { opacity: card.classList.contains('locked') ? 0.65 : 1, y: 0, duration: .4, ease: 'power3.out' }
          );
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
}

/* ---- Learning path progress line ---- */
function initLearningPath() {
  const fill = document.getElementById('lpLineFill');
  if (!fill) return;

  // 8 out of 16 modules done + 1 in progress at 60%
  const pct = ((8 + 0.6) / 16) * 100;

  setTimeout(() => {
    fill.style.width = pct.toFixed(1) + '%';
  }, 800);
}

/* ---- Search ---- */
function initSearch() {
  const input = document.getElementById('searchInput');
  const cards = document.querySelectorAll('.mod-card');

  if (!input) return;

  input.addEventListener('input', () => {
    const q = input.value.toLowerCase().trim();
    cards.forEach(card => {
      const title = card.querySelector('.mod-title')?.textContent.toLowerCase() || '';
      const desc = card.querySelector('.mod-desc')?.textContent.toLowerCase() || '';
      if (!q || title.includes(q) || desc.includes(q)) {
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
      }
    });
  });
}
