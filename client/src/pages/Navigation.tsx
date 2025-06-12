import { useState, useCallback } from 'react';
import { MapContainerComponent } from '@/components/Map/MapContainer';
import { TopBar } from '@/components/Navigation/TopBar';
import { MapControls } from '@/components/Navigation/MapControls';
import { GroundNavigation } from '@/components/Navigation/GroundNavigation';
import { POIPanel } from '@/components/Navigation/POIPanel';
import { CategoryFilter } from '@/components/Navigation/CategoryFilter';

import { StatusBar } from '@/components/Navigation/StatusBar';
import { SiteSelector } from '@/components/Navigation/SiteSelector';
import { POIClearButton } from '@/components/Navigation/POIClearButton';
import { useLocation } from '@/hooks/useLocation';
import { usePOI, useSearchPOI } from '@/hooks/usePOI';
import { useRouting } from '@/hooks/useRouting';
import { POI, NavigationRoute, TestSite, TEST_SITES } from '@/types/navigation';
import { calculateDistance, formatDistance } from '@/lib/mapUtils';
import { useToast } from '@/hooks/use-toast';

export default function Navigation() {
  const [currentSite, setCurrentSite] = useState<TestSite>('kamperland');
  const { currentPosition, useRealGPS, toggleGPS } = useLocation({ currentSite });
  const { data: allPOIs = [], isLoading: poisLoading } = usePOI(currentSite);
  const { getRoute } = useRouting();
  const { toast } = useToast();

  // Map state
  const [mapCenter, setMapCenter] = useState(TEST_SITES.kamperland.coordinates);
  const [mapZoom, setMapZoom] = useState(16);
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);
  const [currentRoute, setCurrentRoute] = useState<NavigationRoute | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [filteredCategories, setFilteredCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

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
    console.log('Search triggered:', query);
    setSearchQuery(query);
  }, []);

  const handleFilter = useCallback(() => {
    // Toggle filter options - could open a modal or side panel
    toast({
      title: "Filter Options",
      description: "Use the category buttons on the left to filter POIs",
    });
  }, [toast]);

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
  }, []);

  const handleMapClick = useCallback(() => {
    if (selectedPOI) {
      setSelectedPOI(null);
    }
  }, [selectedPOI]);

  const handleNavigateToPOI = useCallback(async (poi: POI) => {
    try {
      const route = await getRoute.mutateAsync({
        from: currentPosition,
        to: poi.coordinates
      });
      
      setCurrentRoute(route);
      setIsNavigating(true);
      setSelectedPOI(null);
      
      toast({
        title: "Route Calculated",
        description: `Navigation started to ${poi.name}`,
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
      title: "Site Changed",
      description: `Switched to ${TEST_SITES[site].name}`,
    });
  }, [toast]);

  const handleClearPOIs = useCallback(() => {
    setSearchQuery('');
    setFilteredCategories([]);
    setSelectedPOI(null);
    
    toast({
      title: "POIs Cleared",
      description: "All POI markers have been hidden",
    });
  }, [toast]);

  if (poisLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading campground map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full overflow-hidden">
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

      <TopBar
        currentPosition={currentPosition}
        useRealGPS={useRealGPS}
        onSearch={handleSearch}
        onFilter={handleFilter}
        onToggleGPS={toggleGPS}
      />

      <MapControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onCenterOnLocation={handleCenterOnLocation}
      />

      {currentRoute && (
        <GroundNavigation
          route={currentRoute}
          currentPosition={currentPosition}
          isVisible={isNavigating}
          onEndNavigation={handleEndNavigation}
        />
      )}

      <POIPanel
        poi={selectedPOI}
        isVisible={!!selectedPOI && !isNavigating}
        onNavigate={handleNavigateToPOI}
        onClose={handleClosePOIPanel}
      />

      <CategoryFilter
        filteredCategories={filteredCategories}
        onToggleCategory={handleToggleCategory}
      />

      <div className="absolute top-28 left-4 right-4 z-50">
        <div className="flex space-x-2">
          <SiteSelector
            currentSite={currentSite}
            onSiteChange={handleSiteChange}
          />
          <POIClearButton
            onClear={handleClearPOIs}
            disabled={!shouldShowPOIs}
          />
        </div>
      </div>



      <StatusBar currentPosition={currentPosition} />
    </div>
  );
}
