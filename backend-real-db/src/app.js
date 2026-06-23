require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan')
const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('short'));

app.use('/api', require('./routes/auth'));
app.use('/api', require('./routes/config'));
app.use('/api', require('./routes/tasks'));
app.use('/api', require('./routes/submissions'));
app.use('/api', require('./routes/results'));
app.use('/api', require('./routes/candidates'));
app.use('/api', require('./routes/session'));
app.use('/api', require('./routes/statistics'));
app.use('/api', require('./routes/report'));

const { ensureSchema } = require('./config/schema');

const PORT = process.env.PORT || 8080;

// เติม schema ที่จำเป็น (started_at) ให้เรียบร้อยก่อน แล้วค่อยเปิดเซิร์ฟเวอร์
ensureSchema()
  .catch((err) => console.error('[schema] ensureSchema failed:', err.message))
  .finally(() => {
    app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
  });
