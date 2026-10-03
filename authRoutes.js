// // backend/routes/authRoutes.js
// const express = require("express");
// const User = require("../models/User");

// const router = express.Router();

// // ✅ Register
// router.post("/register", async (req, res) => {
//   try {
//     const { firstName, lastName, email, college, password, role } = req.body;

//     if (!firstName || !lastName || !email || !college || !password || !role) {
//       return res.status(400).json({ error: "All fields are required" });
//     }

// Send password reset email with a clickable link
async function sendResetEmail(to, resetLink) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  let pass = process.env.SMTP_PASS;
  let from = process.env.SMTP_FROM || user || "no-reply@example.com";
  if (!host || !user || !pass) {
    console.log(`[DEV] Password reset link for ${to}: ${resetLink}`);
    return { delivered: false, dev: true };
  }
  try {
    let nodemailer;
    try { nodemailer = require("nodemailer"); } catch (e) { /* optional dependency */ }
    if (!nodemailer) {
      console.log(`[DEV] nodemailer not installed. Password reset link for ${to}: ${resetLink}`);
      return { delivered: false, dev: true };
    }
    // Normalize From header
    from = normalizeFromHeader(from, user);

    // Special handling for Gmail App Passwords (remove spaces copied from Google UI)
    if (/gmail\.com$/i.test(String(host)) && typeof pass === 'string') {
      pass = pass.replace(/\s+/g, "");
    }

    // Create transporter
    let transporter;
    if (/gmail\.com$/i.test(String(host))) {
      transporter = nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
    } else {
      transporter = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
    }

    const text = `We received a request to reset your password.\n\nClick the link below to set a new password.\nIf you did not request this, you can ignore this email.\n\n${resetLink}\n\nThis link will expire in 60 minutes.`;
    await transporter.sendMail({ from, to, subject: "Reset your password", text });
    return { delivered: true };
  } catch (err) {
    console.warn("Reset email send failed:", err.message);
    console.log(`[DEV] Falling back to console. Password reset link for ${to}: ${resetLink}`);
    return { delivered: false };
  }
}

//     const existingUser = await User.findOne({ email });
//     if (existingUser) return res.status(400).json({ error: "Email already exists" });

//     const newUser = new User({ firstName, lastName, email, college, password, role });
//     await newUser.save();

//     res.status(201).json({ message: "Registration successful" });
//   } catch (err) {
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // ✅ Login
// router.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const user = await User.findOne({ email, password });
//     if (!user) return res.status(401).json({ error: "Invalid credentials" });

//     res.json({ message: "Login successful", user });
//   } catch (err) {
//     res.status(500).json({ error: "Server error" });
//   }
// });

// module.exports = router;


const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const crypto = require("crypto");
const User = require("../models/User");
const LoginEvent = require("../models/LoginEvent");
const Otp = require("../models/Otp");
require("dotenv").config();

const router = express.Router();

// In-memory fallback store when MongoDB is not connected
// This enables registration/login without a database for local testing
const memoryUsers = [];
const memoryOtps = [];

// Strict Admin allowlist - only these emails are allowed to be admins
const adminAllowlist = [
  "ankitadhoble6@gmail.com",
  "arpitapandey11110@gmail.com",
];

// Required admin invitation code
const REQUIRED_ADMIN_CODE = "YourStrongSecretCode123";

// We no longer rely on lastname/code; email allowlist is the single source of truth

function isDbConnected() {
  return mongoose.connection && mongoose.connection.readyState === 1; // 1 = connected
}

async function findUserByEmail(email) {
  if (isDbConnected()) {
    return User.findOne({ email });
  }
  return memoryUsers.find(u => u.email === email) || null;
}

async function saveNewUser(userDoc) {
  if (isDbConnected()) {
    const user = new User(userDoc);
    await user.save();
    return user;
  }
  // Simulate _id and timestamps for memory user
  const user = { ...userDoc, _id: `${Date.now()}_${Math.random().toString(36).slice(2)}`, createdAt: new Date(), updatedAt: new Date() };
  memoryUsers.push(user);
  return user;
}

