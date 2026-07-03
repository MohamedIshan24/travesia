const express = require('express');
const router = express.Router();
const { getFavorites, addFavorite, removeFavorite } = require('../controllers/favoriteController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getFavorites);
router.post('/:placeId', protect, addFavorite);
router.delete('/:placeId', protect, removeFavorite);

module.exports = router;