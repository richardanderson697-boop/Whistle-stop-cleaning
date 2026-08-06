import { PricingConfig, EstimateRequest, Booking, TimeSlot, NotificationLog, SupplyItem, StaffMember } from '../types';

export const defaultPricingConfig: PricingConfig = {
  baseResidentialPrice: 120,
  baseCommercialPrice: 200,
  pricePerSqFt: 0.08,
  pricePerBedroom: 25,
  pricePerBathroom: 35,
  moveInOutMultiplier: 1.3,
  constructionMultiplier: 1.5,
  deepCleanMultiplier: 1.4,
  weeklyDiscountPercent: 15,
  biWeeklyDiscountPercent: 10,
  monthlyDiscountPercent: 5,
  addOns: [
    {
      id: 'inside-fridge',
      name: 'Inside Fridge Cleaning',
      description: 'Deep clean and sanitize inside refrigerator & shelves',
      price: 35,
    },
    {
      id: 'inside-oven',
      name: 'Inside Oven Detailing',
      description: 'Remove baked-on grease and grime from oven interior',
      price: 45,
    },
    {
      id: 'interior-windows',
      name: 'Interior Window Washing',
      description: 'Clean glass, sills, and tracks on up to 10 windows',
      price: 50,
    },
    {
      id: 'cabinet-interior',
      name: 'Inside Cabinets & Drawers',
      description: 'Wipe clean interior of all kitchen/bathroom cabinets',
      price: 40,
    },
    {
      id: 'baseboards-fans',
      name: 'Baseboards & Ceiling Fans Detail',
      description: 'Hand-wipe all baseboards and dust high ceiling fans',
      price: 30,
    },
    {
      id: 'sanitization-fog',
      name: 'Electrostatic Sanitize Fog',
      description: 'Hospital-grade surface sanitization',
      price: 60,
    },
  ],
};

export const sampleEstimateRequests: EstimateRequest[] = [
  {
    id: 'EST-1001',
    category: 'residential',
    cleaningType: 'move-in-out',
    squareFootage: 2100,
    bedrooms: 3,
    bathrooms: 2.5,
    frequencyPreference: 'one-time',
    photos: [
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800'
    ],
    customerName: 'Sarah Jenkins',
    customerPhone: '(555) 234-5678',
    customerEmail: 'sarah.j@example.com',
    propertyAddress: '742 Evergreen Terrace, Springfield',
    specialInstructions: 'Focus heavily on kitchen oven and master bathroom tile grout. Move-in date is Friday.',
    preferredDate: '2026-08-10',
    preferredTimeSlot: '08:00 AM - 11:00 AM',
    status: 'pending',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'EST-1002',
    category: 'commercial',
    cleaningType: 'construction-cleanup',
    squareFootage: 3500,
    bedrooms: 0,
    bathrooms: 4,
    frequencyPreference: 'one-time',
    photos: [
      'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=800'
    ],
    customerName: 'Apex Architecture Group',
    customerPhone: '(555) 987-6543',
    customerEmail: 'projects@apexarch.com',
    propertyAddress: '100 Main St, Suite 400',
    specialInstructions: 'Post-renovation drywall dust cleanup, window glass polish, and hard surface floor buffing.',
    preferredDate: '2026-08-12',
    preferredTimeSlot: '12:00 PM - 03:00 PM',
    status: 'quoted',
    estimatedPrice: 680,
    adminNotes: 'Assigned 3 technicians. Construction cleanup equipment required.',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
  }
];

export const sampleBookings: Booking[] = [
  {
    id: 'BK-2001',
    customerId: 'usr-101',
    customerName: 'Michael Chang',
    customerPhone: '(555) 456-7890',
    customerEmail: 'mchang@example.com',
    propertyAddress: '128 Pinecrest Rd, Oakville',
    category: 'residential',
    cleaningType: 'deep-cleaning',
    squareFootage: 1850,
    bedrooms: 3,
    bathrooms: 2,
    selectedAddOns: ['inside-fridge', 'interior-windows'],
    date: '2026-08-08',
    timeSlot: '08:00 AM - 11:00 AM',
    totalPrice: 320,
    depositAmount: 80,
    paymentStatus: 'deposit_paid',
    bookingStatus: 'confirmed',
    stripePaymentIntentId: 'pi_3M001122334455',
    entryNotes: 'Gate code 4821. Key in lockbox on front porch.',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'BK-2002',
    customerId: 'usr-102',
    customerName: 'Elena Rostova',
    customerPhone: '(555) 321-7654',
    customerEmail: 'elena.rostova@example.com',
    propertyAddress: '405 Harbour View Blvd, Apt 12B',
    category: 'residential',
    cleaningType: 'bi-weekly',
    squareFootage: 1200,
    bedrooms: 2,
    bathrooms: 2,
    selectedAddOns: ['baseboards-fans'],
    date: '2026-08-06',
    timeSlot: '12:00 PM - 03:00 PM',
    totalPrice: 195,
    depositAmount: 195,
    paymentStatus: 'fully_paid',
    bookingStatus: 'confirmed',
    stripePaymentIntentId: 'pi_3M998877665544',
    entryNotes: 'Ring bell at lobby. Friendly cat inside.',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
  }
];

