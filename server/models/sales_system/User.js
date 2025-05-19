import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  user_id: Number,
  first_name: String,
  last_name: String,
  email: String,
  password: String,
  confirm_password: String,
  OTP: String,
  username: String,
  phone: Number,
  team: String,
  resetToken: String,
  resetTokenExpiry: Date,
  status: String,
  emergencyNumber: Number,
  emergencyName: String,
});

const salesSystemUserModel = mongoose.model("user", UserSchema);

export default salesSystemUserModel;
