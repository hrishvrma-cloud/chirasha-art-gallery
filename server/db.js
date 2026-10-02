const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const dbDir = path.join(__dirname, 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'art_studio.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'parent', -- 'admin' or 'parent'
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY,
      parent_id TEXT,
      name TEXT NOT NULL,
      age INTEGER NOT NULL,
      grade TEXT,
      notes TEXT,
      status TEXT DEFAULT 'active',
      joined_date TEXT NOT NULL,
      FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'weekend', -- 'weekend', 'holiday_camp', 'workshop', 'trial'
      date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      location TEXT DEFAULT 'Art Studio Main Hall',
      max_seats INTEGER DEFAULT 12,
      age_group TEXT DEFAULT '6 - 14 Years',
      status TEXT DEFAULT 'upcoming', -- 'upcoming', 'completed', 'cancelled'
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS session_passes (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      pass_type TEXT NOT NULL, -- '4_weekend_pass', '8_weekend_pass', 'holiday_camp', 'single_trial'
      title TEXT NOT NULL,
      total_credits INTEGER NOT NULL,
      used_credits INTEGER NOT NULL DEFAULT 0,
      fee_amount REAL NOT NULL,
      amount_paid REAL NOT NULL DEFAULT 0,
      payment_status TEXT NOT NULL DEFAULT 'pending', -- 'paid', 'pending', 'partial'
      payment_method TEXT,
      purchased_at TEXT NOT NULL,
      notes TEXT,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      student_id TEXT NOT NULL,
      status TEXT NOT NULL, -- 'present', 'absent', 'excused'
      pass_id TEXT,
      notes TEXT,
      recorded_at TEXT NOT NULL,
      UNIQUE(session_id, student_id),
      FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (pass_id) REFERENCES session_passes(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS activity_posts (
      id TEXT PRIMARY KEY,
      session_id TEXT,
      title TEXT NOT NULL,
      medium TEXT NOT NULL, -- 'Watercolor', 'Acrylics', 'Sketching', 'Oil Pastels', 'Clay Craft', etc.
      technique TEXT,
      description TEXT NOT NULL,
      materials_used TEXT,
      images TEXT, -- JSON array of image URLs
      is_public INTEGER DEFAULT 1, -- 1 for public showcase & promotions, 0 for student-only
      created_at TEXT NOT NULL,
      FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS activity_student_tags (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL,
      student_id TEXT NOT NULL,
      student_artwork_image TEXT,
      instructor_feedback TEXT,
      FOREIGN KEY (post_id) REFERENCES activity_posts(id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS ai_suggestions (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      medium TEXT NOT NULL,
      target_age TEXT NOT NULL,
      rationale TEXT NOT NULL,
      materials_needed TEXT NOT NULL, -- JSON array
      step_by_step TEXT NOT NULL, -- JSON array
      promotional_pitch TEXT NOT NULL,
      status TEXT DEFAULT 'suggested', -- 'suggested', 'accepted', 'dismissed'
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS enrollment_inquiries (
      id TEXT PRIMARY KEY,
      parent_name TEXT NOT NULL,
      child_name TEXT NOT NULL,
      child_age INTEGER NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      interest TEXT NOT NULL, -- 'Weekend Classes', 'Holiday Camp', 'Trial Class'
      message TEXT,
      status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'contacted'
      submitted_at TEXT NOT NULL
    );
  `);

  seedInitialData();
}

function seedInitialData() {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount > 0) return; // already seeded

  console.log('🌱 Seeding initial demo data for Art Studio...');

  const now = new Date().toISOString();
  const salt = bcrypt.genSaltSync(10);
  const adminPassHash = bcrypt.hashSync('admin123', salt);
  const parentPassHash = bcrypt.hashSync('parent123', salt);

  // 1. Create Admin (Madam / Studio Owner)
  db.prepare(`
    INSERT INTO users (id, name, email, phone, password_hash, role, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run('admin-1', 'Madam Art Director', 'admin@artclasses.com', '+91 98765 43210', adminPassHash, 'admin', now);

  // 2. Create Sample Parents
  db.prepare(`
    INSERT INTO users (id, name, email, phone, password_hash, role, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run('parent-1', 'Priya Sharma', 'priya@gmail.com', '+91 98123 45678', parentPassHash, 'parent', now);

  db.prepare(`
    INSERT INTO users (id, name, email, phone, password_hash, role, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run('parent-2', 'Rahul Verma', 'rahul@gmail.com', '+91 98234 56789', parentPassHash, 'parent', now);

  db.prepare(`
    INSERT INTO users (id, name, email, phone, password_hash, role, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run('parent-3', 'Ananya Mehta', 'ananya@gmail.com', '+91 98345 67890', parentPassHash, 'parent', now);

  // 3. Create Students
  const students = [
    { id: 'stud-1', parent_id: 'parent-1', name: 'Aarav Sharma', age: 8, grade: 'Grade 3', notes: 'Loves bright watercolors and animal sketches' },
    { id: 'stud-2', parent_id: 'parent-1', name: 'Riya Sharma', age: 11, grade: 'Grade 6', notes: 'Interested in acrylic landscape canvas painting' },
    { id: 'stud-3', parent_id: 'parent-2', name: 'Vivaan Verma', age: 7, grade: 'Grade 2', notes: 'Very keen on clay modeling and oil pastels' },
    { id: 'stud-4', parent_id: 'parent-3', name: 'Myra Mehta', age: 9, grade: 'Grade 4', notes: 'Strong fine motor skills, practicing portrait sketching' },
    { id: 'stud-5', parent_id: null, name: 'Kabir Patel', age: 10, grade: 'Grade 5', notes: 'Focuses on botanical illustration & shading' },
    { id: 'stud-6', parent_id: null, name: 'Tara Joshi', age: 6, grade: 'Grade 1', notes: 'Beginner color wheel & finger printing' },
  ];

  for (const s of students) {
    db.prepare(`
      INSERT INTO students (id, parent_id, name, age, grade, notes, status, joined_date)
      VALUES (?, ?, ?, ?, ?, ?, 'active', ?)
    `).run(s.id, s.parent_id, s.name, s.age, s.grade, s.notes, '2026-09-01');
  }

  // 4. Create Passes for Students
  const passes = [
    { id: 'pass-1', student_id: 'stud-1', pass_type: '8_weekend_pass', title: '8 Weekend Sessions Card', total: 8, used: 5, fee: 3200, paid: 3200, status: 'paid', method: 'UPI' },
    { id: 'pass-2', student_id: 'stud-2', pass_type: '8_weekend_pass', title: '8 Weekend Sessions Card', total: 8, used: 7, fee: 3200, paid: 3200, status: 'paid', method: 'UPI' }, // 1 left! Needs renewal
    { id: 'pass-3', student_id: 'stud-3', pass_type: '4_weekend_pass', title: '4 Weekend Sessions Pass', total: 4, used: 3, fee: 1800, paid: 1800, status: 'paid', method: 'Cash' },
    { id: 'pass-4', student_id: 'stud-4', pass_type: 'holiday_camp', title: 'Diwali Special Art Camp Pass', total: 5, used: 2, fee: 2500, paid: 1500, status: 'partial', method: 'UPI' },
    { id: 'pass-5', student_id: 'stud-5', pass_type: '4_weekend_pass', title: '4 Weekend Sessions Pass', total: 4, used: 1, fee: 1800, paid: 0, status: 'pending', method: null },
    { id: 'pass-6', student_id: 'stud-6', pass_type: 'single_trial', title: 'Weekend Trial Session', total: 1, used: 1, fee: 500, paid: 500, status: 'paid', method: 'Cash' },
  ];

  for (const p of passes) {
    db.prepare(`
      INSERT INTO session_passes (id, student_id, pass_type, title, total_credits, used_credits, fee_amount, amount_paid, payment_status, payment_method, purchased_at, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(p.id, p.student_id, p.pass_type, p.title, p.total, p.used, p.fee, p.paid, p.status, p.method, '2026-09-05', 'Active enrollment pass');
  }

  // 5. Create Weekend & Holiday Sessions
  const sessions = [
    { id: 'sess-1', title: 'Saturday Morning Creative Splash', type: 'weekend', date: '2026-09-20', start: '10:00 AM', end: '11:30 AM', status: 'completed' },
    { id: 'sess-2', title: 'Sunday Junior Watercolor & Blending', type: 'weekend', date: '2026-09-21', start: '10:00 AM', end: '11:30 AM', status: 'completed' },
    { id: 'sess-3', title: 'Saturday Textured Acrylic Canvas', type: 'weekend', date: '2026-09-27', start: '10:00 AM', end: '11:30 AM', status: 'completed' },
    { id: 'sess-4', title: 'Sunday Folk Art & Madhubani Motifs', type: 'weekend', date: '2026-09-28', start: '10:00 AM', end: '11:30 AM', status: 'completed' },
    { id: 'sess-5', title: 'Upcoming Saturday: Sunset Silhouette Drawing', type: 'weekend', date: '2026-10-03', start: '10:00 AM', end: '11:30 AM', status: 'upcoming' },
    { id: 'sess-6', title: 'Upcoming Sunday: Air-Dry Clay Animal Sculptures', type: 'weekend', date: '2026-10-04', start: '10:00 AM', end: '11:30 AM', status: 'upcoming' },
    { id: 'sess-7', title: 'Upcoming Holiday Masterclass: Palette Knife Art', type: 'holiday_camp', date: '2026-10-06', start: '03:00 PM', end: '05:00 PM', status: 'upcoming' },
  ];

  for (const s of sessions) {
    db.prepare(`
      INSERT INTO sessions (id, title, type, date, start_time, end_time, location, max_seats, age_group, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'Studio Workshop Room A', 12, '6 - 14 Years', ?, ?)
    `).run(s.id, s.title, s.type, s.date, s.start, s.end, s.status, now);
  }

  // 6. Record Past Attendance
  const pastAttendance = [
    { id: 'att-1', session_id: 'sess-1', student_id: 'stud-1', status: 'present', pass_id: 'pass-1' },
    { id: 'att-2', session_id: 'sess-1', student_id: 'stud-2', status: 'present', pass_id: 'pass-2' },
    { id: 'att-3', session_id: 'sess-1', student_id: 'stud-3', status: 'present', pass_id: 'pass-3' },
    { id: 'att-4', session_id: 'sess-2', student_id: 'stud-1', status: 'present', pass_id: 'pass-1' },
    { id: 'att-5', session_id: 'sess-2', student_id: 'stud-2', status: 'present', pass_id: 'pass-2' },
    { id: 'att-6', session_id: 'sess-2', student_id: 'stud-4', status: 'present', pass_id: 'pass-4' },
    { id: 'att-7', session_id: 'sess-3', student_id: 'stud-1', status: 'present', pass_id: 'pass-1' },
    { id: 'att-8', session_id: 'sess-3', student_id: 'stud-3', status: 'absent', pass_id: null },
    { id: 'att-9', session_id: 'sess-4', student_id: 'stud-2', status: 'present', pass_id: 'pass-2' },
    { id: 'att-10', session_id: 'sess-4', student_id: 'stud-4', status: 'present', pass_id: 'pass-4' },
  ];

  for (const a of pastAttendance) {
    db.prepare(`
      INSERT INTO attendance (id, session_id, student_id, status, pass_id, notes, recorded_at)
      VALUES (?, ?, ?, ?, ?, 'Marked during class', ?)
    `).run(a.id, a.session_id, a.student_id, a.status, a.pass_id, now);
  }

  // 7. Activity Posts (Daily Routine & Promotions)
  const posts = [
    {
      id: 'post-1',
      session_id: 'sess-2',
      title: 'Water-Blending & Galaxy Washes 🌌',
      medium: 'Watercolor',
      technique: 'Wet-on-wet wash & salt crystal granulation',
      description: 'Today our young artists explored watercolor gradients! We dropped coarse sea salt onto wet Prussian blue and magenta washes to create glowing cosmic textures.',
      materials: 'Camlin Artist Watercolors, 300 GSM Cold Press paper, Round brushes #4 & #8, Rock salt',
      images: JSON.stringify(['https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80']),
      is_public: 1
    },
    {
      id: 'post-2',
      session_id: 'sess-3',
      title: 'Bold Texture Acrylic Impasto & Flowers 🌻',
      medium: 'Acrylics',
      technique: 'Palette knife modeling paste blending',
      description: 'Sunday morning burst of colors! Students learned how to hold the palette knife to sculpt 3D sunflower petals directly onto canvas boards.',
      materials: 'Heavy body acrylic paints, Canvas boards 8x10, Palette knives, Sponge dabbers',
      images: JSON.stringify(['https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=800&auto=format&fit=crop&q=80']),
      is_public: 1
    },
    {
      id: 'post-3',
      session_id: 'sess-4',
      title: 'Traditional Folk Art: Madhubani Fish & Lotus 🐟',
      medium: 'Pen & Ink / Poster Color',
      technique: 'Fine nib hatching and symmetrical double borders',
      description: 'Diving into Indian folk heritage! Students learned the Kachni and Bharni styling of Mithila painting. Every child added intricate geometric fills inside fish motifs.',
      materials: 'Black waterproof archival pens (0.3mm & 0.5mm), Handmade ivory sheet, Bright poster colors',
      images: JSON.stringify(['https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&auto=format&fit=crop&q=80']),
      is_public: 1
    }
  ];

  for (const p of posts) {
    db.prepare(`
      INSERT INTO activity_posts (id, session_id, title, medium, technique, description, materials_used, images, is_public, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(p.id, p.session_id, p.title, p.medium, p.technique, p.description, p.materials, p.images, p.is_public, '2026-09-28T12:00:00Z');
  }

  // 8. Tag Students to Activity Posts for Parent Portals
  db.prepare(`
    INSERT INTO activity_student_tags (id, post_id, student_id, student_artwork_image, instructor_feedback)
    VALUES (?, ?, ?, ?, ?)
  `).run('tag-1', 'post-1', 'stud-1', 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600', 'Aarav did an exceptional job keeping his paper moist while sprinkling salt. His galaxy gradient is very vibrant!');

  db.prepare(`
    INSERT INTO activity_student_tags (id, post_id, student_id, student_artwork_image, instructor_feedback)
    VALUES (?, ?, ?, ?, ?)
  `).run('tag-2', 'post-1', 'stud-2', 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600', 'Riya added tiny white gouache splatter stars with a toothbrush! Super creative touch.');

  db.prepare(`
    INSERT INTO activity_student_tags (id, post_id, student_id, student_artwork_image, instructor_feedback)
    VALUES (?, ?, ?, ?, ?)
  `).run('tag-3', 'post-2', 'stud-3', 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=600', 'Vivaan loved using the palette knife. He was confident with thick paint strokes and chose gorgeous sunny yellow tones.');

  db.prepare(`
    INSERT INTO activity_student_tags (id, post_id, student_id, student_artwork_image, instructor_feedback)
    VALUES (?, ?, ?, ?, ?)
  `).run('tag-4', 'post-3', 'stud-4', 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600', 'Myra showed wonderful patience with her fine pen hatching. Her fish scales were very neat and disciplined.');

  // 9. Initial AI Suggestions for Next Weekend
  const suggestions = [
    {
      id: 'sug-1',
      title: 'Oil Pastel Sgraffito (Scratch Art Night Sky) 🌙',
      medium: 'Oil Pastels & Black Tempera',
      target_age: 'Ages 7 - 12',
      rationale: 'Since the last two sessions focused on fluid watercolor and thick acrylics, shifting to oil pastel sgraffito will develop tactile motor control without repeating techniques.',
      materials: JSON.stringify(['Heavy oil pastels (bright rainbow shades)', 'Black acrylic/tempera paint', 'Dish soap drop', 'Wooden stylus/toothpicks', 'Smooth cardstock']),
      steps: JSON.stringify([
        'Step 1: Color the entire sheet with rich, vibrant patches of oil pastels with zero white spots.',
        'Step 2: Paint a smooth layer of black paint mixed with 1 drop of liquid soap over the pastel.',
        'Step 3: Allow 10 minutes to dry completely.',
        'Step 4: Use wooden toothpicks or styluses to gently etch owl silhouettes, stars, and moon—revealing glowing neon pastel underneath!'
      ]),
      pitch: '✨ Magic Scratch Art Weekend! Watch your child unveil glowing night skies from pure black canvas. Limited 10 seats for this Saturday 10 AM batch!'
    },
    {
      id: 'sug-2',
      title: 'Clay Wildlife Relief Tiles (Mini Clay Plaques) 🦊',
      medium: 'Terracotta / Air-Dry Clay',
      target_age: 'Ages 6 - 14',
      rationale: 'Balancing 2D painting with 3D tactile sculpting. Air-dry clay relief satisfies both beginner sculpting and fine textural detailing.',
      materials: JSON.stringify(['White air-dry clay (200g per child)', 'Rolling pins & wooden slats', 'Clay modeling tools / popsicle sticks', 'Water bowl & sponge', 'Acrylic wash for painting once dry']),
      steps: JSON.stringify([
        'Step 1: Roll out a 1.5 cm thick clay slab tile.',
        'Step 2: Sketch a woodland animal outline with a toothpick.',
        'Step 3: Add 3D clay coils and pinch balls to give snout, ears, and fur texture.',
        'Step 4: Smooth edges with wet sponge and stamp child initial at the corner.'
      ]),
      pitch: '🐾 Bring animals to life with your hands! Sunday Clay Sculpture Workshop. All art clay & tools provided at the studio.'
    }
  ];

  for (const s of suggestions) {
    db.prepare(`
      INSERT INTO ai_suggestions (id, title, medium, target_age, rationale, materials_needed, step_by_step, promotional_pitch, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'suggested', ?)
    `).run(s.id, s.title, s.medium, s.target_age, s.rationale, s.materials, s.steps, s.pitch, now);
  }

  // 10. Sample Enrollment Inquiries
  db.prepare(`
    INSERT INTO enrollment_inquiries (id, parent_name, child_name, child_age, phone, email, interest, message, status, submitted_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
  `).run('inq-1', 'Kavita Sengupta', 'Ishaan Sengupta', 7, '+91 99887 76655', 'kavita@yahoo.com', 'Weekend Classes', 'Looking for Saturday morning classes to develop handwriting and drawing confidence.', now);

  db.prepare(`
    INSERT INTO enrollment_inquiries (id, parent_name, child_name, child_age, phone, email, interest, message, status, submitted_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'approved', ?)
  `).run('inq-2', 'Manish Kapoor', 'Sia Kapoor', 10, '+91 91234 56780', 'manish@gmail.com', 'Holiday Camp', 'Interested in the upcoming Diwali vacation art workshop.', now);

  console.log('✅ Initial database seed completed successfully!');
}

initDatabase();

module.exports = db;
