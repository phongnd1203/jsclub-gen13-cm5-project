const express = require('express');
const router = express.Router();
const { isAuthenticated, isAdmin, isOwnerOrAdmin } = require('../middleware/auth.middleware');
const restaurantService = require('../services/restaurant.service');
const dishService = require('../services/dish.service');

// Restaurant list page
router.get('/', async (req, res) => {
  try {
    const restaurants = await restaurantService.findAll(req.query);
    res.render('restaurants/index', { restaurants, query: req.query });
  } catch (error) {
    res.status(500).render('error', { message: error.message });
  }
});

// Create restaurant page
router.get('/create', isAuthenticated, (req, res) => {
  res.render('restaurants/create');
});

// Edit restaurant page
router.get('/:id/edit', isAuthenticated, isOwnerOrAdmin, async (req, res) => {
  try {
    const restaurant = await restaurantService.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).render('error', { message: 'Restaurant not found' });
    }
    res.render('restaurants/edit', { restaurant });
  } catch (error) {
    res.status(500).render('error', { message: error.message });
  }
});

// Restaurant details page
router.get('/:id', async (req, res) => {
  try {
    const restaurant = await restaurantService.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).render('error', { message: 'Restaurant not found' });
    }

    const dishes = await dishService.findByRestaurant(req.params.id);
    res.render('restaurants/show', { restaurant, dishes });
  } catch (error) {
    res.status(500).render('error', { message: error.message });
  }
});

// API Routes
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const restaurantData = {
      ...req.body,
      ownerId: req.user._id,
      location: {
        type: 'Point',
        coordinates: req.body.location.coordinates
      }
    };

    const restaurant = await restaurantService.create(restaurantData);
    res.redirect(`/restaurants/${restaurant._id}`);
  } catch (error) {
    res.status(500).render('error', { message: error.message });
  }
});

router.put('/:id', isAuthenticated, isOwnerOrAdmin, async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      location: req.body.location ? {
        type: 'Point',
        coordinates: req.body.location.coordinates
      } : undefined
    };

    const restaurant = await restaurantService.update(req.params.id, updateData);
    if (!restaurant) {
      return res.status(404).render('error', { message: 'Restaurant not found' });
    }

    res.redirect(`/restaurants/${restaurant._id}`);
  } catch (error) {
    res.status(500).render('error', { message: error.message });
  }
});

router.delete('/:id', isAuthenticated, isOwnerOrAdmin, async (req, res) => {
  try {
    await restaurantService.delete(req.params.id);
    res.redirect('/restaurants');
  } catch (error) {
    res.status(500).render('error', { message: error.message });
  }
});

module.exports = router;