const express = require('express');
const router = express.Router();
const { isAuthenticated, isOwnerOrAdmin } = require('../middleware/auth.middleware');
const dishService = require('../services/dish.service');

// Create dish
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const dish = await dishService.create({
      ...req.body,
      ownerId: req.user._id
    });
    res.status(201).json(dish);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update dish
router.put('/:id', isAuthenticated, isOwnerOrAdmin, async (req, res) => {
  try {
    const dish = await dishService.update(req.params.id, req.body);
    if (!dish) {
      return res.status(404).json({ message: 'Dish not found' });
    }
    res.json(dish);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete dish
router.delete('/:id', isAuthenticated, isOwnerOrAdmin, async (req, res) => {
  try {
    await dishService.delete(req.params.id);
    res.json({ message: 'Dish and related data deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get restaurant's dishes
router.get('/restaurant/:restaurantId', async (req, res) => {
  try {
    const dishes = await dishService.findByRestaurant(req.params.restaurantId);
    res.json(dishes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get dish details
router.get('/:id', async (req, res) => {
  try {
    const dish = await dishService.findById(req.params.id);
    if (!dish) {
      return res.status(404).json({ message: 'Dish not found' });
    }
    res.json(dish);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;