const pool = require('../config/db');

const PASS_THRESHOLD = 50;

async function getLatestSession() {
  const [rows] = await pool.execute('SELECT * FROM sessions ORDER BY id DESC LIMIT 1');
  return rows[0] || null;
}

async function getSummary(req, res) {
  try {
    const session = await getLatestSession();

    const [[{ count: total_candidates }]] = await pool.execute(
      "SELECT COUNT(*) AS count FROM users WHERE role = 'candidate'"
    );
    const [[{ count: submitted }]] = await pool.execute(
      'SELECT COUNT(DISTINCT candidate_id) AS count FROM submissions'
    );
    const [[{ count: confirmed }]] = await pool.execute(
      "SELECT COUNT(*) AS count FROM results WHERE status = 'confirmed'"
    );
    const [[{ avg }]] = await pool.execute(
      "SELECT AVG(score) AS avg FROM results WHERE status = 'confirmed'"
    );

    res.json({
      success: true,
      data: {
        total_candidates,
        submitted,
        confirmed,
        average_score: parseFloat(Number(avg || 0).toFixed(2)),
        session: session || null,
      },
      meta: {},
    });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function getRanking(req, res) {
  try {
    const [rows] = await pool.execute(`
      SELECT
        u.id, u.username, u.full_name, u.candidate_code,
        r.score, r.status,
        RANK() OVER (ORDER BY r.score DESC) AS \`rank\`
      FROM results r
      JOIN submissions s ON r.submission_id = s.id
      JOIN users u ON s.candidate_id = u.id
      WHERE r.status = 'confirmed'
      ORDER BY r.score DESC
    `);
    res.json({ success: true, data: rows, meta: {} });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function getStatus(req, res) {
  try {
    const [[row]] = await pool.execute(
      `SELECT
         SUM(CASE WHEN score >= ? THEN 1 ELSE 0 END) AS pass_count,
         SUM(CASE WHEN score <  ? THEN 1 ELSE 0 END) AS fail_count,
         COUNT(*) AS total
       FROM results WHERE status = 'confirmed'`,
      [PASS_THRESHOLD, PASS_THRESHOLD]
    );
    res.json({ success: true, data: { ...row, pass_threshold: PASS_THRESHOLD }, meta: {} });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

module.exports = { getSummary, getRanking, getStatus };
