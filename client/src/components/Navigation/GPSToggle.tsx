import { Satellite, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GPSToggleProps {
  useRealGPS: boolean;
  onToggle: () => void;
}

export const GPSToggle = ({ useRealGPS, onToggle }: GPSToggleProps) => {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onToggle}
      className={`floating-button ${useRealGPS ? 'bg-green-100 border-green-300' : 'bg-blue-100 border-blue-300'}`}
    >
      {useRealGPS ? (
        <>
          <Satellite className="w-4 h-4 mr-2 text-green-600" />
          <span className="text-green-700 text-xs">Real GPS</span>
        </>
      ) : (
        <>
          <MapPin className="w-4 h-4 mr-2 text-blue-600" />
          <span className="text-blue-700 text-xs">Mock GPS</span>
        </>
      )}
    </Button>
  );
};