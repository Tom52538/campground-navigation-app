import { useState, useEffect } from 'react';
import { Coordinates } from '../types/navigation';

interface NavigationTrackingOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  updateInterval?: number;
  adaptiveTracking?: boolean;
}

interface NavigationPosition {
  position: Coordinates;
  accuracy: number;
  speed?: number;
  heading?: number;
  timestamp: number;
}

export const useNavigationTracking = (
  isNavigating: boolean,
  options: NavigationTrackingOptions = {}
) => {
  const [currentPosition, setCurrentPosition] = useState<NavigationPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [adaptiveInterval, setAdaptiveInterval] = useState<number>(1000);
  
  console.log(`🔍 NAV TRACKING DEBUG: useNavigationTracking initialized - isNavigating: ${isNavigating}`);

  const {
    enableHighAccuracy = true,
    timeout = 5000,
    maximumAge = 1000,
    updateInterval = 1000,
    adaptiveTracking = true
  } = options;

  // Adaptive interval calculation based on speed and context
  const calculateAdaptiveInterval = (speed: number | undefined, accuracy: number) => {
    if (!adaptiveTracking) return updateInterval;
    
    const speedKmh = speed ? speed * 3.6 : 0; // Convert m/s to km/h
    
    // High speed (>30 km/h) - frequent updates for safety
    if (speedKmh > 30) return 500;
    
    // Medium speed (10-30 km/h) - balanced updates
    if (speedKmh > 10) return 1000;
    
    // Low speed/stationary - less frequent updates to save battery
    if (speedKmh < 1) return 3000;
    
    // Default walking speed - normal updates
    return 1500;
  };

  useEffect(() => {
    console.log(`🔍 NAV TRACKING DEBUG: Effect triggered - isNavigating: ${isNavigating}`);
    
    if (!isNavigating) {
      console.log(`🔍 NAV TRACKING DEBUG: Not navigating - stopping tracking`);
      setIsTracking(false);
      setError(null); // Clear any previous errors
      return;
    }

    // Check for geolocation support with better error handling
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      console.log(`🔍 NAV TRACKING DEBUG: Geolocation not supported`);
      setError('Geolocation is not supported by this browser');
      return;
    }

    console.log(`🔍 NAV TRACKING DEBUG: Starting GPS watch for navigation`);
    setIsTracking(true);
    setError(null);

    let watchId: number;
    
    try {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          try {
            // Prevent processing if component unmounted or navigation stopped
            if (!isNavigating) return;
            
            // Skip low accuracy positions during navigation
            if (position.coords.accuracy > 50) {
              console.log(`🔍 NAV TRACKING DEBUG: Navigation position accuracy too low (${position.coords.accuracy}m), skipping`);
              return;
            }
            
            console.log(`🔍 NAV TRACKING DEBUG: High-accuracy GPS position received during navigation:`, {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy
            });
            
            const navPosition: NavigationPosition = {
              position: {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              },
              accuracy: position.coords.accuracy,
              speed: position.coords.speed || undefined,
              heading: position.coords.heading || undefined,
              timestamp: position.timestamp
            };

            console.log(`🔍 NAV TRACKING DEBUG: Setting navigation position:`, navPosition);
            setCurrentPosition(navPosition);
            setError(null);
            
            // Safe adaptive interval calculation
            if (adaptiveTracking) {
              try {
                const newInterval = calculateAdaptiveInterval(position.coords.speed || undefined, position.coords.accuracy);
                setAdaptiveInterval(newInterval);
              } catch (e) {
                console.warn('Adaptive interval calculation failed:', e);
              }
            }
          } catch (e) {
            console.error('Error processing navigation position:', e);
            setError('Position processing failed');
          }
        },
        (geoError) => {
          console.error('GPS tracking error:', geoError);
          let errorMessage = 'Location tracking failed';
          
          switch (geoError.code) {
            case geoError.PERMISSION_DENIED:
              errorMessage = 'Location access denied. Please enable location permissions.';
              break;
            case geoError.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable.';
              break;
            case geoError.TIMEOUT:
              errorMessage = 'Location request timed out.';
              break;
          }
          
          setError(errorMessage);
        },
        {
          enableHighAccuracy,
          timeout,
          maximumAge
        }
      );
      
      // Cleanup function with proper error handling
      return () => {
        try {
          navigator.geolocation.clearWatch(watchId);
          console.log(`🔍 NAV TRACKING DEBUG: Cleared GPS watch ${watchId}`);
        } catch (error) {
          console.error('Error clearing GPS watch:', error);
        }
        setIsTracking(false);
        setCurrentPosition(null);
      };
      
    } catch (error) {
      console.error('Failed to start GPS tracking:', error);
      setError('Failed to start location tracking');
      setIsTracking(false);
      
      // Return empty cleanup function if GPS setup failed
      return () => {
        setIsTracking(false);
        setCurrentPosition(null);
      };
    }
  }, [isNavigating, enableHighAccuracy, timeout, maximumAge]);

  // Get single position (for initial setup) with comprehensive error handling
  const getCurrentPosition = (): Promise<NavigationPosition> => {
    return new Promise((resolve, reject) => {
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      try {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            try {
              const navPosition: NavigationPosition = {
                position: {
                  lat: position.coords.latitude,
                  lng: position.coords.longitude
                },
                accuracy: position.coords.accuracy,
                speed: position.coords.speed || undefined,
                heading: position.coords.heading || undefined,
                timestamp: position.timestamp
              };
              resolve(navPosition);
            } catch (e) {
              reject(new Error(`Position processing error: ${e}`));
            }
          },
          (geoError) => {
            reject(new Error(`Location error: ${geoError.message}`));
          },
          {
            enableHighAccuracy,
            timeout,
            maximumAge: 0
          }
        );
      } catch (e) {
        reject(new Error(`Geolocation API error: ${e}`));
      }
    });
  };

  return {
    currentPosition,
    error,
    isTracking,
    getCurrentPosition
  };
};