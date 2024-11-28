import os
<<<<<<< HEAD
from fastapi import FastAPI, Form
from fastapi.responses import HTMLResponse, RedirectResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from jinja2 import Template

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")
STATIC_DIR="C:\\Servicelearning\\static"
STUDENT_IDS_FILE = "student_ids.txt"
USER_PAGES_DIR = "C:\\Servicelearning\\user_pages"

os.makedirs(USER_PAGES_DIR, exist_ok=True)  # 사용자별 HTML 페이지를 저장할 디렉터리 생성

def read_student_ids():
    try:
        with open(STUDENT_IDS_FILE, "r") as file:
            return file.read().splitlines()
    except FileNotFoundError:
        return []

def add_student_id(student_id: str):
    with open(STUDENT_IDS_FILE, "a") as file:
        file.write(student_id + "\n")
=======
from fastapi import FastAPI, Form, UploadFile, File, Cookie, Depends, HTTPException, Request
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from sqlalchemy.orm import Session
from sqlalchemy import Column, Integer, String, create_engine, Float, Date, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship


from datetime import date
from jinja2 import Template
from PIL import Image  # Add PIL for image validation
import uuid
#fastapi초기화
app = FastAPI()
#데이터베이스 설정
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test.db")

Base = declarative_base()
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

#사용자 모델 정의
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String, unique=True, index=True)
    running_km = Column(Float, default=0)  # 러닝 총 거리
    pullups_count = Column(Integer, default=0)  # 턱걸이 총 횟수
    gym_sessions = Column(Integer, default=0)  # 헬스 총 세션
    username = Column(String)

class Challenge(Base):
    __tablename__ = "challenges"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))  # 사용자 ID
    date = Column(Integer, index=True)  # 챌린지 날짜
    challenge_type = Column(String)  # 'running', 'pullups', 'gym'
    data = Column(String)  # JSON 형태로 저장되는 세부 데이터 (예: 거리, 속도 등)
    user = relationship("User", back_populates="challenges")

User.challenges = relationship("Challenge", back_populates="user")


#데이터베이스 초기화
def init_db():
    Base.metadata.create_all(bind=engine)
#DB 세션 생성
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.on_event("startup")
async def startup_event():
    init_db()

app.mount("/static", StaticFiles(directory="static"), name="static")
STATIC_DIR = "C:\\Servicelearning\\static"
STUDENT_IDS_FILE = "student_ids.txt"
USER_PAGES_DIR = "C:\\Servicelearning\\user_pages"
os.makedirs(USER_PAGES_DIR, exist_ok=True)  # 사용자별 HTML 페이지를 저장할 디렉터리 생성
        
@app.get("/", response_class=HTMLResponse)
async def stretching_page():
    with open("static/stretch.html", "r", encoding="utf-8") as file:
        return HTMLResponse(content=file.read())
>>>>>>> 180d3a17f01c6395e900fff74a81a2c8ac67a9ca

@app.get("/login", response_class=HTMLResponse)
async def login_page():
    with open("static/login.html", "r", encoding="utf-8") as file:
        return HTMLResponse(content=file.read())

@app.post("/login")
<<<<<<< HEAD
async def login(username: str = Form(...)):
    student_ids = read_student_ids()
    user_page_path = os.path.join(USER_PAGES_DIR, f"{username}.html")

    if username in student_ids:
        # 기존 사용자는 개인화된 페이지로 리다이렉트
        return RedirectResponse(url=f"/challenge/{username}", status_code=303)
    else:
        # 새로운 사용자면 학번 추가 및 개인화 페이지 생성
        add_student_id(username)
        
        # 개인화된 HTML 페이지 생성
        with open("static/challenge_template.html", "r", encoding="utf-8") as file:
            template = Template(file.read())
            personalized_content = template.render(username=username)
        
        # 사용자별 HTML 파일로 저장
        with open(user_page_path, "w", encoding="utf-8") as user_file:
            user_file.write(personalized_content)
        
        return RedirectResponse(url=f"/challenge/{username}", status_code=303)

@app.get("/challenge/{username}", response_class=HTMLResponse)
async def challenge_page(username: str):
    user_page_path = os.path.join(USER_PAGES_DIR, f"{username}.html")
    if os.path.exists(user_page_path):
        # 사용자 HTML 파일을 읽어 수정
        with open(user_page_path, "r", encoding="utf-8") as file:
            content = file.read()

        # 정적 파일 경로를 수정 (예: /static/style.css)
        content = content.replace('href="style.css"', 'href="/static/style.css"')
        content = content.replace('src="challenge_template.js"', 'src="/static/challenge_template.js"')

        # 수정된 HTML 반환
        return HTMLResponse(content=content)
    else:
        return HTMLResponse(content="페이지를 찾을 수 없습니다.", status_code=404)
