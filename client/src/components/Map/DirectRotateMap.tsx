import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';

interface DirectRotateMapProps {
  bearing: number;
  orientation: 'north' | 'driving';
}

export const DirectRotateMap = ({ bearing, orientation }: DirectRotateMapProps) => {
  const map = useMap();
  const appliedRotationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!map) {
      console.log('🧭 DirectRotateMap: No map available');
      return;
    }

    const targetRotation = orientation === 'driving' ? -bearing : 0;
    
    console.log('🧭 DirectRotateMap: DIRECT ROTATION ATTEMPT', {
      orientation,
      bearing,
      targetRotation,
      previousRotation: appliedRotationRef.current,
      willForceApply: true,
      timestamp: Date.now()
    });
    
    // Always apply rotation - no conditions
    appliedRotationRef.current = targetRotation;
    
    // Get map container and apply rotation immediately
    const container = map.getContainer();
    if (container) {
      // Apply rotation with !important CSS override
      container.style.setProperty('transform', `rotate(${targetRotation}deg)`, 'important');
      container.style.setProperty('transform-origin', '50% 50%', 'important');
      container.style.setProperty('transition', 'transform 0.6s ease-in-out', 'important');
      
      console.log('🧭 DirectRotateMap: APPLIED', targetRotation, 'degrees with !important');
      
      // Also apply to all child elements for maximum coverage
      const mapPane = container.querySelector('.leaflet-map-pane') as HTMLElement;
      const tilePane = container.querySelector('.leaflet-tile-pane') as HTMLElement;
      const overlayPane = container.querySelector('.leaflet-overlay-pane') as HTMLElement;
      
      if (mapPane) {
        mapPane.style.setProperty('transform', `rotate(${targetRotation}deg)`, 'important');
        mapPane.style.setProperty('transform-origin', '50% 50%', 'important');
        console.log('🧭 DirectRotateMap: Applied to map-pane');
      }
      
      if (tilePane) {
        tilePane.style.setProperty('transform', `rotate(${targetRotation}deg)`, 'important');
        tilePane.style.setProperty('transform-origin', '50% 50%', 'important');
        console.log('🧭 DirectRotateMap: Applied to tile-pane');
      }
      
      if (overlayPane) {
        overlayPane.style.setProperty('transform', `rotate(${targetRotation}deg)`, 'important');
        overlayPane.style.setProperty('transform-origin', '50% 50%', 'important');
        console.log('🧭 DirectRotateMap: Applied to overlay-pane');
      }
      
      // Force DOM update
      container.offsetHeight; // Trigger reflow
      
      // Log to mobile logger
      if (window.mobileLogger) {
        window.mobileLogger.log('DIRECT_ROTATION', `FORCED ${targetRotation}° rotation applied`);
      }
      
      // Invalidate map size after rotation
      setTimeout(() => {
        map.invalidateSize();
        console.log('🧭 DirectRotateMap: Map size invalidated');
      }, 100);
    }
    
  }, [map, bearing, orientation]); // Always react to changes

  return null;
};