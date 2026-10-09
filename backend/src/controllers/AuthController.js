const User = require('../models/User');
const LeaveType = require('../models/LeaveType');
const LeaveBalance = require('../models/LeaveBalance');
const { hashPassword, comparePassword } = require('../utils/hashPassword');
const generateToken = require('../utils/generateToken');
const { success, error } = require('../utils/apiResponse');

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, password } = req.body;
    const email = req.body.email.trim().toLowerCase();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return error(res, 409, 'An account with this email already exists');
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'employee',
    });

    // Auto-create leave balances for every leave type on registration
    try {
      const leaveTypes = await LeaveType.find();
      const balanceRecords = leaveTypes.map((type) => ({
        employee: user._id,
        leaveType: type._id,
        allocated: type.defaultDaysAllowed,
        used: 0,
      }));
      await LeaveBalance.insertMany(balanceRecords);
    } catch (balanceErr) {
      // Roll back so we don't leave a user without balances
      await User.findByIdAndDelete(user._id);
      throw balanceErr;
    }

    const token = generateToken(user._id, user.role);

    return success(res, 201, 'Account created successfully', {
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return error(res, 409, 'An account with this email already exists');
    }
    return error(res, 500, 'Unable to create account');
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { password } = req.body;
    const email = req.body.email.trim().toLowerCase();

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return error(res, 401, 'Invalid email or password');
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return error(res, 401, 'Invalid email or password');
    }

    const token = generateToken(user._id, user.role);

    return success(res, 200, 'Login successful', {
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    return error(res, 500, 'Something went wrong. Please try again');
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return error(res, 404, 'User not found');
    }
    return success(res, 200, 'Current user retrieved', user);
  } catch (err) {
    console.error(err);
    return error(res, 500, 'Unable to retrieve current user');
  }
};

module.exports = { register, login, getMe };
