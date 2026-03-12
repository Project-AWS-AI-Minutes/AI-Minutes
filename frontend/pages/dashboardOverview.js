import { getMeetings, resetMockMeetings, getDisplayStatusMeta } from '../api/meetingsApi.js';
import { logoutMock, requireSession } from '../api/sessionApi.js';
import { getWorkspaceMembers, requireWorkspace } from '../api/workspaceApi.js';
import { createMeetingCard } from '../components/meetingCard.js';

const metricsGridEl = document.getElementById('metrics-grid');
const recentMeetingsEl = document.getElementById('recent-meetings');
const workspaceMembersEl = document.getElementById('workspace-members');
const currentWorkspaceEl = document.getElementById('current-workspace');
const currentUserEl = document.getElementById('current-user');
const logoutBtn = document.getElementById('logout-btn');

const session = requireSession();
const workspace = requireWorkspace();
currentWorkspaceEl.textContent = workspace.name;
currentUserEl.textContent = session.user.userId;
logoutBtn.addEventListener('click', logoutMock);

function renderMetrics(meetings) {
  const statuses = ['CREATED', 'UPLOADED', 'PROCESSING', 'COMPLETED'];
  metricsGridEl.innerHTML = '';

  statuses.forEach((status) => {
    const count = status === 'CREATED'
      ? meetings.length
      : meetings.filter((meeting) => (meeting.displayStatus || meeting.status) === status).length;
    const meta = getDisplayStatusMeta(status);
    const card = document.createElement('article');
    card.className = 'metric-card';
    card.innerHTML = `
      <p class="eyebrow">${meta.label}</p>
      <p class="muted">${meta.description}</p>
      <strong>${count}</strong>
    `;
    metricsGridEl.appendChild(card);
  });
}

function renderWorkspaceMembers(members = []) {
  workspaceMembersEl.innerHTML = '';

  if (!members.length) {
    workspaceMembersEl.innerHTML = '<div class="empty-state">등록된 멤버가 없습니다.</div>';
    return;
  }

  members.forEach((member) => {
    const displayName = member.name || member.loginId || member.email || '이름 없음';
    const email = member.email || '-';
    const item = document.createElement('article');
    item.className = 'todo-item';
    item.innerHTML = `
      <div class="todo-item-head">
        <h4>${displayName}</h4>
        <span class="badge stage-UPLOADED">${member.role || 'MEMBER'}</span>
      </div>
      <p>${email}</p>
    `;
    workspaceMembersEl.appendChild(item);
  });
}

async function renderDashboard() {
  const [meetings, members] = await Promise.all([
    getMeetings({ sort: 'date-desc', workspaceId: workspace.workspaceId }),
    getWorkspaceMembers(workspace.workspaceId)
  ]);
  renderMetrics(meetings);
  renderWorkspaceMembers(members);

  recentMeetingsEl.innerHTML = '';
  meetings.slice(0, 3).forEach((meeting) => {
    recentMeetingsEl.appendChild(createMeetingCard(meeting, { canDelete: false }));
  });
}

if (!window.localStorage.getItem('meetus-mock-meetings')) {
  resetMockMeetings();
}

renderDashboard();
