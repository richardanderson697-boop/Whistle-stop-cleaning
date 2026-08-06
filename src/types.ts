export type ServiceCategory = 'residential' | 'commercial';

export type CleaningType = 
  | 'one-time'
  | 'weekly'
  | 'bi-weekly'
  | 'monthly'
  | 'deep-cleaning'
  | 'move-in-out'
  | 'construction-cleanup';

export interface AddOnOption {
  id: string;
  name: string;
  description: string;
  price: number;
  icon?: string;
}

export interface PricingConfig {
  baseResidentialPrice: number;
  baseCommercialPrice: number;
  pricePerSqFt: number;
  pricePerBedroom: number;
  pricePerBathroom: number;
  moveInOutMultiplier: number;
  constructionMultiplier: number;
  deepCleanMultiplier: number;
  weeklyDiscountPercent: number;
  biWeeklyDiscountPercent: number;
  monthlyDiscountPercent: number;
  addOns: AddOnOption[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin';
  address?: string;
}

export interface EstimateRequest {
  id: string;
  category: ServiceCategory;
  cleaningType: CleaningType;
  squareFootage: number;
  bedrooms: number;
  bathrooms: number;
  frequencyPreference: 'one-time' | 'weekly' | 'bi-weekly' | 'monthly';
  photos: string[]; // Base64 or object URLs
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  propertyAddress: string;
  specialInstructions?: string;
  preferredDate?: string;
  preferredTimeSlot?: string;
  status: 'pending' | 'quoted' | 'approved' | 'declined';
  estimatedPrice?: number;
  adminNotes?: string;
  createdAt: string;
}

export interface TimeSlot {
  id: string;
  date: string; // YYYY-MM-DD
  timeRange: string; // e.g., "08:00 AM - 11:00 AM"
  capacity: number;
  bookedCount: number;
  isBlocked: boolean;
}

export interface StaffMember {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: 'lead_cleaner' | 'cleaner' | 'commercial_specialist';
  status: 'active' | 'off_duty';
}

export interface SupplyItem {
  id: string;
  name: string;
  category: 'equipment' | 'chemical' | 'disposable' | 'towel_cloth';
  quantityInStock: number;
  unit: string;
  costPerUnit: number;
  reorderThreshold: number;
  estimatedUsesPerUnit: number; // Number of rooms/jobs 1 unit can clean
}

export interface StripeConfigStatus {
  hasSecretKey: boolean;
  hasPublishableKey: boolean;
  publishableKeySnippet: string;
  isTestMode: boolean;
}

export interface Booking {
  id: string;
  estimateId?: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  propertyAddress: string;
  category: ServiceCategory;
  cleaningType: CleaningType;
  squareFootage: number;
  bedrooms: number;
  bathrooms: number;
  selectedAddOns: string[];
  date: string; // YYYY-MM-DD
  timeSlot: string;
  totalPrice: number;
  depositAmount: number;
  paymentStatus: 'unpaid' | 'deposit_paid' | 'fully_paid';
  bookingStatus: 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  stripePaymentIntentId?: string;
  entryNotes?: string;
  assignedStaffIds?: string[];
  assignedStaffNames?: string[];
  createdAt: string;
}

export interface NotificationLog {
  id: string;
  recipient: string; // Phone number or Email
  channel: 'SMS' | 'EMAIL';
  subject: string;
  message: string;
  timestamp: string;
  status: 'Sent' | 'Delivered';
}
