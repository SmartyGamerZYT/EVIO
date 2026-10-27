import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  UserProfile, 
  ChargerListing, 
  Booking, 
  UserRole, 
  ChatMessage, 
  DisputeReport 
} from '../types';
import { INITIAL_USERS, INITIAL_CHARGERS, INITIAL_BOOKINGS, INITIAL_DISPUTES, SEED_CALIBRATION_CHARGERS } from '../data/mockData';

export type Currency = 'USD' | 'EUR' | 'INR' | 'GBP';

interface AppContextType {
  currentUser: UserProfile | null;
  loginUser: (user: UserProfile) => void;
  loginWithCredentials: (email: string, password: string) => { success: boolean; error?: string; user?: UserProfile };
  registerAccount: (account: UserProfile) => { success: boolean; error?: string };
  logoutUser: () => void;
  role: UserRole;
  switchRole: (role: UserRole) => void;
  userCoords: [number, number];
  setUserCoords: (coords: [number, number]) => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatCurrency: (amount: number) => string;
  chargers: ChargerListing[];
  loadSeedChargers: () => void;
  clearAllChargers: () => void;
  addChargerListing: (newCharger: Omit<ChargerListing, 'id' | 'createdAt' | 'status' | 'listingStatus'>) => ChargerListing;
  deleteCharger: (chargerId: string) => void;
  updateChargerStatus: (chargerId: string, status: ChargerListing['status']) => void;
  approveChargerListing: (chargerId: string) => void;
  rejectChargerListing: (chargerId: string, reason: string) => void;
  toggleHostVacation: (chargerId: string) => void;
  bookings: Booking[];
  createBooking: (
    charger: ChargerListing,
    startTime: string,
    endTime: string,
    durationHours: number,
    estimatedKwh: number,
    paymentMethod: 'wallet' | 'upi' | 'card'
  ) => { success: boolean; error?: string; booking?: Booking };
  acceptBookingRequest: (bookingId: string) => void;
  declineBookingRequest: (bookingId: string) => void;
  startChargingSession: (bookingId: string) => void;
  activeBooking: Booking | null;
  stopActiveSession: () => void;
  topUpWallet: (amount: number) => void;
  chatMessages: ChatMessage[];
  sendChatMessage: (bookingId: string, text: string) => void;
  disputes: DisputeReport[];
  resolveDispute: (disputeId: string) => void;
  notifications: Array<{ id: string; title: string; desc: string; time: string; read: boolean }>;
  markNotificationsAsRead: () => void;
}

