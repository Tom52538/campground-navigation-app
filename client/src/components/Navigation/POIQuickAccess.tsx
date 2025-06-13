import { useCallback } from 'react';
import { useLanguage } from '@/hooks/useLanguage';

interface POIQuickAccessProps {
  onCategorySelect: (category: string) => void;
  selectedCategories: string[];
}

export const POIQuickAccess = ({ onCategorySelect, selectedCategories }: POIQuickAccessProps) => {
  const { t } = useLanguage();

  const campingPOIs = [
    { 
      category: 'facilities', 
      icon: '🚿', 
      label: 'Restrooms', 
      color: 'rgba(59, 130, 246, 0.9)' // blue
    },
    { 
      category: 'food-drink', 
      icon: '🍽️', 
      label: 'Food & Drink', 
      color: 'rgba(249, 115, 22, 0.9)' // orange
    },
    { 
      category: 'recreation', 
      icon: '🔥', 
      label: 'Fire Pits', 
      color: 'rgba(239, 68, 68, 0.9)' // red
    },
    { 
      category: 'services', 
      icon: '🥾', 
      label: 'Trails', 
      color: 'rgba(34, 197, 94, 0.9)' // green
    },
    { 
      category: 'facilities', 
      icon: '⛽', 
      label: 'Services', 
      color: 'rgba(147, 51, 234, 0.9)' // purple
    },
    { 
      category: 'recreation', 
      icon: '🏕️', 
      label: 'Camping', 
      color: 'rgba(20, 184, 166, 0.9)' // teal
    }
  ];

  const handleCategoryClick = useCallback((category: string) => {
    onCategorySelect(category);
  }, [onCategorySelect]);

  return (
    <div className="absolute top-20 left-4 right-4 z-20">
      <div className="flex justify-between space-x-2">
        {campingPOIs.map((poi, index) => {
          const isActive = selectedCategories.includes(poi.category);
          
          return (
            <button
              key={`${poi.category}-${index}`}
              onClick={() => handleCategoryClick(poi.category)}
              className="flex-1 max-w-[50px] h-12 rounded-xl flex flex-col items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                background: isActive 
                  ? poi.color
                  : 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                minHeight: '48px' // Outdoor touch target
              }}
            >
              <span className="text-lg">{poi.icon}</span>
              <span 
                className="text-xs font-semibold mt-1 leading-tight"
                style={{
                  color: isActive ? '#ffffff' : '#374151',
                  textShadow: isActive 
                    ? '0 1px 2px rgba(0, 0, 0, 0.3)' 
                    : '0 1px 2px rgba(255, 255, 255, 0.8)'
                }}
              >
                {poi.label.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};