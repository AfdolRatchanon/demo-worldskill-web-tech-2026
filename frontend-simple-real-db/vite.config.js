// ตั้งค่า Vite (เครื่องมือรันโปรเจกต์ React) — บอกแค่ว่าใช้ React และเปิดที่ port 3000
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react(), {
    name: 'vite-logger-middleware',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // แสดงผล Log ใน Terminal คล้าย morgan (Method + URL)
        console.log(`[Vite Dev] ${req.method} ${req.url}`);
        next();
      });
    },
  },],
});
