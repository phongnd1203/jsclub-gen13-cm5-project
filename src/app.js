import express from "express";

import { healthRouter } from "./routers/health.js";

export const app = express();

app.use("/health", healthRouter);
