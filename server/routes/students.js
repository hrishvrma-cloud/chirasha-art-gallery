const express = require('express');
const router = express.Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

// Get all students with parent info & pass summary
router.get('/', (req, res) => {
  const students = db.prepare(`
    SELECT s.*, u.name as parent_name, u.phone as parent_phone, u.email as parent_email
    FROM students s
    LEFT JOIN users u ON s.parent_id = u.id
    ORDER BY s.name ASC
  `).all();

  const passes = db.prepare('SELECT * FROM session_passes').all();
  const attendanceCounts = db.prepare(`
    SELECT student_id, COUNT(*) as attended_count 
    FROM attendance 
    WHERE status = 'present' 
    GROUP BY student_id
  `).all();

  const attendMap = {};
  for (const a of attendanceCounts) {
    attendMap[a.student_id] = a.attended_count;
  }

  const enriched = students.map(student => {
    const studentPasses = passes.filter(p => p.student_id === student.id);
    const activePass = studentPasses.find(p => p.used_credits < p.total_credits);
    return {
      ...student,
      total_attended: attendMap[student.id] || 0,
      active_pass: activePass || null,
      all_passes: studentPasses
    };
  });

  res.json(enriched);
});

// Add a new student
router.post('/', (req, res) => {
  const { name, age, grade, notes, parent_id, initial_pass_type, fee_amount } = req.body;
  if (!name || !age) {
    return res.status(400).json({ error: 'Name and age are required' });
  }

  const id = 'stud-' + uuidv4().substring(0, 8);
  const now = new Date().toISOString();
  const joinedDate = now.split('T')[0];

  db.prepare(`
    INSERT INTO students (id, parent_id, name, age, grade, notes, status, joined_date)
    VALUES (?, ?, ?, ?, ?, ?, 'active', ?)
  `).run(id, parent_id || null, name, parseInt(age), grade || '', notes || '', joinedDate);

  // If an initial pass was selected, create it immediately!
  if (initial_pass_type) {
    const passId = 'pass-' + uuidv4().substring(0, 8);
    let totalCredits = 4;
    let title = '4 Weekend Sessions Pass';

    if (initial_pass_type === '8_weekend_pass') {
      totalCredits = 8;
      title = '8 Weekend Sessions Card';
    } else if (initial_pass_type === 'holiday_camp') {
      totalCredits = 5;
      title = 'Holiday Art Camp Pass';
    } else if (initial_pass_type === 'single_trial') {
      totalCredits = 1;
      title = 'Trial Art Session';
    }

    db.prepare(`
      INSERT INTO session_passes (id, student_id, pass_type, title, total_credits, used_credits, fee_amount, amount_paid, payment_status, payment_method, purchased_at, notes)
      VALUES (?, ?, ?, ?, ?, 0, ?, ?, 'pending', null, ?, 'Initial pass issued')
    `).run(passId, id, initial_pass_type, title, totalCredits, parseFloat(fee_amount) || 1800, 0, joinedDate);
  }

  res.status(201).json({ id, message: 'Student registered successfully' });
});

// Get single student detailed profile (for Admin or Parent view)
router.get('/:id', (req, res) => {
  const student = db.prepare(`
    SELECT s.*, u.name as parent_name, u.phone as parent_phone, u.email as parent_email
    FROM students s
    LEFT JOIN users u ON s.parent_id = u.id
    WHERE s.id = ?
  `).get(req.params.id);

  if (!student) return res.status(404).json({ error: 'Student not found' });

  // Passes
  const passes = db.prepare('SELECT * FROM session_passes WHERE student_id = ? ORDER BY purchased_at DESC').all(req.params.id);

  // Attendance history with session titles
  const attendance = db.prepare(`
    SELECT a.*, s.title as session_title, s.date as session_date, s.start_time, s.type as session_type
    FROM attendance a
    JOIN sessions s ON a.session_id = s.id
    WHERE a.student_id = ?
    ORDER BY s.date DESC
  `).all(req.params.id);

  // Artworks and tags in class activities
  const artworks = db.prepare(`
    SELECT t.*, p.title as post_title, p.medium, p.description, p.created_at as activity_date, p.images as post_images
    FROM activity_student_tags t
    JOIN activity_posts p ON t.post_id = p.id
    WHERE t.student_id = ?
    ORDER BY p.created_at DESC
  `).all(req.params.id);

  res.json({
    student,
    passes,
    attendance,
    artworks: artworks.map(a => ({
      ...a,
      post_images: JSON.parse(a.post_images || '[]')
    }))
  });
});

// Update student
router.put('/:id', (req, res) => {
  const { name, age, grade, notes, parent_id, status } = req.body;
  db.prepare(`
    UPDATE students 
    SET name = COALESCE(?, name),
        age = COALESCE(?, age),
        grade = COALESCE(?, grade),
        notes = COALESCE(?, notes),
        parent_id = COALESCE(?, parent_id),
        status = COALESCE(?, status)
    WHERE id = ?
  `).run(name, age ? parseInt(age) : null, grade, notes, parent_id, status, req.params.id);

  res.json({ message: 'Student updated successfully' });
});

module.exports = router;
