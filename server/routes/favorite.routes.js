const express = require('express');
const router = express.Router();
const { getFavorites, addFavorite, removeFavorite, checkFavorite } = require('../controllers/favorite.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);
router.get('/', getFavorites);
router.post('/', addFavorite);
router.get('/check/:destinationId', checkFavorite);
router.delete('/:id', removeFavorite);

module.exports = router;
