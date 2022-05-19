const express = require('express');
const router = express.Router();

router.get('/:userId', require('./CalendarGET'));

module.exports = router;
