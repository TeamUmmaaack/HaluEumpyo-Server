const express = require('express');
const router = express.Router();

router.post('/signin', require('./emailSignInPOST'));
router.post('/signup', require('./emailSignUpPOST'));
router.get('/token', require('./tokenGET'));

module.exports = router;
