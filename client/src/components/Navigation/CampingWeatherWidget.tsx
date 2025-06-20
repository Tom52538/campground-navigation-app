import { useWeather } from '@/hooks/useWeather';
import { Coordinates } from '@/types/navigation';
import { useLanguage } from '@/hooks/useLanguage';

interface CampingWeatherWidgetProps {
  coordinates: Coordinates;
}

const getWeatherIcon = (condition?: string) => {
  if (!condition) return '☀️';
  
  const cond = condition.toLowerCase();
  if (cond.includes('clear') || cond.includes('sunny')) return '☀️';
  if (cond.includes('cloud')) return '☁️';
  if (cond.includes('rain') || cond.includes('drizzle')) return '🌧️';
  if (cond.includes('storm') || cond.includes('thunder')) return '⛈️';
  if (cond.includes('snow')) return '❄️';
  if (cond.includes('fog') || cond.includes('mist')) return '🌫️';
  if (cond.includes('wind')) return '💨';
  return '☀️';
};

const getCampingAlerts = (weather: any) => {
  const alerts = [];
  
  if (weather?.windSpeed > 20) {
    alerts.push({ icon: '💨', text: 'Windy', color: '#f59e0b' });
  }
  
  if (weather?.temperature < 5) {
    alerts.push({ icon: '🥶', text: 'Cold', color: '#3b82f6' });
  }
  
  if (weather?.condition?.toLowerCase().includes('rain')) {
    alerts.push({ icon: '🌧️', text: 'Rain', color: '#3b82f6' });
  }
  
  if (weather?.condition?.toLowerCase().includes('storm')) {
    alerts.push({ icon: '⛈️', text: 'Storm', color: '#dc2626' });
  }
  
  if (weather?.humidity > 80) {
    alerts.push({ icon: '💧', text: 'Humid', color: '#06b6d4' });
  }
  
  return alerts;
};

export const CampingWeatherWidget = ({ coordinates }: CampingWeatherWidgetProps) => {
  const { data: weather, isLoading } = useWeather(coordinates.lat, coordinates.lng);
  const { t } = useLanguage();
  
  if (isLoading) {
    return (
      <div 
        className="absolute bottom-4 right-4 z-20 p-3 rounded-xl min-w-[120px] animate-pulse"
        style={{
          background: 'rgba(255, 255, 255, 0.02)',
          backdropFilter: 'blur(60px) saturate(300%) brightness(1.2)',
          WebkitBackdropFilter: 'blur(60px) saturate(300%) brightness(1.2)',
          border: '1px solid rgba(255, 255, 255, 0.03)',
          boxShadow: '0 8px 32px rgba(31, 38, 135, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
        }}
      >
        <div className="h-8 bg-gray-200/50 rounded mb-2"></div>
        <div className="h-4 bg-gray-200/50 rounded mb-2"></div>
        <div className="h-4 bg-gray-200/50 rounded w-3/4"></div>
      </div>
    );
  }
  
  if (!weather) return null;
  
  const campingAlerts = getCampingAlerts(weather);
  
  return (
    <div 
      className="absolute bottom-4 right-4 z-20 p-3 rounded-xl min-w-[120px] max-w-[160px]"
      style={{
        background: 'rgba(255, 255, 255, 0.02)',
        backdropFilter: 'blur(60px) saturate(300%) brightness(1.2)',
        WebkitBackdropFilter: 'blur(60px) saturate(300%) brightness(1.2)',
        border: '1px solid rgba(255, 255, 255, 0.03)',
        boxShadow: '0 8px 32px rgba(31, 38, 135, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        minHeight: '80px'
      }}
    >
      {/* Temperature and Icon */}
      <div className="flex items-center space-x-2 mb-2">
        <span className="text-lg">{getWeatherIcon(weather.condition)}</span>
        <span 
          className="text-lg font-bold"
          style={{
            color: '#1f2937',
            textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'
          }}
        >
          {Math.round(weather.temperature || 0)}°C
        </span>
      </div>
      
      {/* Condition */}
      <div 
        className="text-xs capitalize mb-2 leading-tight"
        style={{
          color: '#4b5563',
          textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'
        }}
      >
{t(`weather.conditions.${weather.condition}`) || weather.condition}
      </div>
      
      {/* Camping-specific alerts */}
      {campingAlerts.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {campingAlerts.slice(0, 2).map((alert, index) => (
            <div 
              key={index}
              className="flex items-center space-x-1 text-xs px-1 py-0.5 rounded"
              style={{
                background: 'rgba(255, 255, 255, 0.5)',
                color: alert.color
              }}
            >
              <span>{alert.icon}</span>
              <span className="font-medium">{alert.text}</span>
            </div>
          ))}
        </div>
      )}
      
      {/* Additional weather info */}
      {weather.humidity && (
        <div 
          className="text-xs mt-2 opacity-75"
          style={{
            color: '#6b7280',
            textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'
          }}
        >
          Humidity: {weather.humidity}%
        </div>
      )}
    </div>
  );
};