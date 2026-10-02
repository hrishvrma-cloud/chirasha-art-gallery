const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const db = require('./db');
require('dotenv').config();

const { router: authRouter } = require('./routes/auth');
const studentsRouter = require('./routes/students');
const sessionsRouter = require('./routes/sessions');
const attendanceRouter = require('./routes/attendance');
const passesRouter = require('./routes/passes');
const activitiesRouter = require('./routes/activities');
const suggestionsRouter = require('./routes/suggestions');
const enrollmentsRouter = require('./routes/enrollments');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/students', studentsRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/passes', passesRouter);
app.use('/api/activities', activitiesRouter);
app.use('/api/suggestions', suggestionsRouter);
app.use('/api/enrollments', enrollmentsRouter);

// Studio Admin Dashboard Stats
app.get('/api/dashboard/stats', (req, res) => {
  try {
    const studentCount = db.prepare("SELECT COUNT(*) as count FROM students WHERE status = 'active'").get().count;
    const sessionCount = db.prepare("SELECT COUNT(*) as count FROM sessions WHERE status = 'upcoming'").get().count;
    const totalActivities = db.prepare("SELECT COUNT(*) as count FROM activity_posts").get().count;
    const pendingInquiries = db.prepare("SELECT COUNT(*) as count FROM enrollment_inquiries WHERE status = 'pending'").get().count;
    
    // Fee balance stats
    const passes = db.prepare("SELECT fee_amount, amount_paid FROM session_passes").all();
    let totalRevenue = 0;
    let pendingFee = 0;
    passes.forEach(p => {
      totalRevenue += (p.amount_paid || 0);
      pendingFee += Math.max(0, (p.fee_amount || 0) - (p.amount_paid || 0));
    });

    // Low credit passes (remaining <= 1)
    const lowCreditPasses = db.prepare(`
      SELECT p.*, s.name as student_name, u.phone as parent_phone
      FROM session_passes p
      JOIN students s ON p.student_id = s.id
      LEFT JOIN users u ON s.parent_id = u.id
      WHERE (p.total_credits - p.used_credits) <= 1
    `).all();

    res.json({
      activeStudents: studentCount,
      upcomingSessions: sessionCount,
      totalActivities,
      pendingInquiries,
      totalRevenue,
      pendingFee,
      lowCreditPasses: lowCreditPasses.map(p => ({
        ...p,
        remaining_credits: Math.max(0, p.total_credits - p.used_credits)
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', studio: 'Art Classes Platform API', time: new Date().toISOString() });
});

// Serve frontend build if dist folder exists
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  // In Express 5, use app.use fallback for SPA routing
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      return res.sendFile(path.join(clientDistPath, 'index.html'));
    }
    next();
  });
}

app.listen(PORT, () => {
  console.log(`🎨 Art Studio Server running on http://localhost:${PORT}`);
});
