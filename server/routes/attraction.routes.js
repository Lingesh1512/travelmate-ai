const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticate, adminOnly } = require('../middleware/auth.middleware');

router.get('/', async (req, res) => {
  try {
    const { destination_id } = req.query;
    let where = '1=1';
    let params = [];
    if (destination_id) { where = 'destination_id = ?'; params = [destination_id]; }
    const [rows] = await pool.query(`SELECT * FROM attractions WHERE ${where} ORDER BY rating DESC`, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching attractions.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM attractions WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Not found.' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching attraction.' });
  }
});

router.post('/', authenticate, adminOnly, async (req, res) => {
  try {
    const { destination_id, name, description, category, rating, entry_fee, opening_hours, latitude, longitude, image } = req.body;
    if (!destination_id || !name) return res.status(400).json({ success: false, message: 'destination_id and name required.' });
    const [result] = await pool.query(
      'INSERT INTO attractions (destination_id, name, description, category, rating, entry_fee, opening_hours, latitude, longitude, image) VALUES (?,?,?,?,?,?,?,?,?,?)',
      [destination_id, name, description || null, category || null, rating || 4, entry_fee || 0, opening_hours || null, latitude || null, longitude || null, image || null]
    );
    res.status(201).json({ success: true, data: { id: result.insertId } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error creating attraction.' });
  }
});

router.put('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const fields = Object.keys(req.body);
    const values = Object.values(req.body);
    if (!fields.length) return res.status(400).json({ success: false, message: 'No fields.' });
    await pool.query(`UPDATE attractions SET ${fields.map(f => `${f} = ?`).join(', ')} WHERE id = ?`, [...values, req.params.id]);
    res.json({ success: true, message: 'Attraction updated!' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating attraction.' });
  }
});

router.delete('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    await pool.query('DELETE FROM attractions WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Attraction deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting attraction.' });
  }
});

module.exports = router;
