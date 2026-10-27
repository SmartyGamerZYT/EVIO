import React, { useState, useMemo, useEffect, useRef } from 'react';
import L from 'leaflet';
import { 
  Navigation, 
  MapPin, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Car, 
  BatteryCharging, 
  ArrowRight, 
  Compass, 
  ShieldCheck, 
  Info,
  Calendar,
  Sliders,
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ChargerListing } from '../../types';
import { ChargerDetailModal } from './ChargerDetailModal';

interface RoutePreset {
  id: string;
  name: string;
  origin: string;
  originCoords: [number, number];
  destination: string;
  destCoords: [number, number];
  distanceKm: number;
  expressway: string;
}

const ROUTE_PRESETS: RoutePreset[] = [
  {
    id: 'pune-mumbai',
    name: 'Pune ➔ Mumbai BKC',
    origin: 'Pune Swargate / City Center',
    originCoords: [18.5204, 73.8567],
    destination: 'Mumbai Bandra-Kurla Complex (BKC)',
    destCoords: [19.0657, 72.8687],
    distanceKm: 148,
    expressway: 'Mumbai-Pune Expressway (Yashwantrao Chavan Expy)'
  },
  {
    id: 'pune-lonavala',
    name: 'Pune ➔ Lonavala Hill Pass',
    origin: 'Pune Wakad IT Corridor',
    originCoords: [18.5987, 73.7663],
    destination: 'Lonavala Expressway Ghats',
    destCoords: [18.7557, 73.4091],
    distanceKm: 65,
    expressway: 'NH 48 Expressway Corridors'
  },
  {
    id: 'mumbai-nashik',
    name: 'Mumbai ➔ Nashik City',
    origin: 'Thane Majiwada Junction',
    originCoords: [19.2183, 72.9781],
    destination: 'Nashik CBS Center',
    destCoords: [19.9975, 73.7898],
    distanceKm: 165,
    expressway: 'NH 160 Mumbai-Nashik Expressway'
  },
  {
    id: 'blr-mysuru',
    name: 'Bengaluru ➔ Mysuru',
    origin: 'Bengaluru Kengeri Satellite',
    originCoords: [12.9177, 77.4833],
    destination: 'Mysuru Palace Ring',
    destCoords: [12.3051, 76.6551],
    distanceKm: 144,
    expressway: 'Bengaluru-Mysuru 10-Lane Expressway'
  }
];

interface EVVehicleProfile {
  id: string;
  name: string;
  batteryCapacityKwh: number;
  claimedRangeKm: number;
  realWorldWhPerKm: number;
  maxDcChargeKw: number;
}

const VEHICLE_PROFILES: EVVehicleProfile[] = [
  {
    id: 'tata-nexon-ev',
    name: 'Tata Nexon EV Max (40.5 kWh)',
    batteryCapacityKwh: 40.5,
    claimedRangeKm: 437,
    realWorldWhPerKm: 138,
    maxDcChargeKw: 50
  },
  {
    id: 'tata-tiago-ev',
    name: 'Tata Tiago EV (24 kWh)',
    batteryCapacityKwh: 24.0,
    claimedRangeKm: 315,
    realWorldWhPerKm: 110,
    maxDcChargeKw: 25
  },
  {
    id: 'mg-zs-ev',
    name: 'MG ZS EV Excite (50.3 kWh)',
    batteryCapacityKwh: 50.3,
    claimedRangeKm: 461,
    realWorldWhPerKm: 145,
    maxDcChargeKw: 60
  },
  {
    id: 'mahindra-xuv400',
    name: 'Mahindra XUV400 EL (39.4 kWh)',
    batteryCapacityKwh: 39.4,
    claimedRangeKm: 456,
    realWorldWhPerKm: 140,
    maxDcChargeKw: 50
  },
  {
    id: 'hyundai-ioniq-5',
    name: 'Hyundai Ioniq 5 (72.6 kWh)',
    batteryCapacityKwh: 72.6,
    claimedRangeKm: 631,
    realWorldWhPerKm: 155,
    maxDcChargeKw: 150
  },
  {
    id: 'ather-450x',
    name: 'Ather 450X Gen 3 (3.7 kWh 2W)',
    batteryCapacityKwh: 3.7,
    claimedRangeKm: 146,
    realWorldWhPerKm: 35,
    maxDcChargeKw: 3.3
  }
];

