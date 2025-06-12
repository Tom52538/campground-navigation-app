import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onFilter: () => void;
}

export const SearchBar = ({ onSearch, onFilter }: SearchBarProps) => {
  const [query, setQuery] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  return (
    <div className="flex-1 relative">
      <div className="bg-white/80 backdrop-blur-sm rounded-lg border-2 border-black/30 overflow-hidden">
        <div className="flex items-center p-2">
          <Search className="text-gray-600 w-4 h-4 mr-2" />
          <Input
            type="text"
            placeholder="Search POIs..."
            value={query}
            onChange={handleInputChange}
            className="border-none shadow-none p-0 focus-visible:ring-0 text-sm bg-transparent"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={onFilter}
            className="text-gray-600 hover:text-gray-800 p-1 ml-1"
          >
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
