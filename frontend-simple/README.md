# Frontend **Simple** Real DB — เวอร์ชันเรียบง่ายเพื่อการเรียนรู้ (ใช้คู่ `backend/`)

> 📌 โฟลเดอร์นี้คือ **ตัวเดิมแบบเรียบง่าย** (ไม่มี CSS, ไม่มี timer, เน้นอ่าน logic) รันที่ port **3001**
> ถ้าต้องการตัว **"พร้อมแข่ง" ที่ทำครบตามเกณฑ์ (responsive + accessibility + countdown timer)** ให้ใช้ `frontend/` (port 3000) แทน

ก๊อปจาก `frontend-simple/` แล้วปรับให้ใช้ API ของ `backend/` (schema official จาก `seed_data.sql`):
สถานะ session เป็น `initialized/active/closed` (ไม่มีนับถอยหลัง), ผลคะแนนเป็น `score` ตัวเดียว + `status` (`pending/confirmed`)

เวอร์ชันย่อของ `frontend/` ตัวเต็ม — **ฟีเจอร์ครบเหมือนกันทุกอย่าง** แต่:

- ❌ ไม่มี CSS เลย (ใช้ HTML เพียวๆ) — โฟกัสที่ logic ไม่ใช่ความสวยงาม
- ❌ ไม่มี Context API — ใช้ฟังก์ชันธรรมดาอ่าน localStorage แทน
- ❌ ไม่แยก component ย่อย — แต่ละหน้าจบในไฟล์เดียว อ่านบนลงล่าง
- ✅ ใช้ Hook แค่ 2 ตัวทั้งโปรเจกต์: `useState` + `useEffect`
- ✅ มี comment ภาษาไทยอธิบายทุกจุดสำคัญ

## วิธีรัน

ต้องรัน `backend` ก่อน (port 8080) แล้วค่อย:

```bash
cd frontend-simple
npm install
npm run dev   # เปิดที่ http://localhost:3001
```

> หมายเหตุ: `src/api.js` ตั้ง baseURL ไว้ที่ `http://26.246.36.238:8080/api` (เหมือน frontend-simple) — ถ้ารันเครื่องเดียวกัน แก้เป็น `http://localhost:8080/api`

เปิด http://localhost:3000 — login ด้วยบัญชีทดสอบ (จาก `seed_data.sql`):

| Role | Username | Password |
|------|----------|----------|
| judge | admin | password |
| manager | manager | password |
| candidate | candidate1, candidate2 | 123456 |

## ลำดับการอ่านไฟล์ (สำคัญ! อ่านตามนี้)

| ลำดับ | ไฟล์ | ทำหน้าที่ |
|-------|------|----------|
| 1 | `package.json` | บอกว่าใช้ library อะไรบ้าง |
| 2 | `index.html` → `src/main.jsx` | จุดเริ่มต้น — React เริ่มทำงานตรงนี้ |
| 3 | `src/App.jsx` | เส้นทาง (routing) — URL ไหนแสดงหน้าอะไร + ProtectedRoute |
| 4 | `src/auth.js` | จัดการ token — เก็บ/อ่าน/ลบ จาก localStorage |
| 5 | `src/api.js` | ตัวกลางคุยกับ backend — axios + interceptor |
| 6 | `src/pages/Login.jsx` | หน้า login — ฟอร์มแรกสุด ง่ายสุด |
| 7 | `src/pages/CandidatePage.jsx` | หน้าผู้แข่งขัน — เห็น pattern หลักของทุกหน้า |
| 8 | `src/pages/JudgePage.jsx` | หน้ากรรมการ — pattern เดิม + ปุ่ม action เยอะขึ้น |
| 9 | `src/pages/ManagerPage.jsx` | หน้าผู้จัดการ — pattern เดิม + เลือก session + export |

## Pattern ของทุกหน้า (เหมือนกันหมด จำอันเดียวพอ)

ทุกหน้าเรียงโค้ดแบบเดียวกัน 5 ส่วน:

```
1. state                ← ข้อมูลที่หน้าจอต้องใช้
2. ฟังก์ชันโหลดข้อมูล      ← loadData() ยิง API แล้วเก็บใส่ state
3. useEffect            ← เรียก loadData ตอนเปิดหน้า + ทุก 5 วินาที (polling)
4. ฟังก์ชัน action        ← กดปุ่มแล้วทำอะไร (submit, open session, export ฯลฯ)
5. return JSX           ← หน้าจอ
```

## Concept ที่ได้เรียนจากโปรเจกต์นี้

| # | Concept | อยู่ที่ไฟล์ |
|---|---------|-----------|
| 1 | Props | `App.jsx` (ProtectedRoute), ทุกหน้า |
| 2 | useState | ทุกหน้า |
| 3 | Controlled input (`value` + `onChange`) | `Login.jsx`, `CandidatePage.jsx` |
| 4 | Conditional rendering (`{x && ...}`, ternary) | ทุกหน้า |
| 5 | List rendering (`.map()` + `key`) | `JudgePage.jsx`, `ManagerPage.jsx` |
| 6 | useEffect + cleanup (`clearInterval`) | ทุก dashboard |
| 7 | Polling (ดึงข้อมูลซ้ำทุก 5 วิ) | ทุก dashboard |
| 8 | async/await + axios | `api.js` + ทุกหน้า |
| 9 | localStorage + JWT | `auth.js` |
| 10 | react-router (Routes, Navigate, useNavigate) | `App.jsx`, `Login.jsx` |
| 11 | Axios interceptor | `api.js` |

## ต่างจาก frontend ตัวเต็มยังไง

| เรื่อง | ตัวเต็ม (`frontend/`) | ตัวนี้ (`frontend/`) |
|-------|----------------------|---------------------------|
| จำนวนไฟล์ใน src | 24 ไฟล์ | 9 ไฟล์ |
| CSS | Tailwind CSS | ไม่มี |
| ข้อมูล user | Context API (`AuthContext`) | ฟังก์ชันใน `auth.js` |
| Component | แยกย่อย (Button, Card, Badge...) | เขียน JSX ตรงๆ ในหน้า |
| API URL | อ่านจาก `.env` | เขียนตรงๆ ใน `api.js` |
| โหลดข้อมูล | `Promise.all` (ขนานกัน เร็วกว่า) | `await` ทีละบรรทัด (อ่านง่ายกว่า) |
| นับเวลาถอยหลัง | ละเอียดวินาที (HH:MM:SS) | ไม่มี — schema official ไม่มีเวลา บอกแค่สถานะ session |
| คะแนน | แยก Frontend/Backend/Total | `score` ตัวเดียว (schema official) |
| Error 401 | interceptor เด้งกลับ login อัตโนมัติ | login ใหม่เอง |

เมื่อเข้าใจตัวนี้แล้ว → กลับไปอ่านตัวเต็มจะเข้าใจว่าแต่ละอย่างที่เพิ่มมา "มาแก้ปัญหาอะไร"
