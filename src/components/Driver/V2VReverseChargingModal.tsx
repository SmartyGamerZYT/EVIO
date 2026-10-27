import React, { useState, useEffect } from 'react';
import { 
  X, 
  Repeat, 
  Zap, 
  Radio, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Car, 
  ArrowRight,
  TrendingDown,
  TrendingUp,
  BatteryCharging,
  DollarSign
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { V2VReverseChargeRequest } from '../../types';

interface V2VReverseChargingModalProps {
  onClose: () => void;
}

export const V2VReverseChargingModal: React.FC<V2VReverseChargingModalProps> = ({ onClose }) => {
  const { 
    currentUser, 
    formatCurrency, 
    v2vRequests, 
    createV2VRequest, 
    acceptV2VRequest, 
    startV2VTransfer, 
    completeV2VTransfer, 
    cancelV2VRequest,
    userCoords 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'request' | 'donor'>('request');
  
  // Request form state
  const [currentSoc, setCurrentSoc] = useState(4);
  const [requestedKwh, setRequestedKwh] = useState(8.0);
  const [offeredPayout, setOfferedPayout] = useState(450);
  const [highwayName, setHighwayName] = useState('NH-48 Highway Northbound (KM 142 Shoulder)');
  const [vehicleMake, setVehicleMake] = useState(
    currentUser?.vehicle ? `${currentUser.vehicle.make} ${currentUser.vehicle.model}` : 'Tata Nexon EV Max'
  );

  // My current active request if I am stranded
  const myActiveRequest = v2vRequests.find(
    r => r.strandedDriverId === currentUser?.id && r.status !== 'completed' && r.status !== 'cancelled'
  );

  // Active mission if I am the donor
  const donorMission = v2vRequests.find(
    r => r.donorDriverId === currentUser?.id && r.status !== 'completed' && r.status !== 'cancelled'
  );

  // Simulated energy transfer ticker
  const [transferredLiveKwh, setTransferredLiveKwh] = useState(0.8);

  useEffect(() => {
    let timer: any;
    if ((myActiveRequest && myActiveRequest.status === 'transferring') || (donorMission && donorMission.status === 'transferring')) {
      timer = setInterval(() => {
        setTransferredLiveKwh(prev => Number((prev + 0.3).toFixed(1)));
      }, 1500);
    }
    return () => clearInterval(timer);
  }, [myActiveRequest?.status, donorMission?.status]);

  const handleBroadcastSOS = () => {
    if (!currentUser) {
      alert('Please sign in to broadcast V2V request.');
      return;
    }

    createV2VRequest({
      strandedDriverId: currentUser.id,
      strandedDriverName: currentUser.name,
      strandedDriverPhone: currentUser.phone || '+91 99887-76655',
      strandedVehicle: vehicleMake,
      location: {
        lat: userCoords[0],
        lng: userCoords[1],
        highwayName,
      },
      currentSoc,
      requestedKwh,
      offeredPayout,
    });
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-sans">
      <div className="bg-white border border-[#BAE6FD] rounded-card w-full max-w-3xl max-h-[92vh] overflow-y-auto p-6 shadow-2xl relative my-auto space-y-6">
        
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
              Peer-to-Peer V2V Reverse Charging (Vehicle-to-Vehicle)
            </span>
          </div>
          <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">
            Highway Emergency Reverse Charging
          </h2>
          <p className="text-xs text-[#64748B] mt-1 font-sans">
            Stranded with a drained battery on the highway? Send an SOS beacon to passing EV drivers with bidirectional V2V charging cables to transfer 5-10 kWh directly car-to-car.
          </p>
        </div>

        {/* Tab switch: Stranded Mode vs Passing Donor Mode */}
        <div className="flex items-center bg-[#F8FAFC] p-1 rounded-xl border border-[#CBD5E1] text-xs font-mono">
          <button
            type="button"
            onClick={() => setActiveTab('request')}
            className={`flex-1 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'request' ? 'bg-[#0284C7] text-white shadow-xs' : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>I Need Charge (Stranded SOS)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('donor')}
            className={`flex-1 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'donor' ? 'bg-[#0284C7] text-white shadow-xs' : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <Repeat className="w-3.5 h-3.5" />
            <span>Passing EV Donor Radar ({v2vRequests.filter(r => r.status === 'broadcasting').length} Active)</span>
          </button>
        </div>

        {/* ACTIVE TRANSFER INTERFACE (If any active V2V mission) */}
        {(myActiveRequest || donorMission) ? (
          (() => {
            const currentMission = myActiveRequest || donorMission!;
            const isStrandedDriver = currentMission.strandedDriverId === currentUser?.id;

            return (
              <div className="p-6 rounded-2xl bg-[#F0F9FF] border-2 border-[#0284C7] space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#0284C7] uppercase px-3 py-1 rounded-full bg-white border border-[#BAE6FD]">
                    Session #{currentMission.id}
                  </span>
                  <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full ${
                    currentMission.status === 'transferring'
                      ? 'bg-[#DCFCE7] text-[#16A34A] border border-[#86EFAC] animate-pulse'
                      : currentMission.status === 'accepted'
                      ? 'bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]'
                      : 'bg-white text-[#0284C7] border border-[#BAE6FD]'
                  }`}>
                    {currentMission.status === 'transferring' ? 'REVERSE CHARGING IN PROGRESS' : 'DONOR APPROACHING ON HIGHWAY'}
                  </span>
                </div>

                {/* Car-to-Car Diagram */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center text-center font-mono">
                  {/* Donor Car */}
                  <div className="p-4 bg-white rounded-xl border border-[#CBD5E1] space-y-1">
                    <span className="text-[10px] text-[#64748B] block font-bold uppercase">DONOR VEHICLE</span>
                    <h4 className="font-bold text-sm text-[#0F172A] truncate">
                      {currentMission.donorVehicle || 'Passing Hyundai Ioniq 5'}
                    </h4>
                    <p className="text-xs text-[#0284C7]">{currentMission.donorDriverName || 'Good Samaritan Driver'}</p>
                    <span className="text-[11px] text-[#16A34A] font-bold block mt-1">Bidirectional V2V Output: 11 kW</span>
                  </div>

                  {/* Flow Arrow */}
                  <div className="flex flex-col items-center justify-center space-y-1">
                    <div className="w-12 h-12 rounded-full bg-[#0284C7] text-white flex items-center justify-center shadow-md animate-bounce">
                      <Zap className="w-6 h-6 fill-white" />
                    </div>
                    <span className="text-[11px] text-[#0284C7] font-bold font-mono">11 kW Flow Rate</span>
                    <span className="text-[10px] text-[#64748B]">CCS2 Bidirectional Cable</span>
                  </div>

                  {/* Stranded Car */}
                  <div className="p-4 bg-white rounded-xl border border-[#CBD5E1] space-y-1">
                    <span className="text-[10px] text-[#64748B] block font-bold uppercase">STRANDED RECEIVER</span>
                    <h4 className="font-bold text-sm text-[#0F172A] truncate">
                      {currentMission.strandedVehicle}
                    </h4>
                    <p className="text-xs text-[#E11D48]">
                      SOC: {currentMission.currentSoc}% &rarr; {currentMission.currentSoc + Math.min(15, Math.round(transferredLiveKwh * 1.8))}%
                    </p>
                    <span className="text-[11px] text-[#16A34A] font-bold block mt-1">
                      Received: {transferredLiveKwh} / {currentMission.requestedKwh} kWh
                    </span>
                  </div>
                </div>

                {/* Telemetry Progress */}
                <div className="space-y-2 font-mono">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#64748B]">Emergency Energy Transferred:</span>
                    <strong className="text-[#0284C7] text-sm">{transferredLiveKwh} kWh of {currentMission.requestedKwh} kWh</strong>
                  </div>
                  <div className="w-full h-3 bg-white rounded-full overflow-hidden border border-[#CBD5E1]">
                    <div 
                      className="h-full bg-[#16A34A] transition-all duration-500"
                      style={{ width: `${Math.min(100, (transferredLiveKwh / currentMission.requestedKwh) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Highway Location */}
                <div className="p-3 bg-white rounded-xl border border-[#CBD5E1] text-xs font-mono flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#0284C7]" />
                    <span>Location: <strong>{currentMission.location.highwayName}</strong></span>
                  </div>
                  <span className="text-[#16A34A] font-bold">Reward Payout: {formatCurrency(currentMission.offeredPayout)}</span>
                </div>

                {/* Transfer Actions */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => cancelV2VRequest(currentMission.id)}
                    className="px-4 py-2.5 rounded-xl border border-[#CBD5E1] text-[#E11D48] text-xs font-mono font-bold"
                  >
                    Cancel Session
                  </button>

                  <div className="flex items-center gap-2">
                    {currentMission.status === 'accepted' && (
                      <button
                        type="button"
                        onClick={() => startV2VTransfer(currentMission.id)}
                        className="px-5 py-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-mono font-bold shadow-xs flex items-center gap-1.5"
                      >
                        <Zap className="w-4 h-4" />
                        <span>Cable Connected • Start Reverse Flow</span>
                      </button>
                    )}

                    {currentMission.status === 'transferring' && (
                      <button
                        type="button"
                        onClick={() => {
                          completeV2VTransfer(currentMission.id, transferredLiveKwh);
                          alert(`Reverse charging completed! Transferred ${transferredLiveKwh} kWh. Payout of ${formatCurrency(currentMission.offeredPayout)} settled.`);
                        }}
                        className="px-5 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-mono font-bold shadow-xs flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Complete Transfer & Settle Payout ({formatCurrency(currentMission.offeredPayout)})</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })()
        ) : activeTab === 'request' ? (
          /* Mode A: Stranded Driver Request Form */
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-[#FFF1F2] border border-[#FECDD3] flex items-center gap-3 text-xs font-mono text-[#9F1239]">
              <AlertTriangle className="w-5 h-5 text-[#E11D48] shrink-0" />
              <div>
                <strong className="block text-sm text-[#E11D48]">Emergency Highway V2V Assist</strong>
                Broadcasting alerts any passing EV vehicle with bidirectional V2V adapter on this highway to pull over and supply emergency charge.
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <label className="font-bold text-[#475569] block mb-1">Your Vehicle Model</label>
                <input
                  type="text"
                  value={vehicleMake}
                  onChange={e => setVehicleMake(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#0F172A] focus:border-[#0284C7]"
                />
              </div>

              <div>
                <label className="font-bold text-[#475569] block mb-1">Current Battery Remaining (SOC %)</label>
                <input
                  type="number"
                  min="1"
                  max="15"
                  value={currentSoc}
                  onChange={e => setCurrentSoc(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#E11D48] font-bold focus:border-[#0284C7]"
                />
              </div>

              <div>
                <label className="font-bold text-[#475569] block mb-1">Emergency Energy Needed (kWh)</label>
                <input
                  type="number"
                  min="3"
                  max="20"
                  step="0.5"
                  value={requestedKwh}
                  onChange={e => setRequestedKwh(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#0284C7] font-bold focus:border-[#0284C7]"
                />
                <span className="text-[10px] text-[#64748B] mt-0.5 block">Estimated ~{Math.round(requestedKwh * 6.5)} km emergency highway range</span>
              </div>

              <div>
                <label className="font-bold text-[#475569] block mb-1">Offered Payout to Passing Driver</label>
                <input
                  type="number"
                  min="200"
                  max="1500"
                  step="50"
                  value={offeredPayout}
                  onChange={e => setOfferedPayout(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#16A34A] font-bold focus:border-[#0284C7]"
                />
                <span className="text-[10px] text-[#64748B] mt-0.5 block">Includes energy rate + good samaritan incentive</span>
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-[#475569] block mb-1">Current Highway / Expressway Location *</label>
                <input
                  type="text"
                  required
                  value={highwayName}
                  onChange={e => setHighwayName(e.target.value)}
                  placeholder="e.g. NH-48 Expressway Northbound, KM 142 near Toll Gate"
                  className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#0F172A] focus:border-[#0284C7]"
                />
                <div className="flex justify-between text-[11px] text-[#64748B] mt-1">
                  <span>GPS: {userCoords[0].toFixed(4)}, {userCoords[1].toFixed(4)}</span>
                  <span className="text-[#16A34A] font-bold">Beacon Ready</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleBroadcastSOS}
              className="w-full py-3.5 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white font-mono font-bold text-xs tracking-wider shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <Radio className="w-4 h-4 animate-ping" />
              <span>BROADCAST V2V EMERGENCY SOS TO PASSING EVS • REWARD {formatCurrency(offeredPayout)}</span>
            </button>
          </div>
        ) : (
          /* Mode B: Passing EV Donor Radar */
          <div className="space-y-4 font-mono">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-[#0F172A] flex items-center gap-2">
                  <Radio className="w-4 h-4 text-[#0284C7]" />
                  <span>Nearby Highway V2V SOS Broadcasts</span>
                </h3>
                <p className="text-xs text-[#64748B] font-sans mt-0.5">
                  Vehicles stranded on your travel corridor. Deliver 5-10 kWh using your bidirectional V2V adapter and earn instant payouts.
                </p>
              </div>
            </div>

            {v2vRequests.filter(r => r.status === 'broadcasting').length === 0 ? (
              <div className="p-8 text-center text-xs text-[#64748B] border border-dashed border-[#CBD5E1] rounded-xl">
                <CheckCircle2 className="w-8 h-8 text-[#16A34A] mx-auto mb-2 opacity-80" />
                <p className="font-bold text-[#0F172A]">Zero Active Stranded Vehicles</p>
                <p className="font-sans text-[11px] text-[#64748B] mt-0.5">
                  All passing highway vehicles are sufficiently charged. Broadcasts will appear here in real-time.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {v2vRequests
                  .filter(r => r.status === 'broadcasting')
                  .map(req => (
                    <div 
                      key={req.id} 
                      className="p-4 rounded-xl bg-[#FFF1F2] border border-[#FECDD3] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#E11D48] text-white">
                            SOS ACTIVE
                          </span>
                          <span className="font-bold text-xs text-[#0F172A]">{req.strandedVehicle}</span>
                          <span className="text-xs text-[#E11D48] font-bold">({req.currentSoc}% Battery Remaining)</span>
                        </div>
                        <p className="text-xs text-[#475569] flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#E11D48] shrink-0" />
                          <span>{req.location.highwayName}</span>
                        </p>
                        <p className="text-[11px] text-[#64748B]">
                          Driver: <strong className="text-[#0F172A]">{req.strandedDriverName}</strong> • Requesting {req.requestedKwh} kWh
                        </p>
                      </div>

                      <div className="flex sm:flex-col items-end gap-2 shrink-0">
                        <span className="text-base font-bold text-[#16A34A]">
                          +{formatCurrency(req.offeredPayout)}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            acceptV2VRequest(
                              req.id, 
                              currentUser?.id || 'usr-donor-01', 
                              currentUser?.name || 'Alex Donor (Passing Ioniq 5)', 
                              currentUser?.vehicle ? `${currentUser.vehicle.make} ${currentUser.vehicle.model}` : 'Hyundai Ioniq 5 (V2V)'
                            );
                          }}
                          className="px-4 py-2 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all"
                        >
                          <Zap className="w-3.5 h-3.5 fill-white" />
                          <span>Accept Mission</span>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
