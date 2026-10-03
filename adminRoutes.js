const express = require("express");
const User = require("../models/User");
const Department = require("../models/Department");
const { protect, requireAdmin } = require("../middleware/auth");
const LoginEvent = require("../models/LoginEvent");
const bcrypt = require("bcryptjs");

const router = express.Router();

// Apply authentication and admin role check to all admin routes
router.use(protect);
router.use(requireAdmin);

// Get all users (admin only)
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 }); // Exclude passwords
    res.json({ success: true, users });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get user by ID (admin only)
router.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id, { password: 0 });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ success: true, user });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Create new user (admin only)
router.post("/users", async (req, res) => {
  try {
    const { firstName, lastName, email, college, password, role } = req.body;
    
    if (!firstName || !lastName || !email || !college || !password || !role) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const normalizedRole = String(role).toLowerCase();

    const newUser = new User({
      firstName,
      lastName,
      email: email.toLowerCase().trim(),
      college,
      password: hashedPassword,
      role: normalizedRole
    });

    await newUser.save();
    res.status(201).json({ 
      success: true, 
      user: { 
        id: newUser._id, 
        firstName, 
        lastName, 
        email: newUser.email, 
        college, 
        role: normalizedRole 
      } 
    });
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Update user (admin only)
router.put("/users/:id", async (req, res) => {
  try {
    const { firstName, lastName, email, college, role } = req.body;
    const updateData = {};

    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (email) {
      const existingUser = await User.findOne({ 
        email: email.toLowerCase().trim(), 
        _id: { $ne: req.params.id } 
      });
      if (existingUser) {
        return res.status(400).json({ error: "Email already exists" });
      }
      updateData.email = email.toLowerCase().trim();
    }
    if (college) updateData.college = college;
    if (role) updateData.role = String(role).toLowerCase();

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, select: { password: 0 } }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ success: true, user });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete user (admin only)
router.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get system statistics (admin only)
router.get("/stats", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: { $regex: /^student$/i } });
    const totalTeachers = await User.countDocuments({ role: { $regex: /^teacher$/i } });
    const totalAdmins = await User.countDocuments({ role: { $regex: /^admin$/i } });

    // Compute total papers by summing embedded papers across all departments/courses/years/subjects
    let totalPapers = 0;
    try {
      const departments = await Department.find({}, { courses: 1 }).lean();
      for (const dept of departments) {
        for (const course of (dept.courses || [])) {
          const years = course.years || {};
          const yearBuckets = [years.FY || [], years.SY || [], years.TY || []];
          for (const subjects of yearBuckets) {
            for (const subject of subjects) {
              totalPapers += Array.isArray(subject.papers) ? subject.papers.length : 0;
            }
          }
        }
      }
    } catch (e) {
      // If anything goes wrong, fall back to 0 rather than throwing
      totalPapers = 0;
    }

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalStudents,
        totalTeachers,
        totalAdmins,
        totalPapers
      }
    });
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Recent activity: latest users (admin only)
router.get("/recent-activity", async (req, res) => {
  try {
    const latestUsers = await User.find({}, { password: 0 })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    res.json({ success: true, recent: latestUsers });
  } catch (err) {
    console.error("Error fetching recent activity:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Analytics: daily registrations and logins (last 7 days)
router.get("/analytics/summary", async (req, res) => {
  try {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - 6);
    start.setHours(0, 0, 0, 0);

    // Registrations per day
    const regs = await User.aggregate([
      { $match: { createdAt: { $gte: start } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Logins per day
    const logins = await LoginEvent.aggregate([
      { $match: { createdAt: { $gte: start } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({ success: true, registrations: regs, logins });
  } catch (err) {
    console.error("Error fetching analytics:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Change user role (admin only)
router.patch("/users/:id/role", async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!role || !["student", "teacher", "admin"].includes(role.toLowerCase())) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: role.toLowerCase() },
      { new: true, select: { password: 0 } }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ success: true, user });
  } catch (err) {
    console.error("Error updating user role:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// List all papers across all colleges/departments (admin only)
router.get("/papers", async (req, res) => {
  try {
    const depts = await Department.find({}, { college: 1, name: 1, courses: 1 }).lean();
    const results = [];
    for (const dept of depts) {
      const college = dept.college || "";
      const departmentName = dept.name;
      for (const course of (dept.courses || [])) {
        const courseName = course.name;
        const years = course.years || {};
        const yearMap = { FY: years.FY || [], SY: years.SY || [], TY: years.TY || [] };
        for (const [yearKey, subjects] of Object.entries(yearMap)) {
          for (const subject of subjects) {
            const subjectName = subject.name;
            for (const paper of (subject.papers || [])) {
              results.push({
                id: String(paper._id),
                yearOfPaper: paper.year,
                fileUrl: paper.fileUrl,
                college,
                department: departmentName,
                course: courseName,
                academicYear: yearKey,
                subject: subjectName,
              });
            }
          }
        }
      }
    }
    res.json({ success: true, papers: results });
  } catch (err) {
    console.error("Error listing papers:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Count all papers (admin only)
router.get("/papers/count", async (req, res) => {
  try {
    let totalPapers = 0;
    const depts = await Department.find({}, { courses: 1 }).lean();
    for (const dept of depts) {
      for (const course of (dept.courses || [])) {
        const years = course.years || {};
        const yearBuckets = [years.FY || [], years.SY || [], years.TY || []];
        for (const subjects of yearBuckets) {
          for (const subject of subjects) {
            totalPapers += Array.isArray(subject.papers) ? subject.papers.length : 0;
          }
        }
      }
    }
    res.json({ success: true, count: totalPapers });
  } catch (err) {
    console.error("Error counting papers:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
