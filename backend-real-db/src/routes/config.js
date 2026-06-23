const router      = require('express').Router();
const authenticate = require('../middlewares/auth');
const { getConfig } = require('../controllers/configController');

router.get('/config', authenticate, getConfig);

module.exports = router;