const DEFAULT_ACCOUNTS: UserProfile[] = [
  {
    id: 'usr-driver-demo',
    name: 'Sarah Jenkins (Driver)',
    email: 'driver@evio.com',
    password: 'driver123',
    phone: '+1 555-0192',
    role: 'driver',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    isVerified: true,
    walletBalance: 2500.0,
    vehicle: {
      make: 'Tesla',
      model: 'Model Y Long Range',
      batteryCapacity: 75.0,
      connector: 'CCS-2',
      plateNumber: 'EV-7829',
    }
  },
  {
    id: 'usr-hub-demo',
    name: 'Marcus Vance (Hub Host)',
    email: 'hub@evio.com',
    password: 'hub123',
    phone: '+1 555-0144',
    role: 'hub',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    isVerified: true,
    walletBalance: 15400.0,
  },
  {
    id: 'usr-supervisor-demo',
    name: 'Elena Rostova (Grid Supervisor)',
    email: 'supervisor@evio.com',
    password: 'super123',
    phone: '+1 555-0199',
    role: 'supervisor',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    isVerified: true,
    walletBalance: 0,
  },
  // Unified ID accounts for testing:
  // "id can be same for all dashboard but the password created during registration for specific dashboard will decide on which dashboard it should drop"
  {
    id: 'usr-multi-driver',
    name: 'Alex Demo (Driver)',
    email: 'demo@evio.com',
    password: 'driver123',
    phone: '+1 555-9001',
    role: 'driver',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    isVerified: true,
    walletBalance: 2800.0,
    vehicle: {
      make: 'Hyundai',
      model: 'Ioniq 5',
      batteryCapacity: 77.4,
      connector: 'CCS-2',
      plateNumber: 'IO-9921',
    }
  },
  {
    id: 'usr-multi-hub',
    name: 'Alex Demo (Hub Host)',
    email: 'demo@evio.com',
    password: 'hub123',
    phone: '+1 555-9002',
    role: 'hub',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    isVerified: true,
    walletBalance: 18500.0,
  },
  {
    id: 'usr-multi-supervisor',
    name: 'Alex Demo (Supervisor)',
    email: 'demo@evio.com',
    password: 'super123',
    phone: '+1 555-9003',
    role: 'supervisor',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    isVerified: true,
    walletBalance: 0,
  }
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [registeredAccounts, setRegisteredAccounts] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('evio_accounts');
    return saved ? JSON.parse(saved) : DEFAULT_ACCOUNTS;
  });

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('evio_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [userCoords, setUserCoords] = useState<[number, number]>([37.7749, -122.4194]);
  const [currency, setCurrency] = useState<Currency>('INR');

  const [chargers, setChargers] = useState<ChargerListing[]>(() => {
    const saved = localStorage.getItem('evio_chargers');
    return saved ? JSON.parse(saved) : INITIAL_CHARGERS;
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('evio_bookings');
    return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
  });

  const [disputes, setDisputes] = useState<DisputeReport[]>(() => {
    const saved = localStorage.getItem('evio_disputes');
    return saved ? JSON.parse(saved) : INITIAL_DISPUTES;
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [notifications, setNotifications] = useState<Array<{ id: string; title: string; desc: string; time: string; read: boolean }>>([]);

  useEffect(() => {
    localStorage.setItem('evio_accounts', JSON.stringify(registeredAccounts));
  }, [registeredAccounts]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('evio_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('evio_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('evio_chargers', JSON.stringify(chargers));
  }, [chargers]);

  useEffect(() => {
    localStorage.setItem('evio_bookings', JSON.stringify(bookings));
  }, [bookings]);

  const role: UserRole = currentUser?.role || 'driver';

  const loginUser = (user: UserProfile) => {
    setCurrentUser(user);
    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        title: 'Authentication Verified',
        desc: `Session initialized for ${user.name} (${user.role.toUpperCase()}).`,
        time: 'Just now',
        read: false,
      },
      ...prev
    ]);
  };

  // Password-based dashboard routing: ID can be the same, but password created during registration decides the dashboard
  const loginWithCredentials = (emailInput: string, passwordInput: string) => {
    const trimmedEmail = emailInput.trim().toLowerCase();
    const match = registeredAccounts.find(
      acc => acc.email.trim().toLowerCase() === trimmedEmail && acc.password === passwordInput
    );

    if (match) {
      setCurrentUser(match);
      setNotifications(prev => [
        {
          id: `notif-${Date.now()}`,
          title: `${match.role.toUpperCase()} Authentication Successful`,
          desc: `Redirected to ${match.role.toUpperCase()} Dashboard as ${match.name}.`,
          time: 'Just now',
          read: false,
        },
        ...prev
      ]);
      return { success: true, user: match };
    }

    return { 
      success: false, 
      error: 'Invalid credentials. No account found for this ID and Password combination. Register or verify your credentials.' 
    };
  };

  const registerAccount = (account: UserProfile) => {
    // Check if an account with same email AND same password already exists
    const existing = registeredAccounts.find(
      a => a.email.toLowerCase() === account.email.toLowerCase() && a.password === account.password
    );

    if (existing) {
      return { 
        success: false, 
        error: 'An account with this ID and password already exists. Please choose a different password for this dashboard.' 
      };
    }

    const updated = [account, ...registeredAccounts];
    setRegisteredAccounts(updated);
    setCurrentUser(account);

    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        title: 'Account Registered',
        desc: `New ${account.role.toUpperCase()} account created for ${account.name}. Dashboard initialized.`,
        time: 'Just now',
        read: false,
      },
      ...prev
    ]);

    return { success: true };
  };

  const logoutUser = () => {
    setCurrentUser(null);
  };

  const switchRole = (newRole: UserRole) => {
    if (!currentUser) return;
    const updated = { ...currentUser, role: newRole };
    setCurrentUser(updated);
  };

  const loadSeedChargers = () => {
    setChargers(SEED_CALIBRATION_CHARGERS);
  };

  const clearAllChargers = () => {
    setChargers([]);
  };

  const formatCurrency = (amount: number): string => {
    switch (currency) {
      case 'EUR':
        return `€${amount.toFixed(2)}`;
      case 'USD':
        return `$${amount.toFixed(2)}`;
      case 'GBP':
        return `£${amount.toFixed(2)}`;
      case 'INR':
      default:
        return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
    }
  };

  const activeBooking = bookings.find(b => b.status === 'active') || null;

  useEffect(() => {
    if (!activeBooking) return;

    const timer = setInterval(() => {
      setBookings(prev => prev.map(b => {
        if (b.id !== activeBooking.id || !b.activeSession) return b;
        const currentPercentage = Math.min(100, b.activeSession.batteryPercentage + 1);
        const addedKwh = 0.20;
        const newKwh = Number((b.activeSession.currentKwh + addedKwh).toFixed(2));
        const rate = 0.28;
        const newCost = Number((newKwh * rate).toFixed(2));

        return {
          ...b,
          activeSession: {
            ...b.activeSession,
            batteryPercentage: currentPercentage,
            currentKwh: newKwh,
            currentCost: newCost,
          }
        };
      }));
    }, 4000);

    return () => clearInterval(timer);
  }, [activeBooking?.id]);

  const addChargerListing = (
    newChargerData: Omit<ChargerListing, 'id' | 'createdAt' | 'status' | 'listingStatus'>
  ): ChargerListing => {
    const newCharger: ChargerListing = {
      ...newChargerData,
      id: `NODE-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'offline',
      listingStatus: 'pending',
    };

    setChargers(prev => [newCharger, ...prev]);

    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        title: 'Listing Submitted for Compliance Review',
        desc: `Station [${newCharger.title}] queued for electrical verification.`,
        time: 'Just now',
        read: false,
      },
      ...prev
    ]);

    return newCharger;
  };

  const deleteCharger = (chargerId: string) => {
    setChargers(prev => prev.filter(c => c.id !== chargerId));
    setBookings(prev => prev.map(b => b.chargerId === chargerId ? { ...b, status: 'cancelled' } : b));

    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        title: 'Station Deleted',
        desc: `Charging node ${chargerId} permanently removed from the system.`,
        time: 'Just now',
        read: false
      },
      ...prev
    ]);
  };

  const updateChargerStatus = (chargerId: string, status: ChargerListing['status']) => {
    setChargers(prev => prev.map(c => c.id === chargerId ? { ...c, status } : c));
  };

  const approveChargerListing = (chargerId: string) => {
    setChargers(prev => prev.map(c => c.id === chargerId ? { 
      ...c, 
      listingStatus: 'live', 
      status: 'available',
      safetyCertificateVerified: true 
    } : c));

    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        title: 'Listing Approved & Activated',
        desc: `Charging node ${chargerId} certified by administrator and published live.`,
        time: 'Just now',
        read: false,
      },
      ...prev
    ]);
  };

  const rejectChargerListing = (chargerId: string, reason: string) => {
    setChargers(prev => prev.map(c => c.id === chargerId ? { 
      ...c, 
      listingStatus: 'rejected', 
      rejectionReason: reason 
    } : c));
  };

  const toggleHostVacation = (chargerId: string) => {
    setChargers(prev => prev.map(c => {
      if (c.id !== chargerId) return c;
      const nextStatus = c.listingStatus === 'paused' ? 'live' : 'paused';
      const mapStatus = nextStatus === 'live' ? 'available' : 'offline';
      return { ...c, listingStatus: nextStatus, status: mapStatus };
    }));
  };

  const createBooking = (
    charger: ChargerListing,
    startTime: string,
    endTime: string,
    durationHours: number,
    estimatedKwh: number,
    paymentMethod: 'wallet' | 'upi' | 'card'
  ) => {
    if (!currentUser) {
      return { success: false, error: 'Authentication required. Please sign in.' };
    }

    const rate = charger.priceRate;
    const subtotal = charger.pricingType === 'per-kwh' ? estimatedKwh * rate : durationHours * rate;
    const platformFee = Number((subtotal * 0.10).toFixed(2));
    const totalAmount = Number((subtotal + platformFee).toFixed(2));

    if (paymentMethod === 'wallet' && currentUser.walletBalance < totalAmount) {
      return { success: false, error: `Insufficient wallet balance. Required: ${formatCurrency(totalAmount)}. Current balance: ${formatCurrency(currentUser.walletBalance)}.` };
    }

    if (paymentMethod === 'wallet') {
      const updatedUser = { ...currentUser, walletBalance: currentUser.walletBalance - totalAmount };
      setCurrentUser(updatedUser);
    }

    const newBooking: Booking = {
      id: `BKG-${Math.floor(1000 + Math.random() * 9000)}`,
      chargerId: charger.id,
      chargerTitle: charger.title,
      hostId: charger.hostId,
      hostName: charger.hostName,
      driverId: currentUser.id,
      driverName: currentUser.name,
      driverVehicle: currentUser.vehicle ? `${currentUser.vehicle.make} ${currentUser.vehicle.model}` : 'EV Vehicle',
      driverConnector: currentUser.vehicle?.connector || 'Type 2',
      startTime,
      endTime,
      durationHours,
      estimatedKwh,
      totalAmount,
      platformFee,
      status: 'requested', // Driver booking sends request to Hub; slot is booked once Hub accepts
      paymentMethod,
      paymentStatus: 'paid',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setBookings(prev => [newBooking, ...prev]);

    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        title: 'Booking Request Sent to Hub',
        desc: `Request for [${charger.title}] sent to host ${charger.hostName}. Slot will be confirmed upon host acceptance.`,
        time: 'Just now',
        read: false
      },
      ...prev
    ]);

    return { success: true, booking: newBooking };
  };

  const acceptBookingRequest = (bookingId: string) => {
    const target = bookings.find(b => b.id === bookingId);
    if (!target) return;

    setBookings(prev => prev.map(b => {
      if (b.id !== bookingId) return b;
      return {
        ...b,
        status: 'confirmed',
      };
    }));

    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        title: 'Slot Booking Confirmed by Hub',
        desc: `Driver ${target.driverName}'s booking request for ${target.chargerTitle} approved for scheduled slot: ${target.startTime}.`,
        time: 'Just now',
        read: false
      },
      ...prev
    ]);
  };

  const startChargingSession = (bookingId: string) => {
    const target = bookings.find(b => b.id === bookingId);
    if (!target) return;

    const charger = chargers.find(c => c.id === target.chargerId);
    const power = charger?.powerKw || 22;
    const rate = charger?.priceRate || 18.00;

    setBookings(prev => prev.map(b => {
      if (b.id !== bookingId) return b;
      return {
        ...b,
        status: 'active',
        activeSession: {
          startedAt: new Date().toISOString(),
          currentKwh: 0.20,
          currentCost: Number((0.20 * rate).toFixed(2)),
          batteryPercentage: 42,
          flowRateKw: power,
        }
      };
    }));

    updateChargerStatus(target.chargerId, 'in-use');

    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        title: 'Vehicle Connected & Charging Started',
        desc: `Vehicle plugged into ${target.chargerTitle}. Real-time power delivery active at ${power} kW.`,
        time: 'Just now',
        read: false
      },
      ...prev
    ]);
  };

  const declineBookingRequest = (bookingId: string) => {
    const target = bookings.find(b => b.id === bookingId);
    if (!target) return;

    // Refund if paid via wallet and the driver is the current user
    if (target.paymentMethod === 'wallet' && currentUser && currentUser.id === target.driverId) {
      setCurrentUser({ ...currentUser, walletBalance: currentUser.walletBalance + target.totalAmount });
    }

    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'rejected' } : b));

    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        title: 'Booking Request Declined',
        desc: `Booking #${bookingId} was declined by the hub host.`,
        time: 'Just now',
        read: false
      },
      ...prev
    ]);
  };

  const stopActiveSession = () => {
    if (!activeBooking) return;
    setBookings(prev => prev.map(b => {
      if (b.id !== activeBooking.id) return b;
      return {
        ...b,
        status: 'completed',
      };
    }));

    updateChargerStatus(activeBooking.chargerId, 'available');

    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        title: 'Session Disconnected',
        desc: `Session at ${activeBooking.chargerTitle} completed. Invoice generated.`,
        time: 'Just now',
        read: false,
      },
      ...prev
    ]);
  };

  const topUpWallet = (amount: number) => {
    if (!currentUser) return;
    const updated = { ...currentUser, walletBalance: currentUser.walletBalance + amount };
    setCurrentUser(updated);

    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        title: 'Balance Credited',
        desc: `Added ${formatCurrency(amount)} to wallet balance.`,
        time: 'Just now',
        read: false
      },
      ...prev
    ]);
  };

  const sendChatMessage = (bookingId: string, text: string) => {
    if (!currentUser) return;
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      bookingId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages(prev => [...prev, newMsg]);
  };

  const resolveDispute = (disputeId: string) => {
    setDisputes(prev => prev.map(d => d.id === disputeId ? { ...d, status: 'resolved' } : d));
  };

  const markNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        loginUser,
        loginWithCredentials,
        registerAccount,
        logoutUser,
        role,
        switchRole,
        userCoords,
        setUserCoords,
        currency,
        setCurrency,
        formatCurrency,
        chargers,
        loadSeedChargers,
        clearAllChargers,
        addChargerListing,
        deleteCharger,
        updateChargerStatus,
        approveChargerListing,
        rejectChargerListing,
        toggleHostVacation,
        bookings,
        createBooking,
        acceptBookingRequest,
        declineBookingRequest,
        startChargingSession,
        activeBooking,
        stopActiveSession,
        topUpWallet,
        chatMessages,
        sendChatMessage,
        disputes,
        resolveDispute,
        notifications,
        markNotificationsAsRead,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
