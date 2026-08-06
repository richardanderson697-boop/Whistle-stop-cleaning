import React, { useState, useEffect } from 'react';
import { CleaningType, TimeSlot, PricingConfig, Booking, User } from '../types';
import { Calendar as CalendarIcon, Clock, Check, Sparkles, AlertCircle, ArrowRight, ShieldCheck, Plus, CheckCircle2 } from 'lucide-react';

interface CalendarBookingViewProps {
  pricingConfig: PricingConfig;
  initialType?: CleaningType;
  currentUser: User | null;
  onProceedToCheckout: (bookingData: Partial<Booking>) => void;
  onCancel: () => void;
}

export const CalendarBookingView: React.FC<CalendarBookingViewProps> = ({
  pricingConfig,
  initialType = 'one-time',
  currentUser,
  onProceedToCheckout,
  onCancel,
}) => {
  // Slots loaded from server
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(true);

  // Booking Parameters
  const [category, setCategory] = useState<'residential' | 'commercial'>('residential');
  const [cleaningType, setCleaningType] = useState<CleaningType>(initialType);
  const [squareFootage, setSquareFootage] = useState<number>(1800);
  const [bedrooms, setBedrooms] = useState<number>(3);
  const [bathrooms, setBathrooms] = useState<number>(2);
  const [frequency, setFrequency] = useState<'one-time' | 'weekly' | 'bi-weekly' | 'monthly'>('one-time');

  // Selected Add-ons
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);

  // Selected Date & Slot
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split('T')[0] // Tomorrow default
  );
  const [selectedSlot, setSelectedSlot] = useState<string>('08:00 AM - 11:00 AM');

  // Customer Contact Fields
  const [customerName, setCustomerName] = useState<string>(currentUser?.name || '');
  const [customerPhone, setCustomerPhone] = useState<string>(currentUser?.phone || '');
  const [customerEmail, setCustomerEmail] = useState<string>(currentUser?.email || '');
  const [propertyAddress, setPropertyAddress] = useState<string>(currentUser?.address || '');
  const [entryNotes, setEntryNotes] = useState<string>('');

  // Fetch slots on mount
  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      setIsLoadingSlots(true);
      const res = await fetch('/api/availability');
      const data = await res.json();
      if (Array.isArray(data)) {
        setTimeSlots(data);
      }
    } catch (e) {
      console.error('Error fetching time slots:', e);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  // Toggle Add-on
  const toggleAddOn = (addonId: string) => {
    setSelectedAddOns((prev) =>
      prev.includes(addonId) ? prev.filter((id) => id !== addonId) : [...prev, addonId]
    );
  };

  // Calculate Price in real-time
  const calculateTotal = () => {
    let base = category === 'commercial' ? pricingConfig.baseCommercialPrice : pricingConfig.baseResidentialPrice;
    let roomFee = (bedrooms * pricingConfig.pricePerBedroom) + (bathrooms * pricingConfig.pricePerBathroom);
    let sqFtFee = squareFootage * pricingConfig.pricePerSqFt;
    let total = base + roomFee + sqFtFee;

    // Service Multiplier
    if (cleaningType === 'move-in-out') total *= pricingConfig.moveInOutMultiplier;
    else if (cleaningType === 'construction-cleanup') total *= pricingConfig.constructionMultiplier;
    else if (cleaningType === 'deep-cleaning') total *= pricingConfig.deepCleanMultiplier;

    // Frequency Discount
    if (frequency === 'weekly') total *= (1 - pricingConfig.weeklyDiscountPercent / 100);
    else if (frequency === 'bi-weekly') total *= (1 - pricingConfig.biWeeklyDiscountPercent / 100);
    else if (frequency === 'monthly') total *= (1 - pricingConfig.monthlyDiscountPercent / 100);

    // Add-ons
    selectedAddOns.forEach((addonId) => {
      const found = pricingConfig.addOns.find((a) => a.id === addonId);
      if (found) total += found.price;
    });

    return Math.round(total);
  };

  const totalPrice = calculateTotal();
  const depositAmount = Math.round(totalPrice * 0.25); // 25% deposit option

  const handleNextToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !customerEmail || !propertyAddress) {
      alert('Please fill out Name, Phone, Email, and Property Address.');
      return;
    }

    const bookingDraft: Partial<Booking> = {
      category,
      cleaningType,
      squareFootage,
      bedrooms,
      bathrooms,
      selectedAddOns,
      date: selectedDate,
      timeSlot: selectedSlot,
      totalPrice,
      depositAmount,
      customerName,
      customerPhone,
      customerEmail,
      propertyAddress,
      entryNotes,
      customerId: currentUser?.id || `usr-${Date.now()}`,
    };

    onProceedToCheckout(bookingDraft);
  };

  // Filter slots for selected date
  const slotsForDate = timeSlots.filter((s) => s.date === selectedDate);

  return (
    <div className="max-w-5xl mx-auto my-8 px-4 sm:px-6">
      <div className="bg-white rounded-2xl border-2 border-stone-300 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-stone-900 text-stone-100 p-6 sm:p-8 border-b-2 border-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center space-x-1.5 bg-emerald-500/20 text-emerald-300 font-mono text-xs px-2.5 py-0.5 rounded border border-emerald-400/30 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Real-Time Availability Calendar</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-100">
                Book Your Cleaning Appointment
              </h2>
              <p className="text-stone-400 text-xs sm:text-sm">
                Select your preferred date, time slot, and extra detailing options.
              </p>
            </div>

            <button
              type="button"
              onClick={onCancel}
              className="text-xs text-stone-400 hover:text-white px-3 py-1.5 rounded-lg border border-stone-700 hover:bg-stone-800 transition-colors flex items-center space-x-1"
              title="Return to Services Home Page"
            >
              <span>✕ Back to Services</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleNextToPayment} className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Config & Details */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Category & Type */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Property Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm font-semibold"
                >
                  <option value="residential">Residential Home</option>
                  <option value="commercial">Commercial / Business</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Cleaning Service
                </label>
                <select
                  value={cleaningType}
                  onChange={(e) => setCleaningType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm font-semibold"
                >
                  <option value="one-time">One-Time Clean</option>
                  <option value="deep-cleaning">Deep Cleaning</option>
                  <option value="move-in-out">Move In / Move Out</option>
                  <option value="construction-cleanup">Construction Clean Up</option>
                  <option value="weekly">Weekly Recurring</option>
                  <option value="bi-weekly">Bi-Weekly Recurring</option>
                  <option value="monthly">Monthly Recurring</option>
                </select>
              </div>
            </div>

            {/* Room Specs */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Square Feet
                </label>
                <input
                  type="number"
                  value={squareFootage}
                  onChange={(e) => setSquareFootage(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Bedrooms
                </label>
                <select
                  value={bedrooms}
                  onChange={(e) => setBedrooms(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm font-semibold"
                >
                  {[0, 1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>{n} Bed</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Bathrooms
                </label>
                <select
                  value={bathrooms}
                  onChange={(e) => setBathrooms(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm font-semibold"
                >
                  {[1, 1.5, 2, 2.5, 3, 3.5, 4].map((n) => (
                    <option key={n} value={n}>{n} Bath</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date Selection */}
            <div>
              <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <CalendarIcon className="w-4 h-4 text-amber-600" />
                <span>Select Cleaning Date</span>
              </label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-amber-500 font-semibold text-sm"
              />
            </div>

            {/* Time Slots */}
            <div>
              <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Available Time Slots for {selectedDate}</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  '08:00 AM - 11:00 AM',
                  '11:30 AM - 02:30 PM',
                  '03:00 PM - 06:00 PM',
                ].map((timeRange) => {
                  const match = slotsForDate.find((s) => s.timeRange === timeRange);
                  const isBlocked = match?.isBlocked;
                  const isFullyBooked = match && match.bookedCount >= match.capacity;

                  return (
                    <button
                      key={timeRange}
                      type="button"
                      disabled={isBlocked || isFullyBooked}
                      onClick={() => setSelectedSlot(timeRange)}
                      className={`p-3 rounded-xl border text-center text-xs font-bold transition-all ${
                        selectedSlot === timeRange
                          ? 'border-amber-500 bg-amber-500 text-stone-950 shadow-sm'
                          : isBlocked || isFullyBooked
                          ? 'border-stone-200 bg-stone-100 text-stone-400 line-through cursor-not-allowed'
                          : 'border-stone-200 hover:border-amber-400 bg-white text-stone-800'
                      }`}
                    >
                      <div>{timeRange}</div>
                      <div className="text-[10px] font-normal mt-0.5 opacity-80">
                        {isBlocked ? 'Blocked' : isFullyBooked ? 'Full' : 'Available'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Add-ons detailing */}
            <div>
              <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-2">
                Optional Extra Detailing Add-Ons
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {pricingConfig.addOns.map((addon) => {
                  const isSelected = selectedAddOns.includes(addon.id);
                  return (
                    <button
                      key={addon.id}
                      type="button"
                      onClick={() => toggleAddOn(addon.id)}
                      className={`p-3 rounded-xl border text-left flex items-start justify-between transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold'
                          : 'border-stone-200 hover:border-stone-300 bg-white text-stone-700'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold">{addon.name}</div>
                        <div className="text-[11px] text-stone-500 font-normal">{addon.description}</div>
                      </div>
                      <span className="text-xs font-extrabold text-amber-700 ml-2">
                        +${addon.price}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-3 pt-4 border-t border-stone-200">
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                Service Address & Contact
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Full Name *"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold"
                />
                <input
                  type="tel"
                  required
                  placeholder="Phone Number (SMS Confirmation) *"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="email"
                  required
                  placeholder="Email Address *"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold"
                />
                <input
                  type="text"
                  required
                  placeholder="Property Service Address *"
                  value={propertyAddress}
                  onChange={(e) => setPropertyAddress(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold"
                />
              </div>

              <input
                type="text"
                placeholder="Entry Notes / Lockbox Code / Parking Instructions"
                value={entryNotes}
                onChange={(e) => setEntryNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
              />
            </div>

          </div>

          {/* Right Column: Pricing Summary & Checkout Button */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 bg-stone-900 text-stone-100 rounded-2xl p-6 border-2 border-amber-500/50 space-y-6 shadow-xl">
              
              <div className="border-b border-stone-800 pb-4">
                <div className="text-xs font-mono text-amber-400 uppercase tracking-widest">
                  Live Estimate Summary
                </div>
                <h3 className="text-xl font-serif font-bold text-white mt-1">
                  {category === 'commercial' ? 'Commercial' : 'Residential'} Clean
                </h3>
                <p className="text-xs text-stone-400 capitalize">
                  {cleaningType.replace('-', ' ')} • {selectedDate} ({selectedSlot})
                </p>
              </div>

              {/* Cost Breakdown */}
              <div className="space-y-2 text-xs text-stone-300">
                <div className="flex justify-between">
                  <span>Base Rate + Rooms ({squareFootage} sqft)</span>
                  <span className="font-semibold text-white">
                    ${Math.round((category === 'commercial' ? pricingConfig.baseCommercialPrice : pricingConfig.baseResidentialPrice) + (bedrooms * pricingConfig.pricePerBedroom) + (bathrooms * pricingConfig.pricePerBathroom) + (squareFootage * pricingConfig.pricePerSqFt))}
                  </span>
                </div>

                {selectedAddOns.length > 0 && (
                  <div className="flex justify-between">
                    <span>Extra Detailing Add-ons ({selectedAddOns.length})</span>
                    <span className="font-semibold text-white">
                      +${selectedAddOns.reduce((acc, id) => acc + (pricingConfig.addOns.find(a => a.id === id)?.price || 0), 0)}
                    </span>
                  </div>
                )}

                {frequency !== 'one-time' && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Recurring Frequency Discount</span>
                    <span>Discounted</span>
                  </div>
                )}

                <div className="pt-3 border-t border-stone-800 flex items-baseline justify-between">
                  <div>
                    <span className="text-sm font-bold text-white block">Total Quote</span>
                    <span className="text-[10px] text-stone-400">Includes Supplies & Guarantee</span>
                  </div>
                  <span className="text-3xl font-extrabold text-amber-400">
                    ${totalPrice}
                  </span>
                </div>
              </div>

              <div className="bg-stone-800 p-3 rounded-xl border border-stone-700 text-xs text-stone-300 space-y-1">
                <div className="flex justify-between text-stone-200">
                  <span>25% Deposit Option to Reserve:</span>
                  <strong className="text-amber-400">${depositAmount}</strong>
                </div>
                <p className="text-[10px] text-stone-400">
                  Pay 25% deposit now or full payment at Stripe checkout.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-base shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all"
              >
                <span>Proceed to Stripe Checkout</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <div className="text-[11px] text-stone-400 text-center flex items-center justify-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Encrypted 256-Bit Stripe Checkout</span>
              </div>

            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
