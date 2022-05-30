const express = require('express');
const router = express.Router();
const { checkUser } = require('../../../middlewares/auth');

router.post('/signin', require('./emailSignInPOST'));
router.post('/signup', require('./emailSignUpPOST'));

module.exports = router;
