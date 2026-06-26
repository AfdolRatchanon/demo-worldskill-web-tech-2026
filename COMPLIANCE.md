# Compliance Report — WorldSkills 2026 WebTech

ตรวจสอบความครบถ้วนของระบบเทียบกับ **`TP2026.md`** และ **`WSC2026_17_Web_Technologies_marking_scheme.md`**

## สัญลักษณ์

- **M** = Measurement (ตรวจอัตโนมัติ/วัดผลได้ชัด — Newman/Playwright) · **J** = Judgement (กรรมการให้คะแนนเอง)
- ✅ ทำครบตรงสเปก · ◐ ทำบางส่วน · ✗ ไม่มี

> **วิธีตรวจสอบ:**
> - **ชุดพร้อมแข่ง (real)** — ตรวจจากโค้ด + **รันทดสอบจริงด้วย curl** (login, timer, auto-close) + `vite build` ✅ · *URL validation ปรับตาม feedback ระบบตรวจสนาม — ดูข้อ 6 ท้ายไฟล์*
> - **ชุดเรียนรู้ (simple)** — ตรวจจากโค้ด + syntax check + boot ผ่าน (ยังไม่ได้รัน curl ระดับ DB เพราะตอนตรวจ MySQL ปิดอยู่)
> - ข้อ **M ยืนยันได้ว่าทำครบ** · ข้อ **J เป็นดุลพินิจกรรมการ** เอกสารนี้ระบุได้แค่ "มีของให้ตรวจ"

---

## ภาพรวม — 4 โฟลเดอร์ / 2 ชุด

| ชุด | ประกอบด้วย | ใช้เมื่อ |
|---|---|---|
| **พร้อมแข่ง** | `backend` + `frontend` | ใช้งานจริง / ส่งตรวจ |
| **เรียนรู้** | `backend-simple` + `frontend-simple` | อ่านทำความเข้าใจ logic |

| Criterion | เต็ม | ชุดพร้อมแข่ง (real + real) | ชุดเรียนรู้ (simple + simple) |
|---|---:|---|---|
| A — Backend API | 40 | ✅ M ครบ | ◐ endpoint ครบ แต่ `config` ไม่มี timing |
| B — Frontend UX/UI | 25 | ✅ M ครบ + J รองรับ | ◐ ขาด timer + responsive + a11y |
| C — Integration & Business Rules | 20 | ✅ M ครบ | ◐ ขาด auto-close (timer) |
| D — Deployment in LAN | 10 | ✅ M ครบ | ✅ |
| E — Code Quality | 5 (J) | ✅ รองรับ | ✅ รองรับ (โครงเรียบง่ายกว่า) |

> 👉 **ส่งตรวจให้ใช้ชุดพร้อมแข่งเสมอ** — ชุดเรียนรู้ตัดของยากออกโดยตั้งใจ จึงไม่ครบบางเกณฑ์

---

# ส่วนที่ 1 — ชุดพร้อมแข่ง (backend + frontend)

## Criterion A — Backend API (40)

| ID | Type | รายการ | สถานะ | หลักฐานในโค้ด |
|---|:--:|---|:--:|---|
| A1 | M | login/logout flow (`POST /api/login`, `/logout`) | ✅ | `controllers/authController.js` |
| A1 | M | ปฏิเสธ request ที่ไม่มี token → **401** | ✅ | `middlewares/auth.js` |
| A1 | M | Role-based access (candidate/judge/manager) | ✅ | `middlewares/role.js` |
| A1 | J | Authentication coherent & secure | ✅* | JWT + RBAC (*รหัสผ่านใน seed เป็น plain-text ตามไฟล์ official) |
| A2 | M | `GET /api/tasks` | ✅ | `tasksController.js` |
| A2 | M | `GET /api/my-result` | ✅ | `resultsController.js` |
| A2 | M | `GET/POST/PUT /api/my-submission` | ✅ | `submissionsController.js` |
| A2 | J | API design + validation messages | ✅ | error message ชัดเจนทุก endpoint |
| A3 | M | `GET /api/candidates` · `GET /api/submissions` | ✅ | `candidatesController.js`, `submissionsController.js` |
| A3 | M | `PUT /api/session/start` · `/close` | ✅ | `sessionController.js` |
| A3 | M | `POST /api/submissions/{id}/recheck` | ✅ | `recheckSubmission` |
| A3 | M | `PUT /api/results/{candidate_id}/confirm` | ✅ | `confirmResult` |
| A3 | M | `GET /api/statistics/summary` · `ranking` · `status` | ✅ | `statisticsController.js` |
| A3 | M | `GET /api/report` (JSON + CSV) | ✅ | `reportController.js` |
| A3 | J | API organization | ✅ | แยก routes/controllers ชัด |
| A4 | M | Status codes + error schema consistency | ✅ | 400/401/403/404/409 + `{success,data,meta}`/`{success,message}` |
| A4 | J | API structure & schema consistency | ✅ | รูปแบบเดียวกันทุก controller |

