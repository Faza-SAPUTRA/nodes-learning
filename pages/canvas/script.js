document.addEventListener('DOMContentLoaded', () => {
  initZoom();
  initToolSwitch();
  initLayerSystem();
  initPropertySync();
  initCanvasPan();
  initComponentDrag();
  initRangeSync();
  initCanvasTools();
  initContextMenu();
  initSelectionKeys();
  initDoubleClickEdit();
  initClickDeselect();
  initEntrance();
});

/* ============================================
   DATA
   ============================================ */
const LAYERS = {
  nav:      { name:'Header Bar',         el:'.ds-topbar',      x:0, y:0,   w:1440, h:56,  bg:'#FFFFFF', radius:0, font:'Inter', fontSize:14, fontWeight:500 },
  hero:     { name:'Color Tokens',       el:'.ds-section',     x:0, y:56,  w:1440, h:460, bg:'#0F172A', radius:0, font:'Inter', fontSize:28, fontWeight:800 },
  features: { name:'Component Cards',    el:'.ds-cards-row',   x:0, y:516, w:1440, h:120, bg:'#FFFFFF', radius:0, font:'Inter', fontSize:15, fontWeight:600 },
  cta:      { name:'Button Variants',    el:null,              x:0, y:636, w:1440, h:200, bg:'#FFFFFF', radius:0, font:'Inter', fontSize:14, fontWeight:600 },
  footer:   { name:'Spacing Grid',       el:null,              x:0, y:836, w:1440, h:120, bg:'#F8FAFC', radius:0, font:'Inter', fontSize:12, fontWeight:400 },
};
let activeLayer = 'hero';

/* ============================================
   ZOOM
   ============================================ */
let zoom = 45, panX = 0, panY = 0;

function applyTransform() {
  const frame = document.getElementById('canvasFrame');
  const overlay = document.getElementById('selectOverlay');
  const zoomVal = document.getElementById('zoomVal');
  if (!frame) return;
  const s = zoom / 100;
  frame.style.transform = `translate(calc(-50% + ${panX}px), calc(-50% + ${panY}px)) scale(${s})`;
  overlay.style.transform = `translate(calc(-50% + ${panX}px), calc(-50% + ${panY}px)) scale(${s})`;
  if (zoomVal) zoomVal.textContent = zoom + '%';
}

function initZoom() {
  const area = document.getElementById('canvasArea');
  document.getElementById('zoomIn')?.addEventListener('click', () => { zoom = Math.min(200, zoom + 10); applyTransform(); });
  document.getElementById('zoomOut')?.addEventListener('click', () => { zoom = Math.max(10, zoom - 10); applyTransform(); });
  area?.addEventListener('wheel', e => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      zoom = Math.max(10, Math.min(200, zoom + (e.deltaY > 0 ? -5 : 5)));
      applyTransform();
    }
  }, { passive: false });
}

/* ============================================
   PAN (Hand / Space+drag)
   ============================================ */
function initCanvasPan() {
  const area = document.getElementById('canvasArea');
  if (!area) return;
  let isPanning = false, sx, sy, spx, spy, spaceDown = false;

  document.addEventListener('keydown', e => {
    if (e.code === 'Space' && !e.repeat && !isInput(e.target)) { e.preventDefault(); spaceDown = true; area.style.cursor = 'grab'; }
  });
  document.addEventListener('keyup', e => { if (e.code === 'Space') { spaceDown = false; updateCursor(); } });

  area.addEventListener('mousedown', e => {
    if (spaceDown || currentTool === 'hand') {
      isPanning = true; sx = e.clientX; sy = e.clientY; spx = panX; spy = panY;
      area.style.cursor = 'grabbing'; e.preventDefault();
    }
  });
  document.addEventListener('mousemove', e => {
    if (!isPanning) return;
    panX = spx + (e.clientX - sx); panY = spy + (e.clientY - sy);
    applyTransform();
  });
  document.addEventListener('mouseup', () => { if (isPanning) { isPanning = false; updateCursor(); } });
}

