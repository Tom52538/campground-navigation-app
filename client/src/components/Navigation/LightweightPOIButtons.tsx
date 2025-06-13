import { useCallback } from 'react';

interface LightweightPOIButtonsProps {
  onCategorySelect: (category: string) => void;
  activeCategory?: string;
}

export const LightweightPOIButtons = ({ onCategorySelect, activeCategory }: LightweightPOIButtonsProps) => {
  const poiCategories = [
    { id: 'facilities', icon: '🚿' },
    { id: 'food-drink', icon: '🍽️' },
    { id: 'recreation', icon: '🔥' },
    { id: 'services', icon: '🥾' },
    { id: 'services', icon: '⛽' },
    { id: 'recreation', icon: '🏕️' }
  ];

  const handleCategoryClick = useCallback((category: string) => {
    onCategorySelect(category);
  }, [onCategorySelect]);

  return (
    <div 
      className="absolute left-4 z-20 flex flex-col space-y-3"
      style={{
        top: '200px', // Position relative to map area starting at 150px
        transform: 'none'
      }}
    >
      {poiCategories.map((poi, index) => (
        <button
          key={`${poi.id}-${index}`}
          onClick={() => handleCategoryClick(poi.id)}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
          style={{
            background: activeCategory === poi.id 
              ? 'rgba(34, 197, 94, 0.7)' // Light green when active
              : 'rgba(255, 255, 255, 0.6)', // Very light when inactive
            backdropFilter: 'blur(6px)', // Subtle blur
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: activeCategory === poi.id 
              ? '0 2px 12px rgba(34, 197, 94, 0.3)'
              : '0 2px 8px rgba(0, 0, 0, 0.08)',
            minWidth: '40px',
            minHeight: '40px'
          }}
        >
          <span className="text-lg">{poi.icon}</span>
        </button>
      ))}
    </div>
  );
};