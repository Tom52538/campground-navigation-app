import { useState, useEffect } from 'react';
import { Coordinates, TestSite, TEST_SITES } from '@/types/navigation';

interface UseLocationProps {
  currentSite: TestSite;
}

export const useLocation = (props?: UseLocationProps) => {
  const currentSite = props?.currentSite || 'kamperland';
  const mockCoordinates = TEST_SITES[currentSite].coordinates;
  
  const [currentPosition, setCurrentPosition] = useState<Coordinates>(mockCoordinates);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useRealGPS, setUseRealGPS] = useState(false);
  const [watchId, setWatchId] = useState<number | undefined>(undefined);
  
  // Debug logging for GPS state changes
  console.log(`🔍 GPS DEBUG: useLocation initialized - Site: ${currentSite}, UseRealGPS: ${useRealGPS}, Position:`, currentPosition);

  useEffect(() => {
    console.group('🔍 GPS POSITION CHANGE - Weather Impact');
    console.log(`📡 GPS Mode Change:`, {
      useRealGPS,
      currentSite,
      previousPosition: currentPosition,
      mockCoordinates,
      timestamp: new Date().toISOString()
    });
    
    // Clear existing GPS watch safely
    if (watchId !== undefined) {
      try {
        if (navigator.geolocation) {
          navigator.geolocation.clearWatch(watchId);
          console.log(`🛑 GPS Watch Cleared:`, {
            watchId,
            reason: 'GPS mode change',
            timestamp: new Date().toISOString()
          });
        }
      } catch (e) {
        console.warn('Error clearing GPS watch:', e);
      }
      setWatchId(undefined);
    }

    if (useRealGPS) {
      // Real GPS mode
      if (!navigator.geolocation) {
        setError('Geolocation not supported');
        return;
      }

      try {
        const newWatchId = navigator.geolocation.watchPosition(
          (position) => {
            const coords: Coordinates = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            
            console.group('🛰️ REAL GPS POSITION UPDATE - Weather Impact');
            console.log(`📍 New GPS Coordinates:`, {
              coordinates: coords,
              accuracy: position.coords.accuracy,
              altitude: position.coords.altitude,
              speed: position.coords.speed,
              heading: position.coords.heading,
              timestamp: new Date(position.timestamp).toISOString(),
              weatherQueryWillUpdate: true
            });
            
            console.log(`🌦️ Weather Query Impact:`, {
              previousCoords: currentPosition,
              newCoords: coords,
              coordinateChange: {
                latDiff: Math.abs(coords.lat - currentPosition.lat),
                lngDiff: Math.abs(coords.lng - currentPosition.lng)
              },
              willTriggerNewWeatherFetch: true,
              queryKey: ['/api/weather', Math.round(coords.lat * 1000), Math.round(coords.lng * 1000)]
            });
            console.groupEnd();
            
            setCurrentPosition(coords);
            setError(null);
          },
          (error) => {
            console.warn('GPS error:', error.message);
            setError(`GPS error: ${error.message}`);
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 5000,
          }
        );
        
        console.log(`🔍 GPS DEBUG: Started GPS watch ${newWatchId}`);
        setWatchId(newWatchId);
      } catch (e) {
        console.error('Failed to start GPS:', e);
        setError('Failed to start GPS tracking');
      }
    } else {
      // Mock GPS mode - always use site coordinates
      console.group('🎯 MOCK GPS MODE - Weather Impact');
      console.log(`📍 Mock GPS Coordinates:`, {
        site: currentSite,
        coordinates: mockCoordinates,
        previousPosition: currentPosition,
        timestamp: new Date().toISOString()
      });
      
      console.log(`🌦️ Weather Query Impact:`, {
        mockPosition: mockCoordinates,
        coordinateChange: {
          latDiff: Math.abs(mockCoordinates.lat - currentPosition.lat),
          lngDiff: Math.abs(mockCoordinates.lng - currentPosition.lng)
        },
        weatherQueryKey: ['/api/weather', Math.round(mockCoordinates.lat * 1000), Math.round(mockCoordinates.lng * 1000)],
        willTriggerWeatherFetch: true
      });
      
      console.log('🔒 Position locked to mock coordinates:', {
        site: currentSite,
        coordinates: mockCoordinates,
        weatherWillUpdate: true
      });
      console.groupEnd();
      
      setCurrentPosition(mockCoordinates);
      setError(null);
    }
    
    console.groupEnd();

    // Cleanup function
    return () => {
      if (watchId !== undefined) {
        try {
          if (navigator.geolocation) {
            navigator.geolocation.clearWatch(watchId);
          }
        } catch (e) {
          console.warn('Cleanup error:', e);
        }
      }
    };
  }, [useRealGPS, currentSite]);

  const updatePosition = (position: Coordinates) => {
    console.log(`🔍 GPS DEBUG: updatePosition called with:`, position, `useRealGPS: ${useRealGPS}`);
    console.trace('🔍 GPS DEBUG: updatePosition call stack');
    
    // Only allow position updates if we're in real GPS mode
    // This prevents other components from overriding mock position
    if (useRealGPS) {
      console.log(`🔍 GPS DEBUG: Allowing position update (Real GPS mode)`);
      setCurrentPosition(position);
    } else {
      console.log(`🔍 GPS DEBUG: BLOCKING position update - using mock GPS mode`);
      console.log(`🔍 GPS DEBUG: Attempted position:`, position);
      console.log(`🔍 GPS DEBUG: Keeping mock position:`, mockCoordinates);
    }
  };

  const getCurrentPosition = (): Promise<Coordinates> => {
    return new Promise((resolve, reject) => {
      // If using mock GPS, return mock coordinates immediately
      if (!useRealGPS) {
        console.log('getCurrentPosition: Using mock coordinates');
        resolve(mockCoordinates);
        return;
      }

      // Only use real GPS when explicitly enabled
      if (!('geolocation' in navigator)) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      setIsLoading(true);
      setError(null);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: Coordinates = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentPosition(coords);
          setIsLoading(false);
          resolve(coords);
        },
        (error) => {
          console.warn('Geolocation error:', error);
          setError('GPS access failed');
          setIsLoading(false);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    });
  };

  const toggleGPS = () => {
    const newGPSState = !useRealGPS;
    
    console.group('🔄 GPS TOGGLE - Weather Impact Analysis');
    console.log(`🎚️ GPS Mode Switch:`, {
      from: useRealGPS ? 'Real GPS' : 'Mock GPS',
      to: newGPSState ? 'Real GPS' : 'Mock GPS',
      currentPosition,
      targetPosition: newGPSState ? 'Will fetch real location' : mockCoordinates,
      timestamp: new Date().toISOString()
    });
    
    console.log(`🌦️ Expected Weather Impact:`, {
      currentWeatherQueryKey: ['/api/weather', Math.round(currentPosition.lat * 1000), Math.round(currentPosition.lng * 1000)],
      expectedNewQueryKey: newGPSState 
        ? 'Will update based on real GPS coordinates' 
        : ['/api/weather', Math.round(mockCoordinates.lat * 1000), Math.round(mockCoordinates.lng * 1000)],
      weatherDataWillRefresh: true,
      cacheWillInvalidate: true
    });
    
    console.trace('🔍 GPS Toggle call stack');
    console.groupEnd();
    
    setUseRealGPS(newGPSState);
  };

  return {
    currentPosition,
    isLoading,
    error,
    useRealGPS,
    updatePosition,
    getCurrentPosition,
    toggleGPS,
  };
};