function isInput(el) { return el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA' || el.isContentEditable; }

/* ============================================
   TOOL SWITCHING
   ============================================ */
let currentTool = 'select';
function initToolSwitch() {
  const tools = document.querySelectorAll('.bb-tool');
  const map = { toolSelect:'select', toolFrame:'frame', toolText:'text', toolHand:'hand', toolPen:'pen' };
  tools.forEach(t => t.addEventListener('click', () => {
    tools.forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    currentTool = map[t.id] || 'select';
    updateCursor();
  }));
  document.addEventListener('keydown', e => {
    if (isInput(e.target)) return;
    const km = { v:'toolSelect', f:'toolFrame', t:'toolText', h:'toolHand', p:'toolPen' };
    if (km[e.key.toLowerCase()]) document.getElementById(km[e.key.toLowerCase()])?.click();
  });
}
function updateCursor() {
  const area = document.getElementById('canvasArea');
  area.style.cursor = { select:'default', frame:'crosshair', text:'text', hand:'grab', pen:'crosshair' }[currentTool] || 'default';
}

/* ============================================
   CANVAS TOOLS — Select/Move, Text, Frame
   ============================================ */
function initCanvasTools() {
  const frame = document.getElementById('canvasFrame');
  const area = document.getElementById('canvasArea');
  if (!frame || !area) return;

  /* --- SELECT TOOL: click to select, drag to move --- */
  let dragTarget = null, dragOffsetX = 0, dragOffsetY = 0, isDragging = false;

  frame.addEventListener('mousedown', e => {
    if (currentTool !== 'select') return;
    const el = findMovableElement(e.target);
    if (!el) return;
    e.preventDefault(); e.stopPropagation();

    dragTarget = el;
    isDragging = true;

    // Ensure element is positioned absolutely for dragging
    if (!el.style.position || el.style.position === 'static') {
      const rect = el.getBoundingClientRect();
      const frameRect = frame.getBoundingClientRect();
      const s = zoom / 100;
      el.style.position = 'relative';
    }

    const rect = el.getBoundingClientRect();
    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;

    el.classList.add('element-dragging');
    selectElementInCanvas(el);
  });

  document.addEventListener('mousemove', e => {
    if (!isDragging || !dragTarget) return;
    const s = zoom / 100;
    const dx = e.movementX / s;
    const dy = e.movementY / s;
    const curLeft = parseFloat(dragTarget.style.left) || 0;
    const curTop = parseFloat(dragTarget.style.top) || 0;
    dragTarget.style.position = 'relative';
    dragTarget.style.left = (curLeft + dx) + 'px';
    dragTarget.style.top = (curTop + dy) + 'px';
  });

  document.addEventListener('mouseup', () => {
    if (dragTarget) {
      dragTarget.classList.remove('element-dragging');
      dragTarget = null;
    }
    isDragging = false;
    frameDrawing = false;
  });

  /* --- TEXT TOOL: click on canvas to insert text --- */
  area.addEventListener('click', e => {
    if (currentTool !== 'text') return;
    // Get position relative to frame
    const frameRect = frame.getBoundingClientRect();
    const s = zoom / 100;
    const x = (e.clientX - frameRect.left) / s;
    const y = (e.clientY - frameRect.top) / s;

    // Only add if click is within frame bounds
    if (x < 0 || y < 0 || x > 1440) return;

    const textEl = document.createElement('div');
    textEl.className = 'canvas-text-element';
    textEl.contentEditable = 'true';
    textEl.textContent = 'Type here...';
    textEl.style.position = 'absolute';
    textEl.style.left = x + 'px';
    textEl.style.top = y + 'px';
    frame.appendChild(textEl);

    // Auto focus
    setTimeout(() => {
      textEl.focus();
      document.execCommand('selectAll');
    }, 50);

    gsap.from(textEl, { opacity: 0, scale: .9, duration: .25, ease: 'power2.out' });

    addToLayerList('Text', textEl);
    // Switch to select tool after placing
    document.getElementById('toolSelect')?.click();
  });

  /* --- FRAME TOOL: drag to draw rectangle --- */
  let frameDrawing = false, frameStartX, frameStartY, frameBox;

  area.addEventListener('mousedown', e => {
    if (currentTool !== 'frame') return;
    const frameRect = frame.getBoundingClientRect();
    const s = zoom / 100;
    const x = (e.clientX - frameRect.left) / s;
    const y = (e.clientY - frameRect.top) / s;
    if (x < 0 || y < 0 || x > 1440) return;

    frameDrawing = true;
    frameStartX = x;
    frameStartY = y;

    frameBox = document.createElement('div');
    frameBox.className = 'canvas-frame-element';
    frameBox.style.position = 'absolute';
    frameBox.style.left = x + 'px';
    frameBox.style.top = y + 'px';
    frameBox.style.width = '0px';
    frameBox.style.height = '0px';
    frame.appendChild(frameBox);

    e.preventDefault();
  });

  area.addEventListener('mousemove', e => {
    if (!frameDrawing || !frameBox) return;
    const frameRect = frame.getBoundingClientRect();
    const s = zoom / 100;
    const x = (e.clientX - frameRect.left) / s;
    const y = (e.clientY - frameRect.top) / s;

    const left = Math.min(frameStartX, x);
    const top = Math.min(frameStartY, y);
    const w = Math.abs(x - frameStartX);
    const h = Math.abs(y - frameStartY);

    frameBox.style.left = left + 'px';
    frameBox.style.top = top + 'px';
    frameBox.style.width = w + 'px';
    frameBox.style.height = h + 'px';
  });

  area.addEventListener('mouseup', e => {
    if (!frameDrawing || !frameBox) return;
    frameDrawing = false;

    const w = parseFloat(frameBox.style.width);
    const h = parseFloat(frameBox.style.height);

    // If too small, remove
    if (w < 10 || h < 10) {
      frameBox.remove();
      return;
    }

    addToLayerList('Frame', frameBox);
    selectElementInCanvas(frameBox);
    document.getElementById('toolSelect')?.click();
  });

  /* --- PEN TOOL: draw freehand path --- */
  let penDrawing = false, penPath = [], penSvg, penPathEl;

  area.addEventListener('mousedown', e => {
    if (currentTool !== 'pen') return;
    const frameRect = frame.getBoundingClientRect();
    const s = zoom / 100;
    const x = (e.clientX - frameRect.left) / s;
    const y = (e.clientY - frameRect.top) / s;
    if (x < 0 || y < 0 || x > 1440) return;

    penDrawing = true;
    penPath = [{ x, y }];

    penSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    penSvg.setAttribute('class', 'canvas-pen-svg');
    penSvg.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;overflow:visible';
    penPathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    penPathEl.setAttribute('fill', 'none');
    penPathEl.setAttribute('stroke', '#0D9488');
    penPathEl.setAttribute('stroke-width', '2');
    penPathEl.setAttribute('stroke-linecap', 'round');
    penPathEl.setAttribute('stroke-linejoin', 'round');
    penSvg.appendChild(penPathEl);
    frame.appendChild(penSvg);

    e.preventDefault();
  });

  area.addEventListener('mousemove', e => {
    if (!penDrawing) return;
    const frameRect = frame.getBoundingClientRect();
    const s = zoom / 100;
    const x = (e.clientX - frameRect.left) / s;
    const y = (e.clientY - frameRect.top) / s;
    penPath.push({ x, y });

    let d = `M ${penPath[0].x} ${penPath[0].y}`;
    for (let i = 1; i < penPath.length; i++) d += ` L ${penPath[i].x} ${penPath[i].y}`;
    penPathEl.setAttribute('d', d);
  });

  area.addEventListener('mouseup', () => {
    if (!penDrawing) return;
    penDrawing = false;
    if (penPath.length < 3 && penSvg) { penSvg.remove(); return; }
    if (penSvg) addToLayerList('Drawing', penSvg);
  });
}

/* --- Helpers --- */
function findMovableElement(target) {
  // Walk up to find a draggable element
  let el = target;
  const frame = document.getElementById('canvasFrame');
  while (el && el !== frame) {
    if (el.classList.contains('dropped-comp') ||
        el.classList.contains('canvas-text-element') ||
        el.classList.contains('canvas-frame-element') ||
        el.classList.contains('fh-btn-primary') ||
        el.classList.contains('fh-btn-ghost') ||
        el.classList.contains('fn-cta') ||
        el.classList.contains('ff-card') ||
        el.classList.contains('fh-badge') ||
        el.tagName === 'BUTTON' ||
        el.tagName === 'H2' ||
        el.tagName === 'H3' ||
        el.tagName === 'P') {
      return el;
    }
    el = el.parentElement;
  }
  return null;
}

let selectedEl = null;

function selectElementInCanvas(el) {
  // Clear previous
  clearSelection();
  selectedEl = el;
  el.classList.add('canvas-selected');
  showActionBar(el);
}

function clearSelection() {
  document.querySelectorAll('.canvas-selected').forEach(s => s.classList.remove('canvas-selected'));
  hideActionBar();
  hideContextMenu();
  selectedEl = null;
}

/* --- Action Bar (floating above selected element) --- */
function showActionBar(el) {
  hideActionBar();
  const bar = document.createElement('div');
  bar.className = 'action-bar';
  bar.id = 'actionBar';
  bar.innerHTML = `
    <button class="ab-btn" data-action="edit" title="Edit (Enter)"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg></button>
    <button class="ab-btn" data-action="duplicate" title="Duplicate (Ctrl+D)"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg></button>
    <div class="ab-sep"></div>
    <button class="ab-btn ab-danger" data-action="delete" title="Delete (Del)"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg></button>
  `;

  bar.querySelectorAll('.ab-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      handleAction(btn.dataset.action);
    });
  });

  document.getElementById('canvasArea').appendChild(bar);
  positionActionBar(el, bar);
}

