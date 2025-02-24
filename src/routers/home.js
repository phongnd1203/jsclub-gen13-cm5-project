import express from "express";
import { controllers } from "../controllers/home.js";
import { database } from "../mongodb.js";
const router = express.Router();

const createUser = async (req, res) => {
  const { username, password } = req.body;
  const newUser = new database.User({ username, password });
  await newUser.save();
};

router.get("/", controllers.Login);
router.post("/", (req, res) => {
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

router.get("/home", controllers.home);

export default router;