// -------------------- OTP + Email helpers --------------------
const OTP_EXP_MINUTES = parseInt(process.env.OTP_EXP_MINUTES || "10", 10);
const TEACHER_EMAIL_ENFORCE_LOGIN = String(process.env.TEACHER_EMAIL_ENFORCE_LOGIN || "true").toLowerCase() !== "false";
const allowedTeacherDomainsFromEnv = (process.env.TEACHER_EMAIL_DOMAINS || "")
  .split(",")
  .map(s => s.trim().toLowerCase())
  .filter(Boolean);

function isValidTeacherEmail(email) {
  const e = String(email || "").toLowerCase();
  if (!e.includes("@")) return false;
  if (allowedTeacherDomainsFromEnv.length > 0) {
    return allowedTeacherDomainsFromEnv.some(dom => {
      const d = dom.startsWith("@") ? dom.slice(1) : dom;
      return e.endsWith("@" + d) || e.endsWith(d);
    });
  }
  // Default heuristic: college emails typically use .edu or .ac.in
  return /@[a-z0-9.-]+\.(edu|ac\.in)$/i.test(e);
}

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
}

function normalizeFromHeader(from, user) {
  const fallback = user || "no-reply@example.com";
  const val = String(from || "").trim();
  if (!val) return fallback;
  if (val.includes("<") && val.includes(">")) return val; // already in Name <email>
  // If it's just an email or contains an email within text, normalize
  const match = val.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  if (!match) return fallback; // invalid from, fallback to user
  if (val === match[0]) return match[0]; // just an email
  const name = val.replace(match[0], "").trim() || "Student Portal";
  return `${name} <${match[0]}>`;
}

async function sendOtpEmail(to, otp) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  let pass = process.env.SMTP_PASS;
  let from = process.env.SMTP_FROM || user || "no-reply@example.com";
  if (!host || !user || !pass) {
    console.log(`[DEV] OTP for ${to}: ${otp}`);
    return { delivered: false, dev: true };
  }
  try {
    let nodemailer;
    try { nodemailer = require("nodemailer"); } catch (e) { /* optional dependency */ }
    if (!nodemailer) {
      console.log(`[DEV] nodemailer not installed. OTP for ${to}: ${otp}`);
      return { delivered: false, dev: true };
    }
    // Normalize From header
    from = normalizeFromHeader(from, user);

    // Special handling for Gmail App Passwords (remove spaces copied from Google UI)
    if (/gmail\.com$/i.test(String(host)) && typeof pass === 'string') {
      pass = pass.replace(/\s+/g, "");
    }

    // Create transporter
    let transporter;
    if (/gmail\.com$/i.test(String(host))) {
      transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user, pass }
      });
    } else {
      transporter = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
    }

    await transporter.sendMail({ from, to, subject: "Your OTP Code", text: `Your OTP is ${otp}. It expires in ${OTP_EXP_MINUTES} minutes.` });
    return { delivered: true };
  } catch (err) {
    console.warn("OTP email send failed:", err.message);
    console.log(`[DEV] Falling back to console. OTP for ${to}: ${otp}`);
    return { delivered: false };
  }
}

async function saveOtpRecord({ email, otpPlain, payload }) {
  const emailNorm = email.toLowerCase().trim();
  const expiresAt = new Date(Date.now() + OTP_EXP_MINUTES * 60 * 1000);
  const otpHash = bcrypt.hashSync(otpPlain, 10);
  if (isDbConnected()) {
    const rec = new Otp({ email: emailNorm, otp: otpHash, purpose: "register", payload, expiresAt });
    await rec.save();
    return rec;
  }
  const rec = { _id: `${Date.now()}_${Math.random().toString(36).slice(2)}`, email: emailNorm, otp: otpHash, purpose: "register", payload, expiresAt, consumed: false, createdAt: new Date(), updatedAt: new Date() };
  memoryOtps.push(rec);
  return rec;
}

async function findLatestValidOtpByEmail(email) {
  const emailNorm = email.toLowerCase().trim();
  const now = new Date();
  if (isDbConnected()) {
    // Get latest non-consumed, non-expired record
    const rec = await Otp.findOne({ email: emailNorm, purpose: "register", consumed: false, expiresAt: { $gt: now } }).sort({ createdAt: -1 });
    return rec || null;
  }
  const candidates = memoryOtps
    .filter(r => r.email === emailNorm && r.purpose === "register" && !r.consumed && r.expiresAt > now)
    .sort((a, b) => b.createdAt - a.createdAt);
  return candidates[0] || null;
}

