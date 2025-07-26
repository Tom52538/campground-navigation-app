import { useCallback } from 'react';
import { useLanguage } from '@/hooks/useLanguage';

interface POIQuickAccessProps {
  onCategorySelect: (category: string) => void;
  selectedCategories: string[];
}

const POIButton = ({ category, icon, label, isActive, onClick }: {
  category: string;
  icon: string;
  label: string;
  isActive: boolean;
  onClick: (category: string) => void;
}) => {
  return (
    <button
      onClick={() => onClick(category)}
      className="flex-1 h-14 rounded-xl flex flex-col items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
      style={{
        background: isActive 
          ? 'rgba(34, 197, 94, 0.9)' // Green when active
          : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        minWidth: '90px', // Ensure minimum width
        maxWidth: '120px' // Prevent too wide on large screens
      }}
    >
      <span className="text-xl mb-1">{icon}</span>
      <span 
        className="text-xs font-semibold text-center leading-tight"
        style={{
          color: isActive ? 'white' : '#374151',
          textShadow: isActive ? 'none' : '0 1px 2px rgba(255, 255, 255, 0.8)'
        }}
      >
        {label}
      </span>
    </button>
  );
};

export const POIQuickAccess = ({ onCategorySelect, selectedCategories }: POIQuickAccessProps) => {
  const { t } = useLanguage();

  // Reorganized POI categories for three-row layout with 2 buttons each
  const firstRowPOIs = [
    { 
      category: 'facilities', 
      icon: '🚿', 
      label: 'Restrooms'
    },
    { 
      category: 'food-drink', 
      icon: '🍽️', 
      label: 'Food'
    }
  ];

  const secondRowPOIs = [
    { 
      category: 'recreation', 
      icon: '🔥', 
      label: 'Fire Pits'
    },
    { 
      category: 'services', 
      icon: '🥾', 
      label: 'Trails'
    }
  ];

  const thirdRowPOIs = [
    { 
      category: 'services', 
      icon: '⛽', 
      label: 'Services'
    },
    { 
      category: 'recreation', 
      icon: '🏕️', 
      label: 'Camping'
    }
  ];

  const handleCategoryClick = useCallback((category: string) => {
    onCategorySelect(category);
  }, [onCategorySelect]);

  return (
    <div className="absolute top-20 left-4 right-4 z-20">
      <div className="space-y-2">
        {/* First row - 2 buttons */}
        <div className="flex justify-between space-x-3">
          {firstRowPOIs.map((poi, index) => {
            const isActive = selectedCategories.includes(poi.category);
            return (
              <POIButton
                key={`first-${poi.category}-${index}`}
                category={poi.category}
                icon={poi.icon}
                label={poi.label}
                isActive={isActive}
                onClick={handleCategoryClick}
              />
            );
          })}
        </div>
        
        {/* Second row - 2 buttons */}
        <div className="flex justify-between space-x-3">
          {secondRowPOIs.map((poi, index) => {
            const isActive = selectedCategories.includes(poi.category);
            return (
              <POIButton
                key={`second-${poi.category}-${index}`}
                category={poi.category}
                icon={poi.icon}
                label={poi.label}
                isActive={isActive}
                onClick={handleCategoryClick}
              />
            );
          })}
        </div>
        
        {/* Third row - 2 buttons */}
        <div className="flex justify-between space-x-3">
          {thirdRowPOIs.map((poi, index) => {
            const isActive = selectedCategories.includes(poi.category);
            return (
              <POIButton
                key={`third-${poi.category}-${index}`}
                category={poi.category}
                icon={poi.icon}
                label={poi.label}
                isActive={isActive}
                onClick={handleCategoryClick}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};