**ครบ 18/18 endpoint ตาม TP2026 §6** — method + path ตรงทุกตัว · `GET /api/config` คืนทั้ง status + timing (`remaining_seconds`)

## Criterion B — Frontend UX/UI (25)

| ID | Type | รายการ | สถานะ | หลักฐาน |
|---|:--:|---|:--:|---|
| B1 | M | Login validation + role redirect | ✅ | `Login.jsx` (`required` + `navigate('/'+role)`) |
| B1 | J | Login UX & feedback quality | ✅ | styled card + error `role="alert"` |
| B2 | M | Candidate dashboard timer/session/task display | ✅ | `CandidatePage.jsx` countdown HH:MM:SS + status + task |
| B2 | M | Submission form create/update | ✅ | ฟอร์มเดียว สลับ POST/PUT |
| B2 | J | Dashboard usability & accessibility | ✅ | `<label htmlFor>`, focus-visible, contrast |
| B3 | M | Candidate list + submission table | ✅ | `JudgePage.jsx` (มี `<th scope>`) |
| B3 | M | Session control + recheck + confirm | ✅ | ปุ่ม Open/Close/Re-check/Confirm |
| B3 | J | Judge workflow efficiency | ✅ | polling 5s + disabled states + badges |
| B4 | M | Summary + ranking + pass/fail display | ✅ | `ManagerPage.jsx` stat cards + ranking table |
| B4 | J | Reporting clarity | ✅ | Export JSON/CSV + stat cards |
| B5 | M | Responsive layout (1366px & 375px) | ✅ | `styles.css` (flex/grid + media query) |

## Criterion C — Integration & Business Rules (20)

| ID | Type | รายการ | สถานะ | หลักฐาน |
|---|:--:|---|:--:|---|
| C1 | M | ห้ามส่งงานก่อนเปิด session → 403 | ✅ | `submissionsController` (`status !== 'active'`) |
| C1 | M | ห้ามส่งงานหลังปิด session → 403 | ✅ | เช็กเดียวกัน + auto-close เมื่อหมดเวลา |
| C2 | M | 1 submission ต่อ candidate → 409 | ✅ | `createSubmission` |
| C2 | M | Candidate เข้าถึงเฉพาะข้อมูลตัวเอง | ✅ | กรอง `req.user.id` |
| C2 | M | URL validation (รูปแบบ http/https) | ✅ | `validateUrls` — รับ URL http(s) ที่ถูก format · *ไม่บังคับ private IP* (ระบบตรวจสนามส่ง URL ทั่วไปมาทดสอบ) |
| C3 | M | Recheck flow correctness | ✅ | `recheckSubmission` |
| C3 | M | Confirm flow correctness | ✅ | `confirmResult` + กัน confirm ซ้ำ |
| C3 | J | Workflow coherence & dependability | ✅ | single-session, lazy auto-close, ไม่ล้างคะแนนตอน re-open, **กันแก้ submission ที่ confirm แล้ว (403)** |

## Criterion D — Deployment in LAN (10)

| ID | Type | รายการ | สถานะ | หลักฐาน |
|---|:--:|---|:--:|---|
| D1 | M | Frontend reachable ใน LAN | ✅ | `vite --host` (bind 0.0.0.0, port 3000) |
| D1 | M | Backend reachable ใน LAN | ✅ | `cors()` + `app.listen(PORT)` (8080) |
| D2 | M | Offline LAN compliance | ✅ | ไม่มี CDN/external font — `styles.css` ใช้ system font stack |
| D2 | J | Stable deployment package | ✅ | รันด้วย npm + README ครบ |

## Criterion E — Code Quality & Maintainability (5, J ทั้งหมด)

| ID | Type | รายการ | สถานะ | หลักฐาน |
|---|:--:|---|:--:|---|
| E1 | J | Structure / naming / separation of concerns | ✅ | `routes / controllers / middlewares / config / utils` |
| E2 | J | Maintainability & handover readiness | ✅ | comment ภาษาไทย + `README.md` + `COMPLIANCE.md` + seed instructions |

