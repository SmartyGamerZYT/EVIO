import React, { useState } from 'react';
import { 
  Zap, 
  Calendar, 
  PlusCircle, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  FileText,
  PauseCircle,
  PlayCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface HostDashboardProps {
  onOpenListingWizard: () => void;
}

export const HostDashboard: React.FC<HostDashboardProps> = ({ onOpenListingWizard }) => {
  const { 
    currentUser, 
    chargers, 
    bookings, 
    formatCurrency, 
    toggleHostVacation, 
    approveChargerListing
  } = useApp();

  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('week');

  const hostChargers = chargers.filter(c => c.hostId === currentUser?.id || c.hostId === 'host-101');
  const primaryCharger = hostChargers[0] || chargers[0];

  const pendingRequests = bookings.filter(b => b.status === 'requested');

  const chartDataWeekly = [
    { label: 'Mon', kwh: 34, earnings: 9.52 },
    { label: 'Tue', kwh: 48, earnings: 13.44 },
    { label: 'Wed', kwh: 42, earnings: 11.76 },
    { label: 'Thu', kwh: 68, earnings: 19.04 },
    { label: 'Fri', kwh: 92, earnings: 25.76 },
    { label: 'Sat', kwh: 115, earnings: 32.20 },
    { label: 'Sun', kwh: 88, earnings: 24.64 },
  ];

  const totalEarnings = bookings.reduce((sum, b) => sum + (b.totalAmount - b.platformFee), 0) + (hostChargers.length > 0 ? 320.5 : 0);
  const totalSessions = bookings.length + (hostChargers.length > 0 ? 28 : 0);
  const totalKwh = bookings.reduce((sum, b) => sum + b.estimatedKwh, 0) + (hostChargers.length > 0 ? 487 : 0);

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#BAE6FD] rounded-card p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] animate-pulse"></span>
            <span className="text-xs font-mono font-bold text-[#16A34A] uppercase tracking-wider">
              Host Operations Dashboard
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
            Station Telemetry • {currentUser?.name || 'Local Host'}
          </h1>
          <p className="text-xs text-[#64748B] mt-1 font-sans">
            Real-time power monitoring, automated revenue payouts, and charging bay availability controls.
          </p>
        </div>

        <button
          onClick={onOpenListingWizard}
          className="px-5 py-3 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white font-mono font-bold text-xs tracking-wider shadow-md shadow-[#0284C7]/25 transition-all flex items-center justify-center gap-2 shrink-0 active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>LIST NEW CHARGER</span>
        </button>
      </div>

      {/* 3 KPI Cards at Top */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* KPI 1: Net Earnings */}
        <div className="bg-white border border-[#BAE6FD] rounded-card p-5 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between text-[#64748B] text-xs font-mono font-bold mb-2">
            <span>NET HOST EARNINGS</span>
            <span className="text-[#16A34A] font-mono">+14.2%</span>
          </div>
          <div className="font-mono text-[32px] font-bold text-[#0F172A] tracking-tight">
            {formatCurrency(totalEarnings)}
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-[#64748B] font-mono">
            <span className="text-[#0284C7] font-bold">10%</span>
            <span>Network operation take rate auto-deducted</span>
          </div>
        </div>

        {/* KPI 2: Total Sessions */}
        <div className="bg-white border border-[#BAE6FD] rounded-card p-5 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between text-[#64748B] text-xs font-mono font-bold mb-2">
            <span>CHARGING SESSIONS</span>
            <span className="text-[#0284C7] font-mono">99.1% Uptime</span>
          </div>
          <div className="font-mono text-[32px] font-bold text-[#0284C7] tracking-tight">
            {totalSessions}
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-[#64748B] font-mono">
            <Clock className="w-3.5 h-3.5 text-[#64748B]" />
            <span>Average session time: 1.6 hours</span>
          </div>
        </div>

        {/* KPI 3: Energy Delivered */}
        <div className="bg-white border border-[#BAE6FD] rounded-card p-5 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between text-[#64748B] text-xs font-mono font-bold mb-2">
            <span>DISPENSED ENERGY (kWh)</span>
            <span className="text-[#16A34A] font-mono">Level 2 / DC</span>
          </div>
          <div className="font-mono text-[32px] font-bold text-[#16A34A] tracking-tight">
            {totalKwh.toFixed(1)} <span className="text-xl font-normal text-[#64748B]">kWh</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-[#64748B] font-mono">
            <Zap className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>Avoided ~389 kg CO2 emissions</span>
          </div>
        </div>

      </div>

      {/* Main Grid: 8 Columns Chart + 4 Columns Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 8-Column Main Area Chart */}
        <div className="lg:col-span-8 bg-white border border-[#BAE6FD] rounded-card p-6 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h3 className="text-lg font-bold text-[#0F172A]">Energy Consumption & Revenue Trajectory</h3>
                <p className="text-xs text-[#64748B] font-mono">Daily kWh delivered vs net revenue earnings</p>
              </div>

              {/* Timeframe switch */}
              <div className="flex items-center bg-[#F8FAFC] p-1 rounded-xl border border-[#CBD5E1] text-xs font-mono">
                {(['day', 'week', 'month'] as const).map(tf => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-3 py-1 rounded-lg uppercase font-bold transition-all ${
                      timeframe === tf
                        ? 'bg-white text-[#0284C7] shadow-xs border border-[#BAE6FD]' 
                        : 'text-[#64748B] hover:text-[#0F172A]'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {/* SVG Area Chart in Sky Blue */}
            <div className="h-64 w-full relative">
              <svg className="w-full h-full" viewBox="0 0 700 240" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="areaGradientLight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0284C7" stopOpacity="0.3" />
                    <stop offset="60%" stopColor="#38BDF8" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid lines in #E2E8F0 */}
                <line x1="0" y1="40" x2="700" y2="40" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="0" y1="100" x2="700" y2="100" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="0" y1="160" x2="700" y2="160" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="0" y1="220" x2="700" y2="220" stroke="#E2E8F0" strokeWidth="1" />

                {/* Area Polygon */}
                <polygon
                  points="
                    0,220
                    0,180
                    116,145
                    233,160
                    350,110
                    466,75
                    583,30
                    700,55
                    700,220
                  "
                  fill="url(#areaGradientLight)"
                />

                {/* Line Path #0284C7 */}
                <polyline
                  fill="none"
                  stroke="#0284C7"
                  strokeWidth="3"
                  points="
                    0,180
                    116,145
                    233,160
                    350,110
                    466,75
                    583,30
                    700,55
                  "
                />

                {/* Data Points */}
                {[
                  { cx: 0, cy: 180 },
                  { cx: 116, cy: 145 },
                  { cx: 233, cy: 160 },
                  { cx: 350, cy: 110 },
                  { cx: 466, cy: 75 },
                  { cx: 583, cy: 30 },
                  { cx: 700, cy: 55 },
                ].map((pt, idx) => (
                  <circle
                    key={idx}
                    cx={pt.cx}
                    cy={pt.cy}
                    r="4.5"
                    fill="#FFFFFF"
                    stroke="#0284C7"
                    strokeWidth="3"
                  />
                ))}
              </svg>

              {/* X Axis Labels */}
              <div className="flex justify-between text-[11px] font-mono text-[#64748B] pt-2 px-1">
                {chartDataWeekly.map(d => (
                  <div key={d.label} className="text-center">
                    <div>{d.label}</div>
                    <div className="text-[10px] text-[#0F172A] font-bold">{d.kwh} kWh</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between text-xs font-mono text-[#64748B]">
            <span>Peak delivery window: <strong className="text-[#0F172A]">Saturday (115 kWh)</strong></span>
            <span>Est. upcoming payout: <strong className="text-[#16A34A]">{formatCurrency(145.0)}</strong></span>
          </div>
        </div>

        {/* 4-Column Controls & Incoming Requests */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Node Availability Toggle */}
          <div className="bg-white border border-[#BAE6FD] rounded-card p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-mono font-bold text-[#64748B] tracking-wider">Station Status</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                primaryCharger?.listingStatus === 'live' 
                  ? 'bg-[#DCFCE7] text-[#16A34A] border border-[#86EFAC]' 
                  : 'bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]'
              }`}>
                {primaryCharger ? primaryCharger.listingStatus.toUpperCase() : 'NO CHARGER'}
              </span>
            </div>

            {primaryCharger ? (
              <div>
                <h4 className="text-sm font-bold text-[#0F172A]">{primaryCharger.title}</h4>
                <p className="text-xs text-[#64748B] mt-0.5 font-sans">{primaryCharger.approxAddress}</p>
                <div className="grid grid-cols-2 gap-2 pt-3 font-mono">
                  <button
                    onClick={() => toggleHostVacation(primaryCharger.id)}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      primaryCharger.listingStatus === 'live'
                        ? 'bg-[#DCFCE7] border-[#86EFAC] text-[#16A34A]'
                        : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#64748B]'
                    }`}
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    <span>In Service</span>
                  </button>

                  <button
                    onClick={() => toggleHostVacation(primaryCharger.id)}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      primaryCharger.listingStatus === 'paused'
                        ? 'bg-[#FEF3C7] border-[#FDE68A] text-[#D97706]'
                        : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#64748B]'
                    }`}
                  >
                    <PauseCircle className="w-3.5 h-3.5" />
                    <span>Vacation Mode</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-center text-xs text-[#64748B]">
                <p>No active charging bay listed yet.</p>
                <button
                  onClick={onOpenListingWizard}
                  className="mt-2 text-[#0284C7] underline font-mono font-bold"
                >
                  List My Charger
                </button>
              </div>
            )}
          </div>

          {/* Incoming Driver Requests */}
          <div className="bg-white border border-[#BAE6FD] rounded-card p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-mono font-bold text-[#64748B] tracking-wider">Driver Requests</span>
              <span className="text-[10px] font-mono font-bold text-[#0284C7]">{pendingRequests.length} pending</span>
            </div>

            {pendingRequests.length === 0 ? (
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-center text-xs text-[#64748B]">
                <CheckCircle2 className="w-6 h-6 text-[#16A34A] mx-auto mb-2 opacity-80" />
                <p>Zero pending requests.</p>
                <p className="text-[11px] mt-1 text-[#94A3B8] font-mono">Instant auto-approval active.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map(req => (
                  <div key={req.id} className="p-3 rounded-xl bg-[#F0F9FF] border border-[#BAE6FD] space-y-2 font-mono">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#0F172A]">{req.driverName}</span>
                      <span className="text-[#0284C7] font-bold">{formatCurrency(req.totalAmount)}</span>
                    </div>
                    <div className="text-[11px] text-[#64748B]">
                      {req.driverVehicle} • {req.durationHours}h ({req.startTime})
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => approveChargerListing(req.chargerId)}
                        className="flex-1 py-1.5 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs shadow-xs"
                      >
                        Accept
                      </button>
                      <button
                        className="px-3 py-1.5 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] text-[#DC2626] text-xs font-semibold"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Safety Compliance Card */}
          <div className="bg-white border border-[#BAE6FD] rounded-card p-5 space-y-3 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0F172A]">
              <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
              <span className="font-mono">Electrical Safety Certified</span>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Ground earthing resistance under 5 Ohms. High-speed Type B RCD surge protection verified.
            </p>
            <div className="text-[11px] font-mono text-[#0284C7] flex items-center gap-1 font-semibold">
              <FileText className="w-3.5 h-3.5" />
              <span>Safety_Inspection_Approval_2026.pdf</span>
            </div>
          </div>

        </div>

      </div>

      {/* Table: Recent Sessions */}
      <div className="bg-white border border-[#BAE6FD] rounded-card p-6 shadow-sm">
        <h3 className="text-lg font-bold text-[#0F172A] mb-4">Chronological Session Log & Payouts</h3>
        
        {bookings.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#64748B] border border-dashed border-[#CBD5E1] rounded-xl font-mono">
            No charging sessions recorded in this billing cycle.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-[#64748B] uppercase text-[10px] font-mono tracking-wider">
                  <th className="pb-3 font-semibold">Session ID</th>
                  <th className="pb-3 font-semibold">Driver & Vehicle</th>
                  <th className="pb-3 font-semibold">Duration & Energy</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Net Payout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {bookings.map(b => (
                  <tr key={b.id} className="hover:bg-[#F0F9FF] transition-colors">
                    <td className="py-3 font-mono text-[#0284C7] font-bold">{b.id}</td>
                    <td className="py-3">
                      <div className="font-bold text-[#0F172A]">{b.driverName}</div>
                      <div className="text-[11px] text-[#64748B] font-mono">{b.driverVehicle}</div>
                    </td>
                    <td className="py-3 font-mono">
                      <span className="text-[#0F172A] font-semibold">{b.durationHours}h</span>
                      <span className="text-[#64748B] ml-2">({b.estimatedKwh} kWh)</span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        b.status === 'active' 
                          ? 'bg-[#DCFCE7] text-[#16A34A] border border-[#86EFAC]'
                          : b.status === 'completed'
                          ? 'bg-[#F1F5F9] text-[#475569]'
                          : 'bg-[#FEF3C7] text-[#D97706]'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 text-right font-mono font-bold text-[#0F172A]">
                      {formatCurrency(b.totalAmount - b.platformFee)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
