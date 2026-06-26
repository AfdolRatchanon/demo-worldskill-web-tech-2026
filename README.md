# WorldSkills 2026 — WebTech (Real DB Demo)

ระบบ demo สำหรับ **ตรวจข้อสอบ** ประกอบด้วย:

| โฟลเดอร์ | คืออะไร | เทคโนโลยี | Port |
|----------|---------|-----------|------|
| `backend/`  | API + ฐานข้อมูล | Node.js (Express) + MySQL | **8080** |
| `frontend/` | **หน้าเว็บเวอร์ชันพร้อมแข่ง** (responsive + accessibility + countdown timer) | React + Vite | **3000** |
| `frontend-simple/` | หน้าเว็บเวอร์ชันเรียบง่ายเพื่อการเรียนรู้ (ไม่มี CSS/timer) — ใช้ backend เดียวกัน | React + Vite | **3001** |

> 👉 ใช้งานจริง/ส่งตรวจให้ใช้ **`frontend/`** ส่วน `frontend-simple/` ไว้อ่านทำความเข้าใจ logic

> ⚠️ **สำคัญที่สุดสำหรับการตรวจข้อสอบ:** ระบบตรวจจะเข้าถึงผ่าน frontend แล้ว frontend ต้องคุยกับ backend ให้ได้
> ต้องแก้ไฟล์ `frontend/.env` ให้ชี้ไปที่ IP ของเครื่องที่รัน backend → ดูหัวข้อ
> [3. ตั้งค่า `.env` ของ Frontend](#3-ตั้งค่า-env-ของ-frontend-สำคัญสำหรับระบบตรวจข้อสอบ)

---

## สิ่งที่ต้องมีก่อน (Prerequisites)

- **Node.js** เวอร์ชัน 20 ขึ้นไป → ตรวจด้วย `node -v`
- **MySQL** เวอร์ชัน 8 ขึ้นไป (เปิดบริการอยู่ และรู้รหัสผ่าน user `root`)
- **npm** (ติดมากับ Node.js อยู่แล้ว)

---

## ขั้นตอนการติดตั้ง

> ลำดับสำคัญ: ติดตั้ง **Backend ให้เสร็จและรันได้ก่อน** แล้วค่อยทำ Frontend

### Backend (`backend/`)

#### 1. ติดตั้ง dependency

```bash
cd backend
npm install
```

#### 2. ตั้งค่า `.env` ของ Backend

ก๊อปไฟล์ตัวอย่างแล้วแก้ค่าให้ตรงกับ MySQL ของเครื่องตัวเอง:

```bash
cp .env.example .env
```

เปิดไฟล์ `backend/.env` แล้วแก้:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=            # ← ใส่รหัสผ่าน MySQL ของเครื่อง (ถ้าไม่มีให้เว้นว่าง)
DB_NAME=worldskill2026_real
JWT_SECRET=change-this-to-a-random-secret
PORT=8080
SESSION_DURATION_MINUTES=360
```

| ตัวแปร | ความหมาย |
|--------|----------|
| `DB_HOST` / `DB_PORT` | ที่อยู่ MySQL (ปกติ `localhost:3306`) |
| `DB_USER` / `DB_PASSWORD` | บัญชี MySQL ที่ใช้เชื่อมต่อ |
| `DB_NAME` | ชื่อฐานข้อมูล |
| `JWT_SECRET` | กุญแจเข้ารหัส token (ใส่อะไรก็ได้ ยาว ๆ สุ่ม ๆ) |
| `PORT` | พอร์ตที่ backend เปิด (ค่าเริ่มต้น `8080`) |
| `SESSION_DURATION_MINUTES` | ระยะเวลาสอบ (นาที) สำหรับ countdown timer — `360` = 6 ชม. ตามเอกสาร RSC2026 |

#### 3. สร้างฐานข้อมูล + ใส่ข้อมูลตั้งต้น (เลือก 1 วิธี)

**วิธี A — ใช้สคริปต์ช่วย (สะดวก แต่ระบบจริงตอนแข่งอาจไม่มี `seed.js`)**

```bash
npm run seed
```
> ลบ DB เดิมแล้วสร้างใหม่จาก `database/seed_data.sql` ทั้งหมด — รันซ้ำได้เพื่อรีเซ็ตข้อมูล

**วิธี B — import ไฟล์ `seed_data.sql` เองผ่าน cmd / MySQL client (เหมือนสนามจริง)**

`seed_data.sql` มีแต่ `CREATE TABLE` / `INSERT` (ไม่มี `CREATE DATABASE`/`USE`) ดังนั้น **ต้องสร้างและเลือก DB เองก่อน**:

```bash
# สร้างฐานข้อมูล แล้ว import ไฟล์เข้าไป (รันใน cmd/PowerShell/terminal)
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS worldskill2026_real;"
mysql -u root -p worldskill2026_real < backend/database/seed_data.sql
```

หรือทำในหน้าจอ MySQL prompt:

```sql
mysql -u root -p
-- เมื่อเข้ามาแล้ว:
CREATE DATABASE IF NOT EXISTS worldskill2026_real;
USE worldskill2026_real;
SOURCE C:/path/to/backend/database/seed_data.sql;
```

> 🛠️ **เรื่อง schema เพิ่มเติม (auto-migration):** ระบบนี้มี countdown timer ซึ่งต้องใช้คอลัมน์ `started_at`
> ในตาราง `sessions` ที่ **ไม่มีอยู่ใน `seed_data.sql`** เดิม — เราจึง **ไม่แก้ `seed_data.sql`** (ไฟล์ฐานข้อมูลจริง)
> แต่ให้ backend **เติมคอลัมน์นี้เองอัตโนมัติตอนสตาร์ท** (ดู `src/config/schema.js`)
> ดังนั้นไม่ว่าจะสร้าง DB ด้วยวิธี A หรือ B ก็ใช้งานได้ทันที (TP2026 §7 อนุญาต *"schema may be extended if required"*)

#### 4. รัน Backend

```bash
npm start        # โหมดปกติ
# หรือ
npm run dev      # โหมดพัฒนา (auto-restart ด้วย nodemon)
```

ถ้าสำเร็จจะเห็นข้อความ `Backend running on http://localhost:8080`

---

### Frontend (`frontend/`)

#### 1. ติดตั้ง dependency

```bash
cd frontend
npm install
```

#### 2. สร้างไฟล์ `.env`

```bash
cp .env.example .env
```

#### 3. ตั้งค่า `.env` ของ Frontend ⭐ (สำคัญสำหรับระบบตรวจข้อสอบ)

นี่คือจุดที่ทำให้ **ระบบตรวจข้อสอบเข้าถึง backend ได้** เปิดไฟล์ `frontend/.env`:

```env
# แก้ค่านี้ให้ตรงกับ IP ของเครื่องที่รัน backend ตอนแข่งขัน
VITE_API_URL=http://localhost:8080/api
```

> ชื่อตัวแปร **ต้องขึ้นต้นด้วย `VITE_`** เสมอ (เช่น `VITE_API_URL`) ไม่งั้น Vite จะไม่อ่านค่าเข้าไปให้เบราว์เซอร์เห็น

**ต้องแก้ค่า `VITE_API_URL` อย่างไร:**

| สถานการณ์ | ค่า `VITE_API_URL` ที่ต้องใส่ |
|-----------|--------------------------|
| รัน frontend + backend บนเครื่องเดียวกัน | `http://localhost:8080/api` |
| ระบบตรวจ / เครื่องอื่นในวงแลนเข้ามาดู | `http://<IP-ของเครื่องที่รัน-backend>:8080/api` |

ตัวอย่างเช่น ถ้าตอนแข่งเครื่องได้ IP เป็น `192.168.1.50` ให้ใส่:

```env
VITE_API_URL=http://192.168.1.50:8080/api
```

> 🔎 **วิธีหา IP ของเครื่อง**
> - Windows: `ipconfig` → ดูค่า *IPv4 Address*
> - macOS/Linux: `ifconfig` หรือ `ip addr`

> ⚠️ **ข้อควรระวัง (ห้ามพลาด):**
> 1. ต้องขึ้นต้นด้วย `http://` และลงท้ายด้วย `/api` เสมอ
> 2. ใช้ `PORT` ให้ตรงกับที่ตั้งไว้ใน `backend/.env` (ค่าเริ่มต้น `8080`)
> 3. **แก้ `.env` แล้วต้อง `Ctrl+C` หยุด `npm run dev` แล้วรันใหม่** — Vite อ่านค่า `.env` แค่ตอนเริ่มรันเท่านั้น
> 4. อย่าใช้ `localhost` ถ้าให้เครื่องอื่นเข้ามาดู เพราะ `localhost` ของเครื่องนั้นจะหมายถึงตัวมันเอง ไม่ใช่เครื่อง backend

#### 4. รัน Frontend

```bash
npm run dev
```

เปิดเบราว์เซอร์ที่ **http://localhost:3000** (หรือ `http://<IP-ของเครื่อง>:3000` จากเครื่องอื่น)

---

## บัญชีทดสอบ (จาก `seed_data.sql`)

| บทบาท | Username | Password | Candidate Code |
|-------|----------|----------|----------------|
| กรรมการ (judge) | `admin` | `password` | — |
| ผู้จัดการ (manager) | `manager` | `password` | — |
| ผู้แข่งขัน (candidate) | `candidate1` | `123456` | `C01` |
| ผู้แข่งขัน (candidate) | `candidate2` | `123456` | `C02` |

---

## เช็กลิสต์ก่อนให้ระบบตรวจข้อสอบเข้ามา ✅

1. [ ] MySQL เปิดอยู่ และ `npm run seed` ผ่านโดยไม่มี error
2. [ ] Backend รันอยู่ → เปิด `http://localhost:8080/api/...` ตอบกลับได้
3. [ ] `frontend/.env` → `VITE_API_URL` ชี้ไปที่ **IP จริง** ของเครื่อง backend (ไม่ใช่ `localhost` ถ้าตรวจจากเครื่องอื่น)
4. [ ] หยุดแล้วรัน `npm run dev` ใหม่หลังแก้ `.env`
5. [ ] ทดสอบ login จากเครื่องอื่นได้สำเร็จ → แปลว่า frontend คุยกับ backend ได้แล้ว

---

## แก้ปัญหาที่เจอบ่อย (Troubleshooting)

| อาการ | สาเหตุที่เป็นไปได้ | วิธีแก้ |
|-------|-------------------|--------|
| Login แล้วหมุน / ขึ้น Network Error | `VITE_API_URL` ผิด หรือ backend ไม่ได้รัน | เช็กว่า backend รันอยู่ + `VITE_API_URL` ถูก แล้วรัน `npm run dev` ใหม่ |
| แก้ `.env` แล้วไม่มีอะไรเปลี่ยน | Vite ยังใช้ค่าเดิม | `Ctrl+C` แล้ว `npm run dev` ใหม่ |
| `npm run seed` error เชื่อม MySQL ไม่ได้ | `DB_USER`/`DB_PASSWORD` ผิด หรือ MySQL ไม่ได้เปิด | แก้ `backend/.env` ให้ตรง แล้วเปิดบริการ MySQL |
| เครื่องอื่นเข้า `http://<IP>:3000` ไม่ได้ | Firewall บล็อก หรือใช้ `localhost` | เปิด port 3000/8080 ใน Firewall + ใช้ IP จริงใน `VITE_API_URL` |
| backend crash ทันทีที่รัน / ขึ้น `EADDRINUSE` | มี backend อีกตัวถือ port 8080 อยู่ (เปิดซ้อนกัน) | หา PID: `Get-NetTCPConnection -LocalPort 8080 -State Listen` แล้วปิด: `Stop-Process -Id <PID> -Force` — รัน backend ตัวเดียวพอ |
| timer ไม่ขึ้น / `/api/config` error 500 | คอลัมน์ `started_at` ไม่ถูกเติม (DB user ไม่มีสิทธิ์ `ALTER`) | ใช้ user ที่มีสิทธิ์ ALTER (เช่น `root`) หรือเติมเอง: `ALTER TABLE sessions ADD COLUMN started_at DATETIME NULL;` |

---

## ความสอดคล้องกับหลักเกณฑ์การแข่งขัน (Compliance / Traceability)

ตรวจสอบจริงจากโค้ดเทียบกับ `RSC2026_TD_Web_Technologies.md`, `TP2026.md` และ
`WSC2026_17_Web_Technologies_marking_scheme.md`

> **ขอบเขต:** ตารางด้านล่างอ้างอิง **`frontend/` (เวอร์ชันพร้อมแข่ง)** + `backend/`
> ครอบคลุมทั้งข้อ Measurement (M) ที่ตรวจอัตโนมัติได้ (Newman/Playwright) จนถึง responsive/accessibility/timer
> ✅ = ทำครบตรงสเปก · ข้อ Judgement (J) ที่กรรมการให้คะแนนเองจะระบุแยกไว้ตอนท้าย
> (เวอร์ชัน `frontend-simple/` เป็นตัวเรียนรู้ ไม่ได้ออกแบบให้ครบ B5/WCAG)

### Criterion A — Backend API (40)

ครบทั้ง 18 endpoint ตาม `TP2026.md` §6 (ตรวจจาก `backend/src/routes/`)

| Endpoint | ไฟล์ | สถานะ |
|----------|------|:----:|
| `POST /api/login` / `POST /api/logout` | `routes/auth.js` | ✅ |
| `GET /api/config` | `routes/config.js` | ✅ |
| `GET /api/tasks` | `routes/tasks.js` | ✅ |
| `GET/POST/PUT /api/my-submission` | `routes/submissions.js` | ✅ |
| `GET /api/my-result` | `routes/results.js` | ✅ |
| `GET /api/candidates` | `routes/candidates.js` | ✅ |
| `GET /api/submissions` | `routes/submissions.js` | ✅ |
| `PUT /api/session/start` · `PUT /api/session/close` | `routes/session.js` | ✅ |
| `POST /api/submissions/{id}/recheck` | `routes/submissions.js` | ✅ |
| `PUT /api/results/{candidate_id}/confirm` | `routes/results.js` | ✅ |
| `GET /api/statistics/summary` · `ranking` · `status` | `routes/statistics.js` | ✅ |
| `GET /api/report` (JSON + CSV) | `routes/report.js` | ✅ |

| เกณฑ์ย่อย (A1–A4) | สถานะ | อ้างอิงในโค้ด |
|---|:--:|---|
| Login/Logout flow | ✅ | `controllers/authController.js` |
| ปฏิเสธคำขอที่ไม่มี token → **401** | ✅ | `middlewares/auth.js` |
| Role-based access (candidate/judge/manager) | ✅ | `middlewares/role.js` |
| Response schema `{success,data,meta}` / `{success,message}` | ✅ | ทุก controller |

### Criterion C — Integration & Business Rules (20)

| Business rule (`TP2026.md` §7) | สถานะ | อ้างอิงในโค้ด |
|---|:--:|---|
| ห้ามส่งงานก่อนเปิด session → **403** | ✅ | `submissionsController.js` (เช็ก `status !== 'active'`) |
| ห้ามส่งงานหลังปิด session → **403** | ✅ | `submissionsController.js` |
| 1 candidate มี submission ได้ 1 รายการ → **409** | ✅ | `createSubmission` |
| Candidate เข้าถึงเฉพาะข้อมูลตัวเอง | ✅ | กรอง `req.user.id` ใน my-submission / my-result |
| เฉพาะ Judge เปิด/ปิด session ได้ | ✅ | `routes/session.js` (`authorize('judge')`) |
| **Session lifecycle: session เดียว** — เปิดซ้ำ = เริ่มต่อ session เดิม (รีเซ็ต timer, **ไม่ล้าง**คะแนน/submission) · ล้างข้อมูลจริงทำผ่าน re-seed | ✅ | `sessionController.js` (UPDATE แถวเดียว ไม่สร้าง session ใหม่) |
| Manager เป็น read-only | ✅ | endpoint manager เป็น GET ทั้งหมด |
| Recheck / Confirm flow + กันการ confirm ซ้ำ | ✅ | `recheckSubmission`, `confirmResult` |
| **URL validation** — ตรวจรูปแบบ URL (http/https + well-formed) ทุก submission · *ไม่บังคับ private IP* เพราะระบบตรวจสนามส่ง URL ทั่วไป (เช่น `example.com`) มาทดสอบ | ✅ | `submissionsController.js` (`validateUrls`) |
| **หมดเวลาแล้วปิดรับ submission อัตโนมัติ** → **403** | ✅ | `utils/session.js` (lazy auto-close) |

### Criterion B — Frontend (25)

| หน้าจอ / ฟีเจอร์ | สถานะ | อ้างอิงในโค้ด |
|---|:--:|---|
| Login + validation + redirect ตาม role | ✅ | `pages/Login.jsx` |
| Route guard (กันเข้าหน้าผิด role) | ✅ | `App.jsx` (`ProtectedRoute`) |
| Candidate: แสดงโจทย์ + สถานะ session + ฟอร์มส่ง/แก้ + ผลคะแนน | ✅ | `pages/CandidatePage.jsx` |
| Judge: ตารางผู้แข่ง + เปิด/ปิด session + recheck + confirm | ✅ | `pages/JudgePage.jsx` |
| Manager: summary + ranking + pass/fail + export | ✅ | `pages/ManagerPage.jsx` |
| **นับเวลาถอยหลัง (countdown timer B2)** — HH:MM:SS sync จาก backend + ปิดฟอร์มเมื่อหมดเวลา | ✅ | `CandidatePage.jsx` + `configController` (`remaining_seconds`) |
| **Responsive layout (B5)** — ใช้ได้ทั้ง 1366px และ 375px | ✅ | `styles.css` (flex/grid + media query) |
| **Accessibility (WCAG 2.1)** — `<label htmlFor>`, focus-visible, contrast, `<th scope>`, `aria-live` | ✅ | ทุกหน้า + `styles.css` |

### Criterion D — Deployment in LAN (10)

| เกณฑ์ | สถานะ | อ้างอิง |
|---|:--:|---|
| Frontend เข้าถึงผ่าน LAN ได้ | ✅ | `package.json` → `vite --host` (bind 0.0.0.0) |
| Backend เข้าถึงผ่าน LAN ได้ | ✅ | `app.js` (`cors()` + `PORT`) |
| Offline — ไม่มี CDN / external font / external API | ✅ | `index.html` + `styles.css` ใช้ system font stack ทั้งหมด |

### Criterion E — Code Quality (5, กรรมการให้คะแนน)

| เกณฑ์ | สถานะ | อ้างอิง |
|---|:--:|---|
| แยกโครงสร้างชัดเจน (routes / controllers / middlewares / config) | ✅ | โครงสร้าง `backend/src/` |
| มี comment อธิบาย + README สำหรับส่งมอบ | ✅ | comment ภาษาไทยทั้ง frontend + เอกสารชุดนี้ |

### หมายเหตุสำคัญเรื่องการตรวจอัตโนมัติ

- คะแนนจาก `POST /api/submissions/{id}/recheck` ในชุด demo นี้เป็น **ตัวเลขสุ่ม (stub)**
  (`Math.random()` ใน `submissionsController.js`) — ใช้สำหรับสาธิต flow เท่านั้น
  ในสนามจริงระบบตรวจอัตโนมัติของศูนย์สอบจะเป็นผู้ให้คะแนน
- เกณฑ์ที่เป็น **Judgement (J)** ทุกหมวด (เช่น UX quality, API design, workflow coherence)
  เป็นดุลพินิจกรรมการ ไม่สามารถยืนยันด้วยการตรวจโค้ดเพียงอย่างเดียว

### สิ่งที่ส่งมอบ (`TP2026.md` §11) ครบในโฟลเดอร์นี้

- ✅ Source code: `backend/`, `frontend/` (+ `frontend-simple/`)
- ✅ Database schema + seed: `backend/database/seed_data.sql` — import ได้ทั้งผ่าน `seed.js` หรือ cmd (ดูหัวข้อติดตั้ง วิธี B)
- ✅ README วิธีรันระบบ (ไฟล์นี้)
- ▶️ Frontend URL / Backend API Base URL → ส่งตอนแข่งตามรูปแบบ `http://<IP>:3000` และ `http://<IP>:8080/api`
