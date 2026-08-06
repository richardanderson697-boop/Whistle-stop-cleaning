import React from 'react';
import { ShieldCheck, Sparkles, Clock, CheckCircle2, FileText, Calendar, ArrowRight, Home, Building2 } from 'lucide-react';

interface HeroBannerProps {
  onStartEstimate: () => void;
  onStartBooking: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onStartEstimate,
  onStartBooking,
}) => {
  return (
    <div className="relative bg-stone-900 text-stone-100 overflow-hidden border-b border-amber-600/30">
      
      {/* Background Graphic Accent */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-amber-500 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-600 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Main Copy Area */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-3.5 py-1.5 text-xs text-amber-300 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Reliable, Professional & Top-Rated Cleaning Services</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-stone-100 leading-tight">
                Welcome to <br />
                <span className="text-amber-400 font-extrabold underline decoration-amber-500/40 decoration-wavy">
                  Whistle Stop Cleaning
                </span>
              </h1>
              <p className="text-xl font-bold tracking-widest text-emerald-400 uppercase font-mono">
                WE CLEAN • WE MAINTAIN • YOU ENJOY
              </p>
            </div>

            <p className="text-stone-300 text-base sm:text-lg leading-relaxed max-w-2xl">
              Reliable, professional cleaning you can count on. We focus on the details, maintain high standards, and make your space fresh, comfortable, and stress-free. From move-in/out to post-construction cleanup and recurring maintenance!
            </p>

            {/* 3 Core Highlights (Flyer pillars) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-stone-800/80 border border-stone-700/80 rounded-xl p-3 flex items-center space-x-3 shadow-sm">
                <div className="p-2 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800">
                  <Home className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-100 uppercase">Residential &</div>
                  <div className="text-xs text-stone-400">Commercial</div>
                </div>
              </div>

              <div className="bg-stone-800/80 border border-stone-700/80 rounded-xl p-3 flex items-center space-x-3 shadow-sm">
                <div className="p-2 rounded-lg bg-amber-950 text-amber-400 border border-amber-800">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-100 uppercase">Supplies</div>
                  <div className="text-xs text-stone-400">Provided</div>
                </div>
              </div>

              <div className="bg-stone-800/80 border border-stone-700/80 rounded-xl p-3 flex items-center space-x-3 shadow-sm">
                <div className="p-2 rounded-lg bg-blue-950 text-blue-400 border border-blue-800">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-100 uppercase">Free Estimates</div>
                  <div className="text-xs text-stone-400">24-Hr SLA Response</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
              <button
                onClick={onStartEstimate}
                className="px-6 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-base shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <FileText className="w-5 h-5" />
                <span>Request Free Estimate</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onStartBooking}
                className="px-6 py-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-100 font-bold text-base border border-stone-600 flex items-center justify-center space-x-2 transition-all hover:border-amber-500/50"
              >
                <Calendar className="w-5 h-5 text-amber-400" />
                <span>Book Real-Time Calendar</span>
              </button>
            </div>

            {/* Trust indicators */}
            <div className="pt-2 flex items-center space-x-6 text-xs text-stone-400">
              <span className="flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Insured & Background-Checked Cleaners</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                <span>100% Satisfaction Guaranteed</span>
              </span>
            </div>

          </div>

          {/* Visual Showcase Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl bg-stone-800 border-2 border-amber-600/40 p-3 shadow-2xl overflow-hidden group">
              <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-stone-900">
                <img
                  src="/src/assets/images/whistle_stop_hero_1785978213700.jpg"
                  alt="Whistle Stop Cleaning Service"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  onError={(e) => {
                    // Fallback if image fails
                    e.currentTarget.src = "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=1200";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/20 to-transparent"></div>
                
                {/* Floating Badge */}
                <div className="absolute bottom-4 left-4 right-4 bg-stone-900/90 backdrop-blur-md p-4 rounded-xl border border-stone-700 text-stone-100 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-amber-400 uppercase tracking-wide">
                      Whistle Stop Guarantee
                    </div>
                    <div className="text-sm font-bold text-white">
                      Spotless Spaces • Fresh & Comfortable
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs bg-emerald-500/20 text-emerald-300 font-bold px-2 py-1 rounded border border-emerald-500/40">
                      5.0 ★ Rated
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
