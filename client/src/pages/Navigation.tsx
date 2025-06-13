import { useState, useCallback } from 'react';
import { MapContainerComponent } from '@/components/Map/MapContainer';
import { FilterModal } from '@/components/Navigation/FilterModal';
import { LightweightPOIButtons } from '@/components/Navigation/LightweightPOIButtons';
import { EnhancedMapControls } from '@/components/Navigation/EnhancedMapControls';
import { CampingWeatherWidget } from '@/components/Navigation/CampingWeatherWidget';
import { TransparentPOIOverlay } from '@/components/Navigation/TransparentPOIOverlay';
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
  // State management
  const [currentSite, setCurrentSite] = useState<TestSite>('kamperland');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCategories, setFilteredCategories] = useState<string[]>([]);
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);
  const [currentRoute, setCurrentRoute] = useState<NavigationRoute | null>(null);
  const [mapCenter, setMapCenter] = useState(TEST_SITES[currentSite].coordinates);
  const [mapZoom, setMapZoom] = useState(15);
  const [uiMode, setUIMode] = useState<'start' | 'search' | 'poi-info' | 'navigation'>('start');
  const [overlayStates, setOverlayStates] = useState({
    search: false,
    poiInfo: false,
    navigation: false,
    routePlanning: false
  });
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [useRealGPS, setUseRealGPS] = useState(false);

  // Hooks
  const { currentPosition } = useLocation({ currentSite });
  const { data: pois = [], isLoading: poisLoading } = usePOI(currentSite);
  const { data: searchResults = [] } = useSearchPOI(searchQuery, currentSite);
  const routing = useRouting();
  const { data: weather } = useWeather(currentPosition.lat, currentPosition.lng);
  const { t } = useLanguage();
  const { toast } = useToast();

  // Calculate POIs with distance
  const poisWithDistance = pois.map(poi => ({
    ...poi,
    distance: formatDistance(calculateDistance(currentPosition, poi.coordinates))
  }));

  const shouldShowPOIs = searchQuery.length > 0 || filteredCategories.length > 0;

  // Event handlers
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (query.length > 0) {
      setUIMode('search');
      setOverlayStates(prev => ({ ...prev, search: true, poiInfo: false }));
    } else {
      setUIMode('start');
      setOverlayStates(prev => ({ ...prev, search: false }));
    }
  }, []);

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

  const toggleGPS = useCallback(() => {
    setUseRealGPS(prev => !prev);
  }, []);

  const handlePOIClick = useCallback((poi: POI) => {
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
    routing.getRoute.mutate({
      from: currentPosition,
      to: poi.coordinates
    }, {
      onSuccess: (route) => {
        setCurrentRoute(route);
        setUIMode('navigation');
        setOverlayStates(prev => ({ ...prev, navigation: true, poiInfo: false }));
        
        toast({
          title: t('navigation.routeCalculated'),
          description: `${route.totalDistance} • ${route.estimatedTime}`,
        });
      },
      onError: () => {
        toast({
          title: t('errors.routeCalculation'),
          description: t('errors.tryAgain'),
          variant: 'destructive',
        });
      }
    });
  }, [currentPosition, routing.getRoute, toast, t]);

  const handleEndNavigation = useCallback(() => {
    setCurrentRoute(null);
    setUIMode('start');
    setOverlayStates(prev => ({ ...prev, navigation: false }));
    
    toast({
      title: t('navigation.ended'),
      description: t('navigation.backToExploring'),
    });
  }, [toast, t]);

  const handleSiteChange = useCallback((site: TestSite) => {
    setCurrentSite(site);
    setMapCenter(TEST_SITES[site].coordinates);
    setSelectedPOI(null);
    setCurrentRoute(null);
    setSearchQuery('');
    setFilteredCategories([]);
    setUIMode('start');
    setOverlayStates({ search: false, poiInfo: false, navigation: false, routePlanning: false });
  }, []);

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

  const handleCategoryFilter = useCallback((category: string) => {
    setFilteredCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [category];
      }
    });
  }, []);

  const handleToggleCategory = useCallback((category: string) => {
    setFilteredCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
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
    <div style={{
      display: 'grid',
      gridTemplateRows: '80px 60px 1fr',
      height: '100vh',
      width: '100vw'
    }}>
      {/* Row 1: Header */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(8px)',
        zIndex: 40,
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center'
      }}>
        <PermanentHeader
          searchQuery={searchQuery}
          onSearch={handleSearch}
          currentSite={currentSite}
          onSiteChange={handleSiteChange}
          showClearButton={shouldShowPOIs}
          onClear={handleClearPOIs}
        />
      </div>

      {/* Row 2: Navigation (only when navigating) */}
      <div style={{
        background: currentRoute ? 'rgba(255, 255, 255, 0.85)' : 'transparent',
        backdropFilter: currentRoute ? 'blur(10px)' : 'none',
        zIndex: 30,
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        borderRadius: currentRoute ? '12px' : '0',
        margin: currentRoute ? '8px 16px' : '0'
      }}>
        {currentRoute && overlayStates.navigation && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            height: '40px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#000' }}>
                📍 {currentRoute.totalDistance}
              </span>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#000' }}>
                ⏱️ {currentRoute.estimatedTime}
              </span>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#000' }}>
                🚗 {currentRoute.arrivalTime}
              </span>
            </div>
            
            <button
              onClick={handleEndNavigation}
              style={{
                background: '#ef4444',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '16px',
                border: 'none',
                fontSize: '12px',
                fontWeight: '600'
              }}
            >
              End
            </button>
          </div>
        )}
      </div>

      {/* Row 3: Map Area */}
      <div style={{ position: 'relative' }}>
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
        
        {/* Floating elements inside map area */}
        <div
          style={{
            position: 'absolute',
            left: '16px',
            top: '50%',
            transform: 'translateY(-50%)'
          }}
        >
          <LightweightPOIButtons 
            onCategorySelect={handleCategoryFilter}
            activeCategory={filteredCategories.length === 1 ? filteredCategories[0] : undefined}
          />
        </div>
        
        <div
          style={{
            position: 'absolute',
            right: '16px', 
            top: '50%',
            transform: 'translateY(-50%)'
          }}
        >
          <EnhancedMapControls
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onCenterOnLocation={handleCenterOnLocation}
            useRealGPS={useRealGPS}
            onToggleGPS={toggleGPS}
          />
        </div>
        
        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            right: '16px'
          }}
        >
          <CampingWeatherWidget coordinates={currentPosition} />
        </div>
        
        {selectedPOI && (
          <div
            style={{
              position: 'absolute',
              bottom: '80px',
              left: '16px',
              right: '16px'
            }}
          >
            <TransparentPOIOverlay 
              poi={selectedPOI}
              onNavigate={handleNavigateToPOI}
              onClose={() => setSelectedPOI(null)}
            />
          </div>
        )}
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        filteredCategories={filteredCategories}
        onToggleCategory={handleToggleCategory}
      />
    </div>
  );
}