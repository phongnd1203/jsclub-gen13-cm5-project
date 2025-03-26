const express = require("express");
const router = express.Router();
const Restaurant = require("../models/restaurant.model");
const Dish = require("../models/dish.model");
const Review = require("../models/review.model");
const Comment = require("../models/comment.model");
const Category = require("../models/category.model");
const {
  isAuthenticated,
  isAdmin,
  isOwnerOrAdmin,
} = require("../middleware/auth.middleware");
const multer = require("multer");
const upload = multer({ dest: "src/public/uploads/" });

// Get all restaurants with optional filters
router.get("/", async (req, res) => {
  try {
    const { name, categoryIds, lat, lng, distance = 10000 } = req.query;
    let query = {};

    // Name search
    if (name) {
      query.name = { $regex: name, $options: "i" };
    }

    // Category filter
    if (categoryIds) {
      query.categoryIds = { $in: categoryIds.split(",") };
    }

    // Location filter
    if (lat && lng) {
      query.location = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: parseInt(distance),
        },
      };
    }

    const restaurants = await Restaurant.find(query)
      .populate("categoryIds", "name")
      .populate("ownerId", "username")
      .select("name address images averageRating categoryIds");

    res.render("restaurants/index", { restaurants });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get restaurant creation form
router.get("/create", isAuthenticated, async (req, res) => {
  try {
    const categories = await Category.find({ type: "restaurant" });
    res.render("restaurants/create", { categories });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new restaurant
router.post(
  "/",
  isAuthenticated,
  upload.array("images", 5),
  async (req, res) => {
    try {
      const { name, address, phone, description, categoryIds, lat, lng } =
        req.body;
      const images = req.files.map((file) => `/uploads/${file.filename}`);

      const restaurant = new Restaurant({
        name,
        address,
        phone,
        description,
        images,
        location: {
          type: "Point",
          coordinates: [parseFloat(lng), parseFloat(lat)],
        },
        categoryIds: categoryIds.split(","),
        ownerId: req.user._id,
      });

      await restaurant.save();
      res.redirect(`/api/restaurants/${restaurant._id}`);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Get restaurant details
router.get("/:id", async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id)
      .populate("categoryIds", "name")
      .populate("ownerId", "username")
      .populate("likedBy", "username");

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const dishes = await Dish.find({ restaurantId: restaurant._id });
    const reviews = await Review.find({
      restaurantId: restaurant._id,
    }).populate("userId", "username avatar");

    res.render("restaurants/detail", { restaurant, dishes, reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get restaurant edit form
router.get("/:id/edit", isAuthenticated, async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    if (
      restaurant.ownerId.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const categories = await Category.find({ type: "restaurant" });
    res.render("restaurants/edit", { restaurant, categories });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update restaurant
router.put(
  "/:id",
  isAuthenticated,
  isOwnerOrAdmin,
  upload.array("images", 5),
  async (req, res) => {
    try {
      const { name, address, phone, description, categoryIds, lat, lng } =
        req.body;
      const updateData = {
        name,
        address,
        phone,
        description,
        categoryIds: categoryIds.split(","),
        location: {
          type: "Point",
          coordinates: [parseFloat(lng), parseFloat(lat)],
        },
      };

      if (req.files?.length > 0) {
        updateData.images = req.files.map(
          (file) => `/uploads/${file.filename}`
        );
      }

      const restaurant = await Restaurant.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      );

      res.json(restaurant);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Delete restaurant
router.delete("/:id", isAuthenticated, isOwnerOrAdmin, async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Delete related records
    await Promise.all([
      Dish.deleteMany({ restaurantId: restaurant._id }),
      Review.deleteMany({ restaurantId: restaurant._id }),
      Comment.deleteMany({ restaurantId: restaurant._id }),
      restaurant.delete(),
    ]);

    res.json({ message: "Restaurant deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
