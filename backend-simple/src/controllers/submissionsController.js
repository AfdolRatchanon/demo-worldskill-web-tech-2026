const pool = require('../config/db');

// helper เล็ก ๆ ที่ใช้ซ้ำในไฟล์นี้
async function getLatestSession() {
  const [rows] = await pool.execute('SELECT * FROM sessions ORDER BY id DESC LIMIT 1');
  return rows[0] || null;
}

async function getCurrentTaskId() {
  const [rows] = await pool.execute('SELECT id FROM tasks ORDER BY id ASC LIMIT 1');
  return rows[0] ? rows[0].id : null;
}

// ตรวจ URL แบบง่าย — แค่ต้องกรอกครบทั้งสองช่อง และขึ้นต้นด้วย http:// หรือ https://
// (เวอร์ชัน simple: ไม่เช็คว่าเป็น IP ภายใน LAN)
function validateUrls({ frontend_url, backend_url }) {
  if (!frontend_url || !backend_url) return 'Both URLs are required';
  const ok = (s) => s.startsWith('http://') || s.startsWith('https://');
  if (!ok(frontend_url) || !ok(backend_url)) return 'URLs must start with http:// or https://';
  return null;
}

// ดู submission ของตัวเอง (candidate)
async function getMySubmission(req, res) {
  try {
    const taskId = await getCurrentTaskId();
    if (!taskId) return res.json({ success: true, data: null, meta: {} });

    const [rows] = await pool.execute(
      'SELECT * FROM submissions WHERE candidate_id = ? AND task_id = ?',
      [req.user.id, taskId]
    );
    res.json({ success: true, data: rows[0] || null, meta: {} });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// ส่ง submission ใหม่ (candidate) — ทำได้เฉพาะตอน session active และมีได้คนละ 1 รายการ
async function createSubmission(req, res) {
  try {
    const session = await getLatestSession();
    if (!session || session.status !== 'active') {
      return res.status(403).json({ success: false, message: 'Session is not active' });
    }

    const taskId = await getCurrentTaskId();
    if (!taskId) return res.status(404).json({ success: false, message: 'No task available' });

    const { frontend_url, backend_url } = req.body;
    const urlError = validateUrls(req.body);
    if (urlError) return res.status(400).json({ success: false, message: urlError });

    const [existing] = await pool.execute(
      'SELECT id FROM submissions WHERE candidate_id = ? AND task_id = ?',
      [req.user.id, taskId]
    );
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Submission already exists. Use PUT to update.' });
    }

    const [result] = await pool.execute(
      'INSERT INTO submissions (candidate_id, task_id, frontend_url, backend_url) VALUES (?, ?, ?, ?)',
      [req.user.id, taskId, frontend_url, backend_url]
    );
    const [rows] = await pool.execute('SELECT * FROM submissions WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: rows[0], meta: {} });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// แก้ submission เดิม (candidate) — ทำได้เฉพาะตอน session active
async function updateSubmission(req, res) {
  try {
    const session = await getLatestSession();
    if (!session || session.status !== 'active') {
      return res.status(403).json({ success: false, message: 'Session is not active' });
    }

    const taskId = await getCurrentTaskId();
    if (!taskId) return res.status(404).json({ success: false, message: 'No task available' });

    const { frontend_url, backend_url } = req.body;
    const urlError = validateUrls(req.body);
    if (urlError) return res.status(400).json({ success: false, message: urlError });

    const [existing] = await pool.execute(
      'SELECT id FROM submissions WHERE candidate_id = ? AND task_id = ?',
      [req.user.id, taskId]
    );
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'No submission found. Use POST to create.' });
    }

    await pool.execute(
      'UPDATE submissions SET frontend_url = ?, backend_url = ? WHERE candidate_id = ? AND task_id = ?',
      [frontend_url, backend_url, req.user.id, taskId]
    );
    const [rows] = await pool.execute(
      'SELECT * FROM submissions WHERE candidate_id = ? AND task_id = ?',
      [req.user.id, taskId]
    );
    res.json({ success: true, data: rows[0], meta: {} });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// ดูรายการ submission ทั้งหมด (judge)
async function getAllSubmissions(req, res) {
  try {
    const taskId = await getCurrentTaskId();
    if (!taskId) return res.json({ success: true, data: [], meta: {} });

    const [rows] = await pool.execute(`
      SELECT s.*, u.full_name, u.username, u.candidate_code
      FROM submissions s
      JOIN users u ON s.candidate_id = u.id
      WHERE s.task_id = ?
      ORDER BY s.created_at DESC
    `, [taskId]);
    res.json({ success: true, data: rows, meta: {} });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// สั่งตรวจซ้ำ (judge) — เวอร์ชัน demo ให้คะแนนแบบสุ่มเพื่อสาธิต flow
async function recheckSubmission(req, res) {
  try {
    const { id } = req.params;

    const [rows] = await pool.execute('SELECT * FROM submissions WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    const [confirmed] = await pool.execute(
      "SELECT id FROM results WHERE submission_id = ? AND status = 'confirmed'", [id]
    );
    if (confirmed.length > 0) {
      return res.status(403).json({ success: false, message: 'Cannot re-check a confirmed result' });
    }

    const score = parseFloat((Math.random() * 100).toFixed(2));

    const [existing] = await pool.execute('SELECT id FROM results WHERE submission_id = ?', [id]);
    if (existing.length > 0) {
      await pool.execute(
        "UPDATE results SET score = ?, status = 'pending' WHERE submission_id = ?",
        [score, id]
      );
    } else {
      await pool.execute(
        "INSERT INTO results (submission_id, score, status) VALUES (?, ?, 'pending')",
        [id, score]
      );
    }

    res.json({ success: true, data: { message: 'Re-check started' }, meta: {} });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

module.exports = {
  getMySubmission,
  createSubmission,
  updateSubmission,
  getAllSubmissions,
  recheckSubmission,
};
