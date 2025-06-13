import { useState, useCallback } from 'react';
import { MapContainerComponent } from '@/components/Map/MapContainer';
import { MapControls } from '@/components/Navigation/MapControls';
import { FilterModal } from '@/components/Navigation/FilterModal';
// QuickPOIIcons removed - integrated into permanent header
import { TransparentOverlay } from '@/components/UI/TransparentOverlay';
import { PermanentHeader } from '@/components/UI/PermanentHeader';
import { useLocation } from '@/hooks/useLocation';
import { usePOI, useSearchPOI } from '@/hooks/usePOI';
import { useRouting } from '@/hooks/useRouting';
import { useWeather } from '@/hooks/useWeather';
import { useLanguage } from '@/hooks/useLanguage';
import { POI, NavigationRoute, TestSite, TEST_SITES } from '@/types/navigation';
import { calculateDistance, formatDistance } from '@/lib/mapUtils';
import { useToast } from '@/hooks/use-toast';

export default function Navigation() {
  const [currentSite, setCurrentSite] = useState<TestSite>('kamperland');
  const { currentPosition, useRealGPS, toggleGPS } = useLocation({ currentSite });
  const { data: allPOIs = [], isLoading: poisLoading } = usePOI(currentSite);
  const { data: weather } = useWeather(currentPosition.lat, currentPosition.lng);
  const { getRoute } = useRouting();
  const { toast } = useToast();
  const { t } = useLanguage();

  // Map state
  const [mapCenter, setMapCenter] = useState(TEST_SITES.kamperland.coordinates);
  const [mapZoom, setMapZoom] = useState(16);
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);
  const [currentRoute, setCurrentRoute] = useState<NavigationRoute | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [filteredCategories, setFilteredCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [currentPanel, setCurrentPanel] = useState<'map' | 'search' | 'navigation' | 'settings'>('map');
  
  // Transparent Overlay UI state
  const [uiMode, setUIMode] = useState<'start' | 'search' | 'poi-info' | 'route-planning' | 'navigation'>('start');
  const [overlayStates, setOverlayStates] = useState({
    search: false,
    poiInfo: false,
    routePlanning: false,
    navigation: false
  });

  // Search functionality - include category filter for search
  const selectedCategory = filteredCategories.length === 1 ? filteredCategories[0] : undefined;
  const { data: searchResults = [] } = useSearchPOI(searchQuery, currentSite, selectedCategory);
  
  // Filter POIs based on search and category selection - only show when searched
  let displayPOIs: POI[] = [];
  
  if (searchQuery.length > 0) {
    // Use search results (already filtered by category if single category selected)
    displayPOIs = searchResults;
  } else if (filteredCategories.length > 0) {
    // Apply category filtering to all POIs
    displayPOIs = allPOIs.filter(poi => filteredCategories.includes(poi.category));
  }
  // Don't show POIs by default - only when searched or filtered
  const shouldShowPOIs = displayPOIs.length > 0;

  // Add distance to POIs
  const poisWithDistance = displayPOIs.map(poi => ({
    ...poi,
    distance: formatDistance(calculateDistance(currentPosition, poi.coordinates))
  }));



  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (query.length > 0) {
      setUIMode('search');
      setOverlayStates(prev => ({ ...prev, search: true }));
    } else {
      setUIMode('start');
      setOverlayStates(prev => ({ ...prev, search: false }));
    }
  }, []);

  const handleFilter = useCallback(() => {
    setShowFilterModal(true);
  }, []);

  // Removed hamburger menu - using permanent header approach

  const handleZoomIn = useCallback(() => {
    setMapZoom(prev => Math.min(prev + 1, 19));
  }, []);

  const handleZoomOut = useCallback(() => {
    setMapZoom(prev => Math.max(prev - 1, 1));
  }, []);

  const handleCenterOnLocation = useCallback(() => {
    setMapCenter(currentPosition);
    setMapZoom(16);
  }, [currentPosition]);

  const handlePOIClick = useCallback((poi: POI) => {
    setSelectedPOI(poi);
    setMapCenter(poi.coordinates);
    setUIMode('poi-info');
    setOverlayStates(prev => ({ ...prev, poiInfo: true, search: false }));
  }, []);

  const handlePOISelect = useCallback((poi: POI) => {
    setSelectedPOI(poi);
    setMapCenter(poi.coordinates);
    setUIMode('poi-info');
    setOverlayStates(prev => ({ ...prev, poiInfo: true, search: false }));
  }, []);

  const handleMapClick = useCallback(() => {
    if (selectedPOI) {
      setSelectedPOI(null);
      setUIMode('start');
      setOverlayStates(prev => ({ ...prev, poiInfo: false }));
    }
  }, [selectedPOI]);

  const handleNavigateToPOI = useCallback(async (poi: POI) => {
    try {
      // 1. IMMEDIATELY hide POI info and clear all overlays
      setSelectedPOI(null);
      setOverlayStates({ search: false, poiInfo: false, routePlanning: false, navigation: false });
      
      // 2. Calculate route directly
      const route = await getRoute.mutateAsync({
        from: currentPosition,
        to: poi.coordinates
      });
      
      // 3. Start navigation
      setCurrentRoute(route);
      setIsNavigating(true);
      setUIMode('navigation');
      setOverlayStates(prev => ({ ...prev, navigation: true }));
      
      toast({
        title: "Navigation Started",
        description: `Route to ${poi.name}`,
      });
    } catch (error) {
      toast({
        title: "Route Error",
        description: "Failed to calculate route. Please try again.",
        variant: "destructive",
      });
    }
  }, [currentPosition, getRoute, toast]);

  const handleEndNavigation = useCallback(() => {
    setCurrentRoute(null);
    setIsNavigating(false);
    setUIMode('start');
    setOverlayStates(prev => ({ ...prev, navigation: false }));
    toast({
      title: "Navigation Ended",
      description: "Route has been cleared",
    });
  }, [toast]);



  const handleClosePOIPanel = useCallback(() => {
    setSelectedPOI(null);
  }, []);

  const handleToggleCategory = useCallback((category: string) => {
    setFilteredCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else if (prev.length === 0) {
        // If no categories selected, select only this one
        return [category];
      } else {
        // Add to existing selection
        return [...prev, category];
      }
    });
  }, []);

  const handleSiteChange = useCallback((site: TestSite) => {
    setCurrentSite(site);
    setMapCenter(TEST_SITES[site].coordinates);
    setMapZoom(16);
    setSelectedPOI(null);
    setCurrentRoute(null);
    setIsNavigating(false);
    setSearchQuery('');
    setFilteredCategories([]);
    
    toast({
      title: t('alerts.siteChanged'),
      description: `${t('alerts.siteSwitched')} ${TEST_SITES[site].name}`,
    });
  }, [toast]);

  const handleClearPOIs = useCallback(() => {
    setSearchQuery('');
    setFilteredCategories([]);
    setSelectedPOI(null);
    setUIMode('start');
    setOverlayStates(prev => ({ ...prev, search: false, poiInfo: false }));
    
    toast({
      title: t('alerts.poisCleared'),
      description: t('alerts.poisHidden'),
    });
  }, [toast, t]);

  const handleCloseOverlay = useCallback(() => {
    setSelectedPOI(null);
    setUIMode('start');
    setOverlayStates(prev => ({ ...prev, search: false, poiInfo: false, routePlanning: false }));
  }, []);

  // Gesture navigation handlers
  const handleNavigateLeft = useCallback(() => {
    const panels = ['search', 'map', 'navigation', 'settings'] as const;
    const currentIndex = panels.indexOf(currentPanel);
    if (currentIndex > 0) {
      setCurrentPanel(panels[currentIndex - 1]);
    }
  }, [currentPanel]);

  const handleNavigateRight = useCallback(() => {
    const panels = ['search', 'map', 'navigation', 'settings'] as const;
    const currentIndex = panels.indexOf(currentPanel);
    if (currentIndex < panels.length - 1) {
      setCurrentPanel(panels[currentIndex + 1]);
    }
  }, [currentPanel]);

  if (poisLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('status.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Map Container - 100% Visible, Always Interactive */}
      <MapContainerComponent
        center={mapCenter}
        zoom={mapZoom}
        currentPosition={currentPosition}
        pois={poisWithDistance}
        selectedPOI={selectedPOI}
        route={currentRoute}
        filteredCategories={filteredCategories}
        onPOIClick={handlePOIClick}
        onMapClick={handleMapClick}
      />

      {/* Permanent Header - Always Visible */}
      <PermanentHeader
        searchQuery={searchQuery}
        onSearch={handleSearch}
        currentSite={currentSite}
        onSiteChange={handleSiteChange}
        showClearButton={shouldShowPOIs}
        onClear={handleClearPOIs}
      />

      {/* Map Controls - Right Side Vertical */}
      <MapControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onCenterOnLocation={handleCenterOnLocation}
        useRealGPS={useRealGPS}
        onToggleGPS={toggleGPS}
      />

      {/* POI Info Transparent Overlay */}
      <TransparentOverlay
        isVisible={overlayStates.poiInfo && !!selectedPOI}
        position="bottom"
        onClose={handleCloseOverlay}
        animation="slide"
      >
        {selectedPOI && (
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-600 rounded-xl p-3 flex-shrink-0">
                <span className="text-white text-xl">🏕️</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-black mb-1"
                    style={{ textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)' }}>
                  {selectedPOI.name}
                </h3>
                <p className="text-gray-700 mb-2 font-medium"
                   style={{ textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)' }}>
                  {selectedPOI.category}
                </p>
                {selectedPOI.distance && (
                  <p className="text-sm text-gray-600 font-medium"
                     style={{ textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)' }}>
                    📍 {selectedPOI.distance} away
                  </p>
                )}
              </div>
            </div>
            
            <button
              onClick={() => handleNavigateToPOI(selectedPOI)}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 px-6 rounded-xl
                         hover:from-blue-700 hover:to-blue-800 transition-all duration-200
                         shadow-lg hover:shadow-xl transform hover:scale-[1.02]
                         flex items-center justify-center space-x-2"
            >
              <span>🧭</span>
              <span>Navigate Here</span>
            </button>
          </div>
        )}
      </TransparentOverlay>

      {/* Navigation Overlay - Bottom Position */}
      <TransparentOverlay
        isVisible={overlayStates.navigation && !!currentRoute}
        position="bottom"
        animation="slide"
        className="mb-20"
      >
        {currentRoute && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-black"
                  style={{ textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)' }}>
                Navigation Active
              </h3>
              <button
                onClick={handleEndNavigation}
                className="text-red-600 hover:text-red-700 font-medium text-sm px-3 py-1 rounded-lg"
                style={{
                  background: 'rgba(255, 0, 0, 0.1)',
                  backdropFilter: 'blur(4px)',
                  border: '1px solid rgba(255, 0, 0, 0.2)'
                }}
              >
                End Navigation
              </button>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-700 font-medium">
              <span style={{ textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)' }}>
                📍 {currentRoute.totalDistance}
              </span>
              <span style={{ textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)' }}>
                ⏱️ {currentRoute.estimatedTime}
              </span>
              <span style={{ textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)' }}>
                🚗 ETA: {currentRoute.arrivalTime}
              </span>
            </div>
          </div>
        )}
      </TransparentOverlay>

      {/* Weather Widget - Bottom Right */}
      <div className="absolute bottom-4 right-4 z-30">
        <div className="rounded-xl border border-white/20 px-3 py-2 min-w-[120px]"
             style={{
               background: 'rgba(255, 255, 255, 0.3)',
               backdropFilter: 'blur(12px) saturate(180%)',
               boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
             }}>
          {weather && (
            <div className="flex flex-col space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold text-gray-800"
                      style={{ textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)' }}>
                  {Math.round(weather.temperature)}°C
                </span>
              </div>
              <div className="text-xs text-gray-600 capitalize font-medium"
                   style={{ textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)' }}>
                {weather.condition}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filter Modal - Preserved */}
      <FilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        filteredCategories={filteredCategories}
        onToggleCategory={handleToggleCategory}
      />
    </div>
  );
}
