const { pool } = require('../config/database');

// ─── GET TRIPS ────────────────────────────────────────────
const getTrips = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;
    let where = 't.user_id = ?';
    let params = [userId];
    if (status) { where += ' AND t.status = ?'; params.push(status); }

    const [trips] = await pool.query(
      `SELECT t.*, d.image as destination_image, d.country as destination_country,
              d.latitude as dest_lat, d.longitude as dest_lng,
              DATEDIFF(t.end_date, t.start_date) + 1 as duration
       FROM trips t
       LEFT JOIN destinations d ON d.id = t.destination_id
       WHERE ${where}
       ORDER BY t.created_at DESC`,
      params
    );

    res.json({ success: true, data: trips });
  } catch (err) {
    console.error('getTrips error:', err);
    res.status(500).json({ success: false, message: 'Error fetching trips.' });
  }
};

// ─── GET TRIP BY ID ───────────────────────────────────────
const getTripById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    const [trips] = await pool.query(
      `SELECT t.*, d.name as destination_full_name, d.country as destination_country,
              d.image as destination_image, d.latitude as dest_lat, d.longitude as dest_lng,
              DATEDIFF(t.end_date, t.start_date) + 1 as duration
       FROM trips t
       LEFT JOIN destinations d ON d.id = t.destination_id
       WHERE t.id = ? ${isAdmin ? '' : 'AND t.user_id = ?'}`,
      isAdmin ? [id] : [id, userId]
    );

    if (!trips.length) {
      return res.status(404).json({ success: false, message: 'Trip not found.' });
    }

    const [itinerary] = await pool.query(
      'SELECT * FROM itinerary WHERE trip_id = ? ORDER BY day_number, start_time, sort_order',
      [id]
    );

    const [budget] = await pool.query('SELECT * FROM budget_plans WHERE trip_id = ?', [id]);
    const [packing] = await pool.query('SELECT * FROM packing_items WHERE trip_id = ? ORDER BY sort_order', [id]);
    const [expenses] = await pool.query('SELECT * FROM expenses WHERE trip_id = ? ORDER BY expense_date DESC', [id]);

    res.json({
      success: true,
      data: { ...trips[0], itinerary, budget: budget[0] || null, packing, expenses }
    });
  } catch (err) {
    console.error('getTripById error:', err);
    res.status(500).json({ success: false, message: 'Error fetching trip.' });
  }
};

