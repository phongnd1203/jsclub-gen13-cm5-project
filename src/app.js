import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import homeRouter from "./routers/home.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Set the view engine to EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Thiết lập liên kết tới thư mục public
app.use(express.static("src"));

// khai báo sử dụng req.body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// sử dụng router
app.use("/", homeRouter);

export default app; // Export app as the default export
