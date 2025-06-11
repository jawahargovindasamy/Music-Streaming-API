import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../Database/cloudinaryConfig.js";

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "Audio Streaming/profilePic", // Your Cloudinary folder path
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

const upload = multer({ storage });

export const uploadProfilePic = upload.single("profilePic"); // field name from frontend
export const uploadArtistPic = upload.single("image");
