import { useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface LightweightPOIButtonsProps {
  onCategorySelect: (category: string) => void;
  activeCategory?: string;
  selectedPOI?: boolean; // Add prop to know when POI is selected
}

const poiCategories = [
  // First Row - 4 POI Categories
  { icon: '🍽️', label: 'Food & Drinks', id: 'food-drink' },
  { icon: '🛠️', label: 'Services', id: 'services' },
  { icon: '🚑', label: 'Facilities', id: 'facilities' },
  { icon: '🎯', label: 'Recreation', id: 'recreation' },

  // Second Row - 4 POI Categories  
  { icon: '🅿️', label: 'Parking', id: 'parking' },
  { icon: '🏕️', label: 'Campgrounds', id: 'campgrounds' },
  { icon: '🏠', label: 'Buildings', id: 'buildings' },
  { icon: '🏖️', label: 'Accommodations', id: 'accommodations' },

  // Third Row - 3 POI Categories
  { icon: '🏘️', label: 'Amenities', id: 'amenities' },
  { icon: '🏰', label: 'Attractions', id: 'attractions' },
  { icon: '🌊', label: 'Water Features', id: 'water-features' }
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

  // Split POI categories into three rows: 4, 4, and 3 buttons
  const firstRowPOIs = poiCategories.slice(0, 4);
  const secondRowPOIs = poiCategories.slice(4, 8);
  const thirdRowPOIs = poiCategories.slice(8, 11);

  const renderPOIButton = (poi: any, index: number) => (
    <div key={poi.id} className="relative flex-1">
      <button
        onClick={() => handleCategoryClick(poi.id as string)}
        className={`w-full h-12 rounded-xl flex items-center justify-center transition-all duration-200 focus:outline-none
          ${activeCategory === poi.id ? 'poi-button--active' : 'poi-button--inactive'}
          hover:scale-105 active:scale-95`}
        style={{
          background: activeCategory === poi.id
            ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.7), rgba(59, 130, 246, 0.7))'
            : 'rgba(255, 255, 255, 0.2)',
          border: activeCategory === poi.id ? 'none' : '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: activeCategory === poi.id ? '0 4px 16px rgba(34, 197, 94, 0.3)' : 'none',
        }}
        aria-label={poi.label}
      >
        <span className="text-lg">{poi.icon}</span>
      </button>
      {visibleTooltip === poi.id && createPortal(
        <div style={{
          position: 'fixed',
          left: '50%',
          bottom: '120px',
          transform: 'translateX(-50%)',
          zIndex: 999999,
          padding: '8px 12px',
          background: 'rgba(17, 24, 39, 0.95)',
          color: 'white',
          borderRadius: '8px',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          fontSize: '12px',
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
      className="poi-bottom-panel"
      style={{
        position: 'absolute',
        left: '16px',
        right: '200px',
        bottom: '16px',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
        padding: '12px',
        opacity: selectedPOI ? 0.3 : 1,
        transition: 'opacity 0.3s ease-in-out',
        pointerEvents: selectedPOI ? 'none' : 'auto',
      }}
    >
      <div className="space-y-3">
        {/* First row - 4 buttons */}
        <div className="flex items-center space-x-2">
          {firstRowPOIs.map((poi, index) => renderPOIButton(poi, index))}
        </div>

        {/* Second row - 4 buttons */}
        <div className="flex items-center space-x-2">
          {secondRowPOIs.map((poi, index) => renderPOIButton(poi, index))}
        </div>

        {/* Third row - 3 buttons centered */}
        <div className="flex items-center justify-center space-x-2">
          {thirdRowPOIs.map((poi, index) => (
            <div key={poi.id} className="relative" style={{ width: 'calc(25% - 6px)' }}>
              <button
                onClick={() => handleCategoryClick(poi.id as string)}
                className={`w-full h-12 rounded-xl flex items-center justify-center transition-all duration-200 focus:outline-none
                  ${activeCategory === poi.id ? 'poi-button--active' : 'poi-button--inactive'}
                  hover:scale-105 active:scale-95`}
                style={{
                  background: activeCategory === poi.id
                    ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.7), rgba(59, 130, 246, 0.7))'
                    : 'rgba(255, 255, 255, 0.2)',
                  border: activeCategory === poi.id ? 'none' : '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: activeCategory === poi.id ? '0 4px 16px rgba(34, 197, 94, 0.3)' : 'none',
                }}
                aria-label={poi.label}
              >
                <span className="text-lg">{poi.icon}</span>
              </button>
              {visibleTooltip === poi.id && createPortal(
                <div style={{
                  position: 'fixed',
                  left: '50%',
                  bottom: '120px',
                  transform: 'translateX(-50%)',
                  zIndex: 999999,
                  padding: '8px 12px',
                  background: 'rgba(17, 24, 39, 0.95)',
                  color: 'white',
                  borderRadius: '8px',
                  pointerEvents: 'none',
                  whiteSpace: 'nowrap',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  {poi.label}
                </div>,
                document.body
              )}
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .poi-bottom-panel {
          animation: slideUpFromBottom 0.3s ease-out;
        }
        @keyframes slideUpFromBottom {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .poi-button--inactive:hover {
          background: rgba(255, 255, 255, 0.3) !important;
        }
      `}</style>
    </div>
  );
};