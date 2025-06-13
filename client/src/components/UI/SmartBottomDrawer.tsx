import { useState, useEffect, useRef } from 'react';
import { POI, Coordinates, NavigationRoute } from '@/types/navigation';

// Import drawer content components
import { POIDetailContent } from '@/components/UI/DrawerContent/POIDetailContent';
import { SearchResultsContent } from '@/components/UI/DrawerContent/SearchResultsContent';
import { NavigationContent } from '@/components/UI/DrawerContent/NavigationContent';
import { CampingCenterContent } from '@/components/UI/DrawerContent/CampingCenterContent';

interface SmartBottomDrawerProps {
  // Mode determines the content and behavior
  mode: 'search' | 'poi-detail' | 'navigation' | 'camping-center';
  
  // Height states
  height: 'peek' | 'half' | 'full';
  
  // Content props
  selectedPOI?: POI | null;
  searchResults?: POI[];
  searchQuery?: string;
  currentRoute?: NavigationRoute | null;
  currentPosition: Coordinates;
  weather?: any;
  
  // Event handlers
  onPOINavigate?: (poi: POI) => void;
  onPOISelect?: (poi: POI) => void;
  onClose?: () => void;
  onHeightChange?: (height: 'peek' | 'half' | 'full') => void;
}

export const SmartBottomDrawer = ({
  mode,
  height,
  selectedPOI,
  searchResults = [],
  searchQuery = '',
  currentRoute,
  currentPosition,
  weather,
  onPOINavigate,
  onPOISelect,
  onClose,
  onHeightChange
}: SmartBottomDrawerProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Show drawer when there's content or in camping-center mode
  useEffect(() => {
    const shouldShow = mode === 'camping-center' || 
                     (mode === 'poi-detail' && !!selectedPOI) ||
                     (mode === 'search' && (searchQuery.length > 0 || searchResults.length > 0)) ||
                     (mode === 'navigation' && !!currentRoute);
    setIsVisible(shouldShow);
  }, [mode, selectedPOI, searchQuery, searchResults.length, currentRoute]);

  // Height calculations
  const getHeightClass = () => {
    switch (height) {
      case 'peek':
        return 'h-20'; // 80px
      case 'half':
        return 'h-96'; // 384px
      case 'full':
        return 'h-[80vh]';
      default:
        return 'h-20';
    }
  };

  const getTranslateY = () => {
    if (!isVisible) return 'translate-y-full';
    if (isDragging) {
      const deltaY = currentY - startY;
      return `translate-y-[${Math.max(0, deltaY)}px]`;
    }
    return 'translate-y-0';
  };

  // Touch handlers for drag gesture
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
    setCurrentY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    setCurrentY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const deltaY = currentY - startY;
    const threshold = 50;

    if (deltaY > threshold) {
      // Swipe down - reduce height or close
      if (height === 'full') {
        onHeightChange?.('half');
      } else if (height === 'half') {
        onHeightChange?.('peek');
      } else {
        onClose?.();
      }
    } else if (deltaY < -threshold) {
      // Swipe up - increase height
      if (height === 'peek') {
        onHeightChange?.('half');
      } else if (height === 'half') {
        onHeightChange?.('full');
      }
    }
    
    setCurrentY(startY);
  };

  // Handle drawer tap to expand
  const handleDrawerTap = () => {
    if (height === 'peek') {
      onHeightChange?.('half');
    }
  };

  // Render content based on mode
  const renderContent = () => {
    switch (mode) {
      case 'poi-detail':
        return selectedPOI ? (
          <POIDetailContent
            poi={selectedPOI}
            onNavigate={onPOINavigate}
            onClose={onClose}
          />
        ) : null;
        
      case 'search':
        return (
          <SearchResultsContent
            results={searchResults}
            query={searchQuery}
            onPOISelect={onPOISelect}
          />
        );
        
      case 'navigation':
        return currentRoute ? (
          <NavigationContent
            route={currentRoute}
            currentPosition={currentPosition}
          />
        ) : null;
        
      case 'camping-center':
      default:
        return (
          <CampingCenterContent
            currentPosition={currentPosition}
            weather={weather}
          />
        );
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      ref={drawerRef}
      className={`
        fixed bottom-0 left-0 right-0 z-40
        bg-white rounded-t-3xl shadow-2xl border-t border-gray-200
        ${getHeightClass()}
        ${getTranslateY()}
        transition-transform duration-300 ease-out
        ${isDragging ? '' : 'transition-transform'}
      `}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={height === 'peek' ? handleDrawerTap : undefined}
    >
      {/* Drag Handle */}
      <div className="flex justify-center py-3 cursor-pointer">
        <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
      </div>
      
      {/* Content Area */}
      <div className="flex-1 overflow-hidden px-4 pb-4">
        {renderContent()}
      </div>
      
      {/* iOS safe area padding */}
      <div className="h-safe-bottom"></div>
    </div>
  );
};