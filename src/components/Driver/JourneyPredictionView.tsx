import React, { useState, useMemo, useEffect, useRef } from 'react';
import L from 'leaflet';
import { 
  Navigation, 
  MapPin, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  Car, 
  BatteryCharging, 
  Compass, 
  Calendar,
  Search,
  Loader2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ChargerListing } from '../../types';
import { ChargerDetailModal } from './ChargerDetailModal';

// Fast dictionary for immediate local geocoding
const KNOWN_LOCATIONS: { [key: string]: [number, number] } = {
  'pune': [18.5204, 73.8567],
  'pune city': [18.5204, 73.8567],
  'pune station': [18.5284, 73.8744],
  'shivajinagar': [18.5312, 73.8445],
  'kothrud': [18.5089, 73.8336],
  'wakad': [18.5987, 73.7663],
  'hinjawadi': [18.5987, 73.7663],
  'viman nagar': [18.5679, 73.9143],
  'swargate': [18.4960, 73.8520],
  'mumbai': [19.0760, 72.8777],
  'mumbai bkc': [19.0657, 72.8687],
  'bkc': [19.0657, 72.8687],
  'bandra': [19.0596, 72.8295],
  'thane': [19.2183, 72.9781],
  'navi mumbai': [19.0330, 73.0297],
  'vashi': [19.0771, 72.9986],
  'lonavala': [18.7557, 73.4091],
  'khandala': [18.7617, 73.3768],
  'nashik': [19.9975, 73.7898],
  'shirdi': [19.7645, 74.4762],
  'kolhapur': [16.7050, 74.2433],
  'satara': [17.6805, 74.0183],
  'solapur': [17.6599, 75.9064],
  'aurangabad': [19.8762, 75.3433],
  'nagpur': [21.1458, 79.0882],
  'goa': [15.2993, 74.1240],
  'panaji': [15.4909, 73.8278],
  'bengaluru': [12.9716, 77.5946],
  'bangalore': [12.9716, 77.5946],
  'mysuru': [12.2958, 76.6394],
  'mysore': [12.2958, 76.6394],
  'hyderabad': [17.3850, 78.4867],
  'chennai': [13.0827, 80.2707],
  'delhi': [28.6139, 77.2090],
  'new delhi': [28.6139, 77.2090],
  'noida': [28.5355, 77.3910],
  'gurgaon': [28.4595, 77.0266],
  'gurugram': [28.4595, 77.0266],
  'agra': [27.1767, 78.0081],
  'jaipur': [26.9124, 75.7873],
  'ahmedabad': [23.0225, 72.5714],
  'surat': [21.1702, 72.8311]
};

// Geocode query helper
async function geocodeLocation(query: string, fallbackCoords: [number, number]): Promise<[number, number]> {
  const qClean = query.trim().toLowerCase();
  if (!qClean) return fallbackCoords;

  if (KNOWN_LOCATIONS[qClean]) {
    return KNOWN_LOCATIONS[qClean];
  }

  for (const [key, coords] of Object.entries(KNOWN_LOCATIONS)) {
    if (qClean.includes(key) || key.includes(qClean)) {
      return coords;
    }
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      }
    }
  } catch (e) {
    console.warn('Nominatim geocode fallback:', e);
  }

  return fallbackCoords;
}

