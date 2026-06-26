-- =========================================================================
-- Regional Competition 2026 - Web Technologies
-- Starter Database Schema & Seed Data (Updated Version)
-- =========================================================================

-- 1. สร้างตารางข้อมูลผู้ใช้งาน (Users / Candidates / Judges / Managers)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL, -- Roles: 'candidate', 'judge', 'manager'
    full_name VARCHAR(100) NOT NULL,
    candidate_code VARCHAR(20) NULL
);

-- 2. สร้างตารางสถานะของเซสชันสอบ (Sessions)
CREATE TABLE sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    status VARCHAR(20) NOT NULL DEFAULT 'initialized', -- Status: 'initialized', 'active', 'closed'
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. สร้างตารางรายละเอียดโจทย์ (Tasks)
CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT
);

-- 4. สร้างตารางการส่งผลงาน (Submissions)
CREATE TABLE submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    candidate_id INT NOT NULL,
    task_id INT NOT NULL,
    frontend_url VARCHAR(255),
    backend_url VARCHAR(255),
    status VARCHAR(20) DEFAULT 'submitted', -- Status: 'submitted', 'recheck', 'confirmed'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES users(id),
    FOREIGN KEY (task_id) REFERENCES tasks(id)
);

-- 5. สร้างตารางผลคะแนน (Results)
CREATE TABLE results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    submission_id INT NOT NULL,
    score DECIMAL(5,2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'pending', -- Status: 'pending', 'confirmed'
    FOREIGN KEY (submission_id) REFERENCES submissions(id)
);

-- =========================================================================
-- SEED DATA (ข้อมูลเริ่มต้นบังคับ ห้ามผู้เข้าแข่งขันลบหรือแก้ไขรหัสผ่าน)
-- =========================================================================

-- เพิ่มข้อมูลบัญชีผู้ใช้งานระบบ (รหัสผ่านเป็นแบบ Plain-text ผู้เข้าแข่งสามารถนำไปเข้ารหัสเองได้หากต้องการ)
INSERT INTO users (username, password, role, full_name, candidate_code) VALUES
('admin', 'password', 'judge', 'Chief Expert', NULL), 
('manager', 'password', 'manager', 'Center Manager', NULL),
('candidate1', '123456', 'candidate', 'Competitor One', 'C01'),
('candidate2', '123456', 'candidate', 'Competitor Two', 'C02');

-- เพิ่มสถานะเริ่มต้นของห้องสอบ
INSERT INTO sessions (status) VALUES ('initialized');

-- เพิ่มข้อมูลโจทย์การแข่งขัน
INSERT INTO tasks (title, description) VALUES 
('Web Technologies 2026', 'Build a Test Submission Management System');

-- เพิ่มข้อมูลจำลองเพื่อให้ระบบมีข้อมูลตั้งต้น (Dummy Data)
INSERT INTO submissions (candidate_id, task_id, frontend_url, backend_url, status) VALUES 
(3, 1, 'http://10.0.0.1:3000', 'http://10.0.0.1:8000/api', 'submitted');

INSERT INTO results (submission_id, score, status) VALUES 
(1, 45.50, 'pending');