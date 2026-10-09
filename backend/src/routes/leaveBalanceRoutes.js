const express = require('express');
const router = express.Router();
const { getMyLeaveBalance } = require('../controllers/leaveBalanceController');
const { protect } = require('../middleware/auth');

router.get('/me', protect, getMyLeaveBalance);

module.exports = router;
