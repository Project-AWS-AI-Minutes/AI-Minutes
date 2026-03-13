# TA 작업 증적 (Backend / API / Data / Deploy)

## 1) 프로젝트 개요

AI Minutes 프로젝트는 사용자가 회의 음성 파일을 업로드하면 전사, 요약, 결정사항, 개인별 To-Do를 생성하고 이를 다시 조회할 수 있도록 구성된 서비스다.

TA는 이 중 Core API, 데이터 모델, 내부 연동 API, AWS 백엔드 배포 영역을 담당한다.

- Core API는 인증, 워크스페이스, 회의 생성, 업로드 제어, 결과 조회, To-Do 관리를 담당한다.
- 내부 연동 API는 AI 처리 결과 수신과 실패 통지를 담당한다.
- 데이터 저장소는 사용자, 워크스페이스, 회의, 요약, To-Do, 재처리 이력을 보관한다.
- AWS 리소스는 백엔드 컨테이너 배포, 로드밸런싱, 로그 수집, 이미지 저장을 담당한다.

---

## 2) TA 목표

- Core API 명세와 구현 기준 정리
- 데이터베이스 스키마 및 마이그레이션 기준 문서화
- ECS 기반 백엔드 배포 경험 정리
- SA, AA와의 연동 포인트를 문서 기준으로 정합화

---

## 3) 환경 구분

운영 환경은 `local`, `dev`, `stage`, `prod` 4개로 구분한다.

| 환경 | 목적 | 실행 기준 | 진입점 | 배포 기준 |
| --- | --- | --- | --- | --- |
| `local` | 개인 개발 및 API 확인 | 로컬 FastAPI 실행 | `localhost:8000` | Swagger `/docs`, DB 연결, 라우터 동작 확인 |
| `dev` | 팀 통합 개발 | 개발 배포본 | dev ALB 또는 내부 URL | AA, SA 연동 및 상태 흐름 확인 |
| `stage` | 운영 전 검증 | 운영 유사 환경 | stage ALB DNS | ECS/ALB/CodeDeploy 검증 |
| `prod` | 실제 운영 | 운영 배포본 | 운영 ALB 또는 도메인 | 실서비스 운영 및 롤백 대응 |

### 3.1 Local

- FastAPI 로컬 실행 기준 백엔드 개발 환경
- `/docs` 기준 API 요청/응답 점검

### 3.2 Dev

- 프론트, AI 파이프라인과 연동하는 통합 개발 환경
- S3 업로드, SQS 요청, 내부 웹훅 수신 흐름 검증

### 3.3 Stage

- 운영 전 배포 검증 환경
- ECS 태스크, Target Group, 로그, 헬스체크 검증

### 3.4 Prod

- 실제 운영 환경
- blue/green 또는 rolling update 기준 배포 및 장애 대응

---

## 4) 산출물

- [TA API 명세](./api-spec.md)
- [Database 설계 문서](./database-design.md)
- [AWS 배포 작업 증적 2026-03-09](./aws-deploy-evidence-2026-03-09.md)
- [AWS 배포 작업 증적 2026-03-11](./aws-deploy-evidence-2026-03-11.md)
- [AWS 배포 작업 증적 2026-03-12](./aws-deploy-evidence-2026-03-12.md)
- [통합 API 명세](../COMMON/api-specification-integrated.md)
- [시스템 플로우차트](../COMMON/system-flowchart.md)
- [상태 흐름도](../COMMON/state-flow-diagram.md)
- [네트워크 구성도](../COMMON/network-topology.md)
- [아키텍처 다이어그램](../COMMON/architecture-diagram.md)
- [CI/CD 흐름](../COMMON/ci-cd-flow.md)
- [AA API 연동 문서](../AA/api-integration.md)

---

## 5) TA 작업 범위

### 5.1 API / 데이터 설계

- 인증, 워크스페이스, 회의, To-Do, 내부 AI 연동 API 명세 정리
- DB 테이블, ENUM, 인덱스, 관계 설계 정리
- API 응답 구조와 에러 규약 정리

