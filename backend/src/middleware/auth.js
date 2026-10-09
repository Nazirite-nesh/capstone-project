const jwt = require('jsonwebtoken');
const { error } = require('../utils/apiResponse');

// Verifies the JWT and attaches the user info to req.user
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return error(res, 401, 'Not authorized, no token provided');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    return error(res, 401, 'Not authorized, invalid or expired token');
  }
};

// Restricts a route to specific roles, e.g. authorize('manager', 'admin')
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return error(res, 403, 'You do not have permission to perform this action');
    }
    next();
  };
};

module.exports = { protect, authorize };
