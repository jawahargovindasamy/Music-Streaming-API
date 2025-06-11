import User from "../Models/userModel.js";

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
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (req.user.role !== "admin" && req.user.id.toString() !== req.params.id) {
      return res.status(403).json({
        message:
          "Access Denied: Only admin or the account owner can update this user",
      });
    }
    if (req.file && req.file.path) {
      req.body.profilePic = req.file.path;
    }
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res
      .status(200)
      .json({ message: "User updated successfully", data: updatedUser });
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
