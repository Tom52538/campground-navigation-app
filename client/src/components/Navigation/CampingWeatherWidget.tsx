import { useState } from 'react';
import { ChevronDown, ChevronUp, Wind, Droplets, Thermometer, Eye } from 'lucide-react';
import { useWeather, useWeatherForecast } from '@/hooks/useWeather';
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
    alerts.push({ icon: '💨', text: 'Windig', color: '#f59e0b' });
  }
  
  if (weather?.temperature < 5) {
    alerts.push({ icon: '🥶', text: 'Kalt', color: '#3b82f6' });
  }
  
  if (weather?.condition?.toLowerCase().includes('rain')) {
    alerts.push({ icon: '🌧️', text: 'Regen', color: '#3b82f6' });
  }
  
  if (weather?.condition?.toLowerCase().includes('storm')) {
    alerts.push({ icon: '⛈️', text: 'Sturm', color: '#dc2626' });
  }
  
  if (weather?.humidity > 80) {
    alerts.push({ icon: '💧', text: 'Feucht', color: '#06b6d4' });
  }
  
  return alerts;
};

export const CampingWeatherWidget = ({ coordinates }: CampingWeatherWidgetProps) => {
  const { data: weather, isLoading } = useWeather(coordinates.lat, coordinates.lng);
  const { data: forecastData } = useWeatherForecast(coordinates.lat, coordinates.lng);
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const translateWeatherCondition = (condition?: string) => {
    if (!condition) return '';
    
    // Direct German translations
    const translations: { [key: string]: string } = {
      'clear': 'Klar',
      'sunny': 'Sonnig',
      'clouds': 'Wolken',
      'cloudy': 'Bewölkt',
      'partly cloudy': 'Teilweise bewölkt',
      'rain': 'Regen',
      'drizzle': 'Nieselregen',
      'thunderstorm': 'Gewitter',
      'snow': 'Schnee',
      'fog': 'Nebel',
      'mist': 'Dunst'
    };
    
    return translations[condition.toLowerCase()] || condition;
  };

  const getWeatherGradient = (condition?: string) => {
    switch (condition?.toLowerCase()) {
      case 'clear':
      case 'sunny':
        return 'linear-gradient(135deg, rgba(255, 193, 7, 0.7) 0%, rgba(255, 152, 0, 0.8) 100%)';
      case 'rain':
      case 'drizzle':
        return 'linear-gradient(135deg, rgba(33, 150, 243, 0.7) 0%, rgba(30, 136, 229, 0.8) 100%)';
      case 'clouds':
      case 'cloudy':
        return 'linear-gradient(135deg, rgba(96, 125, 139, 0.7) 0%, rgba(69, 90, 100, 0.8) 100%)';
      case 'snow':
        return 'linear-gradient(135deg, rgba(176, 190, 197, 0.7) 0%, rgba(144, 164, 174, 0.8) 100%)';
      default:
        return 'linear-gradient(135deg, rgba(59, 130, 246, 0.4) 0%, rgba(37, 99, 235, 0.6) 100%)';
    }
  };
  
  if (isLoading) {
    return (
      <div 
        className="absolute bottom-4 right-4 z-30 rounded-2xl p-4 shadow-lg backdrop-blur-md border border-white/20"
        style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.4) 0%, rgba(37, 99, 235, 0.6) 100%)',
          minWidth: '120px'
        }}
      >
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-white/20 rounded-full animate-pulse"></div>
          <div className="flex flex-col space-y-1">
            <div className="w-12 h-3 bg-white/20 rounded animate-pulse"></div>
            <div className="w-16 h-2 bg-white/20 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!weather) return null;
  
  const campingAlerts = getCampingAlerts(weather);
  
  return (
    <div 
      className={`absolute bottom-4 right-4 z-30 rounded-xl shadow-lg backdrop-blur-md border border-white/20 cursor-pointer transition-all duration-300 hover:scale-105 ${
        isExpanded ? 'p-2' : 'p-3'
      }`}
      style={{
        background: getWeatherGradient(weather?.condition),
        minWidth: isExpanded ? '160px' : '140px',
        maxWidth: isExpanded ? '180px' : '160px',
        maxHeight: isExpanded ? '140px' : 'auto'
      }}
      onClick={handleToggleExpanded}
    >
      {/* Main Weather Display - Compact */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getWeatherIcon(weather.condition)}</span>
          
          <div className="flex flex-col">
            <div className="text-lg font-bold text-white drop-shadow-lg">
              {weather?.temperature}°C
            </div>
            <div className="text-xs text-white/90 drop-shadow">
              {translateWeatherCondition(weather?.condition)}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <div className="text-xs text-white/80">
            {weather?.humidity}%
          </div>
          {isExpanded ? (
            <ChevronUp className="w-3 h-3 text-white/80" />
          ) : (
            <ChevronDown className="w-3 h-3 text-white/80" />
          )}
        </div>
      </div>

      {/* Compact 3-Day Forecast */}
      {isExpanded && forecastData?.forecast && (
        <div className="mt-1.5 space-y-0.5 max-h-20 overflow-hidden">
          <div className="text-xs font-medium text-white/90 mb-1 text-center border-b border-white/20 pb-0.5">
            3-Tage
          </div>
          
          {forecastData.forecast.slice(0, 3).map((day: any, index: number) => (
            <div 
              key={day.date}
              className="flex items-center justify-between px-1.5 py-0.5 text-xs bg-white/10 rounded"
            >
              <div className="flex items-center space-x-1.5 flex-1 min-w-0">
                <div className="w-8 text-xs font-medium text-white/90 truncate">
                  {day.day.slice(0, 3)}
                </div>
                <span className="text-xs flex-shrink-0">{getWeatherIcon(day.condition)}</span>
              </div>
              
              <div className="flex items-center space-x-1.5 flex-shrink-0 text-xs">
                <span className="text-white/70">{day.precipitation}%</span>
                <span className="text-white font-medium">
                  {day.temp_low}°/{day.temp_high}°
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};