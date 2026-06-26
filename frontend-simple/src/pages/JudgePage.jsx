// หน้าของกรรมการ — เปิด/ปิด session, สั่งตรวจซ้ำ (re-check), ยืนยันคะแนน (confirm)
// เทียบกับตัวเต็ม: pages/judge/Dashboard.jsx + SessionControl + CandidateTable + SubmissionsTable
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { getUser, removeToken } from '../auth';

export default function JudgePage() {
  const user = getUser();
  const navigate = useNavigate();

  // ----- 1. state -----
  const [session, setSession] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  // ----- 2. ฟังก์ชันโหลดข้อมูลจาก backend -----
  async function loadData() {
    const sessionRes = await api.get('/config');
    setSession(sessionRes.data.data);

    const candRes = await api.get('/candidates');
    setCandidates(candRes.data.data);

    const subRes = await api.get('/submissions');
    setSubmissions(subRes.data.data);
  }

  // ----- 3. useEffect: โหลดข้อมูลตอนเปิดหน้า + ดึงซ้ำทุก 5 วินาที (polling) -----
  useEffect(() => {
    loadData();
    const timer = setInterval(loadData, 5000);
    return () => clearInterval(timer);
  }, []);

  // ----- 4. ฟังก์ชัน action -----
  async function openSession() {
    try {
      await api.put('/session/start');
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to open session');
    }
  }

  async function closeSession() {
    // confirm = กล่องถามยืนยันของ browser — กด Cancel จะได้ false แล้วจบฟังก์ชันเลย
    if (!confirm('Close the session? Candidates will no longer be able to submit.')) return;
    try {
      await api.put('/session/close');
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to close session');
    }
  }

  async function recheck(submissionId) {
    try {
      await api.post('/submissions/' + submissionId + '/recheck');
      loadData(); // สถานะจะเป็น recheck ก่อน แล้ว polling จะอัปเดตผลให้เอง
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to recheck');
    }
  }

  async function confirmScore(candidateId) {
    try {
      await api.put('/results/' + candidateId + '/confirm');
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to confirm');
    }
  }

  async function handleLogout() {
    // ต้องรอ backend ตอบก่อน แล้วค่อยลบ token — ถ้าลบก่อน request จะไม่มี token แนบไป
    await api.post('/logout');
    removeToken();
    navigate('/login');
  }

  // ----- 5. หน้าจอ -----
  return (
    <div>
      <h1>Judge Dashboard — WorldSkill 2026</h1>
      <p>
        {user.full_name} <button onClick={handleLogout}>Logout</button>
      </p>
      <hr />

      <h2>Session Control</h2>
      <p>
        Status: <b>{session ? session.status : '...'}</b>
      </p>
      <button onClick={openSession} disabled={session?.status === 'active'}>
        Open Session
      </button>{' '}
      <button onClick={closeSession} disabled={session?.status !== 'active'}>
        Close Session
      </button>
      <hr />

      <h2>Candidates ({candidates.length})</h2>
      <table border="1" cellPadding="6">
        <thead>
          <tr>
            <th>Code</th>
            <th>Candidate</th>
            <th>Status</th>
            <th>Score</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map((c) => (
            <tr key={c.id}>
              <td>{c.candidate_code || '—'}</td>
              <td>
                {c.full_name} ({c.username})
              </td>
              <td>{c.submission_id ? c.submission_status : 'No submission'}</td>
              <td>{c.score != null ? c.score : '—'}</td>
              <td>
                {/* ปุ่ม Re-check: มีงานส่งมาแล้ว และยังไม่ confirm */}
                {c.submission_id && c.result_status !== 'confirmed' && (
                  <button
                    onClick={() => recheck(c.submission_id)}
                    disabled={c.submission_status === 'recheck'}
                  >
                    {c.submission_status === 'recheck' ? 'Checking...' : 'Re-check'}
                  </button>
                )}{' '}
                {/* ปุ่ม Confirm: มีคะแนนแล้ว (pending) และยังไม่ confirm */}
                {c.result_status === 'pending' && (
                  <button onClick={() => confirmScore(c.id)}>Confirm</button>
                )}
                {c.result_status === 'confirmed' ? '✓ Confirmed' : ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <hr />

      <h2>Submissions ({submissions.length})</h2>
      <table border="1" cellPadding="6">
        <thead>
          <tr>
            <th>Code</th>
            <th>Candidate</th>
            <th>Frontend URL</th>
            <th>Backend URL</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((s) => (
            <tr key={s.id}>
              <td>{s.candidate_code || '—'}</td>
              <td>
                {s.full_name} ({s.username})
              </td>
              <td>
                <a href={s.frontend_url} target="_blank" rel="noreferrer">
                  {s.frontend_url}
                </a>
              </td>
              <td>
                <a href={s.backend_url} target="_blank" rel="noreferrer">
                  {s.backend_url}
                </a>
              </td>
              <td>{s.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
