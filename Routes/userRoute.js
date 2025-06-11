import express from "express";
import {
  deleteUser,
  getAllUsers,
  getUserById,
  updateUser,
} from "../Controllers/userController.js";
import { adminMiddleware } from "../Middleware/adminMiddleware.js";
import { authMiddleware } from "../Middleware/authMiddleware.js";
import { uploadProfilePic } from "../Middleware/profilePicMiddlewar.js";
import validateObjectId from "../Middleware/validateObjectId.js";

const router = express.Router();

router.get("/", adminMiddleware, getAllUsers);
router.get("/:id", validateObjectId("id"), authMiddleware, getUserById);
router.put(
  "/:id",
  validateObjectId("id"),
  authMiddleware,
  uploadProfilePic,
  updateUser
);
router.delete("/:id", validateObjectId("id"), authMiddleware, deleteUser);

export default router;
