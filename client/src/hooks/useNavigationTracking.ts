import { useState, useEffect } from 'react';
import { Coordinates } from '../types/navigation';

interface NavigationTrackingOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  updateInterval?: number;
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

  const {
    enableHighAccuracy = true,
    timeout = 5000,
    maximumAge = 1000,
    updateInterval = 1000
  } = options;

  useEffect(() => {
    if (!isNavigating) {
      setIsTracking(false);
      return;
    }

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setIsTracking(true);
    setError(null);

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
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

        setCurrentPosition(navPosition);
        setError(null);
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

    // Cleanup function
    return () => {
      navigator.geolocation.clearWatch(watchId);
      setIsTracking(false);
    };
  }, [isNavigating, enableHighAccuracy, timeout, maximumAge]);

  // Get single position (for initial setup)
  const getCurrentPosition = (): Promise<NavigationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
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
        },
        (geoError) => {
          reject(new Error(`Location error: ${geoError.message}`));
        },
        {
          enableHighAccuracy,
          timeout,
          maximumAge: 0 // Force fresh reading
        }
      );
    });
  };

  return {
    currentPosition,
    error,
    isTracking,
    getCurrentPosition
  };
};