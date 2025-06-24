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
    
    // Get the map container and all possible elements
    const container = map.getContainer();
    const mapPane = container.querySelector('.leaflet-map-pane') as HTMLElement;
    const tilePane = container.querySelector('.leaflet-tile-pane') as HTMLElement;
    
    console.log('🧭 ForceRotateMap: Found elements', {
      container: !!container,
      mapPane: !!mapPane,
      tilePane: !!tilePane
    });
    
    // Apply rotation to multiple elements for maximum compatibility
    if (container) {
      // Main container rotation
      container.style.transform = `rotate(${targetRotation}deg)`;
      container.style.transformOrigin = 'center center';
      container.style.transition = 'transform 0.5s ease-out';
      
      console.log('🧭 ForceRotateMap: Applied', targetRotation, 'degrees to main container');
      
      // Map pane rotation
      if (mapPane) {
        mapPane.style.transform = `rotate(${targetRotation}deg)`;
        mapPane.style.transformOrigin = 'center center';
        mapPane.style.transition = 'transform 0.5s ease-out';
        console.log('🧭 ForceRotateMap: Applied to map-pane');
      }
      
      // Tile pane rotation
      if (tilePane) {
        tilePane.style.transform = `rotate(${targetRotation}deg)`;
        tilePane.style.transformOrigin = 'center center';
        tilePane.style.transition = 'transform 0.5s ease-out';
        console.log('🧭 ForceRotateMap: Applied to tile-pane');
      }
      
      // Force immediate DOM update
      container.style.willChange = 'transform';
      
      // Force map to refresh after rotation
      setTimeout(() => {
        map.invalidateSize();
        console.log('🧭 ForceRotateMap: Map invalidated for refresh');
      }, 100);
    }
    
    // Log to mobile logger
    if (window.mobileLogger) {
      window.mobileLogger.log('FORCE_ROTATION', `Applied ${targetRotation}° rotation`);
    }
    
  }, [map, bearing, orientation]); // React to every change

  return null;
};