import { Button } from '@/components/ui/button';
import { POICategory } from '@/types/navigation';
import { useLanguage } from '@/hooks/useLanguage';

interface QuickPOIIconsProps {
  filteredCategories: string[];
  onToggleCategory: (category: string) => void;
}

const CAMPING_POI_ICONS = [
  {
    category: 'facilities' as POICategory,
    icon: '🏕️',
    label: 'Campsites',
    color: 'bg-green-500/80 hover:bg-green-600/90'
  },
  {
    category: 'services' as POICategory,
    icon: '🚿',
    label: 'Restrooms',
    color: 'bg-blue-500/80 hover:bg-blue-600/90'
  },
  {
    category: 'food-drink' as POICategory,
    icon: '🔥',
    label: 'Fire Pits',
    color: 'bg-orange-500/80 hover:bg-orange-600/90'
  },
  {
    category: 'recreation' as POICategory,
    icon: '🥾',
    label: 'Trails',
    color: 'bg-emerald-500/80 hover:bg-emerald-600/90'
  },
  {
    category: 'services' as POICategory,
    icon: '⛽',
    label: 'Services',
    color: 'bg-purple-500/80 hover:bg-purple-600/90'
  },
  {
    category: 'facilities' as POICategory,
    icon: '🗑️',
    label: 'Waste',
    color: 'bg-gray-500/80 hover:bg-gray-600/90'
  }
];

export const QuickPOIIcons = ({ filteredCategories, onToggleCategory }: QuickPOIIconsProps) => {
  const { t } = useLanguage();
  
  return (
    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-30">
      <div className="flex flex-col space-y-3">
        {CAMPING_POI_ICONS.map((poi, index) => {
          const isActive = filteredCategories.includes(poi.category);
          
          return (
            <Button
              key={`poi-${poi.category}-${index}`}
              variant="ghost"
              size="sm"
              className={`
                w-12 h-12 p-0 rounded-full shadow-lg border border-white/20 backdrop-blur-md transition-all duration-300
                ${isActive 
                  ? `${poi.color} text-white scale-105 shadow-xl` 
                  : 'bg-white/90 text-gray-700 hover:scale-105 hover:shadow-xl'
                }
              `}
              onClick={() => onToggleCategory(poi.category)}
              title={t(`categories.${poi.category}`)}
            >
              <span className="text-lg">{poi.icon}</span>
            </Button>
          );
        })}
      </div>
    </div>
      
    </div>
  );
};