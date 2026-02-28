import { formatDateTime, escapeHtml } from '../utils/format.js';

const STATUS_LABEL = {
  UPLOADED: 'UPLOADED',
  TRANSCRIBING: 'TRANSCRIBING',
  SUMMARIZING: 'SUMMARIZING',
  TODO_EXTRACTING: 'TODO_EXTRACTING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED'
};

export function createMeetingCard(meeting) {
  const article = document.createElement('article');
  article.className = 'meeting-item';

  article.innerHTML = `
    <div class="meeting-item-head">
      <h3>${escapeHtml(meeting.title)}</h3>
      <span class="badge status-${meeting.status}">${STATUS_LABEL[meeting.status] ?? meeting.status}</span>
    </div>
    <p class="muted">${formatDateTime(meeting.date)}</p>
    <p class="muted">참여자: ${meeting.participants.map(escapeHtml).join(', ')}</p>
    <div class="meeting-item-foot">
      <a class="link" href="./meeting.html?id=${encodeURIComponent(meeting.id)}">상세 보기</a>
    </div>
  `;

  return article;
}
