import bcryptjs from "bcryptjs";
import crypto from "crypto";
import path from "path";
import fs from "fs";

import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import {
  sendPasswordResetEmail,
  sendResetSuccessEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
  sendVerificationAdminEmail,
  sendEmailChangeConfirmation,
} from "../mailtrap/emails.js";
import { transporter, sender } from "../mailtrap/mailtrap.config.js";
import { VERIFICATION_EMAIL_TEMPLATE } from "../mailtrap/emailTemplates.js";

import User from "../models/user.model.js";

// Store verification codes temporarily (in production, use Redis or similar)
const emailVerificationCodes = new Map();

// Generate a random 6-digit code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const register = async (req, res) => {
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
      role: user.role || "Employee",
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });

    await newUser.save();

    generateTokenAndSetCookie(res, newUser._id);

    await sendVerificationEmail(user.email, verificationToken);

    res.status(201).json({ success: true, data: newUser });
  } catch (error) {
    console.error("Error in create user:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const verifyEmail = async (req, res) => {
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

    // Combine first_name and last_name for the welcome email
    const fullName = `${user.first_name} ${user.last_name}`;
    await sendWelcomeEmail(user.email, fullName);

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

const login = async (req, res) => {
  const { email, password } = req.body;
  console.log("Login attempt for email:", email);

  if (!email && !password) {
    console.log("Missing both email and password");
    return res.status(400).json({
      success: false,
      error: {
        code: "MISSING_FIELDS",
        message: "Email and password are required.",
      },
    });
  }

  if (!email) {
    console.log("Missing email");
    return res.status(400).json({
      success: false,
      error: {
        code: "MISSING_FIELDS",
        message: "Email is required.",
      },
    });
  }

  if (!password) {
    console.log("Missing password");
    return res.status(400).json({
      success: false,
      error: {
        code: "MISSING_FIELDS",
        message: "Password is required.",
      },
    });
  }

  try {
    const user = await User.findOne({ email });
    console.log("User found:", user ? "Yes" : "No");

    if (!user) {
      return res.status(400).json({
        success: false,
        error: {
          code: "USER_NOT_FOUND",
          message: "No user found with the provided email.",
        },
      });
    }

    console.log("User verification status:", user.isVerified);
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        error: {
          code: "EMAIL_NOT_VERIFIED",
          message: "Please verify your email first.",
        },
      });
    }

    console.log("User approval status:", user.isApproved);
    if (!user.isApproved) {
      return res.status(403).json({
        success: false,
        error: {
          code: "ACCOUNT_NOT_APPROVED",
          message: "Account not approved by admin.",
        },
      });
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);
    console.log("Password valid:", isPasswordValid);

    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Invalid credentials.",
        },
      });
    }

    generateTokenAndSetCookie(res, user._id);

    user.lastLogin = new Date();
    await user.save();

    console.log("Login successful for user:", user._id);
    res.status(200).json({
      success: true,
      message: "Logged in successfully.",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "An unexpected error occurred. Please try again later.",
        details: error.message,
      },
    });
  }
};

const logout = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!email) {
      return res.status(400).json({
        success: false,
        error: {
          code: "MISSING_FIELDS",
          message: "Email is required.",
        },
      });
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        error: {
          code: "USER_NOT_FOUND",
          message: "No user found with the provided email.",
        },
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;

    await user.save();

    // send email
    await sendPasswordResetEmail(
      user.email,
      `${process.env.CLIENT_URL}/reset-password/${resetToken}`
    );

    res.status(200).json({
      success: true,
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    console.log("Error in forgotPassword ", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    // Check if password or confirm password is missing
    if (!password && !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password are required.",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "New password is required.",
      });
    }

    if (!confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Confirm password is required.",
      });
    }

    // Check if new password and confirm password match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password do not match.",
      });
    }

    // Find user with matching reset token and check if it is expired
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // Hash and update password
    const hashedPassword = await bcryptjs.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;

    await user.save();

    // Send success email
    await sendResetSuccessEmail(user.email);

    return res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.log("Error in resetPassword ", error);
    return res.status(400).json({
      success: false,
      message: error.message || "An error occurred during the reset process",
    });
  }
};

