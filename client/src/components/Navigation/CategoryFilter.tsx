import { POICategory, POI_CATEGORIES } from '@/types/navigation';
import { Button } from '@/components/ui/button';

interface CategoryFilterProps {
  filteredCategories: string[];
  onToggleCategory: (category: string) => void;
}

export const CategoryFilter = ({ filteredCategories, onToggleCategory }: CategoryFilterProps) => {
  const categories = Object.entries(POI_CATEGORIES) as [POICategory, typeof POI_CATEGORIES[POICategory]][];

  return (
    <div className="absolute left-2 top-1/2 transform -translate-y-1/2 z-20 flex flex-col space-y-2">
      {categories.map(([key, category]) => {
        const isActive = filteredCategories.includes(key);
        
        return (
          <Button
            key={key}
            variant="outline"
            size="sm"
            className={`w-12 h-12 p-0 rounded-full shadow-lg border-2 border-black/30 ${
              isActive 
                ? 'bg-blue-500 text-white' 
                : 'bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => onToggleCategory(key)}
            title={category.label}
          >
            <span className="text-sm">
              {category.icon === 'fas fa-utensils' && '🍽️'}
              {category.icon === 'fas fa-swimming-pool' && '🏊'}
              {category.icon === 'fas fa-restroom' && '🚻'}
              {category.icon === 'fas fa-info-circle' && 'ℹ️'}
            </span>
          </Button>
        );
      })}
    </div>
  );
};
