import React, { useState, useEffect } from 'react';
import { X, Volume2, VolumeX } from 'lucide-react';
import { Coordinates, POI } from '@/types';
import { calculateDistance } from '@/lib/mapUtils';
import { translateInstruction } from '@/lib/i18n';

interface NavigationPanelProps {
  route: any;
  currentPosition: Coordinates;
  destination: POI | null;
  onStop: () => void;
  language: string;
}

export function NavigationPanel({ route, currentPosition, destination, onStop, language }: NavigationPanelProps) {
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const steps = route?.routes?.[0]?.legs?.[0]?.steps || [];
  const currentStep = steps[currentStepIndex];
  const totalDistance = route?.routes?.[0]?.legs?.[0]?.distance?.text || '';
  const totalDuration = route?.routes?.[0]?.legs?.[0]?.duration?.text || '';

  // Voice guidance
  useEffect(() => {
    if (voiceEnabled && currentStep && 'speechSynthesis' in window) {
      const instruction = translateInstruction(currentStep.html_instructions.replace(/<[^>]*>/g, ''), language as any);
      const utterance = new SpeechSynthesisUtterance(instruction);
      utterance.lang = language === 'de' ? 'de-DE' : 'en-US';
      speechSynthesis.speak(utterance);
    }
  }, [currentStepIndex, voiceEnabled, language]);

  // Update current step based on position
  useEffect(() => {
    if (steps.length > 0 && currentPosition) {
      // Simple proximity-based step advancement
      const currentStepEnd = steps[currentStepIndex]?.end_location;
      if (currentStepEnd) {
        const distance = calculateDistance(
          currentPosition,
          { lat: currentStepEnd.lat, lng: currentStepEnd.lng }
        );
        
        // If within 20m of step end, advance to next step
        if (distance < 0.02 && currentStepIndex < steps.length - 1) {
          setCurrentStepIndex(prev => prev + 1);
        }
      }
    }
  }, [currentPosition, steps, currentStepIndex]);

  if (!currentStep) return null;

  const instruction = translateInstruction(
    currentStep.html_instructions.replace(/<[^>]*>/g, ''), 
    language as any
  );

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg">
      {/* Main Navigation Info */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1">
            <div className="text-lg font-semibold text-gray-900 mb-1">
              {instruction}
            </div>
            <div className="text-sm text-gray-600">
              {currentStep.distance?.text} • {currentStep.duration?.text}
            </div>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors"
            >
              {voiceEnabled ? (
                <Volume2 className="w-5 h-5 text-blue-600" />
              ) : (
                <VolumeX className="w-5 h-5 text-gray-600" />
              )}
            </button>
            <button
              onClick={onStop}
              className="p-2 rounded-full bg-red-100 hover:bg-red-200 transition-colors"
            >
              <X className="w-5 h-5 text-red-600" />
            </button>
          </div>
        </div>

        {/* Route Summary */}
        <div className="flex items-center justify-between text-sm text-gray-600 pt-3 border-t border-gray-200">
          <div>
            Step {currentStepIndex + 1} of {steps.length}
          </div>
          <div>
            {totalDistance} • {totalDuration}
          </div>
          <div>
            → {destination?.name}
          </div>
        </div>
      </div>
    </div>
  );
}