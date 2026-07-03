const Review = require('../models/Review');
const Place = require('../models/Place');

// Helper: recalculate a place's average rating and review count
const updatePlaceRatingStats = async (placeId) => {
  const reviews = await Review.find({ place: placeId });

  const reviewCount = reviews.length;
  const averageRating =
    reviewCount === 0
      ? 0
      : reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount;

  await Place.findByIdAndUpdate(placeId, {
    averageRating: Math.round(averageRating * 10) / 10, // round to 1 decimal
    reviewCount,
  });
};

// @desc    Get all reviews for a place
// @route   GET /api/reviews/place/:placeId
const getReviewsForPlace = async (req, res) => {
  try {
    const reviews = await Review.find({ place: req.params.placeId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all reviews by the logged-in user
// @route   GET /api/reviews/my
const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .populate('place', 'name country city')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a review for a place
// @route   POST /api/reviews/place/:placeId
const createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const placeId = req.params.placeId;

    if (!rating || !comment) {
      return res.status(400).json({ message: 'Please provide rating and comment' });
    }

    const place = await Place.findById(placeId);
    if (!place) {
      return res.status(404).json({ message: 'Place not found' });
    }

    const existingReview = await Review.findOne({ place: placeId, user: req.user._id });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this place' });
    }

    const review = await Review.create({
      place: placeId,
      user: req.user._id,
      rating,
      comment,
    });

    await updatePlaceRatingStats(placeId);

    const populatedReview = await review.populate('user', 'name');
    res.status(201).json(populatedReview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update own review
// @route   PUT /api/reviews/:id
const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this review' });
    }

    const { rating, comment } = req.body;
    review.rating = rating ?? review.rating;
    review.comment = comment ?? review.comment;

    const updatedReview = await review.save();
    await updatePlaceRatingStats(review.place);

    const populatedReview = await updatedReview.populate('user', 'name');
    res.json(populatedReview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete own review
// @route   DELETE /api/reviews/:id
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    const placeId = review.place;
    await review.deleteOne();
    await updatePlaceRatingStats(placeId);

    res.json({ message: 'Review removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getReviewsForPlace,
  getMyReviews,
  createReview,
  updateReview,
  deleteReview,
};