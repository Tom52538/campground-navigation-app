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
  const gpsStabilizer = useRef<GPSStabilizer>(new GPSStabilizer({
    smoothingWindow: 8,     // Large buffer for maximum stability
    maxAccuracy: 30,        // Only accept good GPS signals
    maxJumpDistance: 40,    // Very conservative jump detection
    minUpdateInterval: 6000, // 6 seconds between updates - ZERO flickering
    speedThreshold: 1.0     // 1 m/s = 3.6 km/h (very slow walking)
  }));
  
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
            
            console.log(`🔍 GPS RAW: Received position`, coords, `accuracy: ${position.coords.accuracy}m`);
            
            // FORCE GPS stabilizer initialization in production
            if (!gpsStabilizer.current) {
              console.log('🔍 GPS: Reinitializing stabilizer for production');
              gpsStabilizer.current = new GPSStabilizer({
                smoothingWindow: 8,
                maxAccuracy: 30,
                maxJumpDistance: 40,
                minUpdateInterval: 6000,
                speedThreshold: 1.0
              });
            }
            
            // Use GPS stabilizer to filter and smooth position
            const stabilizedPosition = gpsStabilizer.current.addPosition(coords, position.coords.accuracy);
            
            if (stabilizedPosition) {
              console.log(`🔍 GPS STABILIZED: Position update accepted`, stabilizedPosition.position);
              setCurrentPosition(stabilizedPosition.position);
              setIsLoading(false);
              setError(null);
            } else {
              console.log(`🔍 GPS STABILIZED: Position update rejected`);
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
    
    // Ensure stabilizer exists before calling methods
    if (!gpsStabilizer.current) {
      console.log('🔍 GPS: Creating stabilizer during toggle');
      gpsStabilizer.current = new GPSStabilizer({
        smoothingWindow: 8,
        maxAccuracy: 30,
        maxJumpDistance: 40,
        minUpdateInterval: 6000,
        speedThreshold: 1.0
      });
    }
    
    if (newGPSState) {
      // Switching to Real GPS - reset stabilizer and start loading
      gpsStabilizer.current.reset();
      setIsLoading(true);
      console.log(`🔍 GPS DEBUG: Switching to Real GPS - stabilizer reset`);
    } else {
      // Switching to Mock GPS - immediately set to mock coordinates
      gpsStabilizer.current.reset();
      console.log(`🔍 GPS DEBUG: Switching to Mock GPS - setting position to:`, mockCoordinates);
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
