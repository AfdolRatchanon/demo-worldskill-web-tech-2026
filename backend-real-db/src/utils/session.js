// ตัวช่วยจัดการ session ที่ใช้ร่วมกันหลาย controller
// หัวใจคือ "lazy auto-close": ถ้า session ยัง active แต่หมดเวลาแล้ว ให้ปิดอัตโนมัติทันที
// ที่มีการอ่าน session — ไม่ต้องมี cron/ตัวจับเวลาเบื้องหลัง
const pool = require('../config/db');

// ระยะเวลาสอบ (นาที) อ่านจาก .env — ค่าเริ่มต้น 360 นาที (6 ชม. ตามเอกสาร RSC2026)
const DURATION_MINUTES = parseInt(process.env.SESSION_DURATION_MINUTES, 10) || 360;

// ดึง session ล่าสุด + คำนวณเวลา และปิด session ที่หมดอายุให้อัตโนมัติ
// คืน { session, elapsed_seconds, remaining_seconds, duration_minutes }
// หมายเหตุ: คำนวณ elapsed ด้วย NOW() ของฐานข้อมูล (TIMESTAMPDIFF) เพื่อเลี่ยงปัญหา
//          นาฬิกาเครื่อง client/server ไม่ตรงกัน
async function resolveSession() {
  const [rows] = await pool.execute(
    `SELECT *,
            CASE WHEN started_at IS NULL THEN NULL
                 ELSE TIMESTAMPDIFF(SECOND, started_at, NOW()) END AS elapsed_seconds
       FROM sessions
      ORDER BY id DESC
      LIMIT 1`
  );
  const session = rows[0] || null;
  if (!session) {
    return { session: null, elapsed_seconds: null, remaining_seconds: null, duration_minutes: DURATION_MINUTES };
  }

  const durationSeconds = DURATION_MINUTES * 60;
  const elapsed = session.elapsed_seconds; // null ถ้ายังไม่เคยเริ่ม
  let remaining = null;

  if (session.status === 'active' && elapsed != null) {
    remaining = Math.max(0, durationSeconds - elapsed);

    // หมดเวลา → ปิด session อัตโนมัติ (ผลคือ submission จะถูกปฏิเสธด้วย 403 ทันที)
    if (elapsed >= durationSeconds) {
      await pool.execute("UPDATE sessions SET status = 'closed' WHERE id = ?", [session.id]);
      session.status = 'closed';
      remaining = 0;
    }
  }

  return {
    session,
    elapsed_seconds: elapsed,
    remaining_seconds: remaining,
    duration_minutes: DURATION_MINUTES,
  };
}

module.exports = { resolveSession, DURATION_MINUTES };
