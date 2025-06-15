import { Navigation } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { translateInstruction } from '@/lib/i18n';

interface TopManeuverPanelProps {
  instruction: string;
  distance: string;
}

export const TopManeuverPanel = ({ instruction, distance }: TopManeuverPanelProps) => {
  const { currentLanguage } = useLanguage();
  
  return (
    <div
      className="absolute top-4 left-4 right-4 z-30 p-3 rounded-2xl flex items-center gap-4"
      style={{
        background: '#1a73e8', // Google Maps Blue
        color: 'white',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      }}
    >
      <div className="flex-shrink-0">
        <Navigation className="w-8 h-8" />
      </div>
      <div className="flex-grow">
        <h2 className="text-2xl font-bold">
          {translateInstruction(instruction, currentLanguage)}
        </h2>
        <p className="text-lg font-medium opacity-90">
          {distance}
        </p>
      </div>
    </div>
  );
};