import { logoutMock, requireSession } from '../api/sessionApi.js';
import {
  createWorkspace,
  deleteWorkspace,
  getCurrentWorkspace,
  getWorkspaceMembers,
  getVisibleWorkspaces,
  inviteUserToWorkspace,
  leaveWorkspace,
  setCurrentWorkspace
} from '../api/workspaceApi.js';

const workspaceListEl = document.getElementById('workspace-list');
const workspaceCountEl = document.getElementById('workspace-count');
const workspacePaginationEl = document.getElementById('workspace-pagination');
const workspaceFormEl = document.getElementById('workspace-form');
const workspaceNameInputEl = document.getElementById('workspace-name-input');
const workspaceDescriptionInputEl = document.getElementById('workspace-description-input');
const workspaceErrorEl = document.getElementById('workspace-error');
const workspaceSearchForms = Array.from(document.querySelectorAll('.workspace-search-form'));
const workspaceSearchInputs = Array.from(document.querySelectorAll('.workspace-search-input'));
const logoutBtn = document.getElementById('logout-btn');
const currentUserEl = document.getElementById('current-user');
const workspaceModalEl = document.getElementById('workspace-modal');
const workspaceDeleteModalEl = document.getElementById('workspace-delete-modal');
const openWorkspaceModalBtn = document.getElementById('open-workspace-modal-btn');
const closeWorkspaceModalBtn = document.getElementById('close-workspace-modal-btn');
const cancelWorkspaceDeleteBtn = document.getElementById('cancel-workspace-delete-btn');
const confirmWorkspaceDeleteBtn = document.getElementById('confirm-workspace-delete-btn');

const session = requireSession();
currentUserEl.textContent = `${session.user.userId} · ${session.user.email}`;
const params = new URLSearchParams(window.location.search);
const PAGE_SIZE = 5;
let currentPage = 1;
let workspaceCache = [];
let workspaceMembersMap = {};
let pendingDeleteResolver = null;
let workspaceSearchKeyword = '';

async function loadWorkspaces() {
  workspaceCache = await getVisibleWorkspaces();
  return workspaceCache;
}

function openWorkspaceModal() {
  workspaceModalEl.classList.add('active');
  workspaceErrorEl.textContent = '';
  workspaceNameInputEl.focus();
}

function closeWorkspaceModal() {
  workspaceModalEl.classList.remove('active');
  workspaceFormEl.reset();
  workspaceErrorEl.textContent = '';
  if (params.get('modal') === 'create') {
    window.history.replaceState({}, '', './workspaces.html');
  }
}

function openWorkspaceDeleteModal() {
  workspaceDeleteModalEl.classList.add('active');
}

function closeWorkspaceDeleteModal(result = false) {
  workspaceDeleteModalEl.classList.remove('active');
  if (pendingDeleteResolver) {
    pendingDeleteResolver(result);
    pendingDeleteResolver = null;
  }
}

function confirmWorkspaceDelete() {
  return new Promise((resolve) => {
    pendingDeleteResolver = resolve;
    openWorkspaceDeleteModal();
  });
}

function createPagination(totalItems, page, onChange) {
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);
  workspacePaginationEl.innerHTML = '';
  workspacePaginationEl.classList.toggle('hidden', totalPages <= 1);

  if (totalPages <= 1) {
    return;
  }

  const prevBtn = document.createElement('button');
  prevBtn.className = 'btn';
  prevBtn.type = 'button';
  prevBtn.textContent = '이전';
  prevBtn.disabled = page === 1;
  prevBtn.addEventListener('click', () => onChange(page - 1));
  workspacePaginationEl.appendChild(prevBtn);

  for (let index = 1; index <= totalPages; index += 1) {
    const pageBtn = document.createElement('button');
    pageBtn.className = `btn ${index === page ? 'btn-primary' : ''}`;
    pageBtn.type = 'button';
    pageBtn.textContent = String(index);
    pageBtn.addEventListener('click', () => onChange(index));
    workspacePaginationEl.appendChild(pageBtn);
  }

  const nextBtn = document.createElement('button');
  nextBtn.className = 'btn';
  nextBtn.type = 'button';
  nextBtn.textContent = '다음';
  nextBtn.disabled = page === totalPages;
  nextBtn.addEventListener('click', () => onChange(page + 1));
  workspacePaginationEl.appendChild(nextBtn);
}

function getFilteredWorkspaces() {
  if (!workspaceSearchKeyword) {
    return workspaceCache;
  }
  const keyword = workspaceSearchKeyword.toLowerCase();
  return workspaceCache.filter((workspace) => workspace.name.toLowerCase().includes(keyword));
}

function syncSearchInputs(value) {
  workspaceSearchInputs.forEach((input) => {
    if (input.value !== value) {
      input.value = value;
    }
  });
}

