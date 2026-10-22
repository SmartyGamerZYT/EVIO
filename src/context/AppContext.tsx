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
  logoutUser: () => void;
  role: UserRole;
  switchRole: (role: UserRole) => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatCurrency: (amount: number) => string;
  chargers: ChargerListing[];
  loadSeedChargers: () => void;
  clearAllChargers: () => void;
  addChargerListing: (newCharger: Omit<ChargerListing, 'id' | 'createdAt' | 'status' | 'listingStatus'>) => ChargerListing;
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

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('evio_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [currency, setCurrency] = useState<Currency>('USD');

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
      case 'INR':
        return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
      case 'GBP':
        return `£${amount.toFixed(2)}`;
      case 'USD':
      default:
        return `$${amount.toFixed(2)}`;
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
      status: charger.bookingMode === 'instant' ? 'active' : 'requested',
      paymentMethod,
      paymentStatus: 'paid',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      activeSession: charger.bookingMode === 'instant' ? {
        startedAt: new Date().toISOString(),
        currentKwh: 1.2,
        currentCost: Number((1.2 * charger.priceRate).toFixed(2)),
        batteryPercentage: 42,
        flowRateKw: charger.powerKw,
      } : undefined
    };

    setBookings(prev => [newBooking, ...prev]);

    if (charger.bookingMode === 'instant') {
      updateChargerStatus(charger.id, 'in-use');
    }

    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        title: charger.bookingMode === 'instant' ? 'Session Activated' : 'Booking Request Logged',
        desc: `Station: ${charger.title}. Duration: ${durationHours}h. Total: ${formatCurrency(totalAmount)}.`,
        time: 'Just now',
        read: false
      },
      ...prev
    ]);

    return { success: true, booking: newBooking };
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
        logoutUser,
        role,
        switchRole,
        currency,
        setCurrency,
        formatCurrency,
        chargers,
        loadSeedChargers,
        clearAllChargers,
        addChargerListing,
        updateChargerStatus,
        approveChargerListing,
        rejectChargerListing,
        toggleHostVacation,
        bookings,
        createBooking,
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
