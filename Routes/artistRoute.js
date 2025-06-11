import express from "express";
import {
  artistFollow,
  artistUnfollow,
  createArtist,
  getAllArtists,
  getAllFollowers,
  getArtistById,
  getTopArtistsByFollowers,
  updateArtist,
} from "../Controllers/artistController.js";
import { authMiddleware } from "../Middleware/authMiddleware.js";
import { uploadArtistPic } from "../Middleware/profilePicMiddlewar.js";
import { adminMiddleware } from "../Middleware/adminMiddleware.js";
import { artistMiddleware } from "../Middleware/artistMiddleware.js";
import validateObjectId from "../Middleware/validateObjectId.js";

const router = express.Router();

router.post("/", adminMiddleware, uploadArtistPic, createArtist);
router.get("/", getAllArtists);
router.get("/top", getTopArtistsByFollowers);
router.get("/:id", validateObjectId("id"), getArtistById);
router.put(
  "/:id",
  validateObjectId("id"),
  artistMiddleware,
  uploadArtistPic,
  updateArtist
);
router.put("/:id/follow", validateObjectId("id"), authMiddleware, artistFollow);
router.put(
  "/:id/unfollow",
  validateObjectId("id"),
  authMiddleware,
  artistUnfollow
);
router.get(
  "/:id/followers",
  validateObjectId("id"),
  authMiddleware,
  getAllFollowers
);

export default router;
