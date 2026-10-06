const express = require('express');
const router = express.Router();
const { getTrips, getTripById, createTrip, updateTrip, deleteTrip, duplicateTrip, getDashboardStats } = require('../controllers/trip.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);
router.get('/dashboard', getDashboardStats);
router.get('/', getTrips);
router.get('/:id', getTripById);
router.post('/', createTrip);
router.put('/:id', updateTrip);
router.delete('/:id', deleteTrip);
router.post('/:id/duplicate', duplicateTrip);

module.exports = router;
