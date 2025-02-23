import express from "express";
import { controllers } from "../controllers/home.js";
import { database } from "../mongodb.js";
const router = express.Router();

const createUser = async (req, res) => {
  const { username, password } = req.body;
  const newUser = new database.User({ username, password });
  await newUser.save();
  res.send("Create user success");
};

router.get("/", controllers.homeController);
router.post("/", (req, res) => {
  createUser(req, res);
  const { username, password } = req.body;
  console.log(">>>>>username : ", username);
  console.log(">>>>>password : ", password);
});

export default router;
