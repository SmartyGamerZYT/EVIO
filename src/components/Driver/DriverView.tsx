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

  // Default coordinate center
  const [userCoords, setUserCoords] = useState<[number, number]>([37.7749, -122.4194]);

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
          setUserCoords([37.7749, -122.4194]);
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
              <div className="bg-white border border-[#BAE6FD] rounded-card p-8 text-center text-xs text-[#64748B] space-y-3 font-mono shadow-sm">
                <AlertCircle className="w-8 h-8 text-[#0284C7] mx-auto opacity-70" />
                <p className="font-bold text-[#0F172A] text-sm">0 Stations Active in Radius</p>
                <p className="font-sans text-[11px] leading-relaxed">
                  No chargers found for current filter parameters. List a new private charger or load calibration stations to test the grid.
                </p>
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={onOpenListingWizard}
                    className="w-full py-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold text-xs shadow-xs"
                  >
                    List My Charger
                  </button>
                  <button
                    onClick={loadSeedChargers}
                    className="w-full py-2 rounded-xl bg-[#F0F9FF] border border-[#BAE6FD] hover:border-[#0284C7] text-[#0284C7] font-bold text-xs"
                  >
                    Load Demo Stations
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
            <div className="col-span-3 bg-white border border-[#BAE6FD] rounded-card p-12 text-center text-xs text-[#64748B] font-mono shadow-sm">
              0 charging stations registered.
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
