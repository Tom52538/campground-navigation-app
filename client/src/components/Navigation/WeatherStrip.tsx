import { useWeather } from '@/hooks/useWeather';
import { Coordinates } from '@/types/navigation';
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Droplets, AlertTriangle } from 'lucide-react';

interface WeatherStripProps {
  coordinates: Coordinates;
}

const getWeatherIcon = (condition: string) => {
  const conditionLower = condition.toLowerCase();
  if (conditionLower.includes('rain')) return CloudRain;
  if (conditionLower.includes('snow')) return CloudSnow;
  if (conditionLower.includes('cloud')) return Cloud;
  if (conditionLower.includes('clear') || conditionLower.includes('sun')) return Sun;
  return Cloud;
};

const getCampingAlert = (weather: any) => {
  const alerts = [];
  
  if (weather.temperature < 5) {
    alerts.push({ type: 'cold', message: 'Cold weather - check gear', icon: '🥶' });
  }
  
  if (weather.condition?.toLowerCase().includes('rain')) {
    alerts.push({ type: 'rain', message: 'Rain expected - secure equipment', icon: '🌧️' });
  }
  
  if (weather.windSpeed && weather.windSpeed > 20) {
    alerts.push({ type: 'wind', message: 'High winds - secure tents', icon: '💨' });
  }
  
  if (weather.temperature > 30) {
    alerts.push({ type: 'heat', message: 'Hot weather - stay hydrated', icon: '🌡️' });
  }
  
  return alerts;
};

export const WeatherStrip = ({ coordinates }: WeatherStripProps) => {
  const { data: weather, isLoading } = useWeather(coordinates.lat, coordinates.lng);

  if (isLoading || !weather) {
    return (
      <div className="absolute bottom-20 left-4 right-4 z-30">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/30 p-3">
          <div className="flex items-center justify-center">
            <div className="animate-pulse text-gray-500">Loading weather...</div>
          </div>
        </div>
      </div>
    );
  }

  const WeatherIcon = getWeatherIcon(weather.condition);
  const alerts = getCampingAlert(weather);

  return (
    <div className="absolute bottom-24 left-4 right-4 z-30">
      <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-white/30 px-3 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <WeatherIcon className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-gray-800">
              {Math.round(weather.temperature)}°C
            </span>
            <span className="text-xs text-gray-600 capitalize">
              {weather.condition}
            </span>
          </div>
          
          <div className="flex items-center space-x-3 text-xs text-gray-600">
            {weather.humidity && (
              <div className="flex items-center space-x-1">
                <Droplets className="w-3 h-3" />
                <span>{weather.humidity}%</span>
              </div>
            )}
            {weather.windSpeed && (
              <div className="flex items-center space-x-1">
                <Wind className="w-3 h-3" />
                <span>{Math.round(weather.windSpeed)}km/h</span>
              </div>
            )}
            {alerts.length > 0 && (
              <div className="flex items-center space-x-1 text-amber-600">
                <AlertTriangle className="w-3 h-3" />
                <span>{alerts.length}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};