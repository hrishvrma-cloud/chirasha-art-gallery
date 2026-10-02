const express = require('express');
const router = express.Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

// Get all sessions
router.get('/', (req, res) => {
  const sessions = db.prepare(`
    SELECT s.*, 
      (SELECT COUNT(*) FROM attendance WHERE session_id = s.id AND status = 'present') as attended_count,
      (SELECT COUNT(*) FROM attendance WHERE session_id = s.id) as total_marked
    FROM sessions s
    ORDER BY s.date DESC
  `).all();

  res.json(sessions);
});

// Create new weekend or holiday camp session
router.post('/', (req, res) => {
  const { title, type, date, start_time, end_time, location, max_seats, age_group } = req.body;
  if (!title || !date || !start_time) {
    return res.status(400).json({ error: 'Title, date, and start time are required' });
  }

  const id = 'sess-' + uuidv4().substring(0, 8);
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO sessions (id, title, type, date, start_time, end_time, location, max_seats, age_group, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'upcoming', ?)
  `).run(
    id,
    title,
    type || 'weekend',
    date,
    start_time,
    end_time || '11:30 AM',
    location || 'Studio Main Hall',
    parseInt(max_seats) || 12,
    age_group || '6 - 14 Years',
    now
  );

  res.status(201).json({ id, message: 'Session scheduled successfully' });
});

// Get session details and roll-call roster
router.get('/:id', (req, res) => {
  const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  // Fetch all active students with their current attendance status in this session
  const students = db.prepare(`
    SELECT s.id, s.name, s.age, s.grade,
           u.name as parent_name, u.phone as parent_phone,
           a.status as attendance_status, a.notes as attendance_notes, a.pass_id,
           p.id as active_pass_id, p.title as pass_title, p.total_credits, p.used_credits, p.payment_status
    FROM students s
    LEFT JOIN users u ON s.parent_id = u.id
    LEFT JOIN attendance a ON a.student_id = s.id AND a.session_id = ?
    LEFT JOIN session_passes p ON p.student_id = s.id AND p.used_credits < p.total_credits
    WHERE s.status = 'active'
    ORDER BY s.name ASC
  `).all(req.params.id);

  res.json({ session, roster: students });
});

// Update session
router.put('/:id', (req, res) => {
  const { title, type, date, start_time, end_time, location, max_seats, age_group, status } = req.body;
  db.prepare(`
    UPDATE sessions
    SET title = COALESCE(?, title),
        type = COALESCE(?, type),
        date = COALESCE(?, date),
        start_time = COALESCE(?, start_time),
        end_time = COALESCE(?, end_time),
        location = COALESCE(?, location),
        max_seats = COALESCE(?, max_seats),
        age_group = COALESCE(?, age_group),
        status = COALESCE(?, status)
    WHERE id = ?
  `).run(title, type, date, start_time, end_time, location, max_seats ? parseInt(max_seats) : null, age_group, status, req.params.id);

  res.json({ message: 'Session updated successfully' });
});

module.exports = router;
