const express = require('express');
const router = express.Router();
const { getExpenses, addExpense, deleteExpense } = require('../controllers/expense.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);
router.get('/:tripId', getExpenses);
router.post('/', addExpense);
router.delete('/:id', deleteExpense);

module.exports = router;
