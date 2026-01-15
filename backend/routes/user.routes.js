const express = require('express');
const router = express.Router();
const { syncUser, getAllUsers } = require('../controllers/user.controller');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Sync firebase user with database
router.post('/sync', syncUser);

// Fetch all employees for the admins
router.get('/', protect, adminOnly, getAllUsers);

module.exports = router;