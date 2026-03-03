# 상태 흐름도 (AA)

## 회의 처리 상태
- DRAFT
- AUDIO_UPLOADED
- TRANSCRIBING
- TRANSCRIBED
- SUMMARIZING
- COMPLETED
- FAILED

## Mermaid State Diagram
```mermaid
stateDiagram-v2
    [*] --> DRAFT
    DRAFT --> AUDIO_UPLOADED: 오디오 업로드 완료
    AUDIO_UPLOADED --> TRANSCRIBING: 전사 작업 시작
    TRANSCRIBING --> TRANSCRIBED: 전사 성공
    TRANSCRIBING --> FAILED: 전사 실패
    TRANSCRIBED --> SUMMARIZING: 요약 작업 시작
    SUMMARIZING --> COMPLETED: 요약/추출 성공
    SUMMARIZING --> FAILED: 요약 실패
    FAILED --> TRANSCRIBING: 재시도(전사)
    FAILED --> SUMMARIZING: 재시도(요약)
```

## 상태 전이 규칙
- 전사 완료 전 요약 시작 불가
- FAILED 상태에서는 실패 원인 코드 저장 필수
- COMPLETED 이후 수정은 재처리 작업으로만 허용
