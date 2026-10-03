const express = require("express");
const mongoose = require("mongoose");
const Department = require("../models/Department");
const upload = require("../middleware/upload");
const { protect, requireTeacherOrAdmin } = require("../middleware/auth");
const fs = require("fs");
const path = require("path");

const router = express.Router();
// Helper: normalize names for matching (case-insensitive, ignore punctuation/spaces)
const normalize = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "");

// Helper: map requested year label to actual key in course.years
function matchYearKey(yearKeys, requested) {
  const nReq = normalize(requested);
  // direct match
  let key = yearKeys.find(k => normalize(k) === nReq);
  if (key) return key;
  // heuristic mapping
  if (/(^|\D)1(st)?|first/.test(nReq) || /fy/.test(nReq)) {
    key = yearKeys.find(k => /fy/.test(normalize(k)) || /first/.test(normalize(k)) || /1/.test(normalize(k)));
    if (key) return key;
  }
  if (/(^|\D)2(nd)?|second/.test(nReq) || /sy/.test(nReq)) {
    key = yearKeys.find(k => /sy/.test(normalize(k)) || /second/.test(normalize(k)) || /2/.test(normalize(k)));
    if (key) return key;
  }
  if (/(^|\D)3(rd)?|third/.test(nReq) || /ty/.test(nReq)) {
    key = yearKeys.find(k => /ty/.test(normalize(k)) || /third/.test(normalize(k)) || /3/.test(normalize(k)));
    if (key) return key;
  }
  return undefined;
}

// Helper: find department and course index (always return a Mongoose doc for dept)
async function findDeptByCourse(courseName, college) {
  const targetedFilter = college
    ? { "courses.name": { $regex: courseName, $options: "i" }, college: { $regex: college, $options: "i" } }
    : { "courses.name": { $regex: courseName, $options: "i" } };
  let dept = await Department.findOne(targetedFilter);
  if (dept) {
    const idx = (dept.courses || []).findIndex(c => normalize(c.name) === normalize(courseName));
    if (idx !== -1) return { dept, courseIdx: idx };
  }
  // Fallback: broader search, but return a fresh Mongoose doc
  const scanFilter = college ? { college: { $regex: college, $options: "i" } } : {};
  const depts = await Department.find(scanFilter);
  for (const d of depts) {
    const idx = (d.courses || []).findIndex(c => normalize(c.name) === normalize(courseName));
    if (idx !== -1) return { dept: d, courseIdx: idx };
  }
  return { dept: null, courseIdx: -1 };
}

// GET distinct list of colleges
router.get("/colleges", async (req, res) => {
  try {
    const names = await Department.distinct("college");
    const cleaned = (names || []).filter(Boolean).sort((a, b) => String(a).localeCompare(String(b)));
    res.json(cleaned);
  } catch (e) {
    res.status(500).json({ error: "Failed to load colleges" });
  }
});

// Create a new department (teacher/admin)
router.post("/departments", protect, requireTeacherOrAdmin, async (req, res) => {
  try {
    const { name, college } = req.body;
    if (!name) return res.status(400).json({ error: "Department name is required" });
    if (!college) return res.status(400).json({ error: "College is required" });
    const existing = await Department.findOne({ name, college });
    if (existing) return res.status(400).json({ error: "Department already exists" });
    const dep = new Department({ name, college, courses: [] });
    await dep.save();
    res.json({ success: true, id: dep._id });
  } catch (e) {
    res.status(500).json({ error: "Failed to add department" });
  }
});

// Delete a department (teacher/admin)
router.delete("/departments/:deptName", protect, requireTeacherOrAdmin, async (req, res) => {
  try {
    const { deptName } = req.params;
    const { college } = req.query;
    if (!college) return res.status(400).json({ error: "College is required" });
    const result = await Department.deleteOne({ name: deptName, college: { $regex: college, $options: "i" } });
    if (result.deletedCount === 0) return res.status(404).json({ error: "Department not found" });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Failed to delete department" });
  }
});

// GET all departments (id & name)
router.get("/departments", async (req, res) => {
  const { college } = req.query;
  let filter = {};
  if (college) {
    filter = { college: { $regex: college, $options: "i" } };
  }
  // Return distinct department names to avoid duplicates across colleges
  const names = await Department.distinct("name", filter);
  const payload = (names || []).filter(Boolean).map((n) => ({ name: n }));
  res.json(payload);
});

// GET courses for a department (by dept name)
router.get("/departments/:deptName", async (req, res) => {
  const { college } = req.query;
  const base = { name: req.params.deptName };
  const filter = college ? { ...base, college: { $regex: college, $options: "i" } } : base;
  const dept = await Department.findOne(filter);
  if (!dept) return res.status(404).json({ error: "Department not found" });
  res.json(dept.courses.map(c => c.name));
});

