import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  Zap, 
  ShieldCheck, 
  CheckCircle2, 
  Calculator, 
  TrendingUp, 
  Package, 
  ArrowRight,
  Layers,
  Sparkles,
  PhoneCall
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface FranchiseModalProps {
  onClose: () => void;
}

export const FranchiseModal: React.FC<FranchiseModalProps> = ({ onClose }) => {
  const { currentUser, formatCurrency, submitFranchiseApplication } = useApp();

  const [selectedPackage, setSelectedPackage] = useState<'micro' | 'commercial' | 'highway'>('commercial');
  const [applicantName, setApplicantName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '+91 98450-12345');
  const [city, setCity] = useState('Pune / Expressway Corridor');
  const [locationAddress, setLocationAddress] = useState('Plot 42, Highway Rest Plaza or Commercial Complex');
  const [landType, setLandType] = useState<'owned' | 'leased'>('owned');
  const [powerSanctionKw, setPowerSanctionKw] = useState(100);
  const [notes, setNotes] = useState('Site has 24/7 access, dedicated parking bays, and nearby restaurant amenities.');
  
  // ROI Calculator states
  const [dailyCars, setDailyCars] = useState(25);
  const [avgKwh, setAvgKwh] = useState(20);

  const [isSubmitted, setIsSubmitted] = useState(false);

  // Packages definition
  const packages = [
    {
      type: 'micro' as const,
      name: 'Micro-Hub Starter',
      subtitle: 'Ideal for Cafes, Societies & Retail Parking',
      wholesalePrice: 110000,
      retailPrice: 180000,
      savings: 70000,
      hardware: '2x 22kW Dual AC Type-2 Wallboxes + Smart Energy Meters + EVIO Grid Gateway',
      powerNeeded: '45 kVA',
      expectedMonthly: 32000,
      popular: false,
    },
    {
      type: 'commercial' as const,
      name: 'Commercial Fast-Hub',
      subtitle: 'For Malls, Tech Parks & Urban Junctions',
      wholesalePrice: 440000,
      retailPrice: 720000,
      savings: 280000,
      hardware: '1x 60kW Dual DC Fast Gun (CCS2) + 2x 22kW AC + Surge Isolation Panel + Canopy Branding',
      powerNeeded: '100 kVA',
      expectedMonthly: 85000,
      popular: true,
    },
    {
      type: 'highway' as const,
      name: 'Highway Mega-Hub + Swap',
      subtitle: 'Expressway Corridors & Heavy Commuter Arteries',
      wholesalePrice: 1190000,
      retailPrice: 1850000,
      savings: 660000,
      hardware: '2x 120kW Ultra-Fast DC Guns + 8-Bay Swappable Battery Cabinet + Solar Microgrid Gateway',
      powerNeeded: '250 kVA',
      expectedMonthly: 195000,
      popular: false,
    }
  ];

  const currentPkg = packages.find(p => p.type === selectedPackage)!;

  // Calculate dynamic ROI
  const dailyKwh = dailyCars * avgKwh;
  const unitMargin = 4.5; // ₹4.5 net margin per kWh delivered
  const monthlyProfitEst = Math.round(dailyKwh * unitMargin * 30);
  const paybackMonths = Math.max(3, Number((currentPkg.wholesalePrice / monthlyProfitEst).toFixed(1)));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitFranchiseApplication({
      applicantName,
      email,
      phone,
      city,
      locationAddress,
      packageType: selectedPackage,
      powerSanctionKw,
      landType,
      estimatedInvestment: currentPkg.wholesalePrice,
      expectedMonthlyEarnings: monthlyProfitEst,
      notes,
    });
    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-sans">
      <div className="bg-white border border-[#BAE6FD] rounded-card w-full max-w-4xl max-h-[92vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative my-auto space-y-6">
        
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
            <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] animate-pulse"></span>
            <span className="text-xs font-mono font-bold text-[#16A34A] uppercase tracking-wider">
              EVIO Hub Franchise Partnership Program
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
            Launch Your EV Charging Hub with Direct Bulk Wholesale Hardware
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1 font-sans max-w-2xl">
            EVIO buys commercial chargers and swappable battery kiosks in bulk directly from certified global manufacturers (ABB, Schneider, Delta) at a 40% volume discount, and supplies them to franchise partners at subsidized wholesale prices.
          </p>
        </div>

        {isSubmitted ? (
          <div className="p-8 text-center space-y-4 bg-[#F0FDF4] border-2 border-[#16A34A] rounded-2xl font-mono">
            <CheckCircle2 className="w-12 h-12 text-[#16A34A] mx-auto" />
            <h3 className="text-xl font-bold text-[#0F172A]">Franchise Partnership Application Submitted!</h3>
            <p className="text-xs text-[#64748B] max-w-md mx-auto">
              Our Grid Expansion & Technical Supervisor team has received your site application for <strong>{city}</strong> ({currentPkg.name}). We will contact you within 24 hours to schedule site earthing verification and hardware dispatch.
            </p>
            <div className="pt-2">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-[#0284C7] text-white font-bold text-xs"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* Value Proposition Highlight */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#F0F9FF] border border-[#BAE6FD] space-y-1">
                <span className="text-xs font-mono font-bold text-[#0284C7] uppercase block">Tier-1 Bulk Sourcing</span>
                <p className="text-xs text-[#0F172A] font-medium">We procure direct from factory gates in 500+ unit lots, passing wholesale margins to you.</p>
              </div>
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
                <span className="text-xs font-mono font-bold text-[#16A34A] uppercase block">Software Grid Included</span>
                <p className="text-xs text-[#0F172A] font-medium">Full integration with the Evio Driver Marketplace, real-time telemetry, and auto-settled UPI/wallet payouts.</p>
              </div>
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
                <span className="text-xs font-mono font-bold text-[#D97706] uppercase block">Turnkey Installation</span>
                <p className="text-xs text-[#0F172A] font-medium">Certified licensed electrician earthing, RCD Type B circuit protection, and state grid sanction support.</p>
              </div>
            </div>

            {/* Franchise Package Selection Cards */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#0F172A] font-mono flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#0284C7]" />
                  <span>Choose Your Turnkey Hardware Franchise Package</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {packages.map(pkg => {
                  const isSelected = selectedPackage === pkg.type;
                  return (
                    <div
                      key={pkg.type}
                      onClick={() => setSelectedPackage(pkg.type)}
                      className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                        isSelected 
                          ? 'border-[#0284C7] bg-[#F0F9FF] shadow-md ring-2 ring-[#0284C7]/20' 
                          : 'border-[#E2E8F0] bg-white hover:border-[#BAE6FD]'
                      }`}
                    >
                      {pkg.popular && (
                        <span className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-[#0284C7] text-white font-mono text-[10px] font-bold shadow-xs">
                          MOST POPULAR
                        </span>
                      )}

                      <div className="space-y-2">
                        <h4 className="font-bold text-base text-[#0F172A]">{pkg.name}</h4>
                        <p className="text-xs text-[#64748B]">{pkg.subtitle}</p>

                        <div className="pt-2 border-t border-[#E2E8F0]">
                          <div className="flex items-baseline gap-2 font-mono">
                            <span className="text-xl font-extrabold text-[#0284C7]">{formatCurrency(pkg.wholesalePrice)}</span>
                            <span className="text-xs text-[#94A3B8] line-through">{formatCurrency(pkg.retailPrice)}</span>
                          </div>
                          <span className="text-[11px] font-mono font-bold text-[#16A34A] block mt-0.5">
                            You Save {formatCurrency(pkg.savings)} (Wholesale Subsidy)
                          </span>
                        </div>

                        <div className="pt-3 border-t border-[#E2E8F0] text-xs font-mono text-[#475569] space-y-1">
                          <p className="text-[11px] leading-relaxed"><strong>Included:</strong> {pkg.hardware}</p>
                          <p className="text-[11px]"><strong>Power Sanction:</strong> {pkg.powerNeeded}</p>
                        </div>
                      </div>

                      <div className="pt-4 mt-3 border-t border-[#E2E8F0] flex items-center justify-between text-xs font-mono font-bold">
                        <span className="text-[#64748B]">Est. Net: {formatCurrency(pkg.expectedMonthly)}/mo</span>
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                          isSelected ? 'bg-[#0284C7] border-[#0284C7] text-white' : 'border-[#CBD5E1]'
                        }`}>
                          {isSelected && '✓'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Interactive ROI Calculator */}
            <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#BAE6FD] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-[#0284C7]" />
                  <h4 className="text-sm font-bold text-[#0F172A] font-mono uppercase">
                    Franchise Payback & Earnings Calculator
                  </h4>
                </div>
                <span className="text-xs font-mono text-[#16A34A] font-bold">
                  Est. Payback in ~{paybackMonths} Months
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-[#64748B]">Projected Charging Sessions / Day:</span>
                    <strong className="text-[#0284C7]">{dailyCars} Vehicles</strong>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="80"
                    value={dailyCars}
                    onChange={e => setDailyCars(Number(e.target.value))}
                    className="w-full accent-[#0284C7] cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-[#64748B]">Average Dispensed per Vehicle:</span>
                    <strong className="text-[#0284C7]">{avgKwh} kWh</strong>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={avgKwh}
                    onChange={e => setAvgKwh(Number(e.target.value))}
                    className="w-full accent-[#0284C7] cursor-pointer"
                  />
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-[#CBD5E1] grid grid-cols-3 gap-2 text-center font-mono text-xs">
                <div>
                  <span className="text-[10px] text-[#64748B] block">DAILY KWH DISPENSED</span>
                  <span className="font-bold text-[#0F172A] text-sm">{dailyKwh} kWh</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#64748B] block">PROJECTED MONTHLY PROFIT</span>
                  <span className="font-bold text-[#16A34A] text-sm">{formatCurrency(monthlyProfitEst)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#64748B] block">WHOLESALE INVESTMENT</span>
                  <span className="font-bold text-[#0284C7] text-sm">{formatCurrency(currentPkg.wholesalePrice)}</span>
                </div>
              </div>
            </div>

            {/* Franchise Application Form */}
            <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-[#E2E8F0]">
              <h3 className="text-base font-bold text-[#0F172A] font-mono">
                Submit Franchise Application for Supervisor Review
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <label className="font-bold text-[#475569] block mb-1">Applicant Name *</label>
                  <input
                    type="text"
                    required
                    value={applicantName}
                    onChange={e => setApplicantName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#0F172A] focus:border-[#0284C7]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#475569] block mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#0F172A] focus:border-[#0284C7]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#475569] block mb-1">Hub City / Region *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    placeholder="e.g. Pune, Mumbai Highway, Bengaluru"
                    className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#0F172A] focus:border-[#0284C7]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#475569] block mb-1">Sanctioned Electrical Load (kVA / kW)</label>
                  <input
                    type="number"
                    min="20"
                    max="500"
                    value={powerSanctionKw}
                    onChange={e => setPowerSanctionKw(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#0F172A] focus:border-[#0284C7]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-[#475569] block mb-1">Proposed Hub Location / Site Address *</label>
                  <input
                    type="text"
                    required
                    value={locationAddress}
                    onChange={e => setLocationAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#0F172A] focus:border-[#0284C7]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#475569] block mb-1">Site Ownership</label>
                  <select
                    value={landType}
                    onChange={e => setLandType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#0F172A] focus:border-[#0284C7]"
                  >
                    <option value="owned">Self Owned Commercial Land / Property</option>
                    <option value="leased">Long-term Leased Land (&gt; 3 Years)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#475569] block mb-1">Selected Wholesale Bundle</label>
                  <input
                    type="text"
                    readOnly
                    value={`${currentPkg.name} (${formatCurrency(currentPkg.wholesalePrice)})`}
                    className="w-full px-3.5 py-2.5 bg-[#E0F2FE] border border-[#BAE6FD] text-[#0284C7] font-bold rounded-xl text-xs cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white font-mono font-bold text-xs tracking-wider shadow-md shadow-[#0284C7]/25 active:scale-98 transition-all flex items-center justify-center gap-2"
                >
                  <Building2 className="w-4 h-4" />
                  <span>SUBMIT FRANCHISE APPLICATION • SECURE BULK WHOLESALE RATE</span>
                </button>
              </div>
            </form>

          </div>
        )}

      </div>
    </div>
  );
};
