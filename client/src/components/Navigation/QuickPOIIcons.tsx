
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
    icon: '🚿',
    label: 'Restrooms',
    color: 'bg-blue-500/80 hover:bg-blue-600/90'
  },
  {
    category: 'food-drink' as POICategory,
    icon: '🍽️',
    label: 'Food',
    color: 'bg-orange-500/80 hover:bg-orange-600/90'
  },
  {
    category: 'recreation' as POICategory,
    icon: '🔥',
    label: 'Fire Pits',
    color: 'bg-red-500/80 hover:bg-red-600/90'
  },
  {
    category: 'services' as POICategory,
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
    icon: '🏕️',
    label: 'Camping',
    color: 'bg-green-500/80 hover:bg-green-600/90'
  },
  {
    category: 'recreation' as POICategory,
    icon: '🏊',
    label: 'Swimming',
    color: 'bg-cyan-500/80 hover:bg-cyan-600/90'
  },
  {
    category: 'facilities' as POICategory,
    icon: '🅿️',
    label: 'Parking',
    color: 'bg-gray-500/80 hover:bg-gray-600/90'
  },
  {
    category: 'services' as POICategory,
    icon: '🏪',
    label: 'Shop',
    color: 'bg-indigo-500/80 hover:bg-indigo-600/90'
  },
  {
    category: 'recreation' as POICategory,
    icon: '🎯',
    label: 'Activities',
    color: 'bg-pink-500/80 hover:bg-pink-600/90'
  },
  {
    category: 'facilities' as POICategory,
    icon: '🔧',
    label: 'Maintenance',
    color: 'bg-yellow-500/80 hover:bg-yellow-600/90'
  }
];

export const QuickPOIIcons = ({ filteredCategories, onToggleCategory }: QuickPOIIconsProps) => {
  const { t } = useLanguage();
  
  return (
    <div className="absolute bottom-4 left-4 right-4 z-20">
      <div className="space-y-2">
        {/* ROW 1 - First 4 icons */}
        <div className="flex justify-between space-x-2">
          {CAMPING_POI_ICONS.slice(0, 4).map((poi, index) => {
            const isActive = filteredCategories.includes(poi.category);
            
            return (
              <Button
                key={`row1-${poi.category}-${index}`}
                variant="ghost"
                size="sm"
                className={`
                  flex-1 h-14 rounded-xl flex flex-col items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95
                  ${isActive 
                    ? `${poi.color} text-white scale-105 shadow-xl` 
                    : 'bg-white/80 text-gray-700 hover:bg-gray-50/90'
                  }
                `}
                style={{
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}
                onClick={() => onToggleCategory(poi.category)}
                title={t(`categories.${poi.category}`)}
              >
                <span className="text-lg mb-1">{poi.icon}</span>
                <span 
                  className="text-xs font-semibold text-center leading-tight"
                  style={{
                    color: isActive ? 'white' : '#374151',
                    textShadow: isActive ? 'none' : '0 1px 2px rgba(255, 255, 255, 0.8)'
                  }}
                >
                  {poi.label}
                </span>
              </Button>
            );
          })}
        </div>
        
        {/* ROW 2 - Next 4 icons */}
        <div className="flex justify-between space-x-2">
          {CAMPING_POI_ICONS.slice(4, 8).map((poi, index) => {
            const isActive = filteredCategories.includes(poi.category);
            
            return (
              <Button
                key={`row2-${poi.category}-${index}`}
                variant="ghost"
                size="sm"
                className={`
                  flex-1 h-14 rounded-xl flex flex-col items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95
                  ${isActive 
                    ? `${poi.color} text-white scale-105 shadow-xl` 
                    : 'bg-white/80 text-gray-700 hover:bg-gray-50/90'
                  }
                `}
                style={{
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}
                onClick={() => onToggleCategory(poi.category)}
                title={t(`categories.${poi.category}`)}
              >
                <span className="text-lg mb-1">{poi.icon}</span>
                <span 
                  className="text-xs font-semibold text-center leading-tight"
                  style={{
                    color: isActive ? 'white' : '#374151',
                    textShadow: isActive ? 'none' : '0 1px 2px rgba(255, 255, 255, 0.8)'
                  }}
                >
                  {poi.label}
                </span>
              </Button>
            );
          })}
        </div>

        {/* ROW 3 - Last 3 icons (centered) */}
        <div className="flex justify-center space-x-8">
          {CAMPING_POI_ICONS.slice(8, 11).map((poi, index) => {
            const isActive = filteredCategories.includes(poi.category);
            
            return (
              <Button
                key={`row3-${poi.category}-${index}`}
                variant="ghost"
                size="sm"
                className={`
                  h-14 rounded-xl flex flex-col items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95
                  ${isActive 
                    ? `${poi.color} text-white scale-105 shadow-xl` 
                    : 'bg-white/80 text-gray-700 hover:bg-gray-50/90'
                  }
                `}
                style={{
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  width: '100px',
                  flex: 'none'
                }}
                onClick={() => onToggleCategory(poi.category)}
                title={t(`categories.${poi.category}`)}
              >
                <span className="text-lg mb-1">{poi.icon}</span>
                <span 
                  className="text-xs font-semibold text-center leading-tight"
                  style={{
                    color: isActive ? 'white' : '#374151',
                    textShadow: isActive ? 'none' : '0 1px 2px rgba(255, 255, 255, 0.8)'
                  }}
                >
                  {poi.label}
                </span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
