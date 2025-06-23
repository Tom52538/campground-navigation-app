import { useEffect, useState } from 'react';
import { NavigationRoute, Coordinates } from '@/types/navigation';

interface DynamicNavigationOptions {
  route: NavigationRoute | null;
  currentPosition: Coordinates;
  isNavigating: boolean;
  currentStep?: number;
}

interface DynamicMapConfig {
  zoom: number;
  center: Coordinates;
  bearing: number;
  tilt?: number;
  followUser: boolean;
}

export const useDynamicNavigation = ({
  route,
  currentPosition,
  isNavigating,
  currentStep = 0
}: DynamicNavigationOptions) => {
  const [mapConfig, setMapConfig] = useState<DynamicMapConfig>({
    zoom: 15,
    center: currentPosition,
    bearing: 0,
    followUser: true
  });

  useEffect(() => {
    if (!isNavigating || !route) {
      // Exploration mode - standard view
      setMapConfig({
        zoom: 15,
        center: currentPosition,
        bearing: 0,
        followUser: false
      });
      return;
    }

    // Navigation mode - dynamic Google-like behavior
    const currentRouteStep = route.steps?.[currentStep];
    
    if (currentRouteStep) {
      // Calculate distance to next maneuver
      const maneuverDistance = currentRouteStep.distance || 0;
      
      // Campground-optimized dynamic zoom (much closer view for small distances)
      let dynamicZoom = 18; // Default campground navigation zoom (closer than city)
      
      if (maneuverDistance < 20) {
        dynamicZoom = 20; // Very close to turn in campground - maximum zoom
      } else if (maneuverDistance < 50) {
        dynamicZoom = 19; // Approaching turn in campground
      } else if (maneuverDistance < 100) {
        dynamicZoom = 18; // Medium distance in campground
      } else if (maneuverDistance > 200) {
        dynamicZoom = 17; // Long straight for campground context
      }
      
      // Calculate bearing from current position to next step
      let routeBearing = 0;
      if (route.geometry && route.geometry.length > 0) {
        // Find closest point on route and calculate bearing
        const nextPoint = route.geometry[Math.min(currentStep + 1, route.geometry.length - 1)];
        if (nextPoint && Array.isArray(nextPoint) && nextPoint.length >= 2) {
          const deltaLng = nextPoint[0] - currentPosition.lng;
          const deltaLat = nextPoint[1] - currentPosition.lat;
          routeBearing = Math.atan2(deltaLng, deltaLat) * (180 / Math.PI);
          if (routeBearing < 0) routeBearing += 360;
        }
      }
      
      // Use maneuver bearing if available, otherwise calculated bearing
      const finalBearing = currentRouteStep.maneuver?.bearing_after ?? routeBearing;
      
      console.log('🏕️ Campground navigation config:', {
        step: currentStep,
        distance: maneuverDistance + 'm',
        zoom: dynamicZoom,
        bearing: finalBearing,
        instruction: currentRouteStep.instruction,
        mode: 'campground-optimized'
      });
      
      setMapConfig({
        zoom: dynamicZoom,
        center: currentPosition,
        bearing: finalBearing,
        followUser: true
      });
    } else {
      // Fallback campground navigation view
      setMapConfig({
        zoom: 18, // Closer zoom for campground fallback
        center: currentPosition,
        bearing: 0,
        followUser: true
      });
    }
  }, [route, currentPosition, isNavigating, currentStep]);

  return mapConfig;
};