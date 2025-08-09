import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { MapContainer } from '@/components/Map/MapContainer';
import { MapControls } from '@/components/Navigation/MapControls';
import { LightweightPOIButtons } from '@/components/Navigation/LightweightPOIButtons';
import { EnhancedMapControls } from '@/components/Navigation/EnhancedMapControls';
import { CampingWeatherWidget } from '@/components/Navigation/CampingWeatherWidget';
import { TransparentOverlay } from '@/components/UI/TransparentOverlay';
import { TransparentPOIOverlay } from '@/components/Navigation/TransparentPOIOverlay';
import { TopManeuverPanel } from '@/components/Navigation/TopManeuverPanel';
import { BottomSummaryPanel } from '@/components/Navigation/BottomSummaryPanel';
import { PermanentHeader } from '@/components/UI/PermanentHeader';
import { TravelModeSelector } from '@/components/Navigation/TravelModeSelector';
import { CampgroundRerouteDetector } from '@/lib/campgroundRerouting';
import { useLocation } from '@/hooks/useLocation';
import { usePOI, useSearchPOI } from '@/hooks/usePOI';
import { useRouting } from '@/hooks/useRouting';
import { useWeather } from '@/hooks/useWeather';
import { useLanguage } from '@/hooks/useLanguage';
import { useNavigationTracking } from '@/hooks/useNavigationTracking';
import { mobileLogger } from '@/utils/mobileLogger';
import { POI, NavigationRoute, TestSite, TEST_SITES, Coordinates } from '@/types/navigation';
import { calculateDistance, formatDistance, calculateBearing } from '@/lib/mapUtils';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Settings } from 'lucide-react';
import { VoiceGuide } from '@/lib/voiceGuide';
import { RouteTracker } from '@/lib/routeTracker';
import { GestureEnhancedMap } from '@/components/Map/GestureEnhancedMap';
import { Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';


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

  // New state for destination marker
  const [destinationMarker, setDestinationMarker] = useState<{ lat: number; lng: number } | null>(null);

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

  // Travel mode state for routing
  const [travelMode, setTravelMode] = useState<'car' | 'bike' | 'pedestrian'>('pedestrian');

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
          setCurrentBearing(routeBearing);
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

  // Filter POIs based on search and category selection
  let displayPOIs: POI[] = [];

  if (searchQuery.length > 0) {
    // Use search results (already filtered by category if single category selected)
    displayPOIs = searchResults;
  } else if (filteredCategories.length > 0 && allPOIs) {
    // Filter POIs directly without problematic memoization
    displayPOIs = allPOIs.filter(poi => poi && poi.category && filteredCategories.includes(poi.category));
  }
  // Show POIs when searched or filtered
  const shouldShowPOIs = displayPOIs.length > 0;

  console.log('🔍 DISPLAY POIs DEBUG:', {
    searchQuery: searchQuery.length,
    filteredCategoriesCount: filteredCategories.length,
    displayPOIsCount: displayPOIs.length,
    shouldShowPOIs,
    firstPOI: displayPOIs[0]?.name || 'none'
  });

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

  // Removed filter modal trigger from here, replaced by LightweightPOIButtons for quick filter
  // const handleFilter = useCallback(() => {
  //   setShowFilterModal(true);
  // }, []);

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

  // New handler for setting destination marker and initiating route planning
  const handleDestinationTap = useCallback((event: L.LeafletMouseEvent) => {
    console.log('🗺️ MAP TAP DEBUG: Destination tap detected at', event.latlng);
    const newDestination = { lat: event.latlng.lat, lng: event.latlng.lng };
    setDestinationMarker(newDestination);
    setMapCenter(newDestination); // Center map on the new destination
    setUIMode('route-planning');
    setOverlayStates(prev => ({ ...prev, routePlanning: true, search: false, poiInfo: false }));
    setCurrentRoute(null); // Clear existing route
    setIsNavigating(false); // Ensure we are not in navigating mode
    toast({
      title: "Destination Set",
      description: `Navigate to ${newDestination.lat.toFixed(4)}, ${newDestination.lng.toFixed(4)}?`,
      action: (
        <Button variant="outline" size="sm" onClick={() => {
          // Logic to start navigation to this destination
          // For now, we'll just log it. A full route calculation would go here.
          console.log(`Planning route to destination: ${JSON.stringify(newDestination)}`);
          // Example: Call getRoute or similar logic
          // handleNavigateToDestination(newDestination); // You would implement this function
          toast({ title: "Route calculation initiated." });
        }}>
          Go
        </Button>
      ),
    });
  }, [toast]);


  const handleNavigateToPOI = useCallback(async (poi: POI) => {
    const startTime = performance.now();
    mobileLogger.log('NAVIGATION', `Starting navigation to ${poi.name} with mode: ${travelMode}`);

    try {
      // 1. IMMEDIATELY hide POI info box - FIRST ACTION
      setSelectedPOI(null);

      console.log('🚗 TRAVEL MODE DEBUG:', { selectedMode: travelMode, profileMapping: travelMode === 'pedestrian' ? 'walking' : travelMode === 'car' ? 'driving' : 'cycling' });
      setOverlayStates({ search: false, poiInfo: false, routePlanning: false, navigation: false });

      // Clear any existing route to force fresh calculation
      setCurrentRoute(null);

      // 2. Show calculating state
      setIsNavigating(false); // Clear any existing navigation

      // 3. Calculate route with selected travel mode
      const profile = travelMode === 'pedestrian' ? 'walking' : travelMode === 'car' ? 'driving' : 'cycling';
      console.log('🚗 ROUTING WITH PROFILE:', profile, 'from travel mode:', travelMode);

      const route = await getRoute.mutateAsync({
        from: currentPosition,
        to: poi.coordinates,
        profile
      });

      // 4. Start navigation with panel at bottom
      setCurrentRoute(route);
      setIsNavigating(true);

      // Auto-switch to driving orientation during navigation
      setMapOrientation('driving');

      mobileLogger.logPerformance('Navigation setup', startTime);
      mobileLogger.log('NAVIGATION', `Navigation started successfully to ${poi.name}`);
      setUIMode('navigation');
      setOverlayStates(prev => ({ ...prev, navigation: true }));

      // Navigation started - no confirmation dialog needed
    } catch (error) {
      mobileLogger.log('ERROR', `Navigation failed: ${error}`);
      toast({
        title: "Route Error",
        description: "Failed to calculate route. Please try again.",
        variant: "destructive",
      });
    }
  }, [currentPosition, getRoute, toast, travelMode]);

  const handleEndNavigation = useCallback(() => {
    mobileLogger.log('NAVIGATION', 'Navigation ended by user');
    setCurrentRoute(null);
    setIsNavigating(false);
    setUIMode('start');
    setOverlayStates(prev => ({ ...prev, navigation: false }));

    // Reset map orientation to north when navigation ends
    setMapOrientation('north');

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
    setDestinationMarker(null); // Clear destination marker on site change

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
    setDestinationMarker(null); // Clear destination marker

    toast({
      title: t('alerts.poisCleared'),
      description: t('alerts.poisHidden'),
    });
  }, [toast, t]);

  const handleCloseOverlay = useCallback(() => {
    setSelectedPOI(null);
    setUIMode('start');
    setOverlayStates(prev => ({ ...prev, search: false, poiInfo: false, routePlanning: false }));
    setDestinationMarker(null); // Clear destination marker
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

  // Voice toggle handler
  const handleToggleVoice = useCallback(() => {
    const newVoiceState = !voiceEnabled;
    setVoiceEnabled(newVoiceState);

    if (voiceGuideRef.current) {
      if (newVoiceState) {
        voiceGuideRef.current.enable();
      } else {
        voiceGuideRef.current.disable();
      }
    }
  }, [voiceEnabled]);

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

      // Auto-switch to driving orientation when using navigation style during active navigation
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

  console.log('🔍 Navigation: Starting render...', {
    position: !!trackingPosition,
    isNavigating,
    selectedPOI: !!selectedPOI
  });

  // Define a simple icon for the destination marker
  const destinationIcon = L.divIcon({
    className: 'custom-destination-marker',
    html: `<div style="
      background: #ff4444; 
      width: 20px; 
      height: 20px; 
      border-radius: 50%; 
      border: 3px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      position: relative;
    ">
      <div style="
        position: absolute;
        top: -8px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 10px;
      ">📍</div>
    </div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });

  try {
    // Display POIs logic
    const displayPOIs = useMemo(() => {
      console.log(`🔍 DISPLAY POIs DEBUG:`, {
        'searchQuery': searchQuery.length,
        'filteredCategoriesCount': filteredCategories.length,
        'displayPOIsCount': allPOIs?.length || 0,
        'shouldShowPOIs': (filteredCategories.length > 0 || searchQuery.trim().length > 0),
        'firstPOI': allPOIs?.[0]?.name || 'none'
      });

      if (!allPOIs) {
        console.log(`🔍 DISPLAY POIs DEBUG: No POI data available`);
        return [];
      }

      let filtered = allPOIs;
      console.log(`🔍 DISPLAY POIs DEBUG: Starting with ${filtered.length} total POIs`);

      // Apply category filters
      if (filteredCategories.length > 0) {
        console.log(`🔍 DISPLAY POIs DEBUG: Applying category filters:`, filteredCategories);
        const beforeFilter = filtered.length;
        filtered = filtered.filter(poi => poi && poi.category && filteredCategories.includes(poi.category));
        console.log(`🔍 DISPLAY POIs DEBUG: Category filter reduced POIs from ${beforeFilter} to ${filtered.length}`);

        if (filtered.length === 0) {
          console.log(`🔍 DISPLAY POIs DEBUG: No POIs match selected categories. Available categories:`, 
            [...new Set(allPOIs.map(poi => poi.category))]);
        }
      }

      // Apply search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        console.log(`🔍 DISPLAY POIs DEBUG: Applying search filter: "${query}"`);
        const beforeSearch = filtered.length;
        filtered = filtered.filter(poi => 
          poi.name.toLowerCase().includes(query) ||
          poi.category.toLowerCase().includes(query) ||
          poi.description?.toLowerCase().includes(query)
        );
        console.log(`🔍 DISPLAY POIs DEBUG: Search filter reduced POIs from ${beforeSearch} to ${filtered.length}`);
      }

      console.log(`🔍 DISPLAY POIs DEBUG: Final filtered POIs count: ${filtered.length}`);
      if (filtered.length > 0) {
        console.log(`🔍 DISPLAY POIs DEBUG: Sample filtered POIs:`, filtered.slice(0, 3).map(poi => ({
          name: poi.name,
          category: poi.category
        })));
      }

      return filtered;
    }, [allPOIs, filteredCategories, searchQuery]);

    const shouldShowPOIs = displayPOIs.length > 0;

    console.log('🔍 POI RENDERING DEBUG:', {
      totalPOIs: displayPOIs.length,
      filteredCategories,
      firstFewPOIs: displayPOIs.slice(0, 3).map(poi => poi.name),
      poiDataLoading: poisLoading,
      poiDataError: undefined, // Assuming usePOI hook handles error display if any
      shouldShowPOIs
    });

    // Handle loading state within main render flow
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
        <MapContainer
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
          mapStyle={mapStyle}
        >
          {/* GestureEnhancedMap for handling taps */}
          <GestureEnhancedMap
            onDoubleTab={handlePOIClick}
            onLongPress={handlePOIClick}
            onSingleTap={handleDestinationTap}
          />

          {/* Current route line */}
          {currentRoute && currentRoute.geometry && (
            <Polyline 
              positions={currentRoute.geometry.map(coord => [coord[1], coord[0]])}
              color="blue" 
              weight={6}
              opacity={0.7}
            />
          )}

          {/* Destination marker */}
          {destinationMarker && (
            <Marker 
              position={[destinationMarker.lat, destinationMarker.lng]} 
              icon={destinationIcon}
            >
              <Popup>
                <div className="text-center">
                  <strong>Destination</strong><br />
                  {destinationMarker.lat.toFixed(4)}, {destinationMarker.lng.toFixed(4)}
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>

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
              selectedPOI={!!selectedPOI}
            />



            {/* Camping Weather Widget */}
            <CampingWeatherWidget coordinates={currentPosition} />
          </>
        )}

        {/* Enhanced Map Controls - Always Visible (Right Side) */}
        <EnhancedMapControls
          onToggleVoice={handleToggleVoice}
          onMapStyleChange={handleMapStyleChange}
          isVoiceEnabled={voiceEnabled}
          mapStyle={mapStyle}
          useRealGPS={useRealGPS}
          onToggleGPS={toggleGPS}
          travelMode={travelMode}
          onTravelModeChange={setTravelMode}
        />

        {/* POI Info Overlay - Positioned below button rows */}
        {selectedPOI && (
          <TransparentPOIOverlay 
            poi={selectedPOI}
            onNavigate={handleNavigateToPOI}
            onClose={() => setSelectedPOI(null)}
          />
        )}

        {/*NAVIGATION MODE - Only visible when actively navigating */}
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
            <div style={{ zIndex: 35 }}>
              <BottomSummaryPanel
                timeRemaining={currentRoute.estimatedTime}
                distanceRemaining={currentRoute.totalDistance}
                eta={currentRoute.arrivalTime}
                onEndNavigation={handleEndNavigation}
              />
            </div>
          </>
        )}

        {/* Filter Modal - Preserved */}
        {/* The FilterModal is no longer directly controlled by a button click, 
            but the state and component remain in case it's needed for future refinements 
            or if the LightweightPOIButtons are expanded to trigger it. */}
        <div style={{ display: showFilterModal ? 'block' : 'none' }}>
          {/* Placeholder for FilterModal if needed in future, managed via state */}
        </div>
      </div>
    );
  } catch (error) {
    console.error('🚨 Navigation: Render error:', error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 max-w-md w-full shadow-lg border border-white/20">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-6 h-6 text-red-500">⚠️</div>
            <h2 className="text-lg font-semibold text-gray-900">Navigation Error</h2>
          </div>

          <p className="text-gray-600 mb-4">
            The navigation component encountered an error. Check the console for details.
          </p>

          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reload App
          </button>

          {import.meta.env.DEV && (
            <details className="mt-4 text-xs">
              <summary className="cursor-pointer text-gray-500">Error Details</summary>
              <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                {error?.toString()}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  }
}