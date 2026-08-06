import React, { useState, useEffect } from 'react';
import { User, Booking, EstimateRequest, NotificationLog } from '../types';
import { Calendar, FileText, Clock, CheckCircle2, AlertCircle, Phone, Mail, MapPin, Receipt, Shield, Plus, ArrowRight } from 'lucide-react';

interface CustomerPortalProps {
  currentUser: User;
  onOpenBooking: () => void;
  onOpenEstimate: () => void;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({
  currentUser,
  onOpenBooking,
  onOpenEstimate,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'bookings' | 'estimates' | 'notifications'>('bookings');
  
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [myEstimates, setMyEstimates] = useState<EstimateRequest[]>([]);
  const [myNotifs, setMyNotifs] = useState<NotificationLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchCustomerData();
  }, [currentUser]);

  const fetchCustomerData = async () => {
    try {
      setIsLoading(true);
      const userEmailLower = currentUser.email.toLowerCase();

      const [bkRes, estRes, notifRes] = await Promise.all([
        fetch(`/api/bookings?customerEmail=${encodeURIComponent(userEmailLower)}`),
        fetch(`/api/estimates?customerEmail=${encodeURIComponent(userEmailLower)}`),
        fetch('/api/notifications')
      ]);

      const bkData: Booking[] = await bkRes.json();
      const estData: EstimateRequest[] = await estRes.json();
      const notifData: NotificationLog[] = await notifRes.json();

      setMyBookings(bkData);
      setMyEstimates(estData);
      setMyNotifs(
        notifData.filter(n => n.recipient.toLowerCase() === userEmailLower || n.recipient === currentUser.phone)
      );
    } catch (e) {
      console.error('Error fetching customer portal data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto my-8 px-4 sm:px-6 space-y-8">
      
      {/* Customer Header */}
      <div className="bg-stone-900 text-stone-100 rounded-2xl p-6 sm:p-8 border-2 border-amber-500/50 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 bg-amber-500/20 text-amber-300 font-mono text-xs px-2.5 py-0.5 rounded border border-amber-400/30">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>Whistle Stop Account Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            Welcome Back, {currentUser.name}!
          </h1>
          <p className="text-stone-400 text-xs sm:text-sm">
            Email: {currentUser.email} • Phone: {currentUser.phone}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={onOpenEstimate}
            className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-600 text-stone-100 text-xs font-bold flex items-center space-x-1.5"
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span>Request Free Estimate</span>
          </button>

          <button
            onClick={onOpenBooking}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-extrabold flex items-center space-x-1.5 shadow-md"
          >
            <Calendar className="w-4 h-4" />
            <span>Book New Cleaning</span>
          </button>
        </div>
      </div>

      {/* Sub-Tabs */}
      <div className="flex border-b border-stone-300 space-x-6 text-sm font-bold">
        <button
          onClick={() => setActiveSubTab('bookings')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition-colors ${
            activeSubTab === 'bookings'
              ? 'border-amber-500 text-stone-950 font-extrabold'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>My Scheduled Bookings ({myBookings.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('estimates')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition-colors ${
            activeSubTab === 'estimates'
              ? 'border-amber-500 text-stone-950 font-extrabold'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Estimate Requests & Quotes ({myEstimates.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('notifications')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition-colors ${
            activeSubTab === 'notifications'
              ? 'border-amber-500 text-stone-950 font-extrabold'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>SMS & Email Alerts ({myNotifs.length})</span>
        </button>
      </div>

      {/* SUB-TAB 1: BOOKINGS */}
      {activeSubTab === 'bookings' && (
        <div className="space-y-4">
          {myBookings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center space-y-4">
              <Calendar className="w-12 h-12 text-stone-300 mx-auto" />
              <h3 className="text-lg font-bold text-stone-800">No Scheduled Cleanings Yet</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Ready for a fresh, sparkling clean home or business space? Book your preferred time slot online.
              </p>
              <button
                onClick={onOpenBooking}
                className="px-5 py-2.5 bg-amber-500 text-stone-950 font-bold text-xs rounded-xl shadow-md"
              >
                Book Appointment
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myBookings.map((bk) => (
                <div
                  key={bk.id}
                  className="bg-white rounded-2xl border border-stone-300 shadow-md p-6 space-y-4 relative hover:border-amber-500 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase bg-stone-100 text-stone-700 px-2 py-0.5 rounded">
                        {bk.id}
                      </span>
                      <h3 className="text-lg font-serif font-bold text-stone-900 capitalize mt-1">
                        {bk.category} • {bk.cleaningType.replace('-', ' ')}
                      </h3>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                      bk.bookingStatus === 'confirmed'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-amber-50 text-amber-800 border-amber-300'
                    }`}>
                      {bk.bookingStatus.toUpperCase()}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-stone-700 bg-stone-50 p-3 rounded-xl border border-stone-200">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-amber-600" />
                      <span><strong>Date:</strong> {bk.date} ({bk.timeSlot})</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-amber-600" />
                      <span><strong>Address:</strong> {bk.propertyAddress}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Receipt className="w-4 h-4 text-amber-600" />
                      <span><strong>Payment:</strong> ${bk.totalPrice} ({bk.paymentStatus.replace('_', ' ')})</span>
                    </div>
                  </div>

                  {bk.selectedAddOns.length > 0 && (
                    <div className="text-xs text-stone-600">
                      <strong>Included Add-ons:</strong> {bk.selectedAddOns.join(', ')}
                    </div>
                  )}

                  <div className="pt-2 text-[11px] text-emerald-700 flex items-center space-x-1 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Whistle Stop Professional Team Assigned</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: ESTIMATES */}
      {activeSubTab === 'estimates' && (
        <div className="space-y-4">
          {myEstimates.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center space-y-4">
              <FileText className="w-12 h-12 text-stone-300 mx-auto" />
              <h3 className="text-lg font-bold text-stone-800">No Free Estimate Requests Found</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Fill out our quick questionnaire to receive an official custom quote within 24 hours.
              </p>
              <button
                onClick={onOpenEstimate}
                className="px-5 py-2.5 bg-amber-500 text-stone-950 font-bold text-xs rounded-xl shadow-md"
              >
                Submit Questionnaire
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {myEstimates.map((est) => (
                <div
                  key={est.id}
                  className="bg-white rounded-2xl border border-stone-300 p-6 shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-amber-700">{est.id}</span>
                        <span className="text-xs font-bold uppercase text-stone-500">• {est.category}</span>
                      </div>
                      <h3 className="text-base font-serif font-bold text-stone-900 capitalize">
                        {est.cleaningType.replace('-', ' ')}
                      </h3>
                    </div>

                    <span className={`text-xs font-bold px-3 py-1 rounded-full border self-start ${
                      est.status === 'quoted'
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-blue-50 text-blue-800 border-blue-200'
                    }`}>
                      STATUS: {est.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-stone-700">
                    <div>
                      <span className="text-stone-500 block">Property Specs</span>
                      <strong>{est.squareFootage} sq ft • {est.bedrooms} Beds / {est.bathrooms} Baths</strong>
                    </div>

                    <div>
                      <span className="text-stone-500 block">Uploaded Photos</span>
                      <strong>{est.photos.length} Attached</strong>
                    </div>

                    <div>
                      <span className="text-stone-500 block">Estimated Price</span>
                      <strong className="text-emerald-700 text-sm">${est.estimatedPrice || 'Calculating...'}</strong>
                    </div>
                  </div>

                  {est.adminNotes && (
                    <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-900">
                      <strong>Admin Quote Note:</strong> {est.adminNotes}
                    </div>
                  )}

                  {est.status === 'quoted' && (
                    <button
                      onClick={onOpenBooking}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl shadow-sm flex items-center space-x-1"
                    >
                      <span>Lock In & Book Slot Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: NOTIFICATIONS */}
      {activeSubTab === 'notifications' && (
        <div className="bg-white rounded-2xl border border-stone-300 p-6 space-y-4">
          <h3 className="text-base font-bold text-stone-900">
            SMS & Email Dispatch History
          </h3>
          {myNotifs.length === 0 ? (
            <p className="text-xs text-stone-500">No notification logs recorded for this phone or email.</p>
          ) : (
            <div className="space-y-3">
              {myNotifs.map((n) => (
                <div key={n.id} className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1">
                  <div className="flex justify-between font-bold text-stone-800">
                    <span>[{n.channel}] {n.subject}</span>
                    <span className="text-[10px] text-stone-500 font-mono">{new Date(n.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-stone-600">{n.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
