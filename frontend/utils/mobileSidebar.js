export function initMobileSidebar() {
  const btn = document.getElementById('mobile-menu-btn');
  const overlay = document.getElementById('mobile-overlay');
  const sidebar = document.querySelector('.sidebar');

  if (!btn || !overlay || !sidebar) return;

  const close = () => {
    document.body.classList.remove('sidebar-open');
    sidebar.classList.remove('is-open');
    overlay.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
  };

  const open = () => {
    document.body.classList.add('sidebar-open');
    sidebar.classList.add('is-open');
    overlay.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true');
  };

  const toggle = () => {
    const isOpen = sidebar.classList.contains('is-open');
    if (isOpen) close();
    else open();
  };

  btn.addEventListener('click', toggle);
  overlay.addEventListener('click', close);

  sidebar.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 1080) close();
    });
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 1080) close();
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close();
  });
}
