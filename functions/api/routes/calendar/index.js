const express = require('express');
const router = express.Router();
const { checkUser } = require('../../../middlewares/auth');

router.get('/', checkUser, require('./calendarContentGET')); // 유저가 작성한 모든 Calendar 가져오기
router.get('/detail', checkUser, require('./calendarGET')); // 일정 기한 내 Calendar 가져오기

module.exports = router;
