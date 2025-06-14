import express from "express";
import { artistMiddleware } from "../Middleware/artistMiddleware.js";
import { uploadAlbumPic } from "../Middleware/albumPicMiddleware.js";
import {
  createAlbum,
  deleteAlbum,
  getAlbumById,
  getAlbums,
  getAlbumsByArtistId,
  updateAlbum,
} from "../Controllers/albumController.js";
import validateObjectId from "../Middleware/validateObjectId.js";
import { adminMiddleware } from "../Middleware/adminMiddleware.js";

const router = express.Router();

router.post("/", artistMiddleware, uploadAlbumPic, createAlbum);
router.get("/", getAlbums);
router.get("/:id", validateObjectId("id"), getAlbumById);
router.get("/artist/:id", validateObjectId("id"), getAlbumsByArtistId);
router.put(
  "/:id",
  validateObjectId("id"),
  artistMiddleware,
  uploadAlbumPic,
  updateAlbum
);
router.delete("/:id", validateObjectId("id"), adminMiddleware, deleteAlbum);

export default router;
