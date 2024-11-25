//진행상황 가져오기
document.addEventListener("DOMContentLoaded", loadLeaderboard);

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
        await loadLeaderboard(); // 리더보드 호출 추가
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
    const response = await fetch("/challenge/leaderboard");
    if (!response.ok) {
        console.error("Failed to load leaderboard");
        return;
    }
    const data = await response.json();

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
