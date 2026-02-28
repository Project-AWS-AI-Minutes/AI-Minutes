import { mockMeetings } from './mockData.js';

const NETWORK_DELAY_MS = 250;

function simulateDelay(payload) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(structuredClone(payload)), NETWORK_DELAY_MS);
  });
}

// GET /api/meetings
export async function getMeetings() {
  return simulateDelay(mockMeetings);
}

// GET /api/meetings/{id}
export async function getMeetingById(id) {
  const meeting = mockMeetings.find((item) => item.id === id);
  if (!meeting) {
    throw new Error('회의를 찾을 수 없습니다.');
  }
  return simulateDelay(meeting);
}

/*
  백엔드 연동 시 교체 예시:

  export async function getMeetings() {
    const res = await fetch('/api/meetings');
    if (!res.ok) throw new Error('회의 목록 조회 실패');
    return res.json();
  }

  export async function getMeetingById(id) {
    const res = await fetch(`/api/meetings/${id}`);
    if (!res.ok) throw new Error('회의 상세 조회 실패');
    return res.json();
  }
*/
