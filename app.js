const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const app = express();

// Connect to MongoDB

mongoose
  .connect("mongodb://localhost:27017/Database")
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("Connect to MongoDB failed", error));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));

// Import routers
const authRouter = require("./src/routers/auth");
const homeRouter = require("./src/routers/home");

// Use routers
app.use("/", homeRouter);
app.use("/", authRouter);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
