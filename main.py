# First Part of main.py
import os
from fastapi import FastAPI, Form, UploadFile, File, Cookie, Depends, HTTPException, Request, Response, APIRouter
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import Column, Integer, String, create_engine, Float, Date, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
import json
from datetime import date
from jinja2 import Template
from PIL import Image  # Add PIL for image validation
import uuid

# FastAPI 초기화
app = FastAPI()

# 데이터베이스 설정
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./database.db")

Base = declarative_base()
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

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

User.challenges = relationship("Challenge", back_populates="user")

# 데이터베이스 초기화
def init_db():
    Base.metadata.create_all(bind=engine)

# 데이터베이스 세션 생성
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Startup event
@app.on_event("startup")
async def startup_event():
    init_db()

# 정적 파일 서빙
app.mount("/static", StaticFiles(directory="static"), name="static")
STATIC_DIR = "./static"
USER_PAGES_DIR = "./user_pages"
os.makedirs(USER_PAGES_DIR, exist_ok=True)
# Second Part of main.py

# 기본 홈 페이지: 스트레칭 페이지로 리다이렉트
@app.get("/", response_class=HTMLResponse)
async def home_page(request: Request):
    # 기본 페이지로 스트레칭 페이지 제공
    file_path = os.path.join(os.path.dirname(__file__), "static/stretch.html")
    try:
        with open(file_path, "r", encoding="utf-8") as file:
            return HTMLResponse(content=file.read())
    except FileNotFoundError:
        return HTMLResponse(content="스트레칭 페이지를 찾을 수 없습니다.", status_code=404)

# 챌린지 체크 페이지: 로그인 확인 후 챌린지 선택 페이지로 리다이렉트
@app.get("/challenge_check", response_class=HTMLResponse)
async def challenge_check(request: Request, db: Session = Depends(get_db)):
    student_id = request.cookies.get("student_id")
    user = db.query(User).filter(User.student_id == student_id).first()
    if (not student_id or not user):
        return RedirectResponse(url="/login", status_code=303)
    return RedirectResponse(url="/challenge_selection", status_code=303)


# 챌린지 선택 페이지
@app.get("/challenge_selection", response_class=HTMLResponse)
async def challenge_selection_page(request: Request):
    student_id = request.cookies.get("student_id")
    if not student_id:
        return RedirectResponse(url="/login", status_code=303)
    try:
        with open("static/challenge_selection.html", "r", encoding="utf-8") as file:
            return HTMLResponse(content=file.read())
    except FileNotFoundError:
        return HTMLResponse(content="챌린지 선택 페이지를 찾을 수 없습니다.", status_code=404)

# 로그인 페이지
@app.get("/login", response_class=HTMLResponse)
async def login_page():
    try:
        with open("static/login.html", "r", encoding="utf-8") as file:
            return HTMLResponse(content=file.read())
    except FileNotFoundError:
        return HTMLResponse(content="로그인 페이지를 찾을 수 없습니다.", status_code=404)

# 로그인 처리
@app.post("/login")
async def login(student_id: str = Form(...), db: Session = Depends(get_db)):
    # 사용자가 데이터베이스에 있는지 확인
    user = db.query(User).filter(User.student_id == student_id).first()
    user_dir_path = os.path.abspath(os.path.join('user_pages', student_id))
    if not user:
        # 사용자 생성
        new_user = User(student_id=student_id, username=f"User_{student_id}")
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        user = new_user
        #사용자별 개인화된 html생성
        try:
            os.makedirs(user_dir_path, exist_ok=True)

            with open("static/running_challenge.html", "r", encoding="utf-8") as file:
                template = Template(file.read())
                personalized_content = template.render(student_id=student_id)
                running_challenge_path = os.path.join(user_dir_path, "running_challenge.html")

            with open(running_challenge_path, "w", encoding="utf-8") as user_file:
                user_file.write(personalized_content)

            with open("static/workout_challenge.html", "r", encoding="utf-8") as file:
                template = Template(file.read())
                personalized_content = template.render(student_id=student_id)
                workout_challenge_path = os.path.join(user_dir_path, "workout_challenge.html")

            with open(workout_challenge_path, "w", encoding="utf-8") as user_file:
                user_file.write(personalized_content)
        except Exception as e:
            db.delete(new_user)
            db.commit()
            raise HTTPException(status_code=500, detail=f"Error creating personalized page: {str(e)}")

    # 쿠키 설정 후 리다이렉트
    response = RedirectResponse(url="/challenge_selection", status_code=303)
    response.set_cookie(
        key="student_id",
        value=user.student_id,
        httponly=False,
        secure=False,
        samesite="Lax",
        path="/"  # 모든 경로에 대해 유효하도록 설정
    )
    return response
