import Playlist from "../Models/playlistSchema.js";
import User from "../Models/userModel.js";
import Song from "../Models/songModel.js";
import { set } from "mongoose";

export const createPlaylist = async (req, res) => {
  try {
    const { title, description, songs } = req.body;
    const userId = req.user.id;

    const hasDuplicates = new Set(songs).size !== songs.length;

    if (hasDuplicates) {
      return res
        .status(400)
        .json({ message: "Duplicate songs are not allowed" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const validSongs = await Song.find({ _id: { $in: songs } });

    if (validSongs.length !== songs.length) {
      return res.status(400).json({ message: "One or more songs are invalid" });
    }

    const newPlaylist = new Playlist({
      userId: userId,
      title,
      description,
      songs,
    });

    await newPlaylist.save();
    res
      .status(201)
      .json({ message: "Playlist created successfully", data: newPlaylist });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error while creating playlist",
      error: error.message,
    });
  }
};

export const getPlaylistsbyUser = async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if user exists and is a regular user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "user") {
      return res
        .status(403)
        .json({ message: "Only users can access their playlists" });
    }

    //Only get playlists for this user
    const playlists = await Playlist.find({ userId })
      .populate("songs")
      .sort({ createdAt: -1 });

    if (playlists.length === 0) {
      return res
        .status(404)
        .json({ message: "No playlists found for this user" });
    }

    // Optional formatting
    const formattedPlaylists = playlists.map((playlist) => ({
      playlistId: playlist._id,
      title: playlist.title,
      description: playlist.description,
      songs: playlist.songs,
      createdAt: playlist.createdAt,
      updatedAt: playlist.updatedAt,
    }));

    res.status(200).json({
      message: "User playlists fetched successfully",
      data: formattedPlaylists,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error while getting playlists",
      error: error.message,
    });
  }
};

export const getPlaylistbyId = async (req, res) => {
  try {
    const playlistId = req.params.id;
    const userId = req.user.id;

    // Check if user exists and is a regular user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "user") {
      return res
        .status(403)
        .json({ message: "Only users can access their playlists" });
    }

    //Only get playlists for this user
    const playlist = await Playlist.findById(playlistId)
      .populate("songs")
      .sort({ createdAt: -1 });

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    res.status(200).json({
      message: "Playlist fetched successfully",
      data: playlist,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error while getting playlist by id",
      error: error.message,
    });
  }
};

export const updatePlaylist = async (req, res) => {
  try {
    const playlistId = req.params.id;
    const { title, description, songs } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "user") {
      return res
        .status(403)
        .json({ message: "Only users can update their playlists" });
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    if (playlist.userId.toString() !== userId) {
      return res.status(403).json({
        message: "Access denied: You can only update your own playlist",
      });
    }

    if (songs) {
      if (!Array.isArray(songs)) {
        return res
          .status(400)
          .json({ message: "Songs must be an array of song IDs" });
      }

      const hasDuplicates = new Set(songs).size !== songs.length;
      if (hasDuplicates) {
        return res
          .status(400)
          .json({ message: "Playlist cannot have duplicate songs" });
      }

      const validSongs = await Song.find({ _id: { $in: songs } });
      if (validSongs.length !== songs.length) {
        return res
          .status(400)
          .json({ message: "One or more song IDs are invalid" });
      }

      playlist.songs = songs;
    }

    if (title) playlist.title = title;
    if (description) playlist.description = description;

    playlist.updatedAt = Date.now();
    await playlist.save();

    res.status(200).json({
      message: "Playlist updated successfully",
      data: playlist,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error while updating playlist",
      error: error.message,
    });
  }
};

export const deletePlaylist = async (req, res) => {
  try {
    const playlistId = req.params.id;
    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "user") {
      return res
        .status(403)
        .json({ message: "Only users can delete their playlists" });
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    if (playlist.userId.toString() !== userId) {
      return res.status(403).json({
        message: "Access denied: You can only delete your own playlist",
      });
    }

    await Playlist.findByIdAndDelete(playlistId);

    res.status(200).json({
      message: "Playlist deleted successfully",
      data: playlist,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error while deleting playlist",
      error: error.message,
    });
  }
};

export const addSongToPlaylist = async (req, res) => {
  try {
    const playlistId = req.params.id;
    const userId = req.user.id;
    const { songId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.role !== "user") {
      return res
        .status(403)
        .json({ message: "Only users can modify playlists" });
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    if (playlist.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You can only modify your own playlists" });
    }

    if (!songId) {
      return res.status(400).json({ message: "songId is required" });
    }
    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({ message: "Song not found" });
    }

    if (playlist.songs.includes(songId)) {
      return res.status(400).json({ message: "Song already in playlist" });
    }

    playlist.songs.push(songId);
    playlist.updatedAt = Date.now();
    await playlist.save();

    res.status(200).json({
      message: "Song added to playlist successfully",
      data: playlist,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error while adding song to playlist",
      error: error.message,
    });
  }
};

export const removeSongFromPlaylist = async (req, res) => {
  try {
    const playlistId = req.params.id;
    const userId = req.user.id;
    const songId = req.params.songId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "user") {
      return res
        .status(403)
        .json({ message: "Only users can modify playlists" });
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    if (playlist.userId.toString() !== userId) {
      return res.status(403).json({
        message: "Access denied: You can only modify your own playlists",
      });
    }

    if (!playlist.songs.includes(songId)) {
      return res.status(400).json({ message: "Song not found in playlist" });
    }

    playlist.songs = playlist.songs.filter((id) => id.toString() !== songId);
    playlist.updatedAt = Date.now();
    await playlist.save();

    res.status(200).json({
      message: "Song removed from playlist successfully",
      data: playlist,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error while removing song from playlist",
      error: error.message,
    });
  }
};