function positionActionBar(el, bar) {
  const areaRect = document.getElementById('canvasArea').getBoundingClientRect();
  const elRect = el.getBoundingClientRect();
  bar.style.left = (elRect.left - areaRect.left + elRect.width / 2) + 'px';
  bar.style.top = (elRect.top - areaRect.top - 40) + 'px';
}

function hideActionBar() {
  document.getElementById('actionBar')?.remove();
}

/* --- Context Menu (right click) --- */
function initContextMenu() {
  const frame = document.getElementById('canvasFrame');
  frame.addEventListener('contextmenu', e => {
    e.preventDefault();
    const el = findMovableElement(e.target);
    if (!el) { hideContextMenu(); return; }
    selectElementInCanvas(el);
    showContextMenu(e.clientX, e.clientY);
  });

  document.addEventListener('click', () => hideContextMenu());
}

function showContextMenu(x, y) {
  hideContextMenu();
  const areaRect = document.getElementById('canvasArea').getBoundingClientRect();
  const menu = document.createElement('div');
  menu.className = 'ctx-menu';
  menu.id = 'ctxMenu';
  menu.innerHTML = `
    <button class="ctx-item" data-action="edit"><span>Edit Text</span><kbd>Enter</kbd></button>
    <button class="ctx-item" data-action="duplicate"><span>Duplicate</span><kbd>Ctrl+D</kbd></button>
    <div class="ctx-sep"></div>
    <button class="ctx-item" data-action="forward"><span>Bring Forward</span><kbd>]</kbd></button>
    <button class="ctx-item" data-action="backward"><span>Send Back</span><kbd>[</kbd></button>
    <div class="ctx-sep"></div>
    <button class="ctx-item ctx-danger" data-action="delete"><span>Delete</span><kbd>Del</kbd></button>
  `;
  menu.style.left = (x - areaRect.left) + 'px';
  menu.style.top = (y - areaRect.top) + 'px';
  menu.querySelectorAll('.ctx-item').forEach(item => {
    item.addEventListener('click', e => { e.stopPropagation(); handleAction(item.dataset.action); hideContextMenu(); });
  });
  document.getElementById('canvasArea').appendChild(menu);
  gsap.from(menu, { opacity: 0, scale: .95, duration: .12, ease: 'power2.out' });
}

