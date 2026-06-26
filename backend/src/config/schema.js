// Self-migration — ทำให้ backend ทำงานได้แม้ DB จะถูกสร้างจาก seed_data.sql เดิม
// (ที่ยังไม่มีคอลัมน์ started_at) โดยไม่ต้องไปแก้ไฟล์ seed_data.sql
//
// TP2026 §7 อนุญาต "the database schema may be extended if required"
// เราจึงเติมคอลัมน์ที่ต้องใช้สำหรับ countdown timer ให้อัตโนมัติตอน backend เริ่มทำงาน
// ใช้ได้ทุกกรณี ไม่ว่า DB จะถูกสร้างด้วย `npm run seed` หรือผู้ใช้ import seed_data.sql เองผ่าน cmd
const pool = require('./db');

// เพิ่มคอลัมน์แบบ idempotent — เช็ค information_schema ก่อน เพราะ MySQL ไม่รองรับ
// ADD COLUMN IF NOT EXISTS (รันซ้ำกี่ครั้งก็ปลอดภัย ไม่ error)
async function addColumnIfMissing(table, column, definition) {
  const [rows] = await pool.execute(
    `SELECT COUNT(*) AS n
       FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND COLUMN_NAME = ?`,
    [table, column]
  );
  if (rows[0].n === 0) {
    await pool.query(`ALTER TABLE \`${table}\` ADD COLUMN ${column} ${definition}`);
    console.log(`[schema] added column ${table}.${column}`);
  }
}

async function ensureSchema() {
  // started_at = เวลาที่ judge กดเปิด session ใช้คำนวณ countdown timer
  await addColumnIfMissing('sessions', 'started_at', 'DATETIME NULL');
}

module.exports = { ensureSchema };
