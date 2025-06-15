import { useState, useCallback } from 'react';
import { MapContainerComponent } from '@/components/Map/MapContainer';
import { MapControls } from '@/components/Navigation/MapControls';
import { FilterModal } from '@/components/Navigation/FilterModal';
import { LightweightPOIButtons } from '@/components/Navigation/LightweightPOIButtons';
import { EnhancedMapControls } from '@/components/Navigation/EnhancedMapControls';
import { CampingWeatherWidget } from '@/components/Navigation/CampingWeatherWidget';
import { TransparentOverlay } from '@/components/UI/TransparentOverlay';
import { TransparentPOIOverlay } from '@/components/Navigation/TransparentPOIOverlay';
import { TopManeuverPanel } from '@/components/Navigation/TopManeuverPanel';
import { BottomSummaryPanel } from '@/components/Navigation/BottomSummaryPanel';
import { PermanentHeader } from '@/components/UI/PermanentHeader';
import { useLocation } from '@/hooks/useLocation';
import { usePOI, useSearchPOI } from '@/hooks/usePOI';
import { useRouting } from '@/hooks/useRouting';
import { useWeather } from '@/hooks/useWeather';
import { useLanguage } from '@/hooks/useLanguage';
import { POI, NavigationRoute, TestSite, TEST_SITES } from '@/types/navigation';
import { calculateDistance, formatDistance } from '@/lib/mapUtils';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Settings } from 'lucide-react';

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

  // Voice control state
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

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
      // 1. IMMEDIATELY hide POI info box - FIRST ACTION
      setSelectedPOI(null);
      setOverlayStates({ search: false, poiInfo: false, routePlanning: false, navigation: false });
      
      // 2. Show calculating state
      setIsNavigating(false); // Clear any existing navigation
      
      // 3. Calculate route directly
      const route = await getRoute.mutateAsync({
        from: currentPosition,
        to: poi.coordinates
      });
      
      // 4. Start navigation with panel at bottom
      setCurrentRoute(route);
      setIsNavigating(true);
      setUIMode('navigation');
      setOverlayStates(prev => ({ ...prev, navigation: true }));
      
      // Navigation started - no confirmation dialog needed
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
    // Toast removed - user can see route cleared visually
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

  // POI Category Filter Handler for Quick Access
  const handleCategoryFilter = useCallback((category: string) => {
    setFilteredCategories(prev => {
      if (prev.includes(category)) {
        // Remove category if already selected
        return prev.filter(c => c !== category);
      } else {
        // Replace with single category selection for "one touch" behavior
        return [category];
      }
    });
  }, []);

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
        onPOINavigate={handleNavigateToPOI}
        onMapClick={handleMapClick}
      />

      {/* EXPLORATION MODE - Only visible when NOT navigating */}
      {!isNavigating && (
        <>
          {/* Permanent Header - Search and Location Selection */}
          <PermanentHeader
            searchQuery={searchQuery}
            onSearch={handleSearch}
            currentSite={currentSite}
            onSiteChange={handleSiteChange}
            showClearButton={shouldShowPOIs}
            onClear={handleClearPOIs}
          />

          {/* Lightweight POI Buttons - Left Side */}
          <LightweightPOIButtons 
            onCategorySelect={handleCategoryFilter}
            activeCategory={filteredCategories.length === 1 ? filteredCategories[0] : undefined}
          />

          {/* Camping Weather Widget */}
          <CampingWeatherWidget coordinates={currentPosition} />
        </>
      )}

      {/* Enhanced Map Controls - Always Visible (Right Side) */}
      <EnhancedMapControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onCenterOnLocation={handleCenterOnLocation}
        useRealGPS={useRealGPS}
        onToggleGPS={toggleGPS}
      />

      {/* GPS Testing Controls - Top Right Corner */}
      <div className="absolute top-4 right-4 z-40 flex flex-col gap-2">
        <Button
          onClick={() => !useRealGPS && toggleGPS()}
          disabled={useRealGPS}
          className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
            useRealGPS 
              ? 'bg-green-600 text-white shadow-lg' 
              : 'bg-white/10 text-gray-600 hover:bg-white/20'
          }`}
          style={{
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: useRealGPS ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
            minWidth: '80px'
          }}
        >
          Real GPS
        </Button>
        
        <Button
          onClick={() => useRealGPS && toggleGPS()}
          disabled={!useRealGPS}
          className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
            !useRealGPS 
              ? 'bg-blue-600 text-white shadow-lg' 
              : 'bg-white/10 text-gray-600 hover:bg-white/20'
          }`}
          style={{
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: !useRealGPS ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
            minWidth: '80px'
          }}
        >
          Mock GPS
        </Button>
      </div>

      {/* POI Info Overlay - Positioned below button rows */}
      {selectedPOI && (
        <TransparentPOIOverlay 
          poi={selectedPOI}
          onNavigate={handleNavigateToPOI}
          onClose={() => setSelectedPOI(null)}
        />
      )}

      {/* NAVIGATION MODE - Only visible when actively navigating */}
      {isNavigating && currentRoute && currentRoute.instructions.length > 0 && (
        <>
          {/* Top: Current Maneuver */}
          <TopManeuverPanel
            instruction={currentRoute.instructions[0].instruction}
            distance={currentRoute.instructions[0].distance}
          />

          {/* Floating Voice Controls */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className="absolute z-30 right-4 w-12 h-12 rounded-full"
            style={{ 
              top: '120px',
              background: 'rgba(255, 255, 255, 0.01)',
              backdropFilter: 'blur(40px) saturate(200%)',
              WebkitBackdropFilter: 'blur(40px) saturate(200%)',
              border: '1px solid rgba(255, 255, 255, 0.02)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)'
            }}
          >
            {voiceEnabled ? <Volume2 className="w-6 h-6 text-blue-600" /> : <VolumeX className="w-6 h-6 text-gray-500" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSettings(!showSettings)}
            className="absolute z-30 right-4 w-12 h-12 rounded-full"
            style={{ 
              top: '180px',
              background: 'rgba(255, 255, 255, 0.01)',
              backdropFilter: 'blur(40px) saturate(200%)',
              WebkitBackdropFilter: 'blur(40px) saturate(200%)',
              border: '1px solid rgba(255, 255, 255, 0.02)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)'
            }}
          >
            <Settings className="w-6 h-6 text-gray-600" />
          </Button>
          
          {/* Bottom: Trip Summary */}
          <BottomSummaryPanel
            timeRemaining={currentRoute.estimatedTime}
            distanceRemaining={currentRoute.totalDistance}
            eta={currentRoute.arrivalTime}
            onEndNavigation={handleEndNavigation}
          />
        </>
      )}





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
