import boto3
import sys
import os

# ai-pipeline/src가 포함되도록 경로 설정 (필요 시)
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from .config import config
    print(f"[*] 환경 설정 로드 완료 (Region: {config.AWS_REGION})")
except ImportError:
    # 직접 실행 시를 대비한 백업 (수동 설정 시 사용)
    print("[!] config 모듈을 찾을 수 없어 기본 환경 변수를 확인합니다.")
    class MockConfig:
        AWS_REGION = 'ap-northeast-2'
        S3_BUCKET = 'meetus-audio-storage'
    config = MockConfig()

def test_s3_connection():
    target_bucket = config.S3_BUCKET if hasattr(config, 'S3_BUCKET') else 'meetus-audio-storage'
    print(f"[*] S3 연동 테스트 시작: s3://{target_bucket}")
    
    # ECS Task Role이 사용하는 것과 동일하게 세션 생성
    # (로컬 TEST 시에는 환경 변수의 ACCESS_KEY를 사용)
    s3 = boto3.client('s3', region_name=config.AWS_REGION)
    
    try:
        # 1. 버킷 존재 확인 및 권한 체크 (HeadBucket)
        # 이 작업은 s3:ListBucket 권한이 필요합니다.
        print(f"[*] 단계 1: 버킷 연결 시도 (HeadBucket)...")
        s3.head_bucket(Bucket=target_bucket)
        print(f"[✅ SUCCESS] 버킷 '{target_bucket}'에 연결되었습니다.")
        
        # 2. 특정 파일 읽기 테스트 (GetObject)
        # s3:GetObject 권한이 필요합니다.
        test_key = "009b04a4-e793-450e-bb18-751a8d883486/47f8e5b5-8869-445b-89b1-ed3fcc040798.m4a"
        print(f"[*] 단계 2: 특정 파일 읽기 시도 (GetObject: {test_key})...")
        s3.get_object(Bucket=target_bucket, Key=test_key)
        print(f"[✅ SUCCESS] 파일 읽기 권한 확인 완료!")

    except Exception as e:
        print(f"[❌ FAILED] 에러 발생: {e}")
        if "403" in str(e):
            print("\n[💡 원인 분석 및 해결 가이드]")
            print("선영님이 '권한을 줬다'고 하셨는데도 403이 뜨는 가장 흔한 이유 3가지:")
            print("1. ARN 오타: 선영님 버킷 정책에 적힌 Account ID (818466672325)나 Role 이름 (MeetUs-SA-TaskRole)에 오타가 있을 수 있습니다.")
            print("2. 리소스 범위 오류: 정책에서 'arn:aws:s3:::meetus-audio-storage/*' 처럼 뒤에 /* 를 붙이지 않으면 내부 파일을 못 읽습니다.")
            print("3. 크로스 계정 누락: 선영님 계정의 IAM 권한이 아니라, 반드시 'S3 버킷 정책(Bucket Policy)'에서 주환님을 허용해줘야 합니다.")
        else:
            print(f"기타 에러: {e}")

if __name__ == "__main__":
    test_s3_connection()
