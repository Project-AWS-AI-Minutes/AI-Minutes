import { getMeetings, resetMockMeetings } from '../api/meetingsApi.js';
import { createMeetingCard } from '../components/meetingCard.js';

const archiveListEl = document.getElementById('archive-list');
const emptyStateEl = document.getElementById('empty-state');
const searchInputEl = document.getElementById('search-input');
const dateFilterEl = document.getElementById('date-filter');
const sortFilterEl = document.getElementById('sort-filter');

function getFilters() {
  return {
    query: searchInputEl.value,
    fromDate: dateFilterEl.value,
    sort: sortFilterEl.value
  };
}

async function renderArchive() {
  const meetings = await getMeetings(getFilters());
  const archived = meetings.filter((meeting) => ['COMPLETED', 'FAILED'].includes(meeting.displayStatus || meeting.status));

  archiveListEl.innerHTML = '';
  emptyStateEl.classList.toggle('hidden', archived.length > 0);

  archived.forEach((meeting) => {
    archiveListEl.appendChild(createMeetingCard(meeting));
  });
}

searchInputEl.addEventListener('input', renderArchive);
dateFilterEl.addEventListener('change', renderArchive);
sortFilterEl.addEventListener('change', renderArchive);

if (!window.localStorage.getItem('meetus-mock-meetings')) {
  resetMockMeetings();
}

renderArchive();
