from sqlalchemy.orm import Session
from main import SessionLocal, User, Challenge

# 데이터 삭제 함수
def clear_all_data():
    db = SessionLocal()
    try:
        # users 테이블 데이터 삭제
        db.query(User).delete()
        db.commit()

        # challenges 테이블 데이터 삭제
        db.query(Challenge).delete()
        db.commit()

        print("All users and challenges data cleared.")
    except Exception as e:
        db.rollback()
        print(f"Error clearing data: {e}")
    finally:
        db.close()

# 실행
if __name__ == "__main__":
    clear_all_data()
