import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { ChargerListing } from '../../types';
import { useApp } from '../../context/AppContext';

interface LiveMapProps {
  chargers: ChargerListing[];
  selectedCharger: ChargerListing | null;
  onSelectCharger: (charger: ChargerListing) => void;
  userCoords: [number, number];
  radiusKm: number;
}

export const LiveMap: React.FC<LiveMapProps> = ({
  chargers,
  selectedCharger,
  onSelectCharger,
  userCoords,
  radiusKm,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const radiusCircleRef = useRef<L.Circle | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const { formatCurrency } = useApp();

  // Initialize Map with Light CartoDB Positron tiles (White & Skyblue water)
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: userCoords,
      zoom: 13,
      zoomControl: false,
    });

    // CartoDB Positron tile layer: clean, white, light sky blue theme
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update User marker & Radius circle
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng(userCoords);
    } else {
      const userIcon = L.divIcon({
        className: 'user-pin',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="w-6 h-6 rounded-full bg-[#0284C7]/20 animate-ping absolute"></div>
            <div class="w-4 h-4 rounded-full bg-[#0284C7] border-2 border-white shadow-[0_0_10px_rgba(2,132,199,0.5)]"></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      userMarkerRef.current = L.marker(userCoords, { icon: userIcon, zIndexOffset: 1000 }).addTo(map);
    }

    if (radiusCircleRef.current) {
      radiusCircleRef.current.setLatLng(userCoords);
      radiusCircleRef.current.setRadius(radiusKm * 1000);
    } else {
      radiusCircleRef.current = L.circle(userCoords, {
        radius: radiusKm * 1000,
        color: '#0284C7',
        weight: 1.5,
        fillColor: '#0284C7',
        fillOpacity: 0.06,
        dashArray: '5, 8',
      }).addTo(map);
    }
  }, [userCoords, radiusKm]);

  // Update Charger Pins
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    chargers.forEach(charger => {
      let color = '#16A34A'; // Green for Available
      let statusLabel = 'Available';
      let shadowColor = 'rgba(22, 163, 74, 0.25)';

      if (charger.status === 'in-use') {
        color = '#D97706'; // Amber for In-Use
        statusLabel = 'In Use';
        shadowColor = 'rgba(217, 119, 6, 0.25)';
      } else if (charger.status === 'offline') {
        color = '#64748B'; // Slate for Offline
        statusLabel = 'Offline';
        shadowColor = 'rgba(100, 116, 139, 0.2)';
      }

      const isSelected = selectedCharger?.id === charger.id;

      const customHtml = `
        <div class="group cursor-pointer transform transition-transform duration-200 hover:scale-110 ${isSelected ? 'scale-125 z-50' : ''}">
          <div style="background-color: #FFFFFF; border: 2px solid ${color}; box-shadow: 0 4px 14px ${shadowColor};" 
               class="px-2.5 py-1 rounded-full flex items-center gap-1.5 font-mono text-xs font-bold text-[#0F172A] whitespace-nowrap">
            <span style="background-color: ${color};" class="w-2 h-2 rounded-full animate-pulse"></span>
            <span>${charger.powerKw} kW</span>
          </div>
          <div style="border-top-color: ${color};" 
               class="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] mx-auto"></div>
        </div>
      `;

      const markerIcon = L.divIcon({
        className: 'custom-charger-pin',
        html: customHtml,
        iconSize: [60, 32],
        iconAnchor: [30, 32],
      });

      const marker = L.marker([charger.lat, charger.lng], { icon: markerIcon }).addTo(map);

      const popupHtml = `
        <div style="width: 220px; font-family: 'Inter', sans-serif; padding: 4px;">
          <div style="font-size: 13px; font-weight: 700; color: #0F172A; margin-bottom: 4px;">
            ${charger.title}
          </div>
          <div style="font-size: 11px; color: #64748B; margin-bottom: 8px;">
            ${charger.approxAddress}
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #E2E8F0; padding-top: 8px;">
            <div>
              <span style="font-family: 'JetBrains Mono', monospace; font-size: 14px; font-weight: 700; color: #0284C7;">
                ${formatCurrency(charger.priceRate)}
              </span>
              <span style="font-size: 10px; color: #64748B;">/${charger.pricingType === 'per-kwh' ? 'kWh' : 'hr'}</span>
            </div>
            <span style="font-size: 10px; padding: 2px 6px; border-radius: 4px; background: ${color}15; color: ${color}; font-weight: 700; font-family: monospace;">
              ${statusLabel.toUpperCase()}
            </span>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        onSelectCharger(charger);
      });

      markersRef.current[charger.id] = marker;
    });
  }, [chargers, selectedCharger, formatCurrency]);

  useEffect(() => {
    if (!selectedCharger || !mapInstanceRef.current) return;
    mapInstanceRef.current.panTo([selectedCharger.lat, selectedCharger.lng], { animate: true });
    
    const marker = markersRef.current[selectedCharger.id];
    if (marker) {
      marker.openPopup();
    }
  }, [selectedCharger]);

  return (
    <div className="relative w-full h-full min-h-[450px] rounded-2xl overflow-hidden border border-[#BAE6FD] shadow-sm bg-white">
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* Floating Status Legend */}
      <div className="absolute top-4 right-4 z-[400] bg-white/95 backdrop-blur-md border border-[#BAE6FD] rounded-xl px-3 py-2 flex items-center gap-4 text-[11px] font-mono shadow-md">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#16A34A]"></span>
          <span className="text-[#64748B]">Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#D97706]"></span>
          <span className="text-[#64748B]">In Use</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#64748B]"></span>
          <span className="text-[#64748B]">Offline</span>
        </div>
      </div>
    </div>
  );
};
