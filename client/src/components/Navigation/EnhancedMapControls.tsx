import { Volume2, VolumeX } from 'lucide-react';
import { MapStyleToggle } from './MapStyleToggle';

interface EnhancedMapControlsProps {
  onToggleVoice: () => void;
  onMapStyleChange: (style: 'outdoors' | 'satellite' | 'streets' | 'navigation') => void;
  isVoiceEnabled: boolean;
  mapStyle: 'outdoors' | 'satellite' | 'streets' | 'navigation';
  useRealGPS?: boolean;
  onToggleGPS?: () => void;
}

export const EnhancedMapControls = ({
  onToggleVoice,
  onMapStyleChange,
  isVoiceEnabled,
  mapStyle,
  useRealGPS = false,
  onToggleGPS
}: EnhancedMapControlsProps) => {
  
  return (
    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 flex flex-col space-y-3">
      {/* Map Style Toggle */}
      <MapStyleToggle 
        currentStyle={mapStyle}
        onStyleChange={onMapStyleChange}
      />

      {/* Voice Toggle */}
      <div className="relative">
        <button
          onClick={onToggleVoice}
          className={`
            w-12 h-12 rounded-full backdrop-blur-md border border-white/20 
            transition-all duration-300 hover:scale-105 active:scale-95
            shadow-lg hover:shadow-xl flex items-center justify-center
            ${isVoiceEnabled 
              ? 'bg-green-500/90 hover:bg-green-600/90 text-white' 
              : 'bg-gray-500/90 hover:bg-gray-600/90 text-white'
            }
          `}
          title={isVoiceEnabled ? 'Sprachansagen deaktivieren' : 'Sprachansagen aktivieren'}
        >
          {isVoiceEnabled ? (
            <Volume2 className="w-5 h-5" />
          ) : (
            <VolumeX className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
};