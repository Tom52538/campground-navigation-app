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

  return (
    <div className="absolute left-4 top-20 z-20 flex flex-col space-y-3">
      {categories.map(([key, category]) => {
        const isActive = filteredCategories.includes(key);
        const emoji = getEmojiForCategory(category.icon);
        
        return (
          <Button
            key={key}
            variant="outline"
            size="sm"
            className={`w-12 h-12 p-0 rounded-full shadow-lg border-2 border-white ${
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
      })}
    </div>
  );
};
