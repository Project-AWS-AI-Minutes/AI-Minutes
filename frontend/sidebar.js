(() => {
  const sidebar = document.querySelector('.app-shell > .sidebar');
  if (!sidebar) {
    return;
  }

  const page = window.location.pathname.split('/').pop() || 'index.html';
  const currentWorkspaceRaw = window.localStorage.getItem('meetus-current-workspace');
  let hasSelectedWorkspace = false;
  if (currentWorkspaceRaw) {
    try {
      const parsed = JSON.parse(currentWorkspaceRaw);
      hasSelectedWorkspace = Boolean(parsed?.workspaceId);
    } catch {
      hasSelectedWorkspace = false;
    }
  }
  const activeByPage = {
    'workspaces.html': 'workspaces',
    'dashboard.html': 'dashboard',
    'upload.html': 'upload',
    'index.html': 'meetings',
    'meeting.html': 'meetings',
    'archive.html': 'archive'
  };
  const isWorkspaceCreate = page === 'workspaces.html' && window.location.search.includes('modal=create');
  const activeKey = isWorkspaceCreate ? 'workspace-create' : (activeByPage[page] || 'meetings');

  const showWorkspaceEntryMenu = page === 'workspaces.html';
  const navItems = showWorkspaceEntryMenu
    ? [
        { key: 'workspaces', label: '워크스페이스', href: './workspaces.html' },
        { key: 'workspace-create', label: '워크스페이스 생성', href: './workspaces.html?modal=create' }
      ]
    : hasSelectedWorkspace
    ? [
        { key: 'dashboard', label: '대시보드', href: './dashboard.html' },
        { key: 'meetings', label: '회의 목록', href: './index.html' },
        { key: 'upload', label: '회의 업로드', href: './upload.html' }
      ]
    : [
        { key: 'workspaces', label: '워크스페이스', href: './workspaces.html' },
        { key: 'workspace-create', label: '워크스페이스 생성', href: './workspaces.html?modal=create' }
      ];

  const navHtml = navItems
    .map((item) => {
      const activeClass = item.key === activeKey ? ' active' : '';
      return `<a class="nav-item${activeClass}" href="${item.href}">${item.label}</a>`;
    })
    .join('');

  sidebar.innerHTML = `
    <div class="brand-block">
      <h1><a id="brand-home-link" href="./workspaces.html">MeetUs</a></h1>
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

  const brandHomeLink = sidebar.querySelector('#brand-home-link');
  if (brandHomeLink) {
    brandHomeLink.addEventListener('click', () => {
      window.localStorage.removeItem('meetus-current-workspace');
    });
  }
})();
