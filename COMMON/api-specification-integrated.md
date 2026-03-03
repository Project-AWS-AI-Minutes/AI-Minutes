# API 명세서 통합본 (AA)

## 기본 규칙
- Base URL: `/api/v1`
- 인증: `Authorization: Bearer <token>`
- 응답 형식: JSON
- 시간: ISO-8601 UTC 저장

## 주요 엔드포인트

### 1) 회의 생성
- `POST /meetings`
- 요청
```json
{
  "workspaceId": "uuid",
  "title": "주간 스탠드업",
  "startedAt": "2026-02-27T01:00:00Z"
}
```
- 응답: `201 Created`

### 2) 오디오 업로드
- `POST /meetings/{meetingId}/audio`
- multipart/form-data
- 응답: 업로드 작업 ID

### 3) 전사 시작
- `POST /meetings/{meetingId}/transcription:run`
- 응답: 처리 상태

### 4) 요약 생성
- `POST /meetings/{meetingId}/summary:run`
- 요청: 템플릿, 길이 옵션

### 5) 액션 아이템 조회
- `GET /meetings/{meetingId}/action-items`

### 6) 회의 결과 통합 조회
- `GET /meetings/{meetingId}/result`
- 전사/요약/액션 아이템 묶음 반환

## 오류 코드 표준
- `400` 잘못된 요청
- `401` 인증 실패
- `403` 권한 없음
- `404` 리소스 없음
- `409` 상태 충돌
- `500` 서버 오류

## 개발 전 확정 필요 항목
- 비동기 작업 상태 조회 방식(Webhook vs Polling)
- Rate Limit 기준
- API 버전 폐기 정책
