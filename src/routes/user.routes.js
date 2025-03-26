const express = require("express");
const router = express.Router();
const User = require("../models/user.model");
const { isAuthenticated } = require("../middleware/auth.middleware");
const jwt = require("jsonwebtoken");
const passport = require("passport");

// Register page
router.get("/register", (req, res) => {
  res.render("users/register");
});

// Login page
router.get("/login", (req, res) => {
  res.render("users/login");
});

// Profile page
router.get("/profile", isAuthenticated, (req, res) => {
  res.render("users/profile", { user: req.user });
});

// Change password page
router.get("/change-password", isAuthenticated, (req, res) => {
  res.render("users/change-password");
});

// Register user
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      fullName,
    });

    await user.save();
    res.redirect("/api/users/login");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login user
router.post("/login", (req, res, next) => {
  passport.authenticate("local", async (err, user, info) => {
    try {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      return res.redirect("/api/users/profile");
    } catch (error) {
      return next(error);
    }
  })(req, res, next);
});

// Update profile
router.put("/profile", isAuthenticated, async (req, res) => {
  try {
    const { fullName, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { fullName, avatar },
      { new: true }
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Change password
router.put("/change-password", isAuthenticated, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!(await user.comparePassword(oldPassword))) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    user.password = newPassword;
    await user.save();
    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Logout
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/api/users/login");
});

module.exports = router;
