const { pool } = require('../config/database');

// ─── AI TRIP GENERATOR (rule-based smart algorithm) ───────
const generateTrip = async (req, res) => {
  try {
    const {
      destination, starting_location, start_date, end_date,
      travelers, budget, travel_style, travel_pace, interests, trip_name
    } = req.body;

    if (!destination || !start_date || !end_date) {
      return res.status(400).json({ success: false, message: 'Destination, start_date, and end_date are required.' });
    }

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    if (days < 1 || days > 30) {
      return res.status(400).json({ success: false, message: 'Trip duration must be between 1 and 30 days.' });
    }

    // Find destination in DB
    const [destinations] = await pool.query(
      'SELECT * FROM destinations WHERE name LIKE ? ORDER BY rating DESC LIMIT 1',
      [`%${destination}%`]
    );

    const destInfo = destinations[0] || null;

    // Get attractions if destination found
    let attractions = [];
    if (destInfo) {
      const [attrRows] = await pool.query(
        'SELECT * FROM attractions WHERE destination_id = ? ORDER BY rating DESC',
        [destInfo.id]
      );
      attractions = attrRows;
    }

    // Activity templates based on interests
    const interestActivities = {
      nature: [
        { name: 'Nature Walk / Hiking', type: 'adventure', duration: 3, cost_factor: 0.3 },
        { name: 'Botanical Garden Visit', type: 'attraction', duration: 2, cost_factor: 0.2 },
        { name: 'Wildlife Spotting', type: 'attraction', duration: 3, cost_factor: 0.4 },
        { name: 'Waterfall Trek', type: 'adventure', duration: 4, cost_factor: 0.5 },
      ],
      food: [
        { name: 'Local Street Food Tour', type: 'food', duration: 2, cost_factor: 0.4 },
        { name: 'Traditional Restaurant Lunch', type: 'food', duration: 1.5, cost_factor: 0.3 },
        { name: 'Food Market Exploration', type: 'food', duration: 2, cost_factor: 0.3 },
        { name: 'Cooking Class', type: 'cultural', duration: 3, cost_factor: 0.6 },
      ],
      photography: [
        { name: 'Golden Hour Photography Session', type: 'photography', duration: 2, cost_factor: 0.1 },
        { name: 'Viewpoint Visit', type: 'attraction', duration: 2, cost_factor: 0.2 },
        { name: 'Heritage Architecture Photography', type: 'photography', duration: 3, cost_factor: 0.2 },
      ],
      adventure: [
        { name: 'Trekking / Hiking', type: 'adventure', duration: 5, cost_factor: 0.6 },
        { name: 'Paragliding / Adventure Sports', type: 'adventure', duration: 2, cost_factor: 0.8 },
        { name: 'Rock Climbing', type: 'adventure', duration: 3, cost_factor: 0.7 },
        { name: 'River Rafting', type: 'adventure', duration: 3, cost_factor: 0.7 },
      ],
      history: [
        { name: 'Historical Monument Visit', type: 'historical', duration: 3, cost_factor: 0.3 },
        { name: 'Museum Exploration', type: 'cultural', duration: 2.5, cost_factor: 0.2 },
        { name: 'Heritage Walk', type: 'cultural', duration: 2, cost_factor: 0.2 },
      ],
      shopping: [
        { name: 'Local Market Shopping', type: 'shopping', duration: 2.5, cost_factor: 0.8 },
        { name: 'Craft & Souvenir Shopping', type: 'shopping', duration: 2, cost_factor: 0.6 },
      ],
      relaxation: [
        { name: 'Spa & Wellness Session', type: 'relaxation', duration: 3, cost_factor: 0.7 },
        { name: 'Lakeside / Beachside Relaxation', type: 'relaxation', duration: 3, cost_factor: 0.1 },
        { name: 'Yoga & Meditation', type: 'relaxation', duration: 2, cost_factor: 0.3 },
      ],
      nightlife: [
        { name: 'Night Market / Bazaar', type: 'nightlife', duration: 2, cost_factor: 0.4 },
        { name: 'Rooftop Bar / Restaurant', type: 'food', duration: 2, cost_factor: 0.6 },
      ],
    };

    // Meals per day
    const mealSchedule = [
      { name: 'Breakfast', type: 'food', start: '08:00', end: '09:00', cost_factor: 0.1 },
      { name: 'Lunch', type: 'food', start: '13:00', end: '14:00', cost_factor: 0.15 },
      { name: 'Dinner', type: 'food', start: '19:30', end: '21:00', cost_factor: 0.2 },
    ];

    // Calculate daily budget
    const totalBudget = budget || (travel_style === 'luxury' ? 30000 : travel_style === 'budget' ? 8000 : 15000);
    const dailyBudget = totalBudget / days;

    // Determine activities per day based on pace
    const activitiesPerDay = travel_pace === 'packed' ? 4 : travel_pace === 'relaxed' ? 2 : 3;

    // Get activities pool from interests
    const userInterests = interests || ['nature', 'food'];
    let activityPool = [];
    userInterests.forEach(interest => {
      if (interestActivities[interest]) {
        activityPool = [...activityPool, ...interestActivities[interest]];
      }
    });

    // Default pool if no interests
    if (!activityPool.length) {
      activityPool = [...interestActivities.nature, ...interestActivities.food];
    }

    // Build itinerary
    const itineraryDays = [];
    let activityIndex = 0;

    for (let day = 1; day <= days; day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + day - 1);
      const dateStr = currentDate.toISOString().split('T')[0];

      const dayActivities = [];

      // Breakfast
      dayActivities.push({
        day_number: day,
        activity_name: day === 1 ? 'Arrival & Breakfast' : 'Breakfast',
        description: day === 1
          ? `Arrive in ${destination} and settle into your accommodation. Start the day with a fresh ${travel_style === 'luxury' ? 'hotel buffet' : 'local'} breakfast.`
          : `Start your day with a delicious breakfast at the ${travel_style === 'luxury' ? 'hotel restaurant' : 'local café'}.`,
        activity_type: 'food',
        activity_date: dateStr,
        start_time: '08:00',
        end_time: '09:00',
        estimated_cost: Math.round(dailyBudget * 0.08 * travelers),
        location_name: `${destination} Hotel/Café`,
        latitude: destInfo?.latitude || null,
        longitude: destInfo?.longitude || null,
        sort_order: 0
      });

      let currentHour = 9.5;

      // Main activities
      for (let a = 0; a < activitiesPerDay; a++) {
        const activity = activityPool[activityIndex % activityPool.length];
        activityIndex++;

        // Check if we have a real attraction to use
        const attraction = attractions[activityIndex % (attractions.length || 1)];
        const useAttraction = attraction && a < attractions.length;

        const startHour = Math.floor(currentHour);
        const startMin = currentHour % 1 === 0 ? '00' : '30';
        const endHour = Math.floor(currentHour + (activity.duration || 2));
        const endMin = '00';

        dayActivities.push({
          day_number: day,
          activity_name: useAttraction ? attraction.name : activity.name,
          description: useAttraction ? attraction.description : `Explore and enjoy ${activity.name.toLowerCase()} in ${destination}. A wonderful experience for ${travelers} traveler(s).`,
          activity_type: useAttraction ? 'attraction' : activity.type,
          activity_date: dateStr,
          start_time: `${String(startHour).padStart(2, '0')}:${startMin}`,
          end_time: `${String(endHour).padStart(2, '0')}:${endMin}`,
          estimated_cost: useAttraction
            ? Math.round((attraction.entry_fee || 0) * travelers)
            : Math.round(dailyBudget * (activity.cost_factor || 0.3) * travelers / activitiesPerDay),
          location_name: useAttraction ? attraction.name : `${activity.name}, ${destination}`,
          latitude: useAttraction ? attraction.latitude : (destInfo?.latitude || null),
          longitude: useAttraction ? attraction.longitude : (destInfo?.longitude || null),
          sort_order: a + 1
        });

        currentHour += (activity.duration || 2) + 0.5;

        // Add lunch if appropriate time
        if (currentHour >= 12.5 && currentHour <= 14 && !dayActivities.find(d => d.activity_name === 'Lunch')) {
          dayActivities.push({
            day_number: day,
            activity_name: 'Lunch',
            description: `Enjoy a delicious local ${travel_style === 'luxury' ? 'fine dining' : 'authentic'} lunch experience in ${destination}.`,
            activity_type: 'food',
            activity_date: dateStr,
            start_time: '13:00',
            end_time: '14:00',
            estimated_cost: Math.round(dailyBudget * 0.12 * travelers),
            location_name: `Local Restaurant, ${destination}`,
            latitude: destInfo?.latitude || null,
            longitude: destInfo?.longitude || null,
            sort_order: a + 2
          });
          currentHour = 14.5;
        }
      }

      // Dinner
      dayActivities.push({
        day_number: day,
        activity_name: day === days ? 'Final Dinner & Farewell' : 'Dinner',
        description: day === days
          ? `Enjoy a memorable farewell dinner in ${destination}. Savor the local flavors one last time before heading back.`
          : `End the day with a hearty dinner at a ${travel_style === 'luxury' ? 'premium' : 'local'} restaurant in ${destination}.`,
        activity_type: 'food',
        activity_date: dateStr,
        start_time: '19:30',
        end_time: '21:00',
        estimated_cost: Math.round(dailyBudget * 0.18 * travelers),
        location_name: `Restaurant, ${destination}`,
        latitude: destInfo?.latitude || null,
        longitude: destInfo?.longitude || null,
        sort_order: 99
      });

      // Sort by start time
      dayActivities.sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''));
      dayActivities.forEach((act, idx) => act.sort_order = idx);

      itineraryDays.push(...dayActivities);
    }

    // Budget breakdown
    const budgetBreakdown = {
      transportation: Math.round(totalBudget * 0.25),
      hotels: Math.round(totalBudget * 0.35),
      food: Math.round(totalBudget * 0.20),
      activities: Math.round(totalBudget * 0.12),
      shopping: Math.round(totalBudget * 0.05),
      miscellaneous: Math.round(totalBudget * 0.03),
      total: totalBudget
    };

    // Weather mock
    const weatherData = {
      temperature: destInfo?.climate?.includes('cold') ? '10-20' : destInfo?.climate?.includes('hot') ? '28-38' : '20-30',
      condition: 'Pleasant',
      humidity: '65%',
      wind: '12 km/h',
      forecast: Array(days).fill(null).map((_, i) => ({
        day: i + 1,
        condition: i % 3 === 0 ? 'Partly Cloudy' : i % 2 === 0 ? 'Sunny' : 'Clear',
        high: 28,
        low: 18
      }))
    };

    res.json({
      success: true,
      message: 'Trip plan generated successfully!',
      data: {
        trip_info: {
          destination,
          starting_location,
          start_date,
          end_date,
          days,
          travelers,
          budget: totalBudget,
          travel_style,
          travel_pace,
          interests,
          trip_name: trip_name || `${destination} ${days}-Day Trip`
        },
        destination_info: destInfo,
        itinerary: itineraryDays,
        budget_breakdown: budgetBreakdown,
        weather: weatherData,
        tips: destInfo?.travel_tips || `Plan your ${destination} trip with care. Book accommodations in advance, especially during peak season.`,
        packing_suggestions: generatePackingSuggestions(interests, destInfo?.climate)
      }
    });
  } catch (err) {
    console.error('generateTrip error:', err);
    res.status(500).json({ success: false, message: 'Error generating trip plan.' });
  }
};

