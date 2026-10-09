const express = require('express');
const router = express.Router();
const { getAllUsers, assignManager, updateUserRole } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin'), getAllUsers);
router.put('/:id/assign-manager', protect, authorize('admin'), assignManager);

router.put('/:id/role', protect, authorize('admin'), updateUserRole);

module.exports = router;
