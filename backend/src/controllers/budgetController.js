const pool = require('../config/database').default;

const getBudget = async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const budgetMonth = month || currentMonth;
    const budgetYear = year || currentYear;

    const connection = await pool.getConnection();

    try {
      const [budgets] = await connection.query(
        'SELECT * FROM budgets WHERE user_id = ? AND month = ? AND year = ?',
        [req.user.id, budgetMonth, budgetYear]
      );

      if (budgets.length === 0) {
        return res.json({
          message: 'No budget set for this month',
          budget: null
        });
      }

      res.json(budgets[0]);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get budget error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createOrUpdateBudget = async (req, res) => {
  try {
    const { monthly_salary, monthly_budget, savings_target, month, year } = req.body;

    if (!monthly_budget) {
      return res.status(400).json({ message: 'monthly_budget is required' });
    }

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const budgetMonth = month || currentMonth;
    const budgetYear = year || currentYear;

    const connection = await pool.getConnection();

    try {
      const [existing] = await connection.query(
        'SELECT id FROM budgets WHERE user_id = ? AND month = ? AND year = ?',
        [req.user.id, budgetMonth, budgetYear]
      );

      if (existing.length > 0) {
        await connection.query(
          `UPDATE budgets SET 
           monthly_salary = ?, monthly_budget = ?, savings_target = ?
           WHERE user_id = ? AND month = ? AND year = ?`,
          [monthly_salary || null, monthly_budget, savings_target || null, req.user.id, budgetMonth, budgetYear]
        );
        res.json({ message: 'Budget updated successfully' });
      } else {
        await connection.query(
          `INSERT INTO budgets 
           (user_id, monthly_salary, monthly_budget, savings_target, month, year)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [req.user.id, monthly_salary || null, monthly_budget, savings_target || null, budgetMonth, budgetYear]
        );
        res.status(201).json({ message: 'Budget created successfully' });
      }
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Create/Update budget error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getBudget,
  createOrUpdateBudget
};