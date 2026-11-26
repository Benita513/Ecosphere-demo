// server.js - receives sensor data, stores it in SQLite, serves the dashboard
const express = require('express');
const cors = require('cors');
const path = require('path');
const Database = require('better-sqlite3');

const app = express();
app.use(cors());
app.use(express.json());

// Put your dashboard files in a folder called public
app.use(express.static(path.join(__dirname, 'public')));

// Creates hydroponics.db automatically; open this file in DBeaver
const db = new Database(path.join(__dirname, 'hydroponics.db'));
db.exec(`
  CREATE TABLE IF NOT EXISTS readings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    temperature REAL NOT NULL,
    water_level REAL NOT NULL,
    source TEXT DEFAULT 'gsm_sim',
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

const insertReading = db.prepare(
  'INSERT INTO readings (temperature, water_level, source) VALUES (?, ?, ?)'
);

// Arduino/GSM (or gsm.js) sends data here
app.post('/api/readings', (req, res) => {
  const { temperature, waterLevel, source } = req.body;

  if (typeof temperature !== 'number' || typeof waterLevel !== 'number') {
    return res.status(400).json({ error: 'temperature and waterLevel must be numbers' });
  }
  if (temperature < -10 || temperature > 60 || waterLevel < 0 || waterLevel > 100) {
    return res.status(400).json({ error: 'values out of valid range' });
  }

  const info = insertReading.run(temperature, waterLevel, source || 'gsm_sim');
  res.status(201).json({ id: info.lastInsertRowid });
});

// Dashboard reads the newest reading
app.get('/api/readings/latest', (req, res) => {
  const row = db.prepare('SELECT * FROM readings ORDER BY id DESC LIMIT 1').get();
  if (!row) return res.status(404).json({ error: 'no data yet' });
  res.json(row);
});

// History, e.g. /api/readings?limit=50
app.get('/api/readings', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 50, 500);
  const rows = db.prepare('SELECT * FROM readings ORDER BY id DESC LIMIT ?').all(limit);
  res.json(rows);
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));