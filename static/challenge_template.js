<<<<<<< HEAD
document.addEventListener('DOMContentLoaded', function() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    const calendarBody = document.getElementById('calendar-body');

    let row = document.createElement('tr');
    for (let i = 0; i < firstDay; i++) {
        row.appendChild(document.createElement('td'));
    }

    for (let date = 1; date <= lastDate; date++) {
        const cell = document.createElement('td');
        cell.textContent = date;
        cell.classList.add('calendar-cell');
        cell.addEventListener('click', function() {
            this.classList.toggle('completed');
            if (this.classList.contains('completed')) {
                this.innerHTML = '<span class="completed">' + this.textContent + '</span>';
            } else {
                this.innerHTML = this.textContent;
            }
        });
        row.appendChild(cell);
        if ((firstDay + date) % 7 === 0) {
            calendarBody.appendChild(row);
            row = document.createElement('tr');
        }
    }
    calendarBody.appendChild(row);

    // 스트레칭 부위 버튼 클릭 이벤트
    document.querySelectorAll('.body-part-btn').forEach(button => {
        button.addEventListener('click', function() {
            const part = this.dataset.part;
            let description = '';

            switch (part) {
                case 'neck':
                    description = '목 스트레칭: 천천히 고개를 좌우로 돌리며 목 근육을 풀어주세요. 각 방향으로 10초간 유지합니다.';
                    break;
                case 'shoulders':
                    description = '어깨 스트레칭: 어깨를 으쓱하고 천천히 뒤로 돌려주세요. 이 동작을 10회 반복합니다.';
                    break;
                case 'back':
                    description = '등 스트레칭: 양손을 앞으로 쭉 펴고 등을 둥글게 말아 스트레칭합니다. 15초간 유지하세요.';
                    break;
                case 'wrists':
                    description = '손목 스트레칭: 한 손으로 다른 손의 손가락을 잡고 천천히 뒤로 젖혀 손목을 스트레칭합니다. 각 손목을 10초간 유지하세요.';
                    break;
                default:
                    description = '스트레칭 부위를 선택해 주세요.';
            }

            document.getElementById('stretching-description').textContent = description;
        });
    });

    // 메뉴 버튼 클릭 이벤트로 화면 전환
    document.querySelectorAll('.menu-btn').forEach(button => {
        button.addEventListener('click', function() {
            const sectionToShow = this.dataset.section;
            document.querySelectorAll('#main-content section').forEach(section => {
                section.style.display = 'none';
            });
            document.getElementById(sectionToShow).style.display = 'block';
        });
    });
});
=======
//진행상황 가져오기
document.addEventListener('DOMContentLoaded', async () => {
    const studentId = window.location.pathname.split('/')[2];

    // 진행상황 api호출
    try{    
        const progressResponse = await fetch(`/challenge/${studentId}/progress`);
        if (!progressResponse.ok) throw new Error("Failed to fetch progress data");
        const progressData = await progressResponse.json();
        // ui업데이트
        document.querySelector('#progress').innerHTML = `
            <li>달리기: ${progressData.running_km} km</li>
            <li>턱걸이: ${progressData.pullups_count} 회</li>
            <li>헬스: ${progressData.gym_sessions} 회</li>
        `;}
    catch (error) {
        console.error("Error fetching progress:", error);
        alert("진행 상황 데이터를 불러오지 못했습니다.");
    }
    // 리더보드 호출
    try {
        //await loadLeaderboard(); // 리더보드 호출 추가
        const response = await fetch(`/challenge/${studentId}/leaderboard`);
        if (!response.ok) {
            console.error("Failed to load leaderboard");
            return;
        }
        const data = await response.json();
        console.log("Leaderboard Data:",data);
    
        // 러닝 리더보드 업데이트
        const runnersList = document.querySelector("#top-runners ul");
        runnersList.innerHTML = data.top_runners
            .map(runner => `<li>${runner.student_id}: ${runner.running_km} km</li>`)
            .join("");
    
        // 턱걸이 리더보드 업데이트
        const pullupsList = document.querySelector("#top-pullups ul");
        pullupsList.innerHTML = data.top_pullups
            .map(pullup => `<li>${pullup.student_id}: ${pullup.pullups_count} 회</li>`)
            .join("");
    } catch (error) {
        console.error("Error loading leaderboard:", error);
        alert("리더보드 데이터를 불러오지 못했습니다.");
    }
    // Generate calendar
    const calendar = document.querySelector('#calendar');
    for (let i = 1; i <= 30; i++) {
        const button = document.createElement('button');
        button.textContent = `${i}`;
        button.setAttribute('data-date', i); // 날짜 식별자 추가
        button.addEventListener('click', () => openChallengeModal(i));
        calendar.appendChild(button);
    }
});

let selectedDate = null; // 선택된 날짜를 관리하는 변수

