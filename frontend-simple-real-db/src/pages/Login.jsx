// หน้า login — เทียบกับตัวเต็ม: pages/Login.jsx (ตัด component Input/Button ใช้ HTML ตรงๆ)
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { saveToken } from '../auth';

export default function Login() {
  // state = ข้อมูลที่เปลี่ยนแล้วหน้าจอต้องวาดใหม่
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault(); // กันไม่ให้ browser refresh หน้าตอนกด submit
    try {
      const res = await api.post('/login', { username, password });
      saveToken(res.data.data.token);
      // role เป็น candidate / judge / manager ซึ่งตรงกับชื่อ route ใน App.jsx พอดี
      navigate('/' + res.data.data.role);
    } catch (err) {
      // ?. = ถ้าไม่มีค่าให้ข้ามไปเลย ไม่ error — กันกรณี backend ไม่ตอบกลับมา
      setError(err.response?.data?.message || 'Login failed');
    }
  }

  return (
    <div>
      <h1>WorldSkill 2026 — Test Submission</h1>
      <h2>Sign In</h2>

      <form onSubmit={handleSubmit}>
        <p>
          Username:{' '}
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </p>
        <p>
          Password:{' '}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </p>
        <button type="submit">Sign In</button>
      </form>

      {/* แสดงข้อความ error เฉพาะตอนที่มี error เท่านั้น (conditional rendering) */}
      {error && <p><b>{error}</b></p>}
    </div>
  );
}
