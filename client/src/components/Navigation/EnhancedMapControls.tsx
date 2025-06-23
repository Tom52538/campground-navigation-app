import { useCallback } from 'react';
import { Navigation as NavigationIcon } from 'lucide-react';

interface EnhancedMapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onCenterOnLocation: () => void;
  useRealGPS: boolean;
  onToggleGPS: () => void;
  mapOrientation: 'north' | 'driving';
  onToggleOrientation: () => void;
  mapStyle: 'outdoors' | 'satellite' | 'streets' | 'navigation';
  onMapStyleChange: (style: 'outdoors' | 'satellite' | 'streets' | 'navigation') => void;
}

export const EnhancedMapControls = ({
  onZoomIn,
  onZoomOut,
  onCenterOnLocation,
  useRealGPS,
  onToggleGPS,
  mapOrientation,
  onToggleOrientation
}: EnhancedMapControlsProps) => {
  
  const handleZoomIn = useCallback(() => {
    onZoomIn();
  }, [onZoomIn]);

  const handleZoomOut = useCallback(() => {
    onZoomOut();
  }, [onZoomOut]);

  const handleGPSToggle = useCallback(() => {
    onToggleGPS();
    onCenterOnLocation();
  }, [onToggleGPS, onCenterOnLocation]);

  return (
    <div className="absolute right-4 z-20 flex flex-col justify-center space-y-3" style={{ top: '50%', transform: 'translateY(-50%)' }}>
      {/* Orientation Toggle - North/Driving Direction */}
      <div 
        className="w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95"
        style={{
          background: mapOrientation === 'north' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(59, 130, 246, 0.8)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          minWidth: '48px',
          minHeight: '48px'
        }}
        onClick={onToggleOrientation}
        title={mapOrientation === 'north' ? 'Switch to Driving Direction' : 'Switch to North Up'}
      >
        {mapOrientation === 'north' ? (
          <div 
            className="font-bold text-lg"
            style={{
              color: '#ea580c',
              textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'
            }}
          >
            N
          </div>
        ) : (
          <NavigationIcon className="w-5 h-5 text-white" />
        )}
      </div>

      {/* Zoom Controls */}
      <div 
        className="flex flex-col rounded-full overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}
      >
        <button 
          onClick={handleZoomIn}
          className="w-12 h-12 flex items-center justify-center text-xl font-bold transition-all duration-200 hover:bg-white/20 active:bg-white/40"
          style={{
            color: '#374151',
            textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)',
            minWidth: '48px',
            minHeight: '48px'
          }}
        >
          +
        </button>
        <div 
          className="h-px"
          style={{ background: 'rgba(156, 163, 175, 0.3)' }}
        ></div>
        <button 
          onClick={handleZoomOut}
          className="w-12 h-12 flex items-center justify-center text-xl font-bold transition-all duration-200 hover:bg-white/20 active:bg-white/40"
          style={{
            color: '#374151',
            textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)',
            minWidth: '48px',
            minHeight: '48px'
          }}
        >
          −
        </button>
      </div>

      {/* GPS Testing Controls */}
      <div 
        className="flex flex-col rounded-full overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}
      >
        <button 
          onClick={handleGPSToggle}
          className="w-12 h-8 flex items-center justify-center text-xs font-medium transition-all duration-200 hover:bg-white/20 active:bg-white/40"
          style={{
            background: useRealGPS ? 'rgba(34, 197, 94, 0.9)' : 'transparent',
            color: useRealGPS ? '#ffffff' : '#374151',
            textShadow: useRealGPS 
              ? '0 1px 2px rgba(0, 0, 0, 0.3)' 
              : '0 1px 2px rgba(255, 255, 255, 0.8)',
            minWidth: '48px',
            minHeight: '32px'
          }}
          title="Toggle to Real GPS"
        >
          Real
        </button>
        <div 
          className="h-px"
          style={{ background: 'rgba(156, 163, 175, 0.3)' }}
        ></div>
        <button 
          onClick={handleGPSToggle}
          className="w-12 h-8 flex items-center justify-center text-xs font-medium transition-all duration-200 hover:bg-white/20 active:bg-white/40"
          style={{
            background: !useRealGPS ? 'rgba(59, 130, 246, 0.9)' : 'transparent',
            color: !useRealGPS ? '#ffffff' : '#374151',
            textShadow: !useRealGPS 
              ? '0 1px 2px rgba(0, 0, 0, 0.3)' 
              : '0 1px 2px rgba(255, 255, 255, 0.8)',
            minWidth: '48px',
            minHeight: '32px'
          }}
          title="Toggle to Mock GPS"
        >
          Mock
        </button>
      </div>
    </div>
  );
};