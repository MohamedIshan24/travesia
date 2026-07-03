const Place = require('../models/Place');

// @desc    Get all places (with search & filter)
// @route   GET /api/places
const getPlaces = async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = {};

    if (search) {
      query.$text = { $search: search };
    }

    if (category) {
      query.category = category;
    }

    const places = await Place.find(query).sort({ createdAt: -1 });
    res.json(places);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single place by ID
// @route   GET /api/places/:id
const getPlaceById = async (req, res) => {
  try {
    const place = await Place.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewCount: 1 } },
      { new: true }
    );
    if (!place) {
      return res.status(404).json({ message: 'Place not found' });
    }

    const related = await Place.find({
      category: place.category,
      _id: { $ne: place._id },
    })
      .limit(3)
      .select('name country city category images averageRating reviewCount');

    res.json({ ...place.toObject(), related });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new place (admin only)
// @route   POST /api/places
const createPlace = async (req, res) => {
  try {
    const { name, country, city, description, category, images, latitude, longitude } = req.body;

    if (!name || !country || !description || !category) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const place = await Place.create({
      name,
      country,
      city,
      description,
      category,
      images,
      latitude: latitude === '' ? null : latitude,
      longitude: longitude === '' ? null : longitude,
      createdBy: req.user._id,
    });

    res.status(201).json(place);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a place (admin only)
// @route   PUT /api/places/:id
const updatePlace = async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);
    if (!place) {
      return res.status(404).json({ message: 'Place not found' });
    }

    const { name, country, city, description, category, images, latitude, longitude } = req.body;

    place.name = name ?? place.name;
    place.country = country ?? place.country;
    place.city = city ?? place.city;
    place.description = description ?? place.description;
    place.category = category ?? place.category;
    place.images = images ?? place.images;
    place.latitude = latitude !== undefined ? (latitude === '' ? null : latitude) : place.latitude;
    place.longitude = longitude !== undefined ? (longitude === '' ? null : longitude) : place.longitude;

    const updatedPlace = await place.save();
    res.json(updatedPlace);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a place (admin only)
// @route   DELETE /api/places/:id
const deletePlace = async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);
    if (!place) {
      return res.status(404).json({ message: 'Place not found' });
    }

    await place.deleteOne();
    res.json({ message: 'Place removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPlaces,
  getPlaceById,
  createPlace,
  updatePlace,
  deletePlace,
};