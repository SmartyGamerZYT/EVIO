import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Check,
  AlertTriangle,
  Activity,
  Zap,
  Cpu,
  BarChart3,
  Clock,
  Layers,
  Search
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SupervisorDashboard: React.FC = () => {
  const { 
    chargers, 
    approveChargerListing, 
    rejectChargerListing, 
    formatCurrency, 
    disputes, 
    resolveDispute,
    bookings
  } = useApp();

  const [activeTab, setActiveTab] = useState<'pending' | 'grid' | 'disputes' | 'audit'>('pending');
  const [rejectReason, setRejectReason] = useState('');
  const [selectedChargerIdForReject, setSelectedChargerIdForReject] = useState<string | null>(null);

  const pendingListings = chargers.filter(c => c.listingStatus === 'pending');
  const liveListings = chargers.filter(c => c.listingStatus === 'live');
  const activeSessions = bookings.filter(b => b.status === 'active');

  const totalGridCapacityKw = liveListings.reduce((sum, c) => sum + c.powerKw, 0);
  const currentLoadKw = activeSessions.reduce((sum, b) => sum + (b.activeSession?.flowRateKw || 0), 0);
  const loadPercentage = totalGridCapacityKw > 0 ? ((currentLoadKw / totalGridCapacityKw) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-6 font-sans">
      
      {/* Supervisor Header */}
      <div className="bg-white border border-[#BAE6FD] rounded-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7] animate-pulse"></span>
            <span className="text-xs font-mono font-bold text-[#0284C7] uppercase tracking-wider">
              Electrical Safety Authority & Grid Supervision
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Supervisor Operations Console</h1>
          <p className="text-xs text-[#64748B] mt-1 font-sans">
            Oversee NB 777 earthing compliance, review electrical inspection certificates, monitor real-time substation load, and resolve disputes.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-[#F8FAFC] p-1 rounded-xl border border-[#CBD5E1] text-xs font-mono flex-wrap">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'pending' ? 'bg-[#0284C7] text-white shadow-xs' : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Safety Approvals</span>
            <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
              {pendingListings.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('grid')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'grid' ? 'bg-[#0284C7] text-white shadow-xs' : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Grid Telemetry</span>
          </button>

          <button
            onClick={() => setActiveTab('disputes')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'disputes' ? 'bg-[#0284C7] text-white shadow-xs' : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Disputes</span>
            <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
              {disputes.filter(d => d.status !== 'resolved').length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'audit' ? 'bg-[#0284C7] text-white shadow-xs' : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Audit Log</span>
          </button>
        </div>
      </div>

      {/* Real-Time Supervisor KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#BAE6FD] rounded-card p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-mono text-[#64748B] mb-1">
            <span>Pending Verifications</span>
            <ShieldCheck className="w-4 h-4 text-[#0284C7]" />
          </div>
          <div className="font-mono text-2xl font-bold text-[#0F172A]">
            {pendingListings.length} Stations
          </div>
          <div className="text-[11px] text-[#0284C7] font-mono mt-1">Requires Safety Sign-Off</div>
        </div>

        <div className="bg-white border border-[#BAE6FD] rounded-card p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-mono text-[#64748B] mb-1">
            <span>Active Live Nodes</span>
            <Zap className="w-4 h-4 text-[#16A34A]" />
          </div>
          <div className="font-mono text-2xl font-bold text-[#0F172A]">
            {liveListings.length} Live
          </div>
          <div className="text-[11px] text-[#16A34A] font-mono mt-1">Total Grid Cap: {totalGridCapacityKw} kW</div>
        </div>

        <div className="bg-white border border-[#BAE6FD] rounded-card p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-mono text-[#64748B] mb-1">
            <span>Instant Grid Load</span>
            <Activity className="w-4 h-4 text-[#D97706]" />
          </div>
          <div className="font-mono text-2xl font-bold text-[#0F172A]">
            {currentLoadKw.toFixed(1)} kW
          </div>
          <div className="text-[11px] text-[#64748B] font-mono mt-1">{loadPercentage}% Line Saturation</div>
        </div>

        <div className="bg-white border border-[#BAE6FD] rounded-card p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-mono text-[#64748B] mb-1">
            <span>Active Incidents</span>
            <AlertTriangle className="w-4 h-4 text-[#E11D48]" />
          </div>
          <div className="font-mono text-2xl font-bold text-[#0F172A]">
            {disputes.filter(d => d.status !== 'resolved').length} Pending
          </div>
          <div className="text-[11px] text-[#16A34A] font-mono mt-1">Arbitration Queue Clear</div>
        </div>
      </div>

      {/* TAB 1: SAFETY APPROVALS */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#0F172A] font-mono flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#0284C7]" />
              <span>Safety Certification Approval Queue ({pendingListings.length})</span>
            </h2>
          </div>

          {pendingListings.length === 0 ? (
            <div className="bg-white border border-[#BAE6FD] rounded-card p-12 text-center text-xs text-[#64748B] font-mono shadow-sm">
              <CheckCircle2 className="w-8 h-8 text-[#16A34A] mx-auto mb-2 opacity-80" />
              <p className="font-bold text-[#0F172A]">All Safety Certificates Verified</p>
              <p className="font-sans text-[11px] text-[#64748B] mt-1">
                Zero pending chargers in supervisor audit queue. New host station submissions will appear here for electrical sign-off.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {pendingListings.map(charger => (
                <div 
                  key={charger.id} 
                  className="bg-white border border-[#BAE6FD] rounded-card p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                >
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#E0F2FE] text-[#0284C7] border border-[#BAE6FD]">
                        {charger.id}
                      </span>
                      <h3 className="text-base font-bold text-[#0F172A]">{charger.title}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#D97706] font-mono font-bold">
                        Pending Electrical Audit
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono text-[#64748B]">
                      <div>
                        <span className="block text-[10px] text-[#94A3B8]">HOST</span>
                        <span className="text-[#0F172A] font-medium">{charger.hostName}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-[#94A3B8]">LOCATION</span>
                        <span className="text-[#0F172A] font-medium">{charger.exactAddress}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-[#94A3B8]">POWER SPECS</span>
                        <span className="text-[#0284C7] font-bold">{charger.powerKw} kW ({charger.connectorTypes.join(', ')})</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-[#94A3B8]">RATE</span>
                        <span className="text-[#0F172A] font-bold">{formatCurrency(charger.priceRate)}/{charger.pricingType === 'per-kwh' ? 'kWh' : 'hr'}</span>
                      </div>
                    </div>

                    {/* Certificate Box */}
                    <div className="bg-[#F0F9FF] border border-[#BAE6FD] rounded-xl p-3 flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#0284C7]" />
                        <span className="font-bold text-[#0F172A]">Document: {charger.safetyCertificateName || 'State_Earthing_Inspection.pdf'}</span>
                        <span className="text-[#64748B] text-[10px]">• Earthing Resistance &lt; 5Ω Verified</span>
                      </div>
                      <span className="text-[11px] text-[#0284C7] font-bold underline cursor-pointer">
                        View Audit Scan
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-col lg:flex-row items-center gap-2">
                    <button
                      onClick={() => approveChargerListing(charger.id)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-mono text-xs font-bold transition-all shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve & Authorize Live</span>
                    </button>

                    <button
                      onClick={() => setSelectedChargerIdForReject(charger.id)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-[#CBD5E1] hover:border-[#E11D48] text-[#E11D48] hover:bg-[#FFF1F2] font-mono text-xs font-bold transition-all"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reject Reason Modal */}
          {selectedChargerIdForReject && (
            <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white border border-[#BAE6FD] rounded-card p-6 w-full max-w-md shadow-2xl">
                <h3 className="text-sm font-bold text-[#0F172A] font-mono mb-2">Specify Rejection Finding</h3>
                <p className="text-xs text-[#64748B] mb-4">
                  Provide electrical compliance rationale for host notification (e.g., earthing resistance out of range, missing RCD Type B breaker).
                </p>
                <textarea
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  placeholder="e.g. Earthing measurement exceeds 5 Ohms or missing RCCB specification."
                  className="w-full h-24 p-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#0F172A] focus:outline-none focus:border-[#0284C7] mb-4 font-sans"
                />
                <div className="flex justify-end gap-2 text-xs font-mono">
                  <button
                    onClick={() => {
                      setSelectedChargerIdForReject(null);
                      setRejectReason('');
                    }}
                    className="px-4 py-2 rounded-xl bg-white border border-[#CBD5E1] text-[#64748B]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (selectedChargerIdForReject) {
                        rejectChargerListing(selectedChargerIdForReject, rejectReason || 'Safety documentation non-compliant.');
                        setSelectedChargerIdForReject(null);
                        setRejectReason('');
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white font-bold"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: GRID TELEMETRY & LOAD BALANCING */}
      {activeTab === 'grid' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white border border-[#BAE6FD] rounded-card p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
              <div>
                <h3 className="font-bold text-[#0F172A] font-mono">Substation Feeder Telemetry (Live)</h3>
                <p className="text-xs text-[#64748B] font-mono">Active Line Monitoring (IEC 61851-1 / NB 777 Grid Standard)</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[#E0F2FE] text-[#0284C7] font-mono text-xs font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse"></span>
                <span>Normal Grid Frequency</span>
              </span>
            </div>

            {/* Grid Measurements */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3">
                <div className="text-[10px] text-[#64748B]">LINE VOLTAGE</div>
                <div className="text-xl font-bold text-[#0F172A] mt-0.5">231.4 V</div>
                <div className="text-[10px] text-[#16A34A]">Nominal (+0.6%)</div>
              </div>

              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3">
                <div className="text-[10px] text-[#64748B]">GRID FREQUENCY</div>
                <div className="text-xl font-bold text-[#0F172A] mt-0.5">50.02 Hz</div>
                <div className="text-[10px] text-[#16A34A]">Locked PLL</div>
              </div>

              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3">
                <div className="text-[10px] text-[#64748B]">POWER FACTOR</div>
                <div className="text-xl font-bold text-[#0284C7] mt-0.5">0.985</div>
                <div className="text-[10px] text-[#0284C7]">cos φ optimal</div>
              </div>

              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3">
                <div className="text-[10px] text-[#64748B]">PEAK SHAVING</div>
                <div className="text-xl font-bold text-[#16A34A] mt-0.5">STANDBY</div>
                <div className="text-[10px] text-[#64748B]">No curtailment needed</div>
              </div>
            </div>

            {/* Live Station Load List */}
            <div>
              <h4 className="font-bold text-xs font-mono text-[#0F172A] mb-3 uppercase tracking-wider">
                Live Station Load Table
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono text-left">
                  <thead className="bg-[#F8FAFC] text-[#64748B] border-b border-[#E2E8F0]">
                    <tr>
                      <th className="py-2.5 px-3">Node ID</th>
                      <th className="py-2.5 px-3">Station Name</th>
                      <th className="py-2.5 px-3">Rated kW</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Safety Doc</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {chargers.map(chg => (
                      <tr key={chg.id} className="hover:bg-[#F0F9FF]">
                        <td className="py-2.5 px-3 font-bold text-[#0284C7]">{chg.id}</td>
                        <td className="py-2.5 px-3 text-[#0F172A]">{chg.title}</td>
                        <td className="py-2.5 px-3 font-bold">{chg.powerKw} kW</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            chg.status === 'available' ? 'bg-[#DCFCE7] text-[#16A34A]' :
                            chg.status === 'in-use' ? 'bg-[#FEF3C7] text-[#D97706]' : 'bg-[#F1F5F9] text-[#64748B]'
                          }`}>
                            {chg.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-[#16A34A] flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>{chg.safetyCertificateVerified ? 'Verified' : 'Pending'}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Supervisor Substation Controls */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white border border-[#BAE6FD] rounded-card p-5 shadow-sm space-y-4 font-mono">
              <h4 className="font-bold text-xs text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#0284C7]" />
                <span>Substation Load Balancer</span>
              </h4>
              <p className="text-xs text-[#64748B] font-sans">
                Dynamic load management throttles charging rates automatically during high local transformer peak hours.
              </p>

              <div className="p-3 bg-[#F0F9FF] border border-[#BAE6FD] rounded-xl space-y-2 text-xs">
                <div className="flex justify-between font-bold text-[#0F172A]">
                  <span>Dynamic Curtailment:</span>
                  <span className="text-[#16A34A]">AUTOMATIC (ACTIVE)</span>
                </div>
                <div className="flex justify-between text-[#64748B]">
                  <span>Max Substation Headroom:</span>
                  <span>120 kW</span>
                </div>
                <div className="flex justify-between text-[#64748B]">
                  <span>Emergency Shutdown Relay:</span>
                  <span className="text-[#16A34A]">ARMED</span>
                </div>
              </div>

              <button
                onClick={() => alert('Grid telemetry report downloaded as PDF.')}
                className="w-full py-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold text-xs shadow-xs"
              >
                Export Grid Compliance Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DISPUTES */}
      {activeTab === 'disputes' && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-[#0F172A] font-mono flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#E11D48]" />
            <span>Station Disputes & Arbitration ({disputes.length})</span>
          </h2>

          {disputes.length === 0 ? (
            <div className="bg-white border border-[#BAE6FD] rounded-card p-12 text-center text-xs text-[#64748B] font-mono shadow-sm">
              <CheckCircle2 className="w-8 h-8 text-[#16A34A] mx-auto mb-2 opacity-80" />
              <p className="font-bold text-[#0F172A]">Zero Active Station Incidents</p>
              <p className="font-sans text-[11px] text-[#64748B] mt-1">
                All host and driver arbitration cases have been reviewed and resolved.
              </p>
            </div>
          ) : (
            <div className="space-y-3 font-mono">
              {disputes.map(dispute => (
                <div key={dispute.id} className="bg-white border border-[#BAE6FD] rounded-card p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#E11D48] text-xs">#{dispute.id}</span>
                      <span className="text-xs font-bold text-[#0F172A]">{dispute.reason}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        dispute.status === 'resolved' ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-[#FFE4E6] text-[#E11D48]'
                      }`}>
                        {dispute.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-xs text-[#64748B] font-sans">{dispute.details}</div>
                    <div className="text-[11px] text-[#94A3B8]">Logged by User #{dispute.reporterId} • Booking #{dispute.bookingId} • {dispute.createdAt}</div>
                  </div>

                  {dispute.status !== 'resolved' && (
                    <button
                      onClick={() => resolveDispute(dispute.id)}
                      className="px-4 py-2 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold whitespace-nowrap shadow-xs"
                    >
                      Arbitrate & Resolve
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: AUDIT LOG */}
      {activeTab === 'audit' && (
        <div className="bg-white border border-[#BAE6FD] rounded-card p-6 shadow-sm space-y-4 font-mono">
          <h3 className="font-bold text-[#0F172A] text-sm">Supervisor Security & Safety Audit Trail</h3>
          <p className="text-xs text-[#64748B] font-sans">
            Immutable log of earthing inspections, station approvals, operator credentials, and circuit breaker trip telemetry.
          </p>

          <div className="divide-y divide-[#E2E8F0] text-xs">
            <div className="py-3 flex justify-between items-center">
              <div>
                <span className="font-bold text-[#0284C7]">SAFETY_VERIFY</span>
                <span className="text-[#0F172A] ml-2">Node NODE-001 certified for Level 2 operation (32A RCD Type B)</span>
              </div>
              <span className="text-[11px] text-[#94A3B8]">14 mins ago</span>
            </div>
            <div className="py-3 flex justify-between items-center">
              <div>
                <span className="font-bold text-[#16A34A]">GRID_STABILITY</span>
                <span className="text-[#0F172A] ml-2">Line frequency stabilized at 50.02 Hz across all active bays</span>
              </div>
              <span className="text-[11px] text-[#94A3B8]">1 hr ago</span>
            </div>
            <div className="py-3 flex justify-between items-center">
              <div>
                <span className="font-bold text-[#D97706]">INSPECTION_REQ</span>
                <span className="text-[#0F172A] ml-2">New installation uploaded: State_Certified_Earthing_Report.pdf</span>
              </div>
              <span className="text-[11px] text-[#94A3B8]">3 hrs ago</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