# Third Part of main.py
# 러닝 챌린지 페이지
@app.get("/challenge/running_challenge", response_class=HTMLResponse)
async def running_challenge_page(request: Request):
    student_id = request.cookies.get("student_id")
    if not student_id:
        return RedirectResponse(url="/login", status_code=303)
    user_page_path = os.path.abspath(os.path.join('user_pages', student_id))
    running_path = os.path.join(user_page_path, "running_challenge.html")
    try:
        with open(running_path, "r", encoding="utf-8") as file:
            return HTMLResponse(content=file.read())
    except FileNotFoundError:
        return HTMLResponse(content="러닝 챌린지 페이지를 찾을 수 없습니다.", status_code=404)

# 오운완 챌린지 페이지
@app.get("/challenge/workout_challenge", response_class=HTMLResponse)
async def workout_challenge_page(request: Request):
    student_id = request.cookies.get("student_id")
    if not student_id:
        return RedirectResponse(url="/login", status_code=303)
    user_page_path = os.path.abspath(os.path.join('user_pages', student_id))
    workout_path = os.path.join(user_page_path, "workout_challenge.html")
    try:
        with open(workout_path, "r", encoding="utf-8") as file:
            return HTMLResponse(content=file.read())
    except FileNotFoundError:
        return HTMLResponse(content="오운완 챌린지 페이지를 찾을 수 없습니다.", status_code=404)

# 스트레칭 페이지 제공
@app.get("/stretching", response_class=HTMLResponse)
async def stretching_page(request: Request):
    # 스트레칭 페이지 제공 (로그인 확인 필요 없음)
    file_path = os.path.join(os.path.dirname(__file__), "static/stretch.html")
    try:
        with open(file_path, "r", encoding="utf-8") as file:
            return HTMLResponse(content=file.read())
    except FileNotFoundError:
        return HTMLResponse(content="스트레칭 페이지를 찾을 수 없습니다.", status_code=404)

# 러닝 챌린지 업로드 처리
@app.post("/challenge/{student_id}/running")
async def submit_running_challenge(student_id: str, file: UploadFile = File(...), distance: float = Form(...), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.student_id == student_id).first()
    if not user:
        return JSONResponse({"error": "사용자를 찾을 수 없습니다."}, status_code=404)

    # 업로드된 파일 저장
    file_location = f"./uploads/{uuid.uuid4()}_{file.filename}"
    with open(file_location, "wb") as f:
        f.write(file.file.read())

    # 러닝 챌린지 데이터 추가
    new_challenge = Challenge(
        user_id=user.id,
        challenge_date=date.today(),
        challenge_type="running",
        details=f"{{'file_path': '{file_location}', 'distance': {distance}}}"
    )
    db.add(new_challenge)
    user.total_running_distance += distance
    db.commit()
    return {"message": "Running challenge submitted successfully"}
# Fourth Part of main.py

# 오운완 챌린지 업로드 처리
@app.post("/challenge/{student_id}/workout")
async def submit_workout_challenge(student_id: str, file: UploadFile = File(...), day: int = Form(...), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.student_id == student_id).first()
    if not user:
        return JSONResponse({"error": "사용자를 찾을 수 없습니다."}, status_code=404)
    
    allowed_extensions = ["image/jpeg", "image/png", "image/jpg", "image/gif"]
    if file.content_type not in allowed_extensions:
        raise HTTPException(status_code=400, detail="허용되지 않는 파일 형식입니다.")
    
    # 업로드된 파일 저장
    file_location = f"./uploads/{uuid.uuid4()}_{file.filename}"
    
    with open(file_location, "wb") as f:
        f.write(file.file.read())

    if not (1 <= day <= 31):
        raise HTTPException(status_code=400, detail="날짜(day)는 1에서 31 사이의 값이어야 합니다.")

    # 기존 챌린지 데이터를 가져오기
    challenge = db.query(Challenge).filter(
        Challenge.user_id == user.id,
        Challenge.challenge_type == "workout"
    ).first()

    if not challenge:
        # 챌린지가 없으면 새로 생성
        challenge = Challenge(
            user_id=user.id,
            challenge_date=date.today(),
            challenge_type="workout",
            details=f"{{'file_path': '{file_location}'}}",
            checked_dates=json.dumps([day])  # 첫 체크 날짜 추가
        )
        db.add(challenge)
    else:
        # 기존 체크 날짜 업데이트
        checked_dates = json.loads(challenge.checked_dates) if challenge.checked_dates else []
        if day not in checked_dates:
            checked_dates.append(day)
        challenge.checked_dates = json.dumps(checked_dates)

    # 사용자 활동 수 업데이트
    user.gym_sessions_count += 1
    db.commit()

    return {
        "message": "Workout challenge submitted successfully",
        "checked_dates": json.loads(challenge.checked_dates)
    }

