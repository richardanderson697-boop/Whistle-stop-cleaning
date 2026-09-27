import React, { useState, useEffect } from 'react';
import { PricingConfig, EstimateRequest, Booking, TimeSlot, NotificationLog, AddOnOption, SupplyItem, StaffMember, StripeConfigStatus } from '../types';
import { ShieldCheck, DollarSign, FileText, Calendar, Clock, Image as ImageIcon, Send, Save, CheckCircle2, AlertCircle, RefreshCw, Lock, Trash2, Plus, Eye, X, Package, Users, PieChart, CreditCard, HelpCircle, Copy, Check, UserPlus, BarChart3, Wrench, Sparkles, Layers, Sliders, ChevronRight, TrendingUp } from 'lucide-react';
import { FinancialReconciliationView } from './FinancialReconciliationView';

interface AdminPortalProps {
  onPricingUpdated: (newPricing: PricingConfig) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onPricingUpdated }) => {
  const [activeTab, setActiveTab] = useState<'financial_forecast' | 'pricing' | 'supplies' | 'cost_analysis' | 'dispatch' | 'estimates' | 'bookings' | 'stripe_setup' | 'notifs'>('financial_forecast');

  // Server Data Stores
  const [pricing, setPricing] = useState<PricingConfig | null>(null);
  const [estimates, setEstimates] = useState<EstimateRequest[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [notifs, setNotifs] = useState<NotificationLog[]>([]);
  const [supplies, setSupplies] = useState<SupplyItem[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [costData, setCostData] = useState<any>(null);
  const [stripeStatus, setStripeStatus] = useState<StripeConfigStatus | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSavingPricing, setIsSavingPricing] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string>('');

  // Selected Estimate Quote Modal
  const [selectedEst, setSelectedEst] = useState<EstimateRequest | null>(null);
  const [quotePrice, setQuotePrice] = useState<number>(0);
  const [quoteNotes, setQuoteNotes] = useState<string>('');
  const [isSendingQuote, setIsSendingQuote] = useState<boolean>(false);

  // Expanded Photo View
  const [expandedPhoto, setExpandedPhoto] = useState<string | null>(null);

  // New Add-On State
  const [newAddOnName, setNewAddOnName] = useState<string>('');
  const [newAddOnDesc, setNewAddOnDesc] = useState<string>('');
  const [newAddOnPrice, setNewAddOnPrice] = useState<number>(35);

  // New Supply Item State
  const [newSupplyName, setNewSupplyName] = useState<string>('');
  const [newSupplyCategory, setNewSupplyCategory] = useState<'equipment' | 'chemical' | 'disposable' | 'towel_cloth'>('chemical');
  const [newSupplyQty, setNewSupplyQty] = useState<number>(10);
  const [newSupplyUnit, setNewSupplyUnit] = useState<string>('gallons');
  const [newSupplyCost, setNewSupplyCost] = useState<number>(25);
  const [newSupplyUses, setNewSupplyUses] = useState<number>(15);

  // New Staff Member State
  const [newStaffName, setNewStaffName] = useState<string>('');
  const [newStaffRole, setNewStaffRole] = useState<'lead_cleaner' | 'cleaner' | 'commercial_specialist'>('cleaner');
  const [newStaffPhone, setNewStaffPhone] = useState<string>('');
  const [newStaffEmail, setNewStaffEmail] = useState<string>('');

  // Stripe Key Entry State
  const [stripeSecretKeyInput, setStripeSecretKeyInput] = useState<string>('');
  const [stripePubVal, setStripePubVal] = useState<string>('');
  const [isSavingStripeKeys, setIsSavingStripeKeys] = useState<boolean>(false);
  const [stripeKeyMsg, setStripeKeyMsg] = useState<string>('');
  const [copiedHandoff, setCopiedHandoff] = useState<boolean>(false);

  // Schedule Filter Date
  const [selectedScheduleDate, setSelectedScheduleDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Staff Assignment Modal State
  const [assigningBooking, setAssigningBooking] = useState<Booking | null>(null);
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);

  useEffect(() => {
    fetchAllAdminData();
  }, []);

  const fetchAllAdminData = async () => {
    try {
      setIsLoading(true);
      const [prRes, estRes, bkRes, slRes, nfRes, stRes, supRes, stfRes, costRes, strpRes] = await Promise.all([
        fetch('/api/pricing'),
        fetch('/api/estimates'),
        fetch('/api/bookings'),
        fetch('/api/availability'),
        fetch('/api/notifications'),
        fetch('/api/admin/stats'),
        fetch('/api/supplies'),
        fetch('/api/staff'),
        fetch('/api/admin/cost-analysis'),
        fetch('/api/admin/stripe-status'),
      ]);

      setPricing(await prRes.json());
      setEstimates(await estRes.json());
      setBookings(await bkRes.json());
      setSlots(await slRes.json());
      setNotifs(await nfRes.json());
      setStats(await stRes.json());
      setSupplies(await supRes.json());
      setStaff(await stfRes.json());
      setCostData(await costRes.json());
      setStripeStatus(await strpRes.json());
    } catch (e) {
      console.error('Error fetching admin data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Save Pricing Settings
  const handleSavePricing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pricing) return;

    setIsSavingPricing(true);
    setSaveSuccessMsg('');

    try {
      const res = await fetch('/api/admin/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pricing),
      });

      const data = await res.json();
      setIsSavingPricing(false);

      if (res.ok && data.success) {
        setSaveSuccessMsg('Price settings updated and live across booking calculator!');
        onPricingUpdated(data.pricing);
        setTimeout(() => setSaveSuccessMsg(''), 3000);
      } else {
        setSaveSuccessMsg(data.error || 'Failed to save pricing configuration');
        setTimeout(() => setSaveSuccessMsg(''), 4000);
      }
    } catch (e) {
      setIsSavingPricing(false);
      setSaveSuccessMsg('Error updating pricing configuration');
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    }
  };

  // Add Custom Add-On
  const handleAddAddOn = () => {
    if (!pricing || !newAddOnName) return;
    const newAddOn: AddOnOption = {
      id: `addon-${Date.now()}`,
      name: newAddOnName,
      description: newAddOnDesc || 'Custom detailing option',
      price: newAddOnPrice || 35,
    };

    setPricing({
      ...pricing,
      addOns: [...pricing.addOns, newAddOn],
    });

    setNewAddOnName('');
    setNewAddOnDesc('');
  };

  // Remove Add-On
  const handleRemoveAddOn = (id: string) => {
    if (!pricing) return;
    setPricing({
      ...pricing,
      addOns: pricing.addOns.filter(a => a.id !== id),
    });
  };

  // Save New Supply Item
  const handleAddSupply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplyName) return;

    try {
      const res = await fetch('/api/admin/supplies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSupplyName,
          category: newSupplyCategory,
          quantityInStock: newSupplyQty,
          unit: newSupplyUnit,
          costPerUnit: newSupplyCost,
          estimatedUsesPerUnit: newSupplyUses,
          reorderThreshold: Math.max(1, Math.floor(newSupplyQty * 0.25)),
        }),
      });

      if (res.ok) {
        setNewSupplyName('');
        fetchAllAdminData();
      }
    } catch (e) {
      console.error('Error adding supply:', e);
    }
  };

  // Delete Supply Item
  const handleDeleteSupply = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/supplies/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchAllAdminData();
      }
    } catch (e) {
      console.error('Error deleting supply item:', e);
    }
  };

  // Save New Staff Member
  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName) return;

    try {
      const res = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newStaffName,
          role: newStaffRole,
          phone: newStaffPhone,
          email: newStaffEmail,
          status: 'active',
        }),
      });

      if (res.ok) {
        setNewStaffName('');
        setNewStaffPhone('');
        setNewStaffEmail('');
        fetchAllAdminData();
      }
    } catch (e) {
      console.error('Error adding staff:', e);
    }
  };

  // Assign Personnel to Booking
  const handleSaveStaffAssignment = async () => {
    if (!assigningBooking) return;

    try {
      const res = await fetch('/api/admin/bookings/assign-staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: assigningBooking.id,
          staffIds: selectedStaffIds,
        }),
      });

      if (res.ok) {
        setAssigningBooking(null);
        fetchAllAdminData();
      }
    } catch (e) {
      console.error('Error assigning staff:', e);
    }
  };

  // Save Stripe API Keys from Admin Dashboard
  const handleSaveStripeKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingStripeKeys(true);
    setStripeKeyMsg('');

    try {
      const res = await fetch('/api/admin/stripe-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secretKey: stripeSecretKeyInput,
          publishableKey: stripePubVal,
        }),
      });

      const data = await res.json();
      setIsSavingStripeKeys(false);

      if (res.ok && data.success) {
        setStripeKeyMsg('Stripe API keys applied successfully! Live processing is now active.');
        setStripeStatus(data.status);
        setStripeSecretKeyInput('');
        setStripePubVal('');
        setTimeout(() => setStripeKeyMsg(''), 4000);
      } else {
        setStripeKeyMsg('Failed to update Stripe keys. Please check format.');
        setTimeout(() => setStripeKeyMsg(''), 4000);
      }
    } catch (e) {
      setIsSavingStripeKeys(false);
      setStripeKeyMsg('Error saving Stripe keys');
      setTimeout(() => setStripeKeyMsg(''), 4000);
    }
  };

  // Send Custom Quote to Customer
  const handleSendQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEst) return;

    setIsSendingQuote(true);

    try {
      const res = await fetch(`/api/estimates/${selectedEst.id}/quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quotedPrice: quotePrice,
          adminNotes: quoteNotes,
        }),
      });

      const data = await res.json();
      setIsSendingQuote(false);

      if (res.ok && data.success) {
        setSelectedEst(null);
        fetchAllAdminData();
      } else {
        console.error(data.error || 'Failed to send quote.');
      }
    } catch (e) {
      setIsSendingQuote(false);
      console.error('Error sending quote:', e);
    }
  };

  // Toggle Time Slot Block
  const handleToggleSlotBlock = async (slotId: string) => {
    try {
      const res = await fetch('/api/slots/toggle-block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotId }),
      });
      if (res.ok) {
        fetchAllAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handoff message for project owner
  const handoffText = `Whistle Stop Cleaning - Admin Setup & Stripe Keys Handoff Guide:
1. Log in to Stripe at https://dashboard.stripe.com
2. Go to Developers -> API Keys.
3. Copy your Secret Key (starts with sk_live_ or sk_test_) and Publishable Key (starts with pk_live_ or pk_test_).
4. Open the Whistle Stop Admin Portal -> 'Stripe & Key Setup' tab and paste your keys into the boxes.
5. If deploying to Cloud Run / Vercel / Netlify, set environment variables:
   STRIPE_SECRET_KEY=sk_...
   VITE_STRIPE_PUBLISHABLE_KEY=pk_...`;

  const handleCopyHandoff = () => {
    navigator.clipboard.writeText(handoffText);
    setCopiedHandoff(true);
    setTimeout(() => setCopiedHandoff(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto my-8 px-4 sm:px-6 space-y-8">
      
      {/* Admin Header */}
      <div className="bg-stone-900 text-stone-100 rounded-2xl p-6 sm:p-8 border-2 border-amber-500 shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 bg-amber-500/20 text-amber-300 font-mono text-xs px-2.5 py-0.5 rounded border border-amber-400/30">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Administrator Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            Whistle Stop Business Dashboard
          </h1>
          <p className="text-stone-400 text-xs sm:text-sm">
            Administrator: <strong className="text-amber-400">admin@whistlestopcleaning.com</strong> • Full Operational Access
          </p>
        </div>

        {/* Top Operational Metrics */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-stone-900 text-xs font-bold w-full lg:w-auto">
            <div className="bg-amber-400 p-3 rounded-xl shadow-md text-center">
              <div className="text-[10px] text-stone-800 uppercase tracking-wider">Total Revenue</div>
              <div className="text-lg sm:text-xl font-extrabold">${stats.totalRevenue}</div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-stone-200 text-center">
              <div className="text-[10px] text-stone-500 uppercase tracking-wider">Cost / Room</div>
              <div className="text-lg sm:text-xl font-extrabold text-amber-700">
                ${costData ? costData.perRoomSupplyCost : '4.25'}
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-stone-200 text-center">
              <div className="text-[10px] text-stone-500 uppercase tracking-wider">Pending Quotes</div>
              <div className="text-lg sm:text-xl font-extrabold text-blue-700">{stats.pendingEstimates}</div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-stone-200 text-center">
              <div className="text-[10px] text-stone-500 uppercase tracking-wider">Total Bookings</div>
              <div className="text-lg sm:text-xl font-extrabold text-emerald-700">{stats.totalBookings}</div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto border-b border-stone-300 space-x-4 text-xs font-bold no-scrollbar pb-1">
        <button
          onClick={() => setActiveTab('financial_forecast')}
          className={`pb-2.5 flex items-center space-x-1.5 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'financial_forecast'
              ? 'border-amber-500 text-stone-950 font-extrabold bg-amber-500/10 px-2 py-0.5 rounded-t-lg'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-amber-600" />
          <span>Financial Reconciliation & Forecast</span>
        </button>

        <button
          onClick={() => setActiveTab('pricing')}
          className={`pb-2.5 flex items-center space-x-1.5 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'pricing'
              ? 'border-amber-500 text-stone-950 font-extrabold'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Service Pricing</span>
        </button>

        <button
          onClick={() => setActiveTab('supplies')}
          className={`pb-2.5 flex items-center space-x-1.5 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'supplies'
              ? 'border-amber-500 text-stone-950 font-extrabold'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Supplies & Inventory ({supplies.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('cost_analysis')}
          className={`pb-2.5 flex items-center space-x-1.5 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'cost_analysis'
              ? 'border-amber-500 text-stone-950 font-extrabold'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Per-Room Cost & Margins</span>
        </button>

        <button
          onClick={() => setActiveTab('dispatch')}
          className={`pb-2.5 flex items-center space-x-1.5 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'dispatch'
              ? 'border-amber-500 text-stone-950 font-extrabold'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Daily Dispatch & Staff</span>
        </button>

        <button
          onClick={() => setActiveTab('estimates')}
          className={`pb-2.5 flex items-center space-x-1.5 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'estimates'
              ? 'border-amber-500 text-stone-950 font-extrabold'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Questionnaires ({estimates.filter(e => e.status === 'pending').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('bookings')}
          className={`pb-2.5 flex items-center space-x-1.5 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'bookings'
              ? 'border-amber-500 text-stone-950 font-extrabold'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Bookings & Ledger ({bookings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('stripe_setup')}
          className={`pb-2.5 flex items-center space-x-1.5 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'stripe_setup'
              ? 'border-amber-500 text-stone-950 font-extrabold'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <CreditCard className="w-4 h-4 text-amber-600" />
          <span>Stripe Key Setup</span>
        </button>

        <button
          onClick={() => setActiveTab('notifs')}
          className={`pb-2.5 flex items-center space-x-1.5 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'notifs'
              ? 'border-amber-500 text-stone-950 font-extrabold'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Dispatch Audit Log</span>
        </button>
      </div>

      {/* TAB 0: FINANCIAL RECONCILIATION & FORECAST */}
      {activeTab === 'financial_forecast' && (
        <FinancialReconciliationView
          bookings={bookings}
          pricing={pricing}
          staff={staff}
          onRefreshData={fetchAllAdminData}
          onAssignStaffClick={(bk) => {
            setAssigningBooking(bk);
            setSelectedStaffIds(bk.assignedStaffIds || []);
          }}
        />
      )}

      {/* TAB 1: PRICING SETTINGS */}
      {activeTab === 'pricing' && pricing && (
        <form onSubmit={handleSavePricing} className="bg-white rounded-2xl border border-stone-300 p-6 sm:p-8 space-y-8 shadow-sm">
          <div className="flex items-center justify-between border-b border-stone-200 pb-4">
            <div>
              <h2 className="text-xl font-serif font-bold text-stone-900">
                Service Pricing & Add-On Catalog Configuration
              </h2>
              <p className="text-xs text-stone-500">
                Adjust baseline rates, square footage pricing, room fees, multipliers, and add-ons. Updated rates calculate live during customer bookings.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSavingPricing}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-xs shadow-md flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSavingPricing ? 'Saving...' : 'Save Price Changes'}</span>
            </button>
          </div>

          {saveSuccessMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-xl font-bold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {/* Base Rates */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
              1. Base Service Rates
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Base Residential Clean ($)
                </label>
                <input
                  type="number"
                  value={pricing.baseResidentialPrice}
                  onChange={(e) => setPricing({ ...pricing, baseResidentialPrice: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 font-semibold text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Base Commercial Clean ($)
                </label>
                <input
                  type="number"
                  value={pricing.baseCommercialPrice}
                  onChange={(e) => setPricing({ ...pricing, baseCommercialPrice: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 font-semibold text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Rate Per Sq. Ft ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={pricing.pricePerSqFt}
                  onChange={(e) => setPricing({ ...pricing, pricePerSqFt: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 font-semibold text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Per Bedroom / Bathroom ($)
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={pricing.pricePerBedroom}
                    onChange={(e) => setPricing({ ...pricing, pricePerBedroom: Number(e.target.value) })}
                    className="w-1/2 px-3 py-2 rounded-xl border border-stone-300 font-semibold text-xs"
                    placeholder="Bed"
                  />
                  <input
                    type="number"
                    value={pricing.pricePerBathroom}
                    onChange={(e) => setPricing({ ...pricing, pricePerBathroom: Number(e.target.value) })}
                    className="w-1/2 px-3 py-2 rounded-xl border border-stone-300 font-semibold text-xs"
                    placeholder="Bath"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Service Multipliers */}
          <div className="space-y-4 pt-4 border-t border-stone-200">
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
              2. Special Service Multipliers
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Move In / Move Out Multiplier
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={pricing.moveInOutMultiplier}
                  onChange={(e) => setPricing({ ...pricing, moveInOutMultiplier: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 font-semibold text-sm"
                />
                <span className="text-[10px] text-stone-500">e.g. 1.3 = 30% premium</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Construction Cleanup Multiplier
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={pricing.constructionMultiplier}
                  onChange={(e) => setPricing({ ...pricing, constructionMultiplier: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 font-semibold text-sm"
                />
                <span className="text-[10px] text-stone-500">e.g. 1.5 = 50% premium</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Deep Cleaning Multiplier
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={pricing.deepCleanMultiplier}
                  onChange={(e) => setPricing({ ...pricing, deepCleanMultiplier: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 font-semibold text-sm"
                />
                <span className="text-[10px] text-stone-500">e.g. 1.4 = 40% premium</span>
              </div>
            </div>
          </div>

          {/* Custom Add-Ons */}
          <div className="space-y-4 pt-4 border-t border-stone-200">
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
              3. Extra Detailing Options & Add-Ons Catalog
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pricing.addOns.map((addon) => (
                <div key={addon.id} className="p-3 rounded-xl border border-stone-200 bg-stone-50 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-stone-900">{addon.name}</div>
                    <div className="text-[11px] text-stone-500">{addon.description}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-extrabold text-amber-700">${addon.price}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAddOn(addon.id)}
                      className="p-1 text-stone-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Add-On Form */}
            <div className="bg-stone-100 p-4 rounded-2xl border border-stone-200 flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                placeholder="Add-on Name (e.g. Balcony Pressure Wash)"
                value={newAddOnName}
                onChange={(e) => setNewAddOnName(e.target.value)}
                className="w-full sm:w-1/3 px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold"
              />
              <input
                type="text"
                placeholder="Description"
                value={newAddOnDesc}
                onChange={(e) => setNewAddOnDesc(e.target.value)}
                className="w-full sm:w-1/3 px-3 py-2 rounded-xl border border-stone-300 text-xs"
              />
              <input
                type="number"
                placeholder="Price ($)"
                value={newAddOnPrice}
                onChange={(e) => setNewAddOnPrice(Number(e.target.value))}
                className="w-full sm:w-1/6 px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold"
              />
              <button
                type="button"
                onClick={handleAddAddOn}
                className="w-full sm:w-auto px-4 py-2 bg-stone-900 hover:bg-stone-800 text-amber-400 font-bold text-xs rounded-xl flex items-center justify-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: SUPPLIES & EQUIPMENT INVENTORY */}
      {activeTab === 'supplies' && (
        <div className="bg-white rounded-2xl border border-stone-300 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
            <div>
              <h2 className="text-xl font-serif font-bold text-stone-900">
                Job Supplies & Equipment Inventory Management
              </h2>
              <p className="text-xs text-stone-500">
                Track cleaning supplies, HEPA vacuums, carpet extractors, towels, disinfectants, and reorder alerts.
              </p>
            </div>

            <div className="text-xs font-bold bg-amber-50 border border-amber-300 px-3 py-2 rounded-xl text-amber-900">
              Total Active Inventory Items: {supplies.length}
            </div>
          </div>

          {/* Add New Supply Item Form */}
          <form onSubmit={handleAddSupply} className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3">
            <div className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center space-x-1.5">
              <Plus className="w-4 h-4 text-amber-600" />
              <span>Log New Cleaning Supply or Equipment Item</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="col-span-1 sm:col-span-2">
                <input
                  type="text"
                  required
                  placeholder="Supply Name (e.g. Commercial HEPA Vacuum)"
                  value={newSupplyName}
                  onChange={(e) => setNewSupplyName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold"
                />
              </div>

              <div>
                <select
                  value={newSupplyCategory}
                  onChange={(e: any) => setNewSupplyCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold bg-white"
                >
                  <option value="equipment">Equipment</option>
                  <option value="chemical">Chemical / Solutions</option>
                  <option value="towel_cloth">Towels / Mops</option>
                  <option value="disposable">Disposable / Gloves</option>
                </select>
              </div>

              <div>
                <input
                  type="number"
                  placeholder="In Stock Qty"
                  value={newSupplyQty}
                  onChange={(e) => setNewSupplyQty(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold"
                />
              </div>

              <div>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Cost Per Unit ($)"
                  value={newSupplyCost}
                  onChange={(e) => setNewSupplyCost(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold text-emerald-700"
                />
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl shadow-sm"
                >
                  Save Item
                </button>
              </div>
            </div>
          </form>

          {/* Supplies Inventory Grid Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-100 text-stone-700 font-bold uppercase">
                  <th className="p-3">Supply / Equipment Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">In Stock</th>
                  <th className="p-3">Cost / Unit</th>
                  <th className="p-3">Uses / Unit</th>
                  <th className="p-3">Supply Cost / Room</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {supplies.map((item) => {
                  const isLow = item.quantityInStock <= item.reorderThreshold;
                  const perRoom = Number((item.costPerUnit / (item.estimatedUsesPerUnit || 10)).toFixed(2));

                  return (
                    <tr key={item.id} className="hover:bg-stone-50 transition-colors">
                      <td className="p-3 font-bold text-stone-900">
                        {item.name}
                        {isLow && (
                          <span className="ml-2 inline-flex items-center space-x-1 text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-bold">
                            <AlertCircle className="w-3 h-3" />
                            <span>Low Stock Reorder!</span>
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-stone-600 capitalize">
                        {item.category.replace('_', ' ')}
                      </td>
                      <td className="p-3 font-extrabold text-stone-800">
                        {item.quantityInStock} {item.unit}
                      </td>
                      <td className="p-3 text-emerald-700 font-bold">
                        ${item.costPerUnit}
                      </td>
                      <td className="p-3 text-stone-600">
                        ~{item.estimatedUsesPerUnit} rooms
                      </td>
                      <td className="p-3 text-amber-800 font-bold">
                        ${perRoom} / room
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleDeleteSupply(item.id)}
                          className="p-1.5 text-stone-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PER-ROOM AVERAGE COST & PROFIT MARGIN ANALYSIS */}
      {activeTab === 'cost_analysis' && costData && (
        <div className="bg-white rounded-2xl border border-stone-300 p-6 sm:p-8 space-y-6 shadow-sm">
          <div>
            <h2 className="text-xl font-serif font-bold text-stone-900">
              Cleaning Supply Cost Analysis & Per-Room Profitability Engine
            </h2>
            <p className="text-xs text-stone-500">
              Supply prices are automatically divided over total rooms cleaned to determine exact per-room cost overhead and profit margins per job.
            </p>
          </div>

          {/* Key Cost Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-amber-500 text-stone-950 rounded-2xl shadow-md border border-amber-600">
              <div className="text-xs font-bold uppercase tracking-wider text-stone-800">Supply Overhead / Room</div>
              <div className="text-3xl font-extrabold mt-1">${costData.perRoomSupplyCost}</div>
              <div className="text-[11px] font-medium text-stone-800 mt-1">
                Amortized cost per room cleaned
              </div>
            </div>

            <div className="p-4 bg-stone-900 text-stone-100 rounded-2xl shadow-md border border-stone-800">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-400">Total Rooms Cleaned</div>
              <div className="text-3xl font-extrabold mt-1">{costData.totalRoomsCleaned} Rooms</div>
              <div className="text-[11px] font-medium text-stone-400 mt-1">
                Across all scheduled appointments
              </div>
            </div>

            <div className="p-4 bg-emerald-50 text-emerald-950 rounded-2xl border border-emerald-200">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">Average Revenue / Room</div>
              <div className="text-3xl font-extrabold mt-1 text-emerald-800">${costData.avgRevenuePerRoom}</div>
              <div className="text-[11px] font-medium text-emerald-700 mt-1">
                Price charged per room clean
              </div>
            </div>

            <div className="p-4 bg-blue-50 text-blue-950 rounded-2xl border border-blue-200">
              <div className="text-xs font-bold uppercase tracking-wider text-blue-700">Net Profit / Room</div>
              <div className="text-3xl font-extrabold mt-1 text-blue-800">${costData.avgProfitPerRoom}</div>
              <div className="text-[11px] font-medium text-blue-700 mt-1">
                Revenue minus supply cost
              </div>
            </div>
          </div>

          {/* Job Profit Breakdown Table */}
          <div className="space-y-3 pt-4 border-t border-stone-200">
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
              Per-Job Revenue vs Supply Overhead Breakdown
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-100 text-stone-700 font-bold uppercase">
                    <th className="p-3">Booking Reference</th>
                    <th className="p-3">Customer & Service</th>
                    <th className="p-3 text-center">Rooms Cleaned</th>
                    <th className="p-3 text-right">Charged Price</th>
                    <th className="p-3 text-right">Supply Cost</th>
                    <th className="p-3 text-right">Net Profit</th>
                    <th className="p-3 text-right">Margin %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {costData.jobAnalysis.map((job: any) => (
                    <tr key={job.bookingId} className="hover:bg-stone-50">
                      <td className="p-3 font-mono font-bold text-amber-800">{job.bookingId}</td>
                      <td className="p-3">
                        <div className="font-bold text-stone-900">{job.customerName}</div>
                        <div className="text-[10px] text-stone-500 capitalize">{job.cleaningType.replace('-', ' ')}</div>
                      </td>
                      <td className="p-3 text-center font-extrabold text-stone-800">{job.roomsCleaned} Beds/Baths</td>
                      <td className="p-3 text-right font-bold text-stone-900">${job.totalPriceCharged}</td>
                      <td className="p-3 text-right font-bold text-rose-700">-${job.estimatedSupplyCost}</td>
                      <td className="p-3 text-right font-extrabold text-emerald-700">${job.netProfit}</td>
                      <td className="p-3 text-right font-bold text-amber-800">{job.marginPercent}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DAILY DISPATCH & STAFF MANAGEMENT */}
      {activeTab === 'dispatch' && (
        <div className="bg-white rounded-2xl border border-stone-300 p-6 sm:p-8 space-y-6 shadow-sm">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
            <div>
              <h2 className="text-xl font-serif font-bold text-stone-900">
                Daily Cleaning Schedule & Personnel Dispatch
              </h2>
              <p className="text-xs text-stone-500">
                Select a date to inspect active appointments and assign cleaning staff to jobs.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-stone-700">Filter Date:</span>
              <input
                type="date"
                value={selectedScheduleDate}
                onChange={(e) => setSelectedScheduleDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-stone-300 text-xs font-bold bg-stone-50"
              />
            </div>
          </div>

          {/* Roster & Add Staff */}
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3">
            <div className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center space-x-1.5">
              <Users className="w-4 h-4 text-amber-600" />
              <span>Whistle Stop Staff Roster ({staff.length})</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {staff.map((m) => (
                <div key={m.id} className="bg-white px-3 py-1.5 rounded-xl border border-stone-300 text-xs flex items-center space-x-2">
                  <span className="font-bold text-stone-900">{m.name}</span>
                  <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-mono capitalize">{m.role.replace('_', ' ')}</span>
                </div>
              ))}
            </div>

            {/* Add Staff Member Form */}
            <form onSubmit={handleAddStaff} className="pt-2 border-t border-stone-200 flex flex-col sm:flex-row items-center gap-2">
              <input
                type="text"
                required
                placeholder="Staff Member Name"
                value={newStaffName}
                onChange={(e) => setNewStaffName(e.target.value)}
                className="w-full sm:w-1/3 px-3 py-1.5 rounded-xl border border-stone-300 text-xs font-semibold"
              />
              <select
                value={newStaffRole}
                onChange={(e: any) => setNewStaffRole(e.target.value)}
                className="w-full sm:w-1/4 px-3 py-1.5 rounded-xl border border-stone-300 text-xs font-semibold bg-white"
              >
                <option value="lead_cleaner">Lead Cleaner</option>
                <option value="cleaner">Cleaner</option>
                <option value="commercial_specialist">Commercial Specialist</option>
              </select>
              <input
                type="text"
                placeholder="Phone"
                value={newStaffPhone}
                onChange={(e) => setNewStaffPhone(e.target.value)}
                className="w-full sm:w-1/4 px-3 py-1.5 rounded-xl border border-stone-300 text-xs"
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-1.5 bg-stone-900 text-amber-400 font-bold text-xs rounded-xl flex items-center justify-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Staff</span>
              </button>
            </form>
          </div>

          {/* Schedule for Selected Date */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
              Appointments Scheduled for {selectedScheduleDate}
            </h3>

            {bookings.filter(b => b.date === selectedScheduleDate).length === 0 ? (
              <div className="p-8 text-center text-xs text-stone-500 border border-dashed rounded-2xl bg-stone-50">
                No bookings scheduled for this date yet.
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.filter(b => b.date === selectedScheduleDate).map((bk) => (
                  <div key={bk.id} className="p-4 bg-stone-50 rounded-2xl border border-stone-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-amber-800">{bk.id}</span>
                        <span className="text-xs font-bold text-stone-900">{bk.timeSlot}</span>
                      </div>
                      <div className="text-sm font-serif font-bold text-stone-900">{bk.customerName} ({bk.customerPhone})</div>
                      <div className="text-xs text-stone-600">{bk.propertyAddress}</div>
                      
                      {bk.assignedStaffNames && bk.assignedStaffNames.length > 0 ? (
                        <div className="text-xs font-bold text-emerald-700 flex items-center space-x-1 pt-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Assigned Cleaners: {bk.assignedStaffNames.join(', ')}</span>
                        </div>
                      ) : (
                        <div className="text-xs text-rose-600 font-bold flex items-center space-x-1 pt-1">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                          <span>Unassigned - Click to assign staff</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setAssigningBooking(bk);
                        setSelectedStaffIds(bk.assignedStaffIds || []);
                      }}
                      className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-amber-400 font-extrabold text-xs rounded-xl shadow-sm self-start sm:self-center"
                    >
                      Assign Staff Members
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: ESTIMATES QUESTIONNAIRES */}
      {activeTab === 'estimates' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-stone-300 p-6 space-y-4">
            <h2 className="text-xl font-serif font-bold text-stone-900">
              Customer Questionnaires & Free Estimate Requests
            </h2>
            <p className="text-xs text-stone-500">
              Review property details and uploaded photos, then dispatch custom quotes to customers via email and SMS.
            </p>

            <div className="space-y-4">
              {estimates.map((est) => (
                <div
                  key={est.id}
                  className="bg-stone-50 rounded-2xl border border-stone-200 p-6 space-y-4 hover:border-amber-500 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-extrabold text-amber-800">{est.id}</span>
                        <span className="text-xs font-bold uppercase text-stone-600">• {est.category} ({est.cleaningType})</span>
                      </div>
                      <h3 className="text-lg font-serif font-bold text-stone-900 mt-1">
                        {est.customerName}
                      </h3>
                    </div>

                    <span className={`text-xs font-bold px-3 py-1 rounded-full border self-start ${
                      est.status === 'pending'
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    }`}>
                      {est.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Specs */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs text-stone-800">
                    <div>
                      <span className="text-stone-500 block">Phone & Email</span>
                      <strong>{est.customerPhone}</strong>
                      <div className="text-stone-600">{est.customerEmail}</div>
                    </div>

                    <div>
                      <span className="text-stone-500 block">Property Details</span>
                      <strong>{est.squareFootage} sqft • {est.bedrooms} Bed / {est.bathrooms} Bath</strong>
                      <div className="text-stone-600 truncate">{est.propertyAddress}</div>
                    </div>

                    <div>
                      <span className="text-stone-500 block">Preferred Target Date</span>
                      <strong>{est.preferredDate || 'Flexible'} ({est.preferredTimeSlot})</strong>
                    </div>

                    <div>
                      <span className="text-stone-500 block">Calculated Base</span>
                      <strong className="text-emerald-700 text-sm">${est.estimatedPrice}</strong>
                    </div>
                  </div>

                  {/* Photo Row */}
                  {est.photos.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-xs font-bold text-stone-700 flex items-center space-x-1">
                        <ImageIcon className="w-4 h-4 text-amber-600" />
                        <span>Uploaded Property Photos ({est.photos.length})</span>
                      </div>
                      <div className="flex space-x-3 overflow-x-auto pb-2">
                        {est.photos.map((photo, pIdx) => (
                          <button
                            key={pIdx}
                            type="button"
                            onClick={() => setExpandedPhoto(photo)}
                            className="w-20 h-20 rounded-xl overflow-hidden border border-stone-300 flex-shrink-0 relative group"
                          >
                            <img src={photo} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                            <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white">
                              <Eye className="w-4 h-4" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => {
                        setSelectedEst(est);
                        setQuotePrice(est.estimatedPrice || 250);
                        setQuoteNotes(est.adminNotes || 'Reviewed by Whistle Stop Admin.');
                      }}
                      className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-xs rounded-xl shadow-md flex items-center space-x-1.5"
                    >
                      <Send className="w-4 h-4" />
                      <span>{est.status === 'quoted' ? 'Update Quote' : 'Respond With Official Quote'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: BOOKINGS LEDGER */}
      {activeTab === 'bookings' && (
        <div className="bg-white rounded-2xl border border-stone-300 p-6 space-y-4">
          <h2 className="text-xl font-serif font-bold text-stone-900">
            Confirmed Appointments & Payment Ledger
          </h2>

          <div className="space-y-4">
            {bookings.map((bk) => (
              <div key={bk.id} className="p-4 bg-stone-50 rounded-xl border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                <div>
                  <span className="font-mono font-bold text-amber-800">{bk.id}</span> • <strong>{bk.customerName}</strong> ({bk.customerPhone})
                  <div className="text-stone-600">{bk.date} @ {bk.timeSlot} | {bk.propertyAddress}</div>
                  <div className="text-stone-500 font-mono text-[10px]">Stripe ID: {bk.stripePaymentIntentId}</div>
                  {bk.assignedStaffNames && bk.assignedStaffNames.length > 0 && (
                    <div className="text-emerald-700 font-bold mt-1">
                      Assigned: {bk.assignedStaffNames.join(', ')}
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-base font-extrabold text-emerald-700 block">${bk.totalPrice}</span>
                  <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                    {bk.paymentStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: STRIPE & HANDOFF GUIDE FOR NON-TECHNICAL ADMIN */}
      {activeTab === 'stripe_setup' && (
        <div className="bg-white rounded-2xl border border-stone-300 p-6 sm:p-8 space-y-8 shadow-sm">
          <div className="border-b border-stone-200 pb-4">
            <div className="inline-flex items-center space-x-1.5 bg-amber-500/20 text-amber-900 font-mono text-xs px-2.5 py-0.5 rounded border border-amber-400/30 mb-2">
              <CreditCard className="w-4 h-4 text-amber-600" />
              <span>Non-Technical Admin Stripe Key Setup</span>
            </div>
            <h2 className="text-xl font-serif font-bold text-stone-900">
              Configure Live Credit Card Processing via Stripe
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              You do not need programming knowledge to set up credit card payments. Simply follow the step-by-step guide below.
            </p>
          </div>

          {/* Current Live Status Banner */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between ${
            stripeStatus?.hasSecretKey
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-amber-50 border-amber-300 text-amber-900'
          }`}>
            <div className="flex items-center space-x-3">
              {stripeStatus?.hasSecretKey ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
              )}
              <div>
                <div className="text-sm font-bold">
                  {stripeStatus?.hasSecretKey
                    ? 'Stripe Live Processing Is Active'
                    : 'Stripe Sandbox / Test Mode Active (Keys Not Yet Configured)'}
                </div>
                <div className="text-xs text-stone-600">
                  {stripeStatus?.hasSecretKey
                    ? `Publishable Key: ${stripeStatus.publishableKeySnippet}`
                    : 'Enter your Stripe API keys below to accept real credit card payments.'}
                </div>
              </div>
            </div>
          </div>

          {stripeKeyMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-xl font-bold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{stripeKeyMsg}</span>
            </div>
          )}

          {/* Key Entry Form */}
          <form onSubmit={handleSaveStripeKeys} className="bg-stone-50 p-6 rounded-2xl border border-stone-200 space-y-4">
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
              1. Enter Your Stripe API Keys Here
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Stripe Secret Key (sk_live_... or sk_test_...)
                </label>
                <input
                  type="password"
                  placeholder="sk_live_51N..."
                  value={stripeSecretKeyInput}
                  onChange={(e) => setStripeSecretKeyInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Stripe Publishable Key (pk_live_... or pk_test_...)
                </label>
                <input
                  type="text"
                  placeholder="pk_live_51N..."
                  value={stripePubVal}
                  onChange={(e) => setStripePubVal(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-mono text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSavingStripeKeys}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-xs rounded-xl shadow-md flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSavingStripeKeys ? 'Applying Keys...' : 'Save & Activate Stripe Keys'}</span>
            </button>
          </form>

          {/* Simple 3-Step Retrieval Guide */}
          <div className="space-y-4 pt-4 border-t border-stone-200">
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
              2. How to Get Your Stripe Keys (3 Simple Steps)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                <div className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 font-bold flex items-center justify-center">1</div>
                <div className="font-bold text-stone-900 text-sm">Log In to Stripe</div>
                <p className="text-stone-600 leading-relaxed">
                  Go to <strong className="text-amber-800">dashboard.stripe.com</strong> and create or sign into your business account.
                </p>
              </div>

              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                <div className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 font-bold flex items-center justify-center">2</div>
                <div className="font-bold text-stone-900 text-sm">Navigate to API Keys</div>
                <p className="text-stone-600 leading-relaxed">
                  Click on <strong className="text-stone-900">Developers</strong> in the top right menu, then click <strong className="text-stone-900">API Keys</strong>.
                </p>
              </div>

              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                <div className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 font-bold flex items-center justify-center">3</div>
                <div className="font-bold text-stone-900 text-sm">Copy Keys & Paste Above</div>
                <p className="text-stone-600 leading-relaxed">
                  Copy your <strong>Publishable key</strong> (starts with pk_) and <strong>Secret key</strong> (starts with sk_) and paste into the form above!
                </p>
              </div>
            </div>
          </div>

          {/* Shareable Handoff Guide Card */}
          <div className="bg-stone-900 text-stone-100 p-6 rounded-2xl border border-amber-500 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-serif font-bold text-base text-white">Owner Handoff & Instructions Card</div>
              <button
                type="button"
                onClick={handleCopyHandoff}
                className="px-3 py-1.5 bg-amber-500 text-stone-950 font-bold text-xs rounded-lg flex items-center space-x-1"
              >
                {copiedHandoff ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedHandoff ? 'Copied Guide!' : 'Copy Handoff Message'}</span>
              </button>
            </div>
            <pre className="text-[11px] font-mono bg-stone-950 p-4 rounded-xl text-stone-300 overflow-x-auto whitespace-pre-wrap border border-stone-800">
              {handoffText}
            </pre>
          </div>

        </div>
      )}

      {/* TAB 8: NOTIFICATIONS AUDIT LOG */}
      {activeTab === 'notifs' && (
        <div className="bg-white rounded-2xl border border-stone-300 p-6 space-y-4">
          <h2 className="text-xl font-serif font-bold text-stone-900">
            SMS & Email Notification Audit Log
          </h2>

          <div className="space-y-3">
            {notifs.map((n) => (
              <div key={n.id} className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1">
                <div className="flex justify-between font-bold text-stone-800">
                  <span>[{n.channel}] To: {n.recipient} • {n.subject}</span>
                  <span className="text-[10px] text-stone-500 font-mono">{new Date(n.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="text-stone-600 whitespace-pre-line">{n.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Staff Assignment Modal */}
      {assigningBooking && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-stone-300 p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-serif font-bold text-stone-900">
                Assign Cleaners to {assigningBooking.id}
              </h3>
              <button onClick={() => setAssigningBooking(null)} className="p-1 text-stone-400 hover:text-stone-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-stone-600 space-y-1">
              <div>Customer: <strong>{assigningBooking.customerName}</strong></div>
              <div>Schedule: <strong>{assigningBooking.date} ({assigningBooking.timeSlot})</strong></div>
            </div>

            <div className="space-y-2 pt-2 border-t border-stone-100">
              <label className="block text-xs font-bold text-stone-700 uppercase">
                Select Staff Roster:
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {staff.map((m) => {
                  const isChecked = selectedStaffIds.includes(m.id);
                  return (
                    <label key={m.id} className="flex items-center space-x-2.5 p-2 rounded-xl bg-stone-50 border border-stone-200 text-xs cursor-pointer hover:bg-stone-100">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStaffIds([...selectedStaffIds, m.id]);
                          } else {
                            setSelectedStaffIds(selectedStaffIds.filter(id => id !== m.id));
                          }
                        }}
                        className="rounded text-amber-500"
                      />
                      <div className="flex-1 flex justify-between font-medium">
                        <span>{m.name}</span>
                        <span className="text-[10px] text-stone-500 capitalize">{m.role.replace('_', ' ')}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setAssigningBooking(null)}
                className="px-4 py-2 border rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveStaffAssignment}
                className="px-5 py-2 bg-amber-500 text-stone-950 font-extrabold text-xs rounded-xl shadow-md"
              >
                Save Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quote Modal */}
      {selectedEst && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border-2 border-stone-300 p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-serif font-bold text-stone-900">
                Send Quote for Request {selectedEst.id}
              </h3>
              <button onClick={() => setSelectedEst(null)} className="p-1 text-stone-400 hover:text-stone-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendQuote} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Customer Email & Phone
                </label>
                <div className="text-xs text-stone-800 font-medium">
                  {selectedEst.customerName} ({selectedEst.customerEmail} | {selectedEst.customerPhone})
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Quoted Price ($)
                </label>
                <input
                  type="number"
                  required
                  value={quotePrice}
                  onChange={(e) => setQuotePrice(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-bold text-base text-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Note to Customer
                </label>
                <textarea
                  rows={3}
                  value={quoteNotes}
                  onChange={(e) => setQuoteNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setSelectedEst(null)}
                  className="px-4 py-2 border rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingQuote}
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-xs rounded-xl shadow-md"
                >
                  {isSendingQuote ? 'Sending...' : 'Dispatch Quote via Email & SMS'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expanded Photo Preview Modal */}
      {expandedPhoto && (
        <div className="fixed inset-0 z-50 bg-stone-950/90 flex items-center justify-center p-4">
          <div className="relative max-w-3xl w-full max-h-[85vh] flex flex-col items-center">
            <button
              onClick={() => setExpandedPhoto(null)}
              className="absolute -top-10 right-0 text-white bg-stone-800 p-2 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>
            <img src={expandedPhoto} alt="Property detail" className="max-w-full max-h-[80vh] rounded-2xl object-contain shadow-2xl border-2 border-stone-700" />
          </div>
        </div>
      )}

    </div>
  );
};
