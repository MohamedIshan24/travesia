const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Place name is required'],
      trim: true,
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    category: {
      type: String,
      enum: ['beach', 'historical', 'nature', 'city', 'adventure', 'cultural', 'hotel', 'restaurant', 'cafe', 'shopping'],
      required: [true, 'Category is required'],
    },
    images: {
      type: [String],
      default: [],
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    latitude: {
      type: Number,
      required: false,
    },
    longitude: {
      type: Number,
      required: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    historicalEssay: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

placeSchema.index({ name: 'text', country: 'text', city: 'text' });

module.exports = mongoose.model('Place', placeSchema);