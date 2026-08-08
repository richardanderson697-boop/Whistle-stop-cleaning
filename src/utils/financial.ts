import { Booking, PricingConfig, AddOnOption } from '../types';

export interface ItemizedBookingBreakdown {
  basePrice: number;
  sqFtFee: number;
  bedroomFee: number;
  bathroomFee: number;
  typeMultiplier: number;
  frequencyDiscountPercent: number;
  frequencyDiscountAmount: number;
  addOnsBreakdown: { id: string; name: string; price: number }[];
  subtotal: number;
  totalPrice: number;
  depositAmount: number;
  balanceDue: number;
  estimatedLaborHours: number;
}

export const defaultPricingFallback: PricingConfig = {
  baseResidentialPrice: 120,
  baseCommercialPrice: 180,
  pricePerSqFt: 0.08,
  pricePerBedroom: 25,
  pricePerBathroom: 35,
  moveInOutMultiplier: 1.35,
  constructionMultiplier: 1.5,
  deepCleanMultiplier: 1.4,
  weeklyDiscountPercent: 20,
  biWeeklyDiscountPercent: 15,
  monthlyDiscountPercent: 10,
  addOns: [
    { id: 'inside-fridge', name: 'Inside Refrigerator Deep Clean', description: 'Deep sanitization', price: 45 },
    { id: 'inside-oven', name: 'Oven Degreasing & Scrub', description: 'Heavy grease removal', price: 50 },
    { id: 'interior-windows', name: 'Interior Windows & Sills', description: 'Streak-free polish', price: 40 },
    { id: 'baseboards-fans', name: 'Baseboards & Ceiling Fans', description: 'Detailed dust removal', price: 35 },
  ],
};

export function calculateItemizedBreakdown(
  booking: Booking,
  pricingConfig: PricingConfig = defaultPricingFallback
): ItemizedBookingBreakdown {
  const isComm = booking.category === 'commercial';
  const basePrice = isComm ? pricingConfig.baseCommercialPrice : pricingConfig.baseResidentialPrice;
  const sqFtFee = Math.round((booking.squareFootage || 1000) * (pricingConfig.pricePerSqFt || 0.08));
  const bedroomFee = (booking.bedrooms || 0) * (pricingConfig.pricePerBedroom || 25);
  const bathroomFee = (booking.bathrooms || 0) * (pricingConfig.pricePerBathroom || 35);

  let typeMultiplier = 1.0;
  if (booking.cleaningType === 'move-in-out') typeMultiplier = pricingConfig.moveInOutMultiplier || 1.35;
  if (booking.cleaningType === 'construction-cleanup') typeMultiplier = pricingConfig.constructionMultiplier || 1.5;
  if (booking.cleaningType === 'deep-cleaning') typeMultiplier = pricingConfig.deepCleanMultiplier || 1.4;

  const rawSubtotal = (basePrice + sqFtFee + bedroomFee + bathroomFee) * typeMultiplier;

  let frequencyDiscountPercent = 0;
  if (booking.cleaningType === 'weekly') frequencyDiscountPercent = pricingConfig.weeklyDiscountPercent || 20;
  else if (booking.cleaningType === 'bi-weekly') frequencyDiscountPercent = pricingConfig.biWeeklyDiscountPercent || 15;
  else if (booking.cleaningType === 'monthly') frequencyDiscountPercent = pricingConfig.monthlyDiscountPercent || 10;

  const frequencyDiscountAmount = Math.round(rawSubtotal * (frequencyDiscountPercent / 100));

  const addOnsBreakdown: { id: string; name: string; price: number }[] = [];
  let addOnsTotal = 0;

  if (booking.selectedAddOns && booking.selectedAddOns.length > 0) {
    booking.selectedAddOns.forEach((addOnId) => {
      const match = pricingConfig.addOns.find((a) => a.id === addOnId);
      if (match) {
        addOnsBreakdown.push({ id: match.id, name: match.name, price: match.price });
        addOnsTotal += match.price;
      } else {
        // Fallback name if custom ID
        addOnsBreakdown.push({ id: addOnId, name: addOnId.replace(/-/g, ' '), price: 35 });
        addOnsTotal += 35;
      }
    });
  }

  const subtotal = Math.round(rawSubtotal - frequencyDiscountAmount);
  const totalPrice = booking.totalPrice || Math.round(subtotal + addOnsTotal);
  const depositAmount = booking.depositAmount || Math.round(totalPrice * 0.25);
  const balanceDue = Math.max(0, totalPrice - (booking.paymentStatus === 'fully_paid' ? totalPrice : depositAmount));

  // Estimated Labor Hours Calculation (Based on SqFt, bedrooms, bathrooms, and add-ons)
  const sqftHours = ((booking.squareFootage || 1000) / 1000) * 0.75;
  const roomHours = (booking.bedrooms || 0) * 0.35 + (booking.bathrooms || 0) * 0.45;
  const addOnHours = (booking.selectedAddOns?.length || 0) * 0.35;
  const baseHours = isComm ? 2.0 : 1.5;
  const estimatedLaborHours = Math.round((baseHours + sqftHours + roomHours + addOnHours) * 10) / 10;

  return {
    basePrice,
    sqFtFee,
    bedroomFee,
    bathroomFee,
    typeMultiplier,
    frequencyDiscountPercent,
    frequencyDiscountAmount,
    addOnsBreakdown,
    subtotal,
    totalPrice,
    depositAmount,
    balanceDue,
    estimatedLaborHours,
  };
}

