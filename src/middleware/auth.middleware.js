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
    const resource = await req.model.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    if (
      req.user.role === "admin" ||
      resource.ownerId.toString() === req.user._id.toString()
    ) {
      req.resource = resource;
      next();
    } else {
      res.status(403).json({ message: "Access denied. Owner or admin only." });
    }
  } catch (error) {
    next(error);
  }
};