const generatePackingSuggestions = (interests, climate) => {
  const base = ['ID/Passport', 'Phone charger', 'Power bank', 'Basic medicines', 'Cash/Cards'];
  if (climate?.includes('cold') || climate?.includes('alpine')) {
    base.push('Warm jacket', 'Thermal innerwear', 'Gloves', 'Woolen cap');
  } else {
    base.push('Sunscreen', 'Light clothes', 'Sunglasses');
  }
  if (interests?.includes('photography')) base.push('Camera', 'Extra memory cards');
  if (interests?.includes('adventure')) base.push('Trekking shoes', 'Rain jacket', 'First aid kit');
  return base;
};

// ─── SAVE GENERATED TRIP ─────────────────────────────────
const saveGeneratedTrip = async (req, res) => {
  try {
    const userId = req.user.id;
    const { trip_info, itinerary, budget_breakdown, destination_info } = req.body;

    const [result] = await pool.query(
      `INSERT INTO trips (user_id, destination_id, trip_name, destination_name, start_date, end_date,
        travelers, budget, travel_style, travel_pace, interests, starting_location, cover_image, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'planning')`,
      [
        userId,
        destination_info?.id || null,
        trip_info.trip_name,
        trip_info.destination,
        trip_info.start_date,
        trip_info.end_date,
        trip_info.travelers || 1,
        trip_info.budget,
        trip_info.travel_style || 'standard',
        trip_info.travel_pace || 'balanced',
        JSON.stringify(trip_info.interests || []),
        trip_info.starting_location || null,
        destination_info?.image || null
      ]
    );

    const tripId = result.insertId;

    // Save itinerary
    for (const item of itinerary) {
      await pool.query(
        `INSERT INTO itinerary (trip_id, day_number, activity_name, description, activity_type,
          activity_date, start_time, end_time, estimated_cost, location_name, latitude, longitude, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [tripId, item.day_number, item.activity_name, item.description, item.activity_type,
         item.activity_date, item.start_time, item.end_time, item.estimated_cost,
         item.location_name, item.latitude, item.longitude, item.sort_order || 0]
      );
    }

    // Save budget
    if (budget_breakdown) {
      await pool.query(
        `INSERT INTO budget_plans (trip_id, transportation, hotels, food, activities, shopping, miscellaneous, total_budget)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [tripId, budget_breakdown.transportation || 0, budget_breakdown.hotels || 0,
         budget_breakdown.food || 0, budget_breakdown.activities || 0,
         budget_breakdown.shopping || 0, budget_breakdown.miscellaneous || 0,
         budget_breakdown.total || 0]
      );
    }

    res.status(201).json({ success: true, message: 'Trip saved!', data: { id: tripId } });
  } catch (err) {
    console.error('saveGeneratedTrip error:', err);
    res.status(500).json({ success: false, message: 'Error saving trip.' });
  }
};

module.exports = { generateTrip, saveGeneratedTrip };
