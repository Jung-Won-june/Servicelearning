/*
document.addEventListener('DOMContentLoaded', function () {
    // 챌린지 버튼
    document.querySelector('.menu-btn[data-section="challenge-section"]').addEventListener('click', async function () {
        try {
            const response = await fetch('/api/check-login', { method: 'GET' });
            if (response.ok) {
                const data = await response.json();
                if (data.isLoggedIn) {
                    window.location.href = `/challenge/${data.student_id}`;
                } else {
                    window.location.href = '/login';
                }
            } else {
                throw new Error('로그인 상태 확인에 실패했습니다.');
            }
        } catch (error) {
            alert(error.message);
        }
    });

    // 로그인 버튼
    document.querySelector('.menu-btn[data-section="login-section"]').addEventListener('click', function () {
        window.location.href = '/login';
    });
});

document.querySelectorAll('#stretching-options button').forEach(button => {

    button.addEventListener('click', () => {
        const descriptions = {
            neck: "목 스트레칭: 고개를 좌우로 천천히 돌립니다.",
            shoulders: "어깨 스트레칭: 어깨를 으쓱하며 뒤로 돌려줍니다.",
            back: "등 스트레칭: 등을 둥글게 말아줍니다.",
            wrists: "손목 스트레칭: 손가락을 잡고 손목을 스트레칭합니다."
        };
        document.getElementById('stretching-description').textContent = descriptions[button.dataset.part];
    });
});
*/

document.addEventListener('DOMContentLoaded', function() {
    // 챌린지 버튼
    document.querySelector('.menu-btn[data-section="challenge-section"]').addEventListener('click', async function () {
        try {
            const response = await fetch('/api/check-login', { method: 'GET' });
            if (response.ok) {
                const data = await response.json();
                if (data.isLoggedIn) {
                    window.location.href = `/challenge/${data.student_id}`;
                } else {
                    window.location.href = '/login';
                }
            } else {
                throw new Error('로그인 상태 확인에 실패했습니다.');
            }
        } catch (error) {
            alert(error.message);
        }
    });

    // 로그인 버튼
    document.querySelector('.menu-btn[data-section="login-section"]').addEventListener('click', function () {
        window.location.href = '/login';
    });
    
    // 스트레칭 부위 버튼 클릭 이벤트
    document.querySelectorAll('.body-part-btn').forEach(button => {
        button.addEventListener('click', function() {
            const part = this.dataset.part;
            let description = '';
            let videoUrl = '';

            switch (part) {
                case 'neck':
                    description = '목 스트레칭: 천천히 고개를 좌우로 돌리며 목 근육을 풀어주세요. 각 방향으로 10초간 유지합니다.';
                    videoUrl = 'https://www.example.com/neck_stretch.mp4';
                    break;
                case 'shoulders':
                    description = '어깨 스트레칭: 어깨를 으쓱하고 천천히 뒤로 돌려주세요. 이 동작을 10회 반복합니다.';
                    videoUrl = 'https://www.example.com/shoulders_stretch.mp4';
                    break;
                case 'back':
                    description = '등 스트레칭: 양손을 앞으로 쭉 펴고 등을 둥글게 말아 스트레칭합니다. 15초간 유지하세요.';
                    videoUrl = 'https://www.example.com/back_stretch.mp4';
                    break;
                case 'wrists':
                    description = '손목 스트레칭: 한 손으로 다른 손의 손가락을 잡고 천천히 뒤로 젖혀 손목을 스트레칭합니다. 각 손목을 10초간 유지하세요.';
                    videoUrl = 'https://www.example.com/wrists_stretch.mp4';
                    break;
                default:
                    description = '스트레칭 부위를 선택해 주세요.';
                    videoUrl = '';
            }

            document.getElementById('stretching-description').textContent = description;
            const videoElement = document.getElementById('stretching-video');
            if (videoUrl) {
                videoElement.src = videoUrl;
                videoElement.style.display = 'block';
            } else {
                videoElement.style.display = 'none';
            }
        });
    });
});