const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.log("Error in checkAuth ", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({
      email,
      isVerified: false,
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found or already verified",
      });
    }

    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    user.verificationToken = verificationToken;
    user.verificationTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    await user.save();

    await sendVerificationEmail(user.email, verificationToken);

    res.status(200).json({
      success: true,
      message: "Verification code resent successfully",
    });
  } catch (error) {
    console.error("Error in resendVerification:", error);
    res.status(500).json({
      success: false,
      message: "Error resending verification code",
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.userId; // From verifyToken middleware
    const { emergency_contact_full_name, emergency_contact_number, avatar } =
      req.body;

    console.log("Updating profile for user:", userId);
    console.log("Received avatar URL:", avatar);
    console.log("Received form data:", req.body);

    const updateData = {
      ...(emergency_contact_full_name && { emergency_contact_full_name }),
      ...(emergency_contact_number && { emergency_contact_number }),
    };

    // If we receive a Cloudinary URL directly
    if (avatar && typeof avatar === "string" && avatar.startsWith("http")) {
      updateData.avatar = avatar;
      console.log("Setting Cloudinary avatar URL:", avatar);
    }
    // If we receive a file upload
    else if (req.file) {
      const baseUrl =
        process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
      updateData.avatar = `/uploads/avatars/${req.file.filename}`;
      console.log("Setting local file avatar path:", updateData.avatar);
    }

    console.log("Final update data:", updateData);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!updatedUser) {
      // If avatar was uploaded but user update failed, delete the uploaded file
      if (req.file) {
        const filePath = path.join(
          __dirname,
          "..",
          "uploads",
          "avatars",
          req.file.filename
        );
        fs.unlink(filePath, (err) => {
          if (err) console.error("Error deleting avatar file:", err);
        });
      }

      console.log("User not found:", userId);
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Add the full URL for the avatar
    const userResponse = updatedUser.toObject();
    if (userResponse.avatar) {
      // If it's already a full URL (like Cloudinary), use it as is
      userResponse.avatar = userResponse.avatar.startsWith("http")
        ? userResponse.avatar
        : `${process.env.BASE_URL || `${req.protocol}://${req.get("host")}`}${
            userResponse.avatar
          }`;

      console.log("Final avatar URL:", userResponse.avatar);
    }

    console.log("Profile updated successfully:", userResponse);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: userResponse,
    });
  } catch (error) {
    // If there was an error and a file was uploaded, delete it
    if (req.file) {
      const filePath = path.join(
        __dirname,
        "..",
        "uploads",
        "avatars",
        req.file.filename
      );
      fs.unlink(filePath, (err) => {
        if (err) console.error("Error deleting avatar file:", err);
      });
    }

    console.error("Error in updateProfile:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error updating profile",
    });
  }
};

const requestEmailChange = async (req, res) => {
  try {
    const userId = req.userId;
    const { newEmail } = req.body;

    // Input validation
    if (!newEmail) {
      return res.status(400).json({
        success: false,
        message: "New email is required",
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Get current user
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if new email is same as current email
    if (currentUser.email === newEmail) {
      return res.status(400).json({
        success: false,
        message: "New email cannot be the same as your current email",
      });
    }

    // Check if email is already in use
    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email is already in use by another account",
      });
    }

    // Generate verification code
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    const verificationExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    try {
      // Prepare email content
      const emailContent = VERIFICATION_EMAIL_TEMPLATE.replace(
        "{verificationCode}",
        verificationCode
      )
        .replace("signing up", "requesting to change your email")
        .replace("registration", "email change")
        .replace("create an account", "change your email");

      // Send verification email
      const mailOptions = {
        from: {
          name: sender.name,
          address: sender.email,
        },
        to: newEmail,
        subject: "Email Change Verification",
        html: emailContent,
      };

      // Attempt to send email
      const info = await transporter.sendMail(mailOptions);

      if (!info || !info.messageId) {
        throw new Error("Failed to send email");
      }

      // Save the request in the user document
      currentUser.emailChangeRequest = {
        newEmail,
        verificationCode,
        expiresAt: verificationExpiry,
        attempts: 0,
      };
      await currentUser.save();

      console.log("Email change request saved:", {
        userId: currentUser._id,
        newEmail,
        verificationCode,
        expiresAt: verificationExpiry,
      });

      res.status(200).json({
        success: true,
        message: "Verification code sent to new email",
        expiresIn: "10 minutes",
      });
    } catch (emailError) {
      console.error("Email sending error:", emailError);
      return res.status(500).json({
        success: false,
        message: "Failed to send verification email. Please try again.",
      });
    }
  } catch (error) {
    console.error("Error in requestEmailChange:", error);
    res.status(500).json({
      success: false,
      message: "Error requesting email change. Please try again later.",
    });
  }
};

const verifyEmailChange = async (req, res) => {
  try {
    const userId = req.userId;
    const { code, newEmail, currentEmail } = req.body;

    console.log("Verifying email change request:", {
      userId,
      code,
      newEmail,
      currentEmail,
    });

    // Input validation
    if (!code || !newEmail || !currentEmail) {
      return res.status(400).json({
        success: false,
        message: "Verification code, new email, and current email are required",
      });
    }

    // Find user by current email and userId
    const user = await User.findOne({ _id: userId, email: currentEmail });
    if (!user) {
      console.log("User not found:", { userId, currentEmail });
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log("Found user's email change request:", user.emailChangeRequest);

    // Check if there's a pending email change request
    if (!user.emailChangeRequest || !user.emailChangeRequest.verificationCode) {
      console.log("No email change request found for user:", userId);
      return res.status(400).json({
        success: false,
        message: "No email change request found. Please request a new code",
      });
    }

    // Verify the new email matches the requested email
    if (user.emailChangeRequest.newEmail !== newEmail) {
      console.log("Email mismatch:", {
        requestedEmail: user.emailChangeRequest.newEmail,
        providedEmail: newEmail,
      });
      return res.status(400).json({
        success: false,
        message: "Email mismatch. Please request a new code",
      });
    }

    // Check if verification code has expired
    if (Date.now() > user.emailChangeRequest.expiresAt) {
      console.log("Verification code expired for user:", userId);
      user.emailChangeRequest = undefined;
      await user.save();
      return res.status(400).json({
        success: false,
        message: "Verification code has expired. Please request a new code",
      });
    }

    // Verify the code
    if (code !== user.emailChangeRequest.verificationCode) {
      console.log("Invalid verification code:", {
        provided: code,
        expected: user.emailChangeRequest.verificationCode,
      });
      user.emailChangeRequest.attempts =
        (user.emailChangeRequest.attempts || 0) + 1;
      await user.save();

      if (user.emailChangeRequest.attempts >= 5) {
        user.emailChangeRequest = undefined;
        await user.save();
        return res.status(400).json({
          success: false,
          message: "Too many failed attempts. Please request a new code",
        });
      }

      const remainingAttempts = 5 - user.emailChangeRequest.attempts;
      return res.status(400).json({
        success: false,
        message: `Invalid verification code. ${remainingAttempts} attempts remaining`,
      });
    }

    // Store old email for confirmation
    const oldEmail = user.email;

    // Update email
    user.email = newEmail;
    user.emailChangeRequest = undefined;
    await user.save();

    console.log("Email successfully updated:", {
      userId,
      oldEmail,
      newEmail,
    });

    try {
      // Send confirmation emails
      await sendEmailChangeConfirmation(oldEmail, newEmail);
    } catch (emailError) {
      console.error("Error sending confirmation emails:", emailError);
      // Continue with the response even if email sending fails
    }

    res.status(200).json({
      success: true,
      message: "Email updated successfully",
      user: {
        ...user.toObject(),
        password: undefined,
      },
    });
  } catch (error) {
    console.error("Error in verifyEmailChange:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying email change. Please try again later.",
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.userId; // Get from auth middleware

    // Input validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All password fields are required",
      });
    }

    // Validate password match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password do not match",
      });
    }

    // Password strength validation
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify current password
    const isPasswordValid = await bcryptjs.compare(
      currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Check if new password is same as current
    const isSamePassword = await bcryptjs.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "New password cannot be the same as current password",
      });
    }

    // Hash new password
    const hashedPassword = await bcryptjs.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Error in changePassword:", error);
    res.status(500).json({
      success: false,
      message: "Error changing password. Please try again later.",
    });
  }
};

// Request verification code for current email
const requestCurrentEmailVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Generate and store verification code
    const verificationCode = generateVerificationCode();
    emailVerificationCodes.set(`current_${user._id}`, {
      code: verificationCode,
      timestamp: Date.now(),
      email: user.email,
    });

    try {
      // Send verification code via email using mailtrap configuration
      const mailOptions = {
        from: {
          name: sender.name,
          address: sender.email,
        },
        to: user.email,
        subject: "Email Change Verification",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50; text-align: center;">Email Change Verification</h2>
            <p style="font-size: 16px; color: #34495e;">Your verification code is:</p>
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
              <span style="font-size: 24px; font-weight: bold; letter-spacing: 3px; color: #2c3e50;">${verificationCode}</span>
            </div>
            <p style="font-size: 14px; color: #7f8c8d;">This code will expire in 10 minutes.</p>
            <p style="font-size: 14px; color: #7f8c8d;">If you didn't request this code, please ignore this email.</p>
          </div>
        `,
      };

      const info = await transporter.sendMail(mailOptions);

      if (!info || !info.messageId) {
        throw new Error("Failed to send email");
      }

      console.log("Verification email sent successfully:", {
        messageId: info.messageId,
        to: user.email,
      });

      res.json({
        success: true,
        message: "Verification code sent successfully",
      });
    } catch (emailError) {
      console.error("Email sending error:", emailError);
      return res.status(500).json({
        success: false,
        message: "Failed to send verification email. Please try again.",
      });
    }
  } catch (error) {
    console.error("Error in requestCurrentEmailVerification:", error);
    res.status(500).json({
      success: false,
      message: "An unexpected error occurred. Please try again.",
    });
  }
};

