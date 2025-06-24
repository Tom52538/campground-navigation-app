import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';

interface RotatableMapProps {
  bearing: number;
  orientation: 'north' | 'driving';
}

export const RotatableMap = ({ bearing, orientation }: RotatableMapProps) => {
  const map = useMap();
  const rotationRef = useRef<number>(0);

  useEffect(() => {
    if (!map) return;

    const targetRotation = orientation === 'driving' ? -bearing : 0;
    
    // Only rotate if the bearing has actually changed
    if (rotationRef.current === targetRotation) return;
    
    rotationRef.current = targetRotation;
    
    console.log('🧭 RotatableMap: Applying rotation', targetRotation, 'degrees');
    
    // Log to mobile logger
    if (window.mobileLogger) {
      window.mobileLogger.logMapRotation(targetRotation, 'CSS-transform');
    }
    
    // Get the map container and all relevant elements
    const container = map.getContainer();
    const mapPane = container.querySelector('.leaflet-map-pane') as HTMLElement;
    const tilePane = container.querySelector('.leaflet-tile-pane') as HTMLElement;
    const controlContainer = container.querySelector('.leaflet-control-container') as HTMLElement;
    
    console.log('🧭 Found elements:', {
      container: !!container,
      mapPane: !!mapPane,
      tilePane: !!tilePane,
      controlContainer: !!controlContainer
    });
    
    // Apply rotation directly to elements
    if (targetRotation !== 0) {
      // Rotate main container
      container.style.transform = `rotate(${targetRotation}deg)`;
      container.style.transformOrigin = '50% 50%';
      container.style.transition = 'transform 0.6s ease-in-out';
      
      // Rotate map pane
      if (mapPane) {
        mapPane.style.transform = `rotate(${targetRotation}deg)`;
        mapPane.style.transformOrigin = '50% 50%';
        mapPane.style.transition = 'transform 0.6s ease-in-out';
      }
      
      // Rotate tile pane
      if (tilePane) {
        tilePane.style.transform = `rotate(${targetRotation}deg)`;
        tilePane.style.transformOrigin = '50% 50%';
        tilePane.style.transition = 'transform 0.6s ease-in-out';
      }
      
      // Counter-rotate controls to keep them upright
      if (controlContainer) {
        controlContainer.style.transform = `rotate(${-targetRotation}deg)`;
        controlContainer.style.transformOrigin = '50% 50%';
        controlContainer.style.transition = 'transform 0.6s ease-in-out';
      }
      
      console.log('🧭 Applied direct rotation:', targetRotation, 'degrees');
    } else {
      // Reset all rotations
      container.style.transform = 'none';
      if (mapPane) mapPane.style.transform = 'none';
      if (tilePane) tilePane.style.transform = 'none';
      if (controlContainer) controlContainer.style.transform = 'none';
      
      console.log('🧭 Reset all rotations to north-up');
    }
    
    // Force map refresh after rotation
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
    
    // Log successful rotation
    if (window.mobileLogger) {
      window.mobileLogger.log('MAP_ROTATION', `Rotation ${targetRotation}° applied successfully`);
    }
    
  }, [map, bearing, orientation]);

  return null;
};