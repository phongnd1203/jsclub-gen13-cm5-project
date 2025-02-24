import mongoose from "mongoose";

mongoose
  .connect("mongodb://localhost:27017/Database")
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("Connect to MongoDB failed", error));

// Define userschema
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  time: { type: Date, default: Date.now },
});
const User = mongoose.model("users", userSchema);

export const database = {
  User,
};
