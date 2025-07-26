import { POICategory, POI_CATEGORIES } from '@/types/navigation';
import { Button } from '@/components/ui/button';

interface CategoryFilterProps {
  filteredCategories: string[];
  onToggleCategory: (category: string) => void;
}

const getEmojiForCategory = (iconName: string) => {
  switch (iconName) {
    case 'Utensils': return '🍽️';
    case 'Building2': return '🏢';
    case 'Waves': return '🌊';
    case 'Car': return '🚗';
    default: return '📍';
  }
};

export const CategoryFilter = ({ filteredCategories, onToggleCategory }: CategoryFilterProps) => {
  const categories = Object.entries(POI_CATEGORIES) as [POICategory, typeof POI_CATEGORIES[POICategory]][];
  
  // Split categories into two columns
  const midpoint = Math.ceil(categories.length / 2);
  const leftColumn = categories.slice(0, midpoint);
  const rightColumn = categories.slice(midpoint);

  const renderButton = ([key, category]: [POICategory, typeof POI_CATEGORIES[POICategory]]) => {
    const isActive = filteredCategories.includes(key);
    const emoji = getEmojiForCategory(category.icon);
    
    return (
      <Button
        key={key}
        variant="outline"
        size="sm"
        className={`w-12 h-12 p-0 rounded-full shadow-lg border-2 border-white mb-2 ${
          isActive 
            ? `${category.color} text-white` 
            : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-gray-50'
        }`}
        onClick={() => onToggleCategory(key)}
        title={category.label}
      >
        <span className="text-lg">{emoji}</span>
      </Button>
    );
  };

  return (
    <div className="absolute left-4 bottom-20 z-20 flex space-x-3">
      {/* Left Column */}
      <div className="flex flex-col">
        {leftColumn.map(renderButton)}
      </div>
      {/* Right Column */}
      <div className="flex flex-col">
        {rightColumn.map(renderButton)}
      </div>
    </div>
  );
};
