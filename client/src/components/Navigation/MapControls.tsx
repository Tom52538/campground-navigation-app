import { useState, useEffect } from 'react';
import { Plus, Minus, Crosshair } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onCenterOnLocation: () => void;
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

export const MapControls = ({ onZoomIn, onZoomOut, onCenterOnLocation }: MapControlsProps) => {
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
    <div className="absolute left-4 top-20 z-20 flex flex-col space-y-3">
      <div className="w-12 h-12 rounded-full bg-white/80 backdrop-blur-sm shadow-lg border-2 border-black/30 flex items-center justify-center">
        <CompassIcon heading={heading} />
      </div>
      
      <Button
        variant="outline"
        size="sm"
        className="w-12 h-12 p-0 rounded-full bg-white/80 backdrop-blur-sm shadow-lg border-2 border-black/30 hover:bg-gray-50"
        onClick={onZoomIn}
      >
        <Plus className="w-6 h-6" />
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        className="w-12 h-12 p-0 rounded-full bg-white/80 backdrop-blur-sm shadow-lg border-2 border-black/30 hover:bg-gray-50"
        onClick={onZoomOut}
      >
        <Minus className="w-6 h-6" />
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        className="w-12 h-12 p-0 rounded-full bg-blue-500 text-white shadow-lg border-2 border-black/30 hover:bg-blue-600"
        onClick={onCenterOnLocation}
      >
        <Crosshair className="w-6 h-6" />
      </Button>
    </div>
  );
};
