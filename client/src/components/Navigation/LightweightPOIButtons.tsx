import { useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface LightweightPOIButtonsProps {
  onCategorySelect: (category: string) => void;
  activeCategory?: string;
  selectedPOI?: boolean; // Add prop to know when POI is selected
}

const poiCategories = [
  // Unterkünfte - Match exact categories from roompot_pois.geojson
  { id: 'facilities', icon: '🏠', label: 'Bungalows' },
  { id: 'buildings', icon: '🏘️', label: 'Strandhäuser' },
  
  // Service categories - to be added when available in data
  { id: 'services', icon: '🅿️', label: 'Services' },
  { id: 'food-drink', icon: '🍽️', label: 'Restaurant' },
  { id: 'recreation', icon: '🏊', label: 'Freizeit' },
  { id: 'amenities', icon: '🚻', label: 'Annehmlichkeiten' }
];

export const LightweightPOIButtons = ({ onCategorySelect, activeCategory, selectedPOI }: LightweightPOIButtonsProps) => {
  const [visibleTooltip, setVisibleTooltip] = useState<string | null>(null);
  const tooltipTimeoutRef = useRef<number | null>(null);

  const handleCategoryClick = useCallback((category: string) => {
    onCategorySelect(category);
    setVisibleTooltip(category);

    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }

    tooltipTimeoutRef.current = window.setTimeout(() => {
      setVisibleTooltip(null);
    }, 2000);
  }, [onCategorySelect]);

  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, []);

  // Split into two columns for vertical layout
  const leftColumn = poiCategories.slice(0, 6);  // First 6 buttons
  const rightColumn = poiCategories.slice(6, 11); // Remaining 5 buttons

  const renderVerticalButton = (poi: any, index: number) => (
    <div key={poi.id} className="relative mb-1">
      <button
        onClick={() => handleCategoryClick(poi.id as string)}
        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 focus:outline-none
          ${activeCategory === poi.id ? 'poi-button--active' : 'poi-button--inactive'}
          hover:scale-105 active:scale-95`}
        style={{
          background: activeCategory === poi.id
            ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.7), rgba(59, 130, 246, 0.7))'
            : 'rgba(255, 255, 255, 0.2)',
          border: activeCategory === poi.id ? 'none' : '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: activeCategory === poi.id ? '0 3px 12px rgba(34, 197, 94, 0.3)' : 'none',
        }}
        aria-label={poi.label}
      >
        <span className="text-sm">{poi.icon}</span>
      </button>
      {visibleTooltip === poi.id && createPortal(
        <div style={{
          position: 'fixed',
          left: '70px',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 999999,
          padding: '6px 10px',
          background: 'rgba(17, 24, 39, 0.95)',
          color: 'white',
          borderRadius: '6px',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          fontSize: '11px',
          fontWeight: '500'
        }}>
          {poi.label}
        </div>,
        document.body
      )}
    </div>
  );

  return (
    <div
      className="poi-left-panel"
      style={{
        position: 'absolute',
        left: '16px',
        bottom: '120px',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
        padding: '8px',
        opacity: selectedPOI ? 0.3 : 1,
        transition: 'opacity 0.3s ease-in-out',
        pointerEvents: selectedPOI ? 'none' : 'auto',
      }}
    >
      <div className="flex flex-col">
        {/* Single column - all 11 buttons */}
        {poiCategories.map((poi, index) => renderVerticalButton(poi, index))}
      </div>
      <style>{`
        .poi-left-panel {
          animation: slideInFromLeft 0.3s ease-out;
        }
        @keyframes slideInFromLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .poi-button--inactive:hover {
          background: rgba(255, 255, 255, 0.3) !important;
        }
      `}</style>
    </div>
  );
};