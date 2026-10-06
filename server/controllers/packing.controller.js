const { pool } = require('../config/database');

const getPacking = async (req, res) => {
  try {
    const { tripId } = req.params;
    const [rows] = await pool.query(
      'SELECT * FROM packing_items WHERE trip_id = ? ORDER BY category, sort_order',
      [tripId]
    );
    // Group by category
    const grouped = {};
    rows.forEach(item => {
      if (!grouped[item.category]) grouped[item.category] = [];
      grouped[item.category].push(item);
    });
    res.json({ success: true, data: { items: rows, grouped } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching packing list.' });
  }
};

const addPackingItem = async (req, res) => {
  try {
    const { trip_id, item, category, sort_order } = req.body;
    if (!trip_id || !item) return res.status(400).json({ success: false, message: 'trip_id and item required.' });

    const [result] = await pool.query(
      'INSERT INTO packing_items (trip_id, item, category, sort_order) VALUES (?, ?, ?, ?)',
      [trip_id, item, category || 'General', sort_order || 0]
    );
    const [newItem] = await pool.query('SELECT * FROM packing_items WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: newItem[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error adding item.' });
  }
};

const updatePackingItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_completed, item, category } = req.body;
    const updates = {};
    if (is_completed !== undefined) updates.is_completed = is_completed;
    if (item !== undefined) updates.item = item;
    if (category !== undefined) updates.category = category;

    if (!Object.keys(updates).length) {
      return res.status(400).json({ success: false, message: 'No updates provided.' });
    }

    const fields = Object.keys(updates);
    const values = Object.values(updates);
    await pool.query(
      `UPDATE packing_items SET ${fields.map(f => `${f} = ?`).join(', ')} WHERE id = ?`,
      [...values, id]
    );
    res.json({ success: true, message: 'Item updated!' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating item.' });
  }
};

const deletePackingItem = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM packing_items WHERE id = ?', [id]);
    res.json({ success: true, message: 'Item deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting item.' });
  }
};

const generatePackingList = async (req, res) => {
  try {
    const { destination, days, activities, weather } = req.body;

    const baseItems = {
      'Documents': ['Passport/ID proof', 'Travel insurance', 'Hotel bookings printout', 'Emergency contacts'],
      'Clothing': ['T-shirts / Tops', 'Comfortable trousers/jeans', 'Underwear and socks', 'Sleepwear', 'Formal wear (if needed)'],
      'Footwear': ['Walking/trekking shoes', 'Sandals/slippers', 'Socks (multiple pairs)'],
      'Electronics': ['Phone charger', 'Power bank', 'Camera', 'Adapter/converter', 'Earphones'],
      'Toiletries': ['Toothbrush & toothpaste', 'Shampoo & conditioner', 'Soap/shower gel', 'Deodorant', 'Moisturizer'],
      'Health': ['Basic medicines', 'Pain relievers', 'Antacids', 'Band-aids/first aid kit', 'Prescription medication'],
      'Miscellaneous': ['Sunglasses', 'Wallet/money belt', 'Snacks for journey', 'Water bottle', 'Small daypack/backpack']
    };

    // Conditional items based on weather/activities
    if (weather === 'cold' || activities?.includes('mountains')) {
      baseItems['Clothing'].push('Warm jacket', 'Thermal innerwear', 'Gloves', 'Woolen cap');
    }
    if (weather === 'hot' || activities?.includes('beach')) {
      baseItems['Toiletries'].push('Sunscreen SPF 50+', 'Lip balm');
      baseItems['Clothing'].push('Swimwear', 'Light cotton clothes');
    }
    if (activities?.includes('trekking') || activities?.includes('adventure')) {
      baseItems['Miscellaneous'].push('Trekking poles', 'Rain jacket/poncho', 'Insect repellent');
      baseItems['Health'].push('Altitude sickness medication (if high altitude)');
    }
    if (activities?.includes('photography')) {
      baseItems['Electronics'].push('Extra camera batteries', 'Memory cards', 'Tripod');
    }

    res.json({ success: true, data: baseItems });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error generating packing list.' });
  }
};

module.exports = { getPacking, addPackingItem, updatePackingItem, deletePackingItem, generatePackingList };
