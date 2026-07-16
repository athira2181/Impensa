const pool = require('../config/database');

const getDashboardStats = async (req, res) => {
  try {
    console.log('📊 Dashboard stats request received');
    const connection = await pool.getConnection();
    
    try {
      // Get all expense data (no user filtering for now)
      console.log('🔎 Fetching expense data...');
      const [expenseData] = await connection.query(
        'SELECT SUM(amount) as total FROM expenses'
      );

      // Get all income data
      console.log('🔎 Fetching income data...');
      const [incomeData] = await connection.query(
        'SELECT SUM(amount) as total FROM income'
      );

      // Get all budget data
      console.log('🔎 Fetching budget data...');
      const [budgetData] = await connection.query(
        'SELECT SUM(monthly_budget) as total FROM budgets'
      );

      // Get recent transactions
      console.log('🔎 Fetching recent transactions...');
      const [recentTransactions] = await connection.query(
        `(SELECT 'expense' as type, amount, expense_date as date FROM expenses ORDER BY expense_date DESC LIMIT 5)
         UNION ALL
         (SELECT 'income' as type, amount, income_date as date FROM income ORDER BY income_date DESC LIMIT 5)
         ORDER BY date DESC LIMIT 10`
      );

      const totalExpenses = expenseData[0]?.total || 0;
      const totalIncome = incomeData[0]?.total || 0;
      const totalBudget = budgetData[0]?.total || 0;
      const balance = totalIncome - totalExpenses;

      console.log('✅ Dashboard stats calculated:', { totalIncome, totalExpenses, balance });
      
      res.json({
        message: 'Dashboard stats retrieved successfully',
        data: {
          totalIncome,
          totalExpenses,
          balance,
          totalBudget,
          recentTransactions
        }
      });
    } finally {
      console.log('🔌 Releasing database connection');
      connection.release();
    }
  } catch (error) {
    console.error('❌ Dashboard stats error:', {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      stack: error.stack
    });
    
    res.status(500).json({
      message: 'Failed to fetch dashboard stats: ' + error.message,
      code: 'DASHBOARD_ERROR'
    });
  }
};

module.exports = {
  getDashboardStats
};
