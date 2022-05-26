const express = require('express');
const router = express.Router();

router.get('/:userId', require('./CalendarGET')); // 일정 기한 내 Calendar 가져오기
router.get('/:userId/diary', require('./CalendarContentGET')); // 유저가 작성한 모든 Calendar 가져오기

module.exports = router;
