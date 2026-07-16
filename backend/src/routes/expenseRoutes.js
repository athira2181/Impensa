const express = require('express');
const router = express.Router();
const {
  createExpense,
  getExpenses,
  updateExpense,
  deleteExpense
} = require('../controllers/expenseController');
const authMiddleware = require('../middlewares/auth');

// All routes require authentication
router.use(authMiddleware);

router.post('/', createExpense);
router.get('/', getExpenses);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

module.exports = router;