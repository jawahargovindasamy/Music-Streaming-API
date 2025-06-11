import express from "express";
import { adminMiddleware } from "../Middleware/adminMiddleware.js";
import { getAdminStats } from "../Controllers/adminStatsController.js";


const router = express.Router();

router.get("/stats",adminMiddleware, getAdminStats)

export default router;