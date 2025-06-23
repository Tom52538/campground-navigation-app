import React, { useState, useEffect } from 'react';
import { MapContainer } from '@/components/Map/MapContainer';
import { NavigationPanel } from '@/components/Navigation/NavigationPanel';
import { WeatherWidget } from '@/components/UI/WeatherWidget';
import { SiteSelector } from '@/components/UI/SiteSelector';
import { useLocation } from '@/hooks/useLocation';
import { usePOI } from '@/hooks/usePOI';
import { useLanguage } from '@/hooks/useLanguage';
import { TestSite, POI, Coordinates } from '@/types';

export function Navigation() {
  const [currentSite, setCurrentSite] = useState<TestSite>('kamperland');
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [route, setRoute] = useState<any>(null);

  const { currentPosition } = useLocation({ currentSite });
  const { data: pois = [] } = usePOI(currentSite);
  const { language } = useLanguage();

  const handleStartNavigation = async (destination: POI) => {
    setSelectedPOI(destination);
    setIsNavigating(true);
    
    // Get route from Google Directions API
    const response = await fetch('/api/directions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin: currentPosition,
        destination: { lat: destination.lat, lng: destination.lng },
        mode: 'walking'
      })
    });
    
    if (response.ok) {
      const routeData = await response.json();
      setRoute(routeData);
    }
  };

  const handleStopNavigation = () => {
    setIsNavigating(false);
    setSelectedPOI(null);
    setRoute(null);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Controls */}
      <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-start">
        <SiteSelector 
          currentSite={currentSite} 
          onSiteChange={setCurrentSite} 
        />
        <WeatherWidget 
          lat={currentPosition.lat} 
          lng={currentPosition.lng} 
        />
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer
          center={currentPosition}
          pois={pois}
          selectedPOI={selectedPOI}
          onPOIClick={handleStartNavigation}
          route={route}
          currentPosition={currentPosition}
          isNavigating={isNavigating}
        />
      </div>

      {/* Navigation Panel */}
      {isNavigating && route && (
        <NavigationPanel
          route={route}
          currentPosition={currentPosition}
          destination={selectedPOI}
          onStop={handleStopNavigation}
          language={language}
        />
      )}
    </div>
  );
}