from sqlalchemy import create_engine, Column, Integer, String, Date, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy import Column, Integer, String, create_engine, Float, Date, ForeignKey, Text
import json
from datetime import date


# SQLite 데이터베이스 경로
DATABASE_URL = "sqlite:///./database.db"

# 데이터베이스 연결
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# Base 정의
Base = declarative_base()

# User 모델 정의
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String, unique=True, index=True)
    total_running_distance = Column(Float, default=0)
    total_pullups = Column(Integer, default=0)
    gym_sessions_count = Column(Integer, default=0)
    username = Column(String)

# Challenge 모델 정의
class Challenge(Base):
    __tablename__ = "challenges"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    challenge_date = Column(Date, index=True)
    challenge_type = Column(String)
    details = Column(String)
    checked_dates=Column(Text, default="[]")  # 날짜를 ISO 형식 문자열로 변환
    user = relationship("User", back_populates="challenges")
    def get_checked_dates(self):
        return json.loads(self.checked_dates) if self.checked_dates else []

    def set_checked_dates(self, dates):
        self.checked_dates = json.dumps(dates)

# 테이블 삭제 및 생성
def reset_database():
    print("Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    print("Creating all tables...")
    Base.metadata.create_all(bind=engine)
    print("Database reset completed.")

if __name__ == "__main__":
    reset_database()
