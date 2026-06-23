// หน้าของผู้จัดการแข่งขัน — ดูสถิติ, อันดับคะแนน, export รายงาน (อ่านอย่างเดียว)
// เทียบกับตัวเต็ม: pages/manager/Dashboard.jsx + SummaryCards + RankingTable + ExportButtons
// หมายเหตุ: ระบบเป็น "session เดียว" (single-session) ตามโจทย์ — สถิติเป็นภาพรวมของการแข่งทั้งงาน
//          ไม่มีการเลือก session ย้อนหลัง (เปิด session ใหม่ = เริ่มต่อ session เดิม ไม่ใช่คนละรอบ)
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { getUser, removeToken } from '../auth';

export default function ManagerPage() {
  const user = getUser();
  const navigate = useNavigate();

  // ----- 1. state -----
  const [summary, setSummary] = useState(null);
  const [ranking, setRanking] = useState([]);
  const [status, setStatus] = useState(null);

  // ----- 2. ฟังก์ชันโหลดข้อมูลจาก backend (สถิติเป็น global ของทั้งงาน) -----
  async function loadData() {
    const summaryRes = await api.get('/statistics/summary');
    setSummary(summaryRes.data.data);

    const rankingRes = await api.get('/statistics/ranking');
    setRanking(rankingRes.data.data);

    const statusRes = await api.get('/statistics/status');
    setStatus(statusRes.data.data);
  }

  // ----- 3. useEffect: โหลดตอนเปิดหน้า + ดึงซ้ำทุก 5 วินาที -----
  useEffect(() => {
    loadData();
    const timer = setInterval(loadData, 5000);
    return () => clearInterval(timer);
  }, []);

  // ----- 4. ฟังก์ชัน action -----
  async function exportReport(format) {
    try {
      // responseType: 'blob' = ขอข้อมูลเป็นไฟล์ (ไม่ใช่ JSON ปกติ)
      const res = await api.get('/report?format=' + format, { responseType: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(res.data);
      link.download = 'report.' + format;
      link.click();
    } catch {
      alert('Export failed');
    }
  }

  async function handleLogout() {
    await api.post('/logout');
    removeToken();
    navigate('/login');
  }

  // ----- 5. หน้าจอ -----
  return (
    <div>
      <h1>Manager Dashboard — WorldSkill 2026</h1>
      <p>
        {user.full_name} <button onClick={handleLogout}>Logout</button>
      </p>
      <hr />

      <h2>Summary</h2>
      <p>
        Current session: <b>{summary?.session?.status ?? '—'}</b>
      </p>
      <p>
        Total Candidates: <b>{summary?.total_candidates ?? '—'}</b> <br />
        Submitted: <b>{summary?.submitted ?? '—'}</b> <br />
        Confirmed: <b>{summary?.confirmed ?? '—'}</b> <br />
        Average Score: <b>{summary?.average_score ?? '—'}</b>
      </p>
      {status && (
        <p>
          Pass (≥ {status.pass_threshold} pts): <b>{status.pass_count}</b> |
          Fail: <b>{status.fail_count}</b>
        </p>
      )}
      <hr />

      <h2>Ranking</h2>
      <p>
        <button onClick={() => exportReport('json')}>Export JSON</button>{' '}
        <button onClick={() => exportReport('csv')}>Export CSV</button>
      </p>
      <table border="1" cellPadding="6">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Code</th>
            <th>Candidate</th>
            <th>Score</th>
            <th>Result</th>
          </tr>
        </thead>
        <tbody>
          {ranking.map((r) => (
            <tr key={r.id}>
              <td>#{r.rank}</td>
              <td>{r.candidate_code || '—'}</td>
              <td>
                {r.full_name} ({r.username})
              </td>
              <td>
                <b>{r.score}</b>
              </td>
              <td>{r.score >= (status?.pass_threshold ?? 50) ? 'Pass' : 'Fail'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {ranking.length === 0 && <p>No confirmed results yet</p>}
    </div>
  );
}