### 5.2 백엔드 구현 및 배포 산출물

- [backend/app/main.py](../backend/app/main.py)
- [backend/app/routers/meeting_router.py](../backend/app/routers/meeting_router.py)
- [backend/app/routers/internal_router.py](../backend/app/routers/internal_router.py)
- [backend/app/services/meeting_service.py](../backend/app/services/meeting_service.py)
- [backend/deploy/taskdef-core-api.template.json](../backend/deploy/taskdef-core-api.template.json)
- [backend/deploy/appspec-core-api.yaml](../backend/deploy/appspec-core-api.yaml)
- [backend/migrations/2026-03-11_meeting_failure_reason.sql](../backend/migrations/2026-03-11_meeting_failure_reason.sql)

### 5.3 정합화 및 운영 기준

- SA 요청사항 기준 `due_date`, 실패 웹훅, 실패 사유 저장 반영
- AA 프론트 연동 기준 상태값 및 API 경로 정합화
- GitHub Actions, ECS, ECR, CodeDeploy 기준 배포 흐름 정리

---

## 6) 상태값 기준

TA 문서와 API 구현에서 공통으로 사용하는 회의 상태값은 아래와 같다.

| 상태 | 의미 |
| --- | --- |
| `CREATED` | 회의 메타데이터 생성 완료 |
| `UPLOADED` | 오디오 업로드 완료 |
| `PROCESSING` | AI 처리 진행 중 |
| `COMPLETED` | 결과 생성 완료 |
| `FAILED` | 처리 실패 |

관련 API:

- `POST /workspaces/{workspaceId}/meetings`
- `POST /meetings/{meetingId}/upload-url`
- `POST /meetings/{meetingId}/upload-complete`
- `POST /meetings/{meetingId}/process`
- `POST /meetings/{meetingId}/retry`
- `GET /meetings`
- `GET /meetings/{meetingId}`
- `GET /todos`
- `PATCH /todos/{todoId}`
- `POST /internal/ai/result`
- `POST /internal/ai/failed`

---

## 7) TA 구성 및 흐름

### 7.1 TA 서비스 흐름

- `User`
  - 프론트 또는 API 클라이언트 사용자
- `Frontend`
  - 업로드, 목록, 상세 조회 화면 제공
- `Core API`
  - 인증, 회의 생성, 업로드 URL 발급, 상태 변경, 결과 조회 처리
- `S3`
  - 회의 음성 파일 저장
- `SQS`
  - AI 처리 요청 전달
- `AI Processing Service`
  - 전사, 요약, To-Do 생성 후 내부 웹훅 호출
- `RDS`
  - 사용자, 워크스페이스, 회의 및 결과 데이터 저장
- `CloudWatch`
  - 애플리케이션 로그 수집

1. 사용자가 프론트에서 회의를 생성한다.
2. Core API가 회의 메타데이터를 저장하고 업로드 URL을 발급한다.
3. 사용자가 `Presigned URL` 로 음성 파일을 `S3` 에 업로드한다.
4. 업로드 완료 후 Core API가 회의 상태를 `UPLOADED` 로 반영한다.
5. `POST /meetings/{meetingId}/process` 호출 시 Core API가 SQS에 AI 처리 요청을 보낸다.
6. AI 서비스가 처리 결과를 `POST /internal/ai/result` 또는 `POST /internal/ai/failed` 로 전달한다.
7. Core API가 결과를 `RDS` 에 반영하고 프론트는 목록/상세/To-Do API로 조회한다.

### 7.2 TA CI/CD 흐름

- `GitHub`
  - 백엔드 소스 저장소
- `GitHub Actions`
  - Docker 빌드, ECR Push, ECS/CodeDeploy 배포 실행
- `IAM OIDC Role`
  - GitHub Actions의 AWS 접근 권한
- `ECR`
  - Core API 이미지 저장소
- `ECS`
  - Core API 서비스 실행 환경
- `CodeDeploy`
  - blue/green 배포 제어

