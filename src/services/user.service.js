const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

class UserService {
  async findByEmailOrUsername(email, username) {
    return await User.findOne({ $or: [{ email }, { username }] });
  }

  async create(userData) {
    const user = new User(userData);
    await user.save();
    return user;
  }

  async findById(id) {
    return await User.findById(id);
  }

  async update(id, updateData) {
    return await User.findByIdAndUpdate(id, updateData, { new: true });
  }

  async changePassword(userId, oldPassword, newPassword) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      throw new Error('Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();
    return user;
  }

  generateToken(user) {
    return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });
  }
}

module.exports = new UserService();