import express from "express";
import {
  login,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  checkAuth,
  register,
  resendVerification,
  updateProfile,
  requestEmailChange,
  verifyEmailChange,
  changePassword,
  requestCurrentEmailVerification,
  verifyCurrentEmail,
  requestNewEmailVerification,
  completeEmailChange,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.get("/check-auth", verifyToken, checkAuth);

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

router.patch(
  "/update-profile",
  verifyToken,
  upload.single("avatar"),
  updateProfile
);

router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification);
router.post("/forgot-password", forgotPassword);

router.post("/reset-password/:token", resetPassword);

// Email change routes
router.post("/request-email-change", verifyToken, requestEmailChange);
router.post("/verify-email-change", verifyToken, verifyEmailChange);

// Password change route
router.post("/change-password", verifyToken, changePassword);

// New email change routes
router.post(
  "/request-current-email-verification",
  verifyToken,
  requestCurrentEmailVerification
);
router.post("/verify-current-email", verifyToken, verifyCurrentEmail);
router.post(
  "/request-new-email-verification",
  verifyToken,
  requestNewEmailVerification
);
router.post("/complete-email-change", verifyToken, completeEmailChange);

export default router;
