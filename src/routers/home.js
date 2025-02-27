import express from "express";
import { controllers } from "../controllers/home.js";
import { database } from "../mongodb.js";
const router = express.Router();

const createUser = async (req, res) => {
  const { username, password } = req.body;
  const newUser = new database.User({ username, password });
  await newUser.save();
};

router.get("/Login", controllers.Login);
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
  res.sendFile(path.join(__dirname, "../views/home.ejs"));
});

export default router;
