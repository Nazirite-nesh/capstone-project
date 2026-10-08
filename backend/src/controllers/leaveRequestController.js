const mongoose = require('mongoose');
const LeaveRequest = require('../models/LeaveRequest');
const LeaveBalance = require('../models/LeaveBalance');
const { success, error } = require('../utils/apiResponse');

// Must match the status values in your LeaveRequest model
const VALID_STATUSES = ['pending', 'approved', 'rejected', 'cancelled'];

// Helper: number of days between two Date objects (inclusive)
const calculateDays = (start, end) => {
  const diffTime = end - start;
  return Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

// POST /api/leave-requests
const createLeaveRequest = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;
    const employeeId = req.user.id;

    if (!mongoose.isValidObjectId(leaveType)) {
      return error(res, 400, 'Invalid leave type');
    }

    // Validate dates (previously end < start was silently accepted)
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return error(res, 400, 'Please provide valid dates');
    }
    if (end < start) {
      return error(res, 400, 'End date cannot be before start date');
    }

    const days = calculateDays(start, end);

    const balance = await LeaveBalance.findOne({ employee: employeeId, leaveType });
    if (!balance) {
      return error(res, 404, 'No balance found for this leave type');
    }

    // Count days already tied up in pending requests, so an employee
    // cannot submit several pending requests that exceed their balance
    const pendingRequests = await LeaveRequest.find({
      employee: employeeId,
      leaveType,
      status: 'pending',
    }).select('days');
    const pendingDays = pendingRequests.reduce((sum, r) => sum + r.days, 0);

    const available = balance.allocated - balance.used - pendingDays;
    if (days > available) {
      return error(res, 400, `Insufficient balance. You have ${available} day(s) available`);
    }

    // Prevent overlapping requests
    const overlapping = await LeaveRequest.findOne({
      employee: employeeId,
      status: { $in: ['pending', 'approved'] },
      startDate: { $lte: end },
      endDate: { $gte: start },
    });
    if (overlapping) {
      return error(res, 409, 'You already have a request covering these dates');
    }

    const leaveRequest = await LeaveRequest.create({
      employee: employeeId,
      leaveType,
      startDate: start,
      endDate: end,
      days,
      reason,
    });

    return success(res, 201, 'Leave request submitted', leaveRequest);
  } catch (err) {
    console.error(err);
    return error(res, 500, 'Unable to submit leave request');
  }
};

// GET /api/leave-requests/me
const getMyLeaveRequests = async (req, res) => {
  try {
    const { status } = req.query;

    // Sanitize pagination (handles NaN, negatives and huge limits)
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);

    if (status && !VALID_STATUSES.includes(status)) {
      return error(res, 400, 'Invalid status filter');
    }

    const filter = { employee: req.user.id };
    if (status) {
      filter.status = status;
    }

    const skip = (page - 1) * limit;

    const [requests, total] = await Promise.all([
      LeaveRequest.find(filter)
        .populate('leaveType', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      LeaveRequest.countDocuments(filter),
    ]);

    return success(res, 200, 'Leave requests retrieved', {
      requests,
      pagination: {
        currentPage: page,
        pageSize: limit,
        totalRecords: total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error(err);
    return error(res, 500, 'Unable to retrieve leave requests');
  }
};

// DELETE /api/leave-requests/:id
const cancelLeaveRequest = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return error(res, 400, 'Invalid request ID');
    }

    const request = await LeaveRequest.findById(req.params.id);

    if (!request) {
      return error(res, 404, 'Leave request not found');
    }

    if (request.employee.toString() !== req.user.id) {
      return error(res, 403, "You cannot cancel another employee's request");
    }

    if (request.status !== 'pending') {
      return error(res, 400, 'Only pending requests can be cancelled');
    }

    request.status = 'cancelled';
    await request.save();

    return success(res, 200, 'Leave request cancelled', request);
  } catch (err) {
    console.error(err);
    return error(res, 500, 'Unable to cancel leave request');
  }
};

module.exports = { createLeaveRequest, getMyLeaveRequests, cancelLeaveRequest };
