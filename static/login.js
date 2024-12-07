// login.js
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './style.css';

const Login = ({ onLogin }) => {
  const [studentId, setStudentId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = () => {
    if (studentId) {
      const formData = new URLSearchParams();
      formData.append('student_id', studentId);

      fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      })
        .then(response => {
          if (response.redirected) {
            window.location.href = response.url;  // 리다이렉션 처리
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
    }
  };

  return (
    <div className="login-container">
      <h2>학번을 입력하세요</h2>
      <input
        type="text"
        value={studentId}
        onChange={(e) => {
          setStudentId(e.target.value);
          setErrorMessage('');
        }}
        placeholder="학번 입력"
      />
      <button onClick={handleLogin}>로그인</button>
      {errorMessage && <p className="error">{errorMessage}</p>}
    </div>
  );
};

ReactDOM.render(<Login onLogin={() => {}} />, document.getElementById('login-container'));
