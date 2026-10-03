// backend/routes/testRoutes.js
const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

router.get("/test", (req, res) => {
  res.json({
    message: "Server is working!",
    mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  });
});

module.exports = router;
