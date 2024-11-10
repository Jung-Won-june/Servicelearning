import os
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

@app.get("/login", response_class=HTMLResponse)
async def login_page():
    with open("static/login.html", "r", encoding="utf-8") as file:
        return HTMLResponse(content=file.read())

@app.post("/login")
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