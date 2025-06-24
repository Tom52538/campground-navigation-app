import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

interface ForceRotateMapProps {
  bearing: number;
  orientation: 'north' | 'driving';
}

export const ForceRotateMap = ({ bearing, orientation }: ForceRotateMapProps) => {
  const map = useMap();

  useEffect(() => {
    console.log('🧭 ForceRotateMap: Effect triggered!', {
      map: !!map,
      orientation,
      bearing,
      timestamp: Date.now()
    });
    
    if (!map) {
      console.log('🧭 ForceRotateMap: No map available, returning');
      return;
    }

    const targetRotation = orientation === 'driving' ? -bearing : 0;
    
    console.log('🧭 ForceRotateMap: FORCING rotation regardless of previous state', {
      orientation,
      bearing,
      targetRotation,
      timestamp: Date.now()
    });
    
    // Get the map container
    const container = map.getContainer();
    
    // Force immediate rotation without transition for testing
    if (container) {
      container.style.transform = `rotate(${targetRotation}deg)`;
      container.style.transformOrigin = 'center';
      container.style.transition = 'transform 0.3s ease-out';
      
      console.log('🧭 ForceRotateMap: Applied', targetRotation, 'degrees to container');
      
      // Also try rotating the entire leaflet container
      const leafletContainer = container.querySelector('.leaflet-container');
      if (leafletContainer) {
        (leafletContainer as HTMLElement).style.transform = `rotate(${targetRotation}deg)`;
        (leafletContainer as HTMLElement).style.transformOrigin = 'center';
        console.log('🧭 ForceRotateMap: Applied to leaflet-container');
      }
      
      // Force map to refresh
      setTimeout(() => {
        map.invalidateSize();
      }, 50);
    }
    
    // Log to mobile logger
    if (window.mobileLogger) {
      window.mobileLogger.log('FORCE_ROTATION', `Applied ${targetRotation}° rotation`);
    }
    
  }, [map, bearing, orientation]); // React to every change

  return null;
};