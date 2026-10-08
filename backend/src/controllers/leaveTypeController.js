const mongoose = require('mongoose');
const LeaveType = require('../models/LeaveType');
const LeaveBalance = require('../models/LeaveBalance');
const LeaveRequest = require('../models/LeaveRequest');
const User = require('../models/User');
const { success, error } = require('../utils/apiResponse');

// Case-insensitive match, so "Annual Leave" and "annual leave" count as duplicates
const findByName = (name) =>
  LeaveType.findOne({ name }).collation({ locale: 'en', strength: 2 });

// GET /api/leave-types
const getLeaveTypes = async (req, res) => {
  try {
    const leaveTypes = await LeaveType.find().sort({ name: 1 });
    return success(res, 200, 'Leave types retrieved', leaveTypes);
  } catch (err) {
    console.error(err);
    return error(res, 500, 'Unable to retrieve leave types');
  }
};

// POST /api/admin/leave-types
const createLeaveType = async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const { defaultDaysAllowed, description } = req.body;

    if (!name) {
      return error(res, 400, 'Leave type name is required');
    }

    const exists = await findByName(name);
    if (exists) {
      return error(res, 409, 'A leave type with this name already exists');
    }

    const leaveType = await LeaveType.create({ name, defaultDaysAllowed, description });

    // Give every existing user a balance for the new leave type
    // (register only creates balances for types that existed at sign-up)
    try {
      const users = await User.find().select('_id');
      if (users.length > 0) {
        await LeaveBalance.insertMany(
          users.map((u) => ({
            employee: u._id,
            leaveType: leaveType._id,
            allocated: leaveType.defaultDaysAllowed,
            used: 0,
          }))
        );
      }
    } catch (balanceErr) {
      // Roll back so we don't leave a leave type without balances
      await LeaveType.findByIdAndDelete(leaveType._id);
      await LeaveBalance.deleteMany({ leaveType: leaveType._id });
      throw balanceErr;
    }

    return success(res, 201, 'Leave type created', leaveType);
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return error(res, 409, 'A leave type with this name already exists');
    }
    if (err.name === 'ValidationError') {
      return error(res, 400, err.message);
    }
    return error(res, 500, 'Unable to create leave type');
  }
};

// PUT /api/admin/leave-types/:id
const updateLeaveType = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return error(res, 400, 'Invalid leave type ID');
    }

    // Only allow these fields to be changed (stops clients overwriting anything else)
    const updates = {};
    if (req.body.name !== undefined) {
      updates.name = String(req.body.name).trim();
      if (!updates.name) {
        return error(res, 400, 'Leave type name cannot be empty');
      }
    }
    if (req.body.defaultDaysAllowed !== undefined) {
      updates.defaultDaysAllowed = req.body.defaultDaysAllowed;
    }
    if (req.body.description !== undefined) {
      updates.description = req.body.description;
    }

    if (Object.keys(updates).length === 0) {
      return error(res, 400, 'No valid fields provided to update');
    }

    // Prevent renaming to a name another leave type already uses
    if (updates.name) {
      const duplicate = await findByName(updates.name);
      if (duplicate && duplicate._id.toString() !== req.params.id) {
        return error(res, 409, 'A leave type with this name already exists');
      }
    }

    // Note: changing defaultDaysAllowed only affects employees who register
    // afterwards. Existing balances keep their current allocated value.
    const leaveType = await LeaveType.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!leaveType) {
      return error(res, 404, 'Leave type not found');
    }

    return success(res, 200, 'Leave type updated', leaveType);
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return error(res, 409, 'A leave type with this name already exists');
    }
    if (err.name === 'ValidationError') {
      return error(res, 400, err.message);
    }
    return error(res, 500, 'Unable to update leave type');
  }
};

// DELETE /api/admin/leave-types/:id
const deleteLeaveType = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return error(res, 400, 'Invalid leave type ID');
    }

    // Don't delete a leave type that has requests, because the
    // request history would lose its leave type
    const inUse = await LeaveRequest.exists({ leaveType: req.params.id });
    if (inUse) {
      return error(res, 409, 'Cannot delete a leave type that has leave requests');
    }

    const leaveType = await LeaveType.findByIdAndDelete(req.params.id);

    if (!leaveType) {
      return error(res, 404, 'Leave type not found');
    }

    // Remove the balances that belonged to this leave type
    await LeaveBalance.deleteMany({ leaveType: leaveType._id });

    return success(res, 200, 'Leave type deleted', null);
  } catch (err) {
    console.error(err);
    return error(res, 500, 'Unable to delete leave type');
  }
};

module.exports = { getLeaveTypes, createLeaveType, updateLeaveType, deleteLeaveType };
