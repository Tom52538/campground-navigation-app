import { Volume2, VolumeX, Navigation, Car, Bike, PersonStanding } from 'lucide-react';
import { MapStyleToggle } from './MapStyleToggle';
import { Button } from '@/components/ui/button';

interface EnhancedMapControlsProps {
  onToggleVoice: () => void;
  onMapStyleChange: (style: 'outdoors' | 'satellite' | 'streets' | 'navigation') => void;
  onTravelModeChange: (mode: 'car' | 'bike' | 'pedestrian') => void;
  isVoiceEnabled: boolean;
  mapStyle: 'outdoors' | 'satellite' | 'streets' | 'navigation';
  travelMode: 'car' | 'bike' | 'pedestrian';
  useRealGPS?: boolean;
  onToggleGPS?: () => void;
}

export const EnhancedMapControls = ({
  onToggleVoice,
  onMapStyleChange,
  onTravelModeChange,
  isVoiceEnabled,
  mapStyle,
  travelMode,
  useRealGPS = false,
  onToggleGPS
}: EnhancedMapControlsProps) => {
  
  const transportButtons = [
    { icon: <Car className="w-6 h-6" />, id: 'car' },
    { icon: <Bike className="w-6 h-6" />, id: 'bike' },
    { icon: <PersonStanding className="w-6 h-6" />, id: 'pedestrian' }
  ];

  return (
    <div
      className="function-sidebar"
      style={{
        position: 'absolute',
        right: '16px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '60px',
        height: '320px',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '12px 0',
        gap: '12px'
      }}
    >
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

      {/* GPS Toggle */}
      {onToggleGPS && (
        <div className="relative">
          <button
            onClick={onToggleGPS}
            className={`
              w-12 h-12 rounded-full backdrop-blur-md border border-white/20 
              transition-all duration-300 hover:scale-105 active:scale-95
              shadow-lg hover:shadow-xl flex items-center justify-center
              ${useRealGPS 
                ? 'bg-green-500/90 hover:bg-green-600/90 text-white' 
                : 'bg-gray-500/90 hover:bg-gray-600/90 text-white'
              }
            `}
            title={useRealGPS ? 'Live GPS aktiv' : 'Mock GPS aktiv'}
          >
            <Navigation className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Divider */}
      <div
        className="category-divider"
        style={{
          height: '1px',
          margin: '12px 8px',
          width: '80%',
          background: 'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.3), transparent)',
        }}
      />

      {/* Transport Modes */}
      {transportButtons.map((btn) => (
        <button
          key={btn.id}
          onClick={() => onTravelModeChange(btn.id as 'car' | 'bike' | 'pedestrian')}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none
            ${travelMode === btn.id ? 'bg-blue-500/90 text-white' : 'bg-white/20 text-white/80'}
            hover:scale-110 active:scale-95`}
        >
          {btn.icon}
        </button>
      ))}
    </div>
  );
};