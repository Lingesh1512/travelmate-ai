const { pool } = require('../config/database');

// ─── GET ITINERARY BY TRIP ────────────────────────────────
const getItinerary = async (req, res) => {
  try {
    const { tripId } = req.params;
    const userId = req.user.id;

    const [trips] = await pool.query(
      'SELECT id FROM trips WHERE id = ? AND user_id = ?', [tripId, userId]
    );
    if (!trips.length) return res.status(404).json({ success: false, message: 'Trip not found.' });

    const [items] = await pool.query(
      'SELECT * FROM itinerary WHERE trip_id = ? ORDER BY day_number, start_time, sort_order',
      [tripId]
    );

    // Group by day
    const grouped = {};
    items.forEach(item => {
      if (!grouped[item.day_number]) grouped[item.day_number] = [];
      grouped[item.day_number].push(item);
    });

    res.json({ success: true, data: { items, grouped } });
  } catch (err) {
    console.error('getItinerary error:', err);
    res.status(500).json({ success: false, message: 'Error fetching itinerary.' });
  }
};

// ─── ADD ITINERARY ITEM ───────────────────────────────────
const addItineraryItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      trip_id, day_number, activity_name, description, activity_type,
      activity_date, start_time, end_time, estimated_cost,
      location_name, latitude, longitude, sort_order, notes
    } = req.body;

    if (!trip_id || !day_number || !activity_name) {
      return res.status(400).json({ success: false, message: 'trip_id, day_number, and activity_name are required.' });
    }

    const [trips] = await pool.query('SELECT id FROM trips WHERE id = ? AND user_id = ?', [trip_id, userId]);
    if (!trips.length) return res.status(404).json({ success: false, message: 'Trip not found.' });

    const [result] = await pool.query(
      `INSERT INTO itinerary (trip_id, day_number, activity_name, description, activity_type,
        activity_date, start_time, end_time, estimated_cost, location_name, latitude, longitude, sort_order, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [trip_id, day_number, activity_name, description || null, activity_type || 'general',
       activity_date || null, start_time || null, end_time || null,
       estimated_cost || 0, location_name || null, latitude || null, longitude || null,
       sort_order || 0, notes || null]
    );

    const [newItem] = await pool.query('SELECT * FROM itinerary WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Activity added!', data: newItem[0] });
  } catch (err) {
    console.error('addItineraryItem error:', err);
    res.status(500).json({ success: false, message: 'Error adding activity.' });
  }
};

// ─── UPDATE ITINERARY ITEM ────────────────────────────────
const updateItineraryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [items] = await pool.query(
      `SELECT i.* FROM itinerary i JOIN trips t ON t.id = i.trip_id WHERE i.id = ? AND t.user_id = ?`,
      [id, userId]
    );
    if (!items.length) return res.status(404).json({ success: false, message: 'Itinerary item not found.' });

    const allowed = ['day_number', 'activity_name', 'description', 'activity_type', 'activity_date',
      'start_time', 'end_time', 'estimated_cost', 'location_name', 'latitude', 'longitude', 'sort_order', 'notes'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    if (!Object.keys(updates).length) {
      return res.status(400).json({ success: false, message: 'No valid fields.' });
    }

    const fields = Object.keys(updates);
    const values = Object.values(updates);

    await pool.query(
      `UPDATE itinerary SET ${fields.map(f => `${f} = ?`).join(', ')} WHERE id = ?`,
      [...values, id]
    );

    const [updated] = await pool.query('SELECT * FROM itinerary WHERE id = ?', [id]);
    res.json({ success: true, message: 'Activity updated!', data: updated[0] });
  } catch (err) {
    console.error('updateItineraryItem error:', err);
    res.status(500).json({ success: false, message: 'Error updating activity.' });
  }
};

// ─── DELETE ITINERARY ITEM ────────────────────────────────
const deleteItineraryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [items] = await pool.query(
      `SELECT i.id FROM itinerary i JOIN trips t ON t.id = i.trip_id WHERE i.id = ? AND t.user_id = ?`,
      [id, userId]
    );
    if (!items.length) return res.status(404).json({ success: false, message: 'Itinerary item not found.' });

    await pool.query('DELETE FROM itinerary WHERE id = ?', [id]);
    res.json({ success: true, message: 'Activity deleted.' });
  } catch (err) {
    console.error('deleteItineraryItem error:', err);
    res.status(500).json({ success: false, message: 'Error deleting activity.' });
  }
};

// ─── BULK UPDATE (reorder) ────────────────────────────────
const reorderItinerary = async (req, res) => {
  try {
    const { items } = req.body; // [{ id, sort_order, day_number }]
    if (!Array.isArray(items)) return res.status(400).json({ success: false, message: 'items array required.' });

    for (const item of items) {
      await pool.query(
        'UPDATE itinerary SET sort_order = ?, day_number = ? WHERE id = ?',
        [item.sort_order, item.day_number, item.id]
      );
    }

    res.json({ success: true, message: 'Itinerary reordered!' });
  } catch (err) {
    console.error('reorderItinerary error:', err);
    res.status(500).json({ success: false, message: 'Error reordering itinerary.' });
  }
};

module.exports = { getItinerary, addItineraryItem, updateItineraryItem, deleteItineraryItem, reorderItinerary };
