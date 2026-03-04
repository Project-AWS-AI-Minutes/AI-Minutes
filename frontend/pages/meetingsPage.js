import { getMeetings, resetMockMeetings } from '../api/meetingsApi.js';
import { createMeetingCard } from '../components/meetingCard.js';

const meetingListEl = document.getElementById('meeting-list');
const emptyStateEl = document.getElementById('empty-state');
const searchInputEl = document.getElementById('search-input');
const dateFilterEl = document.getElementById('date-filter');
const statusFilterEl = document.getElementById('status-filter');
const sortFilterEl = document.getElementById('sort-filter');
const reloadBtn = document.getElementById('reload-btn');

function getFilters() {
  return {
    query: searchInputEl.value,
    fromDate: dateFilterEl.value,
    status: statusFilterEl.value,
    sort: sortFilterEl.value
  };
}

async function renderMeetings() {
  const meetings = await getMeetings(getFilters());
  meetingListEl.innerHTML = '';
  emptyStateEl.classList.toggle('hidden', meetings.length > 0);

  meetings.forEach((meeting) => {
    meetingListEl.appendChild(createMeetingCard(meeting));
  });
}

searchInputEl.addEventListener('input', renderMeetings);
dateFilterEl.addEventListener('change', renderMeetings);
statusFilterEl.addEventListener('change', renderMeetings);
sortFilterEl.addEventListener('change', renderMeetings);
reloadBtn.addEventListener('click', renderMeetings);

if (!window.localStorage.getItem('meetus-mock-meetings')) {
  resetMockMeetings();
}

renderMeetings();
