import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import InstallAppBanner from './components/InstallAppBanner';
import PublicShowcase from './pages/PublicShowcase';
import AdminDashboard from './pages/AdminDashboard';
import ParentPortal from './pages/ParentPortal';
import { Palette, Phone, Mail, MapPin, Heart } from 'lucide-react';

function MainApp() {
  const [activeTab, setActiveTab] = useState('showcase'); // 'showcase', 'admin', 'parent'

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
      <InstallAppBanner />
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {activeTab === 'showcase' && (
          <PublicShowcase onOpenParentPortal={() => setActiveTab('parent')} />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard />
        )}

        {activeTab === 'parent' && (
          <ParentPortal />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto bg-stone-900 text-stone-400 py-12 border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-xs">
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-base mb-2">
              <Palette className="w-5 h-5 text-amber-400" />
              <span>Chirasha Art Gallery</span>
            </div>
            <p className="text-stone-400 leading-relaxed mb-4">
              Nurturing creative confidence through hands-on weekend workshops, holiday camps, and structured artistic exploration for kids & teens.
            </p>
            <div className="text-[11px] text-stone-500">
              © 2026 Chirasha Art Gallery • Powered by Studio Management Suite
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">Studio Timings & Batches</h4>
            <ul className="space-y-1.5 leading-relaxed">
              <li>• <strong>Saturdays:</strong> 10:00 AM – 11:30 AM & 4:00 PM – 5:30 PM</li>
              <li>• <strong>Sundays:</strong> 10:00 AM – 11:30 AM & 12:00 PM – 1:30 PM</li>
              <li>• <strong>Holidays & Vacations:</strong> Special Intensive Masterclasses</li>
              <li>• <strong>Batch Size:</strong> Strictly 10–12 Students</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">Contact & Studio Location</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>+91 98765 43210 (Studio Admin)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>contact@chirashaart.com</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>Chirasha Art Gallery, Creative Studio Floor</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
