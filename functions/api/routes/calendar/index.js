const express = require('express');
const router = express.Router();

router.get('/:userId', require('./CalendarGet'));

module.exports = router;
