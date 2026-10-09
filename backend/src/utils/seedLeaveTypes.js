require('dotenv').config();
const mongoose = require('mongoose');
const LeaveType = require('../models/LeaveType');

const leaveTypes = [
  { name: 'Annual Leave', defaultDaysAllowed: 15, description: 'Paid yearly vacation leave' },
  { name: 'Sick Leave', defaultDaysAllowed: 7, description: 'Paid leave for illness' },
  { name: 'Unpaid Leave', defaultDaysAllowed: 30, description: 'Leave without pay' },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding');

    for (const type of leaveTypes) {
      const exists = await LeaveType.findOne({ name: type.name });
      if (!exists) {
        await LeaveType.create(type);
        console.log(`Created leave type: ${type.name}`);
      } else {
        console.log(`Already exists: ${type.name}`);
      }
    }

    console.log('Seeding complete');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exit(1);
  }
};

seed();
