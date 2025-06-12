import { useWeather } from '@/hooks/useWeather';
import { Coordinates } from '@/types/navigation';
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Droplets, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

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

const getCampingAlert = (weather: any, t: (key: string) => string) => {
  const alerts = [];
  
  if (weather.temperature < 5) {
    alerts.push({ type: 'cold', message: t('weather.alerts.cold'), icon: '🥶' });
  }
  
  if (weather.condition?.toLowerCase().includes('rain')) {
    alerts.push({ type: 'rain', message: t('weather.alerts.rain'), icon: '🌧️' });
  }
  
  if (weather.windSpeed && weather.windSpeed > 20) {
    alerts.push({ type: 'wind', message: t('weather.alerts.wind'), icon: '💨' });
  }
  
  if (weather.temperature > 30) {
    alerts.push({ type: 'heat', message: t('weather.alerts.heat'), icon: '🌡️' });
  }
  
  return alerts;
};

export const WeatherStrip = ({ coordinates }: WeatherStripProps) => {
  const { data: weather, isLoading } = useWeather(coordinates.lat, coordinates.lng);
  const { t } = useLanguage();

  if (isLoading || !weather) {
    return (
      <div className="absolute bottom-20 left-4 right-4 z-30">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/30 p-3">
          <div className="flex items-center justify-center">
            <div className="animate-pulse text-gray-500">{t('weather.loading')}</div>
          </div>
        </div>
      </div>
    );
  }

  const WeatherIcon = getWeatherIcon(weather.condition);
  const alerts = getCampingAlert(weather, t);

  return (
    <div className="absolute bottom-4 right-4 z-30">
      <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-white/30 px-3 py-2 min-w-[140px]">
        <div className="flex flex-col space-y-1">
          <div className="flex items-center space-x-2">
            <WeatherIcon className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-gray-800">
              {Math.round(weather.temperature)}°C
            </span>
          </div>
          <div className="text-xs text-gray-600 capitalize">
            {weather.condition}
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <select 
              className="bg-transparent text-gray-600 text-xs border-none"
              onChange={(e) => {
                localStorage.setItem('campground-language', e.target.value);
                window.location.reload();
              }}
              defaultValue={localStorage.getItem('campground-language') || 'en'}
            >
              <option value="en">EN</option>
              <option value="de">DE</option>
              <option value="fr">FR</option>
              <option value="nl">NL</option>
            </select>
          </div>
          
          <div className="flex items-center justify-between text-xs text-gray-600 pt-1">
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
          </div>
          
          {alerts.length > 0 && (
            <div className="flex items-center space-x-1 text-amber-600 pt-1 border-t border-gray-200">
              <AlertTriangle className="w-3 h-3" />
              <span className="text-xs">{alerts.length} alert{alerts.length > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};