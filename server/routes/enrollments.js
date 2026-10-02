const express = require('express');
const router = express.Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

// Submit new enrollment inquiry (Public)
router.post('/', (req, res) => {
  const { parent_name, child_name, child_age, phone, email, interest, message } = req.body;
  if (!parent_name || !child_name || !phone) {
    return res.status(400).json({ error: 'Parent name, child name, and phone are required' });
  }

  const id = 'inq-' + uuidv4().substring(0, 8);
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO enrollment_inquiries (id, parent_name, child_name, child_age, phone, email, interest, message, status, submitted_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
  `).run(
    id,
    parent_name,
    child_name,
    parseInt(child_age) || 7,
    phone,
    email || null,
    interest || 'Weekend Classes',
    message || '',
    now
  );

  res.status(201).json({ id, message: 'Enrollment inquiry received! Madam will connect with you shortly.' });
});

// Get all inquiries (Admin)
router.get('/', (req, res) => {
  const inquiries = db.prepare('SELECT * FROM enrollment_inquiries ORDER BY submitted_at DESC').all();
  res.json(inquiries);
});

// Update inquiry status or convert to student
router.put('/:id/status', (req, res) => {
  const { status, convert_to_student } = req.body;
  const inq = db.prepare('SELECT * FROM enrollment_inquiries WHERE id = ?').get(req.params.id);
  if (!inq) return res.status(404).json({ error: 'Inquiry not found' });

  db.prepare('UPDATE enrollment_inquiries SET status = ? WHERE id = ?').run(status, req.params.id);

  let newStudentId = null;
  if (convert_to_student && status === 'approved') {
    newStudentId = 'stud-' + uuidv4().substring(0, 8);
    const now = new Date().toISOString().split('T')[0];

    db.prepare(`
      INSERT INTO students (id, parent_id, name, age, grade, notes, status, joined_date)
      VALUES (?, null, ?, ?, 'Enrolled from Web Inquiry', ?, 'active', ?)
    `).run(newStudentId, inq.child_name, inq.child_age, `Contact: ${inq.phone} (${inq.parent_name})`, now);
  }

  res.json({ message: 'Inquiry updated', studentId: newStudentId });
});

module.exports = router;
