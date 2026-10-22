import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  MapPin, 
  Zap, 
  ShieldCheck, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  FileText
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ConnectorType, PowerTier, PricingType } from '../../types';

interface ListingWizardModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const ListingWizardModal: React.FC<ListingWizardModalProps> = ({ onClose, onSuccess }) => {
  const { currentUser, addChargerListing, formatCurrency } = useApp();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 7;

  const [photos, setPhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1558441719-798481498b3f?w=800',
    'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800',
  ]);
  const [photoInput, setPhotoInput] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [approxAddress, setApproxAddress] = useState('');
  const [exactAddress, setExactAddress] = useState('');
  const [lat, setLat] = useState(37.7749);
  const [lng, setLng] = useState(-122.4194);

  const [powerKw, setPowerKw] = useState(22);
  const [powerTier, setPowerTier] = useState<PowerTier>('fast');
  const [selectedConnectors, setSelectedConnectors] = useState<ConnectorType[]>(['Type 2']);
  const [cableLengthMeters, setCableLengthMeters] = useState(7.5);
  const [simultaneousSlots, setSimultaneousSlots] = useState(1);

  const [pricingType, setPricingType] = useState<PricingType>('per-kwh');
  const [priceRate, setPriceRate] = useState(0.32);

  const [is247, setIs247] = useState(true);
  const [selectedDays, setSelectedDays] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
  const [hoursString, setHoursString] = useState('Open 24/7');
  const [maxDurationHours, setMaxDurationHours] = useState(4);

  const [accessNotes, setAccessNotes] = useState('Automatic gate with sensor. Security code 4829#. Parking in Bay A.');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(['Covered Canopy', 'HD CCTV Security', 'High-Speed WiFi']);

  const [bookingMode, setBookingMode] = useState<'instant' | 'approval'>('instant');
  const [certificateName, setCertificateName] = useState('State_Certified_Earthing_Report.pdf');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const toggleConnector = (connector: ConnectorType) => {
    if (selectedConnectors.includes(connector)) {
      if (selectedConnectors.length > 1) {
        setSelectedConnectors(selectedConnectors.filter(c => c !== connector));
      }
    } else {
      setSelectedConnectors([...selectedConnectors, connector]);
    }
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    if (!title || !exactAddress) {
      alert('Please fill out the station title and exact address.');
      return;
    }

    addChargerListing({
      hostId: currentUser?.id || 'host-local',
      hostName: currentUser?.name || 'Local Host',
      hostAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      hostRating: 5.0,
      hostReviewsCount: 0,
      title,
      description: description || 'Private verified Level 2 charging station with circuit breaker protection.',
      photos,
      approxAddress: approxAddress || `${exactAddress.split(',')[0]} (approx. 200m radius)`,
      exactAddress,
      lat,
      lng,
      powerKw,
      powerTier,
      connectorTypes: selectedConnectors,
      cableLengthMeters,
      simultaneousSlots,
      pricingType,
      priceRate,
      safetyCertificateName: certificateName,
      safetyCertificateVerified: false,
      schedule: {
        is247,
        days: selectedDays,
        hours: is247 ? 'Open 24/7' : hoursString,
      },
      amenities: selectedAmenities,
      accessNotes,
      bookingMode,
      maxDurationHours,
    });

    onSuccess();
  };

  const stepTitles = [
    'Station Photos',
    'Location & Coordinates',
    'Electrical Specs',
    'Pricing & Commission',
    'Weekly Availability',
    'Access Instructions & Amenities',
    'Safety Certification'
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-sans">
      <div className="bg-white border border-[#BAE6FD] rounded-card w-full max-w-2xl max-h-[92vh] overflow-y-auto p-6 shadow-2xl relative my-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white border border-[#CBD5E1] flex items-center justify-center text-[#64748B] hover:text-[#0F172A] shadow-xs"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Progress Tracker */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs font-mono text-[#64748B] mb-2">
            <span className="text-[#0284C7] font-bold">Step {currentStep} of {totalSteps}</span>
            <span className="font-bold text-[#0F172A]">{stepTitles[currentStep - 1]}</span>
          </div>
          <div className="w-full h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#0284C7] transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="min-h-[300px] mb-8 font-sans">

          {/* STEP 1: Photos */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-[#0F172A]">Installation Photos</h3>
                <p className="text-xs text-[#64748B] mt-1">
                  Upload at least 2 clear photos: showing the wallbox charger, the plug gun, and the dedicated parking bay.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {photos.map((url, i) => (
                  <div key={i} className="relative h-28 rounded-xl overflow-hidden border border-[#CBD5E1] group">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setPhotos(photos.filter((_, idx) => idx !== i))}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                <div className="h-28 rounded-xl border border-dashed border-[#CBD5E1] hover:border-[#0284C7] flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-colors bg-[#F8FAFC]">
                  <Upload className="w-5 h-5 text-[#0284C7] mb-1" />
                  <span className="text-[11px] font-mono text-[#64748B]">Add Image URL</span>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Paste direct image URL..."
                  value={photoInput}
                  onChange={e => setPhotoInput(e.target.value)}
                  className="flex-1 px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#0F172A] placeholder-[#94A3B8] focus:border-[#0284C7] focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (photoInput) {
                      setPhotos([...photos, photoInput]);
                      setPhotoInput('');
                    }
                  }}
                  className="px-4 py-2 bg-white border border-[#CBD5E1] hover:border-[#0284C7] text-[#0284C7] text-xs font-mono font-bold rounded-xl shadow-xs"
                >
                  Add Photo
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Location */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-[#0F172A]">Location & Address Privacy</h3>
                <p className="text-xs text-[#64748B] mt-1">
                  Public drivers only see an approximate radius. Exact house number is revealed only upon confirmed booking.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-mono font-bold text-[#475569] block mb-1">Station Listing Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. Downtown Metro Hub 22kW Fast Station"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#0F172A] focus:border-[#0284C7] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono font-bold text-[#475569] block mb-1">Public Approximate Area (Shown on map) *</label>
                  <input
                    type="text"
                    placeholder="e.g. Near Central Ave, Financial District"
                    value={approxAddress}
                    onChange={e => setApproxAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#0F172A] focus:border-[#0284C7] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono font-bold text-[#475569] block mb-1">Exact Address (Revealed post-booking) *</label>
                  <input
                    type="text"
                    placeholder="e.g. 450 North Central Ave, Bay 4"
                    value={exactAddress}
                    onChange={e => setExactAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#0F172A] focus:border-[#0284C7] focus:bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Specs */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-[#0F172A]">Electrical Specifications</h3>
                <p className="text-xs text-[#64748B] mt-1">
                  Accurate electrical output ratings to ensure safe pairing with EV models.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono font-bold text-[#475569] block mb-1">Power Output (kW)</label>
                  <input
                    type="number"
                    min="3"
                    max="150"
                    value={powerKw}
                    onChange={e => {
                      const v = Number(e.target.value);
                      setPowerKw(v);
                      if (v <= 7.4) setPowerTier('slow');
                      else if (v <= 25) setPowerTier('fast');
                      else setPowerTier('rapid');
                    }}
                    className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl font-mono text-sm text-[#0284C7] font-bold focus:border-[#0284C7] focus:bg-white"
                  />
                  <span className="text-[10px] font-mono text-[#64748B] mt-1 block">Tier: {powerTier.toUpperCase()}</span>
                </div>

                <div>
                  <label className="text-xs font-mono font-bold text-[#475569] block mb-1">Cable Length (Meters)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="3"
                    max="15"
                    value={cableLengthMeters}
                    onChange={e => setCableLengthMeters(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl font-mono text-sm text-[#0F172A] focus:border-[#0284C7] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-[#475569] block mb-2">Supported Connectors *</label>
                <div className="flex flex-wrap gap-2">
                  {(['Type 2', 'CCS-2', 'GB/T', 'CHAdeMO', 'Type 1'] as ConnectorType[]).map(conn => {
                    const isSelected = selectedConnectors.includes(conn);
                    return (
                      <button
                        key={conn}
                        type="button"
                        onClick={() => toggleConnector(conn)}
                        className={`px-3 py-2 rounded-xl border text-xs font-mono transition-all ${
                          isSelected
                            ? 'bg-[#E0F2FE] border-[#0284C7] text-[#0284C7] font-bold shadow-xs'
                            : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#475569]'
                        }`}
                      >
                        {conn}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Pricing */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-[#0F172A]">Pricing & Take Rate</h3>
                <p className="text-xs text-[#64748B] mt-1">
                  Choose your pricing model. Transparent platform commission (10%) is deducted automatically upon payout.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPricingType('per-kwh')}
                  className={`p-3 rounded-xl border text-xs text-left transition-all ${
                    pricingType === 'per-kwh' ? 'bg-[#E0F2FE] border-[#0284C7] text-[#0F172A] shadow-xs' : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#64748B]'
                  }`}
                >
                  <span className="font-mono font-bold block text-sm mb-1 text-[#0284C7]">Per kWh</span>
                  <span className="text-[11px]">Driver pays for exact energy units dispensed.</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPricingType('per-hour')}
                  className={`p-3 rounded-xl border text-xs text-left transition-all ${
                    pricingType === 'per-hour' ? 'bg-[#E0F2FE] border-[#0284C7] text-[#0F172A] shadow-xs' : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#64748B]'
                  }`}
                >
                  <span className="font-mono font-bold block text-sm mb-1 text-[#0284C7]">Per Hour</span>
                  <span className="text-[11px]">Fixed hourly parking & charging fee.</span>
                </button>
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-[#475569] block mb-1">
                  Your Price ({formatCurrency(priceRate)} per {pricingType === 'per-kwh' ? 'kWh' : 'hour'})
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0.1"
                  max="10"
                  value={priceRate}
                  onChange={e => setPriceRate(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl font-mono text-base text-[#0284C7] font-bold focus:border-[#0284C7] focus:bg-white"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#F0F9FF] border border-[#BAE6FD] text-xs font-mono space-y-1 text-[#475569]">
                <div className="flex justify-between">
                  <span>Host Payout (90%):</span>
                  <span className="text-[#16A34A] font-bold">{formatCurrency(priceRate * 0.9)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Fee (10%):</span>
                  <span>{formatCurrency(priceRate * 0.1)}</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Schedule */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-[#0F172A]">Operating Schedule</h3>
                <p className="text-xs text-[#64748B] mt-1">
                  Define when drivers can reserve and plug into your station.
                </p>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1]">
                <div>
                  <span className="text-xs font-mono font-bold text-[#0F172A] block">Open 24/7 Round the Clock</span>
                  <span className="text-[11px] text-[#64748B]">Continuous automated access</span>
                </div>
                <input
                  type="checkbox"
                  checked={is247}
                  onChange={e => setIs247(e.target.checked)}
                  className="w-4 h-4 accent-[#0284C7]"
                />
              </div>

              {!is247 && (
                <div>
                  <label className="text-xs font-mono font-bold text-[#475569] block mb-1">Permitted Hours</label>
                  <input
                    type="text"
                    placeholder="e.g. 07:00 AM - 10:00 PM"
                    value={hoursString}
                    onChange={e => setHoursString(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#0F172A] font-mono"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-mono font-bold text-[#475569] block mb-1">Max Duration Per Session</label>
                <select
                  value={maxDurationHours}
                  onChange={e => setMaxDurationHours(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#0F172A] font-mono"
                >
                  <option value={2}>2 Hours (Fast boost)</option>
                  <option value={4}>4 Hours (Standard)</option>
                  <option value={8}>8 Hours (Overnight)</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 6: Access & Amenities */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-[#0F172A]">Access Instructions & Amenities</h3>
                <p className="text-xs text-[#64748B] mt-1">
                  Instructions provided only to confirmed drivers for gate entry and parking.
                </p>
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-[#475569] block mb-1">Gate Passcode & Entry Directions *</label>
                <textarea
                  rows={3}
                  value={accessNotes}
                  onChange={e => setAccessNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#0F172A] focus:border-[#0284C7] focus:bg-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-[#475569] block mb-2">Available Amenities</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Covered Canopy', 'HD CCTV Security', 'High-Speed WiFi', 'Restroom', 'Lighting', 'Tire Inflator'].map(am => {
                    const isChecked = selectedAmenities.includes(am);
                    return (
                      <button
                        key={am}
                        type="button"
                        onClick={() => toggleAmenity(am)}
                        className={`p-2 rounded-xl border text-xs text-left font-mono flex items-center justify-between ${
                          isChecked ? 'bg-[#E0F2FE] border-[#0284C7] text-[#0284C7] font-bold shadow-xs' : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#64748B]'
                        }`}
                      >
                        <span>{am}</span>
                        {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-[#0284C7]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: Safety & Certification */}
          {currentStep === 7 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-[#0F172A]">Electrical Safety Certification</h3>
                <p className="text-xs text-[#64748B] mt-1">
                  Every listed charger requires proof of certified electrical earthing and RCD inspection prior to going live.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#F0F9FF] border border-[#BAE6FD] space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#0284C7]">
                  <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
                  <span>Licensed Electrician Sign-off Document</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white border border-[#CBD5E1] text-xs shadow-xs">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#0284C7]" />
                    <span className="font-mono text-[#0F172A] text-[11px] font-bold truncate">{certificateName}</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#16A34A] font-bold">[ATTACHED]</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptedTerms}
                  onChange={e => setAcceptedTerms(e.target.checked)}
                  className="w-4 h-4 accent-[#0284C7] mt-0.5"
                />
                <label htmlFor="terms" className="text-xs text-[#475569] leading-relaxed cursor-pointer font-sans">
                  I warrant that this installation is equipped with an earthing resistance under 5 Ohms and a Type B ground-fault circuit interrupter in full compliance with municipal electrical codes.
                </label>
              </div>
            </div>
          )}

        </div>

        {/* Action Controls */}
        <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between font-mono">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 1}
            className={`px-4 py-2.5 rounded-xl border border-[#CBD5E1] text-xs font-bold flex items-center gap-1.5 transition-all ${
              currentStep === 1 ? 'opacity-40 cursor-not-allowed text-[#94A3B8]' : 'text-[#475569] hover:bg-[#F8FAFC]'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={currentStep === 7 && !acceptedTerms}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold tracking-wider flex items-center gap-1.5 transition-all ${
              currentStep === 7 && !acceptedTerms
                ? 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed'
                : 'bg-[#0284C7] hover:bg-[#0369A1] text-white shadow-sm shadow-[#0284C7]/25'
            }`}
          >
            <span>{currentStep === totalSteps ? 'SUBMIT FOR COMPLIANCE REVIEW' : 'CONTINUE'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
