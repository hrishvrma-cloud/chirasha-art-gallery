import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function EnrollmentModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    parent_name: '',
    child_name: '',
    child_age: '8',
    phone: '',
    email: '',
    interest: 'Weekend Classes',
    message: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.parent_name || !formData.child_name || !formData.phone) {
      setError('Please fill in your name, child’s name, and contact number.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');

      setSuccess(true);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setSuccess(false);
    setFormData({
      parent_name: '',
      child_name: '',
      child_age: '8',
      phone: '',
      email: '',
      interest: 'Weekend Classes',
      message: ''
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-100 relative">
        <button
          onClick={handleResetAndClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-stone-900 mb-2">Enrollment Request Received!</h3>
            <p className="text-stone-600 text-sm max-w-sm mx-auto mb-6">
              Thank you! Chirasha Art Gallery will review your details and contact you via WhatsApp or phone call to confirm your child's weekend slot.
            </p>
            <button
              onClick={handleResetAndClose}
              className="px-6 py-2.5 rounded-xl bg-stone-900 text-white font-medium hover:bg-stone-800 transition-colors"
            >
              Back to Studio
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-amber-800 tracking-wider uppercase">Admissions Open</span>
            </div>
            <h3 className="text-2xl font-display font-bold text-stone-900 mb-1">
              Join Weekend & Holiday Art Classes
            </h3>
            <p className="text-xs text-stone-500 mb-6">
              Fill out this quick form to reserve your child’s seat or request a trial session.
            </p>

            {error && (
              <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Parent's Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.parent_name}
                    onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
                    placeholder="e.g. Meera Gupta"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">WhatsApp / Phone *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Child's Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.child_name}
                    onChange={(e) => setFormData({ ...formData, child_name: e.target.value })}
                    placeholder="e.g. Reyansh"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Child's Age (Years) *</label>
                  <input
                    type="number"
                    min="4"
                    max="18"
                    required
                    value={formData.child_age}
                    onChange={(e) => setFormData({ ...formData, child_age: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Program of Interest</label>
                <select
                  value={formData.interest}
                  onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white"
                >
                  <option value="Weekend Classes">Regular Weekend Classes (Saturdays & Sundays)</option>
                  <option value="Holiday Camp">Upcoming Holiday / Vacation Special Camp</option>
                  <option value="Trial Class">Single Trial Workshop Session</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Any specific art interests or notes?</label>
                <textarea
                  rows="2"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="e.g. Interested in sketching and acrylic colors, beginner level..."
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 via-rose-600 to-indigo-600 hover:opacity-95 text-white font-semibold text-sm shadow-md shadow-rose-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting ? 'Submitting...' : 'Submit Enrollment Request'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
