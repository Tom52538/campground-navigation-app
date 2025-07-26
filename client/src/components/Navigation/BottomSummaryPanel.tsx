
import React from 'react';
import { Button } from '@/components/ui/button';
import { Square } from 'lucide-react';

interface BottomSummaryPanelProps {
  timeRemaining: string;
  distanceRemaining: string;
  eta: string;
  onEndNavigation: () => void;
}

export const BottomSummaryPanel: React.FC<BottomSummaryPanelProps> = ({ 
  timeRemaining, 
  distanceRemaining, 
  eta, 
  onEndNavigation 
}) => {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-30 p-3"
      style={{
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(16px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderBottom: 'none',
        borderTopLeftRadius: '16px',
        borderTopRightRadius: '16px',
        boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.1)',
        paddingBottom: 'max(12px, env(safe-area-inset-bottom))'
      }}
    >
      <div className="flex items-center justify-between">
        <div className="text-left flex-grow min-w-0">
          <p className="text-xl font-bold text-gray-900 truncate">
            {timeRemaining}
          </p>
          <p className="text-sm text-gray-600 truncate">
            {distanceRemaining} • ETA {eta}
          </p>
        </div>
        <Button 
          variant="destructive" 
          size="lg" 
          onClick={onEndNavigation} 
          className="rounded-full h-12 ml-4 flex-shrink-0"
        >
          <Square className="w-5 h-5 mr-2" />
          End
        </Button>
      </div>
    </div>
  );
};
