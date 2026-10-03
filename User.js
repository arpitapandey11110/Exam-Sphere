// // backend/models/User.js
// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema({
//   firstName: { type: String, required: true, trim: true },
//   lastName: { type: String, required: true, trim: true },
//   email: { type: String, unique: true, required: true, lowercase: true, trim: true },
//   college: { type: String, required: true, trim: true },
//   password: { type: String, required: true, minlength: 6 },
//   role: { type: String, enum: ["Teacher", "Student"], required: true },
// }, { timestamps: true });

// module.exports = mongoose.model("User", userSchema);

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true, lowercase: true, trim: true },
  college: String,
  password: String, // hashed
  role: { type: String, enum: ["teacher", "student", "admin"], default: "student", lowercase: true, trim: true },
  emailVerified: { type: Boolean, default: false },
  // Password reset fields
  resetPasswordTokenHash: { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
