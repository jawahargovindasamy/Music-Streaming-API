import mongoose from "mongoose";

const albumSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  artistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Artist",
    required: true,
  },
  coverImage: {
    type: String,
    default: "",
  },
  releaseDate: {
    type: Date,
    required: true,
    validate:{
      validator:  (value) => value <= Date.now(),
      message: "Release date cannot be in the future"
    }
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

const Album = mongoose.model("Album", albumSchema);
export default Album;
