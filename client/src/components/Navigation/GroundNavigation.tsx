import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Navigation, VolumeX, Volume2, Square, AlertTriangle, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NavigationRoute, Coordinates } from '@/types/navigation';
import { useNavigationTracking } from '@/hooks/useNavigationTracking';
import { RouteTracker, RouteProgress } from '@/lib/routeTracker';
import { VoiceGuide } from '@/lib/voiceGuide';
import { RerouteService } from '@/lib/rerouteService';
import { NavigationPerformanceMonitor } from './NavigationPerformanceMonitor';
import { offlineStorage } from '@/lib/offlineStorage';
import { useLanguage } from '@/hooks/useLanguage';
import { getTranslation, translateInstruction } from '@/lib/i18n';

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
  const [hasAnnouncedStart, setHasAnnouncedStart] = useState(false);
  const [isRerouting, setIsRerouting] = useState(false);
  const [offRouteCount, setOffRouteCount] = useState(0);
  const [showPerformanceMonitor, setShowPerformanceMonitor] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [gpsUpdateCount, setGpsUpdateCount] = useState(0);

  // Language system
  const { currentLanguage } = useLanguage();

  // Professional voice guide system with language support
  const voiceGuide = useMemo(() => {
    const guide = new VoiceGuide();
    guide.setLanguage(currentLanguage);
    return guide;
  }, [currentLanguage]);
  
  // Rerouting service
  const rerouteService = useMemo(() => new RerouteService(), []);

  // Continuous GPS tracking with adaptive performance
  const { currentPosition, error: gpsError, isTracking } = useNavigationTracking(isNavigating, {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 1000,
    adaptiveTracking: true
  });

  // Automatic rerouting handler
  const handleAutoReroute = useCallback(async (offRouteDistance: number) => {
    if (isRerouting || !currentPosition || !onRouteUpdate) return;

    setIsRerouting(true);
    try {
      // Extract destination from current route
      const geometry = route.geometry;
      if (!geometry || geometry.length === 0) {
        throw new Error('No route geometry available');
      }

      const destination = {
        lat: geometry[geometry.length - 1][1],
        lng: geometry[geometry.length - 1][0]
      };

      voiceGuide.speak('Recalculating route...', 'high');
      
      const newRoute = await rerouteService.quickReroute(
        currentPosition.position,
        destination
      );

      // Update the route
      onRouteUpdate(newRoute);
      
      // Reset tracking state
      setCurrentStepIndex(0);
      setOffRouteCount(0);
      setLastAnnouncedDistance(0);
      
      voiceGuide.announceRerouting();
      console.log('Route recalculated successfully');
      
    } catch (error) {
      console.error('Rerouting failed:', error);
      voiceGuide.speak('Unable to recalculate route. Continue to destination.', 'high');
    } finally {
      setIsRerouting(false);
    }
  }, [isRerouting, currentPosition, route.geometry, rerouteService, voiceGuide, onRouteUpdate]);

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
        setOffRouteCount(prev => prev + 1);
        console.log(`Off route detected: ${Math.round(offRouteDistance * 1000)}m from route`);
        
        // Trigger rerouting if significantly off course
        if (rerouteService.shouldReroute(offRouteDistance, offRouteCount)) {
          handleAutoReroute(offRouteDistance);
        } else {
          voiceGuide.announceOffRoute();
        }
      }
    );
  }, [route, onEndNavigation, handleAutoReroute, rerouteService, voiceGuide, offRouteCount]);



  // Update route progress when position changes - CRITICAL for live navigation
  useEffect(() => {
    if (!currentPosition || !isNavigating) return;

    // Single call to route tracker - prevents multiple rapid updates
    const progress = routeTracker.updatePosition(currentPosition.position);
    setRouteProgress(progress);

    // Update step index if it changed (critical for UI updates)
    if (progress.currentStep !== currentStepIndex) {
      setCurrentStepIndex(progress.currentStep);
    }

    // Update off-route status
    if (progress.isOffRoute && !isOffRoute) {
      setIsOffRoute(true);
    } else if (!progress.isOffRoute && isOffRoute) {
      setIsOffRoute(false);
      setOffRouteCount(0); // Reset counter when back on route
    }

    // Increment GPS update counter for performance monitoring
    setGpsUpdateCount(prev => prev + 1);

  }, [currentPosition?.timestamp, isNavigating, routeTracker, isOffRoute, currentStepIndex]);

  // Voice announcement timer ref to prevent loops
  const announcementTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastAnnouncementRef = useRef<{ step: number; distance: number; time: number }>({ step: -1, distance: 999, time: 0 });
  const [lastAnnouncedDistance, setLastAnnouncedDistance] = useState(0);

  // Smart voice announcements based on distance
  useEffect(() => {
    if (!routeProgress || !voiceGuide.isVoiceEnabled() || !currentPosition) return;

    const distance = routeProgress.distanceToNext;
    const currentStep = routeProgress.currentStep;
    const currentInstruction = routeTracker.getCurrentInstruction();
    const now = Date.now();
    
    if (!currentInstruction) return;

    // Clear any pending announcements
    if (announcementTimerRef.current) {
      clearTimeout(announcementTimerRef.current);
      announcementTimerRef.current = null;
    }

    // Check if this is a new step
    const isNewStep = currentStep !== lastAnnouncementRef.current.step;
    
    // Check distance thresholds (only announce once per threshold per step)
    const shouldAnnounce = isNewStep || (
      (distance <= 0.2 && lastAnnouncementRef.current.distance > 0.2) || // 200m
      (distance <= 0.1 && lastAnnouncementRef.current.distance > 0.1) || // 100m
      (distance <= 0.05 && lastAnnouncementRef.current.distance > 0.05) // 50m
    );

    // Prevent announcements within 3 seconds of each other
    const timeSinceLastAnnouncement = now - lastAnnouncementRef.current.time;
    const canAnnounce = shouldAnnounce && timeSinceLastAnnouncement > 3000;

    if (canAnnounce) {
      // Delay announcement slightly to prevent rapid-fire speech
      announcementTimerRef.current = setTimeout(() => {
        voiceGuide.announceInstruction(currentInstruction.instruction, distance);
        lastAnnouncementRef.current = { step: currentStep, distance, time: Date.now() };
      }, 500);
    }
  }, [routeProgress?.distanceToNext, routeProgress?.currentStep, voiceGuide, routeTracker, currentPosition]);

  // Navigation start announcement (only once when voice is first enabled)
  useEffect(() => {
    if (voiceGuide.isVoiceEnabled() && isNavigating && !hasAnnouncedStart) {
      setHasAnnouncedStart(true);
      const currentInstruction = routeTracker.getCurrentInstruction();
      if (currentInstruction) {
        setTimeout(() => {
          voiceGuide.announceNavigationStart(currentInstruction.instruction);
          lastAnnouncementRef.current = { step: 0, distance: 999, time: Date.now() };
        }, 1500);
      }
    }
  }, [voiceGuide, isNavigating, routeTracker, hasAnnouncedStart]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (announcementTimerRef.current) {
        clearTimeout(announcementTimerRef.current);
      }
    };
  }, []);

  // Get current instruction from route tracker
  const currentInstruction = routeTracker.getCurrentInstruction();
  const nextInstruction = routeTracker.getNextInstruction();

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
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

  // Save route for offline access
  const saveRouteOffline = useCallback(async () => {
    try {
      const routeId = `route_${Date.now()}`;
      await offlineStorage.saveRoute(routeId, route, `Navigation to ${route.instructions[route.instructions.length - 1]?.instruction || 'destination'}`);
      console.log('Route saved offline successfully');
    } catch (error) {
      console.error('Failed to save route offline:', error);
    }
  }, [route]);

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
    <div className="absolute top-20 left-4 right-4 z-30">
      <div 
        className="p-4 rounded-2xl border"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(40px) saturate(200%) brightness(1.1)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          WebkitBackdropFilter: 'blur(40px) saturate(200%) brightness(1.1)'
        }}
      >
        {/* Primary Instruction with Icon */}
        <div className="flex items-center gap-4 mb-4">
          <div 
            className="text-white rounded-lg p-3 flex-shrink-0"
            style={{
              background: 'rgba(59, 130, 246, 0.8)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Navigation className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h2 
              className="text-xl font-bold leading-tight"
              style={{
                color: '#1f2937',
                textShadow: '0 1px 3px rgba(255, 255, 255, 0.8)'
              }}
            >
              {translateInstruction(currentInstruction.instruction, currentLanguage)}
            </h2>
            <p 
              className="text-lg font-medium"
              style={{
                color: '#374151',
                textShadow: '0 1px 2px rgba(255, 255, 255, 0.6)'
              }}
            >
              {routeProgress ? formatDistance(routeProgress.distanceToNext) : currentInstruction.distance}
            </p>
          </div>
          {isOffRoute && (
            <div 
              className="flex items-center space-x-1 px-2 py-1 rounded-lg"
              style={{
                background: 'rgba(239, 68, 68, 0.8)',
                color: '#ffffff',
                backdropFilter: 'blur(10px)'
              }}
            >
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs font-medium">{getTranslation(currentLanguage, 'navigation.offRoute')}</span>
            </div>
          )}
        </div>

        {/* GPS Error Warning */}
        {gpsError && (
          <div className="mb-3 p-3 bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-lg">
            <div className="text-sm text-red-800 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2" />
              {gpsError}
            </div>
          </div>
        )}

        {/* Progress Bar & ETA */}
        {routeProgress && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span className="font-medium">{route.totalDistance}</span>
              <span>ETA: {routeProgress.dynamicETA.estimatedArrival.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="w-full bg-gray-200/50 rounded-full h-1.5">
              <div 
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-500" 
                style={{ width: `${routeProgress.percentComplete}%` }}
              />
            </div>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleVoice}
              className="p-3 rounded-full transition-all duration-200"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(30px)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
              }}
            >
              {voiceEnabled ? <Volume2 className="w-5 h-5 text-blue-600" /> : <VolumeX className="w-5 h-5 text-gray-500" />}
            </button>
            
            <button
              onClick={() => setShowPerformanceMonitor(!showPerformanceMonitor)}
              className="p-3 rounded-full transition-all duration-200"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(30px)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
              }}
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <button
            onClick={handleEndNavigation}
            className="px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2"
            style={{
              background: 'rgba(239, 68, 68, 0.7)',
              backdropFilter: 'blur(20px)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <Square className="w-4 h-4" />
            <span>{getTranslation(currentLanguage, 'navigation.end')}</span>
          </button>
        </div>
      </div>

      {/* Performance Monitor */}
      <NavigationPerformanceMonitor
        gpsAccuracy={currentPosition?.accuracy || 0}
        adaptiveInterval={1000}
        isVisible={showPerformanceMonitor}
        currentSpeed={routeProgress?.currentSpeed || 0}
        averageSpeed={routeProgress?.averageSpeed || 0}
        updateCount={gpsUpdateCount}
      />
    </div>
  );
};