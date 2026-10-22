import { ChargerListing, UserProfile, Booking, DisputeReport } from '../types';

export const INITIAL_USERS: UserProfile[] = [];
export const INITIAL_CHARGERS: ChargerListing[] = [];
export const INITIAL_BOOKINGS: Booking[] = [];
export const INITIAL_DISPUTES: DisputeReport[] = [];

// Clean seed nodes in English for calibration testing
export const SEED_CALIBRATION_CHARGERS: ChargerListing[] = [
  {
    id: 'chg-sky-01',
    hostId: 'host-101',
    hostName: 'David Anderson, PE',
    hostAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    hostRating: 4.9,
    hostReviewsCount: 18,
    title: 'Metro Hub 22kW Dual AC Charger',
    description: 'High-speed Level 2 commercial-grade wallbox with solar battery backup, Type B RCD protection and digital energy metering.',
    photos: [
      'https://images.unsplash.com/photo-1558441719-798481498b3f?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&auto=format&fit=crop&q=80'
    ],
    approxAddress: 'Financial District, Central Ave (approx. 200m radius)',
    exactAddress: '450 North Central Ave, Bay 4, Metropolis',
    lat: 37.7749,
    lng: -122.4194,
    powerKw: 22,
    powerTier: 'fast',
    connectorTypes: ['Type 2', 'CCS-2'],
    cableLengthMeters: 7.5,
    simultaneousSlots: 1,
    pricingType: 'per-kwh',
    priceRate: 0.28, // $0.28 per kWh
    safetyCertificateName: 'Certified_Electrical_Safety_Report_2026.pdf',
    safetyCertificateVerified: true,
    schedule: {
      is247: true,
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      hours: 'Open 24/7',
    },
    amenities: ['Covered Canopy', 'HD CCTV Security', 'High-Speed WiFi', 'Keyless Gate Access'],
    accessNotes: 'Automated boom barrier with sensor. Access PIN: 4829#.',
    bookingMode: 'instant',
    maxDurationHours: 4,
    status: 'available',
    listingStatus: 'live',
    createdAt: '2026-10-10',
  },
  {
    id: 'chg-sky-02',
    hostId: 'host-102',
    hostName: 'Apex Green Energy',
    hostAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    hostRating: 4.8,
    hostReviewsCount: 11,
    title: 'West Corridor 50kW Rapid DC Port',
    description: 'Direct DC fast charger compatible with all CCS-2 and GB/T vehicles. Optimal for intercity commuters and quick 25-minute boosts.',
    photos: [
      'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&auto=format&fit=crop&q=80'
    ],
    approxAddress: 'Technology Park, West Boulevard',
    exactAddress: '880 Innovation Parkway, Suite 120',
    lat: 37.7892,
    lng: -122.4014,
    powerKw: 50,
    powerTier: 'rapid',
    connectorTypes: ['CCS-2', 'GB/T'],
    cableLengthMeters: 5.0,
    simultaneousSlots: 1,
    pricingType: 'per-kwh',
    priceRate: 0.42, // $0.42 per kWh
    safetyCertificateName: 'High_Voltage_DC_Safety_Approval.pdf',
    safetyCertificateVerified: true,
    schedule: {
      is247: false,
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      hours: '06:00 AM - 11:00 PM',
    },
    amenities: ['Covered Canopy', 'CCTV Security', 'Tire Pressure Station'],
    accessNotes: 'Drive up lane B directly to charger spot #1.',
    bookingMode: 'instant',
    maxDurationHours: 2,
    status: 'available',
    listingStatus: 'live',
    createdAt: '2026-10-15',
  }
];
