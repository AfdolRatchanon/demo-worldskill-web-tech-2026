// จัดการ token (บัตรผ่านที่ได้ตอน login) — เก็บไว้ใน localStorage ของ browser
// เทียบกับตัวเต็ม: contexts/AuthContext.jsx ใช้ Context API แชร์ข้อมูล user ให้ทุก component
// เวอร์ชันนี้ใช้ฟังก์ชันธรรมดาอ่านจาก localStorage ตรงๆ — ผลเหมือนกัน แต่เข้าใจง่ายกว่า

export function saveToken(token) {
  localStorage.setItem('token', token);
}

export function getUser() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  // token เป็น JWT หน้าตาแบบ "xxx.yyy.zzz" — ส่วนกลาง (yyy) คือข้อมูล user เข้ารหัสแบบ base64
  // atob = ถอดรหัส base64 กลับเป็นข้อความ แล้ว JSON.parse แปลงเป็น object
  return JSON.parse(atob(token.split('.')[1]));
}

export function removeToken() {
  localStorage.removeItem('token');
}
