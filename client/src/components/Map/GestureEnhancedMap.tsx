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
      if (e.touches.length === 1) {
        touchStart.current = {
          time: Date.now(),
          pos: { x: e.touches[0].clientX, y: e.touches[0].clientY }
        };
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStart.current || e.touches.length > 0) return;

      const touchEnd = Date.now();
      const duration = touchEnd - touchStart.current.time;
      const now = Date.now();

      // Long press detection (for camping waypoints)
      if (duration > 800) {
        const latlng = map.containerPointToLatLng([
          touchStart.current.pos.x,
          touchStart.current.pos.y
        ]);
        onLongPress?.(latlng);
        
        // Haptic feedback if available
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }
      }
      // Double tap detection (enhanced for camping use)
      else if (duration < 300) {
        if (now - lastTap.current < 500) {
          console.log('🗺️ GESTURE DEBUG: Double tap detected');
          const latlng = map.containerPointToLatLng([
            touchStart.current.pos.x,
            touchStart.current.pos.y
          ]);
          onDoubleTab?.(latlng);
          e.preventDefault();
        } else {
          console.log('🗺️ GESTURE DEBUG: Single tap detected, waiting for potential double tap...');
          // Single tap detection for destination setting
          const currentTapTime = now;
          setTimeout(() => {
            // Only trigger single tap if no double tap occurred
            if (lastTap.current === currentTapTime) {
              console.log('🗺️ GESTURE DEBUG: Single tap confirmed, triggering destination setting');
              const latlng = map.containerPointToLatLng([
                touchStart.current.pos.x,
                touchStart.current.pos.y
              ]);
              onSingleTap?.(latlng);
            } else {
              console.log('🗺️ GESTURE DEBUG: Single tap cancelled due to double tap');
            }
          }, 300); // Wait for potential double tap
        }
        lastTap.current = now;
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