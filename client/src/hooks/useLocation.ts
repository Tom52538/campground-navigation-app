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
        let lastGPSUpdate = 0;
        let lastGPSPosition: Coordinates | null = null;
        
        const newWatchId = navigator.geolocation.watchPosition(
          (position) => {
            const now = Date.now();
            const coords: Coordinates = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            
            // Rate limit: Only update every 3 seconds
            if (now - lastGPSUpdate < 3000) {
              return;
            }
            
            // Position change filter: Only update if moved significantly
            if (lastGPSPosition) {
              const latDiff = Math.abs(coords.lat - lastGPSPosition.lat);
              const lngDiff = Math.abs(coords.lng - lastGPSPosition.lng);
              // Ignore tiny GPS jitter (less than ~1 meter)
              if (latDiff < 0.00001 && lngDiff < 0.00001) {
                return;
              }
            }
            
            console.log(`GPS UPDATE: ${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`);
            lastGPSUpdate = now;
            lastGPSPosition = coords;
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
