const express = require('express');
const router = express.Router();
const {
  createIncome,
  getIncome,
  updateIncome,
  deleteIncome
} = require('../controllers/incomeController');

// All routes - No authentication required for now
router.post('/', createIncome);
router.get('/', getIncome);
router.put('/:id', updateIncome);
router.delete('/:id', deleteIncome);

module.exports = router;
