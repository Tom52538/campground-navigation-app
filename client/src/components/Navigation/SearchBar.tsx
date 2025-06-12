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
    <div className="w-full relative">
      <div className="bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center px-5 py-3">
          <Search className="text-gray-500 w-4 h-4 mr-3 flex-shrink-0" />
          <Input
            type="text"
            placeholder="Find campsites, trails, amenities..."
            value={query}
            onChange={handleInputChange}
            className="border-none shadow-none p-0 focus-visible:ring-0 text-sm bg-transparent flex-1 text-gray-800 placeholder-gray-400"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={onFilter}
            className="text-gray-500 hover:text-green-600 p-1 ml-2 flex-shrink-0 rounded-full hover:bg-green-50/50 transition-all duration-200"
          >
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
