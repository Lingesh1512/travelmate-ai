const express = require('express');
const router = express.Router();
const { getItinerary, addItineraryItem, updateItineraryItem, deleteItineraryItem, reorderItinerary } = require('../controllers/itinerary.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);
router.get('/:tripId', getItinerary);
router.post('/', addItineraryItem);
router.put('/reorder', reorderItinerary);
router.put('/:id', updateItineraryItem);
router.delete('/:id', deleteItineraryItem);

module.exports = router;