function hideContextMenu() { document.getElementById('ctxMenu')?.remove(); }

/* --- Actions --- */
function handleAction(action) {
  if (!selectedEl) return;
  const frame = document.getElementById('canvasFrame');

  switch (action) {
    case 'delete':
      const layerId = selectedEl.dataset?.layerId;
      gsap.to(selectedEl, { opacity: 0, scale: .9, duration: .2, onComplete: () => {
        selectedEl.remove();
        // Remove from layer list
        if (layerId) {
          delete LAYERS[layerId];
          document.querySelector(`.tp-layer[data-layer="${layerId}"]`)?.remove();
        }
        clearSelection();
      }});
      break;

    case 'duplicate':
      const clone = selectedEl.cloneNode(true);
      clone.classList.remove('canvas-selected');
      clone.style.position = 'relative';
      clone.style.left = (parseFloat(clone.style.left || 0) + 20) + 'px';
      clone.style.top = (parseFloat(clone.style.top || 0) + 20) + 'px';
      selectedEl.parentNode.insertBefore(clone, selectedEl.nextSibling);
      addToLayerList('Copy', clone);
      selectElementInCanvas(clone);
      gsap.from(clone, { opacity: 0, duration: .2 });
      break;

    case 'edit':
      makeEditable(selectedEl);
      break;

    case 'forward':
      if (selectedEl.nextElementSibling) {
        selectedEl.parentNode.insertBefore(selectedEl.nextElementSibling, selectedEl);
      }
      break;

    case 'backward':
      if (selectedEl.previousElementSibling) {
        selectedEl.parentNode.insertBefore(selectedEl, selectedEl.previousElementSibling);
      }
      break;
  }
}

