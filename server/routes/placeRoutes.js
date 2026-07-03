const express = require('express');
const router = express.Router();
const {
  getPlaces,
  getPlaceById,
  createPlace,
  updatePlace,
  deletePlace,
} = require('../controllers/placeController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

router.get('/', getPlaces);
router.get('/:id', getPlaceById);
router.post('/', protect, admin, createPlace);
router.put('/:id', protect, admin, updatePlace);
router.delete('/:id', protect, admin, deletePlace);

module.exports = router;