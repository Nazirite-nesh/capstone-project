const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { registerValidation, loginValidation } = require('../validations/authValidation');
const validateRequest = require('../middleware/validateRequest');
const { protect } = require('../middleware/auth');

router.post('/register', registerValidation, validateRequest, register);
router.post('/login', loginValidation, validateRequest, login);

router.get('/me', protect, getMe);

module.exports = router;
