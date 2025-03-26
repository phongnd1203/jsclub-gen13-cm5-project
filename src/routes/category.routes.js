const express = require('express');
const router = express.Router();
const { isAuthenticated, isAdmin } = require('../middleware/auth.middleware');
const categoryService = require('../services/category.service');

// Create category (admin only)
router.post('/', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const category = await categoryService.create(req.body);
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update category (admin only)
router.put('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const category = await categoryService.update(req.params.id, req.body);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete category (admin only)
router.delete('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    await categoryService.delete(req.params.id);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get categories list
router.get('/', async (req, res) => {
  try {
    const categories = await categoryService.findAll(req.query.type);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});