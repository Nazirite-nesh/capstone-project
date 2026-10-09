const { body } = require('express-validator');

const createLeaveRequestValidation = [
  body('leaveType').notEmpty().withMessage('Leave type is required')
    .isMongoId().withMessage('Invalid leave type ID'),
  body('startDate').notEmpty().withMessage('Start date is required')
    .isISO8601().withMessage('Start date must be a valid date'),
  body('endDate').notEmpty().withMessage('End date is required')
    .isISO8601().withMessage('End date must be a valid date')
    .custom((endDate, { req }) => {
      if (new Date(endDate) < new Date(req.body.startDate)) {
        throw new Error('End date cannot be before start date');
      }
      return true;
    }),
  body('reason').optional().trim().isLength({ max: 300 }).withMessage('Reason is too long'),
];

module.exports = { createLeaveRequestValidation };
