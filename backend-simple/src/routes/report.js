const router      = require('express').Router();
const authenticate = require('../middlewares/auth');
const authorize   = require('../middlewares/role');
const { getReport } = require('../controllers/reportController');

router.get('/report', authenticate, authorize('manager'), getReport);

module.exports = router;
