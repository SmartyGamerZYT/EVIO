export type UserRole = 'driver' | 'hub' | 'supervisor';

export type ConnectorType = 'Type 2' | 'CCS-2' | 'GB/T' | 'Type 1' | 'CHAdeMO';

export type PowerTier = 'slow' | 'fast' | 'rapid'; // slow: 3-7kW, fast: 11-22kW, rapid: 50kW+

export type ChargerStatus = 'available' | 'in-use' | 'offline';

export type ListingStatus = 'draft' | 'pending' | 'live' | 'paused' | 'rejected';

export type PricingType = 'per-kwh' | 'per-hour' | 'flat';

export type BookingStatus = 'requested' | 'confirmed' | 'active' | 'completed' | 'cancelled' | 'rejected';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone: string;
  role: UserRole;
  avatar: string;
  isVerified: boolean;
  walletBalance: number;
  vehicle?: {
    model: string;
    make: string;
    batteryCapacity: number; // in kWh
    connector: ConnectorType;
    plateNumber: string;
  };
}

export interface ChargerListing {
  id: string;
  hostId: string;
  hostName: string;
  hostAvatar: string;
  hostRating: number;
  hostReviewsCount: number;
  title: string;
  description: string;
  photos: string[];
  approxAddress: string; // Shown publicly
  exactAddress: string;  // Shown only after confirmed booking
  lat: number;
  lng: number;
  powerKw: number;
  powerTier: PowerTier;
  connectorTypes: ConnectorType[];
  cableLengthMeters: number;
  simultaneousSlots: number;
  pricingType: PricingType;
  priceRate: number; // In local currency per unit
  safetyCertificateName?: string;
  safetyCertificateVerified: boolean;
  schedule: {
    is247: boolean;
    days: string[];
    hours: string;
  };
  amenities: string[];
  accessNotes: string; // Gate code, parking spot notes (shown after booking)
  bookingMode: 'instant' | 'approval';
  maxDurationHours: number;
  status: ChargerStatus;
  listingStatus: ListingStatus;
  rejectionReason?: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  chargerId: string;
  chargerTitle: string;
  hostId: string;
  hostName: string;
  driverId: string;
  driverName: string;
  driverVehicle: string;
  driverConnector: ConnectorType;
  startTime: string;
  endTime: string;
  durationHours: number;
  estimatedKwh: number;
  totalAmount: number;
  platformFee: number;
  status: BookingStatus;
  paymentMethod: 'wallet' | 'upi' | 'card';
  paymentStatus: 'paid' | 'pending' | 'refunded';
  createdAt: string;
  activeSession?: {
    startedAt: string;
    currentKwh: number;
    currentCost: number;
    batteryPercentage: number;
    flowRateKw: number;
  };
}

export interface ChatMessage {
  id: string;
  bookingId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  text: string;
  timestamp: string;
  isAutomated?: boolean;
}

export interface DisputeReport {
  id: string;
  bookingId: string;
  chargerId: string;
  chargerTitle: string;
  reporterId: string;
  reporterName: string;
  reason: string;
  details: string;
  status: 'open' | 'investigating' | 'resolved';
  createdAt: string;
}
