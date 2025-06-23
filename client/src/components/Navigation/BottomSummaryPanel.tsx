import React from 'react';
import { X } from 'lucide-react';

interface BottomSummaryPanelProps {
  totalDistance: string;
  totalDuration: string;
  eta: string;
  isVisible: boolean;
  onEndNavigation: () => void;
}

export const BottomSummaryPanel: React.FC<BottomSummaryPanelProps> = ({
  totalDistance,
  totalDuration,
  eta,
  isVisible,
  onEndNavigation
}) => {
  if (!isVisible) return null;

  return (
    <div className="absolute bottom-4 left-4 right-4 z-30">
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border-2 border-gray-200 p-4">
        <div className="flex justify-between items-center">
          <div className="flex space-x-6">
            <div>
              <div className="text-sm text-gray-600">Entfernung</div>
              <div className="font-bold text-gray-900">{totalDistance}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Zeit</div>
              <div className="font-bold text-gray-900">{totalDuration}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Ankunft</div>
              <div className="font-bold text-gray-900">{eta}</div>
            </div>
          </div>
          <button
            onClick={onEndNavigation}
            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};