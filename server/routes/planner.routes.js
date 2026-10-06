const express = require('express');
const router = express.Router();
const { generateTrip, saveGeneratedTrip } = require('../controllers/planner.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.post('/generate', generateTrip);
router.post('/save', authenticate, saveGeneratedTrip);

module.exports = router;
