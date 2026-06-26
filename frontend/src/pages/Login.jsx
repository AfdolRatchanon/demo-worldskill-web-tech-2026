// หน้า login — เวอร์ชันพร้อมแข่ง: semantic form + label ผูกกับ input + error feedback (aria-live)
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { saveToken } from '../auth';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/login', { username, password });
      saveToken(res.data.data.token);
      navigate('/' + res.data.data.role); // role ตรงกับชื่อ route ใน App.jsx
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-wrap">
      <section className="card login-card" aria-labelledby="login-title">
        <h1 id="login-title">WorldSkills 2026</h1>
        <p className="sub">Test Submission Management — Sign in</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              aria-required="true"
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              aria-required="true"
            />
          </div>

          {/* aria-live=assertive: screen reader อ่าน error ทันทีที่ปรากฏ */}
          {error && (
            <p className="alert alert--error" role="alert" aria-live="assertive">
              {error}
            </p>
          )}

          <button className="btn" type="submit" disabled={loading} style={{ marginTop: '0.5rem' }}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </section>
    </main>
  );
}
