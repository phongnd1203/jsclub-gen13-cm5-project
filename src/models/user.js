import mongoose from "mongoose";

// Define user schema and model
const userSchema = new mongoose.Schema(
  {
    username: String,
    password: String,
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model("User", userSchema);

export const database = {
  User,
};
