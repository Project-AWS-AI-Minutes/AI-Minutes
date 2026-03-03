import { getMeetingById } from '../api/meetingsApi.js';
import { createTodoCard } from '../components/todoCard.js';
import { formatDateTime } from '../utils/format.js';
import { initMobileSidebar } from '../utils/mobileSidebar.js';

const titleEl = document.getElementById('meeting-title');
const metaEl = document.getElementById('meeting-meta');
const summaryEl = document.getElementById('summary-content');
const todoRootEl = document.getElementById('todo-root');

initMobileSidebar();

async function init() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
    titleEl.textContent = '잘못된 접근';
    summaryEl.textContent = '회의 ID가 없습니다.';
    return;
  }

  try {
    const meeting = await getMeetingById(id);

    titleEl.textContent = meeting.title;
    metaEl.textContent = `${formatDateTime(meeting.date)} · 상태: ${meeting.status}`;
    summaryEl.textContent = meeting.summary || '요약이 아직 없습니다.';

    todoRootEl.innerHTML = '';
    if (!meeting.todos?.length) {
      todoRootEl.innerHTML = '<p class="muted">추출된 To-Do가 없습니다.</p>';
      return;
    }

    meeting.todos.forEach((todo) => {
      todoRootEl.appendChild(createTodoCard(todo));
    });
  } catch (error) {
    titleEl.textContent = '로딩 실패';
    summaryEl.textContent = error.message;
  }
}

init();
