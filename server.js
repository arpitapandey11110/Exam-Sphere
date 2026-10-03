const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const multer = require("multer");

// Load environment variables from .env file
dotenv.config();

// Import routes
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const collegeRoutes = require("./routes/college");

const app = express();
const port = process.env.PORT || 5003;
const mongoURI = process.env.MONGO_URI;

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json());

// Serve uploaded files statically so clients can access /uploads/<filename>
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Import User model
const User = require("./models/User");

// Connect to MongoDB Atlas (but don't block server if missing during local dev)
const connectDB = async () => {
  try {
    if (!mongoURI) {
      console.warn("⚠️ MONGO_URI is not set. Starting server without a database connection.");
      return; // Skip DB connection; allow server to start for non-DB routes
    }
    await mongoose.connect(mongoURI);
    console.log("✅ MongoDB Atlas connected successfully!");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    console.warn("⚠️ Continuing to run the server without DB for local testing.");
  }
};

// Define API routes
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// Use route modules
app.use("/api", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/college", collegeRoutes);

app.get("/api/test", (req, res) => {
  res.json({
    message: "Server is working!",
    mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  });
});

// Global error handler to return clean JSON errors (e.g., Multer file errors)
// Note: keep this AFTER routes
app.use((err, req, res, next) => {
  if (err) {
    const isMulter = err instanceof multer.MulterError || /multer/i.test(String(err?.name));
    const status = isMulter ? 400 : (err.status || 500);
    const message = err.message || "Server error";
    console.error("Error:", message);
    return res.status(status).json({ error: message });
  }
  next();
});

// Start the server after connecting to the database
connectDB().then(() => {
  app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
    console.log(`🧪 Test: http://localhost:${port}/api/test`);
  });
});
