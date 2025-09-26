const router = require('express').Router();
const controller = require('./profile.controller');
const { authenticate } = require('../middleware/authenticate');

router.get('/me', authenticate, controller.getMe);
router.patch('/me', authenticate, controller.patchMe);

module.exports = router;