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