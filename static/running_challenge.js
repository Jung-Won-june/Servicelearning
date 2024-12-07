// 쿠키 값을 가져오는 함수
function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) return match[2];
    return null;
}

document.addEventListener('DOMContentLoaded', function() {
    // 사이드바 메뉴 버튼 동작 설정
    const handleChallengeClick = () => {
        const studentId = getCookie('student_id');
        if (!studentId) {
            // 로그인되지 않은 경우 로그인 페이지로 이동
            alert('로그인이 필요합니다.');
            window.location.href = '/login';
        } else {
            // 로그인된 경우 챌린지 선택 페이지로 이동
            window.location.href = '/challenge_selection';
        }
    };

    // 사이드바 버튼 이벤트 리스너 추가
    const challengeButton = document.querySelector('.menu-btn-challenge');
    const stretchingButton = document.querySelector('.menu-btn-stretching');

    if (challengeButton) {
        challengeButton.addEventListener('click', handleChallengeClick);
    }

    if (stretchingButton) {
        stretchingButton.addEventListener('click', () => {
            window.location.href = '/stretching';
        });
    }

    // 쿠키에서 값 가져오는 함수
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }
});


document.addEventListener('DOMContentLoaded', function() {
    // 러닝 데이터 업로드 처리
    document.getElementById('upload-button').addEventListener('click', function() {
        const fileInput = document.getElementById('running-photo');
        const distanceInput = document.getElementById('running-distance');
        const file = fileInput.files[0];
        const distance = parseFloat(distanceInput.value);
        const studentId = getCookie('student_id'); // 쿠키에서 student_id 가져오기

        if (!studentId) {
            alert('로그인이 필요합니다.');
            return;
        }

        if (file && distance > 0) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('distance', distance);

            // 로딩 상태 표시
            document.getElementById('upload-button').textContent = '업로드 중...';

            fetch(`/challenge/${studentId}/running`, {
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
                if (data.message === 'Running challenge submitted successfully') {
                    alert('러닝 기록이 성공적으로 업로드되었습니다!');
                }
            })
            .catch(error => {
                console.error('러닝 기록 업로드 오류:', error);
                alert('러닝 기록 업로드에 실패하였습니다. 다시 시도해 주세요.');
            })
            .finally(() => {
                // 로딩 상태 해제
                document.getElementById('upload-button').textContent = '업로드';
            });
        } else {
            alert('유효한 사진과 거리를 입력해 주세요.');
        }
    });

    // 리더보드 데이터 가져오기
    fetch('/challenge/leaderboard')
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('리더보드 데이터를 불러오는 중 오류가 발생했습니다.');
            }
        })
        .then(data => {
            const leaderboardContainer = document.getElementById('leaderboard');
            leaderboardContainer.innerHTML = ''; // 기존 리더보드 내용 초기화

            data.top_runners.forEach((runner, index) => {
                const runnerEntry = document.createElement('p');
                let crown = '';
                if (index === 0) {
                    crown = ' 👑';
                } else if (index === 1) {
                    crown = ' 🥈';
                } else if (index === 2) {
                    crown = ' 🥉';
                }
                runnerEntry.textContent = `${index + 1}위: ${runner.student_id} - ${runner.running_distance} km${crown}`;
                leaderboardContainer.appendChild(runnerEntry);
            });
        })
        .catch(error => {
            console.error('리더보드 데이터 오류:', error);
        });

    // 쿠키에서 값 가져오는 함수
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }
});
