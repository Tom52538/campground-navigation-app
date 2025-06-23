import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { divIcon } from 'leaflet';
import L from 'leaflet';
import { POI } from '@/shared/schema';
import { Coordinates } from '@/types';
import { formatDistance } from '@/lib/utils';
import { useEffect, useState, useMemo } from 'react';
import { useEnvironment } from '@/hooks/useEnvironment';
import { cn } from '@/lib/utils';
import React from 'react';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
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
  route: any | null;
  filteredCategories: string[];
  onPOIClick: (poi: POI) => void;
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

// POI Category Colors
const POI_COLORS: Record<string, string> = {
  'food-drink': '#FF6B6B',
  'accommodation': '#4ECDC4', 
  'recreation': '#45B7D1',
  'services': '#96CEB4',
  'facilities': '#FFEAA7',
  'transportation': '#DDA0DD',
  'shopping': '#FF7F50',
  'default': '#6C5CE7'
};

const POIMarker = ({ 
  poi, 
  currentPosition, 
  isSelected, 
  isFiltered, 
  onClick 
}: { 
  poi: POI; 
  currentPosition: Coordinates; 
  isSelected: boolean;
  isFiltered: boolean;
  onClick: () => void;
}) => {
  const distance = useMemo(() => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (poi.lat - currentPosition.lat) * Math.PI / 180;
    const dLon = (poi.lng - currentPosition.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(currentPosition.lat * Math.PI / 180) * Math.cos(poi.lat * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c * 1000; // Distance in meters
  }, [poi.lat, poi.lng, currentPosition.lat, currentPosition.lng]);

  const color = POI_COLORS[poi.category] || POI_COLORS.default;
  const size = isSelected ? 20 : 16;
  const opacity = isFiltered ? 1 : 0.3;

  const poiIcon = divIcon({
    html: `
      <div class="relative transform transition-all duration-200 ${isSelected ? 'scale-125' : ''}">
        <div 
          class="rounded-full shadow-lg border-2 border-white backdrop-blur-sm"
          style="background-color: ${color}; width: ${size}px; height: ${size}px; opacity: ${opacity};"
        ></div>
        ${isSelected ? `
          <div class="absolute inset-0 rounded-full animate-ping" style="background-color: ${color}; opacity: 0.5;"></div>
        ` : ''}
      </div>
    `,
    className: 'poi-marker',
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
  });

  return (
    <Marker 
      position={[poi.lat, poi.lng]} 
      icon={poiIcon}
      eventHandlers={{
        click: onClick
      }}
    >
      <Popup>
        <div className="min-w-[200px]">
          <h3 className="font-semibold text-lg mb-1">{poi.name}</h3>
          <p className="text-sm text-gray-600 mb-2 capitalize">{poi.category}</p>
          {poi.description && (
            <p className="text-sm mb-2">{poi.description}</p>
          )}
          <p className="text-xs text-gray-500">
            {formatDistance(distance)} away
          </p>
        </div>
      </Popup>
    </Marker>
  );
};

// Mapbox style mappings
const MAP_STYLES = {
  outdoors: 'outdoors-v12',
  satellite: 'satellite-v9', 
  streets: 'streets-v12',
  navigation: 'navigation-day-v1'
};

// Smart TileLayer with Mapbox and fallback support
const SmartTileLayer = ({ 
  mapStyle, 
  mapboxToken 
}: { 
  mapStyle: 'outdoors' | 'satellite' | 'streets' | 'navigation';
  mapboxToken?: string;
}) => {
  const [tileLoadError, setTileLoadError] = useState(false);

  // Use Mapbox if token is available and valid
  const useMapbox = !!(mapboxToken && mapboxToken.startsWith('pk.') && !tileLoadError);

  const mapboxUrl = mapboxToken 
    ? `https://api.mapbox.com/styles/v1/mapbox/${MAP_STYLES[mapStyle]}/tiles/256/{z}/{x}/{y}@2x?access_token=${mapboxToken}`
    : null;
  
  // Fallback to OpenStreetMap
  const fallbackUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const finalUrl = useMapbox && mapboxUrl ? mapboxUrl : fallbackUrl;

  console.log('🗺️ DEBUG - Direct TileLayer loading for:', mapStyle);

  return (
    <TileLayer
      url={finalUrl}
      attribution={
        useMapbox 
          ? '© Mapbox © OpenStreetMap'
          : '© OpenStreetMap contributors'
      }
      maxZoom={19}
      onLoad={() => {
        console.log('🗺️ DEBUG - Direct TileLayer loaded successfully for:', mapStyle);
      }}
    />
  );
};

// Map controller for center and zoom updates
const MapController = ({ 
  center, 
  zoom, 
  orientation,
  bearing = 0
}: { 
  center: Coordinates; 
  zoom: number; 
  orientation?: 'north' | 'driving';
  bearing?: number;
}) => {
  const map = useMap();
  
  useEffect(() => {
    if (map && center) {
      // Check if this is a significant position change to determine animation
      const currentCenter = map.getCenter();
      const distance = currentCenter.distanceTo(L.latLng(center.lat, center.lng));
      
      map.setView([center.lat, center.lng], zoom, { 
        animate: distance > 50, // Only animate if moving more than 50 meters
        duration: 0.3 // Short animation to reduce flickering
      });
    }
  }, [center, zoom, map]);

  // Handle orientation changes
  useEffect(() => {
    if (map) {
      if (orientation === 'driving' && bearing !== undefined) {
        console.log('🧭 MapController: Orientation change -', orientation, 'bearing:', bearing);
        map.setBearing(bearing);
      } else {
        console.log('🧭 Map reset to north-up');
        map.setBearing(0);
      }
    }
  }, [map, orientation, bearing]);

  return null;
};

// Map click handler
const MapClickHandler = ({ onClick }: { onClick: () => void }) => {
  const map = useMap();
  
  useEffect(() => {
    if (map) {
      map.on('click', onClick);
      return () => {
        map.off('click', onClick);
      };
    }
  }, [map, onClick]);

  return null;
};

export function MapContainerComponent({
  center,
  zoom,
  currentPosition,
  pois,
  selectedPOI,
  route,
  filteredCategories,
  onPOIClick,
  onMapClick,
  mapOrientation = 'north',
  bearing = 0,
  mapStyle = 'outdoors'
}: MapContainerProps) {
  const environment = useEnvironment();
  const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

  console.log('🗺️ DEBUG - Environment:', {
    mode: environment.mode,
    dev: environment.isDev,
    prod: environment.isProd
  });

  console.log('🗺️ DEBUG - Mapbox token:', {
    exists: !!mapboxToken,
    length: mapboxToken?.length || 0,
    firstChars: mapboxToken?.substring(0, 7) || 'none',
    isValid: mapboxToken?.startsWith('pk.') || false,
    fullToken: mapboxToken
  });

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  console.log('🗺️ DEBUG - Map style config:', {
    currentStyle: mapStyle,
    mapboxStyle: MAP_STYLES[mapStyle],
    allStyles: MAP_STYLES,
    isMobile
  });

  const mapboxUrl = mapboxToken 
    ? `https://api.mapbox.com/styles/v1/mapbox/${MAP_STYLES[mapStyle]}/tiles/256/{z}/{x}/{y}@2x?access_token=${mapboxToken}`
    : null;

  console.log('🗺️ DEBUG - Using Mapbox URL:', mapboxUrl?.substring(0, 100) + '...');

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full"
        zoomControl={false}
      >
        <SmartTileLayer mapStyle={mapStyle} mapboxToken={mapboxToken} />
        
        <MapController 
          center={center} 
          zoom={zoom} 
          orientation={mapOrientation}
          bearing={bearing}
        />

        {/* Current position marker */}
        <CurrentLocationMarker position={currentPosition} />

        {/* POI markers */}
        {pois.map((poi) => (
          <POIMarker
            key={poi.id}
            poi={poi}
            currentPosition={currentPosition}
            isSelected={selectedPOI?.id === poi.id}
            isFiltered={filteredCategories.length === 0 || filteredCategories.includes(poi.category)}
            onClick={() => onPOIClick(poi)}
          />
        ))}

        <MapClickHandler onClick={onMapClick} />
      </MapContainer>
    </div>
  );
}