> **สรุปชุดพร้อมแข่ง: ครบทุกข้อ M ทั้ง 5 Criterion + รองรับ J ครบ → ถูกต้องตามเกณฑ์ TP2026 + WSC2026**

---

# ส่วนที่ 2 — ชุดเรียนรู้ (backend-simple + frontend-simple)

> ⚠️ ชุดนี้ **ตัด "ระบบยาก ๆ" ออกโดยตั้งใจ** เพื่อให้นักเรียนอ่าน logic ง่าย จึง **ไม่ครบบางเกณฑ์**
> ใช้เพื่อการเรียนรู้เท่านั้น — **ห้ามใช้ส่งตรวจ**

## 2.1 backend-simple ตัดอะไร + กระทบเกณฑ์ไหน

| ระบบที่ตัด | backend | backend-simple | เกณฑ์ที่กระทบ |
|---|---|---|:--|
| ⏱️ Timer / `started_at` / `remaining_seconds` | มี | ✗ ไม่มี | `config` ไม่คืน timing (TP2026 §6 ระบุ "status **and timing**") · B2 timer |
| ♻️ Auto-close เมื่อหมดเวลา (`utils/session.js`) | มี (lazy) | ✗ ไม่มี | C1 "no submission after close" ยังได้ (judge ปิดเอง) แต่ไม่มีปิดอัตโนมัติ |
| 🔧 Auto-migration (`config/schema.js`) | มี | ✗ ไม่มี | ไม่กระทบเกณฑ์ (ใช้ตารางตาม seed ตรง ๆ) |
| 🌐 URL validation | ตรวจ http/https + well-formed | ตรวจ http/https | เท่ากันแล้ว (ถอด `isLanHost` ออกจาก backend* — ดูหมายเหตุท้ายไฟล์) |

### ตาราง Criterion ของ backend-simple (เทียบ marking)

| Criterion item | สถานะ | หมายเหตุ |
|---|:--:|---|
| A — endpoint ครบ 18 ตัว | ✅ | method/path เท่า backend ทุกตัว |
| A — `GET /api/config` คืน timing | ◐ | คืนแค่ status (ไม่มี `remaining_seconds`) |
| A — auth / 401 / RBAC / response schema | ✅ | เหมือน backend |
| C1 — ห้ามส่งก่อน/หลัง session (403) | ✅ | เช็ก `status !== 'active'` (ปิดด้วย judge เท่านั้น ไม่มี auto-close) |
| C2 — 1 submission/candidate (409) · own data | ✅ | เหมือนเดิม |
| C2 — URL validation (3 M) | ✅ | ตรวจ http/https + well-formed (เท่ากับ backend) |
| C3 — recheck / confirm flow | ✅ | เหมือนเดิม (recheck สุ่มคะแนนสาธิต) |
| D — backend reachable / offline | ✅ | `cors()` + `app.listen` เหมือนเดิม |
| E — โครงสร้าง/อ่านง่าย | ✅ | เรียบง่ายกว่า เหมาะเรียนรู้ |

## 2.2 frontend-simple ขาดอะไร (เทียบ marking B)

| ID | Type | รายการ | frontend | frontend-simple | หมายเหตุที่ขาด |
|---|:--:|---|:--:|:--:|---|
| B1 | M | Login validation + role redirect | ✅ | ✅ | มี `required` + redirect — ผ่าน |
| B1 | J | Login UX & feedback quality | ✅ | ◐ | error เป็น `<b>` ธรรมดา ไม่มี style/aria |
| B2 | M | **timer**/session/task display | ✅ | ◐ | **ไม่มี countdown timer** (แสดงแค่สถานะ session) |
| B2 | M | Submission form create/update | ✅ | ✅ | ผ่าน (ใช้ `alert()` แจ้งผล) |
| B2 | J | Dashboard usability & **accessibility** | ✅ | ✗ | ไม่มี `<label>`/focus/contrast (ไม่ตาม WCAG TP2026 §8) |
| B3 | M | Candidate list + submission table | ✅ | ✅ | ผ่าน (ตารางธรรมดา ไม่มี `<th scope>`) |
| B3 | M | Session control + recheck + confirm | ✅ | ✅ | ผ่าน |
| B3 | J | Judge workflow efficiency | ✅ | ◐ | ใช้งานได้ แต่ไม่มี badge/สถานะภาพ |
| B4 | M | Summary + ranking + pass/fail | ✅ | ✅ | ผ่าน |
| B4 | J | Reporting clarity | ✅ | ◐ | ตารางเปล่า ไม่มี stat cards |
| B5 | M | **Responsive layout** | ✅ | ✗ | **ไม่มี CSS เลย** → ไม่ responsive (เสีย B5) |

