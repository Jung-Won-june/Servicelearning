document.addEventListener('DOMContentLoaded', function () {
    const calendarBody = document.getElementById('calendar-body');
    const uploadForm = document.getElementById('upload-form');
    const uploadButton = document.getElementById('upload-button');
    const fileInput = document.getElementById('workout-photo');

    let selectedDate = null; // 선택된 날짜

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth(); // 0: 1월, 11: 12월
    const day = today.getDate();
    const firstDay = new Date(year, month, 1).getDay(); // 이번 달 1일의 요일
    const lastDate = new Date(year, month + 1, 0).getDate(); // 이번 달의 마지막 날짜

    // 📅 달력 생성 함수
    function generateCalendar() {
        const calendarBody = document.getElementById('calendar-body');
        if (!calendarBody) {
            console.error("calendar-body 요소를 찾을 수 없습니다.");
            return;
        }
        calendarBody.innerHTML = ''; // 기존 내용 초기화

        let row = document.createElement('tr');
        for (let i = 0; i < firstDay; i++) {
            const emptyCell = document.createElement('td');
            emptyCell.classList.add('empty');
            row.appendChild(emptyCell); // 빈 칸 추가
        }

        for (let date = 1; date <= lastDate; date++) {
            const cell = document.createElement('td');
            cell.textContent = date; // 날짜 설정
            cell.classList.add('calendar-cell');
            cell.setAttribute('data-date', date); // 날짜 속성 추가
            cell.addEventListener('click', () => handleDateClick(cell, date)); // 클릭 이벤트 추가

            if (date === day) {
                cell.id = 'today-cell'; // 오늘 날짜 강조
            }

            row.appendChild(cell);
            if ((firstDay + date) % 7 === 0) {
                calendarBody.appendChild(row); // 행 추가
                row = document.createElement('tr');
            }
        }
        if (row.children.length > 0) {
            calendarBody.appendChild(row); // 남은 행 추가
        }
    }

// 📅 날짜 클릭 이벤트 핸들러 
function handleDateClick(clickedCell, clickedDate) {
    // 모든 'calendar-cell'에서 'selected' 클래스를 제거
    const allCells = document.querySelectorAll('.calendar-cell');
    allCells.forEach(cell => cell.classList.remove('selected'));

    // 현재 클릭한 셀에 'selected' 클래스를 추가
    clickedCell.classList.add('selected');

    // 선택된 날짜 업데이트
    selectedDate = clickedDate;
}

    // 📤 업로드 버튼 클릭 이벤트
    uploadButton.addEventListener('click', function () {
        const file = fileInput.files[0];
        const studentId = getCookie('student_id'); // 쿠키에서 student_id 가져오기

        if (!studentId) {
            alert('로그인이 필요합니다.');
            return;
        }

        if (!selectedDate) {
            alert('먼저 날짜를 선택하세요.');
            return;
        }

         // 🔥 오늘과 2일 전의 날짜 계산
        const today = new Date();
        const twoDaysAgo = new Date(today);
        twoDaysAgo.setDate(today.getDate() - 2); // 2일 전으로 설정

        // 사용자가 선택한 날짜를 현재 달과 결합하여 Date 객체 생성
        const selectedFullDate = new Date(today.getFullYear(), today.getMonth(), selectedDate);

        // 🚫 선택한 날짜가 허용 범위에 있는지 확인
        if (selectedFullDate > today) {
            alert(`오늘 이후의 날짜는 미리 업로드 할 수 없습니다.`);
            fileInput.value = ''; // 파일 입력 초기화
            return;
        }

        if (file) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('day', selectedDate); // 선택한 날짜를 폼 데이터에 추가

            uploadButton.textContent = '업로드 중...';

            fetch(`/challenge/${studentId}/workout`, {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('업로드 실패 - 서버 오류');
                }
            })
            .then(data => {
                if (data.message === 'Workout challenge submitted successfully') {
                    updateCalendar([selectedDate]);
                    alert(`${selectedDate}일 사진 업로드가 완료되었습니다!`);
                }
            })
            .catch(error => {
                console.error('사진 업로드 오류:', error);
                alert('사진 업로드에 실패하였습니다. 다시 시도해 주세요.');
            })
            .finally(() => {
                uploadButton.textContent = '업로드';
                fileInput.value = ''; // 파일 입력 초기화
            });
        } else {
            alert('사진을 선택해 주세요.');
        }
    });

    // 📅 업로드 후 달력 업데이트 함수
    function updateCalendar(checkedDates) {
        checkedDates.forEach(day => {
            const cell = document.querySelector(`[data-date="${day}"]`);
            if (cell) {
                cell.classList.add('completed'); // 운동 완료 스타일 추가
            }
        });
    }

    // 🍪 쿠키에서 값 가져오는 함수
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    // 📅 초기 달력 생성
    generateCalendar();

    const studentId = getCookie('student_id');
    if (studentId) {
        fetch(`/challenge/${studentId}/checked-dates`)
            .then(response => response.json())
            .then(data => {
                if (data.checked_dates) {
                    updateCalendar(data.checked_dates);
                }
            })
            .catch(error => {
                console.error('기존 체크 날짜 가져오기 실패:', error);
            });
    }
});
