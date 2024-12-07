// 전역에 handlePartClick 함수 정의
function convertYouTubeURL(url) {
    // youtu.be URL을 임베드 URL로 변환
    if (url.includes('youtu.be')) {
        const videoId = url.split('youtu.be/')[1].split('?')[0];
        return `https://www.youtube.com/embed/${videoId}`;
    }
    // youtube.com URL을 임베드 URL로 변환
    if (url.includes('watch?v=')) {
        const videoId = url.split('watch?v=')[1].split('&')[0];
        return `https://www.youtube.com/embed/${videoId}`;
    }
    return url; // 이미 embed URL이면 그대로 반환
}

function handlePartClick(part) {
    let desc = '';
    let video = '';
    
    switch (part) {
        case 'A':
            desc = '전신 스트레칭 : 앉아서 할 수 있는 전반적인 스트레칭입니다.';
            video = 'https://youtu.be/5fnEEzi_ev0?si=SGwCKJKFcBheimtX';
            break;
        case 'B':
            desc = '어깨, 목 스트레칭: 목과 어깨 통증을 예방하는 승모근 스트레칭입니다.';
            video = 'https://youtu.be/4xsPV9BGQic?si=Sn5ne1xlgWB8ziCE';
            break;
        case 'C':
            desc = '등 스트레칭: 척추와 날개뼈 주변을 풀어주는 등 스트레칭입니다.';
            video = 'https://youtu.be/yRjdODuq-i8?si=_eYWaFzgLwmUVNtV';
            break;
        case 'D':
            desc = '허리 스트레칭: 척추와 골반, 엉덩이 등을 풀어주는 허리 스트레칭입니다.';
            video = 'https://youtu.be/P3qqOclVFQ8?si=OZMP-E0Bd0iY_bvB';
            break;
        case 'E':
            desc = '손목 스트레칭: 손가락과 손목 관절을 풀어주는 손목 스트레칭입니다.';
            video = 'https://youtu.be/VaXpD5GiaHs?si=Vihm-FyqBq7jLuSL';
            break;
        default:
            desc = '스트레칭 부위를 선택해 주세요.';
            video = '';
    }

    // 설명 업데이트
    document.getElementById('stretching-description').textContent = desc;

    // YouTube URL 변환
    const embedURL = convertYouTubeURL(video);

    // iframe src 업데이트
    const iframe = document.getElementById('video-frame');
    iframe.src = embedURL;
};