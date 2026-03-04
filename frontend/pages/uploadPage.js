import { mountUploadZone } from '../components/uploadZone.js';
import { resetMockMeetings } from '../api/meetingsApi.js';

const uploadRoot = document.getElementById('upload-root');

if (!window.localStorage.getItem('meetus-mock-meetings')) {
  resetMockMeetings();
}

mountUploadZone(uploadRoot, {
  onComplete(meeting) {
    window.location.href = `./meeting.html?id=${encodeURIComponent(meeting.id)}`;
  }
});
