const pool = require('../config/db');

// มี session เดียวในระบบ — เปิด/ปิดคือการเปลี่ยนสถานะของแถวล่าสุด
// เวอร์ชัน simple: ไม่มีการจับเวลา (ไม่มี started_at / countdown)

// เปิด session (เฉพาะ judge) — ปรับสถานะเป็น active
async function startSession(req, res) {
  try {
    const [rows] = await pool.execute('SELECT * FROM sessions ORDER BY id DESC LIMIT 1');
    const session = rows[0];

    if (!session) {
      return res.status(404).json({ success: false, message: 'No session found' });
    }
    if (session.status === 'active') {
      return res.status(400).json({ success: false, message: 'Session is already active' });
    }

    await pool.execute("UPDATE sessions SET status = 'active' WHERE id = ?", [session.id]);
    const [updated] = await pool.execute('SELECT * FROM sessions WHERE id = ?', [session.id]);
    res.json({ success: true, data: updated[0], meta: {} });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// ปิด session (เฉพาะ judge) — ปรับสถานะเป็น closed
async function closeSession(req, res) {
  try {
    const [rows] = await pool.execute('SELECT * FROM sessions ORDER BY id DESC LIMIT 1');
    const session = rows[0];

    if (!session || session.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Session is not active' });
    }

    await pool.execute("UPDATE sessions SET status = 'closed' WHERE id = ?", [session.id]);
    const [updated] = await pool.execute('SELECT * FROM sessions WHERE id = ?', [session.id]);
    res.json({ success: true, data: updated[0], meta: {} });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

module.exports = { startSession, closeSession };
