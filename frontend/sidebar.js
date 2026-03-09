(() => {
  const sidebar = document.querySelector('.app-shell > .sidebar');
  if (!sidebar) {
    return;
  }

  const page = window.location.pathname.split('/').pop() || 'index.html';
  const activeByPage = {
    'workspaces.html': 'workspaces',
    'dashboard.html': 'dashboard',
    'upload.html': 'upload',
    'index.html': 'meetings',
    'meeting.html': 'meetings',
    'archive.html': 'archive'
  };
  const activeKey = activeByPage[page] || 'meetings';

  const navItems = [
    { key: 'workspaces', label: '워크스페이스', href: './workspaces.html' },
    { key: 'workspace-create', label: '워크스페이스 생성', href: './workspaces.html?modal=create' },
    { key: 'dashboard', label: '대시보드', href: './dashboard.html' },
    { key: 'upload', label: '회의 업로드', href: './upload.html' },
    { key: 'meetings', label: '회의 목록', href: './index.html' },
    { key: 'archive', label: '아카이브', href: './archive.html' }
  ];

  const navHtml = navItems
    .map((item) => {
      const activeClass = item.key === activeKey ? ' active' : '';
      return `<a class="nav-item${activeClass}" href="${item.href}">${item.label}</a>`;
    })
    .join('');

  sidebar.innerHTML = `
    <div class="brand-block">
      <h1>MeetUs</h1>
    </div>
    <nav class="nav-group">
      ${navHtml}
    </nav>
    <div class="sidebar-card">
      <h3>핵심 기능</h3>
      <ul>
        <li>회의 음성 업로드</li>
        <li>전사 결과 확인</li>
        <li>AI 요약 확인</li>
        <li>액션 아이템 추출</li>
        <li>아카이브 검색</li>
      </ul>
    </div>
    <div class="sidebar-footer">
      <button id="logout-btn" class="sidebar-logout-btn" type="button">로그아웃</button>
    </div>
  `;
})();
