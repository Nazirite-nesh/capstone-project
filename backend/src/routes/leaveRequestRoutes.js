const express = require('express');
const router = express.Router();
const {
  createLeaveRequest,
  getMyLeaveRequests,
  cancelLeaveRequest,
} = require('../controllers/leaveRequestController');
const { protect } = require('../middleware/auth');
const { createLeaveRequestValidation } = require('../validations/leaveRequestValidation');
const validateRequest = require('../middleware/validateRequest');

router.post('/', protect, createLeaveRequestValidation, validateRequest, createLeaveRequest);
router.get('/me', protect, getMyLeaveRequests);
router.delete('/:id', protect, cancelLeaveRequest);

module.exports = router;
