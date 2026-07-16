const pool = require('../config/database').default;

const getDashboardStats = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    try {
      // Get monthly income
      const [incomeData] = await connection.query(
        `SELECT SUM(amount) as total FROM income 
         WHERE user_id = ? AND MONTH(income_date) = ? AND YEAR(income_date) = ?`,
        [req.user.id, currentMonth, currentYear]
      );

      // Get monthly expenses
      const [expenseData] = await connection.query(
        `SELECT SUM(amount) as total FROM expenses 
         WHERE user_id = ? AND MONTH(expense_date) = ? AND YEAR(expense_date) = ?`,
        [req.user.id, currentMonth, currentYear]
      );

      // Get budget
      const [budgetData] = await connection.query(
        `SELECT * FROM budgets WHERE user_id = ? AND month = ? AND year = ?`,
        [req.user.id, currentMonth, currentYear]
      );

      // Get active subscriptions
      const [subscriptionsData] = await connection.query(
        `SELECT COUNT(*) as count FROM subscriptions 
         WHERE user_id = ? AND is_active = true`,
        [req.user.id]
      );

      // Get outstanding lent money
      const [lentData] = await connection.query(
        `SELECT SUM(amount) as total FROM lent_money 
         WHERE user_id = ? AND status != 'Completed'`,
        [req.user.id]
      );

      // Get outstanding borrowed money
      const [borrowedData] = await connection.query(
        `SELECT SUM(amount) as total FROM borrowed_money 
         WHERE user_id = ? AND status != 'Completed'`,
        [req.user.id]
      );

      // Get total investments
      const [investmentData] = await connection.query(
        `SELECT SUM(invested_amount) as total FROM investments WHERE user_id = ?`,
        [req.user.id]
      );

      // Get recent transactions
      const [recentTransactions] = await connection.query(
        `SELECT 'expense' as type, e.amount, e.expense_date as date, c.name as category 
         FROM expenses e
         LEFT JOIN categories c ON e.category_id = c.id
         WHERE e.user_id = ?
         UNION ALL
         SELECT 'income' as type, i.amount, i.income_date as date, c.name as category 
         FROM income i
         LEFT JOIN categories c ON i.category_id = c.id
         WHERE i.user_id = ?
         ORDER BY date DESC LIMIT 10`,
        [req.user.id, req.user.id]
      );

      const monthlyIncome = incomeData[0]?.total || 0;
      const monthlyExpenses = expenseData[0]?.total || 0;
      const budget = budgetData[0]?.monthly_budget || 0;
      const remaining = Math.max(0, budget - monthlyExpenses);
      const savings = monthlyIncome - monthlyExpenses;

      res.json({
        monthlyIncome,
        monthlyExpenses,
        budget,
        remaining,
        savings,
        activeSubscriptions: subscriptionsData[0]?.count || 0,
        outstandingLent: lentData[0]?.total || 0,
        outstandingBorrowed: borrowedData[0]?.total || 0,
        totalInvestments: investmentData[0]?.total || 0,
        recentTransactions
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getDashboardStats
};