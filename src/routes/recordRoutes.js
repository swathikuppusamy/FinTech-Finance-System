const express = require('express');
const router = express.Router();
const recordController = require('../controllers/recordController');
const { authenticate, authorize } = require('../middleware/auth');

// All record routes require authentication
router.use(authenticate);

// Read access: all roles
router.get('/', recordController.getRecords);
router.get('/:id', recordController.getRecordById);

// Write access: admin only
router.post('/', authorize('admin'), recordController.createRecord);
router.patch('/:id', authorize('admin'), recordController.updateRecord);
router.delete('/:id', authorize('admin'), recordController.deleteRecord);

module.exports = router;
