import { useState, useEffect, useCallback } from 'react';
import { Navigation, VolumeX, Volume2, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NavigationRoute, Coordinates } from '@/types/navigation';
import { calculateDistance } from '@/lib/mapUtils';

interface GroundNavigationProps {
  route: NavigationRoute;
  currentPosition: Coordinates;
  onEndNavigation: () => void;
  isVisible: boolean;
}

export const GroundNavigation = ({ 
  route, 
  currentPosition, 
  onEndNavigation,
  isVisible 
}: GroundNavigationProps) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [lastSpokenInstruction, setLastSpokenInstruction] = useState('');

  const currentInstruction = route.instructions[currentStepIndex];
  const nextInstruction = route.instructions[currentStepIndex + 1];

  // Voice synthesis
  const speakInstruction = useCallback((text: string) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    window.speechSynthesis.speak(utterance);
  }, [voiceEnabled]);

  // Calculate distance to next turn point
  const getDistanceToNextStep = useCallback(() => {
    if (!route.geometry || currentStepIndex >= route.geometry.length - 1) return 0;
    
    const nextStepCoord = route.geometry[currentStepIndex + 1];
    if (!nextStepCoord || nextStepCoord.length < 2) return 0;
    
    return calculateDistance(currentPosition, {
      lat: nextStepCoord[1],
      lng: nextStepCoord[0]
    });
  }, [currentPosition, route.geometry, currentStepIndex]);

  // Progress tracking
  useEffect(() => {
    const distanceToNext = getDistanceToNextStep();
    
    // If within 20 meters of next step, advance to next instruction
    if (distanceToNext < 0.02 && currentStepIndex < route.instructions.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  }, [currentPosition, getDistanceToNextStep, currentStepIndex, route.instructions.length]);

  // Voice announcements
  useEffect(() => {
    if (!currentInstruction || !voiceEnabled) return;
    
    const distanceToNext = getDistanceToNextStep();
    const instructionText = currentInstruction.instruction;
    
    // Announce new instruction or distance warnings
    if (instructionText !== lastSpokenInstruction) {
      speakInstruction(`In ${currentInstruction.distance}, ${instructionText}`);
      setLastSpokenInstruction(instructionText);
    } else if (distanceToNext < 0.05 && distanceToNext > 0.02) {
      // Announce when approaching turn (50m to 20m)
      speakInstruction(`In 50 meters, ${instructionText}`);
    }
  }, [currentInstruction, speakInstruction, getDistanceToNextStep, lastSpokenInstruction, voiceEnabled]);

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
    if (!voiceEnabled && currentInstruction) {
      speakInstruction(`Navigation started. ${currentInstruction.instruction}`);
    } else {
      window.speechSynthesis.cancel();
    }
  };

  const getRemainingDistance = () => {
    const remainingSteps = route.instructions.slice(currentStepIndex);
    return remainingSteps.reduce((total, step) => {
      const distance = parseFloat(step.distance.replace(/[^\d.]/g, ''));
      return total + (isNaN(distance) ? 0 : distance);
    }, 0);
  };

  const getRemainingTime = () => {
    const remainingSteps = route.instructions.slice(currentStepIndex);
    const totalMinutes = remainingSteps.reduce((total, step) => {
      const duration = parseFloat(step.duration.replace(/[^\d.]/g, ''));
      return total + (isNaN(duration) ? 0 : duration);
    }, 0);
    return `${Math.ceil(totalMinutes)} min`;
  };

  if (!isVisible || !currentInstruction) return null;

  return (
    <div className="absolute top-16 left-4 right-4 z-30">
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border-2 border-black/20 p-4">
        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Navigation className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium">
              Step {currentStepIndex + 1} of {route.instructions.length}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            {getRemainingDistance().toFixed(0)}m • {getRemainingTime()}
          </div>
        </div>

        {/* Current instruction */}
        <div className="mb-3">
          <div className="text-lg font-bold text-gray-900 mb-1">
            {currentInstruction.instruction}
          </div>
          <div className="text-sm text-gray-600">
            Distance: {currentInstruction.distance} • Duration: {currentInstruction.duration}
          </div>
          {getDistanceToNextStep() < 0.1 && (
            <div className="text-sm font-medium text-orange-600 mt-1">
              Approaching turn in {Math.round(getDistanceToNextStep() * 1000)}m
            </div>
          )}
        </div>

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
            variant="destructive"
            size="sm"
            onClick={onEndNavigation}
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