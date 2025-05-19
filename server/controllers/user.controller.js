import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { sendVerificationAdminEmail } from "../mailtrap/emails.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import mongoose from "mongoose";

export const createUser = async (req, res) => {
  const user = req.body;

  if (
    !user.first_name ||
    !user.last_name ||
    !user.email ||
    !user.phone_number ||
    !user.country ||
    !user.region ||
    !user.city ||
    !user.address ||
    !user.zip_code ||
    !user.emergency_contact_full_name ||
    !user.emergency_contact_number ||
    !user.role ||
    !user.password
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide all fields" });
  }

  try {
    const userAlreadyExists = await User.findOne({ email: user.email });
    if (userAlreadyExists) {
      return res.status(400).json({
        success: false,
        message: "Email already exists.",
      });
    }

    const hashedPassword = await bcryptjs.hash(user.password, 10);

    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const lastUser = await User.findOne().sort({ user_id: -1 });
    const newUserId =
      lastUser && lastUser.user_id != null ? lastUser.user_id + 1 : 1;

    const newUser = new User({
      ...user,
      user_id: newUserId,
      password: hashedPassword,
      role: user.role || "PE",
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });

    await newUser.save();

    generateTokenAndSetCookie(res, newUser._id);

    await sendVerificationAdminEmail(
      user.email,
      verificationToken,
      user.password
    );

    res.status(201).json({ success: true, data: newUser });
  } catch (error) {
    console.error("Error in create user:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error("Error in get users:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error("Error in get user by id:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const user = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ success: false, message: "Invalid user id" });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(id, user, {
      new: true,
    });
    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await User.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "User deleted" });
  } catch (error) {
    console.error("Error in delete user:", error.message);
    res.status(404).json({ success: false, message: "User not found" });
  }
};

export const verifyEmail = async (req, res) => {
  const { code } = req.body;
  try {
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();

    await sendWelcomeEmail(user.email, user.name);

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.log("error in verifyEmail ", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Approve User (PATCH)
export const approveUser = async (req, res) => {
  try {
    const { user_id } = req.params;

    const user = await User.findOneAndUpdate(
      { user_id },
      { isApproved: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ errorMessage: "User not found" });
    }

    res.status(200).json({ message: "User approved successfully", user });
  } catch (error) {
    res.status(500).json({ errorMessage: error.message });
  }
};

// Reject User (PATCH)
export const rejectUser = async (req, res) => {
  try {
    const { user_id } = req.params;

    const user = await User.findOneAndDelete({ user_id });

    if (!user) {
      return res.status(404).json({ errorMessage: "User not found" });
    }

    res.status(200).json({ message: "User rejected and removed successfully" });
  } catch (error) {
    res.status(500).json({ errorMessage: error.message });
  }
};
