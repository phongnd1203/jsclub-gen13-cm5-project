import app from "./app.js"; // Import app as the default export

import mongoose from "mongoose";

mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/Database")
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("Connect to MongoDB failed", error));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
