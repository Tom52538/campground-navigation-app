import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { Icon, divIcon } from 'leaflet';
import { Coordinates, POI, NavigationRoute } from '@/types/navigation';
import { POIMarker } from './POIMarker';
import { GestureEnhancedMap } from './GestureEnhancedMap';
import { GestureController } from './GestureController';
import { ZoomGestureIndicator } from './ZoomGestureIndicator';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapContainerProps {
  center: Coordinates;
  zoom: number;
  currentPosition: Coordinates;
  pois: POI[];
  selectedPOI: POI | null;
  route: NavigationRoute | null;
  filteredCategories: string[];
  onPOIClick: (poi: POI) => void;
  onPOINavigate?: (poi: POI) => void;
  onMapClick: () => void;
  mapOrientation?: 'north' | 'driving';
  bearing?: number;
  mapStyle?: 'outdoors' | 'satellite' | 'streets' | 'navigation';
}

const CurrentLocationMarker = ({ position }: { position: Coordinates }) => {
  const currentLocationIcon = divIcon({
    html: `
      <div class="relative">
        <div class="bg-blue-600 w-4 h-4 rounded-full shadow-lg border-2 border-white"></div>
        <div class="absolute inset-0 bg-blue-600 rounded-full animate-ping opacity-75"></div>
      </div>
    `,
    className: 'current-location-marker',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

  return (
    <Marker position={[position.lat, position.lng]} icon={currentLocationIcon}>
      <Popup>Your Current Location</Popup>
    </Marker>
  );
};

const RoutePolyline = ({ route }: { route: NavigationRoute }) => {
  if (!route.geometry || !Array.isArray(route.geometry) || route.geometry.length === 0) return null;

  const positions: [number, number][] = route.geometry.map((coord: any) => {
    if (Array.isArray(coord) && coord.length >= 2) {
      return [coord[1], coord[0]] as [number, number]; // Swap lng,lat to lat,lng for Leaflet
    }
    return [0, 0] as [number, number]; // Fallback for invalid coordinates
  }).filter(pos => pos[0] !== 0 || pos[1] !== 0);

  return (
    <Polyline 
      positions={positions} 
      pathOptions={{ 
        color: '#2563EB', 
        weight: 4, 
        opacity: 0.8,
        dashArray: '8, 4'
      }} 
    />
  );
};

const MapController = ({ 
  center, 
  zoom, 
  mapOrientation, 
  bearing 
}: { 
  center: Coordinates; 
  zoom: number; 
  mapOrientation?: 'north' | 'driving';
  bearing?: number;
}) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView([center.lat, center.lng], zoom);
  }, [center, zoom, map]);
  
  useEffect(() => {
    if (mapOrientation === 'driving' && bearing !== undefined) {
      // Rotate map to driving direction using CSS transform on the leaflet container
      const mapPane = map.getPane('mapPane');
      if (mapPane) {
        mapPane.style.transform = `rotate(${-bearing}deg)`;
        mapPane.style.transformOrigin = 'center';
        mapPane.style.transition = 'transform 0.3s ease';
      }
    } else {
      // Reset to north-up orientation
      const mapPane = map.getPane('mapPane');
      if (mapPane) {
        mapPane.style.transform = 'rotate(0deg)';
        mapPane.style.transition = 'transform 0.3s ease';
      }
    }
  }, [mapOrientation, bearing, map]);
  
  return null;
};

const PopupController = ({ selectedPOI }: { selectedPOI: POI | null }) => {
  const map = useMap();
  
  useEffect(() => {
    if (!selectedPOI) {
      map.closePopup();
    }
  }, [selectedPOI, map]);
  
  return null;
};

// Map style configurations for different camping use cases
const MAP_STYLES = {
  outdoors: 'outdoors-v12',    // Best for camping - shows trails, terrain, elevation
  satellite: 'satellite-v9',   // Aerial view for campground layout
  streets: 'streets-v12',      // Urban navigation
  navigation: 'navigation-day-v1' // Optimized for turn-by-turn navigation
};

export const MapContainerComponent = ({
  center,
  zoom,
  currentPosition,
  pois,
  selectedPOI,
  route,
  filteredCategories,
  onPOIClick,
  onPOINavigate,
  onMapClick,
  mapOrientation = 'north',
  bearing = 0,
  mapStyle = 'outdoors',
}: MapContainerProps) => {
  const [gestureIndicator, setGestureIndicator] = useState<{
    isVisible: boolean;
    type: 'pinch-in' | 'pinch-out' | 'rotate' | null;
    intensity: number;
  }>({
    isVisible: false,
    type: null,
    intensity: 0
  });

  const handlePinchZoom = (scale: number) => {
    const intensity = Math.abs(scale - 1);
    setGestureIndicator({
      isVisible: true,
      type: scale > 1 ? 'pinch-out' : 'pinch-in',
      intensity: Math.min(intensity, 1)
    });

    setTimeout(() => {
      setGestureIndicator(prev => ({ ...prev, isVisible: false }));
    }, 100);
  };

  const handleDoubleTap = (latlng: any) => {
    console.log('Double tap zoom at:', latlng);
  };

  const handleLongPress = (latlng: any) => {
    console.log('Long press - add POI at:', latlng);
  };

  // Debug Mapbox token and style
  const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
  console.log('🗺️ Mapbox token available:', !!mapboxToken, 'Length:', mapboxToken?.length || 0);
  console.log('🗺️ Current map style:', mapStyle, 'URL style:', MAP_STYLES[mapStyle]);

  return (
    <div className="map-container relative">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        className="w-full h-full z-0"
        zoomControl={false}
        attributionControl={false}
      >
        <MapController 
          center={center} 
          zoom={zoom} 
          mapOrientation={mapOrientation}
          bearing={bearing}
        />
        <PopupController selectedPOI={selectedPOI} />
        
        <TileLayer
          key={mapStyle} // Force re-render when style changes
          url={import.meta.env.VITE_MAPBOX_ACCESS_TOKEN 
            ? `https://api.mapbox.com/styles/v1/mapbox/${MAP_STYLES[mapStyle]}/tiles/256/{z}/{x}/{y}@2x?access_token=${import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}`
            : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          }
          attribution={import.meta.env.VITE_MAPBOX_ACCESS_TOKEN 
            ? '&copy; <a href="https://www.mapbox.com/">Mapbox</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }
          maxZoom={19}
        />
        
        <GestureController
          onPinchZoom={handlePinchZoom}
          onDoubleTap={handleDoubleTap}
          onLongPress={handleLongPress}
          onSwipeLeft={() => console.log('Swipe left - next panel')}
          onSwipeRight={() => console.log('Swipe right - previous panel')}
          onSwipeUp={() => console.log('Swipe up - show details')}
          onSwipeDown={() => console.log('Swipe down - hide panels')}
        />
        
        <CurrentLocationMarker position={currentPosition} />
        
        {pois.map((poi) => (
          <POIMarker
            key={poi.id}
            poi={poi}
            isSelected={selectedPOI?.id === poi.id}
            onClick={() => onPOIClick(poi)}
            onNavigate={onPOINavigate}
          />
        ))}
        
        {route && <RoutePolyline route={route} />}
      </MapContainer>
      
      <ZoomGestureIndicator
        isVisible={gestureIndicator.isVisible}
        gestureType={gestureIndicator.type}
        intensity={gestureIndicator.intensity}
      />
    </div>
  );
};
