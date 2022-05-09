const express = require('express');
const router = express.Router();

router.post('/', require('./DiaryPOST'));

module.exports = router;
