const router      = require('express').Router();
const authenticate = require('../middlewares/auth');
const authorize   = require('../middlewares/role');
const { getCandidates } = require('../controllers/candidatesController');

router.get('/candidates', authenticate, authorize('judge'), getCandidates);

module.exports = router;
