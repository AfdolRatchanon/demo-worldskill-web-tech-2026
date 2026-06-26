const { resolveSession } = require('../utils/session');

async function getConfig(req, res) {
  try {
    // resolveSession จะปิด session ที่หมดเวลาให้อัตโนมัติ และคืนเวลาที่เหลือสำหรับ countdown
    const { session, elapsed_seconds, remaining_seconds, duration_minutes } = await resolveSession();

    const data = session
      ? { ...session, duration_minutes, elapsed_seconds, remaining_seconds }
      : null;

    res.json({ success: true, data, meta: {} });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

module.exports = { getConfig };