export const generateInitialTimeSlots = (): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const today = new Date();
  const ranges = [
    '08:00 AM - 11:00 AM',
    '11:30 AM - 02:30 PM',
    '03:00 PM - 06:00 PM'
  ];

  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];

    ranges.forEach((range, idx) => {
      slots.push({
        id: `slot-${dateStr}-${idx}`,
        date: dateStr,
        timeRange: range,
        capacity: 2,
        bookedCount: (i === 1 && idx === 0) ? 1 : 0,
        isBlocked: i === 0 && idx === 0, // Block past or morning slot for today
      });
    });
  }
  return slots;
};

export const sampleNotificationLogs: NotificationLog[] = [
  {
    id: 'NOTIF-3001',
    recipient: 'admin@whistlestopcleaning.com',
    channel: 'EMAIL',
    subject: 'New Cleaning Estimate Request (EST-1001)',
    message: 'New residential Move-In/Move-Out questionnaire submitted by Sarah Jenkins. Photos attached.',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    status: 'Delivered',
  },
  {
    id: 'NOTIF-3002',
    recipient: '(555) 234-5678',
    channel: 'SMS',
    subject: 'Whistle Stop Cleaning Confirmation',
    message: 'Hi Sarah! We received your estimate request. Our team will review your details and respond within 24 hours. - Whistle Stop Cleaning',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    status: 'Delivered',
  }
];

export const sampleSupplies: SupplyItem[] = [
  {
    id: 'sup-1',
    name: 'Commercial HEPA Vacuum Cleaners',
    category: 'equipment',
    quantityInStock: 4,
    unit: 'units',
    costPerUnit: 350.00,
    reorderThreshold: 2,
    estimatedUsesPerUnit: 150,
  },
  {
    id: 'sup-2',
    name: 'Industrial Carpet Extractor Machine',
    category: 'equipment',
    quantityInStock: 2,
    unit: 'units',
    costPerUnit: 850.00,
    reorderThreshold: 1,
    estimatedUsesPerUnit: 200,
  },
  {
    id: 'sup-3',
    name: 'Microfiber Cleaning Towels (50 Pack)',
    category: 'towel_cloth',
    quantityInStock: 12,
    unit: 'packs',
    costPerUnit: 32.50,
    reorderThreshold: 4,
    estimatedUsesPerUnit: 25,
  },
  {
    id: 'sup-4',
    name: 'Pro Multi-Surface Disinfectant (Gallon)',
    category: 'chemical',
    quantityInStock: 8,
    unit: 'gallons',
    costPerUnit: 24.00,
    reorderThreshold: 3,
    estimatedUsesPerUnit: 20,
  },
  {
    id: 'sup-5',
    name: 'Heavy Duty Carpet Shampoo Concentrate',
    category: 'chemical',
    quantityInStock: 5,
    unit: 'gallons',
    costPerUnit: 38.00,
    reorderThreshold: 2,
    estimatedUsesPerUnit: 12,
  },
  {
    id: 'sup-6',
    name: 'Nitrile Protective Gloves (Box 100)',
    category: 'disposable',
    quantityInStock: 15,
    unit: 'boxes',
    costPerUnit: 14.50,
    reorderThreshold: 5,
    estimatedUsesPerUnit: 15,
  },
  {
    id: 'sup-7',
    name: 'Microfiber Flat Mop Replacement Heads',
    category: 'towel_cloth',
    quantityInStock: 18,
    unit: 'units',
    costPerUnit: 8.50,
    reorderThreshold: 6,
    estimatedUsesPerUnit: 10,
  }
];

export const sampleStaff: StaffMember[] = [
  {
    id: 'stf-101',
    name: 'John Miller',
    phone: '(555) 789-0123',
    email: 'john.m@whistlestopcleaning.com',
    role: 'lead_cleaner',
    status: 'active',
  },
  {
    id: 'stf-102',
    name: 'Elena Vance',
    phone: '(555) 654-3210',
    email: 'elena.v@whistlestopcleaning.com',
    role: 'commercial_specialist',
    status: 'active',
  },
  {
    id: 'stf-103',
    name: 'Carlos Rodriguez',
    phone: '(555) 890-1234',
    email: 'carlos.r@whistlestopcleaning.com',
    role: 'cleaner',
    status: 'active',
  }
];
