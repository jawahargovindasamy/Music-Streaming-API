import Album from "../Models/albumModel.js";
import Artist from "../Models/artistModel.js";
import Song from "../Models/songModel.js";
import User from "../Models/userModel.js";

export const createArtist = async (req, res) => {
  try {
    if (!["admin", "artist"].includes(req.user.role)) {
      return res.status(403).json({
        message: "Access Denied: Only admin or artist can create artist",
      });
    }
    const userID = req.body.userId;

    const user = await User.findById(userID);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "artist") {
      return res.status(400).json({ message: "User is not an artist" });
    }

    const existingUser = await Artist.findOne({ userID: userID });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Artist profile already exists for this user" });
    }

    const { bio } = req.body;

    if (!bio) {
      return res.status(400).json({ message: "bio is required" });
    }

    let image = "";

    if (req.file && req.file.path) {
      image = req.file.path;
    }

    const artistData = {
      userID: userID,
      bio,
      image,
    };

    const newArtist = new Artist(artistData);
    await newArtist.save();

    res
      .status(201)
      .json({ message: "Artist created successfully", data: newArtist });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error while creating artist",
      error: error.message,
    });
  }
};

export const getAllArtists = async (req, res) => {
  try {
    const artists = await Artist.find()
      .populate("userID", "username")
      .select("bio image userID");

    if (artists.length === 0) {
      return res.status(404).json({ message: "No artists found" });
    }

    const formattedArtists = artists.map((artists) => ({
      artistId: artists._id,
      username: artists.userID.username,
      bio: artists.bio,
      image: artists.image,
    }));

    res.status(200).json({
      message: "Artists fetched successfully",
      data: formattedArtists,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error while getting artists",
      error: error.message,
    });
  }
};

export const getArtistById = async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id).populate("userID", "username role");

    if (!artist) {
      return res.status(404).json({ message: "Artist not found" });
    }

    if (artist.userID.role !== "artist") {
      return res.status(400).json({ message: "User is not an artist" });
    }

    const albums = await Album.find({ artistId: artist._id });
    const songs = await Song.find({ artistId: artist._id }).sort({ playCount: -1 });

    // Total play count = fake monthly listeners
    const monthlyListeners = songs.reduce((acc, song) => acc + song.playCount, 0);
    const followers = artist.followersCount || artist.followers?.length || 0;

    // MOCK last month data (you should store this in DB later)
    const followersLastMonth = Math.max(0, Math.floor(followers * 0.88)); // assume 12% growth
    const monthlyListenersLastMonth = Math.max(0, Math.floor(monthlyListeners * 0.92)); // assume 8% growth

    const calculateChange = (current, previous) => {
      if (previous === 0) return 100;
      return ((current - previous) / previous) * 100;
    };

    const formattedArtist = {
      artistId: artist._id,
      username: artist.userID.username,
      bio: artist.bio,
      profilePic: artist.image,
      followers,
      followersLastMonth,
      followersChange: calculateChange(followers, followersLastMonth), // % change

      monthlyListeners,
      monthlyListenersLastMonth,
      monthlyListenersChange: calculateChange(monthlyListeners, monthlyListenersLastMonth), // % change

      totalAlbums: albums.length,
      totalSongs: songs.length,

      albums: albums.map((album) => ({
        albumId: album._id,
        title: album.title,
        coverImage: album.coverImage,
        releaseDate: album.releaseDate,
      })),

      songs: songs.map((song) => ({
        songId: song._id,
        title: song.title,
        audioUrl: song.fileUrl,
        albumId: song.albumId,
        duration: song.duration,
        playCount: song.playCount,
      })),
    };

    res.status(200).json({
      message: "Artist fetched successfully",
      data: formattedArtist,
    });

  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error while getting artist by ID",
      error: error.message,
    });
  }
};



export const updateArtist = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, bio, image } = req.body;

    const artist = await Artist.findById(id);

    if (!artist) {
      return res.status(404).json({ message: "Artist not found" });
    }

    if (
      req.user.role !== "artist" ||
      artist.userID.toString() !== req.user.id.toString()
    ) {
      return res.status(403).json({
        message: "Access Denied: Only artist can update artist",
      });
    }

    if (username) {
      await User.findByIdAndUpdate(artist.userID, { username });
    }

    if (bio) artist.bio = bio;
    if (image) artist.image = image;
    artist.updatedAt = Date.now();
    await artist.save();

    const updatedArtist = await Artist.findById(id)
      .populate("userID", "username")
      .select("bio image userID");

    const formattedArtist = {
      username: updatedArtist.userID.username,
      bio: updatedArtist.bio,
      image: updatedArtist.image,
    };

    res.status(200).json({
      message: "Artist updated successfully",
      data: formattedArtist,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error while updating artist",
      error: error.message,
    });
  }
};

