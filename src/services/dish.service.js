const Dish = require('../models/dish.model');
const Review = require('../models/review.model');
const Comment = require('../models/comment.model');
const Restaurant = require('../models/restaurant.model');

class DishService {
  async create(dishData) {
    const restaurant = await Restaurant.findById(dishData.restaurantId);
    if (!restaurant) {
      throw new Error('Restaurant not found');
    }

    const dish = new Dish(dishData);
    await dish.save();
    return dish;
  }

  async update(id, updateData) {
    return await Dish.findByIdAndUpdate(id, updateData, { new: true });
  }

  async delete(id) {
    const dish = await Dish.findById(id);
    if (!dish) {
      throw new Error('Dish not found');
    }

    await Promise.all([
      Review.deleteMany({ dishId: id }),
      Comment.deleteMany({ dishId: id }),
      dish.deleteOne()
    ]);

    return true;
  }

  async findByRestaurant(restaurantId) {
    return await Dish.find({ restaurantId })
      .select('name price images averageRating')
      .populate('categoryId', 'name');
  }

  async findById(id) {
    return await Dish.findById(id)
      .populate('categoryId', 'name')
      .populate('restaurantId', 'name');
  }
}

module.exports = new DishService();