import { useState, useEffect, useRef } from 'react';
import { Coordinates, TestSite, TEST_SITES } from '@/types/navigation';
import { GPSStabilizer } from '@/lib/gpsStabilizer';

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
  // Initialize GPS stabilizer with null safety
  const gpsStabilizer = useRef<GPSStabilizer | null>(null);
  
  // Lazy initialization to ensure it works in all environments
  const getStabilizer = () => {
    if (!gpsStabilizer.current) {
      console.log('🔍 GPS: Lazy initializing stabilizer');
      gpsStabilizer.current = new GPSStabilizer({
        smoothingWindow: 8,
        maxAccuracy: 30,
        maxJumpDistance: 40,
        minUpdateInterval: 6000,
        speedThreshold: 1.0
      });
    }
    return gpsStabilizer.current;
  };
  
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
        const newWatchId = navigator.geolocation.watchPosition(
          (position) => {
            const coords: Coordinates = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            
            console.log(`🔍 GPS RAW INPUT: lat=${coords.lat.toFixed(8)}, lng=${coords.lng.toFixed(8)}, accuracy=${position.coords.accuracy}m`);
            
            // PRODUCTION GPS DEBUGGING: Check environment and stabilizer state
            const isProd = import.meta.env.PROD;
            const isStabilizerNull = !gpsStabilizer.current;
            console.log(`🔍 GPS ENV: production=${isProd}, stabilizer_null=${isStabilizerNull}`);
            
            try {
              // Get stabilizer instance (creates if needed)
              const stabilizer = getStabilizer();
              
              // Use GPS stabilizer with error catching
              const stabilizedPosition = stabilizer.addPosition(coords, position.coords.accuracy);
              
              if (stabilizedPosition) {
                console.log(`🔍 GPS STABILIZED SUCCESS: lat=${stabilizedPosition.position.lat.toFixed(8)}, lng=${stabilizedPosition.position.lng.toFixed(8)}`);
                setCurrentPosition(stabilizedPosition.position);
                setIsLoading(false);
                setError(null);
              } else {
                console.log(`🔍 GPS STABILIZED REJECT: Position filtered out by stabilizer`);
                // Position was rejected by stabilizer - this is GOOD behavior
              }
            } catch (stabilizerError) {
              console.error('🚨 GPS STABILIZER ERROR:', stabilizerError);
              // FALLBACK: Direct position update without stabilizer
              console.log('🔍 GPS FALLBACK: Using raw position due to stabilizer failure');
              setCurrentPosition(coords);
              setIsLoading(false);
              setError(null);
            }
          },
          (error) => {
            console.warn('GPS error:', error.message);
            setError(`GPS error: ${error.message}`);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 2000, // Use more recent positions
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
      // Switching to Real GPS - reset stabilizer and start loading
      const stabilizer = getStabilizer();
      stabilizer.reset();
      setIsLoading(true);
      console.log(`🔍 GPS TOGGLE: Real GPS enabled - stabilizer reset`);
    } else {
      // Switching to Mock GPS - reset stabilizer and set mock position
      const stabilizer = getStabilizer();
      stabilizer.reset();
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
