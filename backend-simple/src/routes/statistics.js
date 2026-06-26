const router      = require('express').Router();
const authenticate = require('../middlewares/auth');
const authorize   = require('../middlewares/role');
const ctrl        = require('../controllers/statisticsController');

router.get('/statistics/summary', authenticate, authorize('manager'), ctrl.getSummary);
router.get('/statistics/ranking', authenticate, authorize('manager'), ctrl.getRanking);
router.get('/statistics/status',  authenticate, authorize('manager'), ctrl.getStatus);

module.exports = router;
