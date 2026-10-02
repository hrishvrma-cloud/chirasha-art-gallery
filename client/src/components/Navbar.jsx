import React from 'react';
import { Palette, Sparkles, UserCheck, Heart, LogOut, Shield, Compass, Calendar, Smartphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ activeTab, setActiveTab }) {
  const { currentUser, logout, quickLoginAs } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Studio Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('showcase')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-rose-200">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-xl font-bold tracking-tight text-stone-900">Chirasha</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold tracking-wide uppercase">
                  Art Gallery
                </span>
              </div>
              <p className="text-xs text-stone-500">Weekend & Holiday Art Classes & Studio</p>
            </div>
          </div>

          {/* Navigation Mode Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-stone-100 p-1.5 rounded-2xl border border-stone-200/80">
            <button
              onClick={() => setActiveTab('showcase')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'showcase'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <Compass className="w-4 h-4 text-amber-600" />
              Public Showcase & Admissions
            </button>

            <button
              onClick={() => {
                if (currentUser?.role !== 'admin') quickLoginAs('admin');
                setActiveTab('admin');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-white text-indigo-950 shadow-xs ring-1 ring-indigo-200 font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <Shield className="w-4 h-4 text-indigo-600" />
              Studio Admin Portal
              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-indigo-100 text-indigo-700 font-bold">Admin</span>
            </button>

            <button
              onClick={() => {
                if (currentUser?.role !== 'parent') quickLoginAs('parent');
                setActiveTab('parent');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'parent'
                  ? 'bg-white text-rose-950 shadow-xs ring-1 ring-rose-200 font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <Heart className="w-4 h-4 text-rose-500" />
              Parent & Child Portal
              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-rose-100 text-rose-700 font-bold">Parents</span>
            </button>
          </nav>

          {/* Quick Demo Persona Switcher */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-stone-100 px-3 py-1.5 rounded-xl border border-stone-200 text-xs text-stone-600">
              <span className="font-medium text-stone-400">Mode:</span>
              {currentUser?.role === 'admin' ? (
                <span className="font-semibold text-indigo-700 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                  Admin
                </span>
              ) : (
                <span className="font-semibold text-rose-700 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                  Priya (Parent)
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {currentUser?.role === 'admin' ? (
                <button
                  onClick={() => {
                    quickLoginAs('parent');
                    setActiveTab('parent');
                  }}
                  className="text-xs px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-medium transition-colors border border-rose-200 cursor-pointer"
                  title="Switch to Parent View"
                >
                  Switch to Parent UI
                </button>
              ) : (
                <button
                  onClick={() => {
                    quickLoginAs('admin');
                    setActiveTab('admin');
                  }}
                  className="text-xs px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium transition-colors border border-indigo-200 cursor-pointer"
                  title="Switch to Admin UI"
                >
                  Switch to Admin UI
                </button>
              )}
            </div>

          </div>

        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-stone-100 text-xs">
          <button
            onClick={() => setActiveTab('showcase')}
            className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer ${activeTab === 'showcase' ? 'bg-amber-100 text-amber-900 font-bold' : 'text-stone-600'}`}
          >
            Showcase
          </button>
          <button
            onClick={() => {
              if (currentUser?.role !== 'admin') quickLoginAs('admin');
              setActiveTab('admin');
            }}
            className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer ${activeTab === 'admin' ? 'bg-indigo-100 text-indigo-900 font-bold' : 'text-stone-600'}`}
          >
            Studio Admin
          </button>
          <button
            onClick={() => {
              if (currentUser?.role !== 'parent') quickLoginAs('parent');
              setActiveTab('parent');
            }}
            className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer ${activeTab === 'parent' ? 'bg-rose-100 text-rose-900 font-bold' : 'text-stone-600'}`}
          >
            Parent Portal
          </button>
        </div>

      </div>
    </header>
  );
}
