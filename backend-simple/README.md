# Backend **Simple** Real DB — เวอร์ชันเรียนรู้

> 📌 เวอร์ชันตัดทอนของ `backend/` — **endpoint เหมือนกันทุกตัว** แต่ตัด "ระบบยาก ๆ" ออก
> เพื่อให้นักเรียนอ่านโค้ดเข้าใจง่าย ใช้คู่กับ `frontend-simple/`

## ตัดอะไรออกบ้าง (เทียบ `backend/`)

| ระบบที่ตัดออก | ตัวเต็มทำยังไง | ตัวนี้ทำยังไง |
|---|---|---|
| ⏱️ **ระบบเวลา / countdown timer** | คอลัมน์ `started_at` + คำนวณเวลาที่เหลือ + ปิด session อัตโนมัติเมื่อหมดเวลา | ไม่มี — บอกแค่สถานะ session (`active`/`closed`) |
| 🔧 **auto-migration schema** | `src/config/schema.js` เติมคอลัมน์ตอนสตาร์ท | ไม่มี — ใช้ตารางตาม `seed_data.sql` ตรง ๆ |
| 🌐 **ตรวจ IP ว่าเป็น LAN** | `isLanHost` บังคับเป็น private IP (10.x/192.168.x/...) | เช็คแค่ขึ้นต้น `http://` / `https://` |
| ♻️ helper `utils/session.js` (lazy auto-close) | มี | ไม่มี |

## ยังเหลืออะไร (ของที่จำเป็นและเข้าใจง่าย)

- ✅ Auth + JWT + role-based access (candidate / judge / manager)
- ✅ submission: ส่ง/แก้/ดู + กฎ "1 คน 1 submission" + ส่งได้เฉพาะตอน session active
- ✅ judge: เปิด/ปิด session, re-check (สุ่มคะแนนเพื่อสาธิต), confirm
- ✅ manager: summary / ranking / pass-fail / report (JSON + CSV)
- ✅ `candidate_code` (C01, C02)
- ✅ response รูปแบบเดียวกัน `{ success, data, meta }` / `{ success, message }`

## วิธีรัน

```bash
cd backend-simple
npm install
cp .env.example .env     # แล้วแก้รหัส MySQL ใน .env ให้ตรงเครื่อง
npm run seed             # สร้าง DB + ข้อมูลตั้งต้นจาก database/seed_data.sql
npm run dev              # หรือ npm start → เปิดที่ http://localhost:8080
```

> ⚠️ รัน backend **ตัวเดียว** พอ (อย่ารัน `backend` พร้อมกันบน port 8080 จะชนกัน)
> ถ้าจะรันคู่กัน ให้เปลี่ยน `PORT` ใน `.env` ของตัวใดตัวหนึ่ง

## บัญชีทดสอบ (จาก `seed_data.sql`)

| บทบาท | Username | Password | Code |
|-------|----------|----------|------|
| judge | `admin` | `password` | — |
| manager | `manager` | `password` | — |
| candidate | `candidate1` / `candidate2` | `123456` | `C01` / `C02` |

## โครงสร้าง

```
src/
  app.js                  จุดเริ่ม + ผูก route
  config/db.js            ต่อ MySQL (pool)
  middlewares/
    auth.js               เช็ค JWT (401 ถ้าไม่มี/ผิด)
    role.js               เช็ค role (403 ถ้าผิดสิทธิ์)
  routes/                 นิยาม path → controller
  controllers/            logic แต่ละ endpoint
database/
  seed.js                 สคริปต์สร้าง DB + import seed_data.sql
  seed_data.sql           schema + ข้อมูลตั้งต้น (ห้ามแก้ — ไฟล์ DB จริง)
```
