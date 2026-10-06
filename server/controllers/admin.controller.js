const { pool } = require('../config/database');

// Dashboard Stats
const getDashboard = async (req, res) => {
  try {
    const [[users]] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = "user"');
    const [[trips]] = await pool.query('SELECT COUNT(*) as count FROM trips');
    const [[destinations]] = await pool.query('SELECT COUNT(*) as count FROM destinations');
    const [[totalBudget]] = await pool.query('SELECT COALESCE(SUM(budget), 0) as total FROM trips');
    const [[totalExpenses]] = await pool.query('SELECT COALESCE(SUM(amount), 0) as total FROM expenses');

    // Monthly trips (last 6 months)
    const [monthlyTrips] = await pool.query(
      `SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count 
       FROM trips WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
       GROUP BY month ORDER BY month ASC`
    );

    // Popular destinations
    const [popularDest] = await pool.query(
      `SELECT d.name, COUNT(t.id) as trip_count 
       FROM destinations d LEFT JOIN trips t ON t.destination_id = d.id
       GROUP BY d.id ORDER BY trip_count DESC LIMIT 5`
    );

    // Category distribution
    const [categoryDist] = await pool.query(
      `SELECT d.category, COUNT(t.id) as count FROM trips t
       JOIN destinations d ON d.id = t.destination_id
       GROUP BY d.category`
    );

    // Recent users
    const [recentUsers] = await pool.query(
      'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 5'
    );

    // Recent trips
    const [recentTrips] = await pool.query(
      `SELECT t.*, u.name as user_name FROM trips t
       JOIN users u ON u.id = t.user_id ORDER BY t.created_at DESC LIMIT 5`
    );

    res.json({
      success: true,
      data: {
        stats: {
          users: users.count,
          trips: trips.count,
          destinations: destinations.count,
          total_budget: totalBudget.total,
          total_expenses: totalExpenses.total
        },
        monthly_trips: monthlyTrips,
        popular_destinations: popularDest,
        category_distribution: categoryDist,
        recent_users: recentUsers,
        recent_trips: recentTrips
      }
    });
  } catch (err) {
    console.error('Admin dashboard error:', err);
    res.status(500).json({ success: false, message: 'Error fetching admin dashboard.' });
  }
};

// Get All Users
const getUsers = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let where = '1=1';
    let params = [];
    if (search) {
      where = '(name LIKE ? OR email LIKE ?)';
      params = [`%${search}%`, `%${search}%`];
    }

    const [users] = await pool.query(
      `SELECT u.id, u.name, u.email, u.phone, u.role, u.is_active, u.created_at,
              COUNT(DISTINCT t.id) as trip_count
       FROM users u LEFT JOIN trips t ON t.user_id = u.id
       WHERE ${where} GROUP BY u.id ORDER BY u.created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    const [[{ total }]] = await pool.query(`SELECT COUNT(*) as total FROM users WHERE ${where}`, params);

    res.json({ success: true, data: users, pagination: { total: parseInt(total), page: parseInt(page) } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching users.' });
  }
};

// Update User
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, is_active } = req.body;
    const updates = [];
    const values = [];
    if (role !== undefined) { updates.push('role = ?'); values.push(role); }
    if (is_active !== undefined) { updates.push('is_active = ?'); values.push(is_active); }
    if (!updates.length) return res.status(400).json({ success: false, message: 'No fields to update.' });
    await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, [...values, id]);
    res.json({ success: true, message: 'User updated!' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating user.' });
  }
};

// Delete User
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (id == req.user.id) return res.status(400).json({ success: false, message: 'Cannot delete your own account.' });
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ success: true, message: 'User deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting user.' });
  }
};

// Get All Trips (admin)
const getAllTrips = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let where = ['1=1'];
    let params = [];
    if (search) {
      where.push('(t.trip_name LIKE ? OR t.destination_name LIKE ? OR u.name LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (status) { where.push('t.status = ?'); params.push(status); }

    const [trips] = await pool.query(
      `SELECT t.*, u.name as user_name, u.email as user_email
       FROM trips t JOIN users u ON u.id = t.user_id
       WHERE ${where.join(' AND ')} ORDER BY t.created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM trips t JOIN users u ON u.id = t.user_id WHERE ${where.join(' AND ')}`,
      params
    );

    res.json({ success: true, data: trips, pagination: { total: parseInt(total), page: parseInt(page) } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching trips.' });
  }
};

module.exports = { getDashboard, getUsers, updateUser, deleteUser, getAllTrips };
