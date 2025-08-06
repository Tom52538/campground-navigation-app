import { useState, useMemo } from 'react';
import { Marker } from 'react-leaflet';
import { divIcon } from 'leaflet';
import { POI, POI_CATEGORIES } from '@/types/navigation';

interface POIMarkerProps {
  poi: POI;
  isSelected: boolean;
  onClick: () => void;
  onNavigate?: (poi: POI) => void;
  showHoverTooltip?: boolean;
}

const getEmojiForCategory = (category: string): string => {
    switch (category) {
      case 'food-drink': return '🍽️';
      case 'services': return '🛠️';
      case 'toilets': return '🚻';
      case 'parking': return '🅿️';
      case 'bungalows': return '🏡';
      case 'chalets': return '🏔️';
      case 'lodges': return '⭐';
      case 'camping': return '🏕️';
      case 'beach_houses': return '🏖️';
      case 'facilities': return '🚿';
      case 'leisure': return '🛝';
      default: return '📍';
    }
  };

export const POIMarker = ({ poi, isSelected, onClick, onNavigate, showHoverTooltip = true }: POIMarkerProps) => {
  const [showTooltip, setShowTooltip] = useState(false);

  // Enhanced debug logging
  console.log(`🔍 POIMarker RENDER START:`, {
    name: poi.name,
    id: poi.id,
    coordinates: poi.coordinates,
    category: poi.category,
    isSelected
  });

  const category = POI_CATEGORIES[poi.category as keyof typeof POI_CATEGORIES];
  const iconName = category?.icon || 'MapPin';
  const colorClass = category?.color || 'bg-gray-500';
  const emoji = getEmojiForCategory(poi.category); // Changed this to use the new function directly

  console.log(`🔍 POIMarker ICON DATA:`, {
    category: poi.category,
    iconName,
    colorClass,
    emoji,
    categoryExists: !!category
  });

  const markerIcon = useMemo(() => {
    const icon = divIcon({
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

    console.log(`🔍 POIMarker ICON CREATED for ${poi.name}`);
    return icon;
  }, [poi.category, colorClass, emoji, isSelected, poi.name]);

  const eventHandlers = useMemo(() => ({
    click: () => {
      console.log(`🔍 POIMarker CLICKED: ${poi.name}`);
      onClick();
    },
    ...(showHoverTooltip && {
      mouseover: (e: any) => {
        console.log(`🔍 POIMarker HOVER: ${poi.name}`);
        const marker = e.target;
        const tooltipContent = `
          <div style="font-family: system-ui; font-size: 12px; line-height: 1.4; padding: 6px 8px;">
            <div style="font-weight: 600; color: #1f2937; margin-bottom: 4px;">${poi.name}</div>
            <div style="color: #6b7280; margin-bottom: 2px; text-transform: capitalize;">${poi.category}</div>
            ${poi.description ? `<div style="color: #6b7280; font-size: 11px; margin-bottom: 4px;">${poi.description}</div>` : ''}
            ${poi.distance ? `<div style="color: #059669; font-weight: 500; font-size: 11px;">📍 ${poi.distance}</div>` : ''}
          </div>
        `;

        marker.bindTooltip(tooltipContent, {
          permanent: false,
          direction: 'top',
          offset: [0, -10],
          className: 'custom-poi-tooltip',
          opacity: 0.95
        }).openTooltip();
      },
      mouseout: (e: any) => {
        const marker = e.target;
        marker.closeTooltip();
      }
    })
  }), [poi.name, poi.category, poi.description, poi.distance, onClick, showHoverTooltip]);

  console.log(`🔍 POIMarker RENDER COMPLETE: ${poi.name}`);

  return (
    <Marker 
      position={[poi.coordinates.lat, poi.coordinates.lng]} 
      icon={markerIcon}
      eventHandlers={eventHandlers}
    />
  );
};