import express from "express";
import { artistMiddleware } from "../Middleware/artistMiddleware.js";
import {
  createSong,
  deleteSong,
  downloadSong,
  getAllSongs,
  incrementPlayCount,
  updateSong,
} from "../Controllers/songController.js";
import { uploadSongs } from "../Middleware/songMiddleware.js";
import { adminMiddleware } from "../Middleware/adminMiddleware.js";
import validateObjectId from "../Middleware/validateObjectId.js";
import { authMiddleware } from "../Middleware/authMiddleware.js";

const router = express.Router();

router.post("/", artistMiddleware, uploadSongs, createSong);
router.get("/", getAllSongs);
router.put(
  "/:id",
  validateObjectId("id"),
  artistMiddleware,
  uploadSongs,
  updateSong
);
router.delete("/:id", validateObjectId("id"), adminMiddleware, deleteSong);
router.post("/:id/play", validateObjectId("id"), incrementPlayCount);
router.post("/:id/download", validateObjectId("id"),authMiddleware, downloadSong);

export default router;
