const express = require('express');
const router = express.Router();
const controller = require('./rewardsController');

router.get('/:uid', controller.getUserRewards);
router.post('/:uid/redeem', controller.redeemReward);
router.post('/:uid/badge', controller.addBadge);

router.get('/leaderboard/all', controller.getLeaderboard);

module.exports = router;