function openChallengeModal(date) {
    selectedDate = date; // 선택된 날짜 저장
    const modal = document.querySelector('#challenge-modal');
    const inputs = document.querySelector('#challenge-inputs');
    modal.style.display = 'block';  // 모달 표시

    // 챌린지 종류 선택 버튼 생성
    inputs.innerHTML = `
        <button onclick="setChallengeType('running')">러닝</button>
        <button onclick="setChallengeType('pullups')">턱걸이</button>
        <button onclick="setChallengeType('gym')">헬스</button>
    `;
}

function closeChallengeModal() {
    const modal = document.querySelector('#challenge-modal');
    modal.style.display = 'none'; // 모달을 숨김

    // 입력값 초기화
    document.querySelector('#challenge-inputs').innerHTML = "";
    selectedChallengeType = null; // 챌린지 유형 초기화
    selectedDate = null; // 날짜 초기화
}

//데이터 json형태로 api에 전송
async function submitChallenge(studentId, challengeData) {
    const response = await fetch(`/challenge/${studentId}/submit`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(challengeData),
    });

    if (response.ok) {
        alert("챌린지가 성공적으로 제출되었습니다!");

        // 도장 찍기 (버튼 비활성화)
        const button = document.querySelector(`#calendar button[data-date="${challengeData.date}"]`);
        button.disabled = true;
        button.textContent += " ✅";
        console.log(`Button updated: ${button.textContent}`); // 디버깅 로그 추가
        closeChallengeModal(); // 제출 성공 후 모달 닫기
    } else {
        const error = await response.json();
        alert(`오류 발생: ${error.error}`);
    }
}


//제출 후 리더보드와 사용자 진행 상황 업데이트
document.querySelector('#submit-button').addEventListener('click', () => {
    const studentId = window.location.pathname.split('/')[2];

    // 입력값 검증
    if (!selectedDate || !selectedChallengeType) {
        alert("날짜와 챌린지 유형을 선택해주세요.");
        return;
    }

    const details = {};
    if (selectedChallengeType === "running") {
        const km = parseFloat(document.querySelector('#km')?.value || 0);
        const speed = parseFloat(document.querySelector('#speed')?.value || 0);
        if (km <= 0 || speed <= 0) {
            alert("올바른 러닝 데이터를 입력해주세요.");
            return;
        }
        details.km = km;
        details.speed = speed;
    } else if (selectedChallengeType === "pullups") {
        const count = parseInt(document.querySelector('#count')?.value || 0);
        if (count <= 0) {
            alert("올바른 턱걸이 횟수를 입력해주세요.");
            return;
        }
        details.count = count;
    } else if (selectedChallengeType === "gym") {
        const exercise = document.querySelector('#exercise')?.value || "";
        const reps = parseInt(document.querySelector('#reps')?.value || 0);
        const sets = parseInt(document.querySelector('#sets')?.value || 0);
        if (!exercise || reps <= 0 || sets <= 0) {
            alert("올바른 헬스 데이터를 입력해주세요.");
            return;
        }
        details.exercise = exercise;
        details.reps = reps;
        details.sets = sets;
    }

    const challengeData = {
        date: selectedDate, // 선택된 날짜
        type: selectedChallengeType, // 선택된 챌린지 종류
        details,
    };

    submitChallenge(studentId, challengeData);
});



let selectedChallengeType = null; // 선택된 챌린지 종류를 관리하는 변수

function setChallengeType(type) {
    selectedChallengeType = type; // 선택된 챌린지 종류 저장
    const inputs = document.querySelector('#challenge-inputs');
    if (type === 'running') {
        inputs.innerHTML = `
            거리 (km): <input type="number" id="km"><br>
            속도 (분/km): <input type="number" id="speed"><br>
            증빙 이미지: <input type="file" id="proof"><br>
        `;
    } else if (type === 'pullups') {
        inputs.innerHTML = `
            총 횟수: <input type="number" id="count"><br>
        `;
    } else if (type === 'gym') {
        inputs.innerHTML = `
            운동 종류: <input type="text" id="exercise"><br>
            횟수: <input type="number" id="reps"><br>
            세트 수: <input type="number" id="sets"><br>
        `;
    }
}

async function loadLeaderboard() {
    const response = await fetch(`/challenge/${studentId}/leaderboard`);
    if (!response.ok) {
        console.error("Failed to load leaderboard");
        return;
    }
    const data = await response.json();
    console.log("Leaderboard Data:",data);

    // 러닝 리더보드 업데이트
    const runnersList = document.querySelector("#top-runners ul");
    runnersList.innerHTML = data.top_runners
        .map(runner => `<li>${runner.student_id}: ${runner.running_km} km</li>`)
        .join("");

    // 턱걸이 리더보드 업데이트
    const pullupsList = document.querySelector("#top-pullups ul");
    pullupsList.innerHTML = data.top_pullups
        .map(pullup => `<li>${pullup.student_id}: ${pullup.pullups_count} 회</li>`)
        .join("");
}
>>>>>>> 180d3a17f01c6395e900fff74a81a2c8ac67a9ca
