import mongoose from "mongoose";

mongoose
  .connect("mongodb://localhost:27017/User")
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("Connect to MongoDB failed", error));

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const User = mongoose.model("users", userSchema);

export const database = {
  User,
};
