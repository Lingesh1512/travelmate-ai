const { pool } = require('../config/database');

const getExpenses = async (req, res) => {
  try {
    const { tripId } = req.params;
    const userId = req.user.id;
    const [rows] = await pool.query(
      'SELECT * FROM expenses WHERE trip_id = ? AND user_id = ? ORDER BY expense_date DESC',
      [tripId, userId]
    );

    // Category summary
    const summary = {};
    rows.forEach(e => {
      summary[e.category] = (summary[e.category] || 0) + parseFloat(e.amount);
    });
    const total = rows.reduce((sum, e) => sum + parseFloat(e.amount), 0);

    res.json({ success: true, data: { expenses: rows, summary, total } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching expenses.' });
  }
};

const addExpense = async (req, res) => {
  try {
    const userId = req.user.id;
    const { trip_id, category, description, amount, expense_date, notes } = req.body;
    if (!trip_id || !category || !amount || !expense_date) {
      return res.status(400).json({ success: false, message: 'Required fields missing.' });
    }

    const [result] = await pool.query(
      'INSERT INTO expenses (trip_id, user_id, category, description, amount, expense_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [trip_id, userId, category, description, amount, expense_date, notes || null]
    );
    const [newExp] = await pool.query('SELECT * FROM expenses WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Expense added!', data: newExp[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error adding expense.' });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    await pool.query('DELETE FROM expenses WHERE id = ? AND user_id = ?', [id, userId]);
    res.json({ success: true, message: 'Expense deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting expense.' });
  }
};

module.exports = { getExpenses, addExpense, deleteExpense };
