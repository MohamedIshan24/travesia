const User = require('../models/User');
const Place = require('../models/Place');

// GET /api/favorites
const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('favorites');
    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/favorites/:placeId
const addFavorite = async (req, res) => {
  try {
    const { placeId } = req.params;

    const place = await Place.findById(placeId);
    if (!place) {
      return res.status(404).json({ message: 'Place not found' });
    }

    const user = await User.findById(req.user._id);
    if (user.favorites.includes(placeId)) {
      return res.status(400).json({ message: 'Already in favorites' });
    }

    user.favorites.push(placeId);
    await user.save();

    res.status(201).json({ message: 'Added to favorites' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/favorites/:placeId
const removeFavorite = async (req, res) => {
  try {
    const { placeId } = req.params;

    const user = await User.findById(req.user._id);
    user.favorites = user.favorites.filter((id) => id.toString() !== placeId);
    await user.save();

    res.json({ message: 'Removed from favorites' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getFavorites, addFavorite, removeFavorite };