const express = require('express');
const router = express.Router();
const { signup, login, getMe, updateMe, getAllUsers, updateUserRole } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.get('/users', protect, admin, getAllUsers);
router.put('/users/:id/role', protect, admin, updateUserRole);

module.exports = router;