@app.get("/challenge/{student_id}/checked-dates")
async def get_checked_dates(student_id: str, db: Session = Depends(get_db)):
    # 사용자가 존재하는지 확인
    user = db.query(User).filter(User.student_id == student_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

    # 해당 사용자의 챌린지 데이터 가져오기
    challenge = db.query(Challenge).filter(
        Challenge.user_id == user.id,
        Challenge.challenge_type == "workout"
    ).first()

    if not challenge or not challenge.checked_dates:
        return {"checked_dates": []}  # 체크된 날짜가 없는 경우 빈 배열 반환

    # 체크된 날짜 반환
    return {"checked_dates": json.loads(challenge.checked_dates)}

# 리더보드 페이지
@app.get("/challenge/leaderboard")
async def get_leaderboard(db: Session = Depends(get_db)):
    top_runners = db.query(User).order_by(User.total_running_distance.desc()).limit(10).all()
    leaderboard_data = [{"student_id": runner.student_id, "running_distance": runner.total_running_distance} for runner in top_runners]
    return {"top_runners": leaderboard_data}

# 사용자 페이지 접근
@app.get("/challenge/{student_id}", response_class=HTMLResponse)
async def user_challenge_page(student_id: str, request: Request, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.student_id == student_id).first()
    if not user:
        return HTMLResponse(content="사용자를 찾을 수 없습니다.", status_code=404)

    user_page_path = os.path.join(USER_PAGES_DIR, f"{student_id}.html")
    try:
        with open(user_page_path, "r", encoding="utf-8") as file:
            return HTMLResponse(content=file.read())
    except FileNotFoundError:
        return HTMLResponse(content="사용자 페이지를 찾을 수 없습니다.", status_code=404)

# 사용자 정보 업데이트
@app.put("/user/{student_id}")
async def update_user_info(student_id: str, username: str = Form(...), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.student_id == student_id).first()
    if not user:
        return JSONResponse({"error": "사용자를 찾을 수 없습니다."}, status_code=404)

    user.username = username
    db.commit()
    return {"message": "User information updated successfully"}
# Fifth Part of main.py

# 사용자 삭제
@app.delete("/user/{student_id}")
async def delete_user(student_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.student_id == student_id).first()
    if not user:
        return JSONResponse({"error": "사용자를 찾을 수 없습니다."}, status_code=404)

    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}

# 정적 파일 서빙
@app.get("/static/{file_path:path}")
async def serve_static(file_path: str):
    full_path = os.path.join("static", file_path)
    try:
        with open(full_path, "rb") as file:
            return Response(content=file.read(), media_type="application/octet-stream")
    except FileNotFoundError:
        return HTMLResponse(content="파일을 찾을 수 없습니다.", status_code=404)

# 사이트 루트 경로로 접근 시 리다이렉트 처리
@app.get("/", response_class=HTMLResponse)
async def root():
    return RedirectResponse(url="/stretching", status_code=303)

# 스트레칭 페이지 제공
@app.get("/stretching", response_class=HTMLResponse)
async def stretching_page():
    try:
        with open("static/stretch.html", "r", encoding="utf-8") as file:
            return HTMLResponse(content=file.read())
    except FileNotFoundError:
        return HTMLResponse(content="스트레칭 페이지를 찾을 수 없습니다.", status_code=404)

# CORS 설정 (필요한 경우)
origins = [
    "http://localhost",
    "http://localhost:3000",
    # 추가적인 오리진을 여기 추가
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 애플리케이션 실행
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000)
