const router = require('express').Router();
const controller = require('./profile.controller');
const { auth } = require('../middleware/auth');

router.get('/me', auth, controller.getMe);
router.patch('/me', auth, controller.patchMe);

module.exports = router;