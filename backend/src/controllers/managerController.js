const LeaveRequest = require('../models/LeaveRequest');
const LeaveBalance = require('../models/LeaveBalance');
const User = require('../models/User');
const { success, error } = require('../utils/apiResponse');

// Returns true if the reviewer is allowed to act on this employee's request
const canReview = async (reviewer, employeeId) => {
  if (reviewer.role === 'admin') return true;
  const employee = await User.findById(employeeId).select('manager');
  return employee && employee.manager && employee.manager.toString() === reviewer.id;
};

// GET /api/manager/leave-requests
const getTeamLeaveRequests = async (req, res) => {
  try {
    const managerId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    const teamMembers = await User.find({ manager: managerId }).select('_id');
    const teamIds = teamMembers.map((u) => u._id);

    const filter = { employee: { $in: teamIds } };
    if (status) {
      filter.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [requests, total] = await Promise.all([
      LeaveRequest.find(filter)
        .populate('employee', 'name email')
        .populate('leaveType', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      LeaveRequest.countDocuments(filter),
    ]);

    return success(res, 200, 'Team leave requests retrieved', {
      requests,
      pagination: {
        currentPage: Number(page),
        pageSize: Number(limit),
        totalRecords: total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    return error(res, 500, 'Unable to retrieve team leave requests');
  }
};

// PUT /api/manager/leave-requests/:id/approve
const approveLeaveRequest = async (req, res) => {
  try {
    const request = await LeaveRequest.findById(req.params.id);

    if (!request) {
      return error(res, 404, 'Leave request not found');
    }

    if (!(await canReview(req.user, request.employee))) {
      return error(res, 403, 'This request does not belong to your team');
    }

    if (request.status !== 'pending') {
      return error(res, 400, 'Only pending requests can be approved');
    }

    const balance = await LeaveBalance.findOne({
      employee: request.employee,
      leaveType: request.leaveType,
    });

    if (!balance || balance.allocated - balance.used < request.days) {
      return error(res, 400, 'Employee no longer has sufficient balance');
    }

    balance.used += request.days;
    await balance.save();

        request.status = 'approved';
    request.reviewedBy = req.user.id;
    request.managerComment = req.body.managerComment || '';
    await request.save();

    return success(res, 200, 'Leave request approved', request);
  } catch (err) {
    return error(res, 500, 'Unable to approve leave request');
  }
};

// PUT /api/manager/leave-requests/:id/reject
const rejectLeaveRequest = async (req, res) => {
  try {
    const request = await LeaveRequest.findById(req.params.id);

    if (!request) {
      return error(res, 404, 'Leave request not found');
    }

    if (!(await canReview(req.user, request.employee))) {
      return error(res, 403, 'This request does not belong to your team');
    }

    if (request.status !== 'pending') {
      return error(res, 400, 'Only pending requests can be rejected');
    }

        request.status = 'rejected';
    request.reviewedBy = req.user.id;
    request.managerComment = req.body.managerComment || '';
    await request.save();

    return success(res, 200, 'Leave request rejected', request);
  } catch (err) {
    return error(res, 500, 'Unable to reject leave request');
  }
};

module.exports = { getTeamLeaveRequests, approveLeaveRequest, rejectLeaveRequest };
