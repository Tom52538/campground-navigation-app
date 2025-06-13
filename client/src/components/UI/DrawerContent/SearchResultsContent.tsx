import { POI, POI_CATEGORIES } from '@/types/navigation';
import { MapPin, Search } from 'lucide-react';

interface SearchResultsContentProps {
  results: POI[];
  query: string;
  onPOISelect?: (poi: POI) => void;
}

export const SearchResultsContent = ({ results, query, onPOISelect }: SearchResultsContentProps) => {
  // Group results by category for better organization
  const groupedResults = results.reduce((acc, poi) => {
    const category = poi.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(poi);
    return acc;
  }, {} as Record<string, POI[]>);

  const categories = Object.keys(groupedResults);

  if (results.length === 0 && query.length > 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500">
        <Search className="w-8 h-8 mb-2" />
        <p className="text-sm">No results found for "{query}"</p>
        <p className="text-xs mt-1">Try a different search term</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500">
        <Search className="w-8 h-8 mb-2" />
        <p className="text-sm">Start typing to search POIs</p>
        <p className="text-xs mt-1">Find restaurants, facilities, and activities</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mb-3">
        <h3 className="text-lg font-semibold text-gray-800">
          {query ? `Results for "${query}"` : 'Search Results'}
        </h3>
        <p className="text-sm text-gray-500">{results.length} location{results.length !== 1 ? 's' : ''} found</p>
      </div>

      <div className="space-y-4">
        {categories.map(categoryKey => {
          const category = POI_CATEGORIES[categoryKey as keyof typeof POI_CATEGORIES];
          const categoryPOIs = groupedResults[categoryKey];

          return (
            <div key={categoryKey} className="space-y-2">
              {/* Category Header */}
              <div className="flex items-center space-x-2 pb-1 border-b border-gray-100">
                <div className={`${category?.color || 'bg-gray-500'} rounded-lg p-1.5`}>
                  <div className="text-white text-sm">
                    {category?.icon === 'fas fa-utensils' && '🍽️'}
                    {category?.icon === 'fas fa-swimming-pool' && '🏊'}
                    {category?.icon === 'fas fa-restroom' && '🚻'}
                    {category?.icon === 'fas fa-info-circle' && 'ℹ️'}
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {category?.label || categoryKey} ({categoryPOIs.length})
                </span>
              </div>

              {/* POI List */}
              <div className="space-y-2">
                {categoryPOIs.map(poi => (
                  <div
                    key={poi.id}
                    className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors min-h-[56px]"
                    onClick={() => onPOISelect?.(poi)}
                  >
                    <div className={`${category?.color || 'bg-gray-500'} rounded-lg p-2 flex-shrink-0`}>
                      <div className="text-white text-sm">
                        {category?.icon === 'fas fa-utensils' && '🍽️'}
                        {category?.icon === 'fas fa-swimming-pool' && '🏊'}
                        {category?.icon === 'fas fa-restroom' && '🚻'}
                        {category?.icon === 'fas fa-info-circle' && 'ℹ️'}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-800 truncate">{poi.name}</h4>
                      {poi.distance && (
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                          <span>{poi.distance}</span>
                        </div>
                      )}
                      {poi.description && (
                        <p className="text-xs text-gray-600 mt-1 line-clamp-1">{poi.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};