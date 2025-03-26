const Category = require('../models/category.model');
const Restaurant = require('../models/restaurant.model');
const Dish = require('../models/dish.model');

class CategoryService {
  async create(categoryData) {
    const category = new Category(categoryData);
    await category.save();
    return category;
  }

  async update(id, updateData) {
    return await Category.findByIdAndUpdate(id, updateData, { new: true });
  }

  async delete(id) {
    const category = await Category.findById(id);
    if (!category) {
      throw new Error('Category not found');
    }

    if (category.type === 'restaurant') {
      await Restaurant.updateMany(
        { categoryIds: id },
        { $pull: { categoryIds: id } }
      );
    } else if (category.type === 'dish') {
      await Dish.updateMany(
        { categoryId: id },
        { $unset: { categoryId: "" } }
      );
    }

    await category.deleteOne();
    return true;
  }

  async findAll(type = null) {
    const query = type ? { type } : {};
    return await Category.find(query).select('name type description');
  }
}

module.exports = new CategoryService();