const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

// Set up image uploads directory
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, 'art-' + Date.now() + '-' + Math.round(Math.random() * 1E9) + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'), false);
  }
});

// Image upload endpoint
router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

// Get all activity posts
router.get('/', (req, res) => {
  const isPublicOnly = req.query.public === '1';
  let query = 'SELECT p.*, s.title as session_title, s.date as session_date FROM activity_posts p LEFT JOIN sessions s ON p.session_id = s.id';
  if (isPublicOnly) {
    query += ' WHERE p.is_public = 1';
  }
  query += ' ORDER BY p.created_at DESC';

  const posts = db.prepare(query).all();
  const allTags = db.prepare(`
    SELECT t.*, s.name as student_name, s.age as student_age
    FROM activity_student_tags t
    JOIN students s ON t.student_id = s.id
  `).all();

  const enriched = posts.map(p => {
    const tags = allTags.filter(t => t.post_id === p.id);
    return {
      ...p,
      images: JSON.parse(p.images || '[]'),
      tagged_students: tags
    };
  });

  res.json(enriched);
});

// Create new activity post (Madam posting classroom routine)
router.post('/', (req, res) => {
  const { session_id, title, medium, technique, description, materials_used, images, is_public, student_tags } = req.body;
  if (!title || !medium || !description) {
    return res.status(400).json({ error: 'Title, medium, and description are required' });
  }

  const id = 'post-' + uuidv4().substring(0, 8);
  const now = new Date().toISOString();
  const imagesJson = JSON.stringify(images || []);

  db.transaction(() => {
    db.prepare(`
      INSERT INTO activity_posts (id, session_id, title, medium, technique, description, materials_used, images, is_public, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      session_id || null,
      title,
      medium,
      technique || '',
      description,
      materials_used || '',
      imagesJson,
      is_public !== undefined ? (is_public ? 1 : 0) : 1,
      now
    );

    // If specific students are tagged with feedback or individual artwork
    if (Array.isArray(student_tags)) {
      for (const tag of student_tags) {
        if (tag.student_id) {
          const tagId = 'tag-' + uuidv4().substring(0, 8);
          db.prepare(`
            INSERT INTO activity_student_tags (id, post_id, student_id, student_artwork_image, instructor_feedback)
            VALUES (?, ?, ?, ?, ?)
          `).run(
            tagId,
            id,
            tag.student_id,
            tag.student_artwork_image || (images && images[0]) || null,
            tag.instructor_feedback || 'Completed today\'s project with great creativity!'
          );
        }
      }
    }
  })();

  res.status(201).json({ id, message: 'Activity post published successfully!' });
});

// Get activities for a specific parent (where their children are enrolled or tagged)
router.get('/parent/:parentId', (req, res) => {
  const { parentId } = req.params;

  // Get parent's children
  const children = db.prepare('SELECT id, name FROM students WHERE parent_id = ?').all(parentId);
  const childIds = children.map(c => c.id);

  if (childIds.length === 0) {
    // If no children linked yet, return public activities
    const publicPosts = db.prepare(`
      SELECT p.*, s.title as session_title, s.date as session_date 
      FROM activity_posts p 
      LEFT JOIN sessions s ON p.session_id = s.id 
      WHERE p.is_public = 1 
      ORDER BY p.created_at DESC
    `).all();

    return res.json(publicPosts.map(p => ({
      ...p,
      images: JSON.parse(p.images || '[]'),
      tagged_students: []
    })));
  }

  // Find posts where any child is tagged OR general public posts
  const placeholders = childIds.map(() => '?').join(',');
  const taggedPostIds = db.prepare(`
    SELECT DISTINCT post_id FROM activity_student_tags WHERE student_id IN (${placeholders})
  `).all(...childIds).map(r => r.post_id);

  const posts = db.prepare(`
    SELECT p.*, s.title as session_title, s.date as session_date 
    FROM activity_posts p 
    LEFT JOIN sessions s ON p.session_id = s.id 
    ORDER BY p.created_at DESC
  `).all();

  const allTags = db.prepare(`
    SELECT t.*, s.name as student_name, s.age as student_age
    FROM activity_student_tags t
    JOIN students s ON t.student_id = s.id
    WHERE t.student_id IN (${placeholders})
  `).all(...childIds);

  const enriched = posts.map(p => {
    const childTags = allTags.filter(t => t.post_id === p.id);
    return {
      ...p,
      images: JSON.parse(p.images || '[]'),
      tagged_students: childTags,
      is_child_tagged: childTags.length > 0
    };
  });

  res.json(enriched);
});

// Generate promotional share text for social media / WhatsApp
router.get('/:id/promo-share', (req, res) => {
  const post = db.prepare('SELECT * FROM activity_posts WHERE id = ?').get(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });

  const promoText = `🎨 *Today at Chirasha Art Gallery!* 🖌️✨\n\n${post.title}\n\n*Medium:* ${post.medium}\n*Technique Learned:* ${post.technique || 'Creative expression'}\n\n"${post.description}"\n\n📌 *Weekend & Holiday Art Classes Open for Admissions!*\nGive your child the gift of creativity, focus, and joy.\n\n📞 Enquire/Enroll today: +91 98765 43210\n📍 Chirasha Art Gallery, Creative Studio Floor`;

  res.json({
    title: post.title,
    promoText,
    whatsappUrl: `https://wa.me/?text=${encodeURIComponent(promoText)}`
  });
});

module.exports = router;
