
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

  useEffect(() => {
    if (!map) return;

    const handleTouchStart = (e: TouchEvent) => {
      console.log('🗺️ GESTURE DEBUG: Touch start detected', { touchCount: e.touches.length });
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        touchStart.current = {
          time: Date.now(),
          pos: { x: touch.clientX, y: touch.clientY }
        };
        console.log('🗺️ GESTURE DEBUG: Single touch started at', touchStart.current.pos);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStart.current || e.touches.length > 0) return;

      const touchEnd = Date.now();
      const duration = touchEnd - touchStart.current.time;
      const timeSinceLastTap = touchEnd - lastTapTime.current;

      console.log('🗺️ GESTURE DEBUG: Touch end -', { 
        duration, 
        timeSinceLastTap,
        isQuickTap: duration < 500,
        isRecentTap: timeSinceLastTap < 300
      });

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
    mapContainer.addEventListener('touchstart', handleTouchStart, { passive: false });
    mapContainer.addEventListener('touchend', handleTouchEnd, { passive: false });
    mapContainer.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      mapContainer.removeEventListener('touchstart', handleTouchStart);
      mapContainer.removeEventListener('touchend', handleTouchEnd);
      mapContainer.removeEventListener('wheel', handleWheel);
      
      // Clean up timeout
      if (tapTimeoutId.current) {
        clearTimeout(tapTimeoutId.current);
      }
    };
  }, [map, onDoubleTab, onLongPress, onSingleTap]);

  return null;
};
