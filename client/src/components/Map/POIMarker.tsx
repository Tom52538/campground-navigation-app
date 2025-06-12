import { Marker, Popup } from 'react-leaflet';
import { divIcon } from 'leaflet';
import { POI, POI_CATEGORIES } from '@/types/navigation';

interface POIMarkerProps {
  poi: POI;
  isSelected: boolean;
  onClick: () => void;
}

export const POIMarker = ({ poi, isSelected, onClick }: POIMarkerProps) => {
  const category = POI_CATEGORIES[poi.category as keyof typeof POI_CATEGORIES];
  const iconClass = category?.icon || 'fas fa-map-marker-alt';
  const colorClass = category?.color || 'bg-gray-500';

  const markerIcon = divIcon({
    html: `
      <div class="poi-marker ${colorClass} ${isSelected ? 'pulse' : ''}" onclick="this.dispatchEvent(new CustomEvent('poi-click'))">
        <i class="${iconClass}"></i>
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
