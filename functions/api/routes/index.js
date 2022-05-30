const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth'));
//  /diary라는 요청이 들어오면 .diary로 보내라
router.use('/diary', require('./diary'));

router.use('/calendar', require('./calendar'));

module.exports = router; //생성한 router 객체를 모듈로 반환
