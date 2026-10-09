const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { notFound, globalErrorHandler } = require('./middleware/errorHandler');
const authRoutes = require('./routes/authRoutes');
const leaveTypeRoutes = require('./routes/leaveTypeRoutes');
const leaveRequestRoutes = require('./routes/leaveRequestRoutes');
const managerRoutes = require('./routes/managerRoutes');
const leaveBalanceRoutes = require('./routes/leaveBalanceRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ success: true, message: 'Leave Management API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/leave-types', leaveTypeRoutes);
app.use('/api/leave-requests', leaveRequestRoutes);
app.use('/api/manager', managerRoutes);
app.use('/api/leave-balance', leaveBalanceRoutes);
app.use('/api/admin/users', userRoutes);

// Must come after all routes
app.use(notFound);
app.use(globalErrorHandler);

module.exports = app;