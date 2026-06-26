const pool = require('../config/db');

async function getMyResult(req, res) {
  try {
    const [rows] = await pool.execute(
      `SELECT r.*
       FROM results r
       JOIN submissions s ON r.submission_id = s.id
       WHERE s.candidate_id = ?
       ORDER BY r.id DESC LIMIT 1`,
      [req.user.id]
    );
    res.json({ success: true, data: rows[0] || null, meta: {} });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function confirmResult(req, res) {
  try {
    const { candidate_id } = req.params;
    // console.log("candidate_id", candidate_id)
    const [rows] = await pool.execute(
      `SELECT r.*
       FROM results r
       JOIN submissions s ON r.submission_id = s.id
       WHERE s.candidate_id = ?
       ORDER BY r.id DESC LIMIT 1`,
      [candidate_id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Result not found' });
    }
    if (rows[0].status === 'confirmed') {
      return res.status(400).json({ success: false, message: 'Result is already confirmed' });
    }

    await pool.execute("UPDATE results SET status = 'confirmed' WHERE id = ?", [rows[0].id]);
    await pool.execute("UPDATE submissions SET status = 'confirmed' WHERE id = ?", [rows[0].submission_id]);

    const [updated] = await pool.execute('SELECT * FROM results WHERE id = ?', [rows[0].id]);
    res.json({ success: true, data: updated[0], meta: {} });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

module.exports = { getMyResult, confirmResult };