// Haversine road distance helper (km)
function calculateRoadDistanceKm(c1: [number, number], c2: [number, number]): number {
  const R = 6371;
  const dLat = (c2[0] - c1[0]) * Math.PI / 180;
  const dLon = (c2[1] - c1[1]) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(c1[0] * Math.PI / 180) * Math.cos(c2[0] * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightLine = R * c;
  return Math.max(15, Math.round(straightLine * 1.25));
}

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

  const [originInput, setOriginInput] = useState<string>('Pune');
  const [destInput, setDestInput] = useState<string>('Mumbai');
  const [originCoords, setOriginCoords] = useState<[number, number]>([18.5204, 73.8567]);
  const [destCoords, setDestCoords] = useState<[number, number]>([19.0760, 72.8777]);
  const [tripDistanceKm, setTripDistanceKm] = useState<number>(148);
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);

  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('tata-nexon-ev');
  const [startSocPercentage, setStartSocPercentage] = useState<number>(45);
  const [drivingMode, setDrivingMode] = useState<'eco' | 'normal' | 'sport'>('normal');
  const [acEnabled, setAcEnabled] = useState<boolean>(true);

  const [bookingModalCharger, setBookingModalCharger] = useState<ChargerListing | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routeLayerGroupRef = useRef<L.LayerGroup | null>(null);

  const vehicle = useMemo(() => {
    return VEHICLE_PROFILES.find(v => v.id === selectedVehicleId) || VEHICLE_PROFILES[0];
  }, [selectedVehicleId]);

  const handlePlanRoute = async (customOrigin?: string, customDest?: string) => {
    const oQuery = customOrigin !== undefined ? customOrigin : originInput;
    const dQuery = customDest !== undefined ? customDest : destInput;

    setIsGeocoding(true);
    try {
      const oCoords = await geocodeLocation(oQuery, originCoords);
      const dCoords = await geocodeLocation(dQuery, destCoords);
      const dist = calculateRoadDistanceKm(oCoords, dCoords);

      setOriginCoords(oCoords);
      setDestCoords(dCoords);
      setTripDistanceKm(dist);
    } finally {
      setIsGeocoding(false);
    }
  };

  const prediction = useMemo(() => {
    const modeMultiplier = drivingMode === 'eco' ? 0.88 : drivingMode === 'sport' ? 1.22 : 1.0;
    const acMultiplier = acEnabled ? 1.08 : 1.0;

    const effectiveWhPerKm = vehicle.realWorldWhPerKm * modeMultiplier * acMultiplier;
    const totalUsableKwh = vehicle.batteryCapacityKwh * 0.95;
    const fullRangeKm = (totalUsableKwh * 1000) / effectiveWhPerKm;
    const initialUsableRangeKm = fullRangeKm * (startSocPercentage / 100);

    const willDischarge = initialUsableRangeKm < tripDistanceKm;
    const dischargeDistanceKm = Math.min(tripDistanceKm, Math.round(initialUsableRangeKm));
    const criticalThresholdKm = Math.max(10, Math.round(initialUsableRangeKm - fullRangeKm * 0.15));

    const optimalStopTargetKm = Math.min(tripDistanceKm * 0.55, Math.max(25, criticalThresholdKm - 10));

    const stopRatio = optimalStopTargetKm / tripDistanceKm;
    const estimatedStopLat = originCoords[0] + (destCoords[0] - originCoords[0]) * stopRatio;
    const estimatedStopLng = originCoords[1] + (destCoords[1] - originCoords[1]) * stopRatio;

    let bestCharger = chargers.find(c => {
      const d = Math.sqrt(Math.pow((c.lat - estimatedStopLat) * 111, 2) + Math.pow((c.lng - estimatedStopLng) * 111, 2));
      return d <= 30 && c.powerKw >= 22;
    }) || chargers[0];
    
    if (!bestCharger) {
      bestCharger = {
        id: 'rec-highway-hub',
        hostId: 'hub-expressway',
        hostName: 'EVIO SuperHub',
        hostAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        hostRating: 4.9,
        hostReviewsCount: 88,
        title: 'Corridor Fast SuperHub 60kW DC',
        description: 'Dedicated high-speed community charging bay along corridor with automated bay access.',
        photos: ['https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800'],
        approxAddress: `Highway Corridor Bay (Km ${Math.round(optimalStopTargetKm)})`,
        exactAddress: `Km ${Math.round(optimalStopTargetKm)}, Corridor Highway Service Bay`,
        lat: estimatedStopLat,
        lng: estimatedStopLng,
        powerKw: 60,
        powerTier: 'rapid',
        connectorTypes: ['CCS-2', 'Type 2'],
        cableLengthMeters: 7.5,
        simultaneousSlots: 4,
        pricingType: 'per-kwh',
        priceRate: 21.00,
        safetyCertificateName: 'Highway_Inspection.pdf',
        safetyCertificateVerified: true,
        schedule: { is247: true, days: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], hours: '24/7' },
        amenities: ['Food Court', 'Washrooms', 'WiFi'],
        accessNotes: 'Direct slip road entry.',
        bookingMode: 'instant',
        maxDurationHours: 2,
        status: 'available',
        listingStatus: 'live',
        createdAt: '2026-10-01',
        locationType: 'hub',
        isPublicStation: false
      };
    }

    const stopDistanceKm = Math.round(optimalStopTargetKm);
    const arrivalSocAtStop = Math.max(6, Math.round(startSocPercentage - (stopDistanceKm / fullRangeKm) * 100));
    const targetDepartureSoc = 80;
    const socBoost = targetDepartureSoc - arrivalSocAtStop;
    const kwhToCharge = Math.max(4, Math.round(vehicle.batteryCapacityKwh * (socBoost / 100) * 10) / 10);
    
    const effectiveChargingKw = Math.min(bestCharger.powerKw, vehicle.maxDcChargeKw);
    const chargingTimeMinutes = Math.round((kwhToCharge / effectiveChargingKw) * 60) + 5;
    const chargingCost = Math.round(kwhToCharge * (bestCharger.priceRate || 19));

    const remainingDistanceKm = tripDistanceKm - stopDistanceKm;
    const finalArrivalSoc = Math.max(12, Math.round(targetDepartureSoc - (remainingDistanceKm / fullRangeKm) * 100));

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

    const startPoint = L.latLng(originCoords[0], originCoords[1]);
    const endPoint = L.latLng(destCoords[0], destCoords[1]);
    const stopPoint = L.latLng(prediction.estimatedStopCoords[0], prediction.estimatedStopCoords[1]);

    const dischargeRatio = prediction.dischargeDistanceKm / tripDistanceKm;
    const dischargeLat = originCoords[0] + (destCoords[0] - originCoords[0]) * dischargeRatio;
    const dischargeLng = originCoords[1] + (destCoords[1] - originCoords[1]) * dischargeRatio;
    const dischargePoint = L.latLng(dischargeLat, dischargeLng);

    const originIcon = L.divIcon({
      className: 'custom-route-icon',
      html: `
        <div style="background-color: #16A34A; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2.5px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
          A
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const destIcon = L.divIcon({
      className: 'custom-route-icon',
      html: `
        <div style="background-color: #0284C7; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2.5px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
          B
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const chargeStopIcon = L.divIcon({
      className: 'custom-route-icon',
      html: `
        <div style="background-color: #F59E0B; color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2.5px solid white; box-shadow: 0 0 15px rgba(245, 158, 11, 0.7);">
          ⚡
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    const criticalIcon = L.divIcon({
      className: 'custom-route-icon',
      html: `
        <div style="background-color: #DC2626; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 0 10px rgba(220, 38, 38, 0.8);">
          !
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });

    L.marker(startPoint, { icon: originIcon })
      .bindPopup(`<strong>${originInput}</strong><br/>Start SoC: ${startSocPercentage}%`)
      .addTo(layerGroup);

    L.marker(endPoint, { icon: destIcon })
      .bindPopup(`<strong>${destInput}</strong><br/>Arrival: ${prediction.willDischarge ? prediction.finalArrivalSoc : Math.round(startSocPercentage - (tripDistanceKm / prediction.fullRangeKm) * 100)}%`)
      .addTo(layerGroup);

    if (prediction.willDischarge) {
      L.marker(stopPoint, { icon: chargeStopIcon })
        .bindPopup(`
          <div style="font-size: 12px;">
            <strong>${prediction.bestCharger.title}</strong><br/>
            Arrive: ${prediction.arrivalSocAtStop}%<br/>
            Charge to 80% (${prediction.chargingTimeMinutes} mins)
          </div>
        `)
        .addTo(layerGroup);

      L.marker(dischargePoint, { icon: criticalIcon })
        .bindPopup(`<strong>Discharge Point: Km ${prediction.dischargeDistanceKm}</strong>`)
        .addTo(layerGroup);

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
      L.polyline([startPoint, endPoint], {
        color: '#16A34A',
        weight: 5,
        opacity: 0.9,
      }).addTo(layerGroup);
    }

    const bounds = L.latLngBounds([startPoint, endPoint]);
    if (prediction.willDischarge) {
      bounds.extend(stopPoint);
      bounds.extend(dischargePoint);
    }
    map.fitBounds(bounds, { padding: [50, 50] });

  }, [originCoords, destCoords, prediction, originInput, destInput, startSocPercentage, tripDistanceKm, formatCurrency]);

  return (
    <div className="space-y-5 font-sans">
      
      {/* Top Banner */}
      <div className="bg-white border border-[#BAE6FD] rounded-card p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7] animate-pulse"></span>
            <span className="text-xs font-mono font-bold text-[#0284C7] uppercase tracking-wider">
              Journey Prediction
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
            Route Simulation & Energy Planner
          </h1>
        </div>
      </div>

      {/* Main Grid: Controls (Left) & Results/Map (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column: Trip Configuration Controls */}
        <div className="lg:col-span-4 space-y-4">
          
          <div className="bg-white border border-[#BAE6FD] rounded-card p-4 space-y-3.5 shadow-sm">
            <h3 className="text-xs font-bold text-[#0F172A] font-mono flex items-center gap-2 pb-2 border-b border-[#E2E8F0]">
              <Compass className="w-4 h-4 text-[#0284C7]" />
              <span>Waypoints</span>
            </h3>

            {/* Origin Input */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono font-bold text-[#475569] mb-1">
                <span>ORIGIN</span>
                <button
                  type="button"
                  onClick={() => {
                    setOriginCoords(userCoords);
                    setOriginInput('Current Location');
                    handlePlanRoute('Current Location', destInput);
                  }}
                  className="text-[10px] text-[#0284C7] hover:underline flex items-center gap-1 font-normal"
                >
                  <MapPin className="w-3 h-3" />
                  Use GPS
                </button>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={originInput}
                  onChange={e => setOriginInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handlePlanRoute();
                  }}
                  className="w-full pl-8 pr-3 py-2 text-xs bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0284C7] font-mono text-[#0F172A]"
                  placeholder="e.g. Pune, Kothrud, Delhi"
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
                  onKeyDown={e => {
                    if (e.key === 'Enter') handlePlanRoute();
                  }}
                  className="w-full pl-8 pr-3 py-2 text-xs bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0284C7] font-mono text-[#0F172A]"
                  placeholder="e.g. Mumbai, Lonavala, Goa"
                />
                <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7] absolute left-3 top-3"></span>
              </div>
            </div>

            {/* Plan Route Button */}
            <button
              type="button"
              disabled={isGeocoding}
              onClick={() => handlePlanRoute()}
              className="w-full py-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-50"
            >
              {isGeocoding ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Calculating Route...</span>
                </>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>Update Route</span>
                </>
              )}
            </button>

            {/* Distance Slider */}
            <div className="pt-2 border-t border-[#E2E8F0]">
              <div className="flex items-center justify-between text-xs font-mono mb-1">
                <span className="font-bold text-[#475569]">DISTANCE</span>
                <span className="font-bold text-[#0284C7]">{tripDistanceKm} km</span>
              </div>
              <input
                type="range"
                min={20}
                max={500}
                step={5}
                value={tripDistanceKm}
                onChange={e => setTripDistanceKm(Number(e.target.value))}
                className="w-full accent-[#0284C7] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#94A3B8]">
                <span>20 km</span>
                <span>250 km</span>
                <span>500 km</span>
              </div>
            </div>
          </div>

          {/* Vehicle & Energy Settings */}
          <div className="bg-white border border-[#BAE6FD] rounded-card p-4 space-y-3.5 shadow-sm">
            <h3 className="text-xs font-bold text-[#0F172A] font-mono flex items-center gap-2 pb-2 border-b border-[#E2E8F0]">
              <Car className="w-4 h-4 text-[#0284C7]" />
              <span>Vehicle & Battery</span>
            </h3>

            {/* Vehicle Model Selector */}
            <div>
              <label className="block text-xs font-mono font-bold text-[#475569] mb-1">
                EV MODEL
              </label>
              <select
                value={selectedVehicleId}
                onChange={e => setSelectedVehicleId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0284C7] font-mono text-[#0F172A]"
              >
                {VEHICLE_PROFILES.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Current Battery SoC % Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-1">
                <span className="font-bold text-[#475569]">BATTERY (SoC)</span>
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
            </div>

            {/* Driving Mode Buttons */}
            <div>
              <label className="block text-xs font-mono font-bold text-[#475569] mb-1.5">
                MODE
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs font-mono font-bold">
                <button
                  type="button"
                  onClick={() => setDrivingMode('eco')}
                  className={`py-1.5 rounded-lg border text-center transition-all ${
                    drivingMode === 'eco' 
                      ? 'bg-[#DCFCE7] border-[#86EFAC] text-[#16A34A]' 
                      : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#64748B]'
                  }`}
                >
                  ECO
                </button>
                <button
                  type="button"
                  onClick={() => setDrivingMode('normal')}
                  className={`py-1.5 rounded-lg border text-center transition-all ${
                    drivingMode === 'normal' 
                      ? 'bg-[#E0F2FE] border-[#BAE6FD] text-[#0284C7]' 
                      : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#64748B]'
                  }`}
                >
                  NORMAL
                </button>
                <button
                  type="button"
                  onClick={() => setDrivingMode('sport')}
                  className={`py-1.5 rounded-lg border text-center transition-all ${
                    drivingMode === 'sport' 
                      ? 'bg-[#FEE2E2] border-[#FECDD3] text-[#DC2626]' 
                      : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#64748B]'
                  }`}
                >
                  SPORT
                </button>
              </div>
            </div>

            {/* Air Conditioning Toggle */}
            <div className="flex items-center justify-between p-2.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
              <span className="text-xs font-mono font-bold text-[#0F172A]">AC Climate</span>
              <button
                type="button"
                onClick={() => setAcEnabled(!acEnabled)}
                className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors ${acEnabled ? 'bg-[#0284C7]' : 'bg-[#CBD5E1]'}`}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${acEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Range summary preview */}
            <div className="p-3 bg-[#F0F9FF] border border-[#BAE6FD] rounded-xl text-xs font-mono space-y-1">
              <div className="flex justify-between text-[#64748B]">
                <span>Consumption:</span>
                <span className="font-bold text-[#0F172A]">{prediction.effectiveWhPerKm} Wh/km</span>
              </div>
              <div className="flex justify-between text-[#64748B]">
                <span>Usable Range:</span>
                <span className="font-bold text-[#0284C7]">{prediction.initialUsableRangeKm} km</span>
              </div>
            </div>

          </div>

        </div>

        {/* Right Column: Prediction Results, Leaflet Map & Stop Recommendation */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Discharge Alert or Safe Journey Banner */}
          {prediction.willDischarge ? (
            <div className="bg-[#FFF1F2] border border-[#FDA4AF] rounded-card p-4 text-[#9F1239] shadow-xs flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-[#E11D48] shrink-0" />
                <div>
                  <div className="text-xs font-mono font-bold text-[#881337]">
                    Discharge Warning: Depletes at Km {prediction.dischargeDistanceKm}
                  </div>
                  <div className="text-xs font-mono text-[#9F1239]">
                    Stop required at Km {prediction.stopDistanceKm}
                  </div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded bg-[#FEE2E2] text-[#E11D48] font-mono font-bold text-xs shrink-0">
                Charging Required
              </span>
            </div>
          ) : (
            <div className="bg-[#F0FDF4] border border-[#86EFAC] rounded-card p-4 text-[#14532D] shadow-xs flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0" />
                <div className="text-xs font-mono font-bold text-[#14532D]">
                  Direct Journey: Arrival at {prediction.finalArrivalSoc}% SoC
                </div>
              </div>
              <span className="px-2.5 py-1 rounded bg-[#DCFCE7] text-[#16A34A] font-mono font-bold text-xs shrink-0">
                Safe
              </span>
            </div>
          )}

          {/* Interactive Leaflet Route Map */}
          <div className="bg-white border border-[#BAE6FD] rounded-card overflow-hidden shadow-sm">
            <div className="p-3 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC] text-xs font-mono">
              <span className="font-bold text-[#0F172A] flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-[#0284C7]" />
                <span>{originInput} ➔ {destInput} ({tripDistanceKm} km)</span>
              </span>

              {/* Legend */}
              <div className="flex items-center gap-3 text-[11px]">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#16A34A]"></span>
                  <span>Origin</span>
                </div>
                {prediction.willDischarge && (
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span>
                    <span>Stop</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#0284C7]"></span>
                  <span>Dest</span>
                </div>
              </div>
            </div>

            {/* Map Canvas */}
            <div ref={mapContainerRef} className="w-full h-72 z-0 bg-[#E0F2FE]/20" />
          </div>

          {/* Recommended Charging Stop Action Card */}
          {prediction.willDischarge && (
            <div className="bg-white border border-[#0284C7] rounded-card p-4 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#E0F2FE] text-[#0284C7] font-mono font-bold text-[10px]">
                      KM {prediction.stopDistanceKm}
                    </span>
                    <span className="text-xs font-mono font-bold text-[#16A34A] flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      {prediction.bestCharger.powerKw} kW
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-[#0F172A] mt-1 font-mono">
                    {prediction.bestCharger.title}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setBookingModalCharger(prediction.bestCharger)}
                  className="px-3.5 py-2 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs shrink-0"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Slot</span>
                </button>
              </div>

              {/* Charging Stop Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-center text-xs">
                <div className="p-2 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                  <span className="text-[10px] text-[#64748B] block">Arrival</span>
                  <span className="font-bold text-[#D97706]">{prediction.arrivalSocAtStop}%</span>
                </div>
                <div className="p-2 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                  <span className="text-[10px] text-[#64748B] block">Charge</span>
                  <span className="font-bold text-[#0284C7]">+{prediction.kwhToCharge} kWh</span>
                </div>
                <div className="p-2 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                  <span className="text-[10px] text-[#64748B] block">Duration</span>
                  <span className="font-bold text-[#0F172A]">{prediction.chargingTimeMinutes} min</span>
                </div>
                <div className="p-2 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                  <span className="text-[10px] text-[#64748B] block">Cost</span>
                  <span className="font-bold text-[#16A34A]">{formatCurrency(prediction.chargingCost)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Battery Discharge Curve & Journey Timeline */}
          <div className="bg-white border border-[#BAE6FD] rounded-card p-4 space-y-3 shadow-sm">
            <h3 className="text-xs font-bold text-[#0F172A] font-mono flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <BatteryCharging className="w-3.5 h-3.5 text-[#0284C7]" />
                <span>Battery Telemetry Curve</span>
              </span>
              <span className="text-[11px] text-[#64748B]">
                {Math.floor(prediction.totalTripTimeMinutes / 60)}h {prediction.totalTripTimeMinutes % 60}m
              </span>
            </h3>

            {/* SVG SoC Telemetry Graph */}
            <div className="w-full h-36 pt-1">
              <svg viewBox="0 0 600 150" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="safeSocGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0284C7" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#0284C7" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                <line x1="0" y1="125" x2="600" y2="125" stroke="#FECDD3" strokeDasharray="3,3" strokeWidth="1.5" />
                <line x1="0" y1="75" x2="600" y2="75" stroke="#E2E8F0" strokeDasharray="3,3" />
                
                {prediction.willDischarge ? (
                  <>
                    <line 
                      x1="0" 
                      y1={150 - (startSocPercentage * 1.3)} 
                      x2={(prediction.dischargeDistanceKm / tripDistanceKm) * 600} 
                      y2="145" 
                      stroke="#FDA4AF" 
                      strokeDasharray="4,4" 
                      strokeWidth="2" 
                    />

                    {(() => {
                      const stopX = (prediction.stopDistanceKm / tripDistanceKm) * 600;
                      const startY = 150 - (startSocPercentage * 1.3);
                      const arrivalY = 150 - (prediction.arrivalSocAtStop * 1.3);
                      const boostedY = 150 - (prediction.targetDepartureSoc * 1.3);
                      const finalY = 150 - (prediction.finalArrivalSoc * 1.3);

                      return (
                        <>
                          <polygon
                            points={`0,150 0,${startY} ${stopX},${arrivalY} ${stopX},${boostedY} 600,${finalY} 600,150`}
                            fill="url(#safeSocGrad)"
                          />
                          <polyline
                            fill="none"
                            stroke="#0284C7"
                            strokeWidth="2.5"
                            points={`0,${startY} ${stopX},${arrivalY} ${stopX},${boostedY} 600,${finalY}`}
                          />
                          <circle cx={stopX} cy={arrivalY} r="4" fill="#FFFFFF" stroke="#D97706" strokeWidth="2.5" />
                          <circle cx={stopX} cy={boostedY} r="4" fill="#FFFFFF" stroke="#16A34A" strokeWidth="2.5" />
                        </>
                      );
                    })()}
                  </>
                ) : (
                  <>
                    {(() => {
                      const startY = 150 - (startSocPercentage * 1.3);
                      const finalY = 150 - (prediction.finalArrivalSoc * 1.3);

                      return (
                        <>
                          <polygon
                            points={`0,150 0,${startY} 600,${finalY} 600,150`}
                            fill="url(#safeSocGrad)"
                          />
                          <polyline
                            fill="none"
                            stroke="#16A34A"
                            strokeWidth="2.5"
                            points={`0,${startY} 600,${finalY}`}
                          />
                        </>
                      );
                    })()}
                  </>
                )}

                <circle cx="0" cy={150 - (startSocPercentage * 1.3)} r="3.5" fill="#16A34A" />
                <circle cx="600" cy={150 - (prediction.finalArrivalSoc * 1.3)} r="3.5" fill="#0284C7" />
              </svg>

              <div className="flex justify-between text-[10px] font-mono text-[#64748B] pt-1 px-1">
                <span>0 km ({startSocPercentage}%)</span>
                {prediction.willDischarge && (
                  <span className="text-[#0284C7] font-bold">Km {prediction.stopDistanceKm}</span>
                )}
                <span>{tripDistanceKm} km ({prediction.finalArrivalSoc}%)</span>
              </div>
            </div>

            {/* Turn-by-Turn Journey Milestones */}
            <div className="border-t border-[#E2E8F0] pt-3 space-y-2 font-mono text-xs">
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center font-bold text-[10px] shrink-0">
                  1
                </span>
                <span className="flex-1 text-[#0F172A]">Depart {originInput} ({startSocPercentage}%)</span>
                <span className="text-[#94A3B8]">0 km</span>
              </div>

              {prediction.willDischarge && (
                <div className="flex items-center gap-2.5 bg-[#F0F9FF] p-2 rounded-lg border border-[#BAE6FD]">
                  <span className="w-5 h-5 rounded-full bg-[#0284C7] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                    2
                  </span>
                  <span className="flex-1 text-[#0284C7] font-bold">
                    Fast Charge: {prediction.bestCharger.title} ({prediction.chargingTimeMinutes} min)
                  </span>
                  <span className="text-[#0284C7] font-bold">Km {prediction.stopDistanceKm}</span>
                </div>
              )}

              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center font-bold text-[10px] shrink-0">
                  {prediction.willDischarge ? '3' : '2'}
                </span>
                <span className="flex-1 text-[#0F172A]">Arrive {destInput} ({prediction.finalArrivalSoc}%)</span>
                <span className="text-[#94A3B8]">{tripDistanceKm} km</span>
              </div>
            </div>

          </div>

        </div>

      </div>

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
