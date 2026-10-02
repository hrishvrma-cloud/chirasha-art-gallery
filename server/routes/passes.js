const express = require('express');
const router = express.Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

// Get all passes with student and parent details
router.get('/', (req, res) => {
  const passes = db.prepare(`
    SELECT p.*, s.name as student_name, s.age as student_age,
           u.name as parent_name, u.phone as parent_phone, u.email as parent_email
    FROM session_passes p
    JOIN students s ON p.student_id = s.id
    LEFT JOIN users u ON s.parent_id = u.id
    ORDER BY p.purchased_at DESC
  `).all();

  const formatted = passes.map(p => ({
    ...p,
    remaining_credits: Math.max(0, p.total_credits - p.used_credits),
    is_exhausted: p.used_credits >= p.total_credits,
    needs_renewal: (p.total_credits - p.used_credits) <= 1
  }));

  res.json(formatted);
});

// Issue a new pass for a student
router.post('/', (req, res) => {
  const { student_id, pass_type, title, total_credits, fee_amount, payment_status, payment_method, notes } = req.body;
  if (!student_id || !pass_type || !total_credits || !fee_amount) {
    return res.status(400).json({ error: 'Student, pass type, total credits, and fee amount are required' });
  }

  const id = 'pass-' + uuidv4().substring(0, 8);
  const now = new Date().toISOString().split('T')[0];

  const amountPaid = payment_status === 'paid' ? parseFloat(fee_amount) : 0;

  db.prepare(`
    INSERT INTO session_passes (id, student_id, pass_type, title, total_credits, used_credits, fee_amount, amount_paid, payment_status, payment_method, purchased_at, notes)
    VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    student_id,
    pass_type,
    title || 'Art Class Session Pass',
    parseInt(total_credits),
    parseFloat(fee_amount),
    amountPaid,
    payment_status || 'pending',
    payment_method || null,
    now,
    notes || 'New pass issued'
  );

  res.status(201).json({ id, message: 'Session pass issued successfully' });
});

// Record or update fee payment for a pass
router.put('/:id/payment', (req, res) => {
  const { amount_paid, payment_status, payment_method, notes } = req.body;
  const pass = db.prepare('SELECT * FROM session_passes WHERE id = ?').get(req.params.id);
  if (!pass) return res.status(404).json({ error: 'Pass not found' });

  const newAmountPaid = amount_paid !== undefined ? parseFloat(amount_paid) : pass.amount_paid;
  let status = payment_status;
  if (!status) {
    if (newAmountPaid >= pass.fee_amount) status = 'paid';
    else if (newAmountPaid > 0) status = 'partial';
    else status = 'pending';
  }

  db.prepare(`
    UPDATE session_passes
    SET amount_paid = ?,
        payment_status = ?,
        payment_method = COALESCE(?, payment_method),
        notes = COALESCE(?, notes)
    WHERE id = ?
  `).run(newAmountPaid, status, payment_method, notes, req.params.id);

  res.json({ message: 'Payment recorded successfully' });
});

// Generate WhatsApp reminder message
router.get('/:id/whatsapp-reminder', (req, res) => {
  const pass = db.prepare(`
    SELECT p.*, s.name as student_name,
           u.name as parent_name, u.phone as parent_phone
    FROM session_passes p
    JOIN students s ON p.student_id = s.id
    LEFT JOIN users u ON s.parent_id = u.id
    WHERE p.id = ?
  `).get(req.params.id);

  if (!pass) return res.status(404).json({ error: 'Pass not found' });

  const parentName = pass.parent_name || 'Parent';
  const childName = pass.student_name;
  const remaining = Math.max(0, pass.total_credits - pass.used_credits);
  const pendingAmount = Math.max(0, pass.fee_amount - pass.amount_paid);

  let message = '';

  if (pendingAmount > 0) {
    message = `🎨 *Chirasha Art Gallery - Fee Reminder*\n\nDear ${parentName},\n\nHope you are having a wonderful week! This is a friendly reminder regarding ${childName}'s *${pass.title}*.\n\n• Pass Fee: ₹${pass.fee_amount}\n• Amount Received: ₹${pass.amount_paid}\n• *Pending Balance: ₹${pendingAmount}*\n\nYou can pay via UPI or during this weekend's class. Thank you for supporting ${childName}'s creative journey!\n\nWarm regards,\n*Chirasha Art Gallery* 🖌️`;
  } else if (remaining <= 1) {
    message = `🎨 *Chirasha Art Gallery - Pass Renewal*\n\nDear ${parentName},\n\n${childName} is doing wonderful creative work in our weekend art classes! 🌟\n\nThis is to notify you that ${childName} has completed *${pass.used_credits} of ${pass.total_credits} sessions* (${remaining === 0 ? 'Pass completed' : 'Only 1 session remaining'}).\n\nTo ensure continuous weekend learning and hold their seat, please renew their upcoming session pass.\n\nWarm regards,\n*Chirasha Art Gallery* 🖌️`;
  } else {
    message = `🎨 *Chirasha Art Gallery - Class Update*\n\nDear ${parentName},\n\n${childName} has attended ${pass.used_credits} sessions. You have *${remaining} sessions remaining* on your ${pass.title}. See you this upcoming weekend!\n\nWarm regards,\n*Chirasha Art Gallery* 🖌️`;
  }

  res.json({
    phone: pass.parent_phone,
    message,
    whatsappUrl: pass.parent_phone ? `https://wa.me/${pass.parent_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}` : null
  });
});

module.exports = router;
