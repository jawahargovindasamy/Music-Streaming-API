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


export const getAllCommentsbyArtistId = async (req, res) => {
  try {
    const { id } = req.params;
    let {
      page = 1,
      limit = 10,
      startDate,
      endDate,
      itemType = "song",
      title = "",
    } = req.query;

    // Normalize and log itemType
    itemType = String(itemType).trim().toLowerCase();
    console.log("Normalized itemType:", itemType);

    if (!["song", "album"].includes(itemType)) {
      return res.status(400).json({
        message: "Invalid itemType. Must be 'song' or 'album'",
        received: itemType,
      });
    }

    const skip = (page - 1) * limit;
    const itemModel = itemType === "album" ? Album : Song;

    const itemQuery = { artistId: id };
    if (title) {
      itemQuery.title = { $regex: title, $options: "i" };
    }

    const items = await itemModel.find(itemQuery).select("_id title");
    if (!items.length) {
      return res.status(404).json({ message: `No ${itemType}s found for artist` });
    }

    const itemIds = items.map((item) => item._id);

    const commentQuery = {
      itemType,
      itemId: { $in: itemIds },
    };

    if (startDate || endDate) {
      commentQuery.createdAt = {};
      if (startDate) commentQuery.createdAt.$gte = new Date(startDate);
      if (endDate) commentQuery.createdAt.$lte = new Date(endDate);
    }

    const comments = await Comment.find(commentQuery)
      .populate("userId", "username profilePic email")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const totalCount = await Comment.countDocuments(commentQuery);

    const flattenedComments = comments.map((comment) => {
      const item = items.find(
        (i) => i._id.toString() === comment.itemId.toString()
      );
      return {
        ...comment.toObject(),
        itemTitle: item ? item.title : "Unknown",
      };
    });

    return res.status(200).json({
      message: `Comments on ${itemType}s fetched successfully`,
      totalItems: totalCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / limit),
      data: flattenedComments,
    });
  } catch (error) {
    console.error("Error in getAllCommentsbyArtistId:", error);
    return res.status(500).json({
      message: "Internal Server Error while fetching artist comments",
      error: error.message,
    });
  }
};




