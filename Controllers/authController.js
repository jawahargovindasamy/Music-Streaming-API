import User from "../Models/userModel.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import sendEmail from "../Utils/mailer.js";

dotenv.config();

export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res
      .status(201)
      .json({ message: "User registered successfully", data: newUser });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error while registering user",
      error: error.message,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "7h",
      }
    );

    res.status(200).json({
      message: "User logged in successfully",
      token: token,
      role: user.role,
      userId: user._id,
      username: user.username,
      profilePic: user.profilePic,
      email: user.email,
      phone: user.phone,
      dob: user.dob,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error while logging in user",
      error: error.message,
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create a token valid for 1 hour
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Use backticks and include correct reset link URL (frontend URL)
    const resetLink = `http://localhost:5173/reset-password/${user._id}/${token}`;

    // Compose email text clearly
    const subject = "Password Reset Request";
    const text = `
Hi ${user.username},

You are receiving this email because you (or someone else) requested a password reset for your account.

Please click the following link or paste it into your browser to complete the process:
${resetLink}

If you did not request this, please ignore this email and your password will remain unchanged.

Thank you,
Your Application Team
`;

    // Send the email
    await sendEmail(user.email, subject, text);

    res.status(200).json({ message: "Password reset link sent to your email" });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error while processing forgot password",
      error: error.message,
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { id, token } = req.params;
    const { password } = req.body;

    // Verify token validity
    try {
      jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // Find user with matching id and resetToken
    const user = await User.findById(id);
    if (!user) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // Hash new password
    const hashPassword = await bcrypt.hash(password, 10);

    // Update password and clear resetToken
    user.password = hashPassword;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error while resetting password",
      error: error.message,
    });
  }
};
