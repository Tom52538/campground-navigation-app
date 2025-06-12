import { SearchBar } from './SearchBar';
import { WeatherWidget } from './WeatherWidget';
import { GPSToggle } from './GPSToggle';
import { Coordinates } from '@/types/navigation';

interface TopBarProps {
  currentPosition: Coordinates;
  useRealGPS: boolean;
  onSearch: (query: string) => void;
  onFilter: () => void;
  onToggleGPS: () => void;
}

export const TopBar = ({ currentPosition, useRealGPS, onSearch, onFilter, onToggleGPS }: TopBarProps) => {
  return (
    <div className="absolute top-0 left-0 right-0 z-30 p-4">
      <div className="flex items-center space-x-3">
        <SearchBar onSearch={onSearch} onFilter={onFilter} />
        <WeatherWidget coordinates={currentPosition} />
        <GPSToggle useRealGPS={useRealGPS} onToggle={onToggleGPS} />
      </div>
    </div>
  );
};
