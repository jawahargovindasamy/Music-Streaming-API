import express from "express";
import validateObjectId from "../Middleware/validateObjectId.js";
import { likeAndUnlikeItem } from "../Controllers/likeController.js";
import { authMiddleware } from "../Middleware/authMiddleware.js";

const router = express.Router();

router.post("/:id", validateObjectId("id"), authMiddleware, likeAndUnlikeItem);

export default router;
