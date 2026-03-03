# CI/CD 흐름도 (AA)

## 브랜치 전략(초안)
- main: 배포 기준
- develop: 통합 개발
- feature/*: 기능 작업

## 파이프라인 단계
1. PR 생성
2. Lint/Test 실행
3. Build
4. Staging 배포
5. 승인 후 Production 배포

## Mermaid Diagram
```mermaid
flowchart LR
    A[feature/*] --> B[Pull Request]
    B --> C[CI: Lint/Test/Build]
    C --> D[Staging Deploy]
    D --> E[Approval]
    E --> F[Production Deploy]
```

## 개발 전 확정 필요 항목
- 실패 시 롤백 방식
- 배포 승인 권한자
- 시크릿 주입 방식
