import express from "express";
import bcrypt from "bcrypt";
import path from "path";
import User from "../models/user.js"; // Assuming the user model is in the models directory
const router = express.Router();

// Route to render login page
router.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/login.ejs"));
});

// Route to handle login form submission
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (user && (await bcrypt.compare(password, user.password))) {
    res.send(`Logged in as ${username}`);
  } else {
    res.send("Invalid username or password");
  }
});

// Route to render sign-up page
router.get("/signUp", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/signUp.ejs"));
});

// Route to handle sign-up form submission
router.post("/signUp", async (req, res) => {
  const { username, password } = req.body;
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    res.send("Username already exists. Please choose another one.");
  } else {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    res.send(`Signed up as ${username}`);
  }
});

module.exports = router;
