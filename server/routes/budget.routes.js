const express = require('express');
const router = express.Router();
const { getBudget, updateBudget } = require('../controllers/budget.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);
router.get('/:tripId', getBudget);
router.put('/:tripId', updateBudget);

module.exports = router;