export interface MonthlyReconciliationMetrics {
  currentMonthName: string;
  // MTD Completed Cleanings
  mtdCompletedJobsCount: number;
  mtdCompletedDollarVolume: number;
  mtdCompletedLaborHours: number;
  mtdAverageTicket: number;

  // Remaining Scheduled Cleanings
  remainingScheduledJobsCount: number;
  remainingScheduledDollarVolume: number;
  remainingScheduledLaborHours: number;
  remainingJobsList: (Booking & { breakdown: ItemizedBookingBreakdown })[];

  // Total Month Forecast (Completed + Remaining)
  totalMonthForecastRevenue: number;
  totalMonthForecastJobs: number;
  totalMonthForecastLaborHours: number;

  // Monthly Budget & Reconciliation
  projectedMonthlyBudgetRevenue: number;
  revenueVarianceDollar: number;
  revenueVariancePercent: number;
  reconciliationStatus: 'AHEAD_OF_BUDGET' | 'ON_TRACK' | 'BEHIND_BUDGET';

  // Next Month Forecast
  nextMonthName: string;
  recurringWeeklyContractsCount: number;
  recurringBiWeeklyContractsCount: number;
  recurringMonthlyContractsCount: number;
  nextMonthRecurringRevenue: number;
  nextMonthNewJobsProjectedRevenue: number;
  nextMonthTotalProjectedRevenue: number;
  nextMonthProjectedJobsCount: number;
  nextMonthProjectedLaborHours: number;
}

