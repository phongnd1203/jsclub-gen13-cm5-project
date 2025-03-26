const express = require("express");
const router = express.Router();
const Restaurant = require("../models/restaurant.model");
const Category = require("../models/category.model");
const Review = require("../models/review.model");

router.get("/", async (req, res) => {
  try {
    const [restaurants, categories, reviews] = await Promise.all([
      Restaurant.find().sort({ averageRating: -1 }).limit(6),
      Category.find().limit(8),
      Review.find()
        .sort({ createdAt: -1 })
        .limit(4)
        .populate("userId", "username avatar"),
    ]);

    res.render("home", {
      user: req.user,
      restaurants,
      categories,
      reviews,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error loading homepage" });
  }
});

module.exports = router;
