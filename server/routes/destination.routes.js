const express = require('express');
const router = express.Router();
const { getDestinations, getDestinationById, createDestination, updateDestination, deleteDestination, getFeaturedDestinations } = require('../controllers/destination.controller');
const { authenticate, adminOnly } = require('../middleware/auth.middleware');

router.get('/', getDestinations);
router.get('/featured', getFeaturedDestinations);
router.get('/:id', getDestinationById);
router.post('/', authenticate, adminOnly, createDestination);
router.put('/:id', authenticate, adminOnly, updateDestination);
router.delete('/:id', authenticate, adminOnly, deleteDestination);

module.exports = router;