1. 백엔드 코드가 `main` 브랜치에 반영된다.
2. `backend-ci-cd` 워크플로가 실행된다.
3. GitHub Actions가 OIDC로 AWS 역할을 Assume 한다.
4. Docker 이미지를 빌드하고 ECR에 push 한다.
5. Task Definition을 등록하고 AppSpec 기준 배포를 준비한다.
6. ECS 또는 CodeDeploy가 새 태스크 버전을 반영한다.
7. 헬스체크와 서비스 안정화 확인 후 배포를 완료한다.

---

## 8) AWS 배포 결과 요약

### 8.1 실제 복원 가능한 주요 값

- AWS Region: `ap-northeast-2`
- AWS Account ID: `692681389373`
- VPC ID: `vpc-0ff95fed577b6ba3d`
- Subnet IDs: `subnet-000d0cd4984fc695f`, `subnet-08313de4d92e33a50`
- ECS Cluster: `ai-minutes-cluster`
- Rolling Service: `ai-minutes-core-api-service`
- CodeDeploy Service: `ai-minutes-core-api-codedeploy-service`
- ECS Task Family: `ai-minutes-core-api-task`
- ECR Repository: `ai-minutes-core-api`
- Production Target Group: `meetus-core-api-tg`
- Green Target Group: `meetus-core-api-green-tg`
- Core API URL: `http://meetus-alb-858165370.ap-northeast-2.elb.amazonaws.com`
- CloudWatch Logs Group: `/ecs/ai-minutes-core-api`

### 8.2 실제 배포 흐름 요약

1. Docker 이미지 빌드와 ECR push를 먼저 완료했다.
2. ECS 클러스터, Task Definition, 서비스 생성으로 rolling update 배포를 구성했다.
3. 로그 그룹, 보안그룹, 헬스체크 문제를 조치해 서비스 기동을 정상화했다.
4. GitHub Actions OIDC 역할과 Secret을 구성해 자동 배포 경로를 마련했다.
5. 이후 CodeDeploy 리소스를 추가해 blue/green 전환 구조를 준비했다.

### 8.3 연결되는 파일

- [backend/Dockerfile](../backend/Dockerfile)
- [backend/deploy/taskdef-core-api.template.json](../backend/deploy/taskdef-core-api.template.json)
- [backend/deploy/appspec-core-api.yaml](../backend/deploy/appspec-core-api.yaml)
- [.github/workflows/backend.yml](../.github/workflows/backend.yml)

---

## 9) 트러블슈팅

### 9.1 `.env` 포맷 오류

- 원인: `DATABASE_URL = ...` 형태의 공백 포함
- 조치: `KEY=value` 형식으로 정리 필요 확인

### 9.2 ECR 인증 토큰 조회 실패

- 원인: 태스크의 ECR 접근 네트워크 경로 미확보
- 조치: ECS 서비스 네트워크 설정 재조정 후 재배포

### 9.3 CloudWatch Logs 미생성

- 원인: 태스크 정의의 로그 그룹이 사전에 생성되지 않음
- 조치: `/ecs/ai-minutes-core-api` 로그 그룹 생성

### 9.4 Target Group 헬스체크 타임아웃

- 원인: ECS 태스크 보안그룹 설정 미흡
- 조치: ECS Task 전용 SG를 생성하고 ALB SG만 인바운드 허용

### 9.5 GitHub Actions 권한 부족

- 원인: `ecs:RegisterTaskDefinition`, `iam:PassRole`, CodeDeploy 관련 권한 누락
- 조치: OIDC 역할 정책에 ECS, PassRole, CodeDeploy 권한 추가

---

## 10) 최종 요약

- TA는 Core API 명세, 데이터베이스 설계, 내부 AI 연동 API를 문서화했다.
- TA는 ECS 기반 백엔드 배포를 수행하고 장애 원인과 조치 이력을 정리했다.
- TA는 GitHub Actions OIDC 기반 자동 배포와 CodeDeploy blue/green 전환 구조를 준비했다.
- TA는 AA, SA와의 연동에 필요한 상태값, API 경로, 실패 처리 규칙을 정합화했다.
