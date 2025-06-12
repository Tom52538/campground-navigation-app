import { Marker, Popup } from 'react-leaflet';
import { divIcon } from 'leaflet';
import { POI, POI_CATEGORIES } from '@/types/navigation';
import { Utensils, Building2, Waves, Car, MapPin } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';

interface POIMarkerProps {
  poi: POI;
  isSelected: boolean;
  onClick: () => void;
}

const getIconComponent = (iconName: string) => {
  const iconProps = { size: 16, color: 'white' };
  switch (iconName) {
    case 'Utensils': return <Utensils {...iconProps} />;
    case 'Building2': return <Building2 {...iconProps} />;
    case 'Waves': return <Waves {...iconProps} />;
    case 'Car': return <Car {...iconProps} />;
    default: return <MapPin {...iconProps} />;
  }
};

export const POIMarker = ({ poi, isSelected, onClick }: POIMarkerProps) => {
  const category = POI_CATEGORIES[poi.category as keyof typeof POI_CATEGORIES];
  const iconName = category?.icon || 'MapPin';
  const colorClass = category?.color || 'bg-gray-500';

  const iconSvg = renderToStaticMarkup(getIconComponent(iconName));

  const markerIcon = divIcon({
    html: `
      <div class="poi-marker-wrapper">
        <div class="w-8 h-8 rounded-full ${colorClass} border-2 border-white shadow-lg flex items-center justify-center ${isSelected ? 'ring-2 ring-blue-400 animate-pulse' : ''}">
          ${iconSvg}
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
    >
      <Popup>
        <div className="p-2">
          <h3 className="font-semibold text-gray-800 mb-1">{poi.name}</h3>
          <p className="text-sm text-gray-600 mb-2">{category?.label || poi.category}</p>
          {poi.distance && (
            <p className="text-xs text-gray-500">{poi.distance} away</p>
          )}
        </div>
      </Popup>
    </Marker>
  );
};