function makeEditable(el) {
  // Find text-bearing child or self
  const textEl = el.querySelector('[contenteditable]') || el.querySelector('h2,h3,p,span,strong,button');
  if (textEl) {
    textEl.contentEditable = 'true';
    textEl.focus();
    try { document.execCommand('selectAll'); } catch(e) {}
    textEl.addEventListener('blur', () => { textEl.contentEditable = 'false'; }, { once: true });
  } else if (el.contentEditable !== 'true') {
    el.contentEditable = 'true';
    el.focus();
    try { document.execCommand('selectAll'); } catch(e) {}
    el.addEventListener('blur', () => { el.contentEditable = 'false'; }, { once: true });
  }
}

/* --- Keyboard shortcuts for selection --- */
function initSelectionKeys() {
  document.addEventListener('keydown', e => {
    if (isInput(e.target)) return;
    if (!selectedEl) return;

    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      handleAction('delete');
    }
    if (e.key === 'd' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleAction('duplicate');
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAction('edit');
    }
    if (e.key === 'Escape') {
      clearSelection();
    }
    if (e.key === ']') handleAction('forward');
    if (e.key === '[') handleAction('backward');
  });
}

/* --- Double-click to edit text --- */
function initDoubleClickEdit() {
  document.getElementById('canvasFrame').addEventListener('dblclick', e => {
    const el = findMovableElement(e.target);
    if (el) {
      selectElementInCanvas(el);
      makeEditable(el);
    }
  });
}

/* --- Click empty area to deselect --- */
function initClickDeselect() {
  document.getElementById('canvasArea').addEventListener('mousedown', e => {
    if (e.target.id === 'canvasArea' || e.target.closest('.canvas-area') === e.target) {
      if (currentTool === 'select') clearSelection();
    }
  });
}

function addToLayerList(name, el) {
  const id = 'el_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
  el.dataset.layerId = id;
  LAYERS[id] = { name, el: null, x: 0, y: 0, w: 100, h: 40, bg: '#FFFFFF', radius: 0, font: 'Inter', fontSize: 16, fontWeight: 400 };

  const layerEl = document.createElement('div');
  layerEl.className = 'tp-layer';
  layerEl.dataset.layer = id;
  layerEl.innerHTML = `<div class="tp-layer-vis"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg></div><span>${name}</span>`;
  layerEl.addEventListener('click', () => selectLayer(id));
  document.getElementById('layerList').appendChild(layerEl);
}

/* ============================================
   LAYER SYSTEM
   ============================================ */
function initLayerSystem() {
  document.querySelectorAll('.tp-layer').forEach(l => l.addEventListener('click', () => selectLayer(l.dataset.layer)));
  const sectionMap = { 'ds-topbar':'nav', 'ds-section':'hero', 'ds-cards-row':'features' };
  const frame = document.getElementById('canvasFrame');
  Object.keys(sectionMap).forEach(cls => {
    frame.querySelector('.' + cls)?.addEventListener('click', e => { e.stopPropagation(); selectLayer(sectionMap[cls]); });
  });
  selectLayer('hero');
}

