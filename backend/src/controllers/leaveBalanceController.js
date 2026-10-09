const LeaveBalance = require('../models/LeaveBalance');
const { success, error } = require('../utils/apiResponse');

// GET /api/leave-balance/me
const getMyLeaveBalance = async (req, res) => {
  try {
    const balances = await LeaveBalance.find({ employee: req.user.id })
      .populate('leaveType', 'name');

    // Skip balances whose leave type was deleted (populate returns null)
    const formatted = balances
      .filter((b) => b.leaveType)
      .map((b) => ({
        leaveTypeId: b.leaveType._id,
        leaveType: b.leaveType.name,
        allocated: b.allocated,
        used: b.used,
        remaining: b.allocated - b.used,
      }));

    return success(res, 200, 'Leave balance retrieved', formatted);
  } catch (err) {
    console.error(err);
    return error(res, 500, 'Unable to retrieve leave balance');
  }
};

module.exports = { getMyLeaveBalance };
