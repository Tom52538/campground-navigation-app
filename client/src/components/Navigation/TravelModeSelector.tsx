import { Car, Bike, PersonStanding } from 'lucide-react';

interface TravelModeSelectorProps {
  currentMode: 'car' | 'bike' | 'pedestrian';
  onModeChange: (mode: 'car' | 'bike' | 'pedestrian') => void;
}

const TRAVEL_MODES = {
  car: {
    icon: Car,
    label: 'Auto',
    description: 'Fahren mit dem Auto',
    color: '#dc2626',
    speedKmh: 30
  },
  bike: {
    icon: Bike,
    label: 'Fahrrad',
    description: 'Radfahren',
    color: '#059669',
    speedKmh: 12
  },
  pedestrian: {
    icon: PersonStanding,
    label: 'Zu Fuß',
    description: 'Gehen',
    color: '#2563eb',
    speedKmh: 6
  }
};

export const TravelModeSelector = ({ currentMode, onModeChange }: TravelModeSelectorProps) => {
  const modes = Object.keys(TRAVEL_MODES) as Array<keyof typeof TRAVEL_MODES>;

  return (
    <div className="flex flex-col space-y-1 p-1.5 rounded-lg" style={{
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(8px)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      width: '48px'
    }}>
      {modes.map(mode => {
        const config = TRAVEL_MODES[mode];
        const Icon = config.icon;
        const isSelected = currentMode === mode;

        return (
          <button
            key={mode}
            onClick={() => onModeChange(mode)}
            className="flex flex-col items-center p-1.5 rounded-md transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              background: isSelected 
                ? `${config.color}20` 
                : 'transparent',
              border: isSelected 
                ? `2px solid ${config.color}` 
                : '2px solid transparent',
              color: isSelected ? config.color : '#6b7280',
              width: '40px',
              height: '40px'
            }}
            title={`${config.label} - ${config.description} (~${config.speedKmh} km/h)`}
          >
            <Icon 
              className="w-4 h-4" 
              style={{ 
                color: isSelected ? config.color : '#6b7280'
              }} 
            />
            <span 
              className="text-[10px] font-medium mt-0.5"
              style={{ 
                color: isSelected ? config.color : '#6b7280'
              }}
            >
              {config.label === 'Fahrrad' ? 'Rad' : config.label === 'Zu Fuß' ? 'Fuß' : config.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};