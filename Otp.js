const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, trim: true, index: true },
  otp: { type: String, required: true },
  purpose: { type: String, enum: ["register"], default: "register" },
  payload: {
    type: Object, // pending registration fields (hashed password, role, etc.)
    required: true,
  },
  expiresAt: { type: Date, required: true, expires: 0 },
  consumed: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Otp", otpSchema);
