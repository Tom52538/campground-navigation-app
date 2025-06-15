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

  useEffect(() => {
    if (useRealGPS) {
      // Start continuous GPS tracking
      if ('geolocation' in navigator) {
        const newWatchId = navigator.geolocation.watchPosition(
          (position) => {
            const coords: Coordinates = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            setCurrentPosition(coords);
            console.log('Real GPS position updated:', coords);
          },
          (error) => {
            console.warn('GPS tracking error:', error);
            setError('GPS tracking failed');
            setCurrentPosition(mockCoordinates);
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 5000,
          }
        );
        setWatchId(newWatchId);

        return () => {
          navigator.geolocation?.clearWatch(newWatchId);
        };
      }
    } else {
      // Use mock position for testing
      setCurrentPosition(mockCoordinates);
      console.log('Using mock position:', mockCoordinates);
    }
  }, [useRealGPS, currentSite]);

  const updatePosition = (position: Coordinates) => {
    setCurrentPosition(position);
  };

  const getCurrentPosition = (): Promise<Coordinates> => {
    return new Promise((resolve, reject) => {
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
          console.warn('Geolocation error, using mock position:', error);
          // Fallback to current site mock position
          setCurrentPosition(mockCoordinates);
          setIsLoading(false);
          resolve(mockCoordinates);
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
    setUseRealGPS(!useRealGPS);
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
