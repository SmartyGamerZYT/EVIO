import React, { useState } from 'react';
import { 
  X, 
  Truck, 
  BatteryCharging, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  AlertCircle,
  Navigation,
  ChevronRight,
  Phone,
  Zap
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BatteryDeliveryRequest } from '../../types';

interface BatteryDeliveryModalProps {
  onClose: () => void;
}

export const BatteryDeliveryModal: React.FC<BatteryDeliveryModalProps> = ({ onClose }) => {
  const { 
    currentUser, 
    chargers, 
    formatCurrency, 
    batteryDeliveries, 
    requestBatteryDelivery, 
    completeBatteryDelivery, 
    cancelBatteryDelivery,
    userCoords 
  } = useApp();

  // Find nearest hubs that offer battery delivery
  const batteryHubs = chargers.filter(c => c.offersBatteryDelivery && (c.batteryStockCount ?? 0) > 0);
  const defaultHub = batteryHubs[0] || chargers[0] || {
    id: 'hub-metro-01',
    hostId: 'usr-hub-demo',
    hostName: 'Marcus Vance Metro Hub',
    approxAddress: 'Financial District Bay 4 (2.4 km away)',
    lat: 37.7749,
    lng: -122.4194,
    batteryStockCount: 8,
  };

  const [selectedHubId, setSelectedHubId] = useState(defaultHub.hostId);
  const [batterySpec, setBatterySpec] = useState(
    currentUser?.vehicle?.batteryType || '51.1V 3.7kWh Quick-Swap Pack'
  );
  const [deliveryAddress, setDeliveryAddress] = useState(
    'Highway Shoulder / Near Central Park Gate 3, 4th Cross Road'
  );
  const [driverPhone, setDriverPhone] = useState(currentUser?.phone || '+91 98765-43210');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active delivery for current user if any
  const activeDelivery = batteryDeliveries.find(
    d => d.driverId === currentUser?.id && d.status !== 'delivered' && d.status !== 'cancelled'
  );

  const deliveryFee = 120;
  const batterySwapFee = 280;
  const totalCost = deliveryFee + batterySwapFee;

  const handleOrder = () => {
    if (!currentUser) {
      alert('Please sign in to order battery delivery.');
      return;
    }
    setIsSubmitting(true);

    const chosenHub = chargers.find(c => c.hostId === selectedHubId) || defaultHub;

    requestBatteryDelivery({
      driverId: currentUser.id,
      driverName: currentUser.name,
      driverPhone: driverPhone,
      driverLocation: {
        lat: userCoords[0],
        lng: userCoords[1],
        address: deliveryAddress,
      },
      vehicleInfo: currentUser.vehicle ? `${currentUser.vehicle.make} ${currentUser.vehicle.model}` : 'Swappable EV Two-Wheeler',
      batterySpec: batterySpec,
      hubId: chosenHub.hostId || 'usr-hub-demo',
      hubName: chosenHub.hostName || 'Marcus Vance Metro Hub',
      hubPhone: '+91 98111-22334',
      etaMinutes: 18,
      deliveryFee,
      batterySwapFee,
      totalCost,
    });

    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-sans">
      <div className="bg-white border border-[#BAE6FD] rounded-card w-full max-w-2xl max-h-[92vh] overflow-y-auto p-6 shadow-2xl relative my-auto space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white border border-[#CBD5E1] flex items-center justify-center text-[#64748B] hover:text-[#0F172A] shadow-xs"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="border-b border-[#E2E8F0] pb-4">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7] animate-pulse"></span>
            <span className="text-xs font-mono font-bold text-[#0284C7] uppercase tracking-wider">
              On-Demand Emergency Swappable Battery Delivery
            </span>
          </div>
          <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">Doorstep / Highway Battery Delivery</h2>
          <p className="text-xs text-[#64748B] mt-1 font-sans">
            Stranded with zero charge? The nearest Evio charging hub delivers a 100% charged certified replacement battery directly to your location on an electric express van.
          </p>
        </div>

        {/* If Active Delivery In Progress -> Show Live Tracking Screen */}
        {activeDelivery ? (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-[#F0F9FF] border-2 border-[#0284C7] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#0284C7] uppercase px-2.5 py-1 rounded-full bg-white border border-[#BAE6FD]">
                  Order #{activeDelivery.id}
                </span>
                <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full ${
                  activeDelivery.status === 'dispatched' 
                    ? 'bg-[#DCFCE7] text-[#16A34A] border border-[#86EFAC] animate-pulse'
                    : 'bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]'
                }`}>
                  {activeDelivery.status === 'dispatched' ? 'OUT FOR DELIVERY' : 'AWAITING HUB DISPATCH'}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                <div>
                  <h3 className="text-lg font-bold text-[#0F172A]">{activeDelivery.batterySpec}</h3>
                  <p className="text-xs text-[#64748B] font-mono mt-0.5">
                    Assigned Hub: <strong className="text-[#0F172A]">{activeDelivery.hubName}</strong>
                  </p>
                  <p className="text-xs text-[#64748B] font-mono">
                    Drop-off Point: <strong className="text-[#0F172A]">{activeDelivery.driverLocation.address}</strong>
                  </p>
                </div>

                <div className="text-right sm:text-right bg-white p-3 rounded-xl border border-[#CBD5E1]">
                  <span className="text-[10px] text-[#64748B] font-mono uppercase block">Estimated Arrival</span>
                  <span className="text-2xl font-bold text-[#0284C7] font-mono">
                    ~{activeDelivery.status === 'dispatched' ? '12' : activeDelivery.etaMinutes} mins
                  </span>
                </div>
              </div>

              {/* Progress Steps */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#BAE6FD] text-center font-mono text-xs">
                <div className="p-2 bg-white rounded-lg border border-[#0284C7] text-[#0284C7] font-bold">
                  1. Hub Accepted
                </div>
                <div className={`p-2 rounded-lg border font-bold ${
                  activeDelivery.status === 'dispatched' ? 'bg-[#16A34A] text-white border-[#16A34A]' : 'bg-white/60 text-[#94A3B8] border-[#CBD5E1]'
                }`}>
                  2. Dispatched with Rider
                </div>
                <div className="p-2 bg-white/60 text-[#94A3B8] rounded-lg border border-[#CBD5E1]">
                  3. Swap & Go
                </div>
              </div>

              {activeDelivery.deliveryPartnerName && (
                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-[#CBD5E1] text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#0284C7]" />
                    <span className="font-bold text-[#0F172A]">{activeDelivery.deliveryPartnerName}</span>
                  </div>
                  <a href={`tel:${activeDelivery.hubPhone || '+919811122334'}`} className="text-[#0284C7] font-bold flex items-center gap-1 hover:underline">
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Driver</span>
                  </a>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => cancelBatteryDelivery(activeDelivery.id)}
                className="px-4 py-2.5 rounded-xl border border-[#CBD5E1] hover:border-[#E11D48] text-[#E11D48] text-xs font-mono font-bold transition-all"
              >
                Cancel Request
              </button>

              <button
                type="button"
                onClick={() => {
                  completeBatteryDelivery(activeDelivery.id);
                  alert('Battery swap verified & fresh battery installed!');
                }}
                className="px-5 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Rider Arrived • Confirm Battery Swap</span>
              </button>
            </div>
          </div>
        ) : (
          /* Order Placement View */
          <div className="space-y-5">
            {/* Battery Spec Choice */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-[#0F172A] flex items-center gap-1.5">
                <BatteryCharging className="w-4 h-4 text-[#0284C7]" />
                <span>Select Your Vehicle Battery Pack Specification</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { title: '48V 3.2 kWh Pack', subtitle: 'Standard 2W (Ather/Bounce/Ola)', code: '48V 3.2kWh Quick-Swap Pack' },
                  { title: '51.1V 3.7 kWh Pack', subtitle: 'High Range 2W & 3W Cargo', code: '51.1V 3.7kWh Quick-Swap Pack' },
                  { title: '72V 5.0 kWh Pack', subtitle: 'Heavy Duty 3W Commercial', code: '72V 5.0kWh Heavy Commercial Pack' }
                ].map(spec => (
                  <button
                    key={spec.code}
                    type="button"
                    onClick={() => setBatterySpec(spec.code)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      batterySpec === spec.code
                        ? 'bg-[#E0F2FE] border-[#0284C7] shadow-xs'
                        : 'bg-[#F8FAFC] border-[#CBD5E1] hover:bg-white'
                    }`}
                  >
                    <span className="font-mono font-bold text-xs text-[#0F172A] block">{spec.title}</span>
                    <span className="text-[11px] text-[#64748B] block mt-0.5">{spec.subtitle}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Nearest Hub Dispatch Source */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-[#0F172A] flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#0284C7]" />
                <span>Nearest Fulfilling Charging Hub</span>
              </label>
              <div className="p-3.5 rounded-xl bg-[#F0F9FF] border border-[#BAE6FD] flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#0F172A]">{defaultHub.hostName}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#DCFCE7] text-[#16A34A] font-bold">
                      {defaultHub.batteryStockCount || 8} Charged Packs in Stock
                    </span>
                  </div>
                  <p className="text-xs text-[#64748B] font-mono mt-0.5">{defaultHub.approxAddress}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-[#0284C7]">ETA ~18 Mins</span>
                </div>
              </div>
            </div>

            {/* Delivery Location Pinpoint */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-[#0F172A] flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#0284C7]" />
                <span>Current Stranded Location / Landmark *</span>
              </label>
              <input
                type="text"
                value={deliveryAddress}
                onChange={e => setDeliveryAddress(e.target.value)}
                placeholder="e.g. Near Flyover Exit 14, Highway NH-48 or Exact Landmark"
                className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#0F172A] focus:border-[#0284C7] focus:bg-white font-mono"
              />
              <div className="flex items-center justify-between text-[11px] text-[#64748B] font-mono">
                <span>GPS Fix: {userCoords[0].toFixed(4)}, {userCoords[1].toFixed(4)}</span>
                <span className="text-[#16A34A] font-bold">Pin Confirmed</span>
              </div>
            </div>

            {/* Driver Phone */}
            <div>
              <label className="text-xs font-mono font-bold text-[#475569] block mb-1">Contact Phone Number for Delivery Partner *</label>
              <input
                type="text"
                value={driverPhone}
                onChange={e => setDriverPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#0F172A] font-mono focus:border-[#0284C7]"
              />
            </div>

            {/* Price Breakdown */}
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2 font-mono text-xs">
              <div className="flex justify-between text-[#64748B]">
                <span>Fresh 100% Battery Swap Charge</span>
                <span>{formatCurrency(batterySwapFee)}</span>
              </div>
              <div className="flex justify-between text-[#64748B]">
                <span>On-Demand Express Delivery Fee</span>
                <span>{formatCurrency(deliveryFee)}</span>
              </div>
              <div className="pt-2 border-t border-[#E2E8F0] flex justify-between font-bold text-sm text-[#0F172A]">
                <span>Total Amount</span>
                <span className="text-[#0284C7] text-base">{formatCurrency(totalCost)}</span>
              </div>
              <p className="text-[10px] text-[#64748B] pt-1">
                * Old discharged battery pack will be retrieved by our delivery partner during swap.
              </p>
            </div>

            {/* Action */}
            <button
              type="button"
              onClick={handleOrder}
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white font-mono font-bold text-xs tracking-wider shadow-md shadow-[#0284C7]/25 active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <Truck className="w-4 h-4" />
              <span>DISPATCH EMERGENCY BATTERY DELIVERY • {formatCurrency(totalCost)}</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
