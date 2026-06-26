const pool = require('../config/db');

async function getCurrentTaskId() {
  const [rows] = await pool.execute('SELECT id FROM tasks ORDER BY id ASC LIMIT 1');
  return rows[0] ? rows[0].id : null;
}

async function getCandidates(req, res) {
  try {
    const taskId = await getCurrentTaskId();

    const [rows] = await pool.execute(`
      SELECT
        u.id, u.username, u.full_name, u.candidate_code,
        s.id            AS submission_id,
        s.status        AS submission_status,
        s.frontend_url,
        s.backend_url,
        s.created_at,
        r.score,
        r.status        AS result_status
      FROM users u
      LEFT JOIN submissions s ON u.id = s.candidate_id AND s.task_id = ?
      LEFT JOIN results     r ON r.submission_id = s.id
      WHERE u.role = 'candidate'
      ORDER BY u.full_name ASC
    `, [taskId]);

    res.json({ success: true, data: rows, meta: {} });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

module.exports = { getCandidates };
