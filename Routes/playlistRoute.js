import express from "express";
import {
  addSongToPlaylist,
  createPlaylist,
  deletePlaylist,
  getPlaylistbyId,
  getPlaylistsbyUser,
  removeSongFromPlaylist,
  updatePlaylist,
} from "../Controllers/playlistController.js";
import { authMiddleware } from "../Middleware/authMiddleware.js";
import validateObjectId from "../Middleware/validateObjectId.js";

const router = express.Router();

router.post("/", authMiddleware, createPlaylist);
router.get("/", authMiddleware, getPlaylistsbyUser);
router.get("/:id", validateObjectId("id"), authMiddleware, getPlaylistbyId);
router.put("/:id", validateObjectId("id"), authMiddleware, updatePlaylist);
router.delete("/:id", validateObjectId("id"), authMiddleware, deletePlaylist);
router.put(
  "/:id/song",
  validateObjectId("id"),
  authMiddleware,
  addSongToPlaylist
);
router.delete(
  "/:id/song/:songId",
  validateObjectId("id"),
  validateObjectId("songId"),
  authMiddleware,
  removeSongFromPlaylist
);

export default router;