export const JourneyPredictionView: React.FC = () => {
  const { chargers, formatCurrency, userCoords } = useApp();

  // State
  const [selectedPresetId, setSelectedPresetId] = useState<string>('pune-mumbai');
  const [originInput, setOriginInput] = useState<string>('Pune Swargate / City Center');
  const [destInput, setDestInput] = useState<string>('Mumbai Bandra-Kurla Complex (BKC)');
  const [originCoords, setOriginCoords] = useState<[number, number]>([18.5204, 73.8567]);
  const [destCoords, setDestCoords] = useState<[number, number]>([19.0657, 72.8687]);
  const [tripDistanceKm, setTripDistanceKm] = useState<number>(148);

  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('tata-nexon-ev');
  const [startSocPercentage, setStartSocPercentage] = useState<number>(45);
  const [drivingMode, setDrivingMode] = useState<'eco' | 'normal' | 'sport'>('normal');
  const [acEnabled, setAcEnabled] = useState<boolean>(true);

  const [bookingModalCharger, setBookingModalCharger] = useState<ChargerListing | null>(null);

  // Map refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routeLayerGroupRef = useRef<L.LayerGroup | null>(null);

  // Vehicle profile
  const vehicle = useMemo(() => {
    return VEHICLE_PROFILES.find(v => v.id === selectedVehicleId) || VEHICLE_PROFILES[0];
  }, [selectedVehicleId]);

  // Preset selection handler
  const handleSelectPreset = (preset: RoutePreset) => {
    setSelectedPresetId(preset.id);
    setOriginInput(preset.origin);
    setDestInput(preset.destination);
    setOriginCoords(preset.originCoords);
    setDestCoords(preset.destCoords);
    setTripDistanceKm(preset.distanceKm);
  };

  // Prediction calculations
  const prediction = useMemo(() => {
    // Mode multiplier
    const modeMultiplier = drivingMode === 'eco' ? 0.88 : drivingMode === 'sport' ? 1.22 : 1.0;
    // AC penalty
    const acMultiplier = acEnabled ? 1.08 : 1.0;

    const effectiveWhPerKm = vehicle.realWorldWhPerKm * modeMultiplier * acMultiplier;
    const totalUsableKwh = vehicle.batteryCapacityKwh * 0.95; // 5% reserve margin
    const fullRangeKm = (totalUsableKwh * 1000) / effectiveWhPerKm;
    const initialUsableRangeKm = fullRangeKm * (startSocPercentage / 100);

    // Will discharge before destination?
    const willDischarge = initialUsableRangeKm < tripDistanceKm;
    const dischargeDistanceKm = Math.min(tripDistanceKm, Math.round(initialUsableRangeKm));
    const criticalThresholdKm = Math.max(10, Math.round(initialUsableRangeKm - fullRangeKm * 0.15));

    // Recommend optimal charging stop
    // Ideally find an EVIO hub or fast charger situated between 40% and 75% of route distance
    const optimalStopTargetKm = Math.min(tripDistanceKm * 0.55, Math.max(25, criticalThresholdKm - 10));

    // Find nearby charger candidates
    // Ratio along the straight line from origin to dest
    const stopRatio = optimalStopTargetKm / tripDistanceKm;
    const estimatedStopLat = originCoords[0] + (destCoords[0] - originCoords[0]) * stopRatio;
    const estimatedStopLng = originCoords[1] + (destCoords[1] - originCoords[1]) * stopRatio;

    // Pick best charger from registered listings
    let bestCharger = chargers.find(c => !c.isPublicStation && c.powerKw >= 22) || chargers[0];
    
    // Fallback if none found
    if (!bestCharger) {
      bestCharger = {
        id: 'rec-expressway-hub',
        hostId: 'hub-expressway',
        hostName: 'EVIO Expressway SuperHub',
        hostAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        hostRating: 4.9,
        hostReviewsCount: 88,
        title: 'Lonavala Expressway SuperHub 60kW DC',
        description: 'Dedicated high-speed community charging bay on Mumbai-Pune corridor with automated boom barrier & lounge.',
        photos: ['https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800'],
        approxAddress: 'Mumbai-Pune Expressway, Khalapur Food Mall Bay',
        exactAddress: 'Km 68, Mumbai-Pune Expressway, Maharashtra',
        lat: estimatedStopLat,
        lng: estimatedStopLng,
        powerKw: 60,
        powerTier: 'rapid',
        connectorTypes: ['CCS-2', 'Type 2'],
        cableLengthMeters: 7.5,
        simultaneousSlots: 4,
        pricingType: 'per-kwh',
        priceRate: 21.00,
        safetyCertificateName: 'Highway_SuperHub_Inspection.pdf',
        safetyCertificateVerified: true,
        schedule: { is247: true, days: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], hours: '24/7' },
        amenities: ['24/7 Food Mall', 'Clean Restrooms', 'Cafe Coffee Day', 'High-Speed WiFi'],
        accessNotes: 'Direct expressway slip road access, food mall parking bay.',
        bookingMode: 'instant',
        maxDurationHours: 2,
        status: 'available',
        listingStatus: 'live',
        createdAt: '2026-10-01',
        locationType: 'hub',
        isPublicStation: false
      };
    }

    // Stop distance along the trip
    const stopDistanceKm = Math.round(optimalStopTargetKm);
    const arrivalSocAtStop = Math.max(6, Math.round(startSocPercentage - (stopDistanceKm / fullRangeKm) * 100));
    const targetDepartureSoc = 80; // Optimal fast-charge curve cutoff
    const socBoost = targetDepartureSoc - arrivalSocAtStop;
    const kwhToCharge = Math.max(4, Math.round(vehicle.batteryCapacityKwh * (socBoost / 100) * 10) / 10);
    
    // Effective charge speed
    const effectiveChargingKw = Math.min(bestCharger.powerKw, vehicle.maxDcChargeKw);
    const chargingTimeMinutes = Math.round((kwhToCharge / effectiveChargingKw) * 60) + 5; // +5 mins plug/handshake buffer
    const chargingCost = Math.round(kwhToCharge * (bestCharger.priceRate || 19));

    // Distance from stop to destination
    const remainingDistanceKm = tripDistanceKm - stopDistanceKm;
    const finalArrivalSoc = Math.max(12, Math.round(targetDepartureSoc - (remainingDistanceKm / fullRangeKm) * 100));

    // Travel time
    const averageDrivingSpeedKmh = 68;
    const drivingTimeMinutes = Math.round((tripDistanceKm / averageDrivingSpeedKmh) * 60);
    const totalTripTimeMinutes = drivingTimeMinutes + (willDischarge ? chargingTimeMinutes : 0);

    return {
      fullRangeKm: Math.round(fullRangeKm),
      initialUsableRangeKm: Math.round(initialUsableRangeKm),
      effectiveWhPerKm: Math.round(effectiveWhPerKm),
      willDischarge,
      dischargeDistanceKm,
      criticalThresholdKm,
      stopDistanceKm,
      bestCharger,
      arrivalSocAtStop,
      targetDepartureSoc,
      kwhToCharge,
      chargingTimeMinutes,
      chargingCost,
      finalArrivalSoc,
      drivingTimeMinutes,
      totalTripTimeMinutes,
      estimatedStopCoords: [estimatedStopLat, estimatedStopLng] as [number, number]
    };
  }, [vehicle, drivingMode, acEnabled, startSocPercentage, tripDistanceKm, originCoords, destCoords, chargers]);

  // Leaflet Map Initialization and Route Rendering
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [
          (originCoords[0] + destCoords[0]) / 2,
          (originCoords[1] + destCoords[1]) / 2
        ],
        zoom: 9,
        zoomControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);
      routeLayerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const layerGroup = routeLayerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    // 1. Waypoints
    const startPoint = L.latLng(originCoords[0], originCoords[1]);
    const endPoint = L.latLng(destCoords[0], destCoords[1]);
    const stopPoint = L.latLng(prediction.estimatedStopCoords[0], prediction.estimatedStopCoords[1]);

    // Critical discharge point (interpolated along vector if willDischarge)
    const dischargeRatio = prediction.dischargeDistanceKm / tripDistanceKm;
    const dischargeLat = originCoords[0] + (destCoords[0] - originCoords[0]) * dischargeRatio;
    const dischargeLng = originCoords[1] + (destCoords[1] - originCoords[1]) * dischargeRatio;
    const dischargePoint = L.latLng(dischargeLat, dischargeLng);

    // Custom Origin Icon (Green Pin)
    const originIcon = L.divIcon({
      className: 'custom-route-icon',
      html: `
        <div style="background-color: #16A34A; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
          A
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });

    // Custom Destination Icon (Sky Blue Pin)
    const destIcon = L.divIcon({
      className: 'custom-route-icon',
      html: `
        <div style="background-color: #0284C7; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
          B
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });

    // Charging Stop Icon (Zap Yellow/Green)
    const chargeStopIcon = L.divIcon({
      className: 'custom-route-icon',
      html: `
        <div style="background-color: #F59E0B; color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 3px solid white; box-shadow: 0 0 15px rgba(245, 158, 11, 0.7); animation: pulse 2s infinite;">
          ⚡
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    // Critical Discharge Warning Icon (Red Skull/Exclamation)
    const criticalIcon = L.divIcon({
      className: 'custom-route-icon',
      html: `
        <div style="background-color: #DC2626; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 0 12px rgba(220, 38, 38, 0.8);">
          !
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    // Markers
    L.marker(startPoint, { icon: originIcon })
      .bindPopup(`<strong>Trip Origin:</strong><br/>${originInput}<br/>Initial Battery: ${startSocPercentage}%`)
      .addTo(layerGroup);

    L.marker(endPoint, { icon: destIcon })
      .bindPopup(`<strong>Destination:</strong><br/>${destInput}<br/>Est. Arrival SoC: ${prediction.willDischarge ? prediction.finalArrivalSoc : Math.round(startSocPercentage - (tripDistanceKm / prediction.fullRangeKm) * 100)}%`)
      .addTo(layerGroup);

    if (prediction.willDischarge) {
      // Add Charging stop
      L.marker(stopPoint, { icon: chargeStopIcon })
        .bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px;">
            <strong style="color: #0284C7;">Recommended Charging Stop</strong><br/>
            <strong>${prediction.bestCharger.title}</strong><br/>
            Arrive: <strong>${prediction.arrivalSocAtStop}% SoC</strong><br/>
            Charge to: <strong>80% (+${prediction.kwhToCharge} kWh)</strong><br/>
            Duration: <strong>${prediction.chargingTimeMinutes} mins</strong> (~${formatCurrency(prediction.chargingCost)})
          </div>
        `)
        .addTo(layerGroup);

      // Add Critical point marker
      L.marker(dischargePoint, { icon: criticalIcon })
        .bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; color: #DC2626;">
            <strong>Warning: Discharge Zone</strong><br/>
            Battery hits 0% without stop at Km ${prediction.dischargeDistanceKm}.
          </div>
        `)
        .addTo(layerGroup);

      // Route lines: Origin -> Stop (Sky blue) -> Destination (Emerald green)
      L.polyline([startPoint, stopPoint], {
        color: '#0284C7',
        weight: 5,
        opacity: 0.9,
      }).addTo(layerGroup);

      L.polyline([stopPoint, endPoint], {
        color: '#16A34A',
        weight: 5,
        opacity: 0.9,
      }).addTo(layerGroup);
    } else {
      // Direct safe line
      L.polyline([startPoint, endPoint], {
        color: '#16A34A',
        weight: 5,
        opacity: 0.9,
      }).addTo(layerGroup);
    }

    // Fit map bounds
    const bounds = L.latLngBounds([startPoint, endPoint]);
    if (prediction.willDischarge) {
      bounds.extend(stopPoint);
      bounds.extend(dischargePoint);
    }
    map.fitBounds(bounds, { padding: [50, 50] });

  }, [originCoords, destCoords, prediction, originInput, destInput, startSocPercentage, tripDistanceKm, formatCurrency]);

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Banner */}
      <div className="bg-white border border-[#BAE6FD] rounded-card p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7] animate-pulse"></span>
              <span className="text-xs font-mono font-bold text-[#0284C7] uppercase tracking-wider">
                EV Journey Prediction & Energy Planner
              </span>
            </div>
            <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
              Route Simulation & Discharge Warning Engine
            </h1>
            <p className="text-xs text-[#64748B] mt-1 font-sans">
              Enter your trip details to simulate battery consumption km-by-km, pinpoint where discharge will occur, and receive automated charging hub recommendations.
            </p>
          </div>

          {/* Quick Route Corridor Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono font-bold text-[#64748B] hidden sm:inline">Presets:</span>
            {ROUTE_PRESETS.map(p => (
              <button
                key={p.id}
                onClick={() => handleSelectPreset(p)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border ${
                  selectedPresetId === p.id 
                    ? 'bg-[#0284C7] text-white border-[#0284C7] shadow-sm' 
                    : 'bg-[#F8FAFC] text-[#475569] border-[#CBD5E1] hover:bg-[#F0F9FF] hover:border-[#BAE6FD]'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Controls (Left) & Results/Map (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Trip Configuration Controls */}
        <div className="lg:col-span-4 space-y-5">
          
          <div className="bg-white border border-[#BAE6FD] rounded-card p-5 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-[#0F172A] font-mono flex items-center gap-2 pb-2 border-b border-[#E2E8F0]">
              <Compass className="w-4 h-4 text-[#0284C7]" />
              <span>1. Trip Waypoints</span>
            </h3>

            {/* Origin Input */}
            <div>
              <label className="block text-xs font-mono font-bold text-[#475569] mb-1 flex items-center justify-between">
                <span>STARTING POINT (ORIGIN)</span>
                <button
                  type="button"
                  onClick={() => {
                    setOriginCoords(userCoords);
                    setOriginInput('Current GPS Coordinates');
                  }}
                  className="text-[10px] text-[#0284C7] hover:underline flex items-center gap-1 font-normal"
                >
                  <MapPin className="w-3 h-3" />
                  Use My GPS
                </button>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={originInput}
                  onChange={e => setOriginInput(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0284C7] font-mono text-[#0F172A]"
                  placeholder="e.g. Pune City Center"
                />
                <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] absolute left-3 top-3"></span>
              </div>
            </div>

            {/* Destination Input */}
            <div>
              <label className="block text-xs font-mono font-bold text-[#475569] mb-1">
                DESTINATION
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={destInput}
                  onChange={e => setDestInput(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0284C7] font-mono text-[#0F172A]"
                  placeholder="e.g. Mumbai BKC"
                />
                <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7] absolute left-3 top-3"></span>
              </div>
            </div>

            {/* Distance Slider / Input */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-1">
                <span className="font-bold text-[#475569]">TRIP DISTANCE</span>
                <span className="font-bold text-[#0284C7]">{tripDistanceKm} km</span>
              </div>
              <input
                type="range"
                min={20}
                max={400}
                step={5}
                value={tripDistanceKm}
                onChange={e => setTripDistanceKm(Number(e.target.value))}
                className="w-full accent-[#0284C7] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#94A3B8]">
                <span>20 km</span>
                <span>200 km</span>
                <span>400 km</span>
              </div>
            </div>
          </div>

          {/* Vehicle & Energy Settings */}
          <div className="bg-white border border-[#BAE6FD] rounded-card p-5 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-[#0F172A] font-mono flex items-center gap-2 pb-2 border-b border-[#E2E8F0]">
              <Car className="w-4 h-4 text-[#0284C7]" />
              <span>2. Vehicle & Battery State</span>
            </h3>

            {/* Vehicle Model Selector */}
            <div>
              <label className="block text-xs font-mono font-bold text-[#475569] mb-1">
                EV MODEL & SPECIFICATION
              </label>
              <select
                value={selectedVehicleId}
                onChange={e => setSelectedVehicleId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0284C7] font-mono text-[#0F172A]"
              >
                {VEHICLE_PROFILES.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.name} • {v.claimedRangeKm} km
                  </option>
                ))}
              </select>
            </div>

            {/* Current Battery SoC % Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-1">
                <span className="font-bold text-[#475569]">CURRENT BATTERY (SoC)</span>
                <span className={`font-bold px-2 py-0.5 rounded ${
                  startSocPercentage <= 20 
                    ? 'bg-[#FEE2E2] text-[#DC2626]' 
                    : startSocPercentage <= 50 
                    ? 'bg-[#FEF3C7] text-[#D97706]' 
                    : 'bg-[#DCFCE7] text-[#16A34A]'
                }`}>
                  {startSocPercentage}%
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                step={5}
                value={startSocPercentage}
                onChange={e => setStartSocPercentage(Number(e.target.value))}
                className="w-full accent-[#0284C7] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#94A3B8]">
                <span>10% (Low)</span>
                <span>50%</span>
                <span>100% (Full)</span>
              </div>
            </div>

            {/* Driving Mode Buttons */}
            <div>
              <label className="block text-xs font-mono font-bold text-[#475569] mb-1.5">
                DRIVING DYNAMICS MODE
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs font-mono font-bold">
                <button
                  type="button"
                  onClick={() => setDrivingMode('eco')}
                  className={`py-2 rounded-xl border text-center transition-all ${
                    drivingMode === 'eco' 
                      ? 'bg-[#DCFCE7] border-[#86EFAC] text-[#16A34A]' 
                      : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#64748B] hover:bg-white'
                  }`}
                >
                  <div>ECO</div>
                  <div className="text-[10px] font-normal">+12% Range</div>
                </button>
                <button
                  type="button"
                  onClick={() => setDrivingMode('normal')}
                  className={`py-2 rounded-xl border text-center transition-all ${
                    drivingMode === 'normal' 
                      ? 'bg-[#E0F2FE] border-[#BAE6FD] text-[#0284C7]' 
                      : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#64748B] hover:bg-white'
                  }`}
                >
                  <div>NORMAL</div>
                  <div className="text-[10px] font-normal">Standard</div>
                </button>
                <button
                  type="button"
                  onClick={() => setDrivingMode('sport')}
                  className={`py-2 rounded-xl border text-center transition-all ${
                    drivingMode === 'sport' 
                      ? 'bg-[#FEE2E2] border-[#FECDD3] text-[#DC2626]' 
                      : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#64748B] hover:bg-white'
                  }`}
                >
                  <div>SPORT</div>
                  <div className="text-[10px] font-normal">-22% Range</div>
                </button>
              </div>
            </div>

            {/* Air Conditioning Toggle */}
            <div className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
              <div>
                <span className="text-xs font-mono font-bold text-[#0F172A] block">Cabin Climate Control (AC)</span>
                <span className="text-[10px] text-[#64748B] font-mono">Consumes ~8% auxiliary energy</span>
              </div>
              <button
                type="button"
                onClick={() => setAcEnabled(!acEnabled)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${acEnabled ? 'bg-[#0284C7]' : 'bg-[#CBD5E1]'}`}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${acEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Range summary preview */}
            <div className="p-3 bg-[#F0F9FF] border border-[#BAE6FD] rounded-xl text-xs font-mono space-y-1">
              <div className="flex justify-between text-[#64748B]">
                <span>Est. Consumption:</span>
                <span className="font-bold text-[#0F172A]">{prediction.effectiveWhPerKm} Wh/km</span>
              </div>
              <div className="flex justify-between text-[#64748B]">
                <span>Available Energy:</span>
                <span className="font-bold text-[#0284C7]">{Math.round((vehicle.batteryCapacityKwh * (startSocPercentage / 100)) * 10) / 10} kWh</span>
              </div>
              <div className="flex justify-between text-[#64748B]">
                <span>Current Usable Range:</span>
                <span className="font-bold text-[#0284C7]">{prediction.initialUsableRangeKm} km</span>
              </div>
            </div>

          </div>

        </div>

        {/* Right Column: Prediction Results, Leaflet Map & Stop Recommendation */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* Discharge Alert or Safe Journey Banner */}
          {prediction.willDischarge ? (
            <div className="bg-[#FFF1F2] border-2 border-[#FDA4AF] rounded-card p-5 text-[#9F1239] shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FFE4E6] border border-[#FECDD3] flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-[#E11D48] animate-bounce" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#FEE2E2] text-[#E11D48]">
                    Critical Discharge Alert
                  </span>
                  <span className="text-xs font-mono text-[#9F1239]">
                    Vehicle stops at <strong>Km {prediction.dischargeDistanceKm}</strong>
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#881337] mt-1">
                  Battery will deplete {tripDistanceKm - prediction.dischargeDistanceKm} km before reaching destination
                </h3>
                <p className="text-xs text-[#9F1239] mt-0.5 font-sans">
                  With your current <strong>{startSocPercentage}% SoC</strong> and <strong>{prediction.initialUsableRangeKm} km</strong> range, charging is mandatory. An automated high-speed stop has been planned below at Km {prediction.stopDistanceKm}.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-[#F0FDF4] border-2 border-[#86EFAC] rounded-card p-5 text-[#14532D] shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#DCFCE7] border border-[#86EFAC] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6 text-[#16A34A]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#DCFCE7] text-[#16A34A]">
                    Safe Continuous Journey
                  </span>
                  <span className="text-xs font-mono text-[#166534]">
                    Estimated Arrival: <strong>{prediction.finalArrivalSoc}% SoC</strong>
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#14532D] mt-1">
                  Sufficient battery reserve to reach destination without interruption
                </h3>
                <p className="text-xs text-[#166534] mt-0.5 font-sans">
                  Your vehicle can complete the {tripDistanceKm} km journey directly. You will arrive with a comfortable buffer of approximately {prediction.finalArrivalSoc}% battery.
                </p>
              </div>
            </div>
          )}

          {/* Interactive Leaflet Route Map */}
          <div className="bg-white border border-[#BAE6FD] rounded-card overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3 bg-[#F8FAFC]">
              <div>
                <h3 className="text-xs font-bold text-[#0F172A] font-mono flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-[#0284C7]" />
                  <span>Interactive Route & Charging Corridor Map</span>
                </h3>
                <span className="text-[11px] text-[#64748B] font-mono">
                  {originInput} ➔ {destInput} ({tripDistanceKm} km)
                </span>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-3 text-[11px] font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A]"></span>
                  <span>Origin</span>
                </div>
                {prediction.willDischarge && (
                  <>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]"></span>
                      <span>EVIO SuperHub</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]"></span>
                      <span>Discharge Point</span>
                    </div>
                  </>
                )}
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7]"></span>
                  <span>Destination</span>
                </div>
              </div>
            </div>

            {/* Map Canvas */}
            <div ref={mapContainerRef} className="w-full h-80 z-0 bg-[#E0F2FE]/30" />
          </div>

          {/* Recommended Charging Stop Action Card (if discharge predicted) */}
          {prediction.willDischarge && (
            <div className="bg-white border-2 border-[#0284C7] rounded-card p-5 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#E0F2FE] text-[#0284C7] font-mono font-bold text-[10px] border border-[#BAE6FD]">
                      RECOMMENDED STOP • KM {prediction.stopDistanceKm}
                    </span>
                    <span className="text-xs font-mono font-bold text-[#16A34A] flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" />
                      {prediction.bestCharger.powerKw} kW Fast Bay
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#0F172A] mt-1 font-mono">
                    {prediction.bestCharger.title}
                  </h3>
                  <p className="text-xs text-[#64748B] font-mono mt-0.5">
                    {prediction.bestCharger.approxAddress}
                  </p>
                </div>

                {/* 1-Click Book Slot Button */}
                <button
                  type="button"
                  onClick={() => setBookingModalCharger(prediction.bestCharger)}
                  className="px-4 py-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 shrink-0"
                >
                  <Calendar className="w-4 h-4" />
                  <span>BOOK CHARGING SLOT</span>
                </button>
              </div>

              {/* Charging Stop Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 font-mono text-center">
                <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                  <span className="text-[10px] text-[#64748B] uppercase block">Arrival Battery</span>
                  <span className="text-lg font-bold text-[#D97706]">{prediction.arrivalSocAtStop}% SoC</span>
                  <span className="text-[10px] text-[#94A3B8] block">Safe reserve</span>
                </div>
                <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                  <span className="text-[10px] text-[#64748B] uppercase block">Charge Needed</span>
                  <span className="text-lg font-bold text-[#0284C7]">+{prediction.kwhToCharge} kWh</span>
                  <span className="text-[10px] text-[#94A3B8] block">Charges to 80%</span>
                </div>
                <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                  <span className="text-[10px] text-[#64748B] uppercase block">Dwell Time</span>
                  <span className="text-lg font-bold text-[#0F172A]">{prediction.chargingTimeMinutes} mins</span>
                  <span className="text-[10px] text-[#94A3B8] block">Fast DC Ramp</span>
                </div>
                <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                  <span className="text-[10px] text-[#64748B] uppercase block">Est. Energy Cost</span>
                  <span className="text-lg font-bold text-[#16A34A]">{formatCurrency(prediction.chargingCost)}</span>
                  <span className="text-[10px] text-[#94A3B8] block">At standard rate</span>
                </div>
              </div>
            </div>
          )}

          {/* Battery Discharge Curve & Journey Timeline */}
          <div className="bg-white border border-[#BAE6FD] rounded-card p-5 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-[#0F172A] font-mono flex items-center justify-between">
              <span className="flex items-center gap-2">
                <BatteryCharging className="w-4 h-4 text-[#0284C7]" />
                <span>Simulated Battery Degradation (SoC vs Distance)</span>
              </span>
              <span className="text-xs text-[#64748B] font-normal">
                Total Trip Duration: <strong className="text-[#0F172A]">{Math.floor(prediction.totalTripTimeMinutes / 60)}h {prediction.totalTripTimeMinutes % 60}m</strong>
              </span>
            </h3>

            {/* SVG SoC Telemetry Graph */}
            <div className="w-full h-44 pt-2">
              <svg viewBox="0 0 600 160" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="safeSocGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0284C7" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#0284C7" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Critical 15% threshold dashed line */}
                <line x1="0" y1="135" x2="600" y2="135" stroke="#FECDD3" strokeDasharray="3,3" strokeWidth="1.5" />
                <text x="5" y="130" fill="#DC2626" fontSize="9" fontFamily="monospace">15% Critical Reserve Threshold</text>

                {/* 50% line */}
                <line x1="0" y1="80" x2="600" y2="80" stroke="#E2E8F0" strokeDasharray="3,3" />
                
                {prediction.willDischarge ? (
                  <>
                    {/* Uncharged failure trajectory (Red dashed curve plunging to 0%) */}
                    <line 
                      x1="0" 
                      y1={160 - (startSocPercentage * 1.4)} 
                      x2={(prediction.dischargeDistanceKm / tripDistanceKm) * 600} 
                      y2="155" 
                      stroke="#FDA4AF" 
                      strokeDasharray="4,4" 
                      strokeWidth="2" 
                    />

                    {/* Optimized Charging Stop Path: 
                        1. Start to Stop: (0, startY) to (stopX, arrivalY)
                        2. Rapid Charging Step: (stopX, arrivalY) to (stopX, 80% Y)
                        3. Stop to Destination: (stopX, 80% Y) to (600, finalArrivalY)
                    */}
                    {(() => {
                      const stopX = (prediction.stopDistanceKm / tripDistanceKm) * 600;
                      const startY = 160 - (startSocPercentage * 1.4);
                      const arrivalY = 160 - (prediction.arrivalSocAtStop * 1.4);
                      const boostedY = 160 - (prediction.targetDepartureSoc * 1.4);
                      const finalY = 160 - (prediction.finalArrivalSoc * 1.4);

                      return (
                        <>
                          {/* Shaded Area */}
                          <polygon
                            points={`0,160 0,${startY} ${stopX},${arrivalY} ${stopX},${boostedY} 600,${finalY} 600,160`}
                            fill="url(#safeSocGradient)"
                          />

                          {/* Polyline */}
                          <polyline
                            fill="none"
                            stroke="#0284C7"
                            strokeWidth="3"
                            points={`0,${startY} ${stopX},${arrivalY} ${stopX},${boostedY} 600,${finalY}`}
                          />

                          {/* Stop Node */}
                          <circle cx={stopX} cy={arrivalY} r="5" fill="#FFFFFF" stroke="#D97706" strokeWidth="3" />
                          <circle cx={stopX} cy={boostedY} r="5" fill="#FFFFFF" stroke="#16A34A" strokeWidth="3" />

                          {/* Node label */}
                          <text x={stopX + 8} y={boostedY + 12} fill="#0284C7" fontSize="10" fontFamily="monospace" fontWeight="bold">
                            +⚡ Stop (80%)
                          </text>
                        </>
                      );
                    })()}
                  </>
                ) : (
                  <>
                    {/* Direct safe curve */}
                    {(() => {
                      const startY = 160 - (startSocPercentage * 1.4);
                      const finalY = 160 - (prediction.finalArrivalSoc * 1.4);

                      return (
                        <>
                          <polygon
                            points={`0,160 0,${startY} 600,${finalY} 600,160`}
                            fill="url(#safeSocGradient)"
                          />
                          <polyline
                            fill="none"
                            stroke="#16A34A"
                            strokeWidth="3"
                            points={`0,${startY} 600,${finalY}`}
                          />
                        </>
                      );
                    })()}
                  </>
                )}

                {/* X Axis milestones */}
                <circle cx="0" cy={160 - (startSocPercentage * 1.4)} r="4" fill="#16A34A" />
                <circle cx="600" cy={160 - (prediction.finalArrivalSoc * 1.4)} r="4" fill="#0284C7" />
              </svg>

              {/* X Axis distance marks */}
              <div className="flex justify-between text-[10px] font-mono text-[#64748B] pt-2 px-1">
                <span>0 km (Start: {startSocPercentage}%)</span>
                {prediction.willDischarge && (
                  <span className="text-[#0284C7] font-bold">Km {prediction.stopDistanceKm} (Charge)</span>
                )}
                <span>{tripDistanceKm} km (Arrive: {prediction.finalArrivalSoc}%)</span>
              </div>
            </div>

            {/* Turn-by-Turn Journey Milestones */}
            <div className="border-t border-[#E2E8F0] pt-4 space-y-3 font-mono text-xs">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center font-bold text-[11px] shrink-0">
                  1
                </span>
                <div className="flex-1">
                  <strong>Depart {originInput}</strong> with <span className="text-[#16A34A] font-bold">{startSocPercentage}% battery</span>.
                </div>
                <span className="text-[#94A3B8]">0 km</span>
              </div>

              {prediction.willDischarge && (
                <div className="flex items-center gap-3 bg-[#F0F9FF] p-2.5 rounded-xl border border-[#BAE6FD]">
                  <span className="w-6 h-6 rounded-full bg-[#0284C7] text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                    2
                  </span>
                  <div className="flex-1">
                    <strong>Stop & Fast Charge:</strong> {prediction.bestCharger.title}. Plug in at <strong>{prediction.arrivalSocAtStop}%</strong>, charge for <strong>{prediction.chargingTimeMinutes} mins</strong> up to <strong>80%</strong>.
                  </div>
                  <span className="text-[#0284C7] font-bold">Km {prediction.stopDistanceKm}</span>
                </div>
              )}

              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center font-bold text-[11px] shrink-0">
                  {prediction.willDischarge ? '3' : '2'}
                </span>
                <div className="flex-1">
                  <strong>Arrive at {destInput}</strong> with a safe reserve of <strong className="text-[#0284C7]">{prediction.finalArrivalSoc}% battery</strong>.
                </div>
                <span className="text-[#94A3B8]">{tripDistanceKm} km</span>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Booking Modal (if user clicks "Book Charging Slot" on recommended station) */}
      {bookingModalCharger && (
        <ChargerDetailModal
          charger={bookingModalCharger}
          onClose={() => setBookingModalCharger(null)}
          onBookingSuccess={() => {
            setBookingModalCharger(null);
          }}
        />
      )}

    </div>
  );
};