export const artistFollow = async (req, res) => {
  try {
    const artistId = req.params.id;
    const userId = req.user.id;

    const artist = await Artist.findById(artistId);
    if (!artist) {
      return res.status(404).json({ message: "Artist not found" });
    }

    if (req.user.role !== "user") {
      return res.status(403).json({
        message: "Access Denied: Only user can follow artist",
      });
    }

    if (artist.userID.toString() === userId.toString()) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    if (artist.followers.includes(userId)) {
      return res
        .status(400)
        .json({ message: "You are already following this artist" });
    }

    artist.followers.push(userId);
    artist.followersCount = artist.followers.length;
    await artist.save();

    res.status(200).json({
      message: "Artist followed successfully",
      data: artist.followersCount,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error while following artist",
      error: error.message,
    });
  }
};

export const artistUnfollow = async (req, res) => {
  try {
    const artistId = req.params.id;
    const userId = req.user.id;

    const artist = await Artist.findById(artistId);
    if (!artist) {
      return res.status(404).json({ message: "Artist not found" });
    }

    if (req.user.role !== "user") {
      return res.status(403).json({
        message: "Access Denied: Only user can unfollow artist",
      });
    }

    if (artist.userID.toString() === userId.toString()) {
      return res.status(400).json({ message: "You cannot unfollow yourself" });
    }

    if (!artist.followers.includes(userId)) {
      return res
        .status(400)
        .json({ message: "You are not following this artist" });
    }

    artist.followers.pull(userId);
    artist.followersCount = artist.followers.length;
    await artist.save();

    res.status(200).json({
      message: "Artist unfollowed successfully",
      data: artist.followersCount,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error while unfollowing artist",
      error: error.message,
    });
  }
};

export const getAllFollowers = async (req, res) => {
  try {
    const artistId = req.params.id;

    const artist = await Artist.findById(artistId).populate(
      "followers",
      "username email profilePic"
    );

    if (!artist) {
      return res.status(404).json({ message: "Artist not found" });
    }

    if (
      req.user.role !== "admin" &&
      artist.userID.toString() !== req.user.id.toString()
    ) {
      return res.status(403).json({
        message: "Access Denied: Only admin or artist owner can get followers",
      });
    }

    res.status(200).json({
      message: "Followers fetched successfully",
      data: artist.followers,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error while getting followers",
      error: error.message,
    });
  }
};

export const getTopArtistsByFollowers = async (req, res) => {
  try {
    const artists = await Artist.find()
      .populate("userID", "username")
      .sort({ followersCount: -1 })
      .select("bio image userID followersCount");

    const formattedArtists = artists.map((artist) => ({
      artistId: artist._id,
      username: artist.userID.username,
      bio: artist.bio,
      image: artist.image,
      followersCount: artist.followersCount,
    }));
    res.status(200).json({
      message: "Top artists fetched successfully",
      data: formattedArtists,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error while getting top artists",
      error: error.message,
    });
  }
};


export const deleteArtist = async (req, res) => {
  const { id } = req.params;

  try {
    // Step 1: Find the artist
    const artist = await Artist.findById(id);
    if (!artist) {
      return res.status(404).json({ message: "Artist not found" });
    }

    const userId = artist.userID;

    // Step 2: Find all albums by this artist
    const albums = await Album.find({ artistId: id });
    const albumIds = albums.map((album) => album._id);

    // Step 3: Delete all songs by this artist or in the artist's albums
    await Song.deleteMany({
      $or: [{ artistId: id }, { albumId: { $in: albumIds } }],
    });

    // Step 4: Delete all albums by this artist
    await Album.deleteMany({ artistId: id });

    // Step 5: Delete the artist
    await Artist.findByIdAndDelete(id);

    // Step 6: Delete the linked user
    await User.findByIdAndDelete(userId);

    return res.status(200).json({ message: "Artist and related data deleted successfully" });
  } catch (error) {
    console.error("Error deleting artist:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

