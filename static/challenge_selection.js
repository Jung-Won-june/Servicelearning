document.addEventListener('DOMContentLoaded', function() {
    // 오운완 챌린지 버튼 클릭 핸들러
    const workoutButton = document.getElementById('workout-challenge-button');
    if (workoutButton) {
        workoutButton.addEventListener('click', function() {
            // 서버에서 로그인 여부를 확인하도록 페이지 이동만 처리합니다.
            window.location.href = '/challenge/workout_challenge';
        });
    }

    // 러닝 챌린지 버튼 클릭 핸들러
    const runningButton = document.getElementById('running-challenge-button');
    if (runningButton) {
        runningButton.addEventListener('click', function() {
            // 서버에서 로그인 여부를 확인하도록 페이지 이동만 처리합니다.
            window.location.href = '/challenge/running_challenge';
        });
    }
});
