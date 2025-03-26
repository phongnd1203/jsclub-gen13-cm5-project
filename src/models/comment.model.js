const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant'
  },
  dishId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dish'
  },
  content: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Ensure at least one reference is provided
commentSchema.pre('save', function(next) {
  if (!this.reviewId && !this.restaurantId && !this.dishId) {
    next(new Error('Comment must be associated with either a review, restaurant, or dish'));
  }
  next();
});

module.exports = mongoose.model('Comment', commentSchema);