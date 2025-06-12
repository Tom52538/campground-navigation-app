import { useWeather } from '@/hooks/useWeather';
import { Coordinates } from '@/types/navigation';
import { Cloud, Sun, CloudRain, Loader2 } from 'lucide-react';

interface WeatherWidgetProps {
  coordinates: Coordinates;
}

const getWeatherIcon = (condition: string) => {
  const conditionLower = condition.toLowerCase();
  
  if (conditionLower.includes('sun') || conditionLower.includes('clear')) {
    return <Sun className="text-yellow-500 w-6 h-6" />;
  } else if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
    return <CloudRain className="text-blue-500 w-6 h-6" />;
  } else {
    return <Cloud className="text-gray-500 w-6 h-6" />;
  }
};

export const WeatherWidget = ({ coordinates }: WeatherWidgetProps) => {
  const { data: weather, isLoading, error } = useWeather(coordinates.lat, coordinates.lng);

  if (isLoading) {
    return (
      <div className="weather-widget">
        <div className="text-center">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto mb-1" />
          <div className="text-sm text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="weather-widget">
        <div className="text-center">
          <Cloud className="w-6 h-6 text-gray-400 mx-auto mb-1" />
          <div className="text-sm text-gray-500">Weather unavailable</div>
        </div>
      </div>
    );
  }

  return (
    <div className="weather-widget">
      <div className="text-center">
        <div className="mb-1">
          {getWeatherIcon(weather.condition)}
        </div>
        <div className="text-lg font-bold text-gray-800">{weather.temperature}°C</div>
        <div className="text-xs text-gray-500">{weather.condition}</div>
      </div>
    </div>
  );
};
