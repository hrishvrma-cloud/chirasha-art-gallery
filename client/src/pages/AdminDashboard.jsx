import React, { useState, useEffect } from 'react';
import {
  Users, Calendar, CreditCard, Sparkles, Plus, CheckCircle, Clock,
  AlertTriangle, MessageCircle, Share2, Upload, FileText, ChevronRight,
  TrendingUp, Check, X, Shield, RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import ShareModal from '../components/ShareModal';

export default function AdminDashboard() {
  const [activeSubTab, setActiveSubTab] = useState('routine'); // 'routine', 'ai', 'sessions', 'passes', 'students'
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [passes, setPasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [sessionRoster, setSessionRoster] = useState([]);
  const [shareData, setShareData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newPost, setNewPost] = useState({
    title: '',
    medium: 'Watercolor',
    technique: '',
    description: '',
    materials_used: '',
    image_url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800',
    is_public: true,
    tagged_student_id: '',
    student_feedback: ''
  });

  const [newSession, setNewSession] = useState({
    title: '',
    type: 'weekend',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    start_time: '10:00 AM',
    end_time: '11:30 AM',
    max_seats: 12,
    age_group: '6 - 14 Years'
  });

  const [newPass, setNewPass] = useState({
    student_id: '',
    pass_type: '8_weekend_pass',
    title: '8 Weekend Sessions Card',
    total_credits: 8,
    fee_amount: 3200,
    payment_status: 'paid',
    payment_method: 'UPI',
    notes: 'Renewed for weekend series'
  });

  const [aiGenerating, setAiGenerating] = useState(false);
  const [customAiPrompt, setCustomAiPrompt] = useState('');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [statsRes, actRes, sessRes, passRes, studRes, inqRes, sugRes] = await Promise.all([
        fetch('/api/dashboard/stats').then(r => r.json()),
        fetch('/api/activities').then(r => r.json()),
        fetch('/api/sessions').then(r => r.json()),
        fetch('/api/passes').then(r => r.json()),
        fetch('/api/students').then(r => r.json()),
        fetch('/api/enrollments').then(r => r.json()),
        fetch('/api/suggestions').then(r => r.json()),
      ]);

      setStats(statsRes);
      setActivities(actRes || []);
      setSessions(sessRes || []);
      setPasses(passRes || []);
      setStudents(studRes || []);
      setInquiries(inqRes || []);
      setSuggestions(sugRes || []);

      if (sessRes && sessRes.length > 0 && !selectedSessionId) {
        setSelectedSessionId(sessRes[0].id);
        loadSessionRoster(sessRes[0].id);
      }
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSessionRoster = async (sessId) => {
    try {
      const res = await fetch(`/api/sessions/${sessId}`);
      const data = await res.json();
      setSessionRoster(data.roster || []);
    } catch (err) {
      console.error('Error fetching roster:', err);
    }
  };

  // 1-Tap Attendance Marking
  const handleMarkAttendance = async (studentId, status) => {
    if (!selectedSessionId) return;
    try {
      const res = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: selectedSessionId,
          student_id: studentId,
          status
        })
      });

      if (res.ok) {
        // Refresh session roster & passes
        loadSessionRoster(selectedSessionId);
        const passRes = await fetch('/api/passes').then(r => r.json());
        setPasses(passRes || []);
        const statsRes = await fetch('/api/dashboard/stats').then(r => r.json());
        setStats(statsRes);
      }
    } catch (err) {
      console.error('Error marking attendance:', err);
    }
  };

  // Post Routine & Class Highlight
  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      const tags = [];
      if (newPost.tagged_student_id) {
        tags.push({
          student_id: newPost.tagged_student_id,
          student_artwork_image: newPost.image_url,
          instructor_feedback: newPost.student_feedback || 'Created wonderful art today!'
        });
      }

      const res = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newPost.title,
          medium: newPost.medium,
          technique: newPost.technique,
          description: newPost.description,
          materials_used: newPost.materials_used,
          images: [newPost.image_url],
          is_public: newPost.is_public ? 1 : 0,
          student_tags: tags
        })
      });

      if (res.ok) {
        confetti({ particleCount: 50, spread: 50 });
        setNewPost({
          title: '',
          medium: 'Watercolor',
          technique: '',
          description: '',
          materials_used: '',
          image_url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800',
          is_public: true,
          tagged_student_id: '',
          student_feedback: ''
        });
        loadAllData();
      }
    } catch (err) {
      console.error('Error creating activity post:', err);
    }
  };

  // Schedule Session
  const handleCreateSession = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSession)
      });
      if (res.ok) {
        confetti({ particleCount: 40 });
        setNewSession({
          title: '',
          type: 'weekend',
          date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          start_time: '10:00 AM',
          end_time: '11:30 AM',
          max_seats: 12,
          age_group: '6 - 14 Years'
        });
        loadAllData();
      }
    } catch (err) {
      console.error('Error creating session:', err);
    }
  };

  // Issue Pass
  const handleIssuePass = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/passes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPass)
      });
      if (res.ok) {
        confetti({ particleCount: 60 });
        loadAllData();
      }
    } catch (err) {
      console.error('Error issuing pass:', err);
    }
  };

  // AI Activity Suggestion
  const handleGenerateAI = async () => {
    setAiGenerating(true);
    try {
      const res = await fetch('/api/suggestions/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ custom_topic: customAiPrompt || null })
      });
      if (res.ok) {
        const fresh = await fetch('/api/suggestions').then(r => r.json());
        setSuggestions(fresh || []);
        confetti({ particleCount: 70, spread: 70 });
      }
    } catch (err) {
      console.error('Error generating AI suggestions:', err);
    } finally {
      setAiGenerating(false);
    }
  };

  // Accept AI Suggestion into Upcoming Schedule
  const handleAcceptSuggestion = async (sugId) => {
    try {
      const res = await fetch(`/api/suggestions/${sugId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ time_slot: '10:00 AM - 11:30 AM' })
      });
      if (res.ok) {
        confetti({ particleCount: 60 });
        loadAllData();
        setActiveSubTab('sessions');
      }
    } catch (err) {
      console.error('Error accepting suggestion:', err);
    }
  };

  // WhatsApp Reminder Generator
  const handleOpenWhatsAppReminder = async (passId) => {
    try {
      const res = await fetch(`/api/passes/${passId}/whatsapp-reminder`);
      const data = await res.json();
      setShareData(data);
    } catch (err) {
      console.error('Error generating reminder:', err);
    }
  };

  // Approve Inquiry to Student
  const handleApproveInquiry = async (inqId) => {
    try {
      const res = await fetch(`/api/enrollments/${inqId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved', convert_to_student: true })
      });
      if (res.ok) {
        confetti({ particleCount: 50 });
        loadAllData();
      }
    } catch (err) {
      console.error('Error approving inquiry:', err);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Studio Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-linear-to-r from-indigo-950 via-slate-900 to-stone-900 text-white p-6 sm:p-8 rounded-3xl shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <Shield className="w-3.5 h-3.5" />
            Chirasha Art Gallery • Studio Admin Hub
          </div>
          <h1 className="font-display text-2xl sm:text-4xl font-bold text-white tracking-tight">
            Studio Management & Growth Center
          </h1>
          <p className="text-stone-400 text-xs sm:text-sm mt-1">
            Monitor attendance, session credits, daily routine promotion & AI curriculum suggestions.
          </p>
        </div>

        <button
          onClick={loadAllData}
          className="self-start sm:self-center px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white flex items-center gap-2 transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Stats
        </button>
      </div>

      {/* Quick Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wide">Active Students</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="font-display text-2xl font-bold text-stone-900">{stats?.activeStudents || 0}</div>
          <div className="text-[11px] text-stone-400 mt-1">Enrolled across batches</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wide">Upcoming Classes</span>
            <Calendar className="w-4 h-4 text-amber-600" />
          </div>
          <div className="font-display text-2xl font-bold text-stone-900">{stats?.upcomingSessions || 0}</div>
          <div className="text-[11px] text-stone-400 mt-1">Weekend & holiday slots</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wide">Pass Renewals Due</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="font-display text-2xl font-bold text-rose-600">
            {stats?.lowCreditPasses?.length || 0}
          </div>
          <div className="text-[11px] text-rose-500/80 mt-1">Students with ≤1 credit left</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wide">Pending Fees</span>
            <CreditCard className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-display text-2xl font-bold text-stone-900">₹{stats?.pendingFee || 0}</div>
          <div className="text-[11px] text-stone-400 mt-1">₹{stats?.totalRevenue || 0} collected so far</div>
        </div>
      </div>

      {/* Admin Navigation Sub-tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-stone-200 text-sm font-medium">
        <button
          onClick={() => setActiveSubTab('routine')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'routine'
              ? 'bg-stone-900 text-white font-bold shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Upload className="w-4 h-4 text-amber-400" />
          📸 Daily Routine & Highlights
        </button>

        <button
          onClick={() => setActiveSubTab('ai')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'ai'
              ? 'bg-stone-900 text-white font-bold shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Sparkles className="w-4 h-4 text-rose-400" />
          🤖 AI Suggestion Studio
        </button>

        <button
          onClick={() => setActiveSubTab('sessions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'sessions'
              ? 'bg-stone-900 text-white font-bold shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Calendar className="w-4 h-4 text-indigo-400" />
          📅 Weekend Sessions & Attendance
        </button>

        <button
          onClick={() => setActiveSubTab('passes')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'passes'
              ? 'bg-stone-900 text-white font-bold shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <CreditCard className="w-4 h-4 text-emerald-400" />
          💳 Passes & Fee Ledger
        </button>

        <button
          onClick={() => setActiveSubTab('students')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'students'
              ? 'bg-stone-900 text-white font-bold shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Users className="w-4 h-4 text-sky-400" />
          👥 Students & Admissions ({inquiries.filter(i => i.status === 'pending').length} new)
        </button>
      </div>

      {/* =================== TAB 1: DAILY ROUTINE LOGGER & PROMOTIONS =================== */}
      {activeSubTab === 'routine' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Post Form */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-3xl border border-stone-200 shadow-2xs space-y-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold uppercase mb-2">
                <Upload className="w-3.5 h-3.5" />
                Post Today's Activity
              </div>
              <h2 className="font-display text-xl font-bold text-stone-900">
                Log Class Routine & Highlights
              </h2>
              <p className="text-xs text-stone-500">
                Instantly visible to parents in their Child Portal and featured on the public website for promotions.
              </p>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Activity Title *</label>
                <input
                  type="text"
                  required
                  value={newPost.title}
                  onChange={e => setNewPost({ ...newPost, title: e.target.value })}
                  placeholder="e.g. Sunset Silhouette & Oil Pastel Blending"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Art Medium *</label>
                  <select
                    value={newPost.medium}
                    onChange={e => setNewPost({ ...newPost, medium: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white"
                  >
                    <option value="Watercolor">Watercolor</option>
                    <option value="Acrylics">Acrylics on Canvas</option>
                    <option value="Oil Pastels">Oil Pastels / Sgraffito</option>
                    <option value="Folk Art">Madhubani / Warli Folk Art</option>
                    <option value="Air-Dry Clay">Air-Dry Clay Sculpting</option>
                    <option value="Sketching">Charcoal / Pencil Shading</option>
                    <option value="Craft">Mixed Media & Craft</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Technique Taught</label>
                  <input
                    type="text"
                    value={newPost.technique}
                    onChange={e => setNewPost({ ...newPost, technique: e.target.value })}
                    placeholder="e.g. Wet-on-wet wash"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Description & Class Summary *</label>
                <textarea
                  rows="3"
                  required
                  value={newPost.description}
                  onChange={e => setNewPost({ ...newPost, description: e.target.value })}
                  placeholder="What did the students do today? How did they approach colors and techniques?"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs"
                ></textarea>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Materials / Supplies Used</label>
                <input
                  type="text"
                  value={newPost.materials_used}
                  onChange={e => setNewPost({ ...newPost, materials_used: e.target.value })}
                  placeholder="e.g. 300 GSM Cold Press paper, Round brushes #6, Camlin watercolors"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Photo URL (Class Artwork) *</label>
                <input
                  type="url"
                  required
                  value={newPost.image_url}
                  onChange={e => setNewPost({ ...newPost, image_url: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs"
                />
              </div>

              {/* Tag Student Section for Parent Portal Feed */}
              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/70 space-y-2">
                <span className="font-bold text-amber-900 block text-[11px] uppercase tracking-wider">
                  👨‍👩‍👧 Tag Student for Parent's Personal Feed:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    value={newPost.tagged_student_id}
                    onChange={e => setNewPost({ ...newPost, tagged_student_id: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-amber-300 bg-white text-xs"
                  >
                    <option value="">-- Optional: Tag Student --</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.age}y)</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={newPost.student_feedback}
                    onChange={e => setNewPost({ ...newPost, student_feedback: e.target.value })}
                    placeholder="Instructor feedback for parent..."
                    className="w-full px-2.5 py-1.5 rounded-lg border border-amber-300 bg-white text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="is_public"
                  checked={newPost.is_public}
                  onChange={e => setNewPost({ ...newPost, is_public: e.target.checked })}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="is_public" className="font-semibold text-stone-700 text-xs cursor-pointer">
                  Feature in Public Showcase (For Website Admissions & Promotions)
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                Publish Class Routine & Photos
              </button>
            </form>
          </div>

          {/* Published Routine List */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-stone-900">
                Published Classroom Feed ({activities.length})
              </h2>
              <span className="text-xs text-stone-400">Chronological Routine Stream</span>
            </div>

            <div className="space-y-4">
              {activities.map(act => (
                <div key={act.id} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs flex flex-col sm:flex-row gap-4">
                  <img
                    src={act.images && act.images.length > 0 ? act.images[0] : 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=400'}
                    alt={act.title}
                    className="w-full sm:w-36 h-28 object-cover rounded-xl bg-stone-100 shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">{act.medium}</span>
                        <span className="text-[11px] text-stone-400">
                          {new Date(act.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <h3 className="font-bold text-stone-900 text-sm mb-1">{act.title}</h3>
                      <p className="text-stone-600 text-xs line-clamp-2 leading-relaxed mb-2">{act.description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                      <span className="text-[11px] text-stone-400">
                        {act.tagged_students && act.tagged_students.length > 0 ? (
                          <span className="text-indigo-600 font-medium">Tagged: {act.tagged_students.map(t => t.student_name).join(', ')}</span>
                        ) : 'General Routine'}
                      </span>

                      <button
                        onClick={async () => {
                          const res = await fetch(`/api/activities/${act.id}/promo-share`);
                          const data = await res.json();
                          setShareData(data);
                        }}
                        className="px-3 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        Copy WhatsApp Promo
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =================== TAB 2: AI ACTIVITY SUGGESTION STUDIO =================== */}
      {activeSubTab === 'ai' && (
        <div className="space-y-6">
          {/* AI Banner & Generator */}
          <div className="bg-linear-to-r from-purple-900 via-indigo-900 to-stone-900 text-white p-7 sm:p-9 rounded-3xl shadow-sm space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-purple-200 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-purple-300" />
              Pedagogical Curriculum Assistant
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
              AI Activity & Curriculum Suggestion Studio
            </h2>
            <p className="text-stone-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              This engine analyzes past class activity history (preventing repetition of mediums), identifies skill gaps, and recommends creative, age-appropriate projects for next weekend with complete lesson plans, material checklists, and parent promotional pitches.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2 max-w-2xl">
              <input
                type="text"
                value={customAiPrompt}
                onChange={e => setCustomAiPrompt(e.target.value)}
                placeholder="Optional: Specify medium or seasonal theme (e.g. Clay craft, Diwali diya, Charcoal)..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/10 text-white placeholder-stone-400 border border-white/20 text-xs focus:outline-hidden focus:ring-2 focus:ring-purple-400"
              />
              <button
                onClick={handleGenerateAI}
                disabled={aiGenerating}
                className="px-6 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs shadow-md shadow-purple-900 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <Sparkles className="w-4 h-4" />
                {aiGenerating ? 'Analyzing Classes & Brainstorming...' : 'Suggest Next Activity'}
              </button>
            </div>
          </div>

          {/* Suggestions List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {suggestions.map(sug => (
              <div
                key={sug.id}
                className="bg-white rounded-3xl border border-stone-200/90 p-6 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-5"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-100 text-purple-800 uppercase tracking-wider">
                      {sug.medium}
                    </span>
                    <span className="text-xs text-stone-500 font-medium">Target: {sug.target_age}</span>
                  </div>

                  <h3 className="font-display text-xl font-bold text-stone-900 leading-snug">
                    {sug.title}
                  </h3>

                  {/* Pedagogical Rationale */}
                  <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/70 text-xs text-stone-600 leading-relaxed">
                    <strong className="text-stone-900 block mb-1">🧠 Pedagogical Rationale:</strong>
                    {sug.rationale}
                  </div>

                  {/* Materials Needed */}
                  <div>
                    <h4 className="text-xs font-bold text-stone-900 mb-2 uppercase tracking-wide">📦 Materials Checklist:</h4>
                    <ul className="text-xs text-stone-600 space-y-1 pl-4 list-disc">
                      {sug.materials_needed.map((mat, i) => (
                        <li key={i}>{mat}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Step by Step outline */}
                  <div>
                    <h4 className="text-xs font-bold text-stone-900 mb-2 uppercase tracking-wide">📋 Lesson Steps:</h4>
                    <ol className="text-xs text-stone-600 space-y-1.5 pl-4 list-decimal">
                      {sug.step_by_step.map((step, i) => (
                        <li key={i} className="leading-relaxed">{step}</li>
                      ))}
                    </ol>
                  </div>

                  {/* Promotional Pitch */}
                  <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900">
                    <strong className="text-emerald-950 block mb-1">📢 Ready-to-Send Promo Copy:</strong>
                    "{sug.promotional_pitch}"
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                  <span className={`text-xs font-semibold ${sug.status === 'accepted' ? 'text-emerald-600' : 'text-stone-400'}`}>
                    {sug.status === 'accepted' ? '✓ Scheduled for Class' : 'Status: Ready'}
                  </span>

                  {sug.status !== 'accepted' ? (
                    <button
                      onClick={() => handleAcceptSuggestion(sug.id)}
                      className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      Accept & Schedule for Next Weekend
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                      Added to Upcoming Sessions
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =================== TAB 3: SESSIONS & ATTENDANCE =================== */}
      {activeSubTab === 'sessions' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Sessions List & Scheduler */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
              <h3 className="font-bold text-stone-900 text-sm">Schedule Weekend Class</h3>
              <form onSubmit={handleCreateSession} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-stone-600 mb-1">Session Title</label>
                  <input
                    type="text"
                    required
                    value={newSession.title}
                    onChange={e => setNewSession({ ...newSession, title: e.target.value })}
                    placeholder="e.g. Saturday Cartooning & Shading"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-stone-600 mb-1">Type</label>
                    <select
                      value={newSession.type}
                      onChange={e => setNewSession({ ...newSession, type: e.target.value })}
                      className="w-full px-2.5 py-2 rounded-xl border border-stone-200 bg-white"
                    >
                      <option value="weekend">Weekend Batch</option>
                      <option value="holiday_camp">Holiday Camp</option>
                      <option value="workshop">Workshop</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-600 mb-1">Date</label>
                    <input
                      type="date"
                      required
                      value={newSession.date}
                      onChange={e => setNewSession({ ...newSession, date: e.target.value })}
                      className="w-full px-2.5 py-2 rounded-xl border border-stone-200"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-stone-600 mb-1">Start Time</label>
                    <input
                      type="text"
                      value={newSession.start_time}
                      onChange={e => setNewSession({ ...newSession, start_time: e.target.value })}
                      className="w-full px-2.5 py-2 rounded-xl border border-stone-200"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-600 mb-1">End Time</label>
                    <input
                      type="text"
                      value={newSession.end_time}
                      onChange={e => setNewSession({ ...newSession, end_time: e.target.value })}
                      className="w-full px-2.5 py-2 rounded-xl border border-stone-200"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold transition-colors cursor-pointer"
                >
                  Create Class Slot
                </button>
              </form>
            </div>

            {/* Session Selector */}
            <div className="space-y-2">
              <h3 className="font-bold text-stone-900 text-xs uppercase tracking-wider">Select Class to Take Attendance:</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {sessions.map(s => (
                  <div
                    key={s.id}
                    onClick={() => {
                      setSelectedSessionId(s.id);
                      loadSessionRoster(s.id);
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      selectedSessionId === s.id
                        ? 'bg-indigo-50 border-indigo-400 shadow-2xs ring-1 ring-indigo-300'
                        : 'bg-white border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold mb-1">
                      <span className="text-stone-900 truncate">{s.title}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${s.status === 'upcoming' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                        {s.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-stone-500">
                      <span>{s.date} • {s.start_time}</span>
                      <span className="font-semibold text-indigo-700">{s.attended_count || 0} Attended</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: 1-Tap Attendance Roll Call Register */}
          <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">Live Roll Call Register</span>
                <h2 className="font-display text-xl font-bold text-stone-900">
                  {sessions.find(s => s.id === selectedSessionId)?.title || 'Selected Class'}
                </h2>
                <p className="text-xs text-stone-500">
                  Marking <strong>Present</strong> automatically deducts 1 pass credit and updates parent records.
                </p>
              </div>

              <div className="text-xs bg-indigo-50 border border-indigo-200 px-3.5 py-2 rounded-xl text-indigo-900">
                <strong>{sessionRoster.filter(r => r.attendance_status === 'present').length}</strong> of {sessionRoster.length} students marked present
              </div>
            </div>

            {/* Student Roster Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-400 uppercase text-[11px] font-semibold">
                    <th className="py-2.5 px-3">Student</th>
                    <th className="py-2.5 px-3">Active Pass / Remaining Credits</th>
                    <th className="py-2.5 px-3">Parent Contact</th>
                    <th className="py-2.5 px-3 text-right">Attendance Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {sessionRoster.map(s => {
                    const remaining = s.total_credits ? Math.max(0, s.total_credits - s.used_credits) : 0;
                    return (
                      <tr key={s.id} className="hover:bg-stone-50/70 transition-colors">
                        <td className="py-3 px-3 font-semibold text-stone-900">
                          <div>{s.name}</div>
                          <div className="text-[11px] text-stone-400 font-normal">Age {s.age} • {s.grade}</div>
                        </td>

                        <td className="py-3 px-3">
                          {s.pass_title ? (
                            <div>
                              <div className="font-medium text-stone-800">{s.pass_title}</div>
                              <div className={`text-[11px] font-bold ${remaining <= 1 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                {remaining} credits remaining ({s.used_credits}/{s.total_credits} used)
                              </div>
                            </div>
                          ) : (
                            <span className="text-amber-700 font-medium text-[11px]">No active pass</span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-stone-500">
                          <div>{s.parent_name || 'Direct'}</div>
                          <div className="text-[11px] font-mono">{s.parent_phone}</div>
                        </td>

                        <td className="py-3 px-3 text-right">
                          <div className="inline-flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl">
                            <button
                              onClick={() => handleMarkAttendance(s.id, 'present')}
                              className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                                s.attendance_status === 'present'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'text-stone-600 hover:text-emerald-700'
                              }`}
                            >
                              Present
                            </button>

                            <button
                              onClick={() => handleMarkAttendance(s.id, 'absent')}
                              className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                                s.attendance_status === 'absent'
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : 'text-stone-600 hover:text-rose-700'
                              }`}
                            >
                              Absent
                            </button>

                            <button
                              onClick={() => handleMarkAttendance(s.id, 'excused')}
                              className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                                s.attendance_status === 'excused'
                                  ? 'bg-amber-500 text-white shadow-xs'
                                  : 'text-stone-600 hover:text-amber-700'
                              }`}
                            >
                              Excused
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =================== TAB 4: PASSES & FEES =================== */}
      {activeSubTab === 'passes' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Issue Pass Form */}
            <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs space-y-4">
              <h3 className="font-display text-lg font-bold text-stone-900">Issue New Session Pass</h3>
              <p className="text-xs text-stone-500">Add 4 or 8 weekend credits, or a holiday camp pass for a student.</p>

              <form onSubmit={handleIssuePass} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Select Student *</label>
                  <select
                    required
                    value={newPass.student_id}
                    onChange={e => setNewPass({ ...newPass, student_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white"
                  >
                    <option value="">-- Choose Student --</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.age}y)</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Pass Package *</label>
                  <select
                    value={newPass.pass_type}
                    onChange={e => {
                      const type = e.target.value;
                      if (type === '8_weekend_pass') {
                        setNewPass({ ...newPass, pass_type: type, title: '8 Weekend Sessions Card', total_credits: 8, fee_amount: 3200 });
                      } else if (type === '4_weekend_pass') {
                        setNewPass({ ...newPass, pass_type: type, title: '4 Weekend Sessions Pass', total_credits: 4, fee_amount: 1800 });
                      } else if (type === 'holiday_camp') {
                        setNewPass({ ...newPass, pass_type: type, title: 'Holiday Intensive Camp', total_credits: 5, fee_amount: 2500 });
                      } else {
                        setNewPass({ ...newPass, pass_type: type, title: 'Trial Session', total_credits: 1, fee_amount: 500 });
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white"
                  >
                    <option value="8_weekend_pass">8 Weekend Sessions Card (₹3,200)</option>
                    <option value="4_weekend_pass">4 Weekend Sessions Pass (₹1,800)</option>
                    <option value="holiday_camp">Holiday Intensive Camp - 5 Days (₹2,500)</option>
                    <option value="single_trial">Single Weekend Trial Session (₹500)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Fee Amount (₹)</label>
                    <input
                      type="number"
                      value={newPass.fee_amount}
                      onChange={e => setNewPass({ ...newPass, fee_amount: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Payment Status</label>
                    <select
                      value={newPass.payment_status}
                      onChange={e => setNewPass({ ...newPass, payment_status: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white"
                    >
                      <option value="paid">Paid</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Payment Method</label>
                  <select
                    value={newPass.payment_method}
                    onChange={e => setNewPass({ ...newPass, payment_method: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white"
                  >
                    <option value="UPI">UPI / GPay / PhonePe</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold transition-colors cursor-pointer"
                >
                  Issue Pass & Record Fee
                </button>
              </form>
            </div>

            {/* Passes Ledger */}
            <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-lg font-bold text-stone-900">Student Passes & Fee Register</h3>
                  <p className="text-xs text-stone-500">Track remaining credits, balances, and send WhatsApp reminders.</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-400 uppercase text-[11px] font-semibold">
                      <th className="py-2.5 px-3">Student & Pass</th>
                      <th className="py-2.5 px-3">Credit Balance</th>
                      <th className="py-2.5 px-3">Fee Status</th>
                      <th className="py-2.5 px-3 text-right">WhatsApp Reminder</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {passes.map(p => {
                      const remaining = p.remaining_credits;
                      const isLow = remaining <= 1;
                      const pendingFee = Math.max(0, p.fee_amount - p.amount_paid);

                      return (
                        <tr key={p.id} className="hover:bg-stone-50/70 transition-colors">
                          <td className="py-3 px-3">
                            <div className="font-bold text-stone-900">{p.student_name}</div>
                            <div className="text-[11px] text-stone-500">{p.title}</div>
                          </td>

                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <span className={`font-bold ${isLow ? 'text-rose-600' : 'text-emerald-600'}`}>
                                {remaining} left
                              </span>
                              <span className="text-[11px] text-stone-400">({p.used_credits}/{p.total_credits})</span>
                            </div>
                            {isLow && (
                              <span className="inline-block mt-0.5 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
                                Renewal Alert
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-3">
                            <div className="font-medium text-stone-800">₹{p.amount_paid} / ₹{p.fee_amount}</div>
                            {pendingFee > 0 ? (
                              <span className="text-[11px] font-bold text-amber-700">Due: ₹{pendingFee}</span>
                            ) : (
                              <span className="text-[11px] font-bold text-emerald-700">Fully Paid</span>
                            )}
                          </td>

                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => handleOpenWhatsAppReminder(p.id)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs flex items-center gap-1.5 ml-auto transition-colors cursor-pointer"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              Send WhatsApp Notice
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================== TAB 5: STUDENTS & ADMISSIONS =================== */}
      {activeSubTab === 'students' && (
        <div className="space-y-8">
          {/* Incoming Inquiries from Website */}
          <div className="bg-amber-50/60 border border-amber-200/80 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">Website Admissions Queue</span>
                <h3 className="font-display text-xl font-bold text-stone-900">
                  New Enrollment Requests from Parents ({inquiries.filter(i => i.status === 'pending').length} Pending)
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inquiries.map(inq => (
                <div key={inq.id} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                      {inq.interest}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${inq.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                      {inq.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-stone-900 text-sm">{inq.child_name} ({inq.child_age} yrs)</h4>
                    <p className="text-xs text-stone-500">Parent: {inq.parent_name}</p>
                    <p className="text-xs font-mono text-stone-600 mt-1">📞 {inq.phone}</p>
                  </div>

                  {inq.message && (
                    <p className="text-xs text-stone-500 italic bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                      "{inq.message}"
                    </p>
                  )}

                  {inq.status === 'pending' && (
                    <button
                      onClick={() => handleApproveInquiry(inq.id)}
                      className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Approve & Enroll as Active Student
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Active Students Directory */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs space-y-4">
            <h3 className="font-display text-xl font-bold text-stone-900">Enrolled Student Roster ({students.length})</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {students.map(s => (
                <div key={s.id} className="p-4 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-stone-900 text-sm">{s.name}</h4>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-200 text-stone-700">
                      Age {s.age}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500">Parent: {s.parent_name || 'Direct Enrollment'}</p>
                  <p className="text-xs text-stone-500 font-mono">Phone: {s.parent_phone || 'None'}</p>
                  {s.notes && (
                    <p className="text-xs text-stone-600 italic bg-white p-2 rounded-lg border border-stone-100">
                      {s.notes}
                    </p>
                  )}
                  <div className="pt-2 border-t border-stone-200/70 flex items-center justify-between text-xs">
                    <span className="text-stone-400">Total Attended:</span>
                    <span className="font-bold text-indigo-700">{s.total_attended || 0} classes</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Share & WhatsApp Modal */}
      <ShareModal
        isOpen={!!shareData}
        onClose={() => setShareData(null)}
        title="WhatsApp Message / Promotion"
        messageText={shareData?.message || shareData?.promoText || ''}
        whatsappUrl={shareData?.whatsappUrl}
      />
    </div>
  );
}
