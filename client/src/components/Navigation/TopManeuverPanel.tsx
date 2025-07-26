
import React from 'react';
import { Navigation } from 'lucide-react';

interface TopManeuverPanelProps {
  instruction: string;
  distance: string;
}

export const TopManeuverPanel: React.FC<TopManeuverPanelProps> = ({ 
  instruction, 
  distance 
}) => {
  return (
    <div
      className="absolute top-4 left-4 right-4 z-30 p-4 rounded-2xl flex items-center gap-4"
      style={{
        background: '#1a73e8', // Google Maps Blue
        color: 'white',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      }}
    >
      <div className="flex-shrink-0">
        <Navigation className="w-8 h-8" />
      </div>
      <div className="flex-grow min-w-0">
        <h2 className="text-lg font-bold leading-tight mb-1 truncate">
          {instruction}
        </h2>
        <p className="text-sm font-medium opacity-90">
          {distance}
        </p>
      </div>
    </div>
  );
};
