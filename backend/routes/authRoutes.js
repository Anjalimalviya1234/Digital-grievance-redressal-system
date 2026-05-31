const express = require('express');
const router = express.Router();
const { register, login, getProfile, protect } = require('../controllers/authController');
const { validateBody } = require('../middlewares/validate');

// auth routes
router.post('/register', validateBody(['name', 'email', 'password']), register);
router.post('/login', validateBody(['email', 'password']), login);
router.get('/profile', protect, getProfile);

module.exports = router;
