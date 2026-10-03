const mongoose = require("mongoose");

const paperSchema = new mongoose.Schema({
  year: Number,
  fileUrl: String, // relative URL saved, e.g. /uploads/myfile.pdf
});

const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  papers: [paperSchema],
});

const courseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  // Use flexible year buckets so colleges can define any labels (e.g., FY/SY/TY or First/Second/Third Year)
  years: { type: mongoose.Schema.Types.Mixed, default: {} },
});

const departmentSchema = new mongoose.Schema({
  college: { type: String, required: false, trim: true, index: true },
  name: { type: String, required: true },
  courses: [courseSchema],
});

// Ensure departments are unique per college, not globally by name
// This also fixes legacy unique indexes on just `name` by providing the intended compound uniqueness
departmentSchema.index({ name: 1, college: 1 }, { unique: true });

module.exports = mongoose.model("Department", departmentSchema);
