# 배포 구조 문서 (AA)

## 1. 목표
Frontend 서비스를 컨테이너 기반으로 안정 배포하고, Core/API와 연동 가능한 운영 구조를 제공한다.

---

## 2. 구성 요소
- Frontend Service (Nginx + 정적 파일)
- Core API Service
- AI Processing Service
- RDS (단일 DB)
- S3 (음성 파일 저장)
- Ingress / LoadBalancer

---

## 3. 컨테이너 전략
- Front Dockerfile
  - 멀티 스테이지 빌드 (Node build → Nginx serve)
- 헬스체크 엔드포인트 제공
- 이미지 태깅: `frontend:<git-sha>`

---

## 4. CI/CD (GitHub Actions)
- 워크플로우 파일: `frontend.yml`
- 단계:
  1. 테스트/빌드
  2. Docker 이미지 빌드
  3. ECR Push
  4. 배포 매니페스트 반영

---

## 5. Kubernetes 배포
- `Deployment.yaml`
  - replica 설정
  - readiness/liveness probe
- `Service.yaml`
  - ClusterIP 또는 LoadBalancer
- `Ingress.yaml`
  - 외부 라우팅

---

## 6. 배포 전략
- Blue/Green 배포 적용
- 트래픽 전환 전 헬스체크 필수
- 실패 시 즉시 롤백

---

## 7. 운영 체크리스트
- 환경변수(API Base URL) 검증
- CORS 정책 확인
- 정적 리소스 캐시 정책 확인
- 로그/모니터링 대시보드 연결
