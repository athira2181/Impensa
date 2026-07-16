const express = require('express');
const router = express.Router();
const {
  createIncome,
  getIncome,
  updateIncome,
  deleteIncome
} = require('../controllers/incomeController');
const authMiddleware = require('../middlewares/auth');

router.use(authMiddleware);

router.post('/', createIncome);
router.get('/', getIncome);
router.put('/:id', updateIncome);
router.delete('/:id', deleteIncome);

module.exports = router;