// Registration now requires OTP. This direct route is disabled to prevent bypass.
router.post("/register", async (req, res) => {
  return res.status(410).json({ error: "Registration via this route is disabled. Use /api/register/request-otp then /api/register/verify-otp." });
});

// STEP 1: Request OTP for registration
router.post("/register/request-otp", async (req, res) => {
  try {
    const { firstName, lastName, email, college, password, role, adminCode } = req.body;
    if (!firstName || !lastName || !email || !college || !password || !role) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const emailNorm = String(email).toLowerCase().trim();
    const requestedRole = String(role).toLowerCase();

    // Enforce admin allowlist: only specific emails can self-register as admin
    if (requestedRole === "admin") {
      const isAllowed = adminAllowlist.includes(emailNorm);
      const codeOk = String(adminCode || "").trim() === REQUIRED_ADMIN_CODE;
      if (!isAllowed || !codeOk) {
        return res.status(403).json({ error: "Only approved emails with a valid admin code can register as admin." });
      }
    }

    // Teacher email must be a valid college email domain
    if (requestedRole === "teacher" && !isValidTeacherEmail(emailNorm)) {
      return res.status(400).json({ error: "Teachers must register with a valid college email (e.g., ends with .edu or .ac.in)." });
    }

    const existing = await findUserByEmail(emailNorm);
    // Determine if existing is considered verified (undefined treated as true for backward compatibility)
    const existingVerified = existing ? (typeof existing.emailVerified === 'boolean' ? existing.emailVerified : true) : null;
    if (existing && existingVerified) {
      return res.status(400).json({ error: "This email is already registered." });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const otp = generateOtp();

    const payload = existing && existingVerified === false
      ? { updateUserId: existing._id, firstName, lastName, email: emailNorm, college, password: hashedPassword, role: requestedRole, emailVerified: true }
      : { firstName, lastName, email: emailNorm, college, password: hashedPassword, role: requestedRole, emailVerified: true };

    await saveOtpRecord({ email: emailNorm, otpPlain: otp, payload });
    await sendOtpEmail(emailNorm, otp);

    return res.status(200).json({ success: true, message: `OTP sent to ${emailNorm}. Please verify to complete registration.` });
  } catch (err) {
    console.error("/api/register/request-otp error:", err);
    return res.status(500).json({ error: "Server error", details: err && err.message ? err.message : undefined });
  }
});

// -------------------- Password Reset --------------------
function getClientBaseUrl() {
  return process.env.CLIENT_URL || "http://localhost:5173";
}

router.post("/password/forgot", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });
    const emailNorm = String(email).toLowerCase().trim();

    const user = await findUserByEmail(emailNorm);
    // Always respond success to avoid user enumeration
    if (!user) {
      return res.json({ success: true, message: "If an account exists, a reset link has been sent." });
    }

    // Generate token and save hashed token + expiry
    const token = crypto.randomBytes(24).toString("hex");
    const tokenHash = bcrypt.hashSync(token, 10);
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 60 minutes

    user.resetPasswordTokenHash = tokenHash;
    user.resetPasswordExpires = expires;
    if (isDbConnected()) {
      await user.save();
    } else {
      user.updatedAt = new Date();
    }

    const link = `${getClientBaseUrl()}/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(emailNorm)}`;
    await sendResetEmail(emailNorm, link);
    return res.json({ success: true, message: "If an account exists, a reset link has been sent." });
  } catch (err) {
    console.error("/api/password/forgot error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/password/reset", async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;
    if (!email || !token || !newPassword) {
      return res.status(400).json({ error: "Email, token, and new password are required" });
    }
    if (String(newPassword).length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }
    const emailNorm = String(email).toLowerCase().trim();
    const user = await findUserByEmail(emailNorm);
    if (!user) return res.status(400).json({ error: "Invalid or expired reset token" });

    const now = new Date();
    if (!user.resetPasswordTokenHash || !user.resetPasswordExpires || user.resetPasswordExpires <= now) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    const tokenOk = bcrypt.compareSync(String(token), user.resetPasswordTokenHash || "");
    if (!tokenOk) return res.status(400).json({ error: "Invalid or expired reset token" });

    // Set new password and clear reset fields
    const newHash = bcrypt.hashSync(String(newPassword), 10);
    user.password = newHash;
    user.resetPasswordTokenHash = null;
    user.resetPasswordExpires = null;
    if (isDbConnected()) {
      await user.save();
    } else {
      user.updatedAt = new Date();
    }

    return res.json({ success: true, message: "Password has been reset. You can now log in." });
  } catch (err) {
    console.error("/api/password/reset error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// STEP 2: Verify OTP and finalize registration
router.post("/register/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }
    const emailNorm = String(email).toLowerCase().trim();
    const rec = await findLatestValidOtpByEmail(emailNorm);
    if (!rec) return res.status(400).json({ error: "OTP is invalid or has expired" });

    const match = bcrypt.compareSync(String(otp).trim(), rec.otp || "");
    if (!match) return res.status(400).json({ error: "Incorrect OTP" });

    // Mark as consumed
    if (isDbConnected()) {
      rec.consumed = true;
      await rec.save();
    } else {
      rec.consumed = true;
      rec.updatedAt = new Date();
    }

    const payload = rec.payload || {};
    let user;
    if (payload.updateUserId) {
      if (isDbConnected()) {
        user = await User.findByIdAndUpdate(payload.updateUserId, {
          firstName: payload.firstName,
          lastName: payload.lastName,
          college: payload.college,
          password: payload.password,
          role: payload.role,
          emailVerified: true,
        }, { new: true });
      } else {
        user = memoryUsers.find(u => u._id === payload.updateUserId);
        if (user) {
          Object.assign(user, {
            firstName: payload.firstName,
            lastName: payload.lastName,
            college: payload.college,
            password: payload.password,
            role: payload.role,
            emailVerified: true,
            updatedAt: new Date(),
          });
        }
      }
    } else {
      user = await saveNewUser({
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: emailNorm,
        college: payload.college,
        password: payload.password,
        role: payload.role,
        emailVerified: true,
      });
    }

    if (!user) {
      return res.status(500).json({ error: "Failed to complete registration" });
    }

    return res.status(201).json({ success: true, message: "Registration complete. Please login." });
  } catch (err) {
    console.error("/api/register/verify-otp error:", err);
    return res.status(500).json({ error: "Server error", details: err && err.message ? err.message : undefined });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });

    const user = await findUserByEmail(email.toLowerCase().trim());
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    // Enforce email verification (backward-compatible: undefined counts as verified)
    const isVerified = typeof user.emailVerified === 'boolean' ? user.emailVerified : true;
    if (!isVerified) {
      return res.status(403).json({ error: "Please verify your email via OTP before logging in." });
    }

    // Teacher must login with valid college email domain (configurable)
    if (TEACHER_EMAIL_ENFORCE_LOGIN && String(user.role).toLowerCase() === 'teacher' && !isValidTeacherEmail(user.email)) {
      return res.status(403).json({ error: "Teacher login requires a valid college email (e.g., ends with .edu or .ac.in)." });
    }

    // First try a bcrypt comparison (normal path)
    let ok = false;
    try {
      ok = bcrypt.compareSync(password, user.password || "");
    } catch (e) {
      ok = false;
    }

    // Backward compatibility: some older accounts may have plaintext passwords saved.
    // If bcrypt fails, fall back to direct equality and migrate to bcrypt on-the-fly.
    if (!ok && user.password === password) {
      const newHash = bcrypt.hashSync(password, 10);
      user.password = newHash;
      if (isDbConnected()) {
        await user.save();
      } else {
        // update in-memory object timestamp
        user.updatedAt = new Date();
      }
      ok = true;
    }

    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET || "dev_fallback_secret", { expiresIn: "7d" });
    try { await LoginEvent.create({ userId: user._id, email: user.email }); } catch (e) {}
    res.json({ success: true, user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, college: user.college, role: String(user.role).toLowerCase() }, token });
  } catch (err) {
    console.error("/api/login error:", err);
    res.status(500).json({ error: "Server error", details: err && err.message ? err.message : undefined });
  }
});

module.exports = router;
