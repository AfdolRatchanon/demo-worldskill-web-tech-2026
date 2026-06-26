// หน้าของผู้เข้าแข่งขัน — ดูโจทย์, ส่ง/แก้ URL ผลงาน, ดูคะแนนตัวเอง
// เทียบกับตัวเต็ม: pages/candidate/Dashboard.jsx + SubmissionForm + ResultCard + CountdownTimer
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { getUser, removeToken } from '../auth';

export default function CandidatePage() {
  const user = getUser();
  const navigate = useNavigate();

  // ----- 1. state -----
  const [session, setSession] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [submission, setSubmission] = useState(null);
  const [result, setResult] = useState(null);
  const [frontendUrl, setFrontendUrl] = useState('');
  const [backendUrl, setBackendUrl] = useState('');

  // ----- 2. ฟังก์ชันโหลดข้อมูลจาก backend -----
  async function loadData() {
    const sessionRes = await api.get('/config');
    setSession(sessionRes.data.data);

    const taskRes = await api.get('/tasks');
    setTasks(taskRes.data.data);

    const subRes = await api.get('/my-submission');
    setSubmission(subRes.data.data);

    const resultRes = await api.get('/my-result');
    setResult(resultRes.data.data);
  }

  // ----- 3. useEffect: โหลดข้อมูลตอนเปิดหน้า + ดึงซ้ำทุก 5 วินาที (polling) -----
  useEffect(() => {
    loadData();
    const timer = setInterval(loadData, 5000);
    return () => clearInterval(timer); // ปิดหน้าเมื่อไหร่ ให้หยุดดึงข้อมูล
  }, []);

  // ถ้าเคยส่งงานไว้แล้ว → เอา URL เดิมมาใส่ในฟอร์มให้ (ทำงานเมื่อโหลดเจอ submission ครั้งแรก)
  useEffect(() => {
    if (submission) {
      setFrontendUrl(submission.frontend_url);
      setBackendUrl(submission.backend_url);
    }
  }, [submission?.id]);

  // ----- 4. ฟังก์ชัน action -----
  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const body = { frontend_url: frontendUrl, backend_url: backendUrl };
      if (submission) {
        await api.put('/my-submission', body); // เคยส่งแล้ว → แก้ไข
      } else {
        await api.post('/my-submission', body); // ยังไม่เคยส่ง → ส่งใหม่
      }
      alert('Submitted!');
      loadData();
    } catch (err) {
      // backend จะบอกเหตุผลมา เช่น session ยังไม่เปิด หรือ URL ผิดรูปแบบ
      alert(err.response?.data?.message || 'Submit failed');
    }
  }

  async function handleLogout() {
    // ต้องรอ backend ตอบก่อน แล้วค่อยลบ token — ถ้าลบก่อน request จะไม่มี token แนบไป
    await api.post('/logout');
    removeToken();
    navigate('/login');
  }

  // schema official ไม่มีเวลาเปิด/ระยะเวลาสอบ → บอกแค่สถานะ session (ไม่มีนับถอยหลัง)
  function sessionText() {
    if (!session || session.status === 'initialized') return 'Session has not started yet';
    if (session.status === 'closed') return 'Session closed';
    return 'Session is active';
  }

  const sessionOpen = session?.status === 'active';

  // ----- 5. หน้าจอ -----
  return (
    <div>
      <h1>Candidate — WorldSkill 2026</h1>
      <p>
        Welcome, {user.full_name}
        {user.candidate_code ? ' (' + user.candidate_code + ')' : ''}{' '}
        <button onClick={handleLogout}>Logout</button>
      </p>
      <p>
        Session status: <b>{session ? session.status : '...'}</b> — {sessionText()}
      </p>
      <hr />

      <h2>Tasks</h2>
      {tasks.map((task) => (
        <div key={task.id}>
          <h3>{task.title}</h3>
          <p>{task.description}</p>
        </div>
      ))}
      <hr />

      <h2>My Submission</h2>
      <form onSubmit={handleSubmit}>
        <p>
          Frontend URL:{' '}
          <input
            size="40"
            placeholder="http://192.168.x.x:3000"
            value={frontendUrl}
            onChange={(e) => setFrontendUrl(e.target.value)}
            disabled={!sessionOpen}
            required
          />
        </p>
        <p>
          Backend URL:{' '}
          <input
            size="40"
            placeholder="http://192.168.x.x:8080"
            value={backendUrl}
            onChange={(e) => setBackendUrl(e.target.value)}
            disabled={!sessionOpen}
            required
          />
        </p>
        <button type="submit" disabled={!sessionOpen}>
          {submission ? 'Update Submission' : 'Submit'}
        </button>
        {!sessionOpen && <p>Submission is allowed only while session is active</p>}
      </form>
      <hr />

      <h2>My Result</h2>
      {result ? (
        <p>
          Score: <b>{result.score}</b> / 100 <br />
          {result.status === 'confirmed' ? '✓ Confirmed by judge' : 'Pending confirmation'}
        </p>
      ) : (
        <p>No result yet</p>
      )}
    </div>
  );
}
