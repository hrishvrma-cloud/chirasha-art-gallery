const express = require('express');
const router = express.Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

// Mark or update attendance for a student in a session
router.post('/mark', (req, res) => {
  const { session_id, student_id, status, notes } = req.body;
  if (!session_id || !student_id || !status) {
    return res.status(400).json({ error: 'Session ID, student ID, and status are required' });
  }

  // Check if attendance already exists
  const existing = db.prepare(`
    SELECT * FROM attendance WHERE session_id = ? AND student_id = ?
  `).get(session_id, student_id);

  const now = new Date().toISOString();

  // Find active pass for the student
  const activePass = db.prepare(`
    SELECT * FROM session_passes 
    WHERE student_id = ? AND used_credits < total_credits
    ORDER BY purchased_at ASC
    LIMIT 1
  `).get(student_id);

  db.transaction(() => {
    if (existing) {
      const prevStatus = existing.status;
      const prevPassId = existing.pass_id;

      // Update attendance record
      db.prepare(`
        UPDATE attendance 
        SET status = ?, notes = COALESCE(?, notes), recorded_at = ?
        WHERE session_id = ? AND student_id = ?
      `).run(status, notes, now, session_id, student_id);

      // Handle credit adjustments
      if (prevStatus !== 'present' && status === 'present') {
        // Was not present, now present: deduct 1 credit
        if (activePass) {
          db.prepare('UPDATE session_passes SET used_credits = used_credits + 1 WHERE id = ?').run(activePass.id);
          db.prepare('UPDATE attendance SET pass_id = ? WHERE session_id = ? AND student_id = ?').run(activePass.id, session_id, student_id);
        }
      } else if (prevStatus === 'present' && status !== 'present') {
        // Was present, now absent/excused: refund 1 credit if a pass was used
        if (prevPassId) {
          db.prepare('UPDATE session_passes SET used_credits = MAX(0, used_credits - 1) WHERE id = ?').run(prevPassId);
          db.prepare('UPDATE attendance SET pass_id = NULL WHERE session_id = ? AND student_id = ?').run(session_id, student_id);
        }
      }
    } else {
      // New attendance record
      const id = 'att-' + uuidv4().substring(0, 8);
      let passIdToAttach = null;

      if (status === 'present' && activePass) {
        passIdToAttach = activePass.id;
        db.prepare('UPDATE session_passes SET used_credits = used_credits + 1 WHERE id = ?').run(activePass.id);
      }

      db.prepare(`
        INSERT INTO attendance (id, session_id, student_id, status, pass_id, notes, recorded_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(id, session_id, student_id, status, passIdToAttach, notes || 'Marked in session', now);
    }
  })();

  // Fetch updated student pass info to return
  const updatedPass = db.prepare(`
    SELECT * FROM session_passes WHERE student_id = ? ORDER BY purchased_at DESC LIMIT 1
  `).get(student_id);

  res.json({
    message: `Attendance marked as ${status}`,
    student_id,
    status,
    pass: updatedPass
  });
});

// Batch mark attendance for entire session (e.g. mark all attending)
router.post('/batch-mark', (req, res) => {
  const { session_id, records } = req.body; // array of { student_id, status }
  if (!session_id || !Array.isArray(records)) {
    return res.status(400).json({ error: 'Session ID and records array are required' });
  }

  const now = new Date().toISOString();

  db.transaction(() => {
    for (const r of records) {
      const existing = db.prepare('SELECT * FROM attendance WHERE session_id = ? AND student_id = ?').get(session_id, r.student_id);
      const activePass = db.prepare('SELECT * FROM session_passes WHERE student_id = ? AND used_credits < total_credits LIMIT 1').get(r.student_id);

      if (existing) {
        if (existing.status !== 'present' && r.status === 'present' && activePass) {
          db.prepare('UPDATE session_passes SET used_credits = used_credits + 1 WHERE id = ?').run(activePass.id);
          db.prepare('UPDATE attendance SET status = ?, pass_id = ?, recorded_at = ? WHERE session_id = ? AND student_id = ?')
            .run(r.status, activePass.id, now, session_id, r.student_id);
        } else {
          db.prepare('UPDATE attendance SET status = ?, recorded_at = ? WHERE session_id = ? AND student_id = ?')
            .run(r.status, now, session_id, r.student_id);
        }
      } else {
        const id = 'att-' + uuidv4().substring(0, 8);
        let passId = null;
        if (r.status === 'present' && activePass) {
          passId = activePass.id;
          db.prepare('UPDATE session_passes SET used_credits = used_credits + 1 WHERE id = ?').run(activePass.id);
        }
        db.prepare('INSERT INTO attendance (id, session_id, student_id, status, pass_id, notes, recorded_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
          .run(id, session_id, r.student_id, r.status, passId, 'Batch marked', now);
      }
    }
  })();

  res.json({ message: 'Batch attendance saved successfully' });
});

module.exports = router;
