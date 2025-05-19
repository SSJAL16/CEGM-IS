import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  user_id: {
    type: Number,
    required: true,
    unique: true,
  },
  first_name: {
    type: String,
    required: true,
    maxlength: 30,
  },
  last_name: {
    type: String,
    required: true,
    maxlength: 20,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    maxlength: 35,
  },
  phone_number: {
    type: String,
    required: true,
    maxlength: 15,
  },
  country: {
    type: String,
    required: true,
    maxlength: 20,
  },
  region: {
    type: String,
    required: true,
    maxlength: 20,
  },
  city: {
    type: String,
    required: true,
    maxlength: 20,
  },
  address: {
    type: String,
    required: true,
    maxlength: 50,
  },
  zip_code: {
    type: String,
    required: true,
    maxlength: 10,
  },
  emergency_contact_full_name: {
    type: String,
    required: true,
    maxlength: 50,
  },
  emergency_contact_number: {
    type: String,
    required: true,
    maxlength: 15,
  },
  role: {
    type: String,
    enum: ["Admin", "Employee"],
    default: "Employee",
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    default: null,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isApproved: { type: Boolean, default: false },
  resetPasswordToken: String,
  resetPasswordExpiresAt: Date,
  verificationToken: String,
  verificationTokenExpiresAt: Date,
  emailChangeRequest: {
    newEmail: String,
    verificationCode: String,
    expiresAt: Date,
    attempts: {
      type: Number,
      default: 0,
    },
  },
});

const User = mongoose.model("User", userSchema);

export default User;
