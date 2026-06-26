// กำหนดเส้นทาง (routing) ของทั้งแอป — URL ไหนแสดงหน้าอะไร
// เทียบกับตัวเต็ม: App.jsx + router/ProtectedRoute.jsx (รวมไว้ไฟล์เดียว)
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { getUser } from './auth';
import Login from './pages/Login';
import CandidatePage from './pages/CandidatePage';
import JudgePage from './pages/JudgePage';
import ManagerPage from './pages/ManagerPage';

// ยามเฝ้าประตู: ถ้ายังไม่ login หรือ role ไม่ตรงกับหน้านี้ → ส่งกลับไปหน้า login
function ProtectedRoute({ role, children }) {
  const user = getUser();
  if (!user || user.role !== role) return <Navigate to="/login" />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/candidate" element={
          <ProtectedRoute role="candidate"><CandidatePage /></ProtectedRoute>
        } />
        <Route path="/judge" element={
          <ProtectedRoute role="judge"><JudgePage /></ProtectedRoute>
        } />
        <Route path="/manager" element={
          <ProtectedRoute role="manager"><ManagerPage /></ProtectedRoute>
        } />
        {/* URL อื่นๆ ที่ไม่รู้จัก → เด้งไปหน้า login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}
