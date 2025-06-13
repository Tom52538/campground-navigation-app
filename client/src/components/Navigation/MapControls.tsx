import { useState, useEffect } from 'react';
import { Plus, Minus, Crosshair, Navigation as NavigationIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GPSToggle } from './GPSToggle';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onCenterOnLocation: () => void;
  useRealGPS: boolean;
  onToggleGPS: () => void;
}

interface CompassProps {
  heading: number;
}

const CompassIcon = ({ heading }: CompassProps) => (
  <div className="relative w-8 h-8">
    <div className="absolute inset-0 rounded-full border-2 border-gray-400"></div>
    <div 
      className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0 h-0 border-l-2 border-r-2 border-b-4 border-l-transparent border-r-transparent border-b-red-600 transition-transform duration-200"
      style={{ transform: `translate(-50%, -50%) rotate(${heading}deg)` }}
    ></div>
    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 text-xs font-bold text-red-600">
      N
    </div>
  </div>
);

export const MapControls = ({ onZoomIn, onZoomOut, onCenterOnLocation, useRealGPS, onToggleGPS }: MapControlsProps) => {
  const [heading, setHeading] = useState(0);

  useEffect(() => {
    if ('DeviceOrientationEvent' in window) {
      const handleOrientation = (event: DeviceOrientationEvent) => {
        const alpha = event.alpha;
        if (alpha !== null) {
          setHeading(360 - alpha);
        }
      };

      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        (DeviceOrientationEvent as any).requestPermission()
          .then((response: string) => {
            if (response === 'granted') {
              window.addEventListener('deviceorientation', handleOrientation);
            }
          })
          .catch(() => {});
      } else {
        window.addEventListener('deviceorientation', handleOrientation);
      }

      return () => {
        window.removeEventListener('deviceorientation', handleOrientation as any);
      };
    }
  }, []);

  return (
    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 flex flex-col space-y-2">
      {/* Transparent Compass - 44px */}
      <div 
        className="relative flex items-center justify-center"
        style={{
          width: '44px',
          height: '44px',
          background: 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          borderRadius: '50%',
          marginBottom: '8px'
        }}
      >
        <div 
          className="relative w-6 h-6 transition-transform duration-500 ease-out"
          style={{ transform: `rotate(${heading}deg)` }}
        >
          <div className="absolute inset-0 rounded-full border border-orange-400/60"></div>
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l border-r border-b-2 border-l-transparent border-r-transparent border-b-orange-600"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0.5 h-0.5 bg-orange-600 rounded-full"></div>
        </div>
        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 text-xs font-bold text-orange-600">N</div>
      </div>

      {/* Transparent Zoom In Button */}
      <button 
        onClick={onZoomIn}
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          borderRadius: '50%',
          width: '44px',
          height: '44px',
          color: '#000000',
          fontWeight: '600',
          fontSize: '18px',
          marginBottom: '8px',
          textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        +
      </button>
      
      {/* Transparent Zoom Out Button */}
      <button 
        onClick={onZoomOut}
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          borderRadius: '50%',
          width: '44px',
          height: '44px',
          color: '#000000',
          fontWeight: '600',
          fontSize: '18px',
          marginBottom: '8px',
          textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        −
      </button>
      
      {/* Transparent Location Button */}
      <button 
        onClick={onCenterOnLocation}
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          borderRadius: '50%',
          width: '44px',
          height: '44px',
          color: '#000000',
          fontWeight: '600',
          fontSize: '16px',
          marginBottom: '8px',
          textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        📍
      </button>

      {/* Transparent GPS Toggle Button */}
      <button 
        onClick={onToggleGPS}
        title={useRealGPS ? 'Real GPS Active' : 'Demo Mode'}
        style={{
          background: useRealGPS ? 'rgba(16, 185, 129, 0.8)' : 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          borderRadius: '50%',
          width: '44px',
          height: '44px',
          color: useRealGPS ? '#ffffff' : '#000000',
          fontWeight: '600',
          fontSize: '16px',
          textShadow: useRealGPS ? 'none' : '0 1px 2px rgba(255, 255, 255, 0.8)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        🧭
      </button>
    </div>
  );
};
