/* ============================================
   NODES Shared Sidebar — Toggle Logic
   ============================================ */
(function() {
  document.addEventListener('DOMContentLoaded', () => {
    const rail = document.querySelector('.rail');
    const toggle = document.querySelector('.rail-toggle');
    if (!rail || !toggle) return;

    // Restore saved state
    const saved = localStorage.getItem('nodes-sidebar');
    if (saved === 'expanded') rail.classList.add('expanded');

    toggle.addEventListener('click', () => {
      rail.classList.toggle('expanded');
      localStorage.setItem('nodes-sidebar', rail.classList.contains('expanded') ? 'expanded' : 'collapsed');
    });
  });
})();
