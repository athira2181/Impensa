const pool = require('../config/database').default;

const createIncome = async (req, res) => {
  try {
    const {
      category_id,
      amount,
      income_date,
      source,
      notes,
      is_recurring,
      recurrence_frequency,
      recurrence_end_date
    } = req.body;

    if (!category_id || !amount || !income_date) {
      return res.status(400).json({
        message: 'category_id, amount, and income_date are required'
      });
    }

    const connection = await pool.getConnection();

    try {
      const [result] = await connection.query(
        `INSERT INTO income 
        (user_id, category_id, amount, income_date, source, notes, 
         is_recurring, recurrence_frequency, recurrence_end_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          req.user.id,
          category_id,
          amount,
          income_date,
          source || null,
          notes || null,
          is_recurring || false,
          recurrence_frequency || null,
          recurrence_end_date || null
        ]
      );

      res.status(201).json({
        message: 'Income created successfully',
        incomeId: result.insertId
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Create income error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getIncome = async (req, res) => {
  try {
    const { month, year, category_id, startDate, endDate } = req.query;
    const connection = await pool.getConnection();

    try {
      let query = `
        SELECT i.*, c.name as category_name
        FROM income i
        LEFT JOIN categories c ON i.category_id = c.id
        WHERE i.user_id = ?
      `;

      const params = [req.user.id];

      if (month && year) {
        query += ` AND MONTH(i.income_date) = ? AND YEAR(i.income_date) = ?`;
        params.push(month, year);
      }

      if (startDate && endDate) {
        query += ` AND i.income_date BETWEEN ? AND ?`;
        params.push(startDate, endDate);
      }

      if (category_id) {
        query += ` AND i.category_id = ?`;
        params.push(category_id);
      }

      query += ` ORDER BY i.income_date DESC`;

      const [income] = await connection.query(query, params);
      res.json(income);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get income error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateIncome = async (req, res) => {
  try {
    const { id } = req.params;
    const { category_id, amount, income_date, source, notes } = req.body;

    const connection = await pool.getConnection();

    try {
      const [incomes] = await connection.query(
        'SELECT id FROM income WHERE id = ? AND user_id = ?',
        [id, req.user.id]
      );

      if (incomes.length === 0) {
        return res.status(404).json({ message: 'Income record not found' });
      }

      await connection.query(
        `UPDATE income SET 
         category_id = ?, amount = ?, income_date = ?, source = ?, notes = ?
         WHERE id = ? AND user_id = ?`,
        [category_id, amount, income_date, source || null, notes || null, id, req.user.id]
      );

      res.json({ message: 'Income updated successfully' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Update income error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteIncome = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();

    try {
      const [incomes] = await connection.query(
        'SELECT id FROM income WHERE id = ? AND user_id = ?',
        [id, req.user.id]
      );

      if (incomes.length === 0) {
        return res.status(404).json({ message: 'Income record not found' });
      }

      await connection.query(
        'DELETE FROM income WHERE id = ? AND user_id = ?',
        [id, req.user.id]
      );

      res.json({ message: 'Income deleted successfully' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Delete income error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createIncome,
  getIncome,
  updateIncome,
  deleteIncome
};