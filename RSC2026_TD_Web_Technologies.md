# RSC2026_TD_WEB_TECHNOLOGIES

## การแข่งขันฝีมือแรงงานแห่งชาติ ครั้งที่ 31 ระดับภาค
### สาขา : เทคโนโลยีเว็บ  
วันที่ 7 - 10 กรกฎาคม 2569

- สถาบันพัฒนาฝีมือแรงงาน 2 สุพรรณบุรี  
- สถาบันพัฒนาฝีมือแรงงาน 7 อุบลราชธานี  
- สถาบันพัฒนาฝีมือแรงงาน 10 ลำปาง  
- สถาบันพัฒนาฝีมือแรงงาน 11 สุราษฎร์ธานี  

---

## 1. หลักการและที่มา

เอกสารฉบับนี้จัดทำขึ้นเพื่อปรับรูปแบบการแข่งขันเดิมจากโจทย์เว็บแอปแบบ 3 ชั่วโมง ให้เหมาะกับการแข่งขันแบบ 6 ชั่วโมงที่เน้นทั้ง Frontend, Backend API, Database, Integration และการตรวจอัตโนมัติภายในเครือข่าย LAN ของศูนย์สอบแต่ละแห่งโดยไม่พึ่งพาอินเทอร์เน็ตภายนอก

แนวทางการจัดทำยังคงรักษาโครงเอกสารสำคัญของ Test Project เดิม เช่น Introduction, Description of project and tasks, Instructions, Equipment และ Marking scheme เพื่อให้รูปแบบเอกสารยังสอดคล้องกับแพทเทิร์นเดิมของการแข่งขัน

---

## 2. วัตถุประสงค์ของการแข่งขัน

- วัดทักษะการออกแบบและพัฒนา Web Application แบบ Full Stack ภายใต้เวลาจำกัด
- วัดความสามารถในการพัฒนา REST API, Authentication, Validation, Database Design และ Frontend Dashboard
- วัดความสามารถในการ deploy งานให้ใช้งานได้จริงภายใน LAN และส่งงานเข้าสู่ระบบตรวจอัตโนมัติ
- เพิ่มความโปร่งใสและลดภาระการตรวจด้วยระบบ auto-check ที่แต่ละศูนย์ติดตั้งและใช้งานได้เอง

---

## 3. รูปแบบสนามแข่งขัน

- แต่ละศูนย์สอบติดตั้งระบบ Local Exam Box ของตนเอง 1 ชุด ใช้เป็นระบบจัดการสอบ รับ submission ตรวจอัตโนมัติ และสรุปผลภายในศูนย์
- การแข่งขันใช้เฉพาะเครือข่าย LAN ภายในห้องแข่งขันเท่านั้น ห้ามเชื่อมต่ออินเทอร์เน็ตทุกกรณี
- ผู้เข้าแข่งขันพัฒนาโปรแกรมบนเครื่องของตนเองและเปิดให้เข้าถึงผ่าน IP ภายในห้อง ตามพอร์ตที่กำหนด
- ผู้เข้าแข่งขันส่ง Frontend URL และ Backend API Base URL ผ่านหน้า Candidate Portal ของศูนย์สอบ
- ระบบ Local Exam Box ทำการทดสอบอัตโนมัติด้วยชุดทดสอบเดียวกันทุกศูนย์เพื่อให้คะแนนสอดคล้องกัน

---

## 4. เครื่องมือและซอฟต์แวร์

| หมวด | ข้อกำหนดขั้นต่ำ |
|---|---|
| เครื่องผู้เข้าแข่งขัน | CPU 4 core / RAM 8 GB / SSD 250 GB / Monitor 21 นิ้วขึ้นไป |
| ระบบปฏิบัติการ | Windows 10/11 64-bit หรือ Linux Desktop |
| เครื่องมือพัฒนา | VS Code, Browser, Database Client |
| ฐานข้อมูล | MariaDB หรือ PostgreSQL |
| ระบบศูนย์สอบ | Docker Engine/Compose |
| ชุดตรวจอัตโนมัติ | Newman และ Playwright |

### Network Configuration

| รายการ | ค่าแนะนำ |
|---|---|
| Server IP | 10.10.0.2 |
| Judge Range | 10.10.0.10 - 10.10.0.19 |
| Competitor Range | 10.10.0.101 - 10.10.0.199 |
| Frontend Port | 3000 |
| Backend Port | 8080 |

---

## 5. กติกาและข้อห้าม

- ห้ามใช้อินเทอร์เน็ต และห้ามใช้อุปกรณ์สื่อสารหรืออุปกรณ์เก็บข้อมูลภายนอก
- ข้อสอบจริงเป็นภาษาอังกฤษ
- ผู้เข้าแข่งขันต้องรันระบบของตนเองให้เข้าถึงได้จากเครือข่ายภายในห้อง
- การแข่งขันใช้เวลา 6 ชั่วโมง ไม่มีการขยายเวลา ยกเว้นเหตุฉุกเฉิน
- Frontend ต้องเชื่อมต่อ Backend API เท่านั้น
- ห้าม Frontend เชื่อมต่อ Database โดยตรง
- ห้ามใช้ external font, CDN หรือ cloud hosting
- ต้องรองรับ seed data ที่กำหนด
- ระบบต้องเข้าถึงได้จาก Local Exam Box ตลอดการแข่งขัน

---

## 6. เกณฑ์การประเมิน

| หัวข้อ | Judgement | Measurement | รวม |
|---|---|---|---|
| Backend API | 8 | 32 | 40 |
| Frontend UX/UI | 10 | 15 | 25 |
| Integration & Business Rules | 3 | 17 | 20 |
| Deployment in LAN | 1 | 9 | 10 |
| Code Quality & Maintainability | 5 | 0 | 5 |
| Total | 27 | 73 | 100 |

