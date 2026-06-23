const pool = require('../config/db');
const { resolveSession } = require('../utils/session');

async function getCurrentTaskId() {
  const [rows] = await pool.execute('SELECT id FROM tasks ORDER BY id ASC LIMIT 1');
  return rows[0] ? rows[0].id : null;
}

// host ต้องเป็น IP ภายใน LAN (private/loopback) หรือ localhost เท่านั้น
// ตามโจทย์ RSC2026: เครือข่ายห้องแข่งเป็น IP ภายใน (เช่น 10.10.0.x) ไม่มี DNS/โดเมนภายนอก
function isLanHost(host) {
  if (host === 'localhost') return true;
  const m = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!m) return false; // ไม่ใช่ IPv4 (เช่น domain name) → ไม่ผ่าน
  const oct = [Number(m[1]), Number(m[2]), Number(m[3]), Number(m[4])];
  if (oct.some((n) => n > 255)) return false;
  const [a, b] = oct;
  if (a === 10) return true;                         // 10.0.0.0/8
  if (a === 172 && b >= 16 && b <= 31) return true;  // 172.16.0.0/12
  if (a === 192 && b === 168) return true;           // 192.168.0.0/16
  if (a === 127) return true;                        // loopback 127.0.0.0/8
  return false;                                      // public IP → ไม่ผ่าน
}

function validateOne(label, value) {
  if (!value) return `${label} is required`;
  let u;
  try { u = new URL(value); } catch { return `${label} must be a valid URL`; }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') {
    return `${label} must start with http:// or https://`;
  }
  if (!isLanHost(u.hostname)) {
    return `${label} must be an internal LAN address (private IP or localhost), not a public or domain address`;
  }
  return null;
}

function validateUrls({ frontend_url, backend_url }) {
  return validateOne('Frontend URL', frontend_url) || validateOne('Backend URL', backend_url);
}

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

async function createSubmission(req, res) {
  try {
    // resolveSession ปิด session ที่หมดเวลาให้อัตโนมัติก่อน → ถ้าหมดเวลา จะ active=false แล้วถูกปฏิเสธ
    const { session } = await resolveSession();
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

async function updateSubmission(req, res) {
  try {
    // resolveSession ปิด session ที่หมดเวลาให้อัตโนมัติก่อน → ถ้าหมดเวลา จะ active=false แล้วถูกปฏิเสธ
    const { session } = await resolveSession();
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

    await pool.execute("UPDATE submissions SET status = 'recheck' WHERE id = ?", [id]);

    const score = parseFloat((Math.random() * 100).toFixed(2));

    await pool.execute("UPDATE submissions SET status = 'submitted' WHERE id = ?", [id]);

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