export function computeFinancialReconciliation(
  bookings: Booking[],
  pricingConfig: PricingConfig = defaultPricingFallback,
  monthlyTargetRevenue: number = 3200
): MonthlyReconciliationMetrics {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentMonthName = `${monthNames[currentMonth]} ${currentYear}`;
  const nextMonthIdx = (currentMonth + 1) % 12;
  const nextMonthYear = currentMonth === 11 ? currentYear + 1 : currentYear;
  const nextMonthName = `${monthNames[nextMonthIdx]} ${nextMonthYear}`;

  let mtdCompletedJobsCount = 0;
  let mtdCompletedDollarVolume = 0;
  let mtdCompletedLaborHours = 0;

  let remainingScheduledJobsCount = 0;
  let remainingScheduledDollarVolume = 0;
  let remainingScheduledLaborHours = 0;

  const remainingJobsList: (Booking & { breakdown: ItemizedBookingBreakdown })[] = [];

  // Recurring contracts detection
  const clientRecurringMap = new Map<string, { type: string; price: number; breakdown: ItemizedBookingBreakdown }>();

  bookings.forEach((bk) => {
    if (bk.bookingStatus === 'cancelled') return;

    const bkDate = new Date(bk.date);
    const breakdown = calculateItemizedBreakdown(bk, pricingConfig);

    // Check if in current month
    const isCurrentMonth = bkDate.getFullYear() === currentYear && bkDate.getMonth() === currentMonth;

    if (isCurrentMonth) {
      if (bk.bookingStatus === 'completed' || bkDate < now) {
        mtdCompletedJobsCount++;
        mtdCompletedDollarVolume += bk.totalPrice || breakdown.totalPrice;
        mtdCompletedLaborHours += breakdown.estimatedLaborHours;
      } else {
        remainingScheduledJobsCount++;
        remainingScheduledDollarVolume += bk.totalPrice || breakdown.totalPrice;
        remainingScheduledLaborHours += breakdown.estimatedLaborHours;
        remainingJobsList.push({
          ...bk,
          breakdown,
        });
      }
    }

    // Track recurring customer contracts for next month repeat business forecast
    if (bk.cleaningType === 'weekly' || bk.cleaningType === 'bi-weekly' || bk.cleaningType === 'monthly') {
      clientRecurringMap.set(bk.customerEmail || bk.customerId, {
        type: bk.cleaningType,
        price: bk.totalPrice || breakdown.totalPrice,
        breakdown,
      });
    }
  });

  // Sort remaining jobs chronologically by date & timeSlot
  remainingJobsList.sort((a, b) => a.date.localeCompare(b.date));

  const mtdAverageTicket = mtdCompletedJobsCount > 0 ? Math.round(mtdCompletedDollarVolume / mtdCompletedJobsCount) : 0;

  const totalMonthForecastRevenue = mtdCompletedDollarVolume + remainingScheduledDollarVolume;
  const totalMonthForecastJobs = mtdCompletedJobsCount + remainingScheduledJobsCount;
  const totalMonthForecastLaborHours = Math.round((mtdCompletedLaborHours + remainingScheduledLaborHours) * 10) / 10;

  // Reconciliation Variance Analysis
  const revenueVarianceDollar = totalMonthForecastRevenue - monthlyTargetRevenue;
  const revenueVariancePercent = monthlyTargetRevenue > 0
    ? Math.round((revenueVarianceDollar / monthlyTargetRevenue) * 1000) / 10
    : 0;

  let reconciliationStatus: 'AHEAD_OF_BUDGET' | 'ON_TRACK' | 'BEHIND_BUDGET' = 'ON_TRACK';
  if (revenueVariancePercent >= 5) reconciliationStatus = 'AHEAD_OF_BUDGET';
  else if (revenueVariancePercent < -5) reconciliationStatus = 'BEHIND_BUDGET';

  // Next Month Repeat Business & Forecasting Engine
  let recurringWeeklyContractsCount = 0;
  let recurringBiWeeklyContractsCount = 0;
  let recurringMonthlyContractsCount = 0;

  let nextMonthRecurringRevenue = 0;
  let nextMonthProjectedLaborHours = 0;

  clientRecurringMap.forEach((contract) => {
    if (contract.type === 'weekly') {
      recurringWeeklyContractsCount++;
      nextMonthRecurringRevenue += contract.price * 4.3; // Avg 4.3 weeks/month
      nextMonthProjectedLaborHours += contract.breakdown.estimatedLaborHours * 4.3;
    } else if (contract.type === 'bi-weekly') {
      recurringBiWeeklyContractsCount++;
      nextMonthRecurringRevenue += contract.price * 2.15; // Avg 2.15 visits/month
      nextMonthProjectedLaborHours += contract.breakdown.estimatedLaborHours * 2.15;
    } else if (contract.type === 'monthly') {
      recurringMonthlyContractsCount++;
      nextMonthRecurringRevenue += contract.price * 1.0;
      nextMonthProjectedLaborHours += contract.breakdown.estimatedLaborHours * 1.0;
    }
  });

  nextMonthRecurringRevenue = Math.round(nextMonthRecurringRevenue);

  // Projected new custom/one-time business based on historical monthly organic ratio (~25% growth)
  const nextMonthNewJobsProjectedRevenue = Math.round(totalMonthForecastRevenue * 0.25);
  const nextMonthTotalProjectedRevenue = nextMonthRecurringRevenue + nextMonthNewJobsProjectedRevenue;

  const totalRecurringJobsCount = Math.round(
    recurringWeeklyContractsCount * 4.3 + recurringBiWeeklyContractsCount * 2.15 + recurringMonthlyContractsCount * 1.0
  );
  const nextMonthProjectedJobsCount = totalRecurringJobsCount + Math.round(totalMonthForecastJobs * 0.2);

  nextMonthProjectedLaborHours = Math.round((nextMonthProjectedLaborHours + totalMonthForecastLaborHours * 0.2) * 10) / 10;

  return {
    currentMonthName,
    mtdCompletedJobsCount,
    mtdCompletedDollarVolume,
    mtdCompletedLaborHours,
    mtdAverageTicket,

    remainingScheduledJobsCount,
    remainingScheduledDollarVolume,
    remainingScheduledLaborHours,
    remainingJobsList,

    totalMonthForecastRevenue,
    totalMonthForecastJobs,
    totalMonthForecastLaborHours,

    projectedMonthlyBudgetRevenue: monthlyTargetRevenue,
    revenueVarianceDollar,
    revenueVariancePercent,
    reconciliationStatus,

    nextMonthName,
    recurringWeeklyContractsCount,
    recurringBiWeeklyContractsCount,
    recurringMonthlyContractsCount,
    nextMonthRecurringRevenue,
    nextMonthNewJobsProjectedRevenue,
    nextMonthTotalProjectedRevenue,
    nextMonthProjectedJobsCount,
    nextMonthProjectedLaborHours,
  };
}
