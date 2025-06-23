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
  const { data: forecastData } = useWeatherForecast(coordinates.lat, coordinates.lng);
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const translateWeatherCondition = (condition?: string) => {
    if (!condition) return '';
    return t(`weather.conditions.${condition.toLowerCase()}`) || condition;
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
      className={`absolute bottom-4 right-4 z-30 rounded-2xl shadow-lg backdrop-blur-md border border-white/20 cursor-pointer transition-all duration-300 hover:scale-105 ${
        isExpanded ? 'p-3' : 'p-4'
      }`}
      style={{
        background: getWeatherGradient(weather?.condition),
        minWidth: isExpanded ? '280px' : '160px',
        maxWidth: isExpanded ? '320px' : '200px',
        maxHeight: isExpanded ? '400px' : 'auto'
      }}
      onClick={handleToggleExpanded}
    >
      {/* Main Weather Display */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{getWeatherIcon(weather.condition)}</span>
          
          <div className="flex flex-col">
            <div className="text-2xl font-bold text-white drop-shadow-lg">
              {weather?.temperature}°C
            </div>
            <div className="text-sm text-white/90 drop-shadow capitalize">
              {translateWeatherCondition(weather?.condition)}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="text-xs text-white/80 drop-shadow">
            {weather?.humidity}%
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-white/80" />
          ) : (
            <ChevronDown className="w-4 h-4 text-white/80" />
          )}
        </div>
      </div>

      {/* Expanded Forecast View */}
      {isExpanded && forecastData?.forecast && (
        <div className="mt-4 space-y-2 max-h-72 overflow-y-auto">
          <div className="text-sm font-semibold text-white/90 mb-3 border-b border-white/20 pb-2">
            7-Tage Vorhersage
          </div>
          
          {forecastData.forecast.slice(0, 7).map((day: any, index: number) => (
            <div 
              key={day.date}
              className={`flex items-center justify-between p-2 rounded-lg ${
                index === 0 ? 'bg-white/20' : 'bg-white/10'
              } backdrop-blur-sm`}
            >
              <div className="flex items-center space-x-3 flex-1">
                <div className="w-12 text-xs font-medium text-white/90">
                  {day.day}
                </div>
                <span className="text-sm">{getWeatherIcon(day.condition)}</span>
                <div className="text-xs text-white/80 flex-1 truncate">
                  {translateWeatherCondition(day.condition)}
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <Droplets className="w-3 h-3 text-blue-200" />
                  <span className="text-xs text-white/80">{day.precipitation}%</span>
                </div>
                <div className="text-sm font-medium text-white">
                  <span className="text-white/90">{day.temp_low}°</span>
                  <span className="mx-1 text-white/60">/</span>
                  <span>{day.temp_high}°</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detailed Weather Info - Only show when not expanded */}
      {!isExpanded && weather && (
        <div className="mt-3 pt-3 border-t border-white/20">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center space-x-1">
              <Wind className="w-3 h-3 text-white/80" />
              <span className="text-white/90">{weather.windSpeed} km/h</span>
            </div>
            <div className="flex items-center space-x-1">
              <Droplets className="w-3 h-3 text-white/80" />
              <span className="text-white/90">{weather.humidity}%</span>
            </div>
            <div className="flex items-center space-x-1">
              <Thermometer className="w-3 h-3 text-white/80" />
              <span className="text-white/90">{weather.pressure} hPa</span>
            </div>
            <div className="flex items-center space-x-1">
              <Eye className="w-3 h-3 text-white/80" />
              <span className="text-white/90">{weather.visibility} km</span>
            </div>
          </div>
          
          {/* Camping-specific alerts */}
          {campingAlerts.length > 0 && (
            <div className="mt-2 pt-2 border-t border-white/20">
              {campingAlerts.slice(0, 2).map((alert, index) => (
                <div key={index} className="flex items-start space-x-1 mb-1">
                  <span className="text-yellow-300">{alert.icon}</span>
                  <span className="text-xs text-white/90 leading-tight">{alert.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};