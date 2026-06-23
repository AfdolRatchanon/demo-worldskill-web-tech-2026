const router = require('express').Router();
const authenticate = require('../middlewares/auth');
const authorize = require('../middlewares/role');
const ctrl = require('../controllers/submissionsController');

router.get('/my-submission', authenticate, authorize('candidate'), ctrl.getMySubmission);
router.post('/my-submission', authenticate, authorize('candidate'), ctrl.createSubmission);
router.put('/my-submission', authenticate, authorize('candidate'), ctrl.updateSubmission);
router.get('/submissions', authenticate, authorize('judge'), ctrl.getAllSubmissions);
router.post('/submissions/:id/recheck', authenticate, authorize('judge'), ctrl.recheckSubmission);

module.exports = router;
