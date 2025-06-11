import Artist from "../Models/artistModel.js";
import Album from "../Models/albumModel.js";
import User from "../Models/userModel.js";
import { populate } from "dotenv";

export const createAlbum = async (req, res) => {
  try {
    const { title, coverImage, releaseDate } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "artist") {
      return res.status(400).json({ message: "User is not an artist" });
    }

    const artist = await Artist.findOne({ userID: user._id });
    if (!artist) {
      return res.status(404).json({ message: "Artist not found" });
    }

    if (!title || !releaseDate) {
      return res
        .status(400)
        .json({ message: "Title and release date are required" });
    }

    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: "Cover image is required" });
    }

    const release = new Date(releaseDate);
    if (isNaN(release.getTime())) {
      return res.status(400).json({ message: "Invalid release date" });
    }

    const album = new Album({
      title,
      artistId: artist._id,
      coverImage: req.file.path,
      releaseDate: release,
    });

    await album.save();
    res
      .status(201)
      .json({ message: "Album created successfully", data: album });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error while creating album",
      error: error.message,
    });
  }
};

export const getAlbums = async (req, res) => {
  try {
    const albums = await Album.find().populate({
      path: "artistId",
      populate: {
        path: "userID",
        select: "username",
      },
    });

    if (!albums || albums.length === 0) {
      return res.status(404).json({ message: "No albums found" });
    }

    const formattedAlbums = albums.map((album) => {
      const artist = album.artistId;

      return {
        albumId: album._id,
        title: album.title,
        coverImage: album.coverImage,
        artistId: artist._id,
        artistName: artist.userID.username || "Unknown",
        releaseDate: album.releaseDate,
      };
    });

    res
      .status(200)
      .json({ message: "Albums fetched successfully", data: formattedAlbums });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error while getting albums",
      error: error.message,
    });
  }
};

export const getAlbumById = async (req, res) => {
  try {
    const { id } = req.params;

    const album = await Album.findById(id).populate({
      path: "artistId",
      populate: {
        path: "userID",
        select: "username",
      },
    });
    if (!album || album.length === 0) {
      return res.status(404).json({ message: "Album not found" });
    }

    const artist = album.artistId;

    const formattedAlbum = {
      albumId: album._id,
      title: album.title,
      coverImage: album.coverImage,
      artistId: artist._id,
      artistName: artist.userID?.username || "Unknown",
      bio: artist.bio,
      profilePic: artist.profilePic || "",
      releaseDate: album.releaseDate,
    };

    res
      .status(200)
      .json({ message: "Albums fetched successfully", data: formattedAlbum });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error while getting album by ID",
      error: error.message,
    });
  }
};

export const updateAlbum = async (req, res) => {
  try {
    const { id } = req.params;

    const album = await Album.findById(id);
    if (!album) {
      return res.status(404).json({ message: "Album not found" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "artist") {
      return res.status(400).json({ message: "User is not an artist" });
    }

    const artist = await Artist.findOne({ userID: user._id });
    if (!artist) {
      return res.status(404).json({ message: "Artist not found" });
    }

    if (artist._id.toString() !== album.artistId.toString()) {
      return res
        .status(403)
        .json({ message: "Access Denied: Only artist can update album" });
    }

    const { title, releaseDate } = req.body;

    if (title) {
      album.title = title;
    }

    if (releaseDate) {
      const release = new Date(releaseDate);
      if (isNaN(release.getTime())) {
        return res.status(400).json({ message: "Invalid release date" });
      }
      album.releaseDate = release;
    }

    if (req.file) {
      album.coverImage = req.file.path;
    }

    album.updatedAt = Date.now();
    await album.save();

    res
      .status(200)
      .json({ message: "Album updated successfully", data: album });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error while updating album",
      error: error.message,
    });
  }
};

export const deleteAlbum = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Access Denied: Only admin can delete album" });
    }

    const album = await Album.findByIdAndDelete(id);

    if (!album) {
      return res.status(404).json({ message: "Album not found" });
    }

    const albums = await Album.find();

    res
      .status(200)
      .json({ message: "Album deleted successfully", data: albums });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error while deleting album",
      error: error.message,
    });
  }
};
