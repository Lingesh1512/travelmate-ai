const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

const getProfile = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.email, u.phone, u.role, u.profile_image, u.favorite_style, u.bio, u.created_at,
              COUNT(DISTINCT t.id) as total_trips, COUNT(DISTINCT f.id) as saved_destinations,
              COALESCE(SUM(t.budget), 0) as total_budget
       FROM users u
       LEFT JOIN trips t ON t.user_id = u.id
       LEFT JOIN favorites f ON f.user_id = u.id
       WHERE u.id = ? GROUP BY u.id`,
      [req.user.id]
    );
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching profile.' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone, favorite_style, bio, profile_image } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (favorite_style !== undefined) updates.favorite_style = favorite_style;
    if (bio !== undefined) updates.bio = bio;
    if (profile_image !== undefined) updates.profile_image = profile_image;

    if (!Object.keys(updates).length) {
      return res.status(400).json({ success: false, message: 'No fields to update.' });
    }

    const fields = Object.keys(updates);
    const values = Object.values(updates);
    await pool.query(
      `UPDATE users SET ${fields.map(f => `${f} = ?`).join(', ')}, updated_at = NOW() WHERE id = ?`,
      [...values, req.user.id]
    );
    res.json({ success: true, message: 'Profile updated!' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating profile.' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      return res.status(400).json({ success: false, message: 'Both passwords required.' });
    }
    if (new_password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    const [rows] = await pool.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    const isMatch = await bcrypt.compare(current_password, rows[0].password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Current password is incorrect.' });

    const hashed = await bcrypt.hash(new_password, 10);
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashed, req.user.id]);
    res.json({ success: true, message: 'Password changed successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error changing password.' });
  }
};

module.exports = { getProfile, updateProfile, changePassword };
