const { pool } = require('../config/database');

// ─── GET ALL DESTINATIONS ─────────────────────────────────
const getDestinations = async (req, res) => {
  try {
    const { search, category, country, minBudget, maxBudget, minRating, sort, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let where = ['1=1'];
    let params = [];

    if (search) {
      where.push('(d.name LIKE ? OR d.country LIKE ? OR d.state LIKE ? OR d.city LIKE ?)');
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }
    if (category) { where.push('d.category = ?'); params.push(category); }
    if (country) { where.push('d.country = ?'); params.push(country); }
    if (minBudget) { where.push('d.average_budget >= ?'); params.push(minBudget); }
    if (maxBudget) { where.push('d.average_budget <= ?'); params.push(maxBudget); }
    if (minRating) { where.push('d.rating >= ?'); params.push(minRating); }

    let orderBy = 'd.is_featured DESC, d.rating DESC';
    if (sort === 'rating') orderBy = 'd.rating DESC';
    else if (sort === 'budget_low') orderBy = 'd.average_budget ASC';
    else if (sort === 'budget_high') orderBy = 'd.average_budget DESC';
    else if (sort === 'popular') orderBy = 'd.visit_count DESC';
    else if (sort === 'newest') orderBy = 'd.created_at DESC';

    const whereClause = where.join(' AND ');

    const [destinations] = await pool.query(
      `SELECT d.*, 
              (SELECT COUNT(*) FROM favorites f WHERE f.destination_id = d.id) as favorite_count
       FROM destinations d
       WHERE ${whereClause}
       ORDER BY ${orderBy}
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM destinations d WHERE ${whereClause}`,
      params
    );

    res.json({
      success: true,
      data: destinations,
      pagination: { total: parseInt(total), page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    console.error('getDestinations error:', err);
    res.status(500).json({ success: false, message: 'Error fetching destinations.' });
  }
};

// ─── GET DESTINATION BY ID ────────────────────────────────
const getDestinationById = async (req, res) => {
  try {
    const { id } = req.params;

    const [destinations] = await pool.query(
      `SELECT d.*, 
              (SELECT COUNT(*) FROM favorites f WHERE f.destination_id = d.id) as favorite_count,
              (SELECT COUNT(*) FROM trips t WHERE t.destination_id = d.id) as trip_count
       FROM destinations d WHERE d.id = ?`,
      [id]
    );

    if (!destinations.length) {
      return res.status(404).json({ success: false, message: 'Destination not found.' });
    }

    const [attractions] = await pool.query(
      'SELECT * FROM attractions WHERE destination_id = ? ORDER BY rating DESC',
      [id]
    );

    // Update visit count
    await pool.query('UPDATE destinations SET visit_count = visit_count + 1 WHERE id = ?', [id]);

    res.json({ success: true, data: { ...destinations[0], attractions } });
  } catch (err) {
    console.error('getDestinationById error:', err);
    res.status(500).json({ success: false, message: 'Error fetching destination.' });
  }
};

// ─── CREATE DESTINATION (admin) ───────────────────────────
const createDestination = async (req, res) => {
  try {
    const fields = ['name', 'country', 'state', 'description', 'long_description', 'category', 'rating',
      'average_budget', 'best_time', 'climate', 'language', 'currency', 'image', 'latitude', 'longitude',
      'is_featured', 'travel_tips', 'local_food', 'emergency_numbers', 'safety_tips'];
    const values = fields.map(f => req.body[f] ?? null);

    const [result] = await pool.query(
      `INSERT INTO destinations (${fields.join(', ')}) VALUES (${fields.map(() => '?').join(', ')})`,
      values
    );

    res.status(201).json({ success: true, message: 'Destination created!', data: { id: result.insertId } });
  } catch (err) {
    console.error('createDestination error:', err);
    res.status(500).json({ success: false, message: 'Error creating destination.' });
  }
};

// ─── UPDATE DESTINATION (admin) ───────────────────────────
const updateDestination = async (req, res) => {
  try {
    const { id } = req.params;
    const fields = Object.keys(req.body);
    const values = Object.values(req.body);

    if (!fields.length) return res.status(400).json({ success: false, message: 'No fields to update.' });

    await pool.query(
      `UPDATE destinations SET ${fields.map(f => `${f} = ?`).join(', ')}, updated_at = NOW() WHERE id = ?`,
      [...values, id]
    );

    res.json({ success: true, message: 'Destination updated!' });
  } catch (err) {
    console.error('updateDestination error:', err);
    res.status(500).json({ success: false, message: 'Error updating destination.' });
  }
};

// ─── DELETE DESTINATION (admin) ───────────────────────────
const deleteDestination = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM destinations WHERE id = ?', [id]);
    res.json({ success: true, message: 'Destination deleted.' });
  } catch (err) {
    console.error('deleteDestination error:', err);
    res.status(500).json({ success: false, message: 'Error deleting destination.' });
  }
};

// ─── GET FEATURED DESTINATIONS ────────────────────────────
const getFeaturedDestinations = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM destinations WHERE is_featured = TRUE ORDER BY rating DESC LIMIT 8'
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching featured destinations.' });
  }
};

module.exports = { getDestinations, getDestinationById, createDestination, updateDestination, deleteDestination, getFeaturedDestinations };