// ─── CREATE TRIP ──────────────────────────────────────────
const createTrip = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      destination_id, trip_name, destination_name, start_date, end_date,
      travelers, budget, travel_style, travel_pace, interests, starting_location,
      cover_image, notes
    } = req.body;

    if (!trip_name || !start_date || !end_date) {
      return res.status(400).json({ success: false, message: 'Trip name, start date, and end date are required.' });
    }

    const [result] = await pool.query(
      `INSERT INTO trips (user_id, destination_id, trip_name, destination_name, start_date, end_date,
        travelers, budget, travel_style, travel_pace, interests, starting_location, cover_image, notes, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'planning')`,
      [userId, destination_id || null, trip_name, destination_name || null, start_date, end_date,
       travelers || 1, budget || null, travel_style || 'standard', travel_pace || 'balanced',
       interests ? JSON.stringify(interests) : null, starting_location || null, cover_image || null, notes || null]
    );

    // Create budget plan if budget provided
    if (budget) {
      const perPerson = budget / (travelers || 1);
      await pool.query(
        `INSERT INTO budget_plans (trip_id, transportation, hotels, food, activities, shopping, miscellaneous, total_budget)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [result.insertId, budget * 0.25, budget * 0.35, budget * 0.20, budget * 0.10, budget * 0.07, budget * 0.03, budget]
      );
    }

    res.status(201).json({ success: true, message: 'Trip created!', data: { id: result.insertId } });
  } catch (err) {
    console.error('createTrip error:', err);
    res.status(500).json({ success: false, message: 'Error creating trip.' });
  }
};

// ─── UPDATE TRIP ──────────────────────────────────────────
const updateTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [existing] = await pool.query('SELECT id FROM trips WHERE id = ? AND user_id = ?', [id, userId]);
    if (!existing.length) {
      return res.status(404).json({ success: false, message: 'Trip not found.' });
    }

    const allowed = ['trip_name', 'destination_name', 'start_date', 'end_date', 'travelers', 'budget',
      'travel_style', 'travel_pace', 'interests', 'starting_location', 'status', 'cover_image', 'notes'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    if (!Object.keys(updates).length) {
      return res.status(400).json({ success: false, message: 'No valid fields to update.' });
    }

    const fields = Object.keys(updates);
    const values = Object.values(updates);

    await pool.query(
      `UPDATE trips SET ${fields.map(f => `${f} = ?`).join(', ')}, updated_at = NOW() WHERE id = ?`,
      [...values, id]
    );

    res.json({ success: true, message: 'Trip updated!' });
  } catch (err) {
    console.error('updateTrip error:', err);
    res.status(500).json({ success: false, message: 'Error updating trip.' });
  }
};

// ─── DELETE TRIP ──────────────────────────────────────────
const deleteTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [existing] = await pool.query('SELECT id FROM trips WHERE id = ? AND user_id = ?', [id, userId]);
    if (!existing.length) {
      return res.status(404).json({ success: false, message: 'Trip not found.' });
    }

    await pool.query('DELETE FROM trips WHERE id = ?', [id]);
    res.json({ success: true, message: 'Trip deleted.' });
  } catch (err) {
    console.error('deleteTrip error:', err);
    res.status(500).json({ success: false, message: 'Error deleting trip.' });
  }
};

// ─── DUPLICATE TRIP ───────────────────────────────────────
const duplicateTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [trips] = await pool.query('SELECT * FROM trips WHERE id = ? AND user_id = ?', [id, userId]);
    if (!trips.length) return res.status(404).json({ success: false, message: 'Trip not found.' });

    const trip = trips[0];
    const [result] = await pool.query(
      `INSERT INTO trips (user_id, destination_id, trip_name, destination_name, start_date, end_date,
        travelers, budget, travel_style, travel_pace, interests, starting_location, cover_image, notes, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'planning')`,
      [userId, trip.destination_id, `${trip.trip_name} (Copy)`, trip.destination_name,
       trip.start_date, trip.end_date, trip.travelers, trip.budget, trip.travel_style,
       trip.travel_pace, trip.interests, trip.starting_location, trip.cover_image, trip.notes]
    );

    // Duplicate itinerary
    const [itinerary] = await pool.query('SELECT * FROM itinerary WHERE trip_id = ?', [id]);
    for (const item of itinerary) {
      await pool.query(
        `INSERT INTO itinerary (trip_id, day_number, activity_name, description, activity_type,
          activity_date, start_time, end_time, estimated_cost, location_name, latitude, longitude, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [result.insertId, item.day_number, item.activity_name, item.description, item.activity_type,
         item.activity_date, item.start_time, item.end_time, item.estimated_cost,
         item.location_name, item.latitude, item.longitude, item.sort_order]
      );
    }

    res.status(201).json({ success: true, message: 'Trip duplicated!', data: { id: result.insertId } });
  } catch (err) {
    console.error('duplicateTrip error:', err);
    res.status(500).json({ success: false, message: 'Error duplicating trip.' });
  }
};

// ─── DASHBOARD STATS ─────────────────────────────────────
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const [[upcomingTrips]] = await pool.query(
      "SELECT COUNT(*) as count FROM trips WHERE user_id = ? AND status IN ('upcoming', 'planning')", [userId]
    );
    const [[completedTrips]] = await pool.query(
      "SELECT COUNT(*) as count FROM trips WHERE user_id = ? AND status = 'completed'", [userId]
    );
    const [[savedDestinations]] = await pool.query(
      'SELECT COUNT(*) as count FROM favorites WHERE user_id = ?', [userId]
    );
    const [[totalBudget]] = await pool.query(
      'SELECT COALESCE(SUM(budget), 0) as total FROM trips WHERE user_id = ?', [userId]
    );
    const [recentTrips] = await pool.query(
      `SELECT t.*, d.image as destination_image, DATEDIFF(t.end_date, t.start_date) + 1 as duration
       FROM trips t LEFT JOIN destinations d ON d.id = t.destination_id
       WHERE t.user_id = ? ORDER BY t.created_at DESC LIMIT 5`,
      [userId]
    );

    res.json({
      success: true,
      data: {
        upcoming_trips: upcomingTrips.count,
        completed_trips: completedTrips.count,
        saved_destinations: savedDestinations.count,
        total_budget: totalBudget.total,
        recent_trips: recentTrips
      }
    });
  } catch (err) {
    console.error('getDashboardStats error:', err);
    res.status(500).json({ success: false, message: 'Error fetching dashboard stats.' });
  }
};

module.exports = { getTrips, getTripById, createTrip, updateTrip, deleteTrip, duplicateTrip, getDashboardStats };