## 2.3 สรุปสิ่งที่ "ชุดเรียนรู้" ขาด (รวม backend + frontend)

| # | ขาด | เกณฑ์ | อยู่ที่ |
|---|---|---|---|
| 1 | Auto-close เมื่อหมดเวลา | C3 (J) | backend-simple |
| 2 | Timing ใน `/api/config` | A / B2 | backend-simple |
| 3 | Countdown timer บนหน้าจอ | B2 (M) | frontend-simple |
| 4 | Responsive layout | B5 (M) | frontend-simple |
| 5 | Accessibility (label/focus/contrast/semantic) | B2·B1·B4 (J), WCAG §8 | frontend-simple |

> (URL validation เท่ากันทั้ง 2 ชุดแล้ว — backend ถอด `isLanHost` ออกหลังระบบตรวจสนามแจ้ง A2/C2 ตก)

> ทั้ง 6 ข้อ **มีครบในชุดพร้อมแข่ง** — ชุดเรียนรู้คงไว้แบบเรียบง่ายโดยตั้งใจ

---

# ข้อควรรู้ (ความซื่อสัตย์ของรายงาน)

1. **คะแนน recheck เป็น stub** — `POST /api/submissions/{id}/recheck` ให้คะแนนแบบสุ่ม (`Math.random()`) เพื่อสาธิต *flow* (ตรงเกณฑ์ C3 "recheck flow correctness") ส่วนการให้คะแนนจริงเป็นหน้าที่ของระบบตรวจอัตโนมัติของศูนย์สอบ — เหมือนกันทั้ง 2 ชุด
2. **รหัสผ่าน plain-text** — มาจาก `seed_data.sql` (ไฟล์ official) ระบบ login เทียบตรง ๆ ตามที่ไฟล์กำหนด competitor สามารถ hash เองได้ (TP2026 อนุญาต)
3. **schema extension** — ชุดพร้อมแข่งเพิ่มเฉพาะคอลัมน์ `started_at` (สำหรับ timer) แบบ auto-migration ตอน backend สตาร์ท **โดยไม่แก้ `seed_data.sql`** (TP2026 §7 อนุญาต) · ชุดเรียนรู้ไม่มี migration นี้
4. **ข้อ J ทุกหมวด** เป็นดุลพินิจกรรมการ รายงานนี้ยืนยันได้แค่ว่า "มีของให้ตรวจครบ"
5. **การทดสอบ** — ชุดพร้อมแข่งรัน curl ทดสอบจริงแล้ว (รอบก่อน) · ชุดเรียนรู้ตรวจ syntax + boot ผ่าน แต่ยังไม่ได้รัน curl ระดับ DB เพราะ MySQL ปิดอยู่ตอนตรวจ
6. **ปรับ URL validation ตาม feedback ระบบตรวจสนาม** — เดิม backend บังคับ host เป็น private IP (`isLanHost`) แต่ระบบตรวจจริงส่ง URL ทั่วไป (`https://example.com/...`) มาทดสอบ submission update → โดน reject 400 ทำให้ **A2 (Submission update) และ C2 ตก** · แก้แล้วโดย**ถอด `isLanHost` ออก** เหลือตรวจแค่รูปแบบ http(s) ที่ถูก format
   - บทเรียน: curl รอบก่อนผมทดสอบด้วย **IP ภายใน** (ผ่าน) เลยไม่เจอ — ระบบตรวจใช้ **domain ทั่วไป** จึงเผยปัญหา

---

# สรุป

- ✅ **ชุดพร้อมแข่ง (`backend` + `frontend`)**: ทำครบ **ทุกข้อ Measurement (M)** ทั้ง 5 Criterion + รองรับ J ครบ → **ถูกต้องตามเกณฑ์ TP2026 + WSC2026** ← ใช้ส่งตรวจ
- ◐ **ชุดเรียนรู้ (`backend-simple` + `frontend-simple`)**: ครบ D/E และ A/C เกือบครบ แต่ **ขาด LAN validation (C2), auto-close, timer (B2), responsive (B5), accessibility** เพราะตัดของยากออกเพื่อการเรียนรู้ → **ไม่ใช้ส่งตรวจ**
