import { Marker } from 'react-leaflet';
import { divIcon } from 'leaflet';
import { POI, POI_CATEGORIES } from '@/types/navigation';

interface POIMarkerProps {
  poi: POI;
  isSelected: boolean;
  onClick: () => void;
  onNavigate?: (poi: POI) => void;
}

const getEmojiIcon = (iconName: string) => {
  switch (iconName) {
    case 'Utensils': return '🍽️';
    case 'Building2': return '🏢';
    case 'Waves': return '🌊';
    case 'Car': return '🚗';
    default: return '📍';
  }
};

export const POIMarker = ({ poi, isSelected, onClick, onNavigate }: POIMarkerProps) => {
  const category = POI_CATEGORIES[poi.category as keyof typeof POI_CATEGORIES];
  const iconName = category?.icon || 'MapPin';
  const colorClass = category?.color || 'bg-gray-500';
  const emoji = getEmojiIcon(iconName);

  const markerIcon = divIcon({
    html: `
      <div class="poi-marker-wrapper" style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
        <div class="w-8 h-8 rounded-full ${colorClass} border-2 border-white shadow-lg flex items-center justify-center ${isSelected ? 'animate-pulse' : ''}" style="display: flex; align-items: center; justify-content: center; position: relative; z-index: 1000;">
          <span style="font-size: 16px; line-height: 1;">${emoji}</span>
        </div>
      </div>
    `,
    className: 'poi-marker-container',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  return (
    <Marker 
      position={[poi.coordinates.lat, poi.coordinates.lng]} 
      icon={markerIcon}
      eventHandlers={{
        click: onClick,
      }}
    />
  );
};
