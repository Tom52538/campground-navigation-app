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
    <div className="absolute right-4 bottom-32 z-20 flex flex-col space-y-3">
      {/* Beautiful Camping Compass */}
      <div className="relative w-14 h-14 bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-white/20 flex items-center justify-center">
        <div 
          className="relative w-10 h-10 transition-transform duration-500 ease-out"
          style={{ transform: `rotate(${heading}deg)` }}
        >
          <div className="absolute inset-0 rounded-full border-2 border-orange-300/60"></div>
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-b-4 border-l-transparent border-r-transparent border-b-orange-600"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-orange-600 rounded-full"></div>
        </div>
        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 text-xs font-bold text-orange-600">N</div>
      </div>

      {/* Floating Zoom Controls */}
      <div className="bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-white/20 overflow-hidden">
        <Button
          variant="ghost"
          size="sm"
          className="w-11 h-11 p-0 rounded-t-full hover:bg-green-50/80 transition-all duration-200"
          onClick={onZoomIn}
        >
          <Plus className="w-4 h-4 text-green-700" />
        </Button>
        <div className="h-px bg-gray-200/50"></div>
        <Button
          variant="ghost"
          size="sm"
          className="w-11 h-11 p-0 rounded-b-full hover:bg-green-50/80 transition-all duration-200"
          onClick={onZoomOut}
        >
          <Minus className="w-4 h-4 text-green-700" />
        </Button>
      </div>
      
      {/* Location Button */}
      <Button
        variant="ghost"
        size="sm"
        className="w-11 h-11 p-0 bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-white/20 hover:bg-blue-50/80 hover:scale-105 transition-all duration-200"
        onClick={onCenterOnLocation}
      >
        <Crosshair className="w-4 h-4 text-blue-600" />
      </Button>

      {/* GPS Toggle */}
      <Button
        variant="ghost"
        size="sm"
        className={`w-11 h-11 p-0 rounded-full shadow-lg border border-white/20 backdrop-blur-md transition-all duration-300 hover:scale-105 ${
          useRealGPS 
            ? 'bg-emerald-500/90 text-white hover:bg-emerald-600/90 shadow-emerald-200' 
            : 'bg-white/90 text-gray-600 hover:bg-orange-50/80'
        }`}
        onClick={onToggleGPS}
        title={useRealGPS ? 'Real GPS Active' : 'Demo Mode'}
      >
        <NavigationIcon className="w-4 h-4" />
      </Button>
    </div>
  );
};
