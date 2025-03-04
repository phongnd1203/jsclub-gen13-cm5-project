import express from "express";
import path from "path";
import { fileURLToPath } from "url"; // Add this line to import fileURLToPath
import { controllers } from "../controllers/home.js";
import { database } from "../models/user.js";

const __filename = fileURLToPath(import.meta.url); // Add this line to get the current file name

const router = express.Router();

const createUser = async (req) => {
  const { username, password } = req.body;
  const newUser = new database.User({ username, password });
  await newUser.save();
};

router.get("/Login", controllers.login);
router.post("/Login", (req, res) => {
  // createUser(req, res);
  const { username, password } = req.body;
  console.log(">>>>>Login user success");
  console.log(">>>>>username : ", username);
  console.log(">>>>>password : ", password);
  res.send("Login success");
});

router.get("/signUp", controllers.signUp);
router.post("/signUp", (req, res) => {
  createUser(req, res);
  const { username, password } = req.body;
  console.log(">>>>>Create user success");
  console.log(">>>>>username : ", username);
  console.log(">>>>>password : ", password);
  res.send("Create user success");
});

router.get("/", (req, res) => {
  res.render("home"); // Use res.render to render the EJS template
});

export default router;
