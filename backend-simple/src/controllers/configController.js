const pool = require('../config/db');

// คืนสถานะ session ปัจจุบัน (initialized / active / closed)
// เวอร์ชัน simple: ไม่มีระบบนับเวลา — บอกแค่สถานะ
async function getConfig(req, res) {
  try {
    const [rows] = await pool.execute('SELECT * FROM sessions ORDER BY id DESC LIMIT 1');
    res.json({ success: true, data: rows[0] || null, meta: {} });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

module.exports = { getConfig };
