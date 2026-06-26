// ตัวกลางสำหรับคุยกับ backend — ทุกหน้า import ตัวนี้ไปใช้ยิง API
// เทียบกับตัวเต็ม: services/api.js
import axios from 'axios';

// ที่อยู่ของ backend (ตัวเต็มอ่านค่านี้จากไฟล์ .env แต่เวอร์ชันนี้เขียนตรงๆ ให้เห็นชัด)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
});

// interceptor = โค้ดที่ axios จะรันให้ "ทุกครั้งก่อนส่ง request ออกไป"
// หน้าที่: แนบ token ไปใน header อัตโนมัติ → ไม่ต้องแนบเองทุกจุดที่เรียก API (มี ~15 จุด)
// สำคัญ: ต้องอ่าน token ใหม่ทุกครั้งแบบนี้ เพราะถ้าอ่านครั้งเดียวตอนเปิดเว็บ
// ตอนนั้นยังไม่ได้ login → token จะเป็นค่าว่างค้างไปตลอด
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = 'Bearer ' + token;
  return config;
});

export default api;
