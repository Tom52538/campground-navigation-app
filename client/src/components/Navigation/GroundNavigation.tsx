import { useState, useEffect, useCallback, useMemo } from 'react';
import { Navigation, VolumeX, Volume2, Square, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NavigationRoute, Coordinates } from '@/types/navigation';
import { useNavigationTracking } from '@/hooks/useNavigationTracking';
import { RouteTracker, RouteProgress } from '@/lib/routeTracker';
import { VoiceGuide } from '@/lib/voiceGuide';

interface GroundNavigationProps {
  route: NavigationRoute;
  onEndNavigation: () => void;
  onRouteUpdate?: (newRoute: NavigationRoute) => void;
  isVisible: boolean;
}

export const GroundNavigation = ({ 
  route, 
  onEndNavigation,
  onRouteUpdate,
  isVisible 
}: GroundNavigationProps) => {
  const [isNavigating, setIsNavigating] = useState(true);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [routeProgress, setRouteProgress] = useState<RouteProgress | null>(null);
  const [isOffRoute, setIsOffRoute] = useState(false);
  const [lastAnnouncedDistance, setLastAnnouncedDistance] = useState<number>(0);

  // Professional voice guide system
  const voiceGuide = useMemo(() => new VoiceGuide(), []);

  // Continuous GPS tracking
  const { currentPosition, error: gpsError, isTracking } = useNavigationTracking(isNavigating, {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 1000
  });

  // Route tracker instance
  const routeTracker = useMemo(() => {
    return new RouteTracker(
      route,
      (stepIndex) => setCurrentStepIndex(stepIndex),
      () => {
        // Route completed
        setIsNavigating(false);
        voiceGuide.announceDestinationReached();
        setTimeout(() => onEndNavigation(), 2000);
      },
      (offRouteDistance) => {
        setIsOffRoute(true);
        voiceGuide.announceOffRoute();
        console.log(`Off route detected: ${Math.round(offRouteDistance * 1000)}m from route`);
      }
    );
  }, [route, onEndNavigation]);



  // Update route progress when position changes
  useEffect(() => {
    if (!currentPosition || !isNavigating) return;

    const progress = routeTracker.updatePosition(currentPosition.position);
    setRouteProgress(progress);

    // Update off-route status
    if (progress.isOffRoute && !isOffRoute) {
      setIsOffRoute(true);
    } else if (!progress.isOffRoute && isOffRoute) {
      setIsOffRoute(false);
    }

  }, [currentPosition, isNavigating, routeTracker, isOffRoute]);

  // Smart voice announcements based on distance
  useEffect(() => {
    if (!routeProgress || !voiceGuide.isVoiceEnabled() || !currentPosition) return;

    const distance = routeProgress.distanceToNext;
    const currentInstruction = routeTracker.getCurrentInstruction();
    
    if (!currentInstruction) return;

    // Announce at specific distance thresholds
    const shouldAnnounce = (
      (distance < 0.2 && lastAnnouncedDistance >= 0.2) || // 200m
      (distance < 0.1 && lastAnnouncedDistance >= 0.1) || // 100m
      (distance < 0.05 && lastAnnouncedDistance >= 0.05) || // 50m
      (distance < 0.02 && lastAnnouncedDistance >= 0.02)   // 20m
    );

    if (shouldAnnounce) {
      voiceGuide.announceInstruction(currentInstruction.instruction, distance);
      setLastAnnouncedDistance(distance);
    }
  }, [routeProgress, voiceGuide, routeTracker, lastAnnouncedDistance, currentPosition]);

  // Auto-announce when navigation starts
  useEffect(() => {
    if (voiceGuide.isVoiceEnabled() && isNavigating) {
      const currentInstruction = routeTracker.getCurrentInstruction();
      if (currentInstruction) {
        setTimeout(() => {
          voiceGuide.announceNavigationStart(currentInstruction.instruction);
        }, 1000);
      }
    }
  }, [voiceGuide, isNavigating, routeTracker]);

  // Get current instruction from route tracker
  const currentInstruction = routeTracker.getCurrentInstruction();
  const nextInstruction = routeTracker.getNextInstruction();

  const toggleVoice = () => {
    if (voiceGuide.isVoiceEnabled()) {
      voiceGuide.disable();
    } else {
      voiceGuide.enable();
      const currentInstruction = routeTracker.getCurrentInstruction();
      if (currentInstruction) {
        voiceGuide.speak(`Voice navigation enabled. ${currentInstruction.instruction}`, 'high');
      }
    }
  };

  const handleEndNavigation = () => {
    setIsNavigating(false);
    voiceGuide.disable();
    onEndNavigation();
  };

  // Format remaining distance and time from route progress
  const formatDistance = (km: number) => {
    if (km < 1) return `${Math.round(km * 1000)}m`;
    return `${km.toFixed(1)}km`;
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.ceil(seconds / 60);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  if (!isVisible || !currentInstruction) return null;

  return (
    <div className="absolute top-16 left-4 right-4 z-30">
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border-2 border-black/20 p-4">
        {/* GPS Status & Off-Route Warning */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Navigation className={`w-5 h-5 ${isTracking ? 'text-green-500' : 'text-gray-400'}`} />
            <span className="text-sm font-medium">
              Step {currentStepIndex + 1} of {route.instructions.length}
            </span>
            {isOffRoute && (
              <div className="flex items-center space-x-1 text-red-600">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-xs font-medium">Off Route</span>
              </div>
            )}
          </div>
          <div className="text-sm text-gray-600">
            {routeProgress ? (
              <>
                {formatDistance(routeProgress.distanceRemaining)} • {formatDuration(routeProgress.estimatedTimeRemaining)}
              </>
            ) : (
              <>
                {route.totalDistance} • {route.estimatedTime}
              </>
            )}
          </div>
        </div>

        {/* GPS Error Warning */}
        {gpsError && (
          <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-sm text-red-800">
              <AlertTriangle className="w-4 h-4 inline mr-1" />
              {gpsError}
            </div>
          </div>
        )}

        {/* Current instruction */}
        <div className="mb-3">
          <div className="text-lg font-bold text-gray-900 mb-1">
            {currentInstruction.instruction}
          </div>
          <div className="text-sm text-gray-600">
            Distance: {currentInstruction.distance} • Duration: {currentInstruction.duration}
          </div>
          {routeProgress && routeProgress.distanceToNext < 0.1 && (
            <div className="text-sm font-medium text-orange-600 mt-1">
              Approaching turn in {Math.round(routeProgress.distanceToNext * 1000)}m
            </div>
          )}
        </div>

        {/* Progress bar */}
        {routeProgress && (
          <div className="mb-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${routeProgress.percentComplete}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {Math.round(routeProgress.percentComplete)}% complete
            </div>
          </div>
        )}

        {/* Next instruction preview */}
        {nextInstruction && (
          <div className="mb-3 p-2 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-700">
              <span className="font-medium">Next:</span> {nextInstruction.instruction}
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleVoice}
              className="flex items-center space-x-2"
            >
              {voiceGuide.isVoiceEnabled() ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span>{voiceGuide.isVoiceEnabled() ? 'Voice On' : 'Voice Off'}</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                const success = await voiceGuide.testVoice();
                if (!success) {
                  alert('Voice test failed. Please check your browser audio settings.');
                }
              }}
              className="text-xs bg-green-50 hover:bg-green-100"
            >
              Test Voice
            </Button>
          </div>

          <Button
            variant="destructive"
            size="sm"
            onClick={handleEndNavigation}
            className="flex items-center space-x-2"
          >
            <Square className="w-4 h-4" />
            <span>End Navigation</span>
          </Button>
        </div>
      </div>
    </div>
  );
};