import { useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface LightweightPOIButtonsProps {
  onCategorySelect: (category: string) => void;
  activeCategory?: string;
}

const poiCategories = [
  // POI Categories (5)
  { icon: '🍽️', label: 'Food & Drinks', id: 'food-drink' },
  { icon: '🛠️', label: 'Services', id: 'services' },
  { icon: '🚑', label: 'Hilfe im Notfall', id: 'necessities' },
  { icon: '🎯', label: 'Freizeit', id: 'leisure' },
  { icon: '🅿️', label: 'Parkplätze', id: 'parking' },

  // Visual separator
  { divider: true },

  // Accommodation Categories (6)
  { icon: '🏕️', label: 'Stellplätze', id: 'campgrounds' },
  { icon: '🏠', label: 'Bungalows', id: 'bungalows' },
  { icon: '🏖️', label: 'Strandhäuser', id: 'beach-houses' },
  { icon: '🏘️', label: 'Chalets', id: 'chalets' },
  { icon: '🏰', label: 'Lodges Water Village', id: 'lodges-water' },
  { icon: '🌊', label: 'Bungalows Water Village', id: 'bungalows-water' }
];

export const LightweightPOIButtons = ({ onCategorySelect, activeCategory }: LightweightPOIButtonsProps) => {
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

  return (
    <div
      className="poi-sidebar"
      style={{
        position: 'absolute',
        left: '16px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '60px',
        height: '480px',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        overflowY: 'auto',
        scrollBehavior: 'smooth',
        zIndex: 1000,
      }}
    >
      <div className="flex flex-col items-center py-3 space-y-3">
        {poiCategories.map((poi, index) => {
          if (poi.divider) {
            return (
              <div
                key="divider"
                className="category-divider"
                style={{
                  height: '1px',
                  margin: '12px 8px',
                  width: '80%',
                  background: 'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.3), transparent)',
                }}
              />
            );
          }
          return (
            <div key={poi.id} className="relative">
              <button
                onClick={() => handleCategoryClick(poi.id as string)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none
                  ${activeCategory === poi.id ? 'poi-button--active' : 'poi-button--inactive'}
                  hover:scale-110 active:scale-95`}
                style={{
                  background: activeCategory === poi.id
                    ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.7), rgba(59, 130, 246, 0.7))'
                    : 'rgba(255, 255, 255, 0.2)',
                  border: activeCategory === poi.id ? 'none' : '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: activeCategory === poi.id ? '0 4px 16px rgba(34, 197, 94, 0.3)' : 'none',
                }}
                aria-label={poi.label}
              >
                <span className="text-2xl">{poi.icon}</span>
              </button>
              {visibleTooltip === poi.id && createPortal(
                <div style={{
                  position: 'fixed',
                  left: '90px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 999999,
                  padding: '8px 12px',
                  background: 'rgba(17, 24, 39, 0.95)',
                  color: 'white',
                  borderRadius: '8px',
                  pointerEvents: 'none',
                }}>
                  {poi.label}
                </div>,
                document.body
              )}
            </div>
          );
        })}
      </div>
      <style>{`
        .poi-sidebar::-webkit-scrollbar {
          display: none;
        }
        .poi-sidebar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes fadeInFromLeft {
          from {
            opacity: 0;
            transform: translateY(-50%) translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(-50%) translateX(0);
          }
        }
        .poi-button--inactive:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
};