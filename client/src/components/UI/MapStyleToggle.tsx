import React from 'react';
import { Map, Satellite, Navigation, StreetView } from 'lucide-react';
import { MapStyle } from '@/types';

interface MapStyleToggleProps {
  currentStyle: MapStyle;
  onStyleChange: (style: MapStyle) => void;
}

const STYLE_CONFIG: Record<MapStyle, { icon: React.ReactNode; label: string }> = {
  outdoors: { icon: <Map className="w-4 h-4" />, label: 'Outdoor' },
  satellite: { icon: <Satellite className="w-4 h-4" />, label: 'Satellit' },
  streets: { icon: <StreetView className="w-4 h-4" />, label: 'Straßen' },
  navigation: { icon: <Navigation className="w-4 h-4" />, label: 'Navigation' }
};

export function MapStyleToggle({ currentStyle, onStyleChange }: MapStyleToggleProps) {
  const styles = Object.keys(STYLE_CONFIG) as MapStyle[];

  return (
    <div className="bg-white/90 backdrop-blur-md border border-white/20 rounded-xl shadow-lg overflow-hidden">
      {styles.map((style) => (
        <button
          key={style}
          onClick={() => onStyleChange(style)}
          className={`
            w-full px-3 py-2 text-sm font-medium transition-all duration-200 flex items-center gap-2
            ${currentStyle === style 
              ? 'bg-blue-500 text-white' 
              : 'text-gray-600 hover:bg-white/50'
            }
          `}
        >
          {STYLE_CONFIG[style].icon}
          {STYLE_CONFIG[style].label}
        </button>
      ))}
    </div>
  );
}