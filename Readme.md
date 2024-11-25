사용한 패키지 목록이니 참고하세요

Package           Version
----------------- -----------
annotated-types   0.7.0
anyio             4.6.2.post1
click             8.1.7
colorama          0.4.6
fastapi           0.115.5
greenlet          3.1.1
h11               0.14.0
idna              3.10
Jinja2            3.1.4
MarkupSafe        3.0.2
pillow            11.0.0
pip               24.3.1
pydantic          2.10.1
pydantic_core     2.27.1
python-multipart  0.0.17
setuptools        65.5.0
sniffio           1.3.1
SQLAlchemy        2.0.36
starlette         0.41.3
typing_extensions 4.12.2
uvicorn           0.32.1

서버 측에서 사용한 가상환경 venv1을 이용하세요
venv생성 : python3 -m venv venv1
venv실행 : venv1/Scripts/activate
서버 실행 : uvicorn main:app --reload