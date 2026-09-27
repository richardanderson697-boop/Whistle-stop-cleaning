import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { ServicesGrid } from './components/ServicesGrid';
import { QuestionnaireView } from './components/QuestionnaireView';
import { CalendarBookingView } from './components/CalendarBookingView';
import { StripeCheckoutModal } from './components/StripeCheckoutModal';
import { AuthModal } from './components/AuthModal';
import { CustomerPortal } from './components/CustomerPortal';
import { AdminPortal } from './components/AdminPortal';
import { User, PricingConfig, CleaningType, Booking, EstimateRequest } from './types';
import { defaultPricingConfig } from './data/initialData';
import { Sparkles, Phone, Mail, MapPin, ShieldCheck, Clock, CheckCircle2, Heart } from 'lucide-react';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'home' | 'estimate' | 'booking' | 'customer' | 'admin'>('home');

  // Pricing Config
  const [pricingConfig, setPricingConfig] = useState<PricingConfig>(defaultPricingConfig);

  // Selected Service for Estimate or Booking
  const [selectedCleaningType, setSelectedCleaningType] = useState<CleaningType>('move-in-out');

  // User Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Stripe Checkout Flow State
  const [checkoutDraft, setCheckoutDraft] = useState<Partial<Booking> | null>(null);

  useEffect(() => {
    // Fetch initial pricing config from backend
    fetchPricing();
  }, []);

  const fetchPricing = async () => {
    try {
      const res = await fetch('/api/pricing');
      if (res.ok) {
        const data = await res.json();
        setPricingConfig(data);
      }
    } catch (e) {
      console.error('Error fetching pricing:', e);
    }
  };

  const handleStartEstimateForType = (type: CleaningType) => {
    setSelectedCleaningType(type);
    setActiveTab('estimate');
  };

  const handleStartBookingForType = (type: CleaningType) => {
    setSelectedCleaningType(type);
    setActiveTab('booking');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('home');
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 font-sans flex flex-col justify-between selection:bg-amber-400 selection:text-stone-950">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Body Routing */}
      <main className="flex-grow">
        
        {/* HOME VIEW */}
        {activeTab === 'home' && (
          <div className="space-y-12 pb-16">
            <HeroBanner
              onStartEstimate={() => setActiveTab('estimate')}
              onStartBooking={() => setActiveTab('booking')}
            />

            <ServicesGrid
              pricingConfig={pricingConfig}
              onSelectServiceForEstimate={handleStartEstimateForType}
              onSelectServiceForBooking={handleStartBookingForType}
            />

            {/* Whistle Stop Feature Flyer Banner */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="bg-stone-900 text-stone-100 rounded-3xl p-8 sm:p-12 border-2 border-amber-500 shadow-2xl relative overflow-hidden">
                <div className="max-w-3xl space-y-4 relative z-10">
                  <div className="inline-flex items-center space-x-2 bg-amber-500/20 text-amber-300 font-mono text-xs px-3 py-1 rounded-full uppercase tracking-wider border border-amber-400/30">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>The Whistle Stop Difference</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white">
                    Need a Custom Commercial or Special Move Clean?
                  </h2>
                  <p className="text-stone-300 text-base leading-relaxed">
                    Submit your details and photos through our initial estimate questionnaire. Our administrator reviews your property specs and returns a guaranteed response within 24 hours!
                  </p>
                  
                  <div className="pt-2 flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={() => setActiveTab('estimate')}
                      className="px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-sm rounded-xl shadow-lg transition-all"
                    >
                      Fill Free Estimate Questionnaire →
                    </button>
                    <button
                      onClick={() => setActiveTab('booking')}
                      className="px-6 py-3.5 bg-stone-800 hover:bg-stone-700 text-stone-100 font-bold text-sm rounded-xl border border-stone-600 transition-all"
                    >
                      View Real-Time Booking Calendar
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ESTIMATE QUESTIONNAIRE VIEW */}
        {activeTab === 'estimate' && (
          <QuestionnaireView
            initialCleaningType={selectedCleaningType}
            onSubmitted={(estimate) => {
              // Auto route to portal if logged in
              if (currentUser) {
                setActiveTab('customer');
              }
            }}
            onCancel={() => setActiveTab('home')}
          />
        )}

        {/* REAL-TIME CALENDAR BOOKING VIEW */}
        {activeTab === 'booking' && (
          <CalendarBookingView
            pricingConfig={pricingConfig}
            initialType={selectedCleaningType}
            currentUser={currentUser}
            onProceedToCheckout={(draft) => {
              setCheckoutDraft(draft);
            }}
            onCancel={() => setActiveTab('home')}
          />
        )}

        {/* CUSTOMER PORTAL */}
        {activeTab === 'customer' && (
          currentUser ? (
            <CustomerPortal
              currentUser={currentUser}
              onOpenBooking={() => setActiveTab('booking')}
              onOpenEstimate={() => setActiveTab('estimate')}
            />
          ) : (
            <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-stone-300 text-center space-y-4 shadow-xl">
              <ShieldCheck className="w-12 h-12 text-amber-500 mx-auto" />
              <h2 className="text-xl font-serif font-bold">Customer Portal Access</h2>
              <p className="text-xs text-stone-600">
                Sign in to view your scheduled bookings, quotes, and payment receipts, or test with a demo account.
              </p>
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-sm rounded-xl shadow-md transition-all"
                >
                  Sign In or Register Account
                </button>
                <button
                  onClick={() => setCurrentUser({
                    id: 'usr-099',
                    name: 'Marcus Vance',
                    email: 'mvance@techcorp.io',
                    phone: '(555) 888-1122',
                    role: 'customer'
                  })}
                  className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl border border-stone-300 transition-all flex items-center justify-center space-x-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Instant Quick Demo Customer Access</span>
                </button>
              </div>
            </div>
          )
        )}

        {/* ADMIN PORTAL */}
        {activeTab === 'admin' && (
          <AdminPortal
            onPricingUpdated={(newP) => setPricingConfig(newP)}
          />
        )}

      </main>

      {/* STRIPE CHECKOUT MODAL OVERLAY */}
      {checkoutDraft && (
        <StripeCheckoutModal
          bookingData={checkoutDraft}
          onSuccess={(confirmed) => {
            setCheckoutDraft(null);
            if (currentUser) {
              setActiveTab('customer');
            } else {
              setActiveTab('home');
            }
          }}
          onClose={() => setCheckoutDraft(null)}
        />
      )}

      {/* AUTH MODAL OVERLAY */}
      {isAuthModalOpen && (
        <AuthModal
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            setIsAuthModalOpen(false);
            if (user.role === 'admin') {
              setActiveTab('admin');
            } else {
              setActiveTab('customer');
            }
          }}
          onClose={() => setIsAuthModalOpen(false)}
        />
      )}

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-300 border-t-2 border-amber-600/40 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Brand Col */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-stone-950 font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="text-xl font-serif font-bold text-white">Whistle Stop</span>
              </div>
              <p className="text-xs text-amber-400 font-mono tracking-widest uppercase">
                WE CLEAN • WE MAINTAIN • YOU ENJOY
              </p>
              <p className="text-xs text-stone-400 leading-relaxed">
                Reliable, professional cleaning you can count on. Residential & Commercial services, supplies provided, free estimates within 24 hours.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                Quick Navigation
              </h3>
              <ul className="space-y-2 text-xs font-medium text-stone-400">
                <li><button onClick={() => setActiveTab('home')} className="hover:text-amber-400">Cleaning Services Catalog</button></li>
                <li><button onClick={() => setActiveTab('estimate')} className="hover:text-amber-400">Free Estimate Questionnaire</button></li>
                <li><button onClick={() => setActiveTab('booking')} className="hover:text-amber-400">Real-Time Booking Calendar</button></li>
                <li><button onClick={() => setActiveTab('admin')} className="text-amber-400 font-bold hover:underline flex items-center space-x-1"><span>Admin Control Dashboard</span></button></li>
                <li><button onClick={() => setIsAuthModalOpen(true)} className="hover:text-amber-400">Customer Account Sign In</button></li>
              </ul>
            </div>

            {/* Admin & Contact */}
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                Service Hotline & Admin
              </h3>
              <ul className="space-y-2 text-xs text-stone-400">
                <li className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-amber-400" />
                  <span>Call/Text: (555) 839-2532</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-amber-400" />
                  <span>Admin: admin@whistlestopcleaning.com</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Mon - Sat: 7:00 AM - 7:00 PM</span>
                </li>
              </ul>
            </div>

            {/* Features */}
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                Whistle Stop Standards
              </h3>
              <div className="space-y-2 text-xs text-stone-400">
                <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Supplies Fully Provided</span>
                </div>
                <div className="flex items-center space-x-1.5 text-amber-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>24-Hour Estimate SLA</span>
                </div>
                <div className="flex items-center space-x-1.5 text-blue-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Stripe Encrypted Payments</span>
                </div>
              </div>
            </div>

          </div>

          <div className="border-t border-stone-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500">
            <div>
              © {new Date().getFullYear()} Whistle Stop Cleaning. All rights reserved.
            </div>
            <div className="mt-2 sm:mt-0 font-mono">
              Designed for Residential & Commercial Cleaning Excellence
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