---

## 7. รูบริกเชิงรายละเอียด

| หมวด | เกณฑ์ย่อย | คะแนน |
|---|---|---|
| Backend API | Authentication and Authorization | 10.0 |
| Backend API | Candidate APIs | 8.0 |
| Backend API | Judge and Manager APIs | 18.0 |
| Backend API | API Quality | 4.0 |
| Frontend | Login and Route Guard | 3.5 |
| Frontend | Candidate Dashboard | 5.5 |
| Frontend | Judge Dashboard | 8.0 |
| Frontend | Manager Dashboard | 7.0 |
| Frontend | Responsive and Accessible Frontend | 1.0 |
| Integration | Session Lifecycle Rules | 4.0 |
| Integration | Submission and Access Rules | 9.0 |
| Integration | Result Flow | 7.0 |
| Deployment | LAN Reachability | 6.0 |
| Deployment | Offline Compliance and Stability | 4.0 |
| Code Quality | Code Structure and Naming | 3.0 |
| Code Quality | Maintainability and Handover Readiness | 2.0 |

---

## 8. นโยบายการตรวจสอบอัตโนมัติ

### API Layer
- ใช้ Newman สำหรับตรวจสอบ Endpoint
- ตรวจสอบ Authentication และ Role Access
- ตรวจสอบ Response Schema และระบบรายงานผล

### UI Layer
- ใช้ Playwright ตรวจสอบ Login Flow
- ตรวจสอบ Role-based Routing
- ตรวจสอบ Dashboard และ Submission Flow

### Infrastructure Layer
- ตรวจสอบ Reachability ผ่าน LAN
- ตรวจสอบ No External Dependency
- ตรวจสอบ Runtime Availability

### Evidence Layer
- จัดเก็บ Screenshots
- Logs
- Grading timestamps สำหรับ Audit

---

## 9. ขั้นตอนวันแข่งขัน

### 9.1 ก่อนเริ่มการแข่งขัน
- ตรวจสอบ Local Exam Box
- ตรวจสอบ Network Plan
- ตรวจสอบบัญชี Judge และ Manager
- ทดสอบ Dry-run
- เตรียม Backup

### 9.2 เมื่อเริ่มการแข่งขัน
- เปิด Session และเริ่มจับเวลา

### 9.3 ระหว่างการแข่งขัน
- พัฒนาระบบบนเครื่องตนเอง
- ทดสอบผ่าน LAN
- ส่ง Frontend URL และ Backend URL

### 9.4 เมื่อสิ้นสุดการแข่งขัน
- ปิด Session
- ระบบตรวจอัตโนมัติเริ่มทำงาน
- ตรวจสอบ Abnormal Cases
- ยืนยันคะแนนสุดท้าย

### 9.5 หลังสิ้นสุดการแข่งขัน
- Export Reports
- Backup ข้อมูล
- Chief Expert ตรวจสอบผลคะแนน

---

## 10. เอกสารส่งมอบจากผู้เข้าแข่งขัน

- Frontend URL
- Backend API Base URL
- Source code folder
- Database/Seed files
- README สำหรับการรันระบบ

---

# ภาคผนวก A - บัญชีพอร์ตและเงื่อนไขเครือข่าย

| รายการ | ข้อกำหนด |
|---|---|
| Frontend | http://10.10.0.xxx:3000 |
| Backend API | http://10.10.0.xxx:8080/api |
| Allowed Network | LAN ภายในศูนย์เท่านั้น |
| Disallowed | Cloud, CDN ภายนอก, third-party API |

---

# ใบสั่งงาน

## การแข่งขันฝีมือแรงงานแห่งชาติ ครั้งที่ 31 ระดับภาค
### สาขาเทคโนโลยีเว็บ

ประกอบด้วย

1. คำสั่งให้ผู้เข้าแข่งขันปฏิบัติงานสร้างเว็บไซต์ตามเงื่อนไข
2. ระยะเวลาแข่งขัน 6 ชั่วโมง
3. ข้อสอบเป็นภาษาอังกฤษ ไม่มีการแปลไทย
4. ต้องส่ง Frontend URL และ Backend API Base URL

---

# กำหนดการการแข่งขัน

## วันที่ 7 กรกฎาคม 2569

| เวลา | รายการ |
|---|---|
| 09.00 – 12.00 | ประชุมคณะทำงาน |
| 12.00 – 13.00 | พักกลางวัน |
| 13.00 – 16.00 | เตรียมสถานที่และอุปกรณ์ |
| 16.00 – 18.00 | ประชุมรายงานความก้าวหน้า |

## วันที่ 8 กรกฎาคม 2569

| เวลา | รายการ |
|---|---|
| 08.30 – 12.00 | ลงทะเบียนและพิธีเปิด |
| 12.00 – 13.00 | พักกลางวัน |
| 13.00 – 17.00 | ชี้แจงกติกาและทดลองเครื่องมือ |

## วันที่ 9 กรกฎาคม 2569

| เวลา | รายการ |
|---|---|
| 08.00 – 08.30 | ลงทะเบียน |
| 08.30 – 09.00 | อธิบายข้อสอบ |
| 09.00 – 12.00 | แข่งขัน |
| 12.00 – 13.00 | พักกลางวัน |
| 13.00 – 16.00 | แข่งขันต่อ |
| 17.00 – 20.00 | ตรวจผลงาน |

## วันที่ 10 กรกฎาคม 2569

| เวลา | รายการ |
|---|---|
| 09.00 – 12.00 | ตรวจผลงานและรับรองผล |
| 12.00 – 13.00 | พักกลางวัน |

> หมายเหตุ: กำหนดการอาจเปลี่ยนแปลงตามความเหมาะสม
