const express = require('express');
const router = express.Router();

router.use('/diary', require('./diary'));

module.exports = router;
