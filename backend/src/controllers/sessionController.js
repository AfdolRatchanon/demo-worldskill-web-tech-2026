const pool = require('../config/db');

async function startSession(req, res) {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM sessions ORDER BY id DESC LIMIT 1'
    );
    const session = rows[0];

    if (!session) {
      return res.status(404).json({ success: false, message: 'No session found' });
    }
    if (session.status === 'active') {
      return res.status(400).json({ success: false, message: 'Session is already active' });
    }

    // Single-session model (ตาม TP2026 "the testing session" — มี session เดียว)
    // เปิด session = เริ่ม/เริ่มต่อ session เดิม → ปรับแถวล่าสุดกลับเป็น active แล้ว "รีเซ็ตเวลาเริ่มจับใหม่"
    // ไม่สร้างแถวใหม่ (ไม่ทำหลาย session) และ "ไม่ล้าง" submission/score
    //   - การล้างข้อมูลเพื่อเริ่มสอบกระดานเปล่า ทำผ่าน re-seed/import seed_data.sql เท่านั้น
    //   - กันคะแนนหายกรณีเผลอกดปิดแล้วเปิดต่อ (ตรงกับ RSC §8 Grading timestamps for Audit)
    await pool.execute(
      "UPDATE sessions SET status = 'active', started_at = NOW() WHERE id = ?",
      [session.id]
    );
    const [updated] = await pool.execute('SELECT * FROM sessions WHERE id = ?', [session.id]);
    res.json({ success: true, data: updated[0], meta: {} });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function closeSession(req, res) {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM sessions ORDER BY id DESC LIMIT 1'
    );
    const session = rows[0];

    if (!session || session.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Session is not active' });
    }

    await pool.execute(
      "UPDATE sessions SET status = 'closed' WHERE id = ?",
      [session.id]
    );
    const [updated] = await pool.execute('SELECT * FROM sessions WHERE id = ?', [session.id]);
    res.json({ success: true, data: updated[0], meta: {} });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

module.exports = { startSession, closeSession };
