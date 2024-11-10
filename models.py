#python class통해 sql 쿼리 처리, 데이터베이스 상호작용
from sqlalchemy import Column, Integer, String, create_engine
#모델 정의할 때 사용하는 베이스 클래스(이를 이용해 각 테이블 모델 상속받아 정의)
from sqlalchemy.ext.declarative import declarative_base
#세션 생성 함수
from sqlalchemy.orm import sessionmaker
#비번 해싱
from passlib.hash import bcrypt

DATABASE_URL = "sqlite:///./test.db"
#베이스 클래스 정의
Base = declarative_base()

class User(Base):
    #users 테이블 생성
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)

# 데이터베이스 세팅
engine = create_engine(DATABASE_URL)
#정의된 모든 테이블 모델을 실제 db에 생성
Base.metadata.create_all(bind=engine)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