// GET years for a course (by course name)
router.get("/courses/:courseName", async (req, res) => {
  const { college } = req.query;
  const { dept, courseIdx } = await findDeptByCourse(req.params.courseName, college);
  if (!dept || courseIdx === -1) return res.status(404).json({ error: "Course not found" });
  const course = dept.courses[courseIdx];
  res.json(Object.keys(course.years || {}));
});

// GET subjects for a course+year (returns array of subjects)
router.get("/courses/:courseName/:year", async (req, res) => {
  const { courseName, year } = req.params;
  const { college } = req.query;
  const { dept, courseIdx } = await findDeptByCourse(courseName, college);
  if (!dept || courseIdx === -1) return res.status(404).json({ error: "Course not found" });
  const course = dept.courses[courseIdx];
  const yearKeys = Object.keys(course.years || {});
  const matchKey = matchYearKey(yearKeys, year) || year;
  const subjects = (course.years || {})[matchKey] || [];
  res.json(subjects); // subject objects with name & papers
});

// GET papers for a specific subject (returns paper objects)
router.get("/courses/:courseName/:year/:subjectName", async (req, res) => {
  const { courseName, year, subjectName } = req.params;
  const { college } = req.query;
  const { dept, courseIdx } = await findDeptByCourse(courseName, college);
  if (!dept || courseIdx === -1) return res.status(404).json({ error: "Course not found" });
  const course = dept.courses[courseIdx];
  const yearKeys = Object.keys(course.years || {});
  const matchKey = matchYearKey(yearKeys, year) || year;
  const subjects = (course.years || {})[matchKey] || [];
  const subject = subjects.find(s => normalize(s.name) === normalize(subjectName));
  if (!subject) return res.status(404).json({ error: "Subject not found" });

  res.json(subject.papers);
});

/*
  Upload paper:
  - Protected route (only teachers/admin)
  - Endpoint: POST /api/college/upload/:courseName/:year/:subjectName
  - FormData: key "paper" (file), optional field "paperYear" (number)
*/
router.post("/upload/:courseName/:year/:subjectName", protect, requireTeacherOrAdmin, upload.single("paper"), async (req, res) => {
  try {
    const { courseName, year, subjectName } = req.params;
    const college = req.body.college || req.query.college || req.headers["x-college"];
    const paperYear = req.body.paperYear ? Number(req.body.paperYear) : new Date().getFullYear();

    const { dept, courseIdx } = await findDeptByCourse(courseName, college);
    if (!dept || courseIdx === -1) return res.status(404).json({ error: "Course not found" });
    const course = dept.courses[courseIdx];

    // ensure year exists, if not create empty array
    if (!course.years) course.years = {};
    const yearKey = matchYearKey(Object.keys(course.years || {}), year) || year;
    if (!course.years[yearKey]) course.years[yearKey] = [];

    // find subject, else create
    let subj = course.years[yearKey].find(s => normalize(s.name) === normalize(subjectName));
    if (!subj) {
      subj = { name: subjectName, papers: [] };
      course.years[yearKey].push(subj);
    }
    // seeded subjects might not have a papers array yet
    if (!Array.isArray(subj.papers)) subj.papers = [];

    const newPaper = {
      _id: new mongoose.Types.ObjectId(),
      year: paperYear,
      fileUrl: `/uploads/${req.file.filename}`,
    };

    subj.papers.push(newPaper);
    // Mixed nested structure needs explicit markModified
    try { dept.markModified('courses'); } catch {}
    await dept.save();

    res.json({ success: true, paper: newPaper });
  } catch (err) {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Use form-data field name "paper" and upload a PDF (max 20MB).' });
    }
    console.error("Upload error:", err);
    res.status(500).json({ error: err?.message || "Upload failed" });
  }
});

