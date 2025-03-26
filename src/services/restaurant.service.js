const Restaurant = require('../models/restaurant.model');
const Dish = require('../models/dish.model');
const Review = require('../models/review.model');
const Comment = require('../models/comment.model');

class RestaurantService {
  async findAll(filters = {}) {
    const query = this.buildQuery(filters);
    return await Restaurant.find(query)
      .select('name address images averageRating categoryIds')
      .populate('categoryIds', 'name');
  }

  async findById(id) {
    return await Restaurant.findById(id)
      .populate('categoryIds', 'name')
      .populate('ownerId', 'username fullName');
  }

  async create(restaurantData) {
    const restaurant = new Restaurant(restaurantData);
    await restaurant.save();
    return restaurant;
  }

  async update(id, updateData) {
    return await Restaurant.findByIdAndUpdate(id, updateData, { new: true });
  }

  async delete(id) {
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      throw new Error('Restaurant not found');
    }

    await Promise.all([
      Dish.deleteMany({ restaurantId: id }),
      Review.deleteMany({ restaurantId: id }),
      Comment.deleteMany({ restaurantId: id }),
      restaurant.deleteOne()
    ]);

    return true;
  }

  buildQuery(filters) {
    const query = {};
    const { categoryIds, keyword, lat, lng, radius } = filters;

    if (categoryIds) {
      query.categoryIds = { $in: categoryIds.split(',') };
    }

    if (keyword) {
      query.name = { $regex: keyword, $options: 'i' };
    }

    if (lat && lng && radius) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(radius) * 1000
        }
      };
    }

    return query;
  }
}

module.exports = new RestaurantService();