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
    <>
      {/* Shadow/Glow Base */}
      <Polyline 
        positions={positions} 
        pathOptions={{ 
          color: '#000000', 
          weight: 10, 
          opacity: 0.3,
          lineCap: 'round',
          lineJoin: 'round'
        }} 
      />
      {/* Main Route with Custom Class */}
      <Polyline 
        positions={positions} 
        pathOptions={{ 
          color: '#ffffff', // This will be overridden by CSS
          weight: 6, 
          opacity: 1,
          lineCap: 'round',
          lineJoin: 'round',
          className: 'premium-route-line'
        }} 
      />
      {/* Animated Pulse Overlay */}
      <Polyline 
        positions={positions} 
        pathOptions={{ 
          color: '#60a5fa', 
          weight: 3, 
          opacity: 0.8,
          lineCap: 'round',
          lineJoin: 'round',
          dashArray: '20, 10',
          className: 'route-pulse-animation'
        }} 
      />
    </>
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
    if (map) {
      console.log('🧭 MapController: Orientation change -', mapOrientation, 'bearing:', bearing);
      
      // Get the map container element
      const mapContainer = map.getContainer();
      const mapPane = map.getPane('mapPane');
      
      if (mapOrientation === 'driving' && bearing !== undefined) {
        // Apply rotation to the entire map container for smooth rotation
        if (mapContainer) {
          mapContainer.style.transform = `rotate(${-bearing}deg)`;
          mapContainer.style.transformOrigin = 'center';
          mapContainer.style.transition = 'transform 0.5s ease-out';
          console.log('🧭 Map rotated to bearing:', bearing);
        }
        // Also apply to mapPane as backup
        if (mapPane) {
          mapPane.style.transform = `rotate(${-bearing}deg)`;
          mapPane.style.transformOrigin = 'center';
          mapPane.style.transition = 'transform 0.5s ease-out';
        }
      } else {
        // Reset to north-up orientation
        if (mapContainer) {
          mapContainer.style.transform = 'rotate(0deg)';
          mapContainer.style.transition = 'transform 0.5s ease-out';
          console.log('🧭 Map reset to north-up');
        }
        if (mapPane) {
          mapPane.style.transform = 'rotate(0deg)';
          mapPane.style.transition = 'transform 0.5s ease-out';
        }
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

// Map style configurations - Railway-optimized with fallbacks
const MAP_STYLES = {
  outdoors: 'outdoors-v12',     // Best for camping - shows trails, terrain, elevation
  satellite: 'satellite-v9',    // Aerial view for campground layout  
  streets: 'streets-v12',       // Urban navigation
  navigation: 'navigation-preview-day-v4'  // Railway-compatible navigation style
};

// Fallback URLs for when Mapbox fails on mobile/Railway
const FALLBACK_TILES = {
  outdoors: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
  satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  streets: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  navigation: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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

  // Enhanced debugging for Railway deployment issues
  const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
  console.log('🗺️ DEBUG - Environment:', {
    nodeEnv: import.meta.env.NODE_ENV,
    mode: import.meta.env.MODE,
    dev: import.meta.env.DEV,
    prod: import.meta.env.PROD
  });
  console.log('🗺️ DEBUG - Mapbox token:', {
    exists: !!mapboxToken,
    length: mapboxToken?.length || 0,
    firstChars: mapboxToken?.substring(0, 8) || 'none',
    isValid: mapboxToken?.startsWith('pk.') || false
  });
  console.log('🗺️ DEBUG - Map style config:', {
    currentStyle: mapStyle,
    mapboxStyle: MAP_STYLES[mapStyle],
    allStyles: MAP_STYLES,
    isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  });

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
          key={`mapbox-${mapStyle}-${MAP_STYLES[mapStyle]}-${import.meta.env.MODE}`}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://www.mapbox.com/">Mapbox</a>'
          url={
            import.meta.env.VITE_MAPBOX_ACCESS_TOKEN 
              ? `https://api.mapbox.com/styles/v1/mapbox/${MAP_STYLES[mapStyle]}/tiles/256/{z}/{x}/{y}@2x?access_token=${import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}`
              : mapStyle === 'satellite' 
                ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          }
          maxZoom={19}
          eventHandlers={{
            loading: () => {
              console.log('🗺️ Railway Tiles loading:', mapStyle, 'Style:', MAP_STYLES[mapStyle], 'Environment:', import.meta.env.MODE);
            },
            load: () => {
              console.log('🗺️ Railway Tiles loaded successfully:', mapStyle, 'Visual change should be visible now');
            },
            tileerror: (e) => {
              console.error('🗺️ Railway Tile error for', mapStyle, '- fallback may be needed:', e);
            }
          }}
        />
        
        {/* SVG Gradient Definition for Route */}
        <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}>
          <defs>
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%" gradientUnits="objectBoundingBox">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="30%" stopColor="#1d4ed8" />
              <stop offset="70%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#60a5fa" />
            </linearGradient>
          </defs>
        </svg>
        

        
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
            showHoverTooltip={true}
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
