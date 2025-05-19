const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
    sessionId: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
    username: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 24 * 60 * 60 }
  });
  
const SessionModel = mongoose.model('Session', sessionSchema);

module.exports = SessionModel;