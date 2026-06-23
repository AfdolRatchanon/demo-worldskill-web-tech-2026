// หน้าผู้จัดการ — เวอร์ชันพร้อมแข่ง: summary cards + pass/fail + ranking + export (อ่านอย่างเดียว)
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { getUser, removeToken } from '../auth';

export default function ManagerPage() {
  const user = getUser();
  const navigate = useNavigate();

  // ระบบเป็น "session เดียว" (single-session) ตามโจทย์ — สถิติเป็นภาพรวมของการแข่งทั้งงาน
  // ไม่มีตัวเลือก session ย้อนหลัง (เปิด session ใหม่ = เริ่มต่อ session เดิม ไม่ใช่คนละรอบ)
  const [summary, setSummary] = useState(null);
  const [ranking, setRanking] = useState([]);
  const [status, setStatus] = useState(null);

  async function loadData() {
    const summaryRes = await api.get('/statistics/summary');
    setSummary(summaryRes.data.data);

    const rankingRes = await api.get('/statistics/ranking');
    setRanking(rankingRes.data.data);

    const statusRes = await api.get('/statistics/status');
    setStatus(statusRes.data.data);
  }

  useEffect(() => {
    loadData();
    const timer = setInterval(loadData, 5000);
    return () => clearInterval(timer);
  }, []);

  async function exportReport(format) {
    try {
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

  const passThreshold = status?.pass_threshold ?? 50;

  return (
    <>
      <header className="app-header">
        <div className="app-header__inner">
          <h1 className="app-header__title">Manager Dashboard</h1>
          <div className="app-header__user">
            <span className="app-header__name">{user.full_name}</span>
            <button className="btn btn--secondary btn--sm" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </header>

      <main className="container stack">
        {/* ----- Current session (single-session model) ----- */}
        <section className="card" aria-labelledby="sess-h">
          <h2 id="sess-h">Current Session</h2>
          <p>
            สถานะการสอบ:{' '}
            <span className={`badge badge--${summary?.session?.status || 'initialized'}`}>
              {summary?.session?.status || '…'}
            </span>
          </p>
        </section>

        {/* ----- Summary ----- */}
        <section aria-labelledby="sum-h">
          <h2 id="sum-h" className="visually-hidden">สรุปผล</h2>
          <div className="grid">
            <div className="stat">
              <div className="stat__label">Total Candidates</div>
              <div className="stat__value">{summary?.total_candidates ?? '—'}</div>
            </div>
            <div className="stat">
              <div className="stat__label">Submitted</div>
              <div className="stat__value">{summary?.submitted ?? '—'}</div>
            </div>
            <div className="stat">
              <div className="stat__label">Confirmed</div>
              <div className="stat__value">{summary?.confirmed ?? '—'}</div>
            </div>
            <div className="stat">
              <div className="stat__label">Average Score</div>
              <div className="stat__value">{summary?.average_score ?? '—'}</div>
            </div>
            <div className="stat">
              <div className="stat__label">Pass (≥ {passThreshold})</div>
              <div className="stat__value" style={{ color: 'var(--success)' }}>{status?.pass_count ?? '—'}</div>
            </div>
            <div className="stat">
              <div className="stat__label">Fail</div>
              <div className="stat__value" style={{ color: 'var(--danger)' }}>{status?.fail_count ?? '—'}</div>
            </div>
          </div>
        </section>

        {/* ----- Ranking ----- */}
        <section className="card" aria-labelledby="rank-h">
          <h2 id="rank-h">Ranking</h2>
          <div className="btn-row" style={{ marginBottom: '1rem' }}>
            <button className="btn btn--secondary btn--sm" onClick={() => exportReport('json')}>Export JSON</button>
            <button className="btn btn--secondary btn--sm" onClick={() => exportReport('csv')}>Export CSV</button>
          </div>
          <div className="table-wrap">
            <table className="data">
              <caption className="visually-hidden">อันดับคะแนนของผู้เข้าแข่งขัน</caption>
              <thead>
                <tr>
                  <th scope="col">Rank</th>
                  <th scope="col">Code</th>
                  <th scope="col">Candidate</th>
                  <th scope="col">Score</th>
                  <th scope="col">Result</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((r) => (
                  <tr key={r.id}>
                    <td>#{r.rank}</td>
                    <td>{r.candidate_code || '—'}</td>
                    <td>{r.full_name} <span className="card__hint">({r.username})</span></td>
                    <td><strong>{r.score}</strong></td>
                    <td>
                      <span className={`badge badge--${r.score >= passThreshold ? 'confirmed' : 'fail'}`}>
                        {r.score >= passThreshold ? 'Pass' : 'Fail'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {ranking.length === 0 && <p className="card__hint" style={{ marginTop: '1rem' }}>ยังไม่มีผลคะแนนที่ยืนยันแล้ว</p>}
        </section>
      </main>
    </>
  );
}
