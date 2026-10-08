const User = require('../models/User');
const { success, error } = require('../utils/apiResponse');

// GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').populate('manager', 'name email');
    return success(res, 200, 'Users retrieved', users);
  } catch (err) {
    return error(res, 500, 'Unable to retrieve users');
  }
};

// PUT /api/admin/users/:id/assign-manager
const assignManager = async (req, res) => {
  try {
    const { managerId } = req.body;

    const manager = await User.findById(managerId);
    if (!manager || !['manager', 'admin'].includes(manager.role)) {
      return error(res, 400, 'Invalid manager ID');
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { manager: managerId },
      { new: true }
    ).select('-password');

    if (!user) {
      return error(res, 404, 'User not found');
    }

    return success(res, 200, 'Manager assigned', user);
  } catch (err) {
    return error(res, 500, 'Unable to assign manager');
  }
};

// PUT /api/admin/users/:id/role
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!['employee', 'manager', 'admin'].includes(role)) {
      return error(res, 400, 'Invalid role');
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return error(res, 404, 'User not found');
    }

    return success(res, 200, 'User role updated', user);
  } catch (err) {
    return error(res, 500, 'Unable to update user role');
  }
};

module.exports = { getAllUsers, assignManager, updateUserRole };