function selectLayer(layerId) {
  activeLayer = layerId;
  const data = LAYERS[layerId];
  if (!data) return;
  document.querySelectorAll('.tp-layer').forEach(l => l.classList.toggle('active', l.dataset.layer === layerId));
  document.getElementById('ppSelected').textContent = data.name;
  const pf = document.querySelectorAll('#propPanel .pp-grid .pp-field input');
  if (pf.length >= 4) { pf[0].value = data.x; pf[1].value = data.y; pf[2].value = data.w; pf[3].value = data.h; }
  const ci = document.querySelector('.pp-color-input'), ct = document.querySelector('.pp-color-text');
  if (ci) { ci.value = data.bg; ct.value = data.bg; }
  const rng = document.querySelector('.pp-range'), rv = document.querySelector('.pp-range-val');
  if (rng) { rng.value = data.radius; rv.textContent = data.radius + 'px'; }
  const fs = document.querySelector('.pp-select'), si = document.querySelectorAll('.pp-field-sm input');
  if (fs) fs.value = data.font;
  if (si[0]) si[0].value = data.fontSize;
  if (si[1]) si[1].value = data.fontWeight;
  updateOverlay(data);
  document.querySelectorAll('.frame-section-highlight').forEach(e => e.classList.remove('frame-section-highlight'));
  if (data.el) document.querySelector(data.el)?.classList.add('frame-section-highlight');
}

function updateOverlay(data) {
  const label = document.getElementById('soLabel');
  if (!label) return;
  label.textContent = `${data.name} — ${data.w}×${data.h}`;
  if (data.el) { const el = document.querySelector(data.el); if (el) label.style.top = (el.offsetTop - 22) + 'px'; }
}

/* ============================================
   PROPERTY SYNC
   ============================================ */
