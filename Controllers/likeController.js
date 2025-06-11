import Song from "../Models/songModel.js";
import User from "../Models/userModel.js";
import Album from "../Models/albumModel.js";
import Like from "../Models/likeModel.js";

export const likeAndUnlikeItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemType } = req.body;
    const itemId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!["song", "album"].includes(itemType)) {
      return res
        .status(400)
        .json({ message: "Invalid itemType. Must be 'song' or 'album'" });
    }

    const Model = itemType === "song" ? Song : Album;
    const item = await Model.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: `${itemType} not found` });
    }

    const existingLike = await Like.findOne({ userId, itemId, itemType });

    if (existingLike) {
      await existingLike.deleteOne();
      return res.status(200).json({
        message: `${itemType} unliked successfully`,
        data: existingLike,
      });
    }

    const newLike = new Like({ userId, itemId, itemType });
    await newLike.save();

    return res
      .status(201)
      .json({ message: `${itemType} liked successfully`, data: newLike });
  } catch (error) {
    console.error("Error in likeAndUnlikeItem:", error);
    return res.status(500).json({
      message: "Internal Server Error while liking/unliking item",
      error: error.message,
    });
  }
};