// Verify current email code
const verifyCurrentEmail = async (req, res) => {
  try {
    const { code, email } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Verification code is required",
      });
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const storedData = emailVerificationCodes.get(`current_${user._id}`);

    if (!storedData) {
      return res.status(400).json({
        success: false,
        message: "No verification code found or code has expired",
      });
    }

    // Check if code is expired (10 minutes)
    if (Date.now() - storedData.timestamp > 10 * 60 * 1000) {
      emailVerificationCodes.delete(`current_${user._id}`);
      return res.status(400).json({
        success: false,
        message: "Verification code has expired",
      });
    }

    if (storedData.code !== code) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code",
      });
    }

    // Code is valid
    res.json({
      success: true,
      message: "Current email verified successfully",
    });
  } catch (error) {
    console.error("Error in verifyCurrentEmail:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify email",
    });
  }
};

// Request verification code for new email
const requestNewEmailVerification = async (req, res) => {
  try {
    const { newEmail } = req.body;

    // Check if email is already in use
    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email is already in use",
      });
    }

    // Generate and store verification code
    const verificationCode = generateVerificationCode();
    emailVerificationCodes.set(`new_${req.user._id}`, {
      code: verificationCode,
      timestamp: Date.now(),
      email: newEmail,
    });

    // Send verification code via email
    const emailData = {
      to: newEmail,
      subject: "New Email Verification",
      text: `Your verification code is: ${verificationCode}. This code will expire in 10 minutes.`,
      html: `
        <h3>New Email Verification</h3>
        <p>Your verification code is: <strong>${verificationCode}</strong></p>
        <p>This code will expire in 10 minutes.</p>
      `,
    };

    await sendEmail(emailData);

    res.json({
      success: true,
      message: "Verification code sent successfully",
    });
  } catch (error) {
    console.error("Error in requestNewEmailVerification:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send verification code",
    });
  }
};

