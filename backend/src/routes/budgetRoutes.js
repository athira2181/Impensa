const express = require('express');
const router = express.Router();
const {
  getBudget,
  createOrUpdateBudget
} = require('../controllers/budgetController');
const authMiddleware = require('../middlewares/auth');

router.use(authMiddleware);

router.get('/', getBudget);
router.post('/', createOrUpdateBudget);
router.put('/', createOrUpdateBudget);

module.exports = router;