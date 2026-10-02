# 🎨 KalaKriti Weekend & Holiday Art Studio Platform
### End-to-End Studio Management, Attendance, Session Passes & Social Promotion

This platform was custom-built for an art instructor and studio owner to effortlessly manage weekend and holiday art classes, track flexible attendance and session passes, inspire upcoming curriculum using an AI suggestion engine, and provide parents with a personal portal to view their child's day-to-day creative portfolio.

---

## 🚀 Quick Start Instructions

The application is completely self-contained with a built-in SQLite database and pre-seeded sample data.

### 1. Start the Application
To run both backend and frontend together:
```bash
npm run dev
```

Or run the production server directly:
```bash
node server/server.js
```
Open **[http://localhost:5000](http://localhost:5000)** in your browser (or `http://localhost:5173` in development mode).

---

## 🔑 Demo Access & Roles

The top navbar includes a **Quick Switcher** to instantly toggle between views:

| Role | Email / Login | Purpose |
| :--- | :--- | :--- |
| **👩‍🎨 Madam (Studio Admin)** | `admin@artclasses.com` (pw: `admin123`) | Complete studio dashboard, attendance roll-call, pass ledger, routine photo publisher & AI suggestion studio |
| **👨‍👩‍👧 Priya Sharma (Parent)** | `priya@gmail.com` (pw: `parent123`) | Dedicated parent space to trace children's artworks, attendance, and pass credits |
| **🌐 Public Visitor** | *No login needed* | Showcase gallery, live classroom stream, workshop timetable, and admission booking form |

---

## 🌟 Key Features Built

### 1. 📅 Flexible Weekend & Holiday Session Passes
- No rigid monthly subscription lock-in! Built for Saturday/Sunday batches, holiday camps, and trial classes.
- **Session Passes**: 4-Weekend Pass (₹1,800), 8-Weekend Pass (₹3,200), Holiday Camps (₹2,500), and Trial Sessions (₹500).
- Automatic credit deduction: Marking a student **Present** automatically deducts 1 pass credit.
- Renewal alerts when $\le 1$ credit remains.

### 2. 🤖 AI Activity & Curriculum Suggestion Studio
- **Curriculum Intelligence**: Learns from Madam’s historical classes to prevent repeating mediums (e.g., switches smoothly between Watercolors, Acrylics, Indian Folk Art like Madhubani/Warli, Clay Sculpting, and Scratch Art).
- Generates:
  - Pedagogical Rationale
  - Materials & Supplies Checklist
  - Step-by-Step Lesson Instructions
  - Ready-to-Send Promotional Pitch for Parents
- **1-Click Scheduling**: Madam can click *"Accept & Schedule for Next Weekend"* to instantly create the next class!

### 3. 📸 Daily Routine & Class Logger (Promotion Engine)
- Madam logs classroom moments: photos, mediums, techniques learned, and student artwork tags.
- Appears on the **Public Showcase** to attract new admissions.
- Appears on the **Parent Portal** with personalized instructor feedback notes.
- **1-Click WhatsApp Promo Generator**: Automatically copies polished marketing text with emojis ready for WhatsApp Status or Instagram.

### 4. 👨‍👩‍👧 Dedicated Parent & Child Portal
- Separate, intuitive interface for parents.
- **Child Portfolio Timeline**: Parents can pull up each class to see the exact artwork their child created, plus Madam's encouraging feedback note.
- **Pass Balance & Fee Transparency**: Visual progress ring showing remaining sessions and fee receipts.
- **"Proud Parent" Share Button**: Generates a shareable milestone card for parents to post on WhatsApp Status, giving the studio viral organic word-of-mouth promotion!

### 5. 📝 Public Admissions & Inquiries Queue
- Web visitors can book trial classes or request weekend enrollments directly from the landing page.
- Incoming applications land in Madam's **Admissions Queue**, where she can approve and admit new students with a single click.

---

## 🛠️ Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide React, Canvas Confetti
- **Backend**: Node.js, Express, Better-SQLite3, Multer, JWT, Bcrypt
- **Storage**: Local SQLite (`server/data/art_studio.db`) with zero external database dependencies.
