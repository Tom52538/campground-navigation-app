import React from 'react';

interface TopManeuverPanelProps {
  instruction: string;
  distance: string;
  isVisible: boolean;
}

export const TopManeuverPanel: React.FC<TopManeuverPanelProps> = ({
  instruction,
  distance,
  isVisible
}) => {
  if (!isVisible) return null;

  return (
    <div className="absolute top-4 left-4 right-4 z-30">
      <div className="bg-blue-600 text-white rounded-xl shadow-lg border-2 border-white p-4">
        <div className="text-lg font-bold mb-1">
          {instruction || "Route wird berechnet..."}
        </div>
        {distance && (
          <div className="text-sm opacity-90">
            in {distance}
          </div>
        )}
      </div>
    </div>
  );
};