// DELETE a paper (teacher/admin). Also removes file from disk if present.
router.delete("/upload/:courseName/:year/:subjectName/:paperId", protect, requireTeacherOrAdmin, async (req, res) => {
  try {
    const { courseName, year, subjectName, paperId } = req.params;
    const { college } = req.query;
    const { dept, courseIdx } = await findDeptByCourse(courseName, college);
    if (!dept || courseIdx === -1) return res.status(404).json({ error: "Course not found" });
    const course = dept.courses[courseIdx];
    const yearKey = matchYearKey(Object.keys(course.years || {}), year) || year;
    const subjects = course.years[yearKey] || [];
    const subject = subjects.find(s => normalize(s.name) === normalize(subjectName));
    if (!subject) return res.status(404).json({ error: "Subject not found" });
    // ensure papers array exists on legacy seeded subjects
    if (!Array.isArray(subject.papers)) subject.papers = [];

    const idx = subject.papers.findIndex(p => {
      const pid = p && p._id ? String(p._id) : undefined;
      const fname = (p && p.fileUrl) ? String(p.fileUrl).split('/').pop() : undefined;
      return (pid && pid === String(paperId)) || (fname && fname === String(paperId));
    });
    if (idx === -1) return res.status(404).json({ error: "Paper not found" });

    const [removed] = subject.papers.splice(idx, 1);
    try { dept.markModified('courses'); } catch {}
    await dept.save();

    // best-effort delete file from disk
    try {
      if (removed?.fileUrl) {
        const absolutePath = path.join(__dirname, "..", removed.fileUrl.replace(/^\//, ""));
        if (fs.existsSync(absolutePath)) fs.unlinkSync(absolutePath);
      }
    } catch (e) {}

    res.json({ success: true });
  } catch (err) {
    console.error("Delete paper error:", err);
    res.status(500).json({ error: "Delete failed" });
  }
});

// UPDATE a paper (optionally replace file and/or year)
router.put("/upload/:courseName/:year/:subjectName/:paperId", protect, requireTeacherOrAdmin, upload.single("paper"), async (req, res) => {
  try {
    const { courseName, year, subjectName, paperId } = req.params;
    const { college } = req.query;
    const newPaperYear = req.body.paperYear ? Number(req.body.paperYear) : undefined;
    const { dept, courseIdx } = await findDeptByCourse(courseName, college);
    if (!dept || courseIdx === -1) return res.status(404).json({ error: "Course not found" });
    const course = dept.courses[courseIdx];
    const yearKey = matchYearKey(Object.keys(course.years || {}), year) || year;
    const subjects = course.years[yearKey] || [];
    const subject = subjects.find(s => normalize(s.name) === normalize(subjectName));
    if (!subject) return res.status(404).json({ error: "Subject not found" });
    // ensure papers array exists on legacy seeded subjects
    if (!Array.isArray(subject.papers)) subject.papers = [];

    const paper = subject.papers.find(p => {
      const pid = p && p._id ? String(p._id) : undefined;
      const fname = (p && p.fileUrl) ? String(p.fileUrl).split('/').pop() : undefined;
      return (pid && pid === String(paperId)) || (fname && fname === String(paperId));
    });
    if (!paper) return res.status(404).json({ error: "Paper not found" });

    // If a new file uploaded, delete old file and set new url
    if (req.file) {
      try {
        if (paper.fileUrl) {
          const oldAbsolutePath = path.join(__dirname, "..", paper.fileUrl.replace(/^\//, ""));
          if (fs.existsSync(oldAbsolutePath)) fs.unlinkSync(oldAbsolutePath);
        }
      } catch (e) {}
      paper.fileUrl = `/uploads/${req.file.filename}`;
    }

    if (typeof newPaperYear === 'number' && !Number.isNaN(newPaperYear)) {
      paper.year = newPaperYear;
    }

    try { dept.markModified('courses'); } catch {}
    await dept.save();
    res.json({ success: true, paper });
  } catch (err) {
    console.error("Update paper error:", err);
    res.status(500).json({ error: "Update failed" });
  }
});

module.exports = router;
/**
 * Management endpoints for courses/years/subjects (teacher/admin only)
 */
router.post("/departments/:deptName/courses", protect, requireTeacherOrAdmin, async (req, res) => {
  try {
    const { deptName } = req.params;
    const { name } = req.body;
    const college = req.body.college || req.query.college || req.headers["x-college"];
    if (!name) return res.status(400).json({ error: "Course name is required" });
    const filterBase = { name: deptName };
    const filter = college ? { ...filterBase, college: { $regex: college, $options: "i" } } : filterBase;
    const dept = await Department.findOne(filter);
    if (!dept) return res.status(404).json({ error: "Department not found" });
    if (!dept.courses) dept.courses = [];
    if (dept.courses.find(c => c.name === name)) return res.status(400).json({ error: "Course already exists" });
    dept.courses.push({ name, years: {} });
    dept.markModified('courses');
    await dept.save();
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Failed to add course" });
  }
});

router.delete("/departments/:deptName/courses/:courseName", protect, requireTeacherOrAdmin, async (req, res) => {
  try {
    const { deptName, courseName } = req.params;
    const { college } = req.query;
    const filterBase = { name: deptName };
    const filter = college ? { ...filterBase, college: { $regex: college, $options: "i" } } : filterBase;
    const dept = await Department.findOne(filter);
    if (!dept) return res.status(404).json({ error: "Department not found" });
    const before = (dept.courses || []).length;
    dept.courses = (dept.courses || []).filter(c => c.name !== courseName);
    if (dept.courses.length === before) return res.status(404).json({ error: "Course not found" });
    dept.markModified('courses');
    await dept.save();
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Failed to remove course" });
  }
});

router.post("/courses/:courseName/years", protect, requireTeacherOrAdmin, async (req, res) => {
  try {
    const { courseName } = req.params;
    const { year } = req.body;
    const college = req.body.college || req.query.college || req.headers["x-college"];
    const label = String(year || "").trim();
    if (!label) return res.status(400).json({ error: "Year is required" });
    const filter = college ? { "courses.name": courseName, college: { $regex: college, $options: "i" } } : { "courses.name": courseName };
    const dept = await Department.findOne(filter);
    if (!dept) return res.status(404).json({ error: "Course not found" });
    const course = dept.courses.find(c => c.name === courseName);
    if (!course.years) course.years = {};
    const existingKey = Object.keys(course.years).find(k => k.toLowerCase() === label.toLowerCase());
    const key = existingKey || label;
    if (!course.years[key]) course.years[key] = [];
    // Mixed type: ensure Mongoose detects changes
    dept.markModified('courses');
    await dept.save();
    res.json({ success: true, years: Object.keys(course.years || {}) });
  } catch (e) {
    res.status(500).json({ error: "Failed to add year" });
  }
});

router.delete("/courses/:courseName/years/:year", protect, requireTeacherOrAdmin, async (req, res) => {
  try {
    const { courseName, year } = req.params;
    const { college } = req.query;
    const filter = college ? { "courses.name": courseName, college: { $regex: college, $options: "i" } } : { "courses.name": courseName };
    const dept = await Department.findOne(filter);
    if (!dept) return res.status(404).json({ error: "Course not found" });
    const course = dept.courses.find(c => c.name === courseName);
    const yearKeys = Object.keys(course.years || {});
    const matchKey = yearKeys.find(k => k.toLowerCase() === String(year).toLowerCase());
    if (!matchKey) return res.status(404).json({ error: "Year not found" });
    delete course.years[matchKey];
    dept.markModified('courses');
    await dept.save();
    res.json({ success: true, years: Object.keys(course.years || {}) });
  } catch (e) {
    res.status(500).json({ error: "Failed to remove year" });
  }
});

router.post("/courses/:courseName/:year/subjects", protect, requireTeacherOrAdmin, async (req, res) => {
  try {
    const { courseName, year } = req.params;
    const { name } = req.body;
    const college = req.body.college || req.query.college || req.headers["x-college"];
    const subjectName = String(name || "").trim();
    if (!subjectName) return res.status(400).json({ error: "Subject name is required" });
    const filter = college ? { "courses.name": courseName, college: { $regex: college, $options: "i" } } : { "courses.name": courseName };
    const dept = await Department.findOne(filter);
    if (!dept) return res.status(404).json({ error: "Course not found" });
    const course = dept.courses.find(c => c.name === courseName);
    if (!course.years) course.years = {};
    const yearKeys = Object.keys(course.years);
    const matchKey = yearKeys.find(k => k.toLowerCase() === String(year).toLowerCase()) || year;
    if (!course.years[matchKey]) course.years[matchKey] = [];
    if (course.years[matchKey].find(s => s.name.toLowerCase() === subjectName.toLowerCase())) return res.status(400).json({ error: "Subject already exists" });
    course.years[matchKey].push({ name: subjectName, papers: [] });
    dept.markModified('courses');
    await dept.save();
    res.json({ success: true, subjects: course.years[matchKey].map(s => s.name) });
  } catch (e) {
    res.status(500).json({ error: "Failed to add subject" });
  }
});

router.delete("/courses/:courseName/:year/subjects/:subjectName", protect, requireTeacherOrAdmin, async (req, res) => {
  try {
    const { courseName, year, subjectName } = req.params;
    const { college } = req.query;
    const filter = college ? { "courses.name": courseName, college: { $regex: college, $options: "i" } } : { "courses.name": courseName };
    const dept = await Department.findOne(filter);
    if (!dept) return res.status(404).json({ error: "Course not found" });
    const course = dept.courses.find(c => c.name === courseName);
    const yearKeys = Object.keys(course.years || {});
    const matchKey = yearKeys.find(k => k.toLowerCase() === String(year).toLowerCase());
    if (!matchKey) return res.status(404).json({ error: "Year not found" });
    const before = course.years[matchKey].length;
    course.years[matchKey] = course.years[matchKey].filter(s => s.name.toLowerCase() !== String(subjectName).toLowerCase());
    if (course.years[matchKey].length === before) return res.status(404).json({ error: "Subject not found" });
    dept.markModified('courses');
    await dept.save();
    res.json({ success: true, subjects: course.years[matchKey].map(s => s.name) });
  } catch (e) {
    res.status(500).json({ error: "Failed to remove subject" });
  }
});
