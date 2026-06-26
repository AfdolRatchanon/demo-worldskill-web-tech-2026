// หน้าผู้เข้าแข่งขัน — เวอร์ชันพร้อมแข่ง: countdown timer + ฟอร์มส่งงาน + ผลคะแนน
// timer: backend ส่ง remaining_seconds (คำนวณจาก started_at + ระยะเวลาสอบ) มาให้
//        frontend นับถอยหลังเองทุกวินาที แล้ว re-sync กับ backend ทุก 5 วิ
//        พอหมดเวลา → ปิดฟอร์มทันที (backend ก็ปิด session อัตโนมัติเช่นกัน)
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { getUser, removeToken } from '../auth';

// แปลงวินาที → HH:MM:SS
function formatTime(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hh = String(Math.floor(s / 3600)).padStart(2, '0');
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

export default function CandidatePage() {
  const user = getUser();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [remaining, setRemaining] = useState(null); // วินาทีที่เหลือ (null = ยังไม่เริ่ม/ปิดแล้ว)
  const [tasks, setTasks] = useState([]);
  const [submission, setSubmission] = useState(null);
  const [result, setResult] = useState(null);
  const [frontendUrl, setFrontendUrl] = useState('');
  const [backendUrl, setBackendUrl] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function loadData() {
    const sessionRes = await api.get('/config');
    const cfg = sessionRes.data.data;
    setSession(cfg);
    setRemaining(cfg && cfg.status === 'active' ? cfg.remaining_seconds : null);

    const taskRes = await api.get('/tasks');
    setTasks(taskRes.data.data);

    const subRes = await api.get('/my-submission');
    setSubmission(subRes.data.data);

    const resultRes = await api.get('/my-result');
    setResult(resultRes.data.data);
  }

  // โหลดตอนเปิดหน้า + re-sync ทุก 5 วินาที
  useEffect(() => {
    loadData();
    const timer = setInterval(loadData, 5000);
    return () => clearInterval(timer);
  }, []);

  // นับถอยหลังในเครื่องทุก 1 วินาที (ระหว่างรอ re-sync รอบถัดไป)
  useEffect(() => {
    if (remaining == null) return;
    const tick = setInterval(() => {
      setRemaining((prev) => {
        if (prev == null) return prev;
        if (prev <= 1) {
          clearInterval(tick);
          loadData(); // หมดเวลา → ดึงสถานะใหม่ (backend จะปิด session ให้)
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [remaining == null]);

  // เติม URL เดิมลงฟอร์มเมื่อโหลดเจอ submission
  useEffect(() => {
    if (submission) {
      setFrontendUrl(submission.frontend_url || '');
      setBackendUrl(submission.backend_url || '');
    }
  }, [submission?.id]);

  // ส่งได้เฉพาะตอน session active และยังมีเวลาเหลือ
  const sessionOpen = session?.status === 'active' && (remaining == null || remaining > 0);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setNotice('');
    try {
      const body = { frontend_url: frontendUrl, backend_url: backendUrl };
      if (submission) await api.put('/my-submission', body);
      else await api.post('/my-submission', body);
      setNotice('บันทึก submission เรียบร้อยแล้ว');
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Submit failed');
    }
  }

  async function handleLogout() {
    await api.post('/logout');
    removeToken();
    navigate('/login');
  }

  function sessionLabel() {
    if (!session || session.status === 'initialized') return 'ยังไม่เริ่มการสอบ';
    if (session.status === 'closed') return 'ปิดการสอบแล้ว';
    return 'กำลังสอบ';
  }

  const timerClass =
    remaining === 0 ? 'timer timer--over' : remaining != null && remaining <= 300 ? 'timer timer--warn' : 'timer';

  return (
    <>
      <header className="app-header">
        <div className="app-header__inner">
          <h1 className="app-header__title">Candidate Dashboard</h1>
          <div className="app-header__user">
            <span className="app-header__name">
              {user.full_name}
              {user.candidate_code ? ` · ${user.candidate_code}` : ''}
            </span>
            <button className="btn btn--secondary btn--sm" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </header>

      <main className="container stack">
        {/* ----- Session + Countdown ----- */}
        <section className="card" aria-labelledby="session-h">
          <h2 id="session-h">สถานะการสอบ</h2>
          <p>
            สถานะ:{' '}
            <span className={`badge badge--${session?.status || 'initialized'}`}>
              {session ? session.status : '…'}
            </span>{' '}
            — {sessionLabel()}
          </p>
          {session?.status === 'active' && (
            <p aria-live="polite">
              เวลาที่เหลือ:{' '}
              <span className={timerClass}>{formatTime(remaining ?? 0)}</span>
            </p>
          )}
          {remaining === 0 && (
            <p className="alert alert--error" role="alert">หมดเวลาสอบแล้ว — ไม่สามารถส่งงานได้</p>
          )}
        </section>

        {/* ----- Task ----- */}
        <section className="card" aria-labelledby="task-h">
          <h2 id="task-h">โจทย์ (Task)</h2>
          {tasks.map((task) => (
            <article key={task.id}>
              <h3 style={{ marginBottom: '0.25rem' }}>{task.title}</h3>
              <p className="card__hint">{task.description}</p>
            </article>
          ))}
        </section>

        {/* ----- Submission form ----- */}
        <section className="card" aria-labelledby="submit-h">
          <h2 id="submit-h">My Submission</h2>
          <form onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor="frontendUrl">Frontend URL</label>
              <input
                id="frontendUrl"
                placeholder="http://10.10.0.101:3000"
                value={frontendUrl}
                onChange={(e) => setFrontendUrl(e.target.value)}
                disabled={!sessionOpen}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="backendUrl">Backend API URL</label>
              <input
                id="backendUrl"
                placeholder="http://10.10.0.101:8080/api"
                value={backendUrl}
                onChange={(e) => setBackendUrl(e.target.value)}
                disabled={!sessionOpen}
                required
              />
            </div>

            {error && <p className="field__error" role="alert" aria-live="assertive">{error}</p>}
            {notice && <p className="alert alert--info" aria-live="polite">{notice}</p>}

            <button className="btn" type="submit" disabled={!sessionOpen}>
              {submission ? 'Update Submission' : 'Submit'}
            </button>
            {!sessionOpen && (
              <p className="card__hint" style={{ marginTop: '0.5rem' }}>
                ส่งงานได้เฉพาะตอนที่การสอบกำลังดำเนินอยู่เท่านั้น
              </p>
            )}
          </form>
        </section>

        {/* ----- Result ----- */}
        <section className="card" aria-labelledby="result-h">
          <h2 id="result-h">My Result</h2>
          {result ? (
            <p>
              คะแนน: <strong style={{ fontSize: '1.3rem' }}>{result.score}</strong> / 100{' '}
              <span className={`badge badge--${result.status}`}>
                {result.status === 'confirmed' ? 'ยืนยันแล้ว' : 'รอยืนยัน'}
              </span>
            </p>
          ) : (
            <p className="card__hint">ยังไม่มีผลคะแนน</p>
          )}
        </section>
      </main>
    </>
  );
}