// Complete email change process
const completeEmailChange = async (req, res) => {
  try {
    const { newEmail, code } = req.body;
    const storedData = emailVerificationCodes.get(`new_${req.user._id}`);

    if (!storedData) {
      return res.status(400).json({
        success: false,
        message: "No verification code found or code has expired",
      });
    }

    // Check if code is expired (10 minutes)
    if (Date.now() - storedData.timestamp > 10 * 60 * 1000) {
      emailVerificationCodes.delete(`new_${req.user._id}`);
      return res.status(400).json({
        success: false,
        message: "Verification code has expired",
      });
    }

    if (storedData.code !== code || storedData.email !== newEmail) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code",
      });
    }

    // Update user's email
    const user = await User.findById(req.user._id);
    user.email = newEmail;
    await user.save();

    // Clean up verification codes
    emailVerificationCodes.delete(`current_${req.user._id}`);
    emailVerificationCodes.delete(`new_${req.user._id}`);

    res.json({
      success: true,
      message: "Email updated successfully",
    });
  } catch (error) {
    console.error("Error in completeEmailChange:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update email",
    });
  }
};

// Single export statement at the end of the file
export {
  register,
  login,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  checkAuth,
  resendVerification,
  updateProfile,
  requestEmailChange,
  verifyEmailChange,
  changePassword,
  requestCurrentEmailVerification,
  verifyCurrentEmail,
  requestNewEmailVerification,
  completeEmailChange,
};
