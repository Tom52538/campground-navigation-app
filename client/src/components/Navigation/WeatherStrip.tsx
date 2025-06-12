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
    <div className="absolute bottom-40 left-4 right-4 z-30">
      <div className="bg-gradient-to-r from-blue-50/90 to-green-50/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/30 p-3">
        {/* Main Weather Info */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <div className="bg-white/60 rounded-full p-2">
              <WeatherIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-800">
                {Math.round(weather.temperature)}°C
              </div>
              <div className="text-sm text-gray-600 capitalize">
                {weather.condition}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            {weather.humidity && (
              <div className="flex items-center space-x-1">
                <Droplets className="w-4 h-4" />
                <span>{weather.humidity}%</span>
              </div>
            )}
            {weather.windSpeed && (
              <div className="flex items-center space-x-1">
                <Wind className="w-4 h-4" />
                <span>{Math.round(weather.windSpeed)} km/h</span>
              </div>
            )}
          </div>
        </div>

        {/* Camping Alerts */}
        {alerts.length > 0 && (
          <div className="border-t border-white/30 pt-2">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-xs font-medium text-amber-800 mb-1">Camping Alerts</div>
                <div className="space-y-1">
                  {alerts.map((alert, index) => (
                    <div key={index} className="flex items-center space-x-2 text-xs text-gray-700">
                      <span>{alert.icon}</span>
                      <span>{alert.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};