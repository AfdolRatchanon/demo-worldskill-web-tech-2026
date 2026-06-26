// จุดเริ่มต้นของ backend — ตั้งค่า Express แล้วผูก route ทั้งหมดไว้ใต้ /api
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

app.use(cors());            // ให้ frontend คนละ origin เรียก API ได้
app.use(express.json());    // อ่าน body ที่เป็น JSON
app.use(morgan('short'));   // log request ใน terminal

// ผูกแต่ละกลุ่ม route (ทุกอันขึ้นต้นด้วย /api)
app.use('/api', require('./routes/auth'));
app.use('/api', require('./routes/config'));
app.use('/api', require('./routes/tasks'));
app.use('/api', require('./routes/submissions'));
app.use('/api', require('./routes/results'));
app.use('/api', require('./routes/candidates'));
app.use('/api', require('./routes/session'));
// app.use('/api', require('./routes/statistics'));
// app.use('/api', require('./routes/report'));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
