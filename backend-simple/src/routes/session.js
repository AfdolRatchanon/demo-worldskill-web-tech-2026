const router      = require('express').Router();
const authenticate = require('../middlewares/auth');
const authorize   = require('../middlewares/role');
const { startSession, closeSession } = require('../controllers/sessionController');

router.put('/session/start', authenticate, authorize('judge'), startSession);
router.put('/session/close', authenticate, authorize('judge'), closeSession);

module.exports = router;
