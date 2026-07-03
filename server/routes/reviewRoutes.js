const express = require('express');
const router = express.Router();
const {
  getReviewsForPlace,
  getMyReviews,
  createReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.get('/place/:placeId', getReviewsForPlace);
router.get('/my', protect, getMyReviews);
router.post('/place/:placeId', protect, createReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;