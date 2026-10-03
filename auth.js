const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();

function protect(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });

  const token = auth.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev_fallback_secret");
    req.user = decoded; // { id, email }
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token invalid" });
  }
}

// Role-based access control middleware
function requireRole(roles) {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      const userRole = user.role.toLowerCase();
      const allowedRoles = Array.isArray(roles) ? roles.map(r => r.toLowerCase()) : [roles.toLowerCase()];

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ error: "Access denied. Insufficient permissions." });
      }

      req.user.role = userRole; // Add role to request object
      next();
    } catch (err) {
      console.error("Role check error:", err);
      return res.status(500).json({ error: "Server error" });
    }
  };
}

// Admin-only access
function requireAdmin(req, res, next) {
  return requireRole(['admin'])(req, res, next);
}

// Teacher or Admin access
function requireTeacherOrAdmin(req, res, next) {
  return requireRole(['teacher', 'admin'])(req, res, next);
}

// Student or Admin access
function requireStudentOrAdmin(req, res, next) {
  return requireRole(['student', 'admin'])(req, res, next);
}

module.exports = { 
  protect, 
  requireRole, 
  requireAdmin, 
  requireTeacherOrAdmin, 
  requireStudentOrAdmin 
};
