import { useState, useEffect, useCallback, useMemo } from 'react';
import { Navigation, VolumeX, Volume2, Square, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NavigationRoute, Coordinates } from '@/types/navigation';
import { useNavigationTracking } from '@/hooks/useNavigationTracking';
import { RouteTracker, RouteProgress } from '@/lib/routeTracker';

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
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [routeProgress, setRouteProgress] = useState<RouteProgress | null>(null);
  const [isOffRoute, setIsOffRoute] = useState(false);
  const [lastAnnouncedDistance, setLastAnnouncedDistance] = useState<number>(0);

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
        speakInstruction("You have arrived at your destination");
        setTimeout(() => onEndNavigation(), 2000);
      },
      (offRouteDistance) => {
        setIsOffRoute(true);
        console.log(`Off route detected: ${Math.round(offRouteDistance * 1000)}m from route`);
      }
    );
  }, [route, onEndNavigation]);

  // Optimized voice synthesis with pre-loading and faster response
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  
  // Pre-load voices when component mounts to reduce delay
  useEffect(() => {
    if (!window.speechSynthesis) return;
    
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        setVoicesLoaded(true);
        console.log('Navigation voices loaded:', voices.length);
      }
    };
    
    // Load voices immediately if available
    loadVoices();
    
    // Listen for voices changed event (some browsers load asynchronously)
    window.speechSynthesis.onvoiceschanged = loadVoices;
    
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const speakInstruction = useCallback((text: string, priority: 'low' | 'medium' | 'high' = 'medium') => {
    if (!voiceEnabled || !window.speechSynthesis) return;
    
    try {
      // Cancel current speech for high priority
      if (priority === 'high') {
        window.speechSynthesis.cancel();
      }
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9; // Slightly faster for navigation
      utterance.pitch = 1;
      utterance.volume = 1;
      utterance.lang = 'en-US';
      
      // Use a preferred voice if available (usually faster)
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.lang.startsWith('en') && voice.localService
      ) || voices[0];
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      // Reduced logging for faster performance
      utterance.onstart = () => console.log(`🔊 "${text}"`);
      utterance.onerror = (e) => console.error('Voice error:', e.error);
      
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Speech synthesis error:', error);
    }
  }, [voiceEnabled, voicesLoaded]);

  // Update route progress when position changes
  useEffect(() => {
    if (!currentPosition || !isNavigating) return;

    const progress = routeTracker.updatePosition(currentPosition.position);
    setRouteProgress(progress);

    // Update off-route status
    if (progress.isOffRoute && !isOffRoute) {
      setIsOffRoute(true);
      speakInstruction("Off route detected", 'high');
    } else if (!progress.isOffRoute && isOffRoute) {
      setIsOffRoute(false);
    }

  }, [currentPosition, isNavigating, routeTracker, isOffRoute]);

  // Smart voice announcements based on distance with immediate testing
  useEffect(() => {
    if (!routeProgress || !voiceEnabled || !currentPosition) return;

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
      let announcement = "";
      if (distance > 0.1) {
        announcement = `In ${Math.round(distance * 1000)} meters, ${currentInstruction.instruction}`;
      } else if (distance > 0.02) {
        announcement = `${currentInstruction.instruction} ahead`;
      } else {
        announcement = currentInstruction.instruction;
      }
      
      speakInstruction(announcement, distance < 0.02 ? 'high' : 'medium');
      setLastAnnouncedDistance(distance);
    }
  }, [routeProgress, voiceEnabled, routeTracker, lastAnnouncedDistance, speakInstruction]);

  // Auto-announce when navigation starts
  useEffect(() => {
    if (voiceEnabled && currentInstruction && isNavigating) {
      setTimeout(() => {
        speakInstruction(`Navigation started. ${currentInstruction.instruction}`, 'high');
      }, 1000); // 1 second delay for initial announcement
    }
  }, [voiceEnabled, isNavigating]); // Only trigger when voice is enabled or navigation starts

  // Get current instruction from route tracker
  const currentInstruction = routeTracker.getCurrentInstruction();
  const nextInstruction = routeTracker.getNextInstruction();

  const toggleVoice = () => {
    const newVoiceState = !voiceEnabled;
    setVoiceEnabled(newVoiceState);
    
    try {
      if (newVoiceState && currentInstruction) {
        // Test voice when enabling
        speakInstruction(`Navigation voice enabled. ${currentInstruction.instruction}`, 'high');
      } else if (window.speechSynthesis) {
        // Stop speech when disabling
        window.speechSynthesis.cancel();
      }
    } catch (error) {
      console.error('Voice toggle error:', error);
    }
  };

  const handleEndNavigation = () => {
    setIsNavigating(false);
    try {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    } catch (error) {
      console.error('Error stopping voice:', error);
    }
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
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span>{voiceEnabled ? 'Voice On' : 'Voice Off'}</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                console.log('Testing voice synthesis...');
                if (!window.speechSynthesis) {
                  console.error('Speech synthesis not supported');
                  alert('Speech synthesis not supported in this browser');
                  return;
                }
                
                try {
                  const utterance = new SpeechSynthesisUtterance('Navigation voice test successful');
                  utterance.volume = 1;
                  utterance.rate = 0.8;
                  utterance.pitch = 1;
                  utterance.onstart = () => console.log('Voice test started');
                  utterance.onend = () => console.log('Voice test completed');
                  utterance.onerror = (e) => console.error('Voice test error:', e);
                  
                  window.speechSynthesis.speak(utterance);
                } catch (error) {
                  console.error('Voice test failed:', error);
                  alert('Voice test failed: ' + String(error));
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