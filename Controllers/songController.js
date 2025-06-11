import Song from "../Models/songModel.js";
import Album from "../Models/albumModel.js";
import Artist from "../Models/artistModel.js";
import User from "../Models/userModel.js";

export const createSong = async (req, res) => {
  try {
    const { title, albumId, genre, duration } = req.body;
    const userId = req.user.id;

    if (!title || !albumId || !genre || !duration) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (isNaN(duration) || Number(duration) <= 0) {
      return res
        .status(400)
        .json({ message: "Duration must be a positive number" });
    }

    const album = await Album.findById(albumId);
    if (!album) {
      return res.status(404).json({ message: "Album not found" });
    }

    const artist = await Artist.findById(album.artistId);
    if (!artist) {
      return res.status(404).json({ message: "Artist not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "artist") {
      return res.status(400).json({ message: "User is not an artist" });
    }

    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: "Song file is required" });
    }

    const newSong = new Song({
      title,
      artistId: artist._id,
      albumId,
      genre,
      duration: Number(duration),
      fileUrl: req.file.secure_url || req.file.path,
    });

    await newSong.save();

    res
      .status(201)
      .json({ message: "Song created successfully", data: newSong });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error while creating song",
      error: error.message || error.toString(),
    });
    console.log(error);
  }
};

export const getAllSongs = async (req, res) => {
  try {
    const { search = "", sortBy = "createdAt", order = "desc" } = req.query;

    const pipeline = [
      {
        $lookup: {
          from: "artists",
          localField: "artistId",
          foreignField: "_id",
          as: "artist",
        },
      },
      { $unwind: "$artist" },
      {
        $lookup: {
          from: "users",
          localField: "artist.userID",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $lookup: {
          from: "albums",
          localField: "albumId",
          foreignField: "_id",
          as: "album",
        },
      },
      { $unwind: "$album" },
    ];

    // Multi-field search
    if (search.trim()) {
      pipeline.push({
        $match: {
          $or: [
            { title: { $regex: search, $options: "i" } }, // Song title
            { genre: { $regex: search, $options: "i" } }, // Genre
            { "user.username": { $regex: search, $options: "i" } }, // Artist username
            { "album.title": { $regex: search, $options: "i" } }, // Album title
          ],
        },
      });
    }

    const validSortFields = ["createdAt", "playCount", "title"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "createdAt";
    const sortOrder = order === "asc" ? 1 : -1;

    pipeline.push({
      $sort: { [sortField]: sortOrder },
    });

    pipeline.push({
      $project: {
        _id: 1,
        title: 1,
        genre: 1,
        duration: 1,
        playCount: 1,
        fileUrl: 1,
        createdAt: 1,
        updatedAt: 1,
        artistName: "$user.username",
        albumTitle: "$album.title",
      },
    });

    const songs = await Song.aggregate(pipeline);

    res.status(200).json({
      message: "Songs fetched successfully",
      count: songs.length,
      data: songs,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching songs",
      error: error.message,
    });
  }
};

export const updateSong = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, genre, duration } = req.body;
    const userId = req.user.id;

    const song = await Song.findById(id);
    if (!song) {
      return res.status(404).json({ message: "Song not found" });
    }

    const artist = await Artist.findById(song.artistId);
    if (!artist) {
      return res.status(404).json({ message: "Artist not found" });
    }

    const user = await User.findById(userId);
    if (!user || user.role !== "artist") {
      return res.status(403).json({ message: "Only artists can update songs" });
    }

    const artistOfUser = await Artist.findOne({ userID: user._id });
    if (
      !artistOfUser ||
      artistOfUser._id.toString() !== artist._id.toString()
    ) {
      return res.status(403).json({
        message: "Access denied: You can only update your own songs",
      });
    }

    if (title) song.title = title;
    if (genre) song.genre = genre;
    if (duration) {
      if (isNaN(duration) || Number(duration) <= 0) {
        return res
          .status(400)
          .json({ message: "Duration must be a positive number" });
      }
      song.duration = Number(duration);
    }

    if (req.file && req.file.path) {
      song.fileUrl = req.file.path;
    }

    song.updatedAt = Date.now();

    await song.save();

    res.status(200).json({
      message: "Song updated successfully",
      data: song,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating song",
      error: error.message,
    });
  }
};

export const deleteSong = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is admin
    const user = await User.findById(req.user.id);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Only admin can delete songs" });
    }

    // Delete song directly
    const deletedSong = await Song.findByIdAndDelete(id);
    if (!deletedSong) {
      return res.status(404).json({ message: "Song not found" });
    }

    res.status(200).json({
      message: "Song deleted successfully",
      data: deletedSong,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting song",
      error: error.message,
    });
  }
};

export const incrementPlayCount = async (req, res) => {
  try {
    const { id } = req.params;

    const song = await Song.findById(id);
    if (!song) {
      return res.status(404).json({ message: "Song not found" });
    }

    song.playCount += 1;
    await song.save();

    res.status(200).json({
      message: "Play count incremented",
      data: {
        _id: song._id,
        title: song.title,
        playCount: song.playCount,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error incrementing play count",
      error: error.message,
    });
  }
};

export const downloadSong = async (req, res) => {
  try {
    const songId = req.params.id;

    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({ message: "Song not found" });
    }

    song.downloadCount += 1;
    await song.save();

    return res.status(200).json({
      message: "Download started",
      fileUrl: song.fileUrl,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error while downloading song",
      error: error.message,
    });
  }
};
