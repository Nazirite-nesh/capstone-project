const { validationResult } = require('express-validator');
const { error } = require('../utils/apiResponse');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return error(res, 400, errors.array()[0].msg);
  }
  next();
};

module.exports = validateRequest;
