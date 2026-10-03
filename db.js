// server/db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Use a file-based SQLite database located at server/database.db
const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Failed to connect to SQLite database:', err.message);
  } else {
    console.log('✅ Connected to SQLite database at', dbPath);
  }
});

// Initialize schema for papers if it does not exist
db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS papers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      subject TEXT,
      course TEXT,
      college TEXT,
      year TEXT,
      semester TEXT,
      exam_type TEXT,
      filename TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  );
});

module.exports = db;
