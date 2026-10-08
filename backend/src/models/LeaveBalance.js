const mongoose = require('mongoose');

const leaveBalanceSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    leaveType: { type: mongoose.Schema.Types.ObjectId, ref: 'LeaveType', required: true },
    allocated: { type: Number, required: true, min: 0 },
    used: { type: Number, required: true, default: 0, min: 0 },
  },
  { timestamps: true }
);

// One balance record per employee per leave type
leaveBalanceSchema.index({ employee: 1, leaveType: 1 }, { unique: true });

module.exports = mongoose.model('LeaveBalance', leaveBalanceSchema);
