import { Router } from "express";

import { healthController } from "../controllers/health.js";

export const healthRouter = Router();

healthRouter.get("/", healthController);
