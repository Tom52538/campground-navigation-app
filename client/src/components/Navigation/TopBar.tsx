import { SearchBar } from './SearchBar';
import { WeatherWidget } from './WeatherWidget';
import { Coordinates } from '@/types/navigation';

interface TopBarProps {
  currentPosition: Coordinates;
  onSearch: (query: string) => void;
  onFilter: () => void;
}

export const TopBar = ({ currentPosition, onSearch, onFilter }: TopBarProps) => {
  return (
    <div className="absolute top-0 left-0 right-0 z-30 p-4">
      <div className="flex items-center">
        <SearchBar onSearch={onSearch} onFilter={onFilter} />
      </div>
    </div>
  );
};
