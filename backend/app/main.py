# FastAPI 연동
# venv\Scripts\activate

from app.database import engine, Base
import app.models

from fastapi import FastAPI

# DB
def init_db():
    Base.metadata.create_all(bind=engine)
    print("테이블 생성 완료")

if __name__ == "__main__":
    init_db()

# FastAPI
app = FastAPI()