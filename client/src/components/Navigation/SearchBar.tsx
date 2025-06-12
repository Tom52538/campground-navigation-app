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
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
        <div className="flex items-center px-4 py-3">
          <Search className="text-gray-400 w-5 h-5 mr-3 flex-shrink-0" />
          <Input
            type="text"
            placeholder="Search for places"
            value={query}
            onChange={handleInputChange}
            className="border-none shadow-none p-0 focus-visible:ring-0 text-base bg-transparent flex-1 text-gray-800 placeholder-gray-500"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={onFilter}
            className="text-gray-400 hover:text-gray-600 p-1 ml-2 flex-shrink-0"
          >
            <Filter className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
