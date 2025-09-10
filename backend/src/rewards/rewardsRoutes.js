const express = require('express');
const router = express.Router();
const controller = require('./rewardsController');

router.get('/:uid', controller.getUserRewards);
router.post('/:uid', controller.updateUserRewards);

module.exports = router;