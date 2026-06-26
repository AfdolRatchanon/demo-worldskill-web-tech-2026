const router      = require('express').Router();
const authenticate = require('../middlewares/auth');
const { login, logout } = require('../controllers/authController');

router.post('/login',  login);
router.post('/logout', authenticate, logout);

module.exports = router;
