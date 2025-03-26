const passport = require("passport");

exports.isAuthenticated = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.redirect("/api/users/login");
    }
    req.user = user;
    next();
  })(req, res, next);
};

exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Admin only." });
  }
};

exports.isModerator = (req, res, next) => {
  if (
    req.user &&
    (req.user.role === "moderator" || req.user.role === "admin")
  ) {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Moderator only." });
  }
};

exports.isOwnerOrAdmin = async (req, res, next) => {
  try {
    if (req.user.role === 'admin') {
      return next();
    }

    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    if (restaurant.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
