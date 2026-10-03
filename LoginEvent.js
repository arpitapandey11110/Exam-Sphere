const mongoose = require("mongoose");

const loginEventSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  email: { type: String, lowercase: true, trim: true }
}, { timestamps: true });

module.exports = mongoose.model("LoginEvent", loginEventSchema);


