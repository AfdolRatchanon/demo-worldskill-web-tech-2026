// หน้ากรรมการ — เวอร์ชันพร้อมแข่ง: เปิด/ปิด session, re-check, confirm + ตาราง accessible
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { getUser, removeToken } from '../auth';

export default function JudgePage() {
  const user = getUser();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [error, setError] = useState('');

  async function loadData() {
    const sessionRes = await api.get('/config');
    setSession(sessionRes.data.data);

    const candRes = await api.get('/candidates');
    setCandidates(candRes.data.data);

    const subRes = await api.get('/submissions');
    setSubmissions(subRes.data.data);
  }

  useEffect(() => {
    loadData();
    const timer = setInterval(loadData, 5000);
    return () => clearInterval(timer);
  }, []);

  async function runAction(fn) {
    setError('');
    try {
      await fn();
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'การทำงานล้มเหลว');
    }
  }

  const openSession = () => runAction(() => api.put('/session/start'));
  const closeSession = () => {
    if (!confirm('ปิด session? ผู้เข้าแข่งขันจะส่งงานไม่ได้อีก')) return;
    runAction(() => api.put('/session/close'));
  };
  const recheck = (submissionId) => runAction(() => api.post('/submissions/' + submissionId + '/recheck'));
  const confirmScore = (candidateId) => runAction(() => api.put('/results/' + candidateId + '/confirm'));

  async function handleLogout() {
    await api.post('/logout');
    removeToken();
    navigate('/login');
  }

  return (
    <>
      <header className="app-header">
        <div className="app-header__inner">
          <h1 className="app-header__title">Judge Dashboard</h1>
          <div className="app-header__user">
            <span className="app-header__name">{user.full_name}</span>
            <button className="btn btn--secondary btn--sm" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </header>

      <main className="container stack">
        {error && <p className="alert alert--error" role="alert" aria-live="assertive">{error}</p>}

        {/* ----- Session control ----- */}
        <section className="card" aria-labelledby="ctrl-h">
          <h2 id="ctrl-h">Session Control</h2>
          <p>
            สถานะ:{' '}
            <span className={`badge badge--${session?.status || 'initialized'}`}>
              {session ? session.status : '…'}
            </span>
          </p>
          <div className="btn-row">
            <button className="btn" onClick={openSession} disabled={session?.status === 'active'}>
              Open Session
            </button>
            <button className="btn btn--danger" onClick={closeSession} disabled={session?.status !== 'active'}>
              Close Session
            </button>
          </div>
        </section>

        {/* ----- Candidates ----- */}
        <section className="card" aria-labelledby="cand-h">
          <h2 id="cand-h">Candidates ({candidates.length})</h2>
          <div className="table-wrap">
            <table className="data">
              <caption className="visually-hidden">รายชื่อผู้เข้าแข่งขันและสถานะการตรวจ</caption>
              <thead>
                <tr>
                  <th scope="col">Code</th>
                  <th scope="col">Candidate</th>
                  <th scope="col">Status</th>
                  <th scope="col">Score</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((c) => (
                  <tr key={c.id}>
                    <td>{c.candidate_code || '—'}</td>
                    <td>{c.full_name} <span className="card__hint">({c.username})</span></td>
                    <td>
                      {c.submission_id ? (
                        <span className={`badge badge--${c.submission_status}`}>{c.submission_status}</span>
                      ) : (
                        <span className="card__hint">No submission</span>
                      )}
                    </td>
                    <td>{c.score != null ? c.score : '—'}</td>
                    <td>
                      <div className="btn-row">
                        {c.submission_id && c.result_status !== 'confirmed' && (
                          <button
                            className="btn btn--secondary btn--sm"
                            onClick={() => recheck(c.submission_id)}
                            disabled={c.submission_status === 'recheck'}
                          >
                            {c.submission_status === 'recheck' ? 'Checking…' : 'Re-check'}
                          </button>
                        )}
                        {c.result_status === 'pending' && (
                          <button className="btn btn--sm" onClick={() => confirmScore(c.id)}>Confirm</button>
                        )}
                        {c.result_status === 'confirmed' && <span className="badge badge--confirmed">Confirmed</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ----- Submissions ----- */}
        <section className="card" aria-labelledby="sub-h">
          <h2 id="sub-h">Submissions ({submissions.length})</h2>
          <div className="table-wrap">
            <table className="data">
              <caption className="visually-hidden">รายการ URL ที่ผู้เข้าแข่งขันส่ง</caption>
              <thead>
                <tr>
                  <th scope="col">Code</th>
                  <th scope="col">Candidate</th>
                  <th scope="col">Frontend URL</th>
                  <th scope="col">Backend URL</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((s) => (
                  <tr key={s.id}>
                    <td>{s.candidate_code || '—'}</td>
                    <td>{s.full_name} <span className="card__hint">({s.username})</span></td>
                    <td><a href={s.frontend_url} target="_blank" rel="noreferrer">{s.frontend_url}</a></td>
                    <td><a href={s.backend_url} target="_blank" rel="noreferrer">{s.backend_url}</a></td>
                    <td><span className={`badge badge--${s.status}`}>{s.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </>
  );
}
