import React, { useState, useEffect } from 'react';
import {
  Heart, Sparkles, Calendar, Clock, Award, Share2, CheckCircle2,
  ChevronRight, Palette, User, BookOpen, AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ShareModal from '../components/ShareModal';
import confetti from 'canvas-confetti';

export default function ParentPortal() {
  const { currentUser, linkedChildren } = useAuth();
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [childDetails, setChildDetails] = useState(null);
  const [activities, setActivities] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [shareData, setShareData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize selected child
  useEffect(() => {
    if (linkedChildren && linkedChildren.length > 0 && !selectedChildId) {
      setSelectedChildId(linkedChildren[0].id);
    } else if (!selectedChildId && currentUser?.id === 'parent-1') {
      setSelectedChildId('stud-1'); // Default to Aarav Sharma for demo
    }
  }, [linkedChildren, currentUser]);

  useEffect(() => {
    if (selectedChildId) {
      loadChildData(selectedChildId);
    }
  }, [selectedChildId]);

  const loadChildData = async (studId) => {
    setLoading(true);
    try {
      const [studRes, actRes, sessRes] = await Promise.all([
        fetch(`/api/students/${studId}`).then(r => r.json()),
        fetch(`/api/activities`).then(r => r.json()),
        fetch(`/api/sessions`).then(r => r.json())
      ]);

      setChildDetails(studRes);
      setActivities(actRes || []);
      setUpcomingSessions((sessRes || []).filter(s => s.status === 'upcoming'));
    } catch (err) {
      console.error('Error fetching child details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleShareProudMoment = (post, artwork) => {
    const childName = childDetails?.student?.name || 'My child';
    const message = `🌟 Proud Parent Moment! 🎨✨\n\n${childName} created this gorgeous artwork in their weekend art class at *Chirasha Art Gallery*!\n\n🖌️ Project: "${post.title}"\n🎨 Medium: ${post.medium}\n\nTeacher's Note: "${artwork?.instructor_feedback || 'Completed today\'s project with immense creativity and focus!'}"\n\nSo grateful to see ${childName}'s creative confidence blossom every weekend! ❤️🖌️`;

    setShareData({
      message,
      whatsappUrl: `https://wa.me/?text=${encodeURIComponent(message)}`
    });

    confetti({ particleCount: 50, spread: 60 });
  };

  const activePass = childDetails?.passes?.find(p => p.used_credits < p.total_credits) || childDetails?.passes?.[0];
  const remainingCredits = activePass ? Math.max(0, activePass.total_credits - activePass.used_credits) : 0;

  return (
    <div className="space-y-10 pb-20">
      {/* Welcome Banner */}
      <div className="bg-linear-to-br from-rose-50 via-amber-50 to-orange-50 border border-rose-200/60 p-6 sm:p-10 rounded-3xl shadow-2xs relative overflow-hidden">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-semibold uppercase tracking-wider mb-3">
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
            Parent Portal • Day-to-Day Learning Stream
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
            Trace Your Child’s Creative Journey
          </h1>
          <p className="text-stone-600 text-xs sm:text-sm mt-2 leading-relaxed">
            Follow what your child is learning step-by-step in every weekend session, celebrate their completed artworks, and view teacher feedback notes.
          </p>
        </div>

        {/* Child Selector Tabs */}
        {linkedChildren && linkedChildren.length > 0 && (
          <div className="flex items-center gap-2 mt-6 pt-6 border-t border-rose-200/60">
            <span className="text-xs font-semibold text-stone-600 mr-2">Viewing Portfolio For:</span>
            {linkedChildren.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedChildId(c.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedChildId === c.id
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-white text-stone-700 hover:bg-stone-50 border border-stone-200'
                }`}
              >
                {c.name} ({c.age} yrs)
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Child Summary Stats & Active Pass Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pass Balance Card */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-stone-500 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Active Weekend Pass</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <h3 className="font-display text-xl font-bold text-stone-900">
              {activePass?.title || '4 Weekend Sessions Pass'}
            </h3>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-stone-900">{remainingCredits}</span>
              <span className="text-xs text-stone-500 font-medium">classes remaining of {activePass?.total_credits || 4}</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-stone-100 h-2.5 rounded-full mt-3 overflow-hidden">
              <div
                className={`h-full rounded-full ${remainingCredits <= 1 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                style={{
                  width: `${activePass ? ((activePass.used_credits / activePass.total_credits) * 100) : 50}%`
                }}
              ></div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-xs">
            <span className="text-stone-500">Fee Status:</span>
            <span className={`font-bold ${activePass?.payment_status === 'paid' ? 'text-emerald-700' : 'text-amber-700'}`}>
              {activePass?.payment_status === 'paid' ? '✓ Fully Paid' : `Pending ₹${(activePass?.fee_amount || 0) - (activePass?.amount_paid || 0)}`}
            </span>
          </div>
        </div>

        {/* Total Classes Attended */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-stone-500 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Attendance Record</span>
              <Calendar className="w-4 h-4 text-indigo-500" />
            </div>
            <h3 className="font-display text-xl font-bold text-stone-900">Total Classes Completed</h3>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-indigo-700">
                {childDetails?.attendance?.filter(a => a.status === 'present').length || 0}
              </span>
              <span className="text-xs text-stone-500">weekend sessions</span>
            </div>
            <p className="text-xs text-stone-500 mt-2">
              100% on-time attendance recorded during weekend batches.
            </p>
          </div>

          <div className="pt-4 mt-4 border-t border-stone-100 text-xs text-stone-400">
            Enrolled since {childDetails?.student?.joined_date || 'September 2026'}
          </div>
        </div>

        {/* Creative Badge & Level */}
        <div className="bg-linear-to-br from-indigo-900 to-purple-900 text-white p-6 rounded-3xl shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-indigo-200 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Skill Mastery</span>
              <Award className="w-4 h-4 text-amber-300" />
            </div>
            <h3 className="font-display text-xl font-bold text-white">
              Junior Master Artist
            </h3>
            <p className="text-xs text-indigo-200 mt-2 leading-relaxed">
              Explored 4 distinct mediums: Watercolors, Acrylic Knife Art, Madhubani Folk Art & Oil Pastels!
            </p>
          </div>

          <div className="pt-4 mt-4 border-t border-white/10 text-xs text-amber-300 font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Consistent creative focus & fine motor control
          </div>
        </div>
      </div>

      {/* Child's Personal Classroom Activity & Portfolio Timeline */}
      <section className="space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold uppercase tracking-wider mb-2">
            <Palette className="w-3.5 h-3.5" />
            Child's Class Portfolio
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-stone-900">
            What {childDetails?.student?.name || 'Your Child'} Created in Class
          </h2>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Detailed breakdown of completed artworks, techniques learned, and personal instructor remarks.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-stone-400">Loading portfolio timeline...</div>
        ) : activities.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-stone-200 text-stone-400">
            No class posts logged yet. The instructor will upload photos from this weekend's session!
          </div>
        ) : (
          <div className="space-y-8">
            {activities.map((act) => {
              const studentTag = act.tagged_students?.find(t => t.student_id === selectedChildId);
              const artworkImg = studentTag?.student_artwork_image || (act.images && act.images[0]) || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800';

              return (
                <div
                  key={act.id}
                  className="bg-white rounded-3xl border border-stone-200/90 overflow-hidden shadow-2xs hover:shadow-md transition-all grid grid-cols-1 md:grid-cols-12"
                >
                  {/* Artwork Image */}
                  <div className="md:col-span-5 relative bg-stone-100 min-h-64">
                    <img
                      src={artworkImg}
                      alt={act.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4 bg-stone-900/80 backdrop-blur-xs text-white text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-amber-300" />
                      {act.medium}
                    </div>
                  </div>

                  {/* Artwork Details & Teacher Feedback */}
                  <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
                        <span className="font-semibold text-amber-700 uppercase tracking-wider">
                          {act.technique || 'Creative Painting'}
                        </span>
                        <span>{new Date(act.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>

                      <h3 className="font-display text-2xl font-bold text-stone-900 mb-2">
                        {act.title}
                      </h3>

                      <p className="text-stone-600 text-xs sm:text-sm leading-relaxed mb-4">
                        {act.description}
                      </p>

                      {/* Instructor Feedback Note */}
                      <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/80 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-rose-900">
                          <Heart className="w-3.5 h-3.5 text-rose-600 fill-rose-600" />
                          <span>Instructor's Feedback for {childDetails?.student?.name}:</span>
                        </div>
                        <p className="text-xs text-rose-800 leading-relaxed italic">
                          "{studentTag?.instructor_feedback || 'Completed today\'s project with wonderful enthusiasm, exploring bold color choices and great patience.'}"
                        </p>
                      </div>
                    </div>

                    {/* Materials & Share Action */}
                    <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="text-stone-400 truncate">
                        <strong className="text-stone-600">Supplies:</strong> {act.materials_used || 'Studio art supplies'}
                      </div>

                      {/* Proud Parent Share Button */}
                      <button
                        onClick={() => handleShareProudMoment(act, studentTag)}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white font-bold flex items-center justify-center gap-2 shadow-xs shadow-emerald-200 transition-all cursor-pointer shrink-0"
                      >
                        <Share2 className="w-4 h-4" />
                        Share Proud Moment to WhatsApp
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Upcoming Weekend Class Schedule */}
      <section className="bg-stone-900 text-white rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-xl font-bold text-white">Upcoming Weekend Schedule</h3>
            <p className="text-stone-400 text-xs">Mark your calendar for your child's next weekend art sessions.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {upcomingSessions.slice(0, 3).map(sess => (
            <div key={sess.id} className="bg-stone-800 p-4 rounded-2xl border border-stone-700 space-y-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 uppercase">
                {sess.type}
              </span>
              <h4 className="font-bold text-white text-sm line-clamp-1">{sess.title}</h4>
              <div className="text-xs text-stone-300 space-y-1">
                <div>📅 {sess.date}</div>
                <div>⏰ {sess.start_time} - {sess.end_time}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Share Modal */}
      <ShareModal
        isOpen={!!shareData}
        onClose={() => setShareData(null)}
        title="Share Child's Artwork to WhatsApp Status"
        messageText={shareData?.message || ''}
        whatsappUrl={shareData?.whatsappUrl}
      />
    </div>
  );
}
