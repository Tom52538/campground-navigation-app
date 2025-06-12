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
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-3 min-w-[140px]">
        <div className="text-center">
          <Loader2 className="w-5 h-5 animate-spin text-gray-400 mx-auto mb-1" />
          <div className="text-xs text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-3 min-w-[140px]">
        <div className="text-center">
          <Cloud className="w-5 h-5 text-gray-400 mx-auto mb-1" />
          <div className="text-xs text-gray-500">Weather unavailable</div>
        </div>
      </div>
    );
  }

  // Generate 3-day forecast (current + 2 future days)
  const getDayName = (offset: number) => {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return offset === 0 ? 'Today' : date.toLocaleDateString('en', { weekday: 'short' });
  };

  const getForecastTemp = (offset: number) => {
    // Simulate slight temperature variations for forecast
    const baseTemp = weather.temperature;
    const variation = offset === 0 ? 0 : (offset === 1 ? -2 : -4);
    return baseTemp + variation;
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-3 min-w-[140px]">
      <div className="space-y-2">
        {[0, 1, 2].map((dayOffset) => (
          <div key={dayOffset} className={`flex items-center justify-between ${dayOffset === 0 ? 'border-b border-gray-200 pb-2' : ''}`}>
            <div className="text-xs text-gray-600 min-w-[40px]">
              {getDayName(dayOffset)}
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4">
                {dayOffset === 0 ? getWeatherIcon(weather.condition) : <Sun className="text-yellow-500 w-4 h-4" />}
              </div>
              <div className={`text-sm ${dayOffset === 0 ? 'font-bold text-gray-800' : 'text-gray-600'}`}>
                {getForecastTemp(dayOffset)}°
              </div>
            </div>
          </div>
        ))}
        <div className="text-xs text-gray-500 text-center mt-2">
          {weather.condition}
        </div>
      </div>
    </div>
  );
};
