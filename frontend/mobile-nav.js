(() => {
  const appShell = document.querySelector('.app-shell');
  const sidebar = document.querySelector('.sidebar');
  if (!appShell || !sidebar || document.querySelector('.mobile-topbar')) {
    return;
  }

  const topbar = document.createElement('div');
  topbar.className = 'mobile-topbar';
  topbar.innerHTML = `
    <div class="mobile-topbar-brand">MeetUs</div>
    <button class="mobile-nav-toggle" type="button" aria-label="메뉴 열기" aria-expanded="false">☰</button>
  `;

  const backdrop = document.createElement('button');
  backdrop.className = 'mobile-nav-backdrop';
  backdrop.type = 'button';
  backdrop.setAttribute('aria-label', '메뉴 닫기');

  const toggleBtn = topbar.querySelector('.mobile-nav-toggle');

  function closeNav() {
    document.body.classList.remove('nav-open');
    toggleBtn.setAttribute('aria-expanded', 'false');
  }

  function openNav() {
    document.body.classList.add('nav-open');
    toggleBtn.setAttribute('aria-expanded', 'true');
  }

  toggleBtn.addEventListener('click', () => {
    if (document.body.classList.contains('nav-open')) {
      closeNav();
      return;
    }
    openNav();
  });

  backdrop.addEventListener('click', closeNav);
  sidebar.querySelectorAll('.nav-item').forEach((item) => item.addEventListener('click', closeNav));
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeNav();
    }
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1080) {
      closeNav();
    }
  });

  document.body.prepend(topbar);
  document.body.appendChild(backdrop);
})();
