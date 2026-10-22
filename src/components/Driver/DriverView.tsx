import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ChargerListing } from '../../types';
import { LiveMap } from '../Map/LiveMap';
import { DiscoveryFilters, FilterState } from './DiscoveryFilters';
import { ChargerCard } from './ChargerCard';
import { ChargerDetailModal } from './ChargerDetailModal';
import { Database, PlusCircle, AlertCircle } from 'lucide-react';

interface DriverViewProps {
  onOpenActiveSession: () => void;
  onOpenListingWizard: () => void;
}

export const DriverView: React.FC<DriverViewProps> = ({ 
  onOpenActiveSession,
  onOpenListingWizard,
}) => {
  const { chargers, loadSeedChargers } = useApp();

  const [selectedCharger, setSelectedCharger] = useState<ChargerListing | null>(null);
  const [bookingModalCharger, setBookingModalCharger] = useState<ChargerListing | null>(null);

  // Center on La Paz, Bolivia as specified in DESIGN.md section 1
  const [userCoords, setUserCoords] = useState<[number, number]>([-16.5000, -68.1500]);

  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    selectedConnectors: [],
    selectedPowerTier: 'all',
    availableOnly: false,
    maxPrice: 50,
    selectedAmenities: [],
    sortBy: 'nearest',
    viewMode: 'map',
    radiusKm: 25,
  });

  const handleLocateMe = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setUserCoords([pos.coords.latitude, pos.coords.longitude]);
        },
        () => {
          // Default to central La Paz
          setUserCoords([-16.5000, -68.1500]);
        }
      );
    }
  };

  const filteredChargers = useMemo(() => {
    return chargers
      .filter(c => {
        if (c.listingStatus !== 'live') return false;

        if (filters.searchQuery) {
          const q = filters.searchQuery.toLowerCase();
          const matchTitle = c.title.toLowerCase().includes(q);
          const matchAddr = c.approxAddress.toLowerCase().includes(q);
          if (!matchTitle && !matchAddr) return false;
        }

        if (filters.selectedConnectors.length > 0) {
          const hasMatchingConnector = filters.selectedConnectors.some(conn =>
            c.connectorTypes.includes(conn)
          );
          if (!hasMatchingConnector) return false;
        }

        if (filters.selectedPowerTier !== 'all') {
          if (c.powerTier !== filters.selectedPowerTier) return false;
        }

        if (filters.availableOnly && c.status !== 'available') {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'cheapest') {
          return a.priceRate - b.priceRate;
        }
        if (filters.sortBy === 'rating') {
          return b.hostRating - a.hostRating;
        }
        if (filters.sortBy === 'power') {
          return b.powerKw - a.powerKw;
        }
        return 0;
      });
  }, [chargers, filters]);

  return (
    <div className="space-y-5">
      
      {/* Discovery Filters Bar */}
      <DiscoveryFilters
        filters={filters}
        setFilters={setFilters}
        onLocateMe={handleLocateMe}
        totalResults={filteredChargers.length}
        onOpenListingWizard={onOpenListingWizard}
      />

      {/* Main Content: Map or Grid */}
      {filters.viewMode === 'map' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[580px]">
          
          {/* Left Column: 4-Cols Scrollable Results List */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-4 max-h-[700px] overflow-y-auto pr-1">
            {filteredChargers.length === 0 ? (
              <div className="bg-[#1E1E1E] border border-[#2C2C2E] rounded-card p-8 text-center text-xs text-[#98989D] space-y-3 font-mono">
                <AlertCircle className="w-8 h-8 text-[#00E5FF] mx-auto opacity-70" />
                <p className="font-semibold text-white">0 Nodos Registrados en Este Radio</p>
                <p className="font-sans text-[11px] leading-relaxed">
                  No hay cargadores activos en la base de datos local para los filtros seleccionados. Puede registrar un nuevo terminal o cargar estaciones de calibracion de Bolivia.
                </p>
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={onOpenListingWizard}
                    className="w-full py-2.5 rounded-xl bg-[#00E5FF] text-black font-bold text-xs"
                  >
                    Registrar Mi Cargador
                  </button>
                  <button
                    onClick={loadSeedChargers}
                    className="w-full py-2 rounded-xl bg-[#121212] border border-[#2C2C2E] hover:border-[#00E5FF] text-white text-xs"
                  >
                    Cargar Nodos de Calibracion (La Paz)
                  </button>
                </div>
              </div>
            ) : (
              filteredChargers.map(charger => (
                <ChargerCard
                  key={charger.id}
                  charger={charger}
                  isSelected={selectedCharger?.id === charger.id}
                  onSelect={chg => setSelectedCharger(chg)}
                  onBook={chg => setBookingModalCharger(chg)}
                  distanceKm={Number((Math.sqrt(Math.pow(charger.lat - userCoords[0], 2) + Math.pow(charger.lng - userCoords[1], 2)) * 111).toFixed(1))}
                />
              ))
            )}
          </div>

          {/* Right Column: 8-Cols Live Leaflet Map */}
          <div className="lg:col-span-7 xl:col-span-8 min-h-[500px] lg:min-h-full">
            <LiveMap
              chargers={filteredChargers}
              selectedCharger={selectedCharger}
              onSelectCharger={chg => setSelectedCharger(chg)}
              userCoords={userCoords}
              radiusKm={filters.radiusKm}
            />
          </div>

        </div>
      ) : (
        /* List View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredChargers.length === 0 ? (
            <div className="col-span-3 bg-[#1E1E1E] border border-[#2C2C2E] rounded-card p-12 text-center text-xs text-[#98989D] font-mono">
              0 Nodos de recarga registrados.
            </div>
          ) : (
            filteredChargers.map(charger => (
              <ChargerCard
                key={charger.id}
                charger={charger}
                isSelected={selectedCharger?.id === charger.id}
                onSelect={chg => setSelectedCharger(chg)}
                onBook={chg => setBookingModalCharger(chg)}
              />
            ))
          )}
        </div>
      )}

      {/* Detail & Booking Modal */}
      {bookingModalCharger && (
        <ChargerDetailModal
          charger={bookingModalCharger}
          onClose={() => setBookingModalCharger(null)}
          onBookingSuccess={() => {
            setBookingModalCharger(null);
            onOpenActiveSession();
          }}
        />
      )}

    </div>
  );
};
