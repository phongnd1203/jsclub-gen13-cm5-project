import express from "express";
import path from "path";
import router from "./routers/home.js";

export const app = express();

// Thiết lập thư mục chứa views
app.set("views", path.join("src", "views"));
app.set("view engine", "ejs");

// Thiết lập liên kết tới thư mục public
app.use(express.static("src"));

// khai báo sử dụng req.body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// sử dụng router
app.use(router);
