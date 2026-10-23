const express = require('express');
const router = express.Router();
const startupController = require('../controllers/startupController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes (General user functionality)
router.get('/', startupController.getStartups);
router.get('/:id', startupController.getStartupById);

// Protected routes (Admin panel functionality)
router.post('/', authMiddleware, startupController.createStartup);
router.put('/:id', authMiddleware, startupController.updateStartup);
router.delete('/:id', authMiddleware, startupController.deleteStartup);

module.exports = router;
