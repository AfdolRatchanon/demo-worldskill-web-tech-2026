const pool = require('../config/db');

async function getReport(req, res) {
  try {
    const { format = 'json' } = req.query;

    const [rows] = await pool.execute(`
      SELECT
        u.candidate_code, u.username, u.full_name,
        r.score, r.status,
        s.frontend_url, s.backend_url
      FROM results r
      JOIN submissions s ON r.submission_id = s.id
      JOIN users       u ON s.candidate_id  = u.id
      ORDER BY r.score DESC
    `);

    if (format === 'csv') {
      const header = 'Candidate Code,Username,Full Name,Score,Status\n';
      const body   = rows.map((r) =>
        `${r.candidate_code || ''},${r.username},${r.full_name},${r.score},${r.status}`
      ).join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="report.csv"');
      return res.send(header + body);
    }

    res.json({ success: true, data: rows, meta: {} });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

module.exports = { getReport };
