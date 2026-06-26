const jwt    = require('jsonwebtoken');
const pool   = require('../config/db');

async function login(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    const [rows] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);
    const user = rows[0];

    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, full_name: user.full_name, candidate_code: user.candidate_code },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ success: true, data: { token, role: user.role, full_name: user.full_name, candidate_code: user.candidate_code }, meta: {} });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function logout(req, res) {
  try {
    res.json({ success: true, data: null, meta: {} });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

module.exports = { login, logout };
