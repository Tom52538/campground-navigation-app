import { useState, useCallback, useEffect, useRef } from 'react';
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
import { CampgroundRerouteDetector } from '@/lib/campgroundRerouting';
import { useLocation } from '@/hooks/useLocation';
import { usePOI, useSearchPOI } from '@/hooks/usePOI';
import { useRouting } from '@/hooks/useRouting';
import { useWeather } from '@/hooks/useWeather';
import { useLanguage } from '@/hooks/useLanguage';
import { useNavigationTracking } from '@/hooks/useNavigationTracking';
import { POI, NavigationRoute, TestSite, TEST_SITES } from '@/types/navigation';
import { calculateDistance, formatDistance } from '@/lib/mapUtils';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Settings } from 'lucide-react';
import { VoiceGuide } from '@/lib/voiceGuide';
import { RouteTracker } from '@/lib/routeTracker';

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
  
  // Map orientation and style state
  const [mapOrientation, setMapOrientation] = useState<'north' | 'driving'>('north');
  const [mapStyle, setMapStyle] = useState<'outdoors' | 'satellite' | 'streets' | 'navigation'>('outdoors');
  
  // Navigation tracking state
  const voiceGuideRef = useRef<VoiceGuide | null>(null);
  const routeTrackerRef = useRef<RouteTracker | null>(null);
  const campgroundRerouteRef = useRef<CampgroundRerouteDetector | null>(null);
  const [currentInstruction, setCurrentInstruction] = useState<string>('');
  const [nextDistance, setNextDistance] = useState<string>('');
  const [routeProgress, setRouteProgress] = useState<any>(null);
  
  // Initialize navigation tracking - but only when using real GPS
  const { currentPosition: livePosition } = useNavigationTracking(isNavigating && useRealGPS, {
    enableHighAccuracy: true,
    updateInterval: 1000,
    adaptiveTracking: true
  });
  
  // Use live position only when navigating AND using real GPS, otherwise use mock position
  const trackingPosition = (isNavigating && useRealGPS && livePosition) ? livePosition.position : currentPosition;
  
  // Calculate bearing for driving direction mode
  const [currentBearing, setCurrentBearing] = useState(0);
  const lastPositionRef = useRef<Coordinates | null>(null);
  
  useEffect(() => {
    if (mapOrientation === 'driving' && isNavigating) {
      // Calculate bearing from movement when using real GPS
      if (useRealGPS && livePosition && lastPositionRef.current) {
        const bearing = calculateBearing(lastPositionRef.current, livePosition.position);
        if (!isNaN(bearing)) {
          console.log('📍 Calculated bearing from movement:', bearing);
          setCurrentBearing(bearing);
        }
      }
      // For mock GPS, use route direction if available or calculate from route steps
      else if (!useRealGPS && currentRoute && currentRoute.steps && currentRoute.steps.length > 0) {
        // Use bearing from current route step or calculate from coordinates
        const currentStep = currentRoute.steps[routeProgress?.currentStep || 0];
        if (currentStep && currentStep.maneuver?.bearing_after !== undefined) {
          const routeBearing = currentStep.maneuver.bearing_after;
          console.log('📍 Using route step bearing for mock GPS:', routeBearing);
          setCurrentBearing(routeBearing);
        } else if (routeProgress?.heading) {
          console.log('📍 Using route progress bearing:', routeProgress.heading);
          setCurrentBearing(routeProgress.heading);
        } else {
          // Default driving direction simulation for testing
          setCurrentBearing(45); // Northeast direction for testing
          console.log('📍 Using default test bearing: 45 degrees');
        }
      }
      // Store current position for next calculation
      if (livePosition) {
        lastPositionRef.current = livePosition.position;
      }
    }
  }, [livePosition, mapOrientation, isNavigating, useRealGPS, currentRoute, routeProgress]);
  
  // Debug logging for position tracking
  useEffect(() => {
    console.log(`🔍 NAVIGATION DEBUG: Position tracking - isNavigating: ${isNavigating}, useRealGPS: ${useRealGPS}, livePosition:`, livePosition, 'trackingPosition:', trackingPosition);
    
    if (isNavigating && !useRealGPS) {
      console.log(`🔍 NAVIGATION DEBUG: Navigation started with MOCK GPS - position should stay locked to:`, currentPosition);
    }
    
    if (isNavigating && useRealGPS) {
      console.log(`🔍 NAVIGATION DEBUG: Navigation started with REAL GPS - using live tracking`);
    }
  }, [isNavigating, useRealGPS, livePosition, trackingPosition, currentPosition]);

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
    distance: formatDistance(calculateDistance(trackingPosition, poi.coordinates))
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
    
    // Clean up navigation tracking
    if (routeTrackerRef.current) {
      routeTrackerRef.current.reset();
      routeTrackerRef.current = null;
    }
  }, []);



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

  // Map orientation toggle handler
  const handleToggleOrientation = useCallback(() => {
    setMapOrientation(prev => prev === 'north' ? 'driving' : 'north');
  }, []);

  // Enhanced map style change handler with Railway debugging
  const handleMapStyleChange = useCallback((style: 'outdoors' | 'satellite' | 'streets' | 'navigation') => {
    console.log('🗺️ DEBUG - Navigation.tsx handleMapStyleChange:', {
      newStyle: style,
      currentStyle: mapStyle,
      isNavigating,
      environment: import.meta.env.MODE,
      userAgent: navigator.userAgent.substring(0, 100),
      timestamp: new Date().toISOString()
    });
    
    try {
      setMapStyle(style);
      console.log('🗺️ DEBUG - setMapStyle completed successfully');
      
      // Auto-switch to navigation mode when using navigation style during active navigation
      if (style === 'navigation' && isNavigating) {
        console.log('🗺️ DEBUG - Auto-switching to driving orientation for navigation style');
        setMapOrientation('driving');
      }
      
      // Force re-render of map component
      setTimeout(() => {
        console.log('🗺️ DEBUG - Map style change should be visible now');
      }, 100);
      
    } catch (error) {
      console.error('🗺️ ERROR - handleMapStyleChange failed:', error);
      // Fallback to default style if something goes wrong
      setMapStyle('outdoors');
    }
  }, [isNavigating, mapStyle]);

  // Initialize voice guide when component mounts
  useEffect(() => {
    try {
      if (!voiceGuideRef.current) {
        voiceGuideRef.current = new VoiceGuide();
      }
    } catch (error) {
      console.error('Voice guide initialization failed:', error);
      voiceGuideRef.current = null;
    }
  }, []);

  // Update voice enabled state
  useEffect(() => {
    try {
      if (voiceGuideRef.current) {
        if (voiceEnabled) {
          voiceGuideRef.current.enable();
        } else {
          voiceGuideRef.current.disable();
        }
      }
    } catch (error) {
      console.error('Voice guide control failed:', error);
    }
  }, [voiceEnabled]);

  // Navigation tracking - Initialize route tracker when navigation starts
  useEffect(() => {
    if (isNavigating && currentRoute && trackingPosition) {
      console.log('Initializing route tracker for navigation');
      
      routeTrackerRef.current = new RouteTracker(
        currentRoute,
        (step) => {
          // Update current instruction when step changes
          if (currentRoute.instructions[step]) {
            const instruction = currentRoute.instructions[step].instruction;
            setCurrentInstruction(instruction);
            
            // Voice announcement with native German instructions from OpenRouteService
            if (voiceGuideRef.current && voiceEnabled) {
              voiceGuideRef.current.speak(instruction, 'high');
            }
          }
        },
        () => {
          // Navigation completed
          console.log('Navigation completed');
          if (voiceGuideRef.current && voiceEnabled) {
            voiceGuideRef.current.speak('Sie haben Ihr Ziel erreicht', 'high');
          }
          handleEndNavigation();
        },
        (distance) => {
          // Off route detection
          console.log('Off route detected, distance:', distance);
          if (voiceGuideRef.current && voiceEnabled) {
            voiceGuideRef.current.speak('Route wird neu berechnet', 'medium');
          }
        }
      );

      // Set initial instruction
      if (currentRoute.instructions.length > 0) {
        setCurrentInstruction(currentRoute.instructions[0].instruction);
        setNextDistance(currentRoute.instructions[0].distance);
      }
    }

    return () => {
      if (routeTrackerRef.current) {
        routeTrackerRef.current.reset();
        routeTrackerRef.current = null;
      }
    };
  }, [isNavigating, currentRoute, voiceEnabled, handleEndNavigation]);

  // Live position tracking during navigation
  useEffect(() => {
    if (isNavigating && routeTrackerRef.current && trackingPosition) {
      const progress = routeTrackerRef.current.updatePosition(trackingPosition);
      setRouteProgress(progress);
      setNextDistance(formatDistance(progress.distanceToNext));
      
      // Update map center to follow user during navigation
      setMapCenter(trackingPosition);
    }
  }, [isNavigating, trackingPosition]);

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
        currentPosition={trackingPosition}
        pois={poisWithDistance}
        selectedPOI={selectedPOI}
        route={currentRoute}
        filteredCategories={filteredCategories}
        onPOIClick={handlePOIClick}
        onPOINavigate={handleNavigateToPOI}
        onMapClick={handleMapClick}
        mapOrientation={mapOrientation}
        bearing={routeProgress?.heading || 0}
        mapStyle={mapStyle}
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
        mapOrientation={mapOrientation}
        onToggleOrientation={handleToggleOrientation}
        mapStyle={mapStyle}
        onMapStyleChange={handleMapStyleChange}
      />



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
            instruction={currentInstruction || currentRoute.instructions[0].instruction}
            distance={nextDistance || currentRoute.instructions[0].distance}
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
