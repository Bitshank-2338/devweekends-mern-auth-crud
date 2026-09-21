const express = require('express');
const { register, login, getMe } = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

// Open: these are how a user gets a token in the first place.
router.post('/register', register);
router.post('/login', login);

// Protected: needs the token the two routes above handed out.
router.get('/me', protect, getMe);

module.exports = router;
