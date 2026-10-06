const { pool } = require('../config/database');

const getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      `SELECT f.id, f.created_at, d.* FROM favorites f
       JOIN destinations d ON d.id = f.destination_id
       WHERE f.user_id = ? ORDER BY f.created_at DESC`,
      [userId]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching favorites.' });
  }
};

const addFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { destination_id } = req.body;
    if (!destination_id) return res.status(400).json({ success: false, message: 'destination_id required.' });

    const [existing] = await pool.query(
      'SELECT id FROM favorites WHERE user_id = ? AND destination_id = ?', [userId, destination_id]
    );
    if (existing.length) return res.status(400).json({ success: false, message: 'Already in favorites.' });

    await pool.query('INSERT INTO favorites (user_id, destination_id) VALUES (?, ?)', [userId, destination_id]);
    res.status(201).json({ success: true, message: 'Added to favorites!' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error adding favorite.' });
  }
};

const removeFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    await pool.query('DELETE FROM favorites WHERE (id = ? OR destination_id = ?) AND user_id = ?', [id, id, userId]);
    res.json({ success: true, message: 'Removed from favorites.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error removing favorite.' });
  }
};

const checkFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { destinationId } = req.params;
    const [rows] = await pool.query(
      'SELECT id FROM favorites WHERE user_id = ? AND destination_id = ?', [userId, destinationId]
    );
    res.json({ success: true, data: { isFavorite: rows.length > 0 } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error checking favorite.' });
  }
};

module.exports = { getFavorites, addFavorite, removeFavorite, checkFavorite };
