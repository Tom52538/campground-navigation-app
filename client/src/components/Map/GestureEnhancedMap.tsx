
import { useEffect, useRef, useState } from 'react';
import { useMap } from 'react-leaflet';

interface GestureEnhancedMapProps {
  onDoubleTap?: (latlng: any) => void;
  onLongPress?: (latlng: any) => void;
  onSingleTap?: (latlng: any) => void;
}

// Enhanced debug logger for gesture debugging
const debugLog = (category: string, message: string, data?: any) => {
  const timestamp = new Date().toLocaleTimeString();
  const logEntry = `🗺️ [${timestamp}] ${category}: ${message}`;
  
  console.log(logEntry, data || '');
  
  // Mobile logger integration
  if (typeof window !== 'undefined' && window.mobileLogger) {
    window.mobileLogger.log(category, `${message} ${data ? JSON.stringify(data) : ''}`);
  }
};

const GestureEnhancedMapInner = ({ onDoubleTap, onLongPress, onSingleTap }: GestureEnhancedMapProps) => {
  const map = useMap();
  const touchStart = useRef<{ time: number; pos: { x: number; y: number } } | null>(null);
  const lastTapTime = useRef<number>(0);
  const tapTimeoutId = useRef<NodeJS.Timeout | null>(null);

  debugLog('GESTURE_INIT', 'GestureEnhancedMap component rendered', {
    mapExists: !!map,
    callbacks: {
      onDoubleTap: !!onDoubleTap,
      onLongPress: !!onLongPress,
      onSingleTap: !!onSingleTap
    }
  });

  useEffect(() => {
    if (!map) {
      console.warn('🗺️ GESTURE DEBUG: Map not available yet');
      return;
    }

    // Disable ALL map zoom interactions to prevent interference
    map.doubleClickZoom.disable();
    map.scrollWheelZoom.disable();
    map.boxZoom.disable();
    map.keyboard.disable();
    
    // Disable touch zoom completely - this is critical!
    if (map.touchZoom) {
      map.touchZoom.disable();
    }
    
    debugLog('GESTURE_SETUP', 'Disabled all Leaflet zoom interactions', {
      doubleClick: !map.doubleClickZoom.enabled(),
      scrollWheel: !map.scrollWheelZoom.enabled(),
      boxZoom: !map.boxZoom.enabled(),
      keyboard: !map.keyboard.enabled(),
      touchZoom: map.touchZoom ? !map.touchZoom.enabled() : 'N/A'
    });

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
      const touchCount = e.touches.length;
      
      debugLog('TOUCH_START', `Touch start detected`, {
        touchCount,
        target: e.target?.constructor.name,
        timeStamp: e.timeStamp
      });
      
      if (touchCount === 1) {
        const touch = e.touches[0];
        touchStart.current = {
          time: Date.now(),
          pos: { x: touch.clientX, y: touch.clientY }
        };
        
        debugLog('SINGLE_TOUCH', 'Single touch initialized', {
          position: touchStart.current.pos,
          timestamp: touchStart.current.time
        });
      } else if (touchCount > 1) {
        // Multi-touch detected - this should NOT trigger zoom
        debugLog('MULTI_TOUCH', 'Multi-touch detected - preventing default zoom', {
          touchCount,
          preventDefault: true
        });
        
        // Prevent default zoom behavior
        e.preventDefault();
        e.stopPropagation();
        
        // Clear single touch data
        touchStart.current = null;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const remainingTouches = e.touches.length;
      const hasStartData = !!touchStart.current;
      
      debugLog('TOUCH_END', 'Touch end triggered', {
        hasStartData,
        remainingTouches,
        timeStamp: e.timeStamp
      });

      // Only process single touch gestures
      if (!hasStartData) {
        debugLog('TOUCH_END_SKIP', 'Skipped - no touch start data');
        return;
      }
      
      if (remainingTouches > 0) {
        debugLog('TOUCH_END_SKIP', 'Skipped - multi-touch still active', {
          remainingTouches
        });
        return;
      }

      const touchEnd = Date.now();
      const duration = touchEnd - touchStart.current.time;
      const timeSinceLastTap = touchEnd - lastTapTime.current;
      const isQuickTap = duration < 500;
      const isRecentTap = timeSinceLastTap < 400 && lastTapTime.current > 0;

      debugLog('GESTURE_ANALYSIS', 'Touch gesture analysis', {
        duration: `${duration}ms`,
        timeSinceLastTap: `${timeSinceLastTap}ms`,
        isQuickTap,
        isRecentTap,
        isLongPress: duration > 500,
        startPos: touchStart.current.pos,
        gestureType: duration > 500 ? 'LONG_PRESS' : 
                    isRecentTap ? 'DOUBLE_TAP' : 'SINGLE_TAP'
      });

      if (duration > 500) {
        const containerPoint = [touchStart.current.pos.x, touchStart.current.pos.y];
        const latlng = map.containerPointToLatLng(containerPoint);
        
        debugLog('LONG_PRESS', 'Long press gesture detected', {
          duration: `${duration}ms`,
          containerPoint,
          coordinates: { lat: latlng.lat.toFixed(6), lng: latlng.lng.toFixed(6) }
        });
        
        onLongPress?.(latlng);
        touchStart.current = null;
        return;
      }

      // Clear any existing timeout
      if (tapTimeoutId.current) {
        clearTimeout(tapTimeoutId.current);
        tapTimeoutId.current = null;
      }

      if (isRecentTap) {
        const containerPoint = [touchStart.current.pos.x, touchStart.current.pos.y];
        const latlng = map.containerPointToLatLng(containerPoint);
        
        debugLog('DOUBLE_TAP', 'Double tap gesture confirmed', {
          timeSinceLastTap: `${timeSinceLastTap}ms`,
          containerPoint,
          coordinates: { lat: latlng.lat.toFixed(6), lng: latlng.lng.toFixed(6) },
          action: 'SET_DESTINATION'
        });
        
        onDoubleTap?.(latlng);
        lastTapTime.current = 0; // Reset to prevent triple tap
        e.preventDefault();
        e.stopPropagation();
        touchStart.current = null;
        return;
      } else {
        const currentTouchPos = { x: touchStart.current.pos.x, y: touchStart.current.pos.y };
        
        debugLog('SINGLE_TAP', 'Potential single tap - waiting for confirmation', {
          waitTime: '250ms',
          position: currentTouchPos
        });
        
        tapTimeoutId.current = setTimeout(() => {
          const containerPoint = [currentTouchPos.x, currentTouchPos.y];
          const latlng = map.containerPointToLatLng(containerPoint);
          
          debugLog('SINGLE_TAP_CONFIRMED', 'Single tap gesture confirmed', {
            containerPoint,
            coordinates: { lat: latlng.lat.toFixed(6), lng: latlng.lng.toFixed(6) },
            action: 'MAP_INTERACTION'
          });
          
          onSingleTap?.(latlng);
          tapTimeoutId.current = null;
        }, 250);
        
        lastTapTime.current = touchEnd;
      }

      touchStart.current = null;
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
      mapContainer.removeEventListener('touchend', handleTouchEnd);
      mapContainer.removeEventListener('wheel', handleWheel);
      
      // Clean up document listeners
      document.removeEventListener('touchstart', handleDocumentTouchStart);
      
      // Clean up timeout
      if (tapTimeoutId.current) {
        clearTimeout(tapTimeoutId.current);
      }
    };
  }, [map, onDoubleTap, onLongPress, onSingleTap]);

  // Return null as this is a utility component
  return null;
};

export const GestureEnhancedMap = (props: GestureEnhancedMapProps) => {
  return <GestureEnhancedMapInner {...props} />;
};
