import { useState } from 'react';
import { Menu, Search, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TestSite, TEST_SITES } from '@/types/navigation';
import { SearchBar } from '@/components/Navigation/SearchBar';
import { SiteSelector } from '@/components/Navigation/SiteSelector';

interface MinimalHeaderProps {
  currentSite: TestSite;
  searchQuery: string;
  onSearch: (query: string) => void;
  onFilter: () => void;
  onSiteChange: (site: TestSite) => void;
  onMenuToggle: () => void;
  showClearButton?: boolean;
  onClear?: () => void;
}

export const MinimalHeader = ({
  currentSite,
  searchQuery,
  onSearch,
  onFilter,
  onSiteChange,
  onMenuToggle,
  showClearButton = false,
  onClear
}: MinimalHeaderProps) => {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const handleSearchFocus = () => {
    setIsSearchExpanded(true);
  };

  const handleSearchBlur = () => {
    if (!searchQuery) {
      setIsSearchExpanded(false);
    }
  };

  return (
    <div className="absolute top-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-b border-white/20 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 h-16">
        {/* Left: Hamburger Menu */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuToggle}
          className="flex-shrink-0 w-10 h-10 hover:bg-gray-100/80"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5 text-gray-700" />
        </Button>

        {/* Center: Search Bar (Expandable) */}
        <div className={`flex-1 mx-3 transition-all duration-300 ${
          isSearchExpanded ? 'max-w-none' : 'max-w-xs'
        }`}>
          <SearchBar
            onSearch={onSearch}
            onFilter={onFilter}
          />
        </div>

        {/* Right: Site Selector + Clear Button + Settings */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          {showClearButton && onClear && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="text-xs px-2 h-8 text-gray-600 hover:bg-gray-100/80"
            >
              Clear
            </Button>
          )}
          
          <SiteSelector
            currentSite={currentSite}
            onSiteChange={onSiteChange}
          />
          
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 hover:bg-gray-100/80"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4 text-gray-600" />
          </Button>
        </div>
      </div>

      {/* Current Site Indicator */}
      <div className="px-4 pb-2">
        <div className="flex items-center justify-center">
          <div className="text-xs text-gray-500 bg-gray-100/80 px-2 py-1 rounded-full">
            📍 {TEST_SITES[currentSite].name}
          </div>
        </div>
      </div>
    </div>
  );
};