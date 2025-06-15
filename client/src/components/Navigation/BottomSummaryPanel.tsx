import { Button } from '@/components/ui/button';
import { Square } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { getTranslation } from '@/lib/i18n';

interface BottomSummaryPanelProps {
  timeRemaining: string;
  distanceRemaining: string;
  eta: string;
  onEndNavigation: () => void;
}

export const BottomSummaryPanel = ({ 
  timeRemaining, 
  distanceRemaining, 
  eta, 
  onEndNavigation 
}: BottomSummaryPanelProps) => {
  const { currentLanguage } = useLanguage();

  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-30 p-3"
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(0, 0, 0, 0.1)',
      }}
    >
      <div className="flex items-center justify-between">
        <div className="text-left">
          <p className="text-xl font-bold text-gray-900">{timeRemaining}</p>
          <p className="text-sm text-gray-600">{distanceRemaining} • ETA {eta}</p>
        </div>
        <Button 
          variant="destructive" 
          size="lg" 
          onClick={onEndNavigation} 
          className="rounded-full h-12"
        >
          <Square className="w-5 h-5 mr-2" />
          {getTranslation(currentLanguage, 'navigation.end')}
        </Button>
      </div>
    </div>
  );
};