const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

// All user management routes are admin-only
router.use(authenticate, authorize('admin'));

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.patch('/:id', userController.updateUser);

module.exports = router;
