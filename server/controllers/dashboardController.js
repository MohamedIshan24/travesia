const Place = require('../models/Place');
const Review = require('../models/Review');
const User = require('../models/User');

// GET /api/dashboard/stats
const getStats = async (req, res) => {
  try {
    const totalPlaces = await Place.countDocuments();
    const totalReviews = await Review.countDocuments();
    const totalUsers = await User.countDocuments();

    const topRatedPlaces = await Place.find({ reviewCount: { $gt: 0 } })
      .sort({ averageRating: -1 })
      .limit(5)
      .select('name country city reviewCount averageRating');

    const categoryBreakdown = await Place.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      totalPlaces,
      totalReviews,
      totalUsers,
      topRatedPlaces,
      categoryBreakdown,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getStats };