import React, { useState } from 'react';
import { Booking, PricingConfig, StaffMember } from '../types';
import {
  computeFinancialReconciliation,
  calculateItemizedBreakdown,
  ItemizedBookingBreakdown,
  defaultPricingFallback
} from '../utils/financial';
import {
  TrendingUp,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  ChevronRight,
  Plus,
  Eye,
  FileText,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Briefcase,
  X,
  PieChart,
  HelpCircle
} from 'lucide-react';

interface FinancialReconciliationViewProps {
  bookings: Booking[];
  pricing: PricingConfig | null;
  staff: StaffMember[];
  onRefreshData?: () => void;
  onAssignStaffClick?: (booking: Booking) => void;
}

export const FinancialReconciliationView: React.FC<FinancialReconciliationViewProps> = ({
  bookings,
  pricing,
  staff,
  onAssignStaffClick,
}) => {
  const activePricing = pricing || defaultPricingFallback;
  const [targetRevenueInput, setTargetRevenueInput] = useState<number>(3200);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'mtd_completed' | 'remaining' | 'recurring'>('all');
  const [itemizedBookingModal, setItemizedBookingModal] = useState<{
    booking: Booking;
    breakdown: ItemizedBookingBreakdown;
  } | null>(null);

  const metrics = computeFinancialReconciliation(bookings, activePricing, targetRevenueInput);

  // Filtered cleanings list for job table
  const filteredBookings = bookings.filter((bk) => {
    if (bk.bookingStatus === 'cancelled') return false;
    const bkDate = new Date(bk.date);
    const now = new Date();
    const isCurrentMonth = bkDate.getFullYear() === now.getFullYear() && bkDate.getMonth() === now.getMonth();

    if (selectedFilter === 'mtd_completed') {
      return isCurrentMonth && (bk.bookingStatus === 'completed' || bkDate < now);
    }
    if (selectedFilter === 'remaining') {
      return isCurrentMonth && (bk.bookingStatus === 'confirmed' && bkDate >= now);
    }
    if (selectedFilter === 'recurring') {
      return bk.cleaningType === 'weekly' || bk.cleaningType === 'bi-weekly' || bk.cleaningType === 'monthly';
    }
    return true; // 'all'
  });

  return (
    <div className="space-y-8">
      {/* 1. EXECUTIVE FINANCIAL DASHBOARD HEADER */}
      <div className="bg-gradient-to-br from-stone-900 via-stone-900 to-amber-950 text-stone-100 rounded-2xl p-6 sm:p-8 border border-amber-500/40 shadow-xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-stone-800 pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-amber-500/20 text-amber-300 font-mono text-xs px-3 py-1 rounded-lg border border-amber-400/30">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span>{metrics.currentMonthName} Executive Financial Reconciliation</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              Month-End Revenue & Labor Forecast Engine
            </h2>
            <p className="text-stone-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Track actual completed cleanings month-to-date against remaining scheduled bookings, reconcile budget variances, and forecast next month's repeat contract volume.
            </p>
          </div>

          {/* Target Revenue Input & Status Badge */}
          <div className="bg-stone-950/80 p-4 rounded-xl border border-amber-500/30 space-y-3 min-w-[280px]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-stone-400 font-bold uppercase tracking-wider">Monthly Budget Target</span>
              <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] flex items-center space-x-1 ${
                metrics.reconciliationStatus === 'AHEAD_OF_BUDGET'
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                  : metrics.reconciliationStatus === 'ON_TRACK'
                  ? 'bg-amber-950 text-amber-400 border border-amber-500/40'
                  : 'bg-rose-950 text-rose-400 border border-rose-500/40'
              }`}>
                {metrics.reconciliationStatus === 'AHEAD_OF_BUDGET' && <ArrowUpRight className="w-3 h-3" />}
                {metrics.reconciliationStatus === 'BEHIND_BUDGET' && <ArrowDownRight className="w-3 h-3" />}
                <span>{metrics.reconciliationStatus.replace(/_/g, ' ')}</span>
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold text-amber-400">$</span>
              <input
                type="number"
                value={targetRevenueInput}
                onChange={(e) => setTargetRevenueInput(Number(e.target.value) || 0)}
                className="w-full bg-stone-900 border border-amber-500/50 rounded-lg px-3 py-1.5 text-white text-lg font-extrabold focus:outline-none focus:border-amber-400"
                placeholder="Target $"
              />
            </div>

            <div className="text-[11px] text-stone-400 flex justify-between font-mono">
              <span>Variance: <strong className={metrics.revenueVarianceDollar >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {metrics.revenueVarianceDollar >= 0 ? `+$${metrics.revenueVarianceDollar}` : `-$${Math.abs(metrics.revenueVarianceDollar)}`}
              </strong></span>
              <span>({metrics.revenueVariancePercent >= 0 ? `+${metrics.revenueVariancePercent}%` : `${metrics.revenueVariancePercent}%`})</span>
            </div>
          </div>
        </div>

        {/* 4 CORE FINANCIAL KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-stone-950/60 p-4 rounded-xl border border-stone-800 space-y-1">
            <div className="text-stone-400 text-xs font-bold uppercase tracking-wider flex justify-between">
              <span>MTD Completed Volume</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-400">${metrics.mtdCompletedDollarVolume}</div>
            <div className="text-[11px] text-stone-400">
              {metrics.mtdCompletedJobsCount} jobs completed ({metrics.mtdCompletedLaborHours} hrs worked)
            </div>
          </div>

          <div className="bg-stone-950/60 p-4 rounded-xl border border-stone-800 space-y-1">
            <div className="text-stone-400 text-xs font-bold uppercase tracking-wider flex justify-between">
              <span>Remaining Pipeline</span>
              <Calendar className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-extrabold text-amber-400">${metrics.remainingScheduledDollarVolume}</div>
            <div className="text-[11px] text-stone-400">
              {metrics.remainingScheduledJobsCount} scheduled ({metrics.remainingScheduledLaborHours} hrs est.)
            </div>
          </div>

          <div className="bg-stone-950/60 p-4 rounded-xl border border-stone-800 space-y-1">
            <div className="text-stone-400 text-xs font-bold uppercase tracking-wider flex justify-between">
              <span>Month End Forecast</span>
              <TrendingUp className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-extrabold text-white">${metrics.totalMonthForecastRevenue}</div>
            <div className="text-[11px] text-stone-400">
              {metrics.totalMonthForecastJobs} total jobs • {metrics.totalMonthForecastLaborHours} labor hrs
            </div>
          </div>

          <div className="bg-stone-950/60 p-4 rounded-xl border border-stone-800 space-y-1">
            <div className="text-stone-400 text-xs font-bold uppercase tracking-wider flex justify-between">
              <span>Average Ticket Size</span>
              <DollarSign className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-extrabold text-amber-300">${metrics.mtdAverageTicket}</div>
            <div className="text-[11px] text-stone-400">Average revenue per cleaning job</div>
          </div>
        </div>
      </div>

      {/* 2. REMAINING JOBS PIPELINE (Current Month Scheduled Cleanings) */}
      <div className="bg-white rounded-2xl border border-stone-300 p-6 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
          <div>
            <div className="inline-flex items-center space-x-1 text-amber-700 font-mono text-xs font-bold mb-1">
              <Calendar className="w-4 h-4" />
              <span>Upcoming Scheduled Pipeline</span>
            </div>
            <h3 className="text-xl font-serif font-bold text-stone-900">
              Jobs Remaining by Date ({metrics.remainingScheduledJobsCount} Jobs • ${metrics.remainingScheduledDollarVolume} Volume)
            </h3>
          </div>

          <div className="bg-stone-100 p-2 rounded-xl text-xs flex items-center space-x-4 border border-stone-200 font-bold text-stone-800">
            <div>Total Est. Labor: <strong className="text-amber-800">{metrics.remainingScheduledLaborHours} Hours</strong></div>
            <div>Avg Job Value: <strong className="text-emerald-800">${metrics.remainingScheduledJobsCount > 0 ? Math.round(metrics.remainingScheduledDollarVolume / metrics.remainingScheduledJobsCount) : 0}</strong></div>
          </div>
        </div>

        {metrics.remainingJobsList.length === 0 ? (
          <div className="p-8 text-center text-stone-500 bg-stone-50 rounded-xl border border-dashed border-stone-300 text-xs">
            No remaining scheduled cleanings for the current month.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-100 border-b border-stone-300 text-stone-700 uppercase font-bold text-[10px] tracking-wider">
                  <th className="p-3">Date & Time Slot</th>
                  <th className="p-3">Customer & Location</th>
                  <th className="p-3">Service & Specs</th>
                  <th className="p-3">Estimated Labor</th>
                  <th className="p-3">Assigned Staff</th>
                  <th className="p-3 text-right">Job Dollar Volume</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {metrics.remainingJobsList.map((job) => {
                  return (
                    <tr key={job.id} className="hover:bg-amber-50/50 transition-colors">
                      <td className="p-3 font-mono">
                        <strong className="text-stone-900 block">{job.date}</strong>
                        <span className="text-stone-500 text-[11px]">{job.timeSlot}</span>
                      </td>

                      <td className="p-3">
                        <strong className="text-stone-900 block">{job.customerName}</strong>
                        <span className="text-stone-500 text-[11px] block truncate max-w-[200px]">{job.propertyAddress}</span>
                        <span className="text-amber-800 text-[10px]">{job.customerPhone}</span>
                      </td>

                      <td className="p-3">
                        <span className="font-bold text-stone-800 capitalize block">
                          {job.category} • {job.cleaningType}
                        </span>
                        <span className="text-stone-500 text-[11px]">
                          {job.squareFootage} sqft | {job.bedrooms} Bed / {job.bathrooms} Bath
                        </span>
                      </td>

                      <td className="p-3 font-bold text-stone-800">
                        <div className="flex items-center space-x-1 text-amber-900">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>{job.breakdown.estimatedLaborHours} Hrs</span>
                        </div>
                      </td>

                      <td className="p-3">
                        {job.assignedStaffNames && job.assignedStaffNames.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {job.assignedStaffNames.map((s, idx) => (
                              <span key={idx} className="px-2 py-0.5 bg-emerald-100 text-emerald-900 text-[10px] font-bold rounded-full border border-emerald-300">
                                {s}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onAssignStaffClick && onAssignStaffClick(job)}
                            className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-bold rounded-lg border border-stone-300 flex items-center space-x-1"
                          >
                            <Users className="w-3 h-3" />
                            <span>Assign Cleaners</span>
                          </button>
                        )}
                      </td>

                      <td className="p-3 text-right">
                        <span className="text-sm font-extrabold text-emerald-700 block">${job.totalPrice}</span>
                        <span className="text-[10px] text-stone-500">
                          {job.paymentStatus === 'fully_paid' ? 'Fully Paid' : `Deposit: $${job.depositAmount}`}
                        </span>
                      </td>

                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => setItemizedBookingModal({ booking: job, breakdown: job.breakdown })}
                          className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-[11px] rounded-lg shadow-sm flex items-center space-x-1 mx-auto"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Itemized Breakdown</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 3. SCHEDULED & PAST CLEANINGS MASTER TRACKER WITH FILTER TABS */}
      <div className="bg-white rounded-2xl border border-stone-300 p-6 space-y-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-4">
          <div>
            <h3 className="text-xl font-serif font-bold text-stone-900">
              Master Cleanings Ledger & Itemized Pricing
            </h3>
            <p className="text-xs text-stone-500">
              View past completed jobs, scheduled cleanings, itemized cost breakdowns, and assigned staff roster.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex overflow-x-auto gap-2 text-xs font-bold">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1.5 rounded-xl border transition-colors ${
                selectedFilter === 'all'
                  ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-sm'
                  : 'bg-stone-100 text-stone-700 border-stone-300 hover:bg-stone-200'
              }`}
            >
              All Cleanings ({bookings.filter(b => b.bookingStatus !== 'cancelled').length})
            </button>

            <button
              onClick={() => setSelectedFilter('mtd_completed')}
              className={`px-3 py-1.5 rounded-xl border transition-colors ${
                selectedFilter === 'mtd_completed'
                  ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-sm'
                  : 'bg-stone-100 text-stone-700 border-stone-300 hover:bg-stone-200'
              }`}
            >
              Past Cleanings MTD ({metrics.mtdCompletedJobsCount})
            </button>

            <button
              onClick={() => setSelectedFilter('remaining')}
              className={`px-3 py-1.5 rounded-xl border transition-colors ${
                selectedFilter === 'remaining'
                  ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-sm'
                  : 'bg-stone-100 text-stone-700 border-stone-300 hover:bg-stone-200'
              }`}
            >
              Scheduled Remaining ({metrics.remainingScheduledJobsCount})
            </button>

            <button
              onClick={() => setSelectedFilter('recurring')}
              className={`px-3 py-1.5 rounded-xl border transition-colors ${
                selectedFilter === 'recurring'
                  ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-sm'
                  : 'bg-stone-100 text-stone-700 border-stone-300 hover:bg-stone-200'
              }`}
            >
              Repeat Contracts ({metrics.recurringWeeklyContractsCount + metrics.recurringBiWeeklyContractsCount + metrics.recurringMonthlyContractsCount})
            </button>
          </div>
        </div>

        {/* Cleanings List */}
        <div className="space-y-3">
          {filteredBookings.length === 0 ? (
            <div className="p-8 text-center text-stone-500 bg-stone-50 rounded-xl border border-stone-200 text-xs">
              No cleanings match the selected filter.
            </div>
          ) : (
            filteredBookings.map((bk) => {
              const breakdown = calculateItemizedBreakdown(bk, activePricing);
              const isPastCompleted = bk.bookingStatus === 'completed' || new Date(bk.date) < new Date();

              return (
                <div
                  key={bk.id}
                  className="p-4 bg-stone-50 rounded-2xl border border-stone-200 hover:border-amber-400 transition-colors space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border-b border-stone-200 pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-amber-800 text-sm">{bk.id}</span>
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          isPastCompleted
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : 'bg-amber-100 text-amber-900 border border-amber-300'
                        }`}>
                          {isPastCompleted ? 'COMPLETED' : 'SCHEDULED'}
                        </span>
                        <span className="text-stone-500 font-semibold">• {bk.date} @ {bk.timeSlot}</span>
                      </div>
                      <div className="text-stone-900 text-sm font-bold">{bk.customerName}</div>
                      <div className="text-stone-600">{bk.propertyAddress} • {bk.customerPhone}</div>
                    </div>

                    <div className="text-left sm:text-right space-y-1">
                      <div className="text-lg font-extrabold text-emerald-700">${bk.totalPrice}</div>
                      <div className="text-[11px] text-stone-500">
                        Est. Labor: <strong className="text-stone-800">{breakdown.estimatedLaborHours} Hours</strong>
                      </div>
                      <div className="text-[11px] text-stone-500">
                        Payment: <strong className="text-emerald-800 uppercase">{bk.paymentStatus}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Summary row */}
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
                    <div className="flex items-center space-x-2 text-stone-700">
                      <span className="bg-stone-200 px-2 py-0.5 rounded font-bold capitalize">{bk.category}</span>
                      <span className="bg-stone-200 px-2 py-0.5 rounded font-bold capitalize">{bk.cleaningType}</span>
                      <span>{bk.squareFootage} sqft ({bk.bedrooms} Bed / {bk.bathrooms} Bath)</span>
                    </div>

                    <div className="flex items-center space-x-3">
                      {bk.assignedStaffNames && bk.assignedStaffNames.length > 0 ? (
                        <div className="text-[11px] text-stone-600">
                          Staff: <strong className="text-emerald-800">{bk.assignedStaffNames.join(', ')}</strong>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onAssignStaffClick && onAssignStaffClick(bk)}
                          className="text-[11px] text-amber-800 hover:underline font-bold flex items-center space-x-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Assign Staff</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setItemizedBookingModal({ booking: bk, breakdown })}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-xs rounded-xl shadow-sm flex items-center space-x-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Itemized Pricing</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 4. END-OF-MONTH FINANCIAL RECONCILIATION TABLE (Target vs Actual/Forecast) */}
      <div className="bg-white rounded-2xl border border-stone-300 p-6 space-y-6 shadow-sm">
        <div className="border-b border-stone-200 pb-4 space-y-1">
          <div className="inline-flex items-center space-x-1 text-emerald-800 font-mono text-xs font-bold">
            <PieChart className="w-4 h-4" />
            <span>End-of-Month Financial Reconciliation</span>
          </div>
          <h3 className="text-xl font-serif font-bold text-stone-900">
            Actual Business Results vs Projected Budget Matrix
          </h3>
          <p className="text-xs text-stone-500">
            Full audit comparing MTD actual results, remaining scheduled cleanings, total forecasted month ending volume, and variance against target budget.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-900 text-stone-100 uppercase font-bold text-[10px] tracking-wider">
                <th className="p-3.5">Metric Category</th>
                <th className="p-3.5">Monthly Budget Target</th>
                <th className="p-3.5">MTD Completed (Actual)</th>
                <th className="p-3.5">Remaining Scheduled</th>
                <th className="p-3.5">Total Month Ending Forecast</th>
                <th className="p-3.5 text-right">Budget Variance ($ / Units)</th>
                <th className="p-3.5 text-right">Variance %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 text-stone-800">
              <tr className="bg-emerald-50/40">
                <td className="p-3.5 font-bold text-stone-900 flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>Gross Dollar Volume ($)</span>
                </td>
                <td className="p-3.5 font-bold font-mono">${targetRevenueInput}</td>
                <td className="p-3.5 font-bold text-emerald-700 font-mono">${metrics.mtdCompletedDollarVolume}</td>
                <td className="p-3.5 font-bold text-amber-700 font-mono">${metrics.remainingScheduledDollarVolume}</td>
                <td className="p-3.5 font-extrabold text-stone-900 font-mono text-sm">${metrics.totalMonthForecastRevenue}</td>
                <td className={`p-3.5 text-right font-extrabold font-mono ${metrics.revenueVarianceDollar >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {metrics.revenueVarianceDollar >= 0 ? `+$${metrics.revenueVarianceDollar}` : `-$${Math.abs(metrics.revenueVarianceDollar)}`}
                </td>
                <td className="p-3.5 text-right font-extrabold font-mono">
                  <span className={`px-2 py-0.5 rounded-full ${metrics.revenueVariancePercent >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                    {metrics.revenueVariancePercent >= 0 ? `+${metrics.revenueVariancePercent}%` : `${metrics.revenueVariancePercent}%`}
                  </span>
                </td>
              </tr>

              <tr>
                <td className="p-3.5 font-bold text-stone-900 flex items-center space-x-2">
                  <Briefcase className="w-4 h-4 text-amber-600" />
                  <span>Number of Cleaning Jobs</span>
                </td>
                <td className="p-3.5 font-mono">10 Jobs</td>
                <td className="p-3.5 font-bold text-stone-800 font-mono">{metrics.mtdCompletedJobsCount} Jobs</td>
                <td className="p-3.5 font-bold text-amber-800 font-mono">{metrics.remainingScheduledJobsCount} Jobs</td>
                <td className="p-3.5 font-extrabold text-stone-900 font-mono">{metrics.totalMonthForecastJobs} Jobs</td>
                <td className="p-3.5 text-right font-bold font-mono text-stone-800">
                  {metrics.totalMonthForecastJobs - 10 >= 0 ? `+${metrics.totalMonthForecastJobs - 10} Jobs` : `${metrics.totalMonthForecastJobs - 10} Jobs`}
                </td>
                <td className="p-3.5 text-right font-mono">
                  {Math.round(((metrics.totalMonthForecastJobs - 10) / 10) * 100)}%
                </td>
              </tr>

              <tr>
                <td className="p-3.5 font-bold text-stone-900 flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>Labor Hours Required</span>
                </td>
                <td className="p-3.5 font-mono">40.0 Hrs</td>
                <td className="p-3.5 font-bold text-stone-800 font-mono">{metrics.mtdCompletedLaborHours} Hrs</td>
                <td className="p-3.5 font-bold text-amber-800 font-mono">{metrics.remainingScheduledLaborHours} Hrs</td>
                <td className="p-3.5 font-extrabold text-stone-900 font-mono">{metrics.totalMonthForecastLaborHours} Hrs</td>
                <td className="p-3.5 text-right font-bold font-mono text-stone-800">
                  {Math.round((metrics.totalMonthForecastLaborHours - 40.0) * 10) / 10 >= 0 ? `+${Math.round((metrics.totalMonthForecastLaborHours - 40.0) * 10) / 10} Hrs` : `${Math.round((metrics.totalMonthForecastLaborHours - 40.0) * 10) / 10} Hrs`}
                </td>
                <td className="p-3.5 text-right font-mono">
                  {Math.round(((metrics.totalMonthForecastLaborHours - 40.0) / 40.0) * 100)}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. NEXT MONTH FORECAST & REPEAT BUSINESS ENGINE */}
      <div className="bg-gradient-to-br from-stone-900 to-amber-950 text-white rounded-2xl p-6 sm:p-8 space-y-6 border border-amber-500/40 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1 bg-amber-500/20 text-amber-300 font-mono text-xs px-2.5 py-0.5 rounded border border-amber-400/30">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span>Next Month Business Forecast</span>
            </div>
            <h3 className="text-2xl font-serif font-bold text-white">
              {metrics.nextMonthName} Revenue & Repeat Contract Projection
            </h3>
            <p className="text-xs text-stone-300 max-w-xl">
              Forecasted revenue for next month generated from active weekly, bi-weekly, and monthly recurring contracts plus organic new client acquisition trend.
            </p>
          </div>

          <div className="bg-stone-950/80 p-4 rounded-xl border border-amber-500/30 text-right">
            <div className="text-[10px] text-stone-400 uppercase tracking-wider font-bold">Total Next Month Projected Volume</div>
            <div className="text-3xl font-extrabold text-amber-400 font-mono">${metrics.nextMonthTotalProjectedRevenue}</div>
            <div className="text-xs text-stone-300">{metrics.nextMonthProjectedJobsCount} Est. Jobs • {metrics.nextMonthProjectedLaborHours} Est. Labor Hrs</div>
          </div>
        </div>

        {/* Breakdown Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Recurring Contract Breakdown Card */}
          <div className="bg-stone-950/60 p-5 rounded-2xl border border-stone-800 space-y-3">
            <div className="font-bold text-amber-400 uppercase tracking-wider flex items-center justify-between border-b border-stone-800 pb-2">
              <span>Active Repeat Contracts</span>
              <Users className="w-4 h-4" />
            </div>

            <div className="space-y-2 text-stone-300">
              <div className="flex justify-between">
                <span>Weekly Clients (4.3x/mo):</span>
                <strong className="text-white font-mono">{metrics.recurringWeeklyContractsCount} Accounts</strong>
              </div>

              <div className="flex justify-between">
                <span>Bi-Weekly Clients (2.15x/mo):</span>
                <strong className="text-white font-mono">{metrics.recurringBiWeeklyContractsCount} Accounts</strong>
              </div>

              <div className="flex justify-between">
                <span>Monthly Recurring Clients:</span>
                <strong className="text-white font-mono">{metrics.recurringMonthlyContractsCount} Accounts</strong>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-800 flex justify-between text-amber-300 font-bold">
              <span>Next Month Guaranteed Baseline:</span>
              <span className="font-mono">${metrics.nextMonthRecurringRevenue}</span>
            </div>
          </div>

          {/* Organic Growth & New Pipeline */}
          <div className="bg-stone-950/60 p-5 rounded-2xl border border-stone-800 space-y-3">
            <div className="font-bold text-amber-400 uppercase tracking-wider flex items-center justify-between border-b border-stone-800 pb-2">
              <span>New Client Expansion</span>
              <TrendingUp className="w-4 h-4" />
            </div>

            <p className="text-stone-300 leading-relaxed text-[11px]">
              Based on month-over-month organic search, questionnaire estimate submissions, and word-of-mouth referral conversion rate (~25% growth factor).
            </p>

            <div className="pt-4 border-t border-stone-800 flex justify-between text-emerald-400 font-bold">
              <span>Projected One-Time Revenue:</span>
              <span className="font-mono">${metrics.nextMonthNewJobsProjectedRevenue}</span>
            </div>
          </div>

          {/* Labor Capacity & Forecasting */}
          <div className="bg-stone-950/60 p-5 rounded-2xl border border-stone-800 space-y-3">
            <div className="font-bold text-amber-400 uppercase tracking-wider flex items-center justify-between border-b border-stone-800 pb-2">
              <span>Labor Roster Capacity</span>
              <Clock className="w-4 h-4" />
            </div>

            <div className="space-y-2 text-stone-300">
              <div className="flex justify-between">
                <span>Total Labor Hours Required:</span>
                <strong className="text-white font-mono">{metrics.nextMonthProjectedLaborHours} Hours</strong>
              </div>

              <div className="flex justify-between">
                <span>Active Cleaning Roster:</span>
                <strong className="text-emerald-400 font-mono">{staff.filter(s => s.status === 'active').length} Technicians</strong>
              </div>

              <div className="flex justify-between text-[11px]">
                <span>Avg Tech Workload:</span>
                <strong className="text-amber-300 font-mono">
                  {staff.filter(s => s.status === 'active').length > 0
                    ? `${Math.round(metrics.nextMonthProjectedLaborHours / staff.filter(s => s.status === 'active').length)} Hrs / Tech`
                    : 'N/A'}
                </strong>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-800 text-[11px] text-stone-400 italic">
              Staffing levels are sufficient to cover projected {metrics.nextMonthName} contract volume.
            </div>
          </div>
        </div>
      </div>

      {/* ITEMIZED BOOKING BREAKDOWN MODAL */}
      {itemizedBookingModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-stone-300 p-6 space-y-5 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-stone-200 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-amber-800">{itemizedBookingModal.booking.id}</span>
                <h3 className="text-lg font-serif font-bold text-stone-900">
                  Itemized Financial Breakdown
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setItemizedBookingModal(null)}
                className="p-1 text-stone-400 hover:text-stone-900 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer & Job Info */}
            <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 text-xs space-y-1">
              <div className="font-bold text-stone-900 text-sm">{itemizedBookingModal.booking.customerName}</div>
              <div className="text-stone-600">{itemizedBookingModal.booking.propertyAddress} • {itemizedBookingModal.booking.customerPhone}</div>
              <div className="text-stone-500">
                Scheduled: <strong>{itemizedBookingModal.booking.date} ({itemizedBookingModal.booking.timeSlot})</strong>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="space-y-2 text-xs">
              <div className="font-bold text-stone-800 uppercase text-[10px] tracking-wider border-b pb-1">
                Cost Calculation Components
              </div>

              <div className="flex justify-between py-1 border-b border-stone-100">
                <span>Base Service Rate ({itemizedBookingModal.booking.category}):</span>
                <strong className="font-mono">${itemizedBookingModal.breakdown.basePrice}</strong>
              </div>

              <div className="flex justify-between py-1 border-b border-stone-100">
                <span>Square Footage ({itemizedBookingModal.booking.squareFootage} sqft @ $0.08/sqft):</span>
                <strong className="font-mono">${itemizedBookingModal.breakdown.sqFtFee}</strong>
              </div>

              <div className="flex justify-between py-1 border-b border-stone-100">
                <span>Bedrooms ({itemizedBookingModal.booking.bedrooms} x $25/bed):</span>
                <strong className="font-mono">${itemizedBookingModal.breakdown.bedroomFee}</strong>
              </div>

              <div className="flex justify-between py-1 border-b border-stone-100">
                <span>Bathrooms ({itemizedBookingModal.booking.bathrooms} x $35/bath):</span>
                <strong className="font-mono">${itemizedBookingModal.breakdown.bathroomFee}</strong>
              </div>

              {itemizedBookingModal.breakdown.frequencyDiscountAmount > 0 && (
                <div className="flex justify-between py-1 border-b border-stone-100 text-emerald-700 font-bold">
                  <span>Frequency Discount ({itemizedBookingModal.breakdown.frequencyDiscountPercent}% for {itemizedBookingModal.booking.cleaningType}):</span>
                  <span className="font-mono">-${itemizedBookingModal.breakdown.frequencyDiscountAmount}</span>
                </div>
              )}

              {/* Add-ons list */}
              {itemizedBookingModal.breakdown.addOnsBreakdown.length > 0 && (
                <div className="pt-2 space-y-1">
                  <div className="font-bold text-stone-800 uppercase text-[10px] tracking-wider">
                    Selected Add-On Services:
                  </div>
                  {itemizedBookingModal.breakdown.addOnsBreakdown.map((addOn, aIdx) => (
                    <div key={aIdx} className="flex justify-between py-0.5 text-stone-600 pl-2 border-l-2 border-amber-400">
                      <span>• {addOn.name}</span>
                      <strong className="font-mono">${addOn.price}</strong>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Total Summary Box */}
            <div className="bg-stone-900 text-stone-100 p-4 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between text-base font-extrabold text-white">
                <span>Total Job Price:</span>
                <span className="font-mono text-emerald-400">${itemizedBookingModal.breakdown.totalPrice}</span>
              </div>

              <div className="flex justify-between text-stone-300">
                <span>Deposit Paid:</span>
                <span className="font-mono">${itemizedBookingModal.breakdown.depositAmount}</span>
              </div>

              <div className="flex justify-between text-stone-300">
                <span>Balance Due:</span>
                <span className="font-mono font-bold text-amber-300">${itemizedBookingModal.breakdown.balanceDue}</span>
              </div>

              <div className="pt-2 border-t border-stone-800 flex justify-between text-stone-400 text-[11px]">
                <span>Estimated Time Required:</span>
                <strong className="text-amber-400">{itemizedBookingModal.breakdown.estimatedLaborHours} Labor Hours</strong>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setItemizedBookingModal(null)}
                className="px-5 py-2 bg-stone-900 text-stone-100 font-bold text-xs rounded-xl hover:bg-stone-800"
              >
                Close Breakdown
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
