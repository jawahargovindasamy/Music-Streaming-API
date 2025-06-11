import express from "express";
import { authMiddleware } from "../Middleware/authMiddleware.js";
import {
  createComment,
  deleteComment,
  getAllComments,
} from "../Controllers/commentController.js";
import validateObjectId from "../Middleware/validateObjectId.js";

const router = express.Router();

router.post("/:id", validateObjectId("id"), authMiddleware, createComment);
router.get("/:itemType/:id", validateObjectId("id"), getAllComments);
router.delete("/:id", validateObjectId("id"), authMiddleware, deleteComment);

export default router;
