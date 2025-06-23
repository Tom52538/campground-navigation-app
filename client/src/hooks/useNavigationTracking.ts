import { useState, useEffect } from 'react';
import { Coordinates } from '@/types';

interface NavigationTrackingOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
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

  const {
    enableHighAccuracy = true,
    timeout = 5000,
    maximumAge = 1000,
  } = options;

  useEffect(() => {
    if (!isNavigating) {
      if (currentPosition) setCurrentPosition(null);
      return;
    }

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

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
      },
      (geoError) => {
        setError(`GPS Error: ${geoError.message}`);
      },
      {
        enableHighAccuracy,
        timeout,
        maximumAge
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [isNavigating, enableHighAccuracy, timeout, maximumAge]);

  return { currentPosition, error };
};