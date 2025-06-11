import Comment from "../Models/commentModel.js";
import Song from "../Models/songModel.js";
import Album from "../Models/albumModel.js";
import User from "../Models/userModel.js";

export const createComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { content, itemType } = req.body;
    const itemId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "user") {
      return res
        .status(403)
        .json({ message: "Only users can create comments" });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Comment Content is required" });
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

    const newComment = new Comment({
      userId,
      content: content.trim(),
      itemId,
      itemType,
    });

    await newComment.save();
    res.status(201).json({
      message: "Comment created successfully",
      data: {
        _id: newComment._id,
        content: newComment.content,
        itemType: newComment.itemType,
        itemId: newComment.itemId,
        createdAt: newComment.createdAt,
        user: {
          _id: user._id,
          username: user.username,
          profilePic: user.profilePic,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error while creating comment",
      error: error.message,
    });
  }
};

export const getAllComments = async (req, res) => {
  try {
    const { id, itemType } = req.params;

    // Validate itemType
    if (!["song", "album"].includes(itemType)) {
      return res.status(400).json({
        message: "Invalid itemType. Must be 'song' or 'album'",
      });
    }

    // Check if item exists
    const Model = itemType === "song" ? Song : Album;
    const item = await Model.findById(id);
    if (!item) {
      return res.status(404).json({
        message: `${
          itemType.charAt(0).toUpperCase() + itemType.slice(1)
        } not found`,
      });
    }

    // Fetch comments and populate user info
    const comments = await Comment.find({ itemId: id, itemType })
      .populate("userId", "username profilePic")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: comments.length
        ? "Comments fetched successfully"
        : "No comments yet",
      data: comments,
    });
  } catch (error) {
    console.error("Error in getAllComments:", error);
    return res.status(500).json({
      message: "Internal Server Error while fetching comments",
      error: error.message,
    });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const commentId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "Access Denied: You can only delete your own comments",
      });
    }

    await Comment.findByIdAndDelete(commentId);
    return res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error while deleting comment",
      error: error.message,
    });
  }
};
