const { pool } = require('../config/database');

const getBudget = async (req, res) => {
  try {
    const { tripId } = req.params;
    const [rows] = await pool.query('SELECT * FROM budget_plans WHERE trip_id = ?', [tripId]);
    const [expenses] = await pool.query(
      'SELECT category, SUM(amount) as total FROM expenses WHERE trip_id = ? GROUP BY category',
      [tripId]
    );
    res.json({ success: true, data: { budget: rows[0] || null, expenses } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching budget.' });
  }
};

const updateBudget = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { transportation, hotels, food, activities, shopping, miscellaneous } = req.body;
    const total = (transportation || 0) + (hotels || 0) + (food || 0) + (activities || 0) + (shopping || 0) + (miscellaneous || 0);

    const [existing] = await pool.query('SELECT id FROM budget_plans WHERE trip_id = ?', [tripId]);
    if (existing.length) {
      await pool.query(
        'UPDATE budget_plans SET transportation=?, hotels=?, food=?, activities=?, shopping=?, miscellaneous=?, total_budget=?, updated_at=NOW() WHERE trip_id=?',
        [transportation || 0, hotels || 0, food || 0, activities || 0, shopping || 0, miscellaneous || 0, total, tripId]
      );
    } else {
      await pool.query(
        'INSERT INTO budget_plans (trip_id, transportation, hotels, food, activities, shopping, miscellaneous, total_budget) VALUES (?,?,?,?,?,?,?,?)',
        [tripId, transportation || 0, hotels || 0, food || 0, activities || 0, shopping || 0, miscellaneous || 0, total]
      );
    }
    res.json({ success: true, message: 'Budget updated!', data: { total } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating budget.' });
  }
};

module.exports = { getBudget, updateBudget };
