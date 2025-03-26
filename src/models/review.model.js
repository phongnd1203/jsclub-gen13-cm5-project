const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant'
  },
  dishId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dish'
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  content: {
    type: String,
    required: true
  },
  images: [{
    type: String
  }],
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Ensure either restaurantId or dishId is provided
reviewSchema.pre('save', function(next) {
  if (!this.restaurantId && !this.dishId) {
    next(new Error('Review must be associated with either a restaurant or a dish'));
  }
  if (this.restaurantId && this.dishId) {
    next(new Error('Review cannot be associated with both restaurant and dish'));
  }
  next();
});

module.exports = mongoose.model('Review', reviewSchema);