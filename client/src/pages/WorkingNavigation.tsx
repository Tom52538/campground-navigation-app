import React, { useState } from 'react';
import { MapContainer as LeafletMapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { MapPin, Navigation as NavigationIcon } from 'lucide-react';
import { useLocation } from '@/hooks/useLocation';
import { usePOI } from '@/hooks/usePOI';
import { useWeather } from '@/hooks/useWeather';
import { TestSite, POI } from '@/types';
import L from 'leaflet';

// Fix default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function WorkingNavigation() {
  const [currentSite, setCurrentSite] = useState<TestSite>('kamperland');
  const [isNavigating, setIsNavigating] = useState(false);
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);

  const { currentPosition } = useLocation({ currentSite });
  const { data: pois = [] } = usePOI(currentSite);
  const { data: weather } = useWeather(currentPosition.lat, currentPosition.lng);

  console.log('POI Data loaded:', pois.length, 'POIs for site:', currentSite);
  console.log('POIs:', pois.slice(0, 3));

  const handleStartNavigation = async (poi: POI) => {
    const lat = poi.lat || poi.coordinates?.lat;
    const lng = poi.lng || poi.coordinates?.lng;
    
    if (!lat || !lng) return;

    try {
      const response = await fetch('/api/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: currentPosition,
          to: { lat, lng },
          travelMode: 'walking'
        })
      });

      if (response.ok) {
        const routeData = await response.json();
        console.log('Navigation started to:', poi.name);
        setSelectedPOI(poi);
        setIsNavigating(true);
        
        // Speak navigation start in German
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(`Navigation gestartet zu ${poi.name}`);
          utterance.lang = 'de-DE';
          speechSynthesis.speak(utterance);
        }
      }
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const handleEndNavigation = () => {
    setIsNavigating(false);
    setSelectedPOI(null);
    
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance('Navigation beendet');
      utterance.lang = 'de-DE';
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="h-screen relative bg-gray-50">
      {/* Header - Only visible when NOT navigating */}
      {!isNavigating && (
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
      )}

      {/* Navigation Panel - Only visible when navigating */}
      {isNavigating && selectedPOI && (
        <div className="absolute top-4 left-4 right-4 z-30">
          <div className="bg-blue-600 text-white rounded-xl shadow-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-lg font-bold">Navigation zu {selectedPOI.name}</div>
                <div className="text-sm opacity-90">Ziel erreicht in Kürze</div>
              </div>
              <button
                onClick={handleEndNavigation}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Beenden
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div className="h-full w-full relative z-10">
        <LeafletMapContainer
          center={[currentPosition.lat, currentPosition.lng]}
          zoom={16}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Current Location Marker */}
          <Marker position={[currentPosition.lat, currentPosition.lng]}>
            <Popup>
              <div className="text-center">
                <div className="font-semibold">Ihre aktuelle Position</div>
                <div className="text-sm text-gray-600">{currentSite}</div>
              </div>
            </Popup>
          </Marker>

          {/* POI Markers - Only visible in exploration mode */}
          {!isNavigating && pois.filter(poi => {
            const lat = poi.lat || poi.coordinates?.lat;
            const lng = poi.lng || poi.coordinates?.lng;
            return lat && lng && !isNaN(lat) && !isNaN(lng);
          }).map((poi) => {
            const lat = poi.lat || poi.coordinates?.lat;
            const lng = poi.lng || poi.coordinates?.lng;
            
            console.log('Rendering POI:', poi.name, lat, lng);
            
            return (
              <Marker key={poi.id} position={[lat, lng]}>
                <Popup>
                  <div className="min-w-0 max-w-xs">
                    <div className="font-semibold text-gray-900 mb-1">{poi.name}</div>
                    <div className="text-sm text-gray-600 mb-2">{poi.description}</div>
                    <div className="text-xs text-gray-500 mb-3">Kategorie: {poi.category}</div>
                    <button
                      onClick={() => handleStartNavigation(poi)}
                      className="w-full bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 transition-colors flex items-center justify-center gap-1"
                    >
                      <NavigationIcon className="w-4 h-4" />
                      Navigation starten
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </LeafletMapContainer>
      </div>
    </div>
  );
}