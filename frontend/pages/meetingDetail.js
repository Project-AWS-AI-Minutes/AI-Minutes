import { getDisplayStatusMeta, getMeetingById, retryMeetingProcessing } from '../api/meetingsApi.js';
import { formatDateTime } from '../utils/format.js';

const titleEl = document.getElementById('meeting-title');
const metaEl = document.getElementById('meeting-meta');
const statusLabelEl = document.getElementById('status-label');
const statusDescriptionEl = document.getElementById('status-description');
const statusBannerEl = document.getElementById('status-banner');
const retryBtn = document.getElementById('retry-btn');
const refreshBtn = document.getElementById('refresh-btn');
const summaryEl = document.getElementById('summary-content');
const transcriptEl = document.getElementById('transcript-content');
const todoRootEl = document.getElementById('todo-root');
const toggleTranscriptBtn = document.getElementById('toggle-transcript-btn');
const copySummaryBtn = document.getElementById('copy-summary-btn');
const downloadSummaryBtn = document.getElementById('download-summary-btn');

let meetingId = '';
let transcriptCollapsed = false;
let pollingTimer = null;

function groupTodosByPerson(todos = []) {
  return todos.reduce((acc, todo) => {
    const key = todo.assignee || 'Unassigned';
    acc[key] = acc[key] || [];
    acc[key].push(todo);
    return acc;
  }, {});
}

function renderTranscript(transcript = '') {
  transcriptEl.innerHTML = '';

  if (!transcript || transcriptCollapsed) {
    transcriptEl.innerHTML = `<div class="empty-state">${transcriptCollapsed ? 'Transcript 섹션이 접혀 있습니다.' : 'Transcript가 아직 준비되지 않았습니다.'}</div>`;
    return;
  }

  transcript.split('\n').filter(Boolean).forEach((line) => {
    const [speaker, ...rest] = line.split(':');
    const item = document.createElement('article');
    item.className = 'transcript-item';
    item.innerHTML = `
      <strong>${speaker || 'Speaker'}</strong>
      <p>${rest.join(':').trim() || line}</p>
    `;
    transcriptEl.appendChild(item);
  });
}

function renderTodos(todos = []) {
  todoRootEl.innerHTML = '';

  if (!todos.length) {
    todoRootEl.innerHTML = '<div class="empty-state">추출된 Action Items가 없습니다.</div>';
    return;
  }

  const grouped = groupTodosByPerson(todos);
  Object.entries(grouped).forEach(([person, items]) => {
    const group = document.createElement('article');
    group.className = 'todo-group-card';
    const listHtml = items
      .map(
        (item) => `
          <article class="todo-item">
            <div class="todo-item-head">
              <h4>${person}</h4>
              <span class="badge stage-COMPLETED">Task</span>
            </div>
            <p>${item.task}</p>
          </article>
        `
      )
      .join('');

    group.innerHTML = `
      <h4>${person}</h4>
      <div class="todo-list">${listHtml}</div>
    `;
    todoRootEl.appendChild(group);
  });
}

function updateStatus(meeting) {
  const displayStatus = meeting.displayStatus || meeting.status;
  const statusMeta = getDisplayStatusMeta(displayStatus);
  statusLabelEl.textContent = statusMeta.label;
  statusDescriptionEl.textContent = statusMeta.description || meeting.summary;
  statusBannerEl.className = `card stage-${displayStatus}`;
  retryBtn.classList.toggle('hidden', displayStatus !== 'FAILED');
}

async function renderMeeting() {
  const meeting = await getMeetingById(meetingId);
  const displayStatus = meeting.displayStatus || meeting.status;

  titleEl.textContent = meeting.title;
  metaEl.textContent = `${formatDateTime(meeting.date)} · ${displayStatus} · ${meeting.sourceFileName}`;
  summaryEl.textContent = meeting.summary || '요약이 아직 준비되지 않았습니다.';

  updateStatus(meeting);
  renderTranscript(meeting.transcript);
  renderTodos(meeting.todos);

  if (['UPLOADED', 'TRANSCRIBING', 'SUMMARIZING'].includes(displayStatus)) {
    startPolling();
  } else {
    stopPolling();
  }
}

function startPolling() {
  if (pollingTimer) return;
  pollingTimer = window.setInterval(renderMeeting, 2500);
}

function stopPolling() {
  if (!pollingTimer) return;
  window.clearInterval(pollingTimer);
  pollingTimer = null;
}

toggleTranscriptBtn.addEventListener('click', async () => {
  transcriptCollapsed = !transcriptCollapsed;
  toggleTranscriptBtn.textContent = transcriptCollapsed ? '펼치기' : '접기';
  await renderMeeting();
});

copySummaryBtn.addEventListener('click', async () => {
  await navigator.clipboard.writeText(summaryEl.textContent || '');
  copySummaryBtn.textContent = 'Copied';
  window.setTimeout(() => {
    copySummaryBtn.textContent = 'Copy Summary';
  }, 1200);
});

downloadSummaryBtn.addEventListener('click', () => {
  const blob = new Blob([summaryEl.textContent || ''], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${meetingId}-summary.txt`;
  link.click();
  URL.revokeObjectURL(url);
});

retryBtn.addEventListener('click', async () => {
  await retryMeetingProcessing(meetingId);
  await renderMeeting();
});

refreshBtn.addEventListener('click', renderMeeting);

async function init() {
  const params = new URLSearchParams(window.location.search);
  meetingId = params.get('id') || '';

  if (!meetingId) {
    titleEl.textContent = 'Meeting not found';
    metaEl.textContent = '유효한 회의 ID가 없습니다.';
    return;
  }

  await renderMeeting();
}

init();
