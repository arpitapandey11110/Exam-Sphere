// server/routes/papers.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../db');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Upload paper
router.post('/', upload.single('file'), (req, res) => {
  const { title, subject, course, college, year, semester, exam_type } = req.body;
  const filename = req.file.filename;
  db.run(
    `INSERT INTO papers (title, subject, course, college, year, semester, exam_type, filename) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [title, subject, course, college, year, semester, exam_type, filename],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, filename });
    }
  );
});

// Get all papers
router.get('/', (req, res) => {
  db.all(`SELECT * FROM papers ORDER BY id DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get single paper
router.get('/:id', (req, res) => {
  db.get(`SELECT * FROM papers WHERE id = ?`, [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  });
});

module.exports = router;
