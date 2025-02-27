const mongoose = require("mongoose");

// Define user schema and model
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  time: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