function initPropertySync() {
  const ci = document.querySelector('.pp-color-input'), ct = document.querySelector('.pp-color-text');
  if (ci) {
    ci.addEventListener('input', () => { const d = LAYERS[activeLayer]; if (!d) return; d.bg = ci.value; ct.value = ci.value; applyToCanvas(d); });
    ct.addEventListener('change', () => { if (/^#[0-9A-Fa-f]{6}$/.test(ct.value)) { ci.value = ct.value; const d = LAYERS[activeLayer]; if (d) { d.bg = ct.value; applyToCanvas(d); } } });
  }
  document.querySelector('.pp-range')?.addEventListener('input', function() { const d = LAYERS[activeLayer]; if (d) { d.radius = +this.value; document.querySelector('.pp-range-val').textContent = d.radius + 'px'; applyToCanvas(d); } });
  document.querySelector('.pp-select')?.addEventListener('change', function() { const d = LAYERS[activeLayer]; if (d) { d.font = this.value; applyToCanvas(d); } });
  document.querySelectorAll('.pp-field-sm input').forEach((inp, i) => {
    inp.addEventListener('input', () => { const d = LAYERS[activeLayer]; if (!d) return; if (i===0) d.fontSize = +inp.value||16; if (i===1) d.fontWeight = +inp.value||400; applyToCanvas(d); });
  });
  document.querySelector('.pp-opacity')?.addEventListener('input', function() { const d = LAYERS[activeLayer]; if (d?.el) { const el = document.querySelector(d.el); if (el) el.style.opacity = +this.value / 100; } });
}

function applyToCanvas(data) {
  if (!data.el) return;
  const el = document.querySelector(data.el);
  if (!el) return;
  el.style.background = data.el === '.frame-hero' ? `linear-gradient(135deg, ${data.bg}, ${adjust(data.bg, 20)})` : data.bg;
  el.style.borderRadius = data.radius + 'px';
  el.style.fontFamily = data.font + ', sans-serif';
  const t = el.querySelector('h2, .fn-logo');
  if (t) { t.style.fontSize = data.fontSize + 'px'; t.style.fontWeight = data.fontWeight; }
}

function adjust(hex, n) {
  const num = parseInt(hex.slice(1), 16);
  let r = Math.min(255, ((num >> 16) & 255) + n), g = Math.min(255, ((num >> 8) & 255) + n), b = Math.min(255, (num & 255) + n);
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/* ============================================
   COMPONENT DRAG & DROP
   ============================================ */
function initComponentDrag() {
  const comps = document.querySelectorAll('.tp-comp');
  const canvasArea = document.getElementById('canvasArea');
  const frame = document.getElementById('canvasFrame');
  let ghost = null;

  comps.forEach(c => {
    c.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text/plain', c.dataset.comp);
      ghost = document.createElement('div'); ghost.className = 'drag-ghost'; ghost.textContent = c.textContent.trim();
      document.body.appendChild(ghost); e.dataTransfer.setDragImage(ghost, 40, 16);
    });
    c.addEventListener('dragend', () => { ghost?.remove(); ghost = null; });
  });

  canvasArea.addEventListener('dragover', e => { e.preventDefault(); canvasArea.classList.add('drag-over'); });
  canvasArea.addEventListener('dragleave', () => canvasArea.classList.remove('drag-over'));
  canvasArea.addEventListener('drop', e => {
    e.preventDefault(); canvasArea.classList.remove('drag-over');
    const type = e.dataTransfer.getData('text/plain');
    const html = {
      heading: '<h3 contenteditable="true">New Heading</h3>',
      text: '<p contenteditable="true">Klik untuk mengedit teks ini.</p>',
      button: '<div style="padding:12px 48px"><button contenteditable="true" style="padding:12px 28px;border-radius:8px;background:#0D9488;color:white;border:none;font-size:.875rem;font-weight:600;font-family:Inter,sans-serif">Tombol Baru</button></div>',
      image: '<div style="padding:12px 48px"><div style="width:100%;height:160px;background:linear-gradient(135deg,#E2E8F0,#CBD5E1);border-radius:12px;display:flex;align-items:center;justify-content:center;color:#94A3B8;font-size:.875rem;font-weight:600">📷 Image</div></div>',
      card: '<div style="padding:12px 48px"><div style="border:1px solid #E2E8F0;border-radius:12px;padding:24px;background:white"><strong contenteditable="true">Card Title</strong><p contenteditable="true" style="margin-top:8px;font-size:.8125rem;color:#64748B">Deskripsi card.</p></div></div>',
      input: '<div style="padding:12px 48px"><label style="font-size:.75rem;font-weight:600;color:#334155">Label</label><input type="text" placeholder="Ketik..." style="width:100%;max-width:400px;padding:10px 14px;border:1px solid #E2E8F0;border-radius:8px;font-size:.875rem;font-family:Inter,sans-serif;margin-top:4px"></div>',
    }[type];
    if (!html) return;
    const comp = document.createElement('div'); comp.className = 'dropped-comp'; comp.innerHTML = html;
    comp.style.padding = type === 'heading' ? '20px 48px' : type === 'text' ? '12px 48px' : '0';
    frame.appendChild(comp);
    gsap.from(comp, { opacity: 0, y: -10, duration: .3 });
    addToLayerList(type.charAt(0).toUpperCase() + type.slice(1), comp);
  });
}

/* ============================================
   RANGE SYNC
   ============================================ */
function initRangeSync() {
  document.querySelectorAll('.pp-range').forEach(r => {
    const v = r.closest('.pp-slider-row')?.querySelector('.pp-range-val');
    if (v) r.addEventListener('input', () => { v.textContent = r.value + 'px'; });
  });
}

/* ============================================
   ENTRANCE
   ============================================ */
function initEntrance() {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.from('.rail-item', { opacity: 0, x: -8, duration: .25, stagger: .04 })
    .from('.canvas-top', { opacity: 0, y: -8, duration: .3 }, '-=.15')
    .from('.tool-panel', { opacity: 0, x: -16, duration: .35 }, '-=.15')
    .from('.canvas-frame', { opacity: 0, scale: .3, duration: .6, ease: 'power2.out' }, '-=.2')
    .from('.prop-panel', { opacity: 0, x: 16, duration: .35 }, '-=.3')
    .from('.bottom-bar', { opacity: 0, y: 8, duration: .3 }, '-=.2');
}
