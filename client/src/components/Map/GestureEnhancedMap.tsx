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
  const lastTap = useRef<number>(0);

  useEffect(() => {
    if (!map) return;

    // Enhanced touch handling for smartphone gestures
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
      const now = Date.now();

      console.log('🗺️ GESTURE DEBUG: Touch end -', { duration, timeSinceLastTap: now - lastTap.current });

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
        const timeSinceLastTap = now - lastTap.current;
        
        if (timeSinceLastTap < 400 && lastTap.current > 0) {
          // Double tap
          console.log('🗺️ GESTURE DEBUG: Double tap confirmed');
          const containerPoint = [touchStart.current.pos.x, touchStart.current.pos.y];
          const latlng = map.containerPointToLatLng(containerPoint);
          console.log('🗺️ GESTURE DEBUG: Double tap coordinates:', { containerPoint, latlng });
          onDoubleTab?.(latlng);
          lastTap.current = 0; // Reset to prevent triple tap
          e.preventDefault();
        } else {
          // Potential single tap - wait to see if double tap follows
          console.log('🗺️ GESTURE DEBUG: Single tap detected, waiting for potential double tap...');
          const currentTapTime = now;
          const containerPoint = [touchStart.current.pos.x, touchStart.current.pos.y];
          
          setTimeout(() => {
            // Only trigger single tap if no double tap occurred
            if (lastTap.current === currentTapTime) {
              console.log('🗺️ GESTURE DEBUG: Single tap confirmed, triggering destination setting');
              const latlng = map.containerPointToLatLng(containerPoint);
              console.log('🗺️ GESTURE DEBUG: Single tap coordinates:', { containerPoint, latlng });
              onSingleTap?.(latlng);
            } else {
              console.log('🗺️ GESTURE DEBUG: Single tap cancelled due to double tap');
            }
          }, 400); // Wait for potential double tap
          
          lastTap.current = currentTapTime;
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
    };
  }, [map, onDoubleTab, onLongPress, onSingleTap]);

  return null;
};