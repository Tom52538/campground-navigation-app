
import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';

interface GestureEnhancedMapProps {
  onDoubleTab?: (latlng: any) => void;
  onLongPress?: (latlng: any) => void;
  onSingleTap?: (latlng: any) => void;
}

export const GestureEnhancedMap = ({ onDoubleTab, onLongPress, onSingleTap }: GestureEnhancedMapProps) => {
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
    if (!map) return;

    const handleTouchStart = (e: TouchEvent) => {
      console.log('🗺️ GESTURE DEBUG: Touch start detected', { 
        touchCount: e.touches.length,
        target: e.target?.constructor?.name || 'unknown'
      });
      
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        touchStart.current = {
          time: Date.now(),
          pos: { x: touch.clientX, y: touch.clientY }
        };
        console.log('🗺️ GESTURE DEBUG: Single touch started at', touchStart.current.pos);
        
        // Prevent event from being handled by other components
        e.stopPropagation();
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

      console.log('🗺️ GESTURE DEBUG: Touch end analysis -', { 
        duration, 
        timeSinceLastTap,
        isQuickTap: duration < 500,
        isRecentTap: timeSinceLastTap < 300,
        startPos: touchStart.current.pos
      });
      
      // Prevent event from being handled by other components
      e.stopPropagation();

      // Long press detection (for camping waypoints)
      if (duration > 800) {
        console.log('🗺️ GESTURE DEBUG: Long press detected');
        const containerPoint = [touchStart.current.pos.x, touchStart.current.pos.y];
        const latlng = map.containerPointToLatLng(containerPoint);
        console.log('🗺️ GESTURE DEBUG: Long press coordinates:', { containerPoint, latlng });
        onLongPress?.(latlng);
        
        // Haptic feedback if available
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }
      }
      // Quick tap detection
      else if (duration < 500) {
        // Clear any pending single tap
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
            console.log('🗺️ GESTURE DEBUG: Single tap confirmed - firing destination event');
            const containerPoint = [currentTouchPos.x, currentTouchPos.y];
            const latlng = map.containerPointToLatLng(containerPoint);
            console.log('🗺️ GESTURE DEBUG: Single tap coordinates:', { containerPoint, latlng });
            onSingleTap?.(latlng);
            tapTimeoutId.current = null;
          }, 250); // Shorter wait time for better responsiveness
          
          lastTapTime.current = touchEnd;
        }
      }

      touchStart.current = null;
    };

    // Improved zoom gestures
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -1 : 1;
        map.zoomIn(delta * 0.5);
      }
    };

    const mapContainer = map.getContainer();
    
    console.log('🗺️ GESTURE DEBUG: Setting up touch event listeners on map container', {
      containerExists: !!mapContainer,
      containerTagName: mapContainer?.tagName,
      containerClass: mapContainer?.className
    });
    
    // Add multiple event listener strategies to ensure capture
    const eventOptions = { passive: false, capture: true };
    
    console.log('🗺️ GESTURE DEBUG: Adding touchstart listener...');
    mapContainer.addEventListener('touchstart', handleTouchStart, eventOptions);
    console.log('🗺️ GESTURE DEBUG: Adding touchend listener...');
    mapContainer.addEventListener('touchend', handleTouchEnd, eventOptions);
    console.log('🗺️ GESTURE DEBUG: Adding wheel listener...');
    mapContainer.addEventListener('wheel', handleWheel, { passive: false });
    
    // Also add to document to catch events that might be bubbling
    document.addEventListener('touchstart', (e) => {
      console.log('🗺️ GESTURE DEBUG: Document touchstart detected', {
        target: e.target?.constructor?.name || 'unknown',
        targetClass: e.target?.className || 'none'
      });
    }, eventOptions);
    
    console.log('🗺️ GESTURE DEBUG: All touch event listeners attached successfully');

    return () => {
      console.log('🗺️ GESTURE DEBUG: Cleaning up touch event listeners');
      mapContainer.removeEventListener('touchstart', handleTouchStart, { capture: true });
      mapContainer.removeEventListener('touchend', handleTouchEnd, { capture: true });
      mapContainer.removeEventListener('wheel', handleWheel);
      
      // Clean up document listeners
      document.removeEventListener('touchstart', handleTouchStart, { capture: true });
      
      // Clean up timeout
      if (tapTimeoutId.current) {
        clearTimeout(tapTimeoutId.current);
      }
    };
  }, [map, onDoubleTab, onLongPress, onSingleTap]);

  // Render a visible debug indicator during development
  return (
    <div 
      style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        background: 'red',
        color: 'white',
        padding: '4px 8px',
        fontSize: '10px',
        zIndex: 9999,
        borderRadius: '4px',
        pointerEvents: 'none'
      }}
    >
      GESTURE DEBUG: {map ? 'MAP READY' : 'NO MAP'}
    </div>
  );
};