=======
async def login(student_id: str = Form(...), db: Session = Depends(get_db)):
    #db에서 student_id확인
    user = db.query(User).filter(User.student_id == student_id).first()
    #사용자 정보 없으면 추가
    user_page_path = os.path.join(USER_PAGES_DIR, f"{student_id}.html")
    if not user:
        new_user = User(student_id=student_id, username=f"User_{student_id}")
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        user=new_user
        #사용자별 개인화된 html생성
        try:
            with open("static/challenge_template.html", "r", encoding="utf-8") as file:
                template = Template(file.read())
                personalized_content = template.render(student_id=student_id)
            
            with open(user_page_path, "w", encoding="utf-8") as user_file:
                user_file.write(personalized_content)
        except Exception as e:
            db.delete(new_user)
            db.commit()
            raise HTTPException(status_code=500, detail=f"Error creating personalized page: {str(e)}")
    
    #로그인 성공 시 쿠키 설정 및 리다이렉션
    response = RedirectResponse(url=f"/challenge/{user.student_id}", status_code=303)
    response.set_cookie(key="student_id", value=user.student_id, httponly=True, secure=False, samesite="Lax") #나중에 True로
    return response

@app.get("/api/check-login")
async def check_login(request: Request, db: Session = Depends(get_db)):
    # 1. 쿠키에서 student_id 가져오기
    student_id = request.cookies.get("student_id")
    if not student_id:
        return JSONResponse({"isLoggedIn": False}, status_code=200)

    # 2. 데이터베이스에서 student_id 확인
    user = db.query(User).filter(User.student_id == student_id).first()
    if not user:
        return JSONResponse({"isLoggedIn": False}, status_code=200)

    # 3. 성공적으로 로그인된 상태
    return JSONResponse({"isLoggedIn": True, "student_id": user.student_id}, status_code=200)


@app.get("/challenge/{student_id}", response_class=HTMLResponse)
async def challenge_page(student_id: str):
    user_page_path = os.path.abspath(os.path.join(USER_PAGES_DIR, f"{student_id}.html"))
    if not user_page_path.startswith(os.path.abspath(USER_PAGES_DIR)):
        return HTMLResponse(content="잘못된 경로 요청입니다.", status_code=400)
    try:
        with open(user_page_path, "r", encoding="utf-8") as file:
            return HTMLResponse(content = file.read())
            #return HTMLResponse(content=content.replace('challenge.css', '/static/challenge.css').replace('challenge_template.js', '/static/challenge_template.js'))
    except FileNotFoundError:
        return HTMLResponse(content="페이지를 찾을 수 없습니다.", status_code=404)
    except Exception as e:
        return HTMLResponse(content=f"파일 읽기 오류: {str(e)}", status_code=500)

    

@app.get("/challenge/{student_id}/progress")
async def get_progress(student_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.student_id == student_id).first()
    if not user:
        return JSONResponse({"error": "User not found"}, status_code=404)

    return {
        "running_km": user.running_km,
        "pullups_count": user.pullups_count,
        "gym_sessions": user.gym_sessions
    }

@app.post("/challenge/{student_id}/submit")
async def submit_challenge(student_id: str, data: dict, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.student_id == student_id).first()
    if not user:
        return JSONResponse({"error": "User not found"}, status_code=404)

    challenge_date = data.get("date")
    challenge_type = data.get("type")
    details = data.get("details")  # JSON 형태로 세부 데이터를 받음
    #필수 데이터 검증
    if not challenge_date or not challenge_type or not isinstance(details, dict):
        return JSONResponse({"error": "Invalid input data"}, status_code=400)
    # 중복 데이터 방지
    existing = db.query(Challenge).filter_by(user_id=user.id, date=challenge_date, challenge_type=challenge_type).first()
    if existing:
        return JSONResponse({"error": "Challenge for this date already exists"}, status_code=400)

    # 데이터 추가
    new_challenge = Challenge(
        user_id=user.id,
        date=challenge_date,
        challenge_type=challenge_type,
        data=str(details)
    )
    db.add(new_challenge)

    # 진행 상황 업데이트
    if challenge_type == "running":
        user.running_km += details.get("km", 0)
    elif challenge_type == "pullups":
        user.pullups_count += details.get("count", 0)
    elif challenge_type == "gym":
        user.gym_sessions += 1

    db.commit()
    return {"message": "Challenge submitted successfully"}


@app.get("/challenge/{student_id}/leaderboard")
async def get_leaderboard(db: Session = Depends(get_db)):
    top_runner = db.query(User).order_by(User.running_km.desc()).first()
    top_pullup = db.query(User).order_by(User.pullups_count.desc()).first()
    return {
        "top_runners": [
            {"student_id": top_runner.student_id, "running_km": top_runner.running_km} if ((top_runner is not None) and (top_runner.running_km != 0)) else {"student_id": "N/A", "running_km": 0}
        ],
        "top_pullups": [
            {"student_id": top_pullup.student_id, "pullups_count": top_pullup.pullups_count} if ((top_pullup is not None) and (top_pullup.pullups_count != 0)) else {"student_id": "N/A", "pullups_count": 0}
        ]
    }

>>>>>>> 180d3a17f01c6395e900fff74a81a2c8ac67a9ca
