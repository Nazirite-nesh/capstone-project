const express = require('express');
const router = express.Router();
const {
  getTeamLeaveRequests,
  approveLeaveRequest,
  rejectLeaveRequest,
} = require('../controllers/managerController');
const { protect, authorize } = require('../middleware/auth');

router.get('/leave-requests', protect, authorize('manager', 'admin'), getTeamLeaveRequests);
router.put('/leave-requests/:id/approve', protect, authorize('manager', 'admin'), approveLeaveRequest);
router.put('/leave-requests/:id/reject', protect, authorize('manager', 'admin'), rejectLeaveRequest);

module.exports = router;
