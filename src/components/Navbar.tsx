import React from 'react';
import { Calendar, FileText, User as UserIcon, ShieldCheck, Phone, Sparkles, Home, LogOut } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  activeTab: 'home' | 'estimate' | 'booking' | 'customer' | 'admin';
  setActiveTab: (tab: 'home' | 'estimate' | 'booking' | 'customer' | 'admin') => void;
  currentUser: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenAuth,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-stone-900 text-stone-100 shadow-md border-b border-amber-600/30">
      {/* Top Hotline Bar */}
      <div className="bg-emerald-950 text-emerald-200 text-xs py-1.5 px-4 flex flex-col sm:flex-row justify-between items-center border-b border-emerald-800/40">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1.5">
            <Phone className="w-3.5 h-3.5 text-amber-400" />
            <span>Call / Text for Instant Help: <strong>(555) 839-2532</strong></span>
          </span>
          <span className="hidden md:inline-block text-stone-400">•</span>
          <span className="hidden md:inline-block">Free Estimates Guaranteed Within 24 Hours</span>
        </div>
        <div className="flex items-center space-x-3 mt-1 sm:mt-0">
          <span className="bg-amber-500/20 text-amber-300 text-[10px] font-semibold px-2 py-0.5 rounded border border-amber-500/40 uppercase tracking-wider">
            Supplies Provided
          </span>
          <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold px-2 py-0.5 rounded border border-emerald-500/40 uppercase tracking-wider">
            Residential & Commercial
          </span>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand Title */}
          <button 
            onClick={() => setActiveTab('home')}
            className="flex items-center space-x-3 group text-left focus:outline-none"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-stone-950 shadow-lg shadow-amber-900/20 group-hover:scale-105 transition-transform border border-amber-400/40">
              <Sparkles className="w-6 h-6 fill-stone-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-stone-100 group-hover:text-amber-400 transition-colors">
                  Whistle Stop
                </span>
                <span className="text-xs bg-amber-500 text-stone-950 font-black px-1.5 py-0.5 rounded tracking-widest uppercase">
                  CLEANING
                </span>
              </div>
              <p className="text-[11px] font-medium text-amber-400/90 tracking-widest uppercase font-mono">
                WE CLEAN • WE MAINTAIN • YOU ENJOY
              </p>
            </div>
          </button>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-1.5 transition-colors ${
                activeTab === 'home'
                  ? 'bg-stone-800 text-amber-400 border border-amber-500/30'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Services</span>
            </button>

            <button
              onClick={() => setActiveTab('estimate')}
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-1.5 transition-colors ${
                activeTab === 'estimate'
                  ? 'bg-stone-800 text-amber-400 border border-amber-500/30'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Free Estimate</span>
            </button>

            <button
              onClick={() => setActiveTab('booking')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold flex items-center space-x-1.5 transition-colors ${
                activeTab === 'booking'
                  ? 'bg-amber-400 text-stone-950 font-bold shadow-md'
                  : 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md shadow-amber-500/20'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Booking Calendar</span>
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-1.5 transition-colors ${
                activeTab === 'admin'
                  ? 'bg-amber-500 text-stone-950 font-bold border border-amber-400 shadow-md'
                  : 'bg-stone-800 text-amber-300 hover:bg-stone-700 border border-amber-500/40'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Admin Dashboard</span>
            </button>

            {currentUser ? (
              <button
                onClick={() => setActiveTab('customer')}
                className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-1.5 transition-colors ${
                  activeTab === 'customer'
                    ? 'bg-stone-800 text-amber-400 border border-amber-500/30'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
                }`}
              >
                <UserIcon className="w-4 h-4" />
                <span>My Portal ({currentUser.name.split(' ')[0]})</span>
              </button>
            ) : null}
          </nav>

          {/* User Auth Action Button */}
          <div className="flex items-center space-x-3">
            {currentUser ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={onLogout}
                  title="Sign Out"
                  className="p-2 text-stone-400 hover:text-rose-400 rounded-lg hover:bg-stone-800 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="text-xs sm:text-sm font-medium text-stone-200 hover:text-amber-400 px-3 py-1.5 rounded-lg border border-stone-700 hover:border-amber-500/50 transition-colors flex items-center space-x-1.5"
              >
                <UserIcon className="w-4 h-4" />
                <span>Sign In / Register</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Mobile Sub-Nav Row */}
      <div className="md:hidden flex items-center justify-around bg-stone-950 px-2 py-2 border-t border-stone-800 text-xs">
        <button
          onClick={() => setActiveTab('home')}
          className={`px-2 py-1.5 rounded ${activeTab === 'home' ? 'text-amber-400 font-bold bg-stone-800' : 'text-stone-300'}`}
        >
          Services
        </button>
        <button
          onClick={() => setActiveTab('estimate')}
          className={`px-2 py-1.5 rounded ${activeTab === 'estimate' ? 'text-amber-400 font-bold bg-stone-800' : 'text-stone-300'}`}
        >
          Get Estimate
        </button>
        <button
          onClick={() => setActiveTab('booking')}
          className={`px-2.5 py-1.5 rounded font-bold bg-amber-500 text-stone-950`}
        >
          Calendar
        </button>
        <button
          onClick={() => setActiveTab('admin')}
          className={`px-2 py-1.5 rounded ${activeTab === 'admin' ? 'text-amber-300 font-bold bg-stone-800' : 'text-amber-400 font-bold'}`}
        >
          Admin
        </button>
        {currentUser && (
          <button
            onClick={() => setActiveTab('customer')}
            className={`px-2 py-1.5 rounded ${activeTab === 'customer' ? 'text-amber-400 font-bold bg-stone-800' : 'text-stone-300'}`}
          >
            Portal
          </button>
        )}
      </div>
    </header>
  );
};
