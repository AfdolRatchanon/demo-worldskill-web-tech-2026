const router = require('express').Router();
const authenticate = require('../middlewares/auth');
const authorize = require('../middlewares/role');
const { getMyResult, confirmResult } = require('../controllers/resultsController');

router.get('/my-result', authenticate, authorize('candidate'), getMyResult);
router.put('/results/:candidate_id/confirm', authenticate, authorize('judge'), confirmResult);

module.exports = router;
