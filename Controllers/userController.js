import User from "../Models/userModel.js";
import Artist from "../Models/artistModel.js";

export const getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Access Denied only Admin can Access" });
    }

    const users = await User.find().select("-password");
    res
      .status(200)
      .json({ message: "Users fetched successfully", data: users });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error while getting users",
      error: error.message,
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User fetched successfully", data: user });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error while getting user",
      error: error.message,
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const updatePayload = req.body;

    // Fetch existing user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Allow only admin or the account owner
    if (req.user.role !== "admin" && req.user.id.toString() !== userId) {
      return res.status(403).json({
        message: "Access Denied: Only admin or the account owner can update this user",
      });
    }

    const isRoleBeingUpdatedToArtist =
      req.user.role === "admin" && updatePayload.role === "artist" && user.role !== "artist";

    // Update the user
    const updatedUser = await User.findByIdAndUpdate(userId, updatePayload, {
      new: true,
    });

    // If role changed to artist and not already an artist, create Artist record
    if (isRoleBeingUpdatedToArtist) {
      const existingArtist = await Artist.findOne({ userID: userId });
      if (!existingArtist) {
        await Artist.create({
          userID: userId,
          bio: "This artist hasn't added a bio yet.", // default bio
          image: updatedUser.profilePic,
        });
      }
    }

    res.status(200).json({
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error while updating user",
      error: error.message,
    });
  }
};



export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (req.user.role !== "admin" && req.user.id.toString() !== req.params.id) {
      return res.status(403).json({
        message:
          "Access Denied: Only admin or the account owner can delete this user",
      });
    }
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error while deleting user",
      error: error.message,
    });
  }
};
