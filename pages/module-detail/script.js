document.addEventListener('DOMContentLoaded', () => {
  initContrastChecker();
  initPalettePlayground();
  initPaletteInspiration();
  initDividerDrag();
  initPanelToggle();
  initMarkDone();
  initEntrance();
  initNodeHover();
});

/* ---- Contrast Checker ---- */
function initContrastChecker() {
  const fg = document.getElementById('fgColor');
  const bg = document.getElementById('bgColor');
  const preview = document.getElementById('ccPreview');
  const text = document.getElementById('ccText');
  const fgHex = document.getElementById('fgHex');
  const bgHex = document.getElementById('bgHex');
  const ratioEl = document.getElementById('ccRatio');
  const badgeAA = document.getElementById('badgeAA');
  const badgeAAL = document.getElementById('badgeAALarge');
  const badgeAAA = document.getElementById('badgeAAA');
  const swap = document.getElementById('swapColors');

  if (!fg || !bg) return;

  function hexToRgb(hex) {
    return [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16)];
  }

  function luminance(r, g, b) {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  function contrastRatio(hex1, hex2) {
    const [r1,g1,b1] = hexToRgb(hex1);
    const [r2,g2,b2] = hexToRgb(hex2);
    const l1 = luminance(r1,g1,b1);
    const l2 = luminance(r2,g2,b2);
    return (Math.max(l1,l2) + 0.05) / (Math.min(l1,l2) + 0.05);
  }

  function update() {
    const fgVal = fg.value;
    const bgVal = bg.value;
    preview.style.background = bgVal;
    text.style.color = fgVal;
    fgHex.textContent = fgVal.toUpperCase();
    bgHex.textContent = bgVal.toUpperCase();

    const ratio = contrastRatio(fgVal, bgVal);
    ratioEl.textContent = ratio.toFixed(2) + ':1';
    badgeAA.className = 'cc-badge ' + (ratio >= 4.5 ? 'pass' : 'fail');
    badgeAAL.className = 'cc-badge ' + (ratio >= 3 ? 'pass' : 'fail');
    badgeAAA.className = 'cc-badge ' + (ratio >= 7 ? 'pass' : 'fail');
  }

  fg.addEventListener('input', update);
  bg.addEventListener('input', update);
  swap.addEventListener('click', () => { [fg.value, bg.value] = [bg.value, fg.value]; update(); });
  update();
}

/* ---- 60-30-10 Playground ---- */
function initPalettePlayground() {
  const c60 = document.getElementById('color60');
  const c30 = document.getElementById('color30');
  const c10 = document.getElementById('color10');
  const pp60 = document.getElementById('pp60');
  const pp30 = document.getElementById('pp30');
  const pp10 = document.getElementById('pp10');
  if (!c60) return;

  function update() {
    pp60.style.background = c60.value;
    pp30.style.background = c30.value;
    pp10.style.background = c10.value;
  }
  c60.addEventListener('input', update);
  c30.addEventListener('input', update);
  c10.addEventListener('input', update);
  update();
}

/* ---- Palette Inspiration ---- */
function initPaletteInspiration() {
  const sets = document.querySelectorAll('.palette-set');
  const c60 = document.getElementById('color60');
  const c30 = document.getElementById('color30');
  const c10 = document.getElementById('color10');
  if (!c60) return;

  sets.forEach(set => {
    set.addEventListener('click', () => {
      c60.value = set.dataset.c60;
      c30.value = set.dataset.c30;
      c10.value = set.dataset.c10;
      c60.dispatchEvent(new Event('input'));
      c30.dispatchEvent(new Event('input'));
      c10.dispatchEvent(new Event('input'));

      // Pulse animation on click
      gsap.fromTo(set, { scale: .95 }, { scale: 1, duration: .3, ease: 'elastic.out(1.2,0.5)' });
    });
  });
}

/* ---- Divider Drag ---- */
function initDividerDrag() {
  const divider = document.getElementById('wsDivider');
  const panels = document.getElementById('wsPanels');
  const reading = document.getElementById('wsReading');
  const canvas = document.getElementById('wsCanvas');
  if (!divider) return;

  let isDragging = false;
  divider.addEventListener('mousedown', e => {
    isDragging = true;
    divider.classList.add('dragging');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    e.preventDefault();
  });
  document.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const rect = panels.getBoundingClientRect();
    const pct = ((e.clientX - rect.left) / rect.width) * 100;
    if (pct > 25 && pct < 75) {
      reading.style.flex = 'none';
      reading.style.width = pct + '%';
      canvas.style.flex = 'none';
      canvas.style.width = (100 - pct) + '%';
    }
  });
  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      divider.classList.remove('dragging');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
  });
}

/* ---- Panel Toggle ---- */
function initPanelToggle() {
  const btn = document.getElementById('togglePanel');
  const canvas = document.getElementById('wsCanvas');
  const divider = document.getElementById('wsDivider');
  const reading = document.getElementById('wsReading');
  if (!btn) return;

  let hidden = false;
  btn.addEventListener('click', () => {
    hidden = !hidden;
    canvas.style.display = hidden ? 'none' : '';
    divider.style.display = hidden ? 'none' : '';
    reading.style.width = hidden ? '100%' : '';
    reading.style.flex = hidden ? '1' : '';
  });
}

/* ---- Mark Done ---- */
function initMarkDone() {
  const btn = document.getElementById('markDone');
  if (!btn) return;
  btn.addEventListener('click', () => {
    btn.classList.add('completed');
    btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> <span class="md-text">Sub-bab selesai!</span> <span class="md-xp">🎉</span>';
    // Animate the current node to done
    const currentNode = document.querySelector('.np-node.current');
    if (currentNode) {
      currentNode.classList.remove('current');
      currentNode.classList.add('done');
    }
  });
}

/* ---- Node Hover Tooltips ---- */
function initNodeHover() {
  document.querySelectorAll('.np-node').forEach(node => {
    node.addEventListener('mouseenter', () => {
      gsap.fromTo(node.querySelector('.np-dot'), { scale: 1 }, { scale: 1.3, duration: .2, ease: 'power2.out' });
    });
    node.addEventListener('mouseleave', () => {
      gsap.to(node.querySelector('.np-dot'), { scale: 1, duration: .2 });
    });
  });
}

/* ---- Entrance Animations ---- */
function initEntrance() {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  tl.from('.rail-node-dot', { scale: 0, duration: .3, stagger: .06 })
    .from('.rail-connector', { scaleY: 0, duration: .2, stagger: .04 }, '-=.3')
    .from('.ws-top', { opacity: 0, y: -8, duration: .35 }, '-=.2')
    .from('.np-node', { scale: 0, duration: .25, stagger: .05 }, '-=.1')
    .from('.np-connector', { scaleX: 0, duration: .2, stagger: .04 }, '-=.2')
    .from('.article-hero', { opacity: 0, y: 16, duration: .5 }, '-=.1')
    .from('.article-section', { opacity: 0, y: 16, duration: .4, stagger: .08 }, '-=.2')
    .from('.canvas-block', { opacity: 0, x: 16, duration: .4, stagger: .08 }, '-=.3');
}
