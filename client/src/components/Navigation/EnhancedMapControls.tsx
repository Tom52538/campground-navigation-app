import { useCallback } from 'react';

interface EnhancedMapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onCenterOnLocation: () => void;
  useRealGPS: boolean;
  onToggleGPS: () => void;
}

export const EnhancedMapControls = ({
  onZoomIn,
  onZoomOut,
  onCenterOnLocation,
  useRealGPS,
  onToggleGPS
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
    <div className="absolute right-4 top-32 bottom-32 z-20 flex flex-col justify-center space-y-3">
      {/* Compass */}
      <div 
        className="w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          minWidth: '48px',
          minHeight: '48px'
        }}
        onClick={onCenterOnLocation}
      >
        <div 
          className="font-bold text-lg"
          style={{
            color: '#ea580c',
            textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'
          }}
        >
          N
        </div>
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

      {/* GPS Button */}
      <button 
        onClick={handleGPSToggle}
        className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
        style={{
          background: useRealGPS 
            ? 'rgba(34, 197, 94, 0.9)' 
            : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          color: useRealGPS ? '#ffffff' : '#374151',
          textShadow: useRealGPS 
            ? '0 1px 2px rgba(0, 0, 0, 0.3)' 
            : '0 1px 2px rgba(255, 255, 255, 0.8)',
          minWidth: '48px',
          minHeight: '48px'
        }}
        title={useRealGPS ? 'Using Real GPS' : 'Using Test Location'}
      >
        <span className="text-lg">📍</span>
      </button>
    </div>
  );
};