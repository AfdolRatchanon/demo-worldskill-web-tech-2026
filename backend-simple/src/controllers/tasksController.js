const pool = require('../config/db');

async function getTasks(req, res) {
  try {
    const [rows] = await pool.execute('SELECT * FROM tasks ORDER BY id ASC');
    res.json({ success: true, data: rows, meta: {} });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

module.exports = { getTasks };
