import React, { useState, useEffect, useMemo } from 'react';
import { useNavigationTracking } from '@/hooks/useNavigationTracking';
import { RouteTracker, NavigationRoute } from '@/lib/routeTracker';
import { TopManeuverPanel } from './TopManeuverPanel';
import { BottomSummaryPanel } from './BottomSummaryPanel';

interface GroundNavigationProps {
  route: NavigationRoute;
  onEndNavigation: () => void;
  isVisible: boolean;
}

export const GroundNavigation: React.FC<GroundNavigationProps> = ({
  route,
  onEndNavigation,
  isVisible
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isOffRoute, setIsOffRoute] = useState(false);
  
  // Start continuous tracking when this component is visible and navigating
  const { currentPosition, error: gpsError } = useNavigationTracking(isVisible);

  const routeTracker = useMemo(() => {
    return new RouteTracker(route, setCurrentStepIndex, setIsOffRoute);
  }, [route]);

  // Update route progress whenever the GPS position changes
  useEffect(() => {
    if (currentPosition) {
      routeTracker.updatePosition(currentPosition.position);
    }
  }, [currentPosition, routeTracker]);
  
  const currentInstruction = route.instructions[currentStepIndex];
  
  // Calculate ETA
  const currentTime = new Date();
  const etaTime = new Date(currentTime.getTime() + (parseInt(route.totalDuration) * 60000));
  const eta = etaTime.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

  return (
    <>
      <TopManeuverPanel
        instruction={currentInstruction?.instruction || "Route wird berechnet..."}
        distance={currentInstruction?.distance || ""}
        isVisible={isVisible}
      />
      
      <BottomSummaryPanel
        totalDistance={route.totalDistance}
        totalDuration={route.totalDuration}
        eta={eta}
        isVisible={isVisible}
        onEndNavigation={onEndNavigation}
      />
      
      {gpsError && (
        <div className="absolute top-20 left-4 right-4 z-40 bg-red-500 text-white p-2 rounded">
          GPS Fehler: {gpsError}
        </div>
      )}
    </>
  );
};