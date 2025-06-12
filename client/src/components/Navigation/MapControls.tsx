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
    <div className="absolute right-4 bottom-20 z-20 flex flex-col space-y-2">
      <div className="bg-white rounded-lg shadow-md">
        <Button
          variant="ghost"
          size="sm"
          className="w-10 h-10 p-0 rounded-t-lg hover:bg-gray-50 border-b border-gray-100"
          onClick={onZoomIn}
        >
          <Plus className="w-5 h-5 text-gray-600" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-10 h-10 p-0 rounded-b-lg hover:bg-gray-50"
          onClick={onZoomOut}
        >
          <Minus className="w-5 h-5 text-gray-600" />
        </Button>
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        className="w-10 h-10 p-0 bg-white rounded-lg shadow-md hover:bg-gray-50"
        onClick={onCenterOnLocation}
      >
        <Crosshair className="w-5 h-5 text-blue-500" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className={`w-10 h-10 p-0 rounded-lg shadow-md ${
          useRealGPS 
            ? 'bg-blue-500 text-white hover:bg-blue-600' 
            : 'bg-white text-gray-600 hover:bg-gray-50'
        }`}
        onClick={onToggleGPS}
        title={useRealGPS ? 'Using Real GPS' : 'Using Mock GPS'}
      >
        <NavigationIcon className="w-4 h-4" />
      </Button>
    </div>
  );
};
