document.addEventListener('DOMContentLoaded', function () {
    const sidebar = document.getElementById('sidebar');
    const openBtn = document.getElementById('open-btn');

    // 버튼 클릭 이벤트 추가
    openBtn.addEventListener('click', function () {
        sidebar.classList.toggle('closed'); // 사이드바 열기/닫기
        openBtn.textContent = sidebar.classList.contains('closed') ? '☰' : '✕'; // 버튼 텍스트 변경
    });

    // 초기 설정 (닫힌 상태 확인 후 버튼 텍스트 설정)
    openBtn.textContent = sidebar.classList.contains('closed') ? '☰' : '✕';
});
