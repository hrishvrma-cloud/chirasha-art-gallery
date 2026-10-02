import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, Clock, MapPin, Users, Heart, Share2, ArrowRight, CheckCircle2, Brush, Palette, Award } from 'lucide-react';
import EnrollmentModal from '../components/EnrollmentModal';
import ShareModal from '../components/ShareModal';

export default function PublicShowcase({ onOpenParentPortal }) {
  const [activities, setActivities] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [shareData, setShareData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [actRes, sessRes] = await fetchAll();
      setActivities(actRes || []);
      setSessions((sessRes || []).filter(s => s.status === 'upcoming'));
    } catch (err) {
      console.error('Error fetching showcase data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAll = async () => {
    const actRes = await fetch('/api/activities?public=1').then(r => r.json());
    const sessRes = await fetch('/api/sessions').then(r => r.json());
    return [actRes, sessRes];
  };

  const handleShareClick = async (postId) => {
    try {
      const res = await fetch(`/api/activities/${postId}/promo-share`);
      const data = await res.json();
      setShareData(data);
    } catch (err) {
      console.error('Error fetching share promo:', err);
    }
  };

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-amber-50 via-rose-50/60 to-purple-50/70 border border-amber-200/50 p-8 sm:p-14 shadow-sm">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-linear-to-br from-amber-200/40 to-rose-300/30 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-amber-200 shadow-2xs text-amber-900 text-xs font-semibold mb-6">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Weekend Classes & Holiday Camps Admissions Open</span>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl font-black text-stone-900 tracking-tight leading-[1.1] mb-6">
            Where Young Imaginations Turn Into <span className="bg-linear-to-r from-amber-600 via-rose-600 to-indigo-600 bg-clip-text text-transparent">Masterpieces</span>
          </h1>

          <p className="text-lg text-stone-600 leading-relaxed mb-8 max-w-2xl">
            Specialized weekend sessions, holiday bootcamps, and creative workshops designed for kids aged 6–14. We nurture artistic confidence, fine motor focus, and pure joy through hands-on painting, clay sculpting, and folk art.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => setIsEnrollModalOpen(true)}
              className="px-8 py-3.5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-base shadow-lg shadow-stone-900/10 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Book a Weekend Trial</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenParentPortal}
              className="px-6 py-3.5 rounded-2xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 font-semibold text-base shadow-2xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <Heart className="w-4 h-4 text-rose-500" />
              <span>Parent Portal (Check Child's Work)</span>
            </button>
          </div>

          {/* Quick highlight metrics */}
          <div className="grid grid-cols-3 gap-6 pt-10 mt-10 border-t border-stone-200/70 max-w-lg">
            <div>
              <div className="font-display text-2xl font-bold text-stone-900">Weekend</div>
              <div className="text-xs text-stone-500">Sat & Sun Batches</div>
            </div>
            <div>
              <div className="font-display text-2xl font-bold text-stone-900">Small</div>
              <div className="text-xs text-stone-500">Max 10-12 Kids / Batch</div>
            </div>
            <div>
              <div className="font-display text-2xl font-bold text-stone-900">100%</div>
              <div className="text-xs text-stone-500">Art Supplies Included</div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Classroom Daily Routine & Promotions Feed */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-semibold uppercase tracking-wider mb-2">
              <Brush className="w-3.5 h-3.5" />
              Live Studio Routine & Highlights
            </div>
            <h2 className="font-display text-3xl font-bold text-stone-900">
              What We Created This Weekend
            </h2>
            <p className="text-stone-500 text-sm mt-1">
              Real classroom moments, techniques explored, and student artworks updated directly by the instructor.
            </p>
          </div>

          <button
            onClick={() => setIsEnrollModalOpen(true)}
            className="text-sm font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
          >
            Enroll in next class <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-stone-400">Loading studio highlights...</div>
        ) : activities.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-stone-200 text-stone-400">
            No routines published yet. Check back after this weekend's session!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activities.map((act) => {
              const mainImg = act.images && act.images.length > 0 ? act.images[0] : 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800';
              return (
                <article
                  key={act.id}
                  className="bg-white rounded-3xl border border-stone-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
                >
                  <div className="relative aspect-4/3 overflow-hidden bg-stone-100">
                    <img
                      src={mainImg}
                      alt={act.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-xs text-white text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1.5">
                      <Palette className="w-3 h-3 text-amber-300" />
                      {act.medium}
                    </div>

                    <button
                      onClick={() => handleShareClick(act.id)}
                      className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white text-stone-700 rounded-full shadow-md transition-all cursor-pointer"
                      title="Share Promotion Copy"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      {act.technique && (
                        <span className="text-[11px] font-semibold tracking-wider uppercase text-amber-700 mb-1 block">
                          Technique: {act.technique}
                        </span>
                      )}
                      <h3 className="font-display text-xl font-bold text-stone-900 mb-2 leading-snug">
                        {act.title}
                      </h3>
                      <p className="text-stone-600 text-xs leading-relaxed mb-4 line-clamp-3">
                        {act.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-stone-100">
                      {act.materials_used && (
                        <div className="text-[11px] text-stone-400 mb-3 truncate">
                          <strong className="text-stone-500">Materials:</strong> {act.materials_used}
                        </div>
                      )}
                      <div className="flex items-center justify-between text-xs text-stone-400">
                        <span>{new Date(act.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <button
                          onClick={() => handleShareClick(act.id)}
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                        >
                          Share Promo <Share2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Upcoming Weekend Sessions & Holiday Camps */}
      <section className="bg-stone-900 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden">
        <div className="max-w-3xl mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <Calendar className="w-3.5 h-3.5" />
            Upcoming Class Timetable
          </div>
          <h2 className="font-display text-3xl font-bold text-white mb-2">
            Reserve Your Weekend Slot
          </h2>
          <p className="text-stone-400 text-sm">
            Classes run every Saturday and Sunday, plus upcoming holiday intensives. Seats are strictly limited to 10-12 students per batch to ensure individual guidance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessions.map((sess) => (
            <div
              key={sess.id}
              className="bg-stone-800/80 rounded-2xl p-5 border border-stone-700 hover:border-amber-500/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                    sess.type === 'holiday_camp' ? 'bg-purple-900/60 text-purple-200 border border-purple-700' : 'bg-amber-900/60 text-amber-200 border border-amber-700'
                  }`}>
                    {sess.type === 'holiday_camp' ? 'Holiday Camp' : 'Weekend Batch'}
                  </span>
                  <span className="text-xs text-stone-400 font-mono">
                    Max {sess.max_seats} Seats
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mb-2 line-clamp-2">
                  {sess.title}
                </h3>

                <div className="space-y-1.5 text-xs text-stone-300 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>{new Date(sess.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{sess.start_time} - {sess.end_time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-amber-400" />
                    <span>Ages: {sess.age_group}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsEnrollModalOpen(true)}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Book This Slot
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Our Art Studio */}
      <section className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-display text-3xl font-bold text-stone-900 mb-3">
            Why Parents Love Our Weekend Classes
          </h2>
          <p className="text-stone-500 text-sm">
            More than just coloring inside lines—we teach children how to see, feel, and express their worldview through diverse artistic mediums.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Brush className="w-6 h-6" />
            </div>
            <h3 className="font-display text-lg font-bold text-stone-900">Diverse Creative Mediums</h3>
            <p className="text-stone-600 text-xs leading-relaxed">
              Every month covers a rich rotation: Watercolors, Heavy Acrylics, Traditional Folk Art (Madhubani & Warli), Air-Dry Clay, and Scratch Art.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-rose-50/50 border border-rose-100 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-display text-lg font-bold text-stone-900">Transparent Parent Portal</h3>
            <p className="text-stone-600 text-xs leading-relaxed">
              Parents get dedicated logins to view weekly artwork photos, teacher feedback notes, remaining pass credits, and milestone cards.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="font-display text-lg font-bold text-stone-900">Flexible Session Passes</h3>
            <p className="text-stone-600 text-xs leading-relaxed">
              No locked monthly dates! Choose flexible 4-session or 8-session cards that fit your family’s weekend travel plans and school holidays.
            </p>
          </div>
        </div>
      </section>

      {/* Modals */}
      <EnrollmentModal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
      />

      <ShareModal
        isOpen={!!shareData}
        onClose={() => setShareData(null)}
        title="Promotional Routine Post"
        messageText={shareData?.promoText || ''}
        whatsappUrl={shareData?.whatsappUrl}
      />
    </div>
  );
}
