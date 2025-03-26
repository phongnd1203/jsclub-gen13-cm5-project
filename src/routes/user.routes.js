const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth.middleware');
const userService = require('../services/user.service');
const passport = require('passport');

// Register page
router.get('/register', (req, res) => {
  res.render('users/register');
});

// Login page
router.get('/login', (req, res) => {
  res.render('users/login');
});

// Profile page
router.get('/profile', isAuthenticated, (req, res) => {
  res.render('users/profile', { user: req.user });
});

// Change password page
router.get('/change-password', isAuthenticated, (req, res) => {
  res.render('users/change-password');
});

// Register user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;

    const existingUser = await userService.findByEmailOrUsername(email, username);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    await userService.create({ username, email, password, fullName });
    res.redirect('/api/users/login');
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login user
router.post('/login', (req, res, next) => {
  passport.authenticate('local', async (err, user, info) => {
    try {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: 'Invalid credentials' });

      const token = userService.generateToken(user);

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      return res.redirect('/');
    } catch (error) {
      return next(error);
    }
  })(req, res, next);
});

// Update profile
router.put('/profile', isAuthenticated, async (req, res) => {
  try {
    const { fullName, avatar } = req.body;
    const user = await userService.update(req.user._id, { fullName, avatar });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Change password
router.put('/change-password', isAuthenticated, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    await userService.changePassword(req.user._id, oldPassword, newPassword);
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Logout
router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/api/users/login');
});

module.exports = router;