const express = require('express');
const router = express.Router();
const { getPacking, addPackingItem, updatePackingItem, deletePackingItem, generatePackingList } = require('../controllers/packing.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);
router.get('/:tripId', getPacking);
router.post('/', addPackingItem);
router.post('/generate', generatePackingList);
router.put('/:id', updatePackingItem);
router.delete('/:id', deletePackingItem);

module.exports = router;
