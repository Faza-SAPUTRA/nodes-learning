document.addEventListener('DOMContentLoaded', () => {
  initPanelTabs();
  initDeviceTabs();
  initChat();
  initPins();
  initVoting();
  initModal();
  initEntrance();
});

/* ============================================
   PANEL TABS (Chat / Activity / Voting)
   ============================================ */
function initPanelTabs() {
  const tabs = document.querySelectorAll('.cp-tab');
  const panels = {
    chat: document.getElementById('chatPanel'),
    activity: document.getElementById('activityPanel'),
    votes: document.getElementById('votesPanel'),
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      Object.values(panels).forEach(p => p.classList.add('hidden'));
      const target = panels[tab.dataset.panel];
      if (target) target.classList.remove('hidden');
    });
  });
}

/* ============================================
   DEVICE TABS (Desktop / Tablet / Mobile)
   ============================================ */
function initDeviceTabs() {
  const tabs = document.querySelectorAll('.pt-tab');
  const frame = document.getElementById('designFrame');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      frame.classList.remove('tablet', 'mobile');
      const screen = tab.dataset.screen;
      if (screen === 'tablet') frame.classList.add('tablet');
      if (screen === 'mobile') frame.classList.add('mobile');
    });
  });
}

/* ============================================
   CHAT (send messages)
   ============================================ */
function initChat() {
  const input = document.getElementById('chatInput');
  const send = document.getElementById('chatSend');
  const container = document.getElementById('chatMessages');

  function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    const msg = document.createElement('div');
    msg.className = 'chat-msg self';
    msg.innerHTML = `
      <div class="chat-av" style="background:#0D9488">AP</div>
      <div class="chat-content">
        <div class="chat-meta"><strong>Kamu</strong><time>baru saja</time></div>
        <p>${escapeHtml(text)}</p>
      </div>
    `;
    container.appendChild(msg);
    input.value = '';
    container.scrollTop = container.scrollHeight;
    gsap.from(msg, { opacity: 0, y: 8, duration: .25, ease: 'power2.out' });

    // Simulate reply after delay
    setTimeout(() => simulateReply(text), 1500 + Math.random() * 2000);
  }

  send.addEventListener('click', sendMessage);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(); });

  // Scroll to bottom
  container.scrollTop = container.scrollHeight;
}

function simulateReply(userMsg) {
  const container = document.getElementById('chatMessages');
  const replies = [
    { name: 'Budi', av: '#7C3AED', letter: 'B', texts: [
      'Mantap, lanjutin terus! 🔥',
      'Oke noted, gua cek dulu ya.',
      'Setuju banget sama perubahan ini.',
      'Nice, lebih clean sekarang!',
    ]},
    { name: 'Sari', av: '#EC4899', letter: 'S', texts: [
      'Keren! Tinggal responsive aja nih.',
      'Warnanya udah bagus menurut gua.',
      'Coba tambahin hover state juga.',
      'Sip, udah gua mark di pin.',
    ]},
  ];

  const replier = replies[Math.floor(Math.random() * replies.length)];
  const text = replier.texts[Math.floor(Math.random() * replier.texts.length)];

  const msg = document.createElement('div');
  msg.className = 'chat-msg';
  msg.innerHTML = `
    <div class="chat-av" style="background:${replier.av}">${replier.letter}</div>
    <div class="chat-content">
      <div class="chat-meta"><strong>${replier.name}</strong><time>baru saja</time></div>
      <p>${text}</p>
    </div>
  `;
  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;
  gsap.from(msg, { opacity: 0, y: 8, duration: .25, ease: 'power2.out' });
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

/* ============================================
   COMMENT PINS (click to toggle)
   ============================================ */
function initPins() {
  const pins = document.querySelectorAll('.comment-pin');
  pins.forEach(pin => {
    pin.addEventListener('click', e => {
      e.stopPropagation();
      const wasActive = pin.classList.contains('active');
      pins.forEach(p => p.classList.remove('active'));
      if (!wasActive) pin.classList.add('active');
    });
  });

  // Click outside closes
  document.addEventListener('click', () => {
    pins.forEach(p => p.classList.remove('active'));
  });
}

/* ============================================
   VOTING
   ============================================ */
function initVoting() {
  const cards = document.querySelectorAll('.vote-card');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      // Toggle vote visual
      const isVoted = card.classList.contains('voted');
      cards.forEach(c => c.classList.remove('voted'));
      if (!isVoted) {
        card.classList.add('voted');
        card.style.borderColor = '#0D9488';
        gsap.from(card, { scale: .98, duration: .2 });
      } else {
        card.style.borderColor = '';
      }
    });
  });
}

/* ============================================
   MODAL (Invite)
   ============================================ */
function initModal() {
  const modal = document.getElementById('inviteModal');
  const openBtn = document.getElementById('inviteBtn');
  const closeBtn = document.getElementById('closeModal');
  const copyBtn = document.getElementById('copyLink');

  openBtn.addEventListener('click', () => {
    modal.classList.add('show');
    gsap.from('.modal', { scale: .95, opacity: 0, duration: .2, ease: 'power2.out' });
  });

  closeBtn.addEventListener('click', () => modal.classList.remove('show'));
  modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('show'); });

  copyBtn.addEventListener('click', () => {
    const input = modal.querySelector('.modal-link-input');
    input.select();
    document.execCommand('copy');
    copyBtn.textContent = 'Copied!';
    copyBtn.style.background = '#22C55E';
    setTimeout(() => { copyBtn.textContent = 'Copy'; copyBtn.style.background = ''; }, 2000);
  });
}

/* ============================================
   ENTRANCE ANIMATIONS
   ============================================ */
function initEntrance() {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.from('.rail-item', { opacity: 0, x: -8, duration: .25, stagger: .04 })
    .from('.room-header', { opacity: 0, y: -8, duration: .3 }, '-=.15')
    .from('.preview-toolbar', { opacity: 0, y: -4, duration: .25 }, '-=.15')
    .from('.design-frame', { opacity: 0, scale: .95, duration: .5 }, '-=.15')
    .from('.comment-pin', { opacity: 0, scale: 0, duration: .3, stagger: .08 }, '-=.2')
    .from('.collab-panel', { opacity: 0, x: 16, duration: .35 }, '-=.3')
    .from('.chat-msg', { opacity: 0, y: 6, duration: .2, stagger: .04 }, '-=.2');
}