function createWorkspaceCard(workspace) {
  const isOwner = workspace.role === 'OWNER';
  const roleLabel = isOwner ? 'OWNER' : 'MEMBER';
  const members = workspaceMembersMap[workspace.workspaceId] || [];
  const memberRows = members.length
    ? members
        .map((member) => `${member.name || member.loginId || member.email} (${member.role})`)
        .join('<br />')
    : '멤버 정보가 없습니다.';
  const card = document.createElement('article');
  card.className = 'card';
  card.innerHTML = `
    <div class="meeting-card-head workspace-card-head">
      <div>
        <p class="eyebrow">${roleLabel}</p>
        <h3>${workspace.name}</h3>
      </div>
      <button class="btn btn-primary" type="button" data-select>선택하기</button>
    </div>
    <p class="muted" style="margin: 0 0 14px;">${workspace.description || '워크스페이스 설명 정보가 없습니다.'}</p>
    ${isOwner ? `
      <div class="auth-form" style="margin-top: 16px;">
        <div class="field">
          <label for="invite-${workspace.workspaceId}">이메일 초대</label>
          <input id="invite-${workspace.workspaceId}" type="email" placeholder="예: member@test.com" />
        </div>
        <button class="btn" type="button" data-invite="${workspace.workspaceId}">유저 초대</button>
      </div>
    ` : ''}
    <div class="workspace-actions">
      ${isOwner ? '<button class="auth-switch-link workspace-text-button" type="button" data-delete>워크스페이스 삭제</button>' : '<button class="btn workspace-leave-btn" type="button" data-leave>워크스페이스 나가기</button>'}
    </div>
  `;

  const selectBtn = card.querySelector('[data-select]');
  selectBtn.addEventListener('click', () => {
    setCurrentWorkspace(workspace);
    window.location.href = './dashboard.html';
  });

  if (isOwner) {
    const inviteBtn = card.querySelector(`[data-invite="${workspace.workspaceId}"]`);
    const inviteInput = card.querySelector(`#invite-${workspace.workspaceId}`);
    const deleteBtn = card.querySelector('[data-delete]');

    inviteBtn.addEventListener('click', async () => {
      try {
        await inviteUserToWorkspace(workspace.workspaceId, inviteInput.value);
        inviteInput.value = '';
        await loadWorkspaces();
        await renderWorkspaces();
      } catch (error) {
        workspaceErrorEl.textContent = error.message;
      }
    });
    deleteBtn.addEventListener('click', async () => {
      const confirmed = await confirmWorkspaceDelete();
      if (!confirmed) {
        return;
      }
      try {
        await deleteWorkspace(workspace.workspaceId);
        await loadWorkspaces();
        await renderWorkspaces();
      } catch (error) {
        workspaceErrorEl.textContent = error.message;
      }
    });
  } else {
    const leaveBtn = card.querySelector('[data-leave]');
    leaveBtn.addEventListener('click', async () => {
      if (!window.confirm('이 워크스페이스에서 나가시겠습니까?')) {
        return;
      }
      try {
        await leaveWorkspace(workspace.workspaceId);
        await loadWorkspaces();
        await renderWorkspaces();
      } catch (error) {
        workspaceErrorEl.textContent = error.message;
      }
    });
  }

  return card;
}

async function renderWorkspaces() {
  const workspaces = getFilteredWorkspaces();
  workspaceCountEl.textContent = `${workspaces.length}개 워크스페이스`;
  workspaceListEl.innerHTML = '';
  if (workspaces.length === 0) {
    workspaceListEl.innerHTML = '<div class="empty-state">검색 결과가 없습니다.</div>';
    workspacePaginationEl.innerHTML = '';
    workspacePaginationEl.classList.add('hidden');
    return;
  }
  const totalPages = Math.max(1, Math.ceil(workspaces.length / PAGE_SIZE));
  if (currentPage > totalPages) {
    currentPage = totalPages;
  }
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const visibleWorkspaces = workspaces.slice(startIndex, startIndex + PAGE_SIZE);
  const membersEntries = await Promise.all(
    visibleWorkspaces.map(async (workspace) => {
      try {
        const members = await getWorkspaceMembers(workspace.workspaceId);
        return [workspace.workspaceId, members];
      } catch {
        return [workspace.workspaceId, []];
      }
    })
  );
  workspaceMembersMap = Object.fromEntries(membersEntries);
  visibleWorkspaces.forEach((workspace) => workspaceListEl.appendChild(createWorkspaceCard(workspace)));
  createPagination(workspaces.length, currentPage, (page) => {
    currentPage = page;
    renderWorkspaces().catch((error) => {
      workspaceErrorEl.textContent = error.message;
    });
  });
}

workspaceFormEl.addEventListener('submit', async (event) => {
  event.preventDefault();
  workspaceErrorEl.textContent = '';

  try {
    const workspace = await createWorkspace({
      name: workspaceNameInputEl.value,
      description: workspaceDescriptionInputEl.value
    });
    setCurrentWorkspace(workspace);
    closeWorkspaceModal();
    window.location.href = './index.html';
  } catch (error) {
    workspaceErrorEl.textContent = error.message;
  }
});

workspaceSearchForms.forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
  });
});

workspaceSearchInputs.forEach((input) => {
  input.addEventListener('input', async () => {
    workspaceSearchKeyword = input.value.trim();
    syncSearchInputs(workspaceSearchKeyword);
    currentPage = 1;
    await renderWorkspaces();
  });
});

logoutBtn.addEventListener('click', logoutMock);
if (openWorkspaceModalBtn) {
  openWorkspaceModalBtn.addEventListener('click', openWorkspaceModal);
}
closeWorkspaceModalBtn.addEventListener('click', closeWorkspaceModal);
workspaceModalEl.addEventListener('click', (event) => {
  if (event.target === workspaceModalEl) {
    closeWorkspaceModal();
  }
});
cancelWorkspaceDeleteBtn.addEventListener('click', () => closeWorkspaceDeleteModal(false));
confirmWorkspaceDeleteBtn.addEventListener('click', () => closeWorkspaceDeleteModal(true));
workspaceDeleteModalEl.addEventListener('click', (event) => {
  if (event.target === workspaceDeleteModalEl) {
    closeWorkspaceDeleteModal(false);
  }
});

if (params.get('modal') === 'create') {
  openWorkspaceModal();
}

async function init() {
  try {
    await loadWorkspaces();
    if (!getCurrentWorkspace() && workspaceCache.length > 0) {
      setCurrentWorkspace(workspaceCache[0]);
    }
    await renderWorkspaces();
  } catch (error) {
    workspaceErrorEl.textContent = error.message;
  }
}

init();
