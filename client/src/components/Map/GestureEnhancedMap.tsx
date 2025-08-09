
import { useEffect, useRef, useState } from 'react';
import { useMap } from 'react-leaflet';

interface GestureEnhancedMapProps {
  onDoubleTab?: (latlng: any) => void;
  onLongPress?: (latlng: any) => void;
  onSingleTap?: (latlng: any) => void;
}

const GestureEnhancedMapInner = ({ onDoubleTab, onLongPress, onSingleTap }: GestureEnhancedMapProps) => {
  const map = useMap();
  const touchStart = useRef<{ time: number; pos: { x: number; y: number } } | null>(null);
  const lastTapTime = useRef<number>(0);
  const tapTimeoutId = useRef<NodeJS.Timeout | null>(null);

  console.log('🗺️ GESTURE DEBUG: GestureEnhancedMap component rendered', {
    mapExists: !!map,
    callbacks: {
      onDoubleTab: !!onDoubleTab,
      onLongPress: !!onLongPress,
      onSingleTap: !!onSingleTap
    }
  });

  // Add mobile logger entry
  if (typeof window !== 'undefined' && window.mobileLogger) {
    window.mobileLogger.log('GESTURE_COMPONENT', 'GestureEnhancedMap rendered - callbacks: ' + JSON.stringify({
      onDoubleTab: !!onDoubleTab,
      onLongPress: !!onLongPress,
      onSingleTap: !!onSingleTap
    }));
  }

  useEffect(() => {
    if (!map) {
      console.warn('🗺️ GESTURE DEBUG: Map not available yet');
      return;
    }

    console.log('🗺️ GESTURE DEBUG: Setting up gesture handlers for map - map exists:', !!map);

    const mapContainer = map.getContainer();
    if (!mapContainer) {
      console.error('🗺️ GESTURE DEBUG: Map container not found');
      return;
    }

    console.log('🗺️ GESTURE DEBUG: Setting up touch event listeners on map container', {
      containerExists: !!mapContainer,
      containerTagName: mapContainer.tagName,
      containerClass: mapContainer.className
    });

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        console.log('🗺️ GESTURE DEBUG: Touch start detected', {
          touchCount: e.touches.length,
          target: e.target?.constructor.name
        });
        
        const touch = e.touches[0];
        touchStart.current = {
          time: Date.now(),
          pos: { x: touch.clientX, y: touch.clientY }
        };
        
        console.log('🗺️ GESTURE DEBUG: Single touch started at', touchStart.current.pos);
      } else {
        console.log('🗺️ GESTURE DEBUG: Multi-touch detected - cancelling single touch tracking', {
          touchCount: e.touches.length,
          target: e.target?.constructor.name
        });
        // Cancel single touch tracking when multi-touch is detected (zoom gesture)
        touchStart.current = null;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      console.log('🗺️ GESTURE DEBUG: Touch end triggered', {
        hasStartData: !!touchStart.current,
        remainingTouches: e.touches.length
      });

      if (!touchStart.current || e.touches.length > 0) {
        console.log('🗺️ GESTURE DEBUG: Touch end cancelled - no start data or multi-touch');
        return;
      }

      const touchEnd = Date.now();
      const duration = touchEnd - touchStart.current.time;
      const timeSinceLastTap = touchEnd - lastTapTime.current;

      // Get the final touch position to check for movement
      const finalTouch = e.changedTouches[0];
      const movement = Math.sqrt(
        Math.pow(finalTouch.clientX - touchStart.current.pos.x, 2) + 
        Math.pow(finalTouch.clientY - touchStart.current.pos.y, 2)
      );

      console.log('🗺️ GESTURE DEBUG: Touch end analysis -', {
        duration,
        timeSinceLastTap,
        movement,
        isQuickTap: duration < 500,
        isRecentTap: timeSinceLastTap < 300,
        startPos: touchStart.current.pos,
        endPos: { x: finalTouch.clientX, y: finalTouch.clientY }
      });

      // Only trigger long press if duration > 500ms AND movement is minimal (< 20px)
      // This prevents zoom gestures from triggering destination pin
      if (duration > 500 && movement < 20) {
        console.log('🗺️ GESTURE DEBUG: Long press detected - setting destination');
        const containerPoint = [touchStart.current.pos.x, touchStart.current.pos.y];
        const latlng = map.containerPointToLatLng(containerPoint);
        console.log('🗺️ GESTURE DEBUG: Long press coordinates:', { containerPoint, latlng });
        onLongPress?.(latlng);
        touchStart.current = null;
        return;
      } else if (duration > 500 && movement >= 20) {
        console.log('🗺️ GESTURE DEBUG: Long duration detected but too much movement - likely zoom gesture, ignoring');
        touchStart.current = null;
        return;
      }

      // Clear any existing timeout
      if (tapTimeoutId.current) {
        clearTimeout(tapTimeoutId.current);
        tapTimeoutId.current = null;
      }

      if (timeSinceLastTap < 300 && lastTapTime.current > 0) {
        // Double tap detected
        console.log('🗺️ GESTURE DEBUG: Double tap confirmed');
        const containerPoint = [touchStart.current.pos.x, touchStart.current.pos.y];
        const latlng = map.containerPointToLatLng(containerPoint);
        console.log('🗺️ GESTURE DEBUG: Double tap coordinates:', { containerPoint, latlng });
        onDoubleTab?.(latlng);
        lastTapTime.current = 0; // Reset to prevent triple tap
        e.preventDefault();
      } else {
        // Single tap - wait briefly to see if double tap follows
        console.log('🗺️ GESTURE DEBUG: Potential single tap detected, waiting...');
        const currentTouchPos = { x: touchStart.current.pos.x, y: touchStart.current.pos.y };
        
        tapTimeoutId.current = setTimeout(() => {
          console.log('🗺️ GESTURE DEBUG: Single tap confirmed - map interaction only');
          const containerPoint = [currentTouchPos.x, currentTouchPos.y];
          const latlng = map.containerPointToLatLng(containerPoint);
          console.log('🗺️ GESTURE DEBUG: Single tap coordinates:', { containerPoint, latlng });
          onSingleTap?.(latlng);
          tapTimeoutId.current = null;
        }, 250); // Shorter wait time for better responsiveness
        
        lastTapTime.current = touchEnd;
      }

      touchStart.current = null;
    };

    const handleTouchMove = (e: TouchEvent) => {
      // If multi-touch is detected during move, cancel single touch tracking
      if (e.touches.length > 1 && touchStart.current) {
        console.log('🗺️ GESTURE DEBUG: Multi-touch during move - cancelling single touch (zoom gesture)');
        touchStart.current = null;
      }
    };

    const handleWheel = (e: WheelEvent) => {
      // Track zoom gestures if needed
      if (e.ctrlKey) {
        console.log('🗺️ GESTURE DEBUG: Pinch zoom detected via wheel event');
      }
    };

    // Document-level listener for touch events that might start outside map
    const handleDocumentTouchStart = (e: TouchEvent) => {
      const target = e.target as Element;
      console.log('🗺️ GESTURE DEBUG: Document touchstart detected', {
        target: target?.constructor?.name,
        targetClass: target?.className
      });
    };

    // Add event listeners with proper options
    console.log('🗺️ GESTURE DEBUG: Adding touchstart listener...');
    mapContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
    
    console.log('🗺️ GESTURE DEBUG: Adding touchmove listener...');
    mapContainer.addEventListener('touchmove', handleTouchMove, { passive: true });
    
    console.log('🗺️ GESTURE DEBUG: Adding touchend listener...');
    mapContainer.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    console.log('🗺️ GESTURE DEBUG: Adding wheel listener...');
    mapContainer.addEventListener('wheel', handleWheel);
    
    // Document listener for debugging
    document.addEventListener('touchstart', handleDocumentTouchStart, { passive: true });

    console.log('🗺️ GESTURE DEBUG: All touch event listeners attached successfully');

    return () => {
      console.log('🗺️ GESTURE DEBUG: Cleaning up touch event listeners');
      mapContainer.removeEventListener('touchstart', handleTouchStart);
      mapContainer.removeEventListener('touchmove', handleTouchMove);
      mapContainer.removeEventListener('touchend', handleTouchEnd);
      mapContainer.removeEventListener('wheel', handleWheel);
      
      // Clean up document listeners
      document.removeEventListener('touchstart', handleDocumentTouchStart);
      
      // Clean up timeout
      if (tapTimeoutId.current) {
        clearTimeout(tapTimeoutId.current);
      }
    };
  }, [map, onDoubleTab, onLongPress, onSingleTap]);

  // Return null as this is a utility component
  return null;
};

export const GestureEnhancedMap = (props: GestureEnhancedMapProps) => {
  return <GestureEnhancedMapInner {...props} />;
};
