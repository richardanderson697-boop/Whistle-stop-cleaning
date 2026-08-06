import React from 'react';
import { Sparkles, Calendar, Check, ArrowRight, Shield, Home, Building2, HardHat, RefreshCw, Layers } from 'lucide-react';
import { CleaningType, PricingConfig } from '../types';

interface ServicesGridProps {
  pricingConfig: PricingConfig;
  onSelectServiceForEstimate: (type: CleaningType) => void;
  onSelectServiceForBooking: (type: CleaningType) => void;
}

export const ServicesGrid: React.FC<ServicesGridProps> = ({
  pricingConfig,
  onSelectServiceForEstimate,
  onSelectServiceForBooking,
}) => {
  const services = [
    {
      id: 'one-time' as CleaningType,
      title: 'One-Time Cleaning',
      subtitle: 'Fresh Start & Special Occasions',
      icon: Sparkles,
      color: 'amber',
      badge: 'FREE ESTIMATE',
      description: 'Perfect for a fresh start, special occasions, or when your space needs a little extra care.',
      bullets: [
        'Ideal for Spring Cleaning',
        'Pre & Post Event Cleanups',
        'Top-to-bottom dusting & vacuuming',
        'Kitchen & Bathroom sanitization',
      ],
      estimatedFrom: `$${pricingConfig.baseResidentialPrice}`,
    },
    {
      id: 'weekly' as CleaningType,
      title: 'Weekly Cleaning',
      subtitle: 'Consistently Fresh & Spotless',
      icon: RefreshCw,
      color: 'emerald',
      badge: `${pricingConfig.weeklyDiscountPercent}% OFF REGULAR`,
      description: 'We take care of regular cleaning so you can spend less time on chores and more time doing what you love.',
      bullets: [
        'Enjoy a consistently clean home every week',
        'Dedicated regular cleaning specialist',
        'Customized room priorities',
        'Includes essential supplies provided',
      ],
      estimatedFrom: `$${Math.round(pricingConfig.baseResidentialPrice * (1 - pricingConfig.weeklyDiscountPercent / 100))}/visit`,
    },
    {
      id: 'deep-cleaning' as CleaningType,
      title: 'Deep Cleaning',
      subtitle: 'Thorough Top-to-Bottom Refresh',
      icon: Layers,
      color: 'purple',
      badge: 'RECOMMENDED FIRST CLEAN',
      description: 'A thorough, top-to-bottom clean designed to completely refresh your home or office environment.',
      bullets: [
        'Dust, mop, and deep vacuum all floors',
        'Detailed bathroom tile & grout scrub',
        'Hand-wipe baseboards & windowsills',
        'Ceiling fan & high fixture dusting',
      ],
      estimatedFrom: `$${Math.round(pricingConfig.baseResidentialPrice * pricingConfig.deepCleanMultiplier)}`,
    },
    {
      id: 'bi-weekly' as CleaningType,
      title: 'Bi-Weekly Cleaning',
      subtitle: 'Most Popular Balance',
      icon: Calendar,
      color: 'blue',
      badge: `${pricingConfig.biWeeklyDiscountPercent}% OFF`,
      description: 'The perfect balance of cleanliness and convenience. Keeps your home maintained every other week.',
      bullets: [
        'Maintains fresh, comfortable living spaces',
        'Well cared for every 2 weeks',
        'Kitchen counters, appliances & sink detail',
        'Trash removal & fresh bed linens option',
      ],
      estimatedFrom: `$${Math.round(pricingConfig.baseResidentialPrice * (1 - pricingConfig.biWeeklyDiscountPercent / 100))}/visit`,
    },
    {
      id: 'monthly' as CleaningType,
      title: 'Monthly Cleaning',
      subtitle: 'Busy Schedule Maintenance',
      icon: ClockIcon,
      color: 'indigo',
      badge: `${pricingConfig.monthlyDiscountPercent}% OFF`,
      description: 'Ideal for busy schedules. We handle the heavy details so you enjoy a tidy, refreshed space month after month.',
      bullets: [
        'Thorough monthly reset for all rooms',
        'Focus on high-use living & dining areas',
        'Deep floor care & bathroom polishing',
        'Flexible reschedule options',
      ],
      estimatedFrom: `$${Math.round(pricingConfig.baseResidentialPrice * (1 - pricingConfig.monthlyDiscountPercent / 100))}/visit`,
    },
    {
      id: 'move-in-out' as CleaningType,
      title: 'Move In - Move Out Cleaning',
      subtitle: 'Stress-Free Moving Readiness',
      icon: Home,
      color: 'amber',
      badge: 'BOND & LEASE GUARANTEE',
      description: 'Comprehensive clean designed to make moving easier and less stressful. Move-in ready or left looking its absolute best.',
      bullets: [
        'Clean inside empty cabinets & drawers',
        'Wipe doors, doorframes, and light switches',
        'Baseboards, windowsills & window tracks',
        'Floors, appliance exteriors & interiors',
      ],
      estimatedFrom: `$${Math.round(pricingConfig.baseResidentialPrice * pricingConfig.moveInOutMultiplier)}`,
    },
    {
      id: 'construction-cleanup' as CleaningType,
      title: 'Construction Clean Up',
      subtitle: 'Post-Renovation Dust Removal',
      icon: HardHat,
      color: 'rose',
      badge: 'HEAVY DUST & DEBRIS',
      description: 'Specialized deep cleanup after building or remodeling. Eliminates fine drywall dust, sawdust, and residue.',
      bullets: [
        'HEPA filtration dust extraction',
        'Paint splatter & adhesive residue removal',
        'Fixtures, mirrors, and glass polishing',
        'Commercial grade machinery & detailing',
      ],
      estimatedFrom: `$${Math.round(pricingConfig.baseCommercialPrice * pricingConfig.constructionMultiplier)}`,
    },
  ];

  return (
    <section className="py-16 bg-stone-100 text-stone-900 border-b border-stone-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center space-x-2 bg-emerald-900/10 text-emerald-800 font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-800/20">
            <Shield className="w-3.5 h-3.5 text-emerald-700" />
            <span>Whistle Stop Services Catalog</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900">
            Custom Cleaning Solutions for Home & Business
          </h2>
          <p className="text-stone-600 text-base">
            All services include our supplies provided guarantee, certified professional cleaners, and 100% satisfaction commitment.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((srv) => {
            const Icon = srv.icon;
            return (
              <div
                key={srv.id}
                className="bg-white rounded-2xl border border-stone-200 shadow-lg shadow-stone-200/50 overflow-hidden hover:border-amber-500/80 transition-all hover:shadow-xl flex flex-col justify-between group"
              >
                <div>
                  {/* Card Header */}
                  <div className="p-6 bg-stone-900 text-stone-100 border-b border-stone-800 relative">
                    <div className="flex items-start justify-between">
                      <div className="p-3 rounded-xl bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/20">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2.5 py-1 rounded-md">
                        {srv.badge}
                      </span>
                    </div>

                    <h3 className="text-xl font-serif font-bold text-white mt-4 group-hover:text-amber-400 transition-colors">
                      {srv.title}
                    </h3>
                    <p className="text-xs font-medium text-stone-400 mt-0.5">
                      {srv.subtitle}
                    </p>
                  </div>

                  {/* Body Details */}
                  <div className="p-6 space-y-4">
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                      {srv.description}
                    </p>

                    <div className="space-y-2 pt-2 border-t border-stone-100">
                      {srv.bullets.map((bullet, idx) => (
                        <div key={idx} className="flex items-start space-x-2 text-xs text-stone-700">
                          <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <span>{bullet}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-6 bg-stone-50 border-t border-stone-100 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-stone-800">
                    <span className="text-stone-500 uppercase font-mono">Rates Starting At</span>
                    <span className="text-base text-emerald-700 font-extrabold">{srv.estimatedFrom}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onSelectServiceForEstimate(srv.id)}
                      className="w-full py-2.5 px-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-900 font-bold text-xs transition-colors flex items-center justify-center space-x-1"
                    >
                      <span>Free Quote</span>
                    </button>

                    <button
                      onClick={() => onSelectServiceForBooking(srv.id)}
                      className="w-full py-2.5 px-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-colors shadow-sm flex items-center justify-center space-x-1"
                    >
                      <span>Book Slot</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

function ClockIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
