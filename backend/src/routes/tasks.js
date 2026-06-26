const router      = require('express').Router();
const authenticate = require('../middlewares/auth');
const { getTasks } = require('../controllers/tasksController');

router.get('/tasks', authenticate, getTasks);

module.exports = router;
