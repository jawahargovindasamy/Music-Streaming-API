import mongoose from "mongoose";

const songSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255,
  },
  artistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Artist",
    required: true,
  },
  albumId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Album",
    required: true,
  },
  genre: {
    type: String,
    default: "",
    trim: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  playCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  downloadCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Song = mongoose.model("Song", songSchema);
export default Song;
