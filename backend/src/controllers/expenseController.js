const pool = require('../config/database').default;

const createExpense = async (req, res) => {
  try {
    const {
      category_id,
      subcategory_id,
      payment_method_id,
      event_id,
      amount,
      expense_date,
      description,
      tags,
      is_recurring,
      recurrence_frequency,
      recurrence_end_date
    } = req.body;

    if (!category_id || !amount || !expense_date) {
      return res.status(400).json({
        message: 'category_id, amount, and expense_date are required'
      });
    }

    const connection = await pool.getConnection();

    try {
      const [result] = await connection.query(
        `INSERT INTO expenses 
        (user_id, category_id, subcategory_id, payment_method_id, event_id, amount, 
         expense_date, description, tags, is_recurring, recurrence_frequency, recurrence_end_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          req.user.id,
          category_id,
          subcategory_id || null,
          payment_method_id || null,
          event_id || null,
          amount,
          expense_date,
          description || null,
          tags ? JSON.stringify(tags) : null,
          is_recurring || false,
          recurrence_frequency || null,
          recurrence_end_date || null
        ]
      );

      res.status(201).json({
        message: 'Expense created successfully',
        expenseId: result.insertId
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getExpenses = async (req, res) => {
  try {
    const { month, year, category_id, event_id, payment_method_id, startDate, endDate } = req.query;
    const connection = await pool.getConnection();

    try {
      let query = `
        SELECT e.*, 
               c.name as category_name, 
               s.name as subcategory_name,
               pm.method_name as payment_method,
               ev.name as event_name
        FROM expenses e
        LEFT JOIN categories c ON e.category_id = c.id
        LEFT JOIN subcategories s ON e.subcategory_id = s.id
        LEFT JOIN payment_methods pm ON e.payment_method_id = pm.id
        LEFT JOIN events ev ON e.event_id = ev.id
        WHERE e.user_id = ?
      `;

      const params = [req.user.id];

      if (month && year) {
        query += ` AND MONTH(e.expense_date) = ? AND YEAR(e.expense_date) = ?`;
        params.push(month, year);
      }

      if (startDate && endDate) {
        query += ` AND e.expense_date BETWEEN ? AND ?`;
        params.push(startDate, endDate);
      }

      if (category_id) {
        query += ` AND e.category_id = ?`;
        params.push(category_id);
      }

      if (event_id) {
        query += ` AND e.event_id = ?`;
        params.push(event_id);
      }

      if (payment_method_id) {
        query += ` AND e.payment_method_id = ?`;
        params.push(payment_method_id);
      }

      query += ` ORDER BY e.expense_date DESC`;

      const [expenses] = await connection.query(query, params);

      // Parse JSON tags
      const expensesWithParsedTags = expenses.map(exp => ({
        ...exp,
        tags: exp.tags ? JSON.parse(exp.tags) : []
      }));

      res.json(expensesWithParsedTags);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      category_id,
      subcategory_id,
      payment_method_id,
      event_id,
      amount,
      expense_date,
      description,
      tags
    } = req.body;

    const connection = await pool.getConnection();

    try {
      // Verify ownership
      const [expenses] = await connection.query(
        'SELECT id FROM expenses WHERE id = ? AND user_id = ?',
        [id, req.user.id]
      );

      if (expenses.length === 0) {
        return res.status(404).json({ message: 'Expense not found' });
      }

      await connection.query(
        `UPDATE expenses SET 
         category_id = ?, subcategory_id = ?, payment_method_id = ?, event_id = ?,
         amount = ?, expense_date = ?, description = ?, tags = ?
         WHERE id = ? AND user_id = ?`,
        [
          category_id,
          subcategory_id || null,
          payment_method_id || null,
          event_id || null,
          amount,
          expense_date,
          description || null,
          tags ? JSON.stringify(tags) : null,
          id,
          req.user.id
        ]
      );

      res.json({ message: 'Expense updated successfully' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();

    try {
      const [expenses] = await connection.query(
        'SELECT id FROM expenses WHERE id = ? AND user_id = ?',
        [id, req.user.id]
      );

      if (expenses.length === 0) {
        return res.status(404).json({ message: 'Expense not found' });
      }

      await connection.query(
        'DELETE FROM expenses WHERE id = ? AND user_id = ?',
        [id, req.user.id]
      );

      res.json({ message: 'Expense deleted successfully' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createExpense,
  getExpenses,
  updateExpense,
  deleteExpense
};