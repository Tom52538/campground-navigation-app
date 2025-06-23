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
  const [lastEmittedTime, setLastEmittedTime] = useState<number>(0);
  
  // Debug logging for GPS state changes
  console.log(`🔍 GPS DEBUG: useLocation initialized - Site: ${currentSite}, UseRealGPS: ${useRealGPS}, Position:`, currentPosition);

  useEffect(() => {
    console.log(`🔍 GPS DEBUG: Effect triggered - useRealGPS: ${useRealGPS}, currentSite: ${currentSite}`);
    
    // Clear existing GPS watch safely
    if (watchId !== undefined) {
      try {
        if (navigator.geolocation) {
          navigator.geolocation.clearWatch(watchId);
          console.log(`🔍 GPS DEBUG: Cleared watch ${watchId}`);
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
        // 🔍 GPS DEBUG VARIABLES
        let gpsUpdateCount = 0;
        let startTime = Date.now();
        let lastTimestamp = 0;
        let lastGPSPosition: any = null;
        const coordinateHistory: any[] = [];
        
        console.log('🔍 GPS API CONFIGURATION:', {
          method: 'watchPosition',
          enableHighAccuracy: false,
          timeout: 30000,
          maximumAge: 60000
        });
        
        const newWatchId = navigator.geolocation.watchPosition(
          (position) => {
            // 🔍 DIAGNOSTIC TEST 1: GPS Update Frequency
            gpsUpdateCount++;
            const elapsed = (Date.now() - startTime) / 1000;
            const timeDiff = position.timestamp - lastTimestamp;
            
            console.log('🔍 GPS DIAGNOSTIC UPDATE:', {
              updateNumber: gpsUpdateCount,
              elapsedSeconds: elapsed.toFixed(1),
              timeDiff: timeDiff,
              updatesPerSecond: (gpsUpdateCount / elapsed).toFixed(2),
              coordinates: {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                accuracy: position.coords.accuracy
              }
            });
            
            // 🔍 DIAGNOSTIC TEST 2: Coordinate Changes
            if (lastGPSPosition) {
              const latDiff = Math.abs(position.coords.latitude - lastGPSPosition.latitude);
              const lngDiff = Math.abs(position.coords.longitude - lastGPSPosition.longitude);
              const latDiffMeters = latDiff * 111000;
              const lngDiffMeters = lngDiff * 111000;
              
              console.log('🔍 COORDINATE CHANGES:', {
                latDiff: latDiff.toFixed(8),
                lngDiff: lngDiff.toFixed(8),
                latDiffMeters: latDiffMeters.toFixed(2),
                lngDiffMeters: lngDiffMeters.toFixed(2),
                totalMovementMeters: Math.sqrt(latDiffMeters * latDiffMeters + lngDiffMeters * lngDiffMeters).toFixed(2)
              });
            }
            
            // 🔍 DIAGNOSTIC TEST 3: Coordinate Stability
            coordinateHistory.push({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy,
              time: Date.now()
            });
            
            if (coordinateHistory.length > 10) {
              coordinateHistory.shift();
            }
            
            if (coordinateHistory.length >= 5) {
              const latValues = coordinateHistory.map(c => c.lat);
              const lngValues = coordinateHistory.map(c => c.lng);
              const latRange = (Math.max(...latValues) - Math.min(...latValues)) * 111000;
              const lngRange = (Math.max(...lngValues) - Math.min(...lngValues)) * 111000;
              
              console.log('🔍 COORDINATE STABILITY (last 10 updates):', {
                latRangeMeters: latRange.toFixed(2),
                lngRangeMeters: lngRange.toFixed(2),
                maxMovement: Math.max(latRange, lngRange).toFixed(2)
              });
            }
            
            const coords: Coordinates = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            
            console.log('🔍 MAP UPDATE TRIGGERED for coordinates:', coords);
            lastTimestamp = position.timestamp;
            lastGPSPosition = position.coords;
            setCurrentPosition(coords);
            setIsLoading(false);
            setError(null);
          },
          (error) => {
            console.warn('GPS error:', error.message);
            setError(`GPS error: ${error.message}`);
          },
          {
            enableHighAccuracy: false,
            timeout: 30000,
            maximumAge: 60000
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
      console.log(`🔍 GPS DEBUG: Using MOCK GPS:`, mockCoordinates);
      setCurrentPosition(mockCoordinates);
      console.log('Locked to mock position:', mockCoordinates);
      setError(null);
    }

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
    console.log(`🔍 GPS DEBUG: toggleGPS called - switching from ${useRealGPS} to ${newGPSState}`);
    
    if (newGPSState) {
      // Switching to Real GPS - reset timing and start loading
      setLastEmittedTime(0);
      setIsLoading(true);
      console.log(`🔍 GPS TOGGLE: Real GPS enabled`);
    } else {
      // Switching to Mock GPS - set mock position
      setLastEmittedTime(0);
      console.log(`🔍 GPS TOGGLE: Mock GPS enabled - position set to:`, mockCoordinates);
      setCurrentPosition(mockCoordinates);
      setIsLoading(false);
      setError(null);
    }
    
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
