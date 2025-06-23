import React, { useState } from 'react';
import { MapContainer as LeafletMapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { divIcon } from 'leaflet';
import L from 'leaflet';
import { MapPin, Navigation as NavigationIcon, X, Volume2, VolumeX } from 'lucide-react';
import { useLocation } from '@/hooks/useLocation';
import { usePOI } from '@/hooks/usePOI';
import { useWeather } from '@/hooks/useWeather';
import { TestSite, POI } from '@/types';
import { formatDistance, decodePolyline } from '@/lib/mapUtils';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function SimpleNavigation() {
  const [currentSite, setCurrentSite] = useState<TestSite>('kamperland');
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [route, setRoute] = useState<any>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const { currentPosition } = useLocation({ currentSite });
  const { data: pois = [] } = usePOI(currentSite);
  const { data: weather } = useWeather(currentPosition.lat, currentPosition.lng);

  const handleStartNavigation = async (poi: POI) => {
    setSelectedPOI(poi);
    setIsNavigating(true);
    
    try {
      const response = await fetch('/api/directions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: currentPosition,
          destination: { lat: poi.lat, lng: poi.lng },
          mode: 'walking'
        })
      });
      
      if (response.ok) {
        const routeData = await response.json();
        setRoute(routeData);
        
        // Voice announcement
        if (voiceEnabled && 'speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(`Navigation zu ${poi.name} gestartet`);
          utterance.lang = 'de-DE';
          speechSynthesis.speak(utterance);
        }
      }
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const handleStopNavigation = () => {
    setIsNavigating(false);
    setSelectedPOI(null);
    setRoute(null);
    
    if (voiceEnabled && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance('Navigation beendet');
      utterance.lang = 'de-DE';
      speechSynthesis.speak(utterance);
    }
  };

  // Current location marker
  const currentLocationIcon = divIcon({
    html: `<div class="bg-blue-600 w-4 h-4 rounded-full shadow-lg border-2 border-white"></div>`,
    className: 'current-location-marker',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

  // POI marker
  const poiIcon = divIcon({
    html: `<div class="bg-red-500 w-6 h-6 rounded-full shadow-lg border-2 border-white flex items-center justify-center text-white text-xs">📍</div>`,
    className: 'poi-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

  const routeSteps = route?.routes?.[0]?.legs?.[0]?.steps || [];
  const totalDistance = route?.routes?.[0]?.legs?.[0]?.distance?.text || '';
  const totalDuration = route?.routes?.[0]?.legs?.[0]?.duration?.text || '';

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Controls */}
      <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-start">
        {/* Site Selector */}
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentSite('kamperland')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all ${
              currentSite === 'kamperland'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span className="font-medium">Kamperland</span>
            <span className="text-sm opacity-75">(NL)</span>
          </button>
          <button
            onClick={() => setCurrentSite('zuhause')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all ${
              currentSite === 'zuhause'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span className="font-medium">Zuhause</span>
            <span className="text-sm opacity-75">(DE)</span>
          </button>
        </div>

        {/* Weather Widget */}
        {weather && (
          <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md">
            <div className="text-sm font-medium text-gray-900">
              {weather.temperature}°C
            </div>
            <div className="text-xs text-gray-600">
              {weather.condition}
            </div>
          </div>
        )}
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <LeafletMapContainer
          center={[currentPosition.lat, currentPosition.lng]}
          zoom={17}
          className="h-full w-full"
          zoomControl={false}
        >
          <TileLayer
            url="https://api.mapbox.com/styles/v1/mapbox/outdoors-v12/tiles/256/{z}/{x}/{y}@2x?access_token={accessToken}"
            accessToken={import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}
            attribution='&copy; <a href="https://www.mapbox.com/">Mapbox</a>'
          />

          {/* Current position marker */}
          <Marker position={[currentPosition.lat, currentPosition.lng]} icon={currentLocationIcon}>
            <Popup>Ihr aktueller Standort</Popup>
          </Marker>

          {/* Route polyline */}
          {route && route.routes && route.routes[0] && (
            <Polyline
              positions={decodePolyline(route.routes[0].overview_polyline.points)}
              color="#2563eb"
              weight={5}
              opacity={0.8}
            />
          )}

          {/* POI markers */}
          {pois.filter(poi => poi.lat && poi.lng && !isNaN(poi.lat) && !isNaN(poi.lng)).map((poi) => (
            <Marker
              key={poi.id}
              position={[poi.lat, poi.lng]}
              icon={poiIcon}
              eventHandlers={{
                click: () => handleStartNavigation(poi),
              }}
            >
              <Popup>
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900">{poi.name}</div>
                  <div className="text-sm text-gray-600 mb-2">{poi.description}</div>
                  <button
                    onClick={() => handleStartNavigation(poi)}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                  >
                    <NavigationIcon className="w-4 h-4 inline mr-1" />
                    Navigation starten
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </LeafletMapContainer>
      </div>

      {/* Navigation Panel */}
      {isNavigating && route && routeSteps.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <div className="text-lg font-semibold text-gray-900 mb-1">
                  {routeSteps[0]?.html_instructions?.replace(/<[^>]*>/g, '') || 'Navigation läuft...'}
                </div>
                <div className="text-sm text-gray-600">
                  {routeSteps[0]?.distance?.text} • {routeSteps[0]?.duration?.text}
                </div>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                  className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors"
                >
                  {voiceEnabled ? (
                    <Volume2 className="w-5 h-5 text-blue-600" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-gray-600" />
                  )}
                </button>
                <button
                  onClick={handleStopNavigation}
                  className="p-2 rounded-full bg-red-100 hover:bg-red-200 transition-colors"
                >
                  <X className="w-5 h-5 text-red-600" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600 pt-3 border-t border-gray-200">
              <div>
                Schritt 1 von {routeSteps.length}
              </div>
              <div>
                {totalDistance} • {totalDuration}
              </div>
              <div>
                → {selectedPOI?.name}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}