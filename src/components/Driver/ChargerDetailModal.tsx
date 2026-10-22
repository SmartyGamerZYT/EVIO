import React, { useState } from 'react';
import { 
  X, 
  Zap, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Wallet, 
  CreditCard, 
  Smartphone, 
  Info,
  Car,
  Check
} from 'lucide-react';
import { ChargerListing } from '../../types';
import { useApp } from '../../context/AppContext';

interface ChargerDetailModalProps {
  charger: ChargerListing;
  onClose: () => void;
  onBookingSuccess: () => void;
}

export const ChargerDetailModal: React.FC<ChargerDetailModalProps> = ({
  charger,
  onClose,
  onBookingSuccess,
}) => {
  const { currentUser, formatCurrency, createBooking, topUpWallet } = useApp();

  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState<number>(1.5);
  const [selectedSlotTime, setSelectedSlotTime] = useState<string>('Now (Instant Plug-in)');
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'upi' | 'card'>('wallet');
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userConnector = currentUser?.vehicle?.connector || 'Type 2';
  const isCompatible = charger.connectorTypes.includes(userConnector);

  const estimatedKwh = Math.min(
    currentUser?.vehicle?.batteryCapacity || 60,
    Number((charger.powerKw * selectedDuration * 0.85).toFixed(1))
  );

  const subtotal = charger.pricingType === 'per-kwh' 
    ? Number((estimatedKwh * charger.priceRate).toFixed(2))
    : Number((selectedDuration * charger.priceRate).toFixed(2));

  const platformFee = Number((subtotal * 0.10).toFixed(2));
  const totalAmount = Number((subtotal + platformFee).toFixed(2));

  const handleBook = () => {
    setBookingError(null);
    setIsSubmitting(true);

    const now = new Date();
    const startTime = selectedSlotTime.includes('Now') 
      ? 'Today, ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : selectedSlotTime;
    
    const end = new Date(now.getTime() + selectedDuration * 3600 * 1000);
    const endTime = 'Today, ' + end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const result = createBooking(
      charger,
      startTime,
      endTime,
      selectedDuration,
      estimatedKwh,
      paymentMethod
    );

    if (!result.success) {
      setBookingError(result.error || 'Failed to complete charger booking.');
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    onBookingSuccess();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-sans">
      <div className="bg-white border border-[#BAE6FD] rounded-card w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl relative my-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/90 border border-[#CBD5E1] flex items-center justify-center text-[#64748B] hover:text-[#0F172A] shadow-xs"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Grid (12 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          
          {/* Left Column: 7 Cols Technical Specs */}
          <div className="lg:col-span-7 p-6 border-b lg:border-b-0 lg:border-r border-[#E2E8F0] space-y-5">
            
            {/* Main Photo */}
            <div>
              <div className="h-64 sm:h-72 rounded-2xl overflow-hidden relative bg-[#F1F5F9] mb-3">
                <img 
                  src={charger.photos[activePhotoIndex] || charger.photos[0]} 
                  alt={charger.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full border border-[#BAE6FD] text-xs font-mono font-bold text-[#0284C7] flex items-center gap-1.5 shadow-sm">
                  <Zap className="w-3.5 h-3.5 fill-[#0284C7]" />
                  <span>{charger.powerKw} kW ({charger.powerTier.toUpperCase()})</span>
                </div>
              </div>

              {charger.photos.length > 1 && (
                <div className="flex items-center gap-2">
                  {charger.photos.map((photo, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActivePhotoIndex(idx)}
                      className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                        activePhotoIndex === idx ? 'border-[#0284C7]' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={photo} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title & Host info */}
            <div>
              <h2 className="text-xl font-bold text-[#0F172A]">{charger.title}</h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-[#64748B] font-mono mt-1">
                <span>Host: <strong className="text-[#0F172A]">{charger.hostName}</strong></span>
                <span>•</span>
                <span>Rating: <strong className="text-[#16A34A]">{charger.hostRating.toFixed(1)}</strong> ({charger.hostReviewsCount} reviews)</span>
                {charger.safetyCertificateVerified && (
                  <span className="px-2 py-0.5 rounded bg-[#DCFCE7] text-[#16A34A] border border-[#86EFAC] flex items-center gap-1 font-bold">
                    <ShieldCheck className="w-3 h-3" />
                    Certified Safe
                  </span>
                )}
              </div>
            </div>

            {/* Compatibility Alert */}
            <div>
              {isCompatible ? (
                <div className="p-3.5 rounded-xl bg-[#DCFCE7] border border-[#86EFAC] flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0" />
                  <div className="text-xs">
                    <p className="font-bold text-[#0F172A] font-mono">Full Compatibility Confirmed</p>
                    <p className="text-[#475569]">
                      Your vehicle supports {userConnector}. This charger provides compatible {charger.connectorTypes.join(', ')}.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-[#FEF2F2] border-l-4 border-l-[#DC2626] border border-[#FECACA] flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-[#DC2626] shrink-0" />
                  <div className="text-xs">
                    <p className="font-bold text-[#DC2626] font-mono">Connector Incompatibility Warning</p>
                    <p className="text-[#B91C1C]">
                      Your vehicle requires {userConnector}. This station only supplies {charger.connectorTypes.join(', ')}. A physical adapter will be required.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <span className="text-[10px] text-[#64748B] uppercase font-mono font-bold block">Peak Output</span>
                <span className="font-mono text-base font-bold text-[#0284C7]">{charger.powerKw} kW</span>
              </div>
              <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <span className="text-[10px] text-[#64748B] uppercase font-mono font-bold block">Cable Length</span>
                <span className="font-mono text-base font-bold text-[#0F172A]">{charger.cableLengthMeters}m</span>
              </div>
              <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <span className="text-[10px] text-[#64748B] uppercase font-mono font-bold block">Charge Bays</span>
                <span className="font-mono text-base font-bold text-[#0F172A]">{charger.simultaneousSlots}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <span className="text-[10px] text-[#64748B] uppercase font-mono font-bold block">Booking Type</span>
                <span className="font-mono text-base font-bold text-[#16A34A] uppercase">{charger.bookingMode}</span>
              </div>
            </div>

            {/* Description & Amenities */}
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-[#0F172A] uppercase tracking-wider block">Station Details</span>
              <p className="text-xs text-[#64748B] leading-relaxed">{charger.description}</p>
              
              <div className="flex flex-wrap gap-1.5 pt-2">
                {charger.amenities.map(a => (
                  <span key={a} className="px-2.5 py-1 rounded-lg bg-[#F0F9FF] border border-[#BAE6FD] text-[11px] font-mono text-[#0284C7]">
                    ✓ {a}
                  </span>
                ))}
              </div>
            </div>

            {/* Security Note */}
            <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center gap-2.5 text-xs text-[#64748B]">
              <Info className="w-4 h-4 text-[#0284C7] shrink-0" />
              <span>
                <strong>Privacy Guaranteed:</strong> Exact address and security gate passcode are revealed instantly upon confirmed booking.
              </span>
            </div>

          </div>

          {/* Right Column: 5 Cols Pricing, Slot & Checkout */}
          <div className="lg:col-span-5 p-6 bg-[#F0F9FF] flex flex-col justify-between space-y-6 border-l border-[#BAE6FD]">
            
            <div className="space-y-5">
              
              {/* Tariff banner */}
              <div className="border-b border-[#BAE6FD] pb-4">
                <span className="text-xs text-[#64748B] uppercase font-mono font-bold tracking-wider block mb-1">
                  Charging Rate
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-3xl font-extrabold text-[#0284C7]">
                    {formatCurrency(charger.priceRate)}
                  </span>
                  <span className="text-xs text-[#64748B] font-mono">
                    per {charger.pricingType === 'per-kwh' ? 'kWh delivered' : 'hour'}
                  </span>
                </div>
              </div>

              {/* Arrival Slot */}
              <div className="space-y-2">
                <label className="text-xs font-mono font-bold text-[#0F172A] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#0284C7]" />
                  <span>Select Arrival Window</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['Now (Instant Plug-in)', 'In 30 Mins', 'Today, 03:00 PM', 'Today, 06:30 PM'].map(slot => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlotTime(slot)}
                      className={`p-2.5 rounded-xl border text-xs text-left font-mono transition-all ${
                        selectedSlotTime === slot 
                          ? 'bg-white border-[#0284C7] text-[#0284C7] font-bold shadow-xs' 
                          : 'bg-white/80 border-[#CBD5E1] text-[#64748B] hover:text-[#0F172A]'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-[#0F172A]">Charging Duration:</span>
                  <span className="text-[#0284C7] font-bold">{selectedDuration} hours</span>
                </div>
                <div className="flex items-center gap-2">
                  {[0.5, 1.0, 1.5, 2.0, 3.0].map(dur => (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => setSelectedDuration(dur)}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-mono transition-all ${
                        selectedDuration === dur
                          ? 'bg-[#0284C7] text-white font-bold border-[#0284C7] shadow-xs'
                          : 'bg-white border-[#CBD5E1] text-[#64748B] hover:text-[#0F172A]'
                      }`}
                    >
                      {dur}h
                    </button>
                  ))}
                </div>
              </div>

              {/* Energy projection */}
              <div className="p-3 rounded-xl bg-white border border-[#BAE6FD] flex items-center justify-between text-xs font-mono shadow-xs">
                <div>
                  <span className="text-[#64748B] block text-[10px] uppercase font-bold">Estimated Delivery</span>
                  <span className="font-bold text-[#0F172A] text-sm">~{estimatedKwh} kWh</span>
                </div>
                <div className="text-right">
                  <span className="text-[#64748B] block text-[10px] uppercase font-bold">Battery Gain</span>
                  <span className="font-bold text-[#16A34A] text-sm">
                    +{Math.round((estimatedKwh / (currentUser?.vehicle?.batteryCapacity || 60)) * 100)}% SOC
                  </span>
                </div>
              </div>

              {/* Payment selector */}
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold text-[#0F172A] block">Payment Method</span>
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('wallet')}
                    className={`w-full p-2.5 rounded-xl border text-xs font-mono flex items-center justify-between transition-all ${
                      paymentMethod === 'wallet' 
                        ? 'bg-white border-[#0284C7] text-[#0F172A] shadow-xs' 
                        : 'bg-white/70 border-[#CBD5E1] text-[#64748B] hover:text-[#0F172A]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-[#0284C7]" />
                      <span>Evio Pay Wallet</span>
                    </div>
                    <span className="font-bold text-[#16A34A]">
                      {formatCurrency(currentUser?.walletBalance || 0)}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`w-full p-2.5 rounded-xl border text-xs font-mono flex items-center justify-between transition-all ${
                      paymentMethod === 'upi' 
                        ? 'bg-white border-[#0284C7] text-[#0F172A] shadow-xs' 
                        : 'bg-white/70 border-[#CBD5E1] text-[#64748B] hover:text-[#0F172A]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-[#0284C7]" />
                      <span>Instant UPI / Apple Pay</span>
                    </div>
                    <span className="text-[10px] text-[#64748B]">Zero Fee</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`w-full p-2.5 rounded-xl border text-xs font-mono flex items-center justify-between transition-all ${
                      paymentMethod === 'card' 
                        ? 'bg-white border-[#0284C7] text-[#0F172A] shadow-xs' 
                        : 'bg-white/70 border-[#CBD5E1] text-[#64748B] hover:text-[#0F172A]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-[#0284C7]" />
                      <span>Credit / Debit Card</span>
                    </div>
                    <span className="text-[10px] text-[#64748B]">Visa/MC</span>
                  </button>
                </div>
              </div>

              {/* Cost breakdown */}
              <div className="pt-3 border-t border-[#BAE6FD] space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-[#64748B]">
                  <span>Energy Subtotal ({estimatedKwh} kWh)</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#64748B]">
                  <span>Network Platform Fee (10%)</span>
                  <span>{formatCurrency(platformFee)}</span>
                </div>
                <div className="flex justify-between text-[#0F172A] font-bold pt-2 border-t border-[#BAE6FD]">
                  <span className="text-sm">Total Amount</span>
                  <span className="text-base text-[#0284C7]">{formatCurrency(totalAmount)}</span>
                </div>
              </div>

              {bookingError && (
                <div className="p-3 rounded-xl bg-[#FEF2F2] border-l-4 border-l-[#DC2626] text-xs text-[#DC2626] font-mono">
                  <div className="flex items-center justify-between">
                    <span>{bookingError}</span>
                    {bookingError.includes('Insufficient') && (
                      <button
                        onClick={() => topUpWallet(50)}
                        className="underline font-bold text-[#0F172A] ml-2"
                      >
                        + Add $50
                      </button>
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* Action */}
            <button
              onClick={handleBook}
              disabled={isSubmitting || charger.status === 'offline'}
              className="w-full py-3.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white font-mono font-bold text-xs tracking-wider shadow-md shadow-[#0284C7]/25 active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>
                {charger.bookingMode === 'instant' ? 'CONFIRM & START CHARGING' : 'REQUEST HOST APPROVAL'}
              </span>
            </button>

          </div>

        </div>

      </div>
    </div>
  );
};
