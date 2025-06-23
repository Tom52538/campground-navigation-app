import React, { useState, useEffect } from 'react';
import { MapContainerComponent } from '@/components/Map/MapContainer';
import { SearchBar } from '@/components/UI/SearchBar';
import { CategoryFilter } from '@/components/UI/CategoryFilter';
import { WeatherWidget } from '@/components/UI/WeatherWidget';
import { SiteToggle } from '@/components/UI/SiteToggle';
import { MapStyleToggle } from '@/components/UI/MapStyleToggle';
import { useLocation } from '@/hooks/useLocation';
import { usePOI } from '@/hooks/usePOI';
import { useWeather } from '@/hooks/useWeather';
import { useLanguage } from '@/hooks/useLanguage';
import { POI } from '@/shared/schema';
import { Coordinates, TestSite, MapStyle } from '@/types';

const TEST_SITES: Record<TestSite, { coordinates: Coordinates; name: string }> = {
  kamperland: { coordinates: { lat: 51.58979501327052, lng: 3.721826089503387 }, name: 'Kamperland (NL)' },
  zuhause: { coordinates: { lat: 51.00165397612932, lng: 6.051040465199215 }, name: 'Zuhause (DE)' }
};

export default function Navigation() {
  const [currentSite, setCurrentSite] = useState<TestSite>('kamperland');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCategories, setFilteredCategories] = useState<string[]>([]);
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);
  const [mapCenter, setMapCenter] = useState<Coordinates>(TEST_SITES[currentSite].coordinates);
  const [mapZoom, setMapZoom] = useState(16);
  const [mapStyle, setMapStyle] = useState<MapStyle>('outdoors');

  const { currentPosition, isLoading: locationLoading } = useLocation({ currentSite });
  const { data: pois, isLoading: poisLoading } = usePOI(currentSite);
  const { data: weather } = useWeather(mapCenter.lat, mapCenter.lng);
  const { currentLanguage } = useLanguage();

  // Update map center when site changes
  useEffect(() => {
    const siteCoords = TEST_SITES[currentSite].coordinates;
    console.log('🗺️ SITE CHANGE: Centering map on', currentSite + ':', siteCoords);
    setMapCenter(siteCoords);
    setMapZoom(16);
    setSelectedPOI(null);
  }, [currentSite]);

  const filteredPOIs = React.useMemo(() => {
    if (!pois) return [];
    
    let filtered = pois;
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(poi => 
        poi.name.toLowerCase().includes(query) ||
        poi.category.toLowerCase().includes(query) ||
        (poi.description && poi.description.toLowerCase().includes(query))
      );
    }
    
    if (filteredCategories.length > 0) {
      filtered = filtered.filter(poi => filteredCategories.includes(poi.category));
    }
    
    return filtered;
  }, [pois, searchQuery, filteredCategories]);

  const handlePOIClick = (poi: POI) => {
    setSelectedPOI(poi);
    setMapCenter({ lat: poi.lat, lng: poi.lng });
    setMapZoom(18);
  };

  const handleMapClick = () => {
    setSelectedPOI(null);
  };

  if (locationLoading || poisLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading navigation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between p-4 bg-white/90 backdrop-blur-md shadow-sm border-b border-white/20 z-10">
        <div className="flex items-center gap-3">
          <SiteToggle currentSite={currentSite} onSiteChange={setCurrentSite} />
        </div>
        
        <div className="flex items-center gap-2">
          <WeatherWidget weather={weather} lat={mapCenter.lat} lng={mapCenter.lng} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative">
        {/* Map Container */}
        <MapContainerComponent
          center={mapCenter}
          zoom={mapZoom}
          currentPosition={currentPosition}
          pois={filteredPOIs}
          selectedPOI={selectedPOI}
          route={null}
          filteredCategories={filteredCategories}
          onPOIClick={handlePOIClick}
          onMapClick={handleMapClick}
          mapOrientation="north"
          mapStyle={mapStyle}
        />

        {/* Search and Filter Overlay */}
        <div className="absolute top-4 left-4 right-4 z-20 space-y-3">
          <SearchBar 
            value={searchQuery} 
            onChange={setSearchQuery}
            placeholder="Search POIs..."
          />
          <CategoryFilter
            categories={pois?.map(poi => poi.category) || []}
            selectedCategories={filteredCategories}
            onCategoryChange={setFilteredCategories}
          />
        </div>

        {/* Floating Controls */}
        <div className="absolute bottom-6 right-4 flex flex-col gap-3 z-20">
          <MapStyleToggle currentStyle={mapStyle} onStyleChange={setMapStyle} />
        </div>
      </div>
    </div>
  );
}