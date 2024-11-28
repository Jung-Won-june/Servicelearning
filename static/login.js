import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './style.css';

const Login = ({ onLogin }) => {
  const [studentId, setStudentId] = useState('');
<<<<<<< HEAD
  const [isStudentValid, setIsStudentValid] = useState(null); // 학번 유효 여부 상태 추가

  const handleCheckStudentId = () => {
    if (studentId) {
      // 학번 유효성 확인을 위한 GET 요청
      fetch(`/api/students/${studentId}`, {
        method: 'GET',
      })
        .then(response => {
          if (response.ok) {
            setIsStudentValid(true);
          } else {
            setIsStudentValid(false);
          }
        })
        .catch(error => {
          console.error('학번 확인 에러:', error);
        });
    }
  };

  const handleLogin = () => {
    if (studentId && isStudentValid) {
      const loginData = {
        studentId: studentId,
        loginTime: new Date().toISOString()
      };
      // 로그인 정보를 JSON 형식으로 서버에 전송
      fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      })
        .then(response => response.json())
        .then(data => {
          console.log('로그인 성공:', data);
          onLogin(studentId);
        })
        .catch(error => {
          console.error('로그인 에러:', error);
        });
=======
  const [errorMessage, setErrorMessage] = useState('');

  // 로그인 요청 함수
  const handleLogin = () => {
    if (studentId) {
      const formData = new URLSearchParams();
      formData.append('student_id', studentId); // Form 데이터로 전송

      fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded', // Form 데이터 형식
        },
        body: formData.toString(),
      })
        .then(response => {
          if (response.redirected) {
            // 리다이렉션 처리
            window.location.href = response.url;
          } else if (!response.ok) {
            return response.json().then(err => {
              setErrorMessage(err.detail || '로그인 실패');
            });
          }
        })
        .catch(error => {
          console.error('로그인 에러:', error);
          setErrorMessage('서버와 통신 중 오류가 발생했습니다.');
        });
    } else {
      setErrorMessage('학번을 입력하세요.');
>>>>>>> 180d3a17f01c6395e900fff74a81a2c8ac67a9ca
    }
  };

  return (
    <div className="login-container">
      <h2>학번을 입력하세요</h2>
      <input
        type="text"
        value={studentId}
<<<<<<< HEAD
        onChange={(e) => setStudentId(e.target.value)}
        placeholder="학번 입력"
      />
      <button onClick={handleCheckStudentId}>학번 확인</button>
      {isStudentValid === false && <p>유효하지 않은 학번입니다.</p>}
      {isStudentValid && (
        <button onClick={handleLogin}>로그인</button>
      )}
=======
        onChange={(e) => {
          setStudentId(e.target.value);
          setErrorMessage('');
        }}
        placeholder="학번 입력"
      />
      <button onClick={handleLogin}>로그인</button>
      {errorMessage && <p className="error">{errorMessage}</p>}
>>>>>>> 180d3a17f01c6395e900fff74a81a2c8ac67a9ca
    </div>
  );
};

<<<<<<< HEAD
ReactDOM.render(<Login onLogin={() => {}} />, document.getElementById('login-container'));
=======
ReactDOM.render(<Login onLogin={() => {}} />, document.getElementById('login-container'));
>>>>>>> 180d3a17f01c6395e900fff74a81a2c8ac67a9ca
