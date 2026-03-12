import { getDisplayStatusMeta } from '../api/meetingsApi.js';
import { formatDateTime, escapeHtml } from '../utils/format.js';

export function createMeetingCard(meeting, options = {}) {
  const { canDelete = false, onDelete = null } = options;
  const article = document.createElement('article');
  const displayStatus = meeting.displayStatus || meeting.status;
  const statusMeta = getDisplayStatusMeta(displayStatus);
  const preview =
    displayStatus === 'COMPLETED'
      ? meeting.summary
      : statusMeta.description || meeting.summary || '상태 정보를 확인해주세요.';

  article.className = 'meeting-card';

  article.innerHTML = `
    <div class="meeting-card-head">
      <div>
        <p class="eyebrow">회의</p>
        <h3>${escapeHtml(meeting.title)}</h3>
      </div>
      <span class="badge stage-${displayStatus}">${statusMeta.label}</span>
    </div>
    <div class="meeting-card-meta">
      <span>${formatDateTime(meeting.startedAt)}</span>
      <span>참여자: ${meeting.participants.map(escapeHtml).join(', ')}</span>
    </div>
    <p class="meeting-card-summary">${escapeHtml(preview)}</p>
    <div class="meeting-card-foot">
      <span class="muted">${escapeHtml(meeting.sourceFileName || '파일 미등록')}</span>
      <div class="meeting-card-actions">
        ${canDelete ? '<button class="meeting-card-delete" type="button" data-delete>회의 삭제</button>' : ''}
        <a class="link" href="./meeting.html?id=${encodeURIComponent(meeting.meetingId)}">상세 보기</a>
      </div>
    </div>
  `;

  if (canDelete && typeof onDelete === 'function') {
    const deleteBtn = article.querySelector('[data-delete]');
    deleteBtn.addEventListener('click', (event) => {
      event.preventDefault();
      onDelete(meeting);
    });
  }

  return article;
}
