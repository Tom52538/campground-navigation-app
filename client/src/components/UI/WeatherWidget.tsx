import React, { useState } from 'react';
import { Cloud, Sun, CloudRain, Thermometer, Droplets, Wind, Eye, Gauge } from 'lucide-react';
import { useWeatherForecast } from '@/hooks/useWeather';
import { cn } from '@/lib/utils';

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  pressure: number;
  visibility: number;
}

interface WeatherWidgetProps {
  weather?: WeatherData;
  lat: number;
  lng: number;
}

const getWeatherIcon = (condition: string) => {
  const conditionLower = condition.toLowerCase();
  if (conditionLower.includes('rain') || conditionLower.includes('regen')) {
    return <CloudRain className="w-5 h-5" />;
  } else if (conditionLower.includes('cloud') || conditionLower.includes('wolken')) {
    return <Cloud className="w-5 h-5" />;
  } else {
    return <Sun className="w-5 h-5" />;
  }
};

const translateCondition = (condition: string): string => {
  const translations: Record<string, string> = {
    'Clear': 'Klar',
    'Clouds': 'Wolken',
    'Rain': 'Regen',
    'Snow': 'Schnee',
    'Thunderstorm': 'Gewitter',
    'Drizzle': 'Nieselregen',
    'Mist': 'Nebel',
    'Fog': 'Nebel'
  };
  return translations[condition] || condition;
};

const formatDay = (dateString: string): string => {
  const date = new Date(dateString);
  const days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
  return days[date.getDay()];
};

export function WeatherWidget({ weather, lat, lng }: WeatherWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: forecast } = useWeatherForecast(lat, lng);

  if (!weather) {
    return (
      <div className="bg-white/90 backdrop-blur-md border border-white/20 rounded-xl shadow-lg p-3">
        <div className="animate-pulse flex items-center gap-2">
          <div className="w-5 h-5 bg-gray-300 rounded"></div>
          <div className="w-16 h-4 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  const translatedCondition = translateCondition(weather.condition);

  return (
    <div className="relative">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-white/90 backdrop-blur-md border border-white/20 rounded-xl shadow-lg p-3 hover:bg-white/95 transition-all duration-200"
      >
        <div className="flex items-center gap-2">
          {getWeatherIcon(weather.condition)}
          <span className="text-sm font-medium">{weather.temperature}°C</span>
          <span className="text-xs text-gray-600">{translatedCondition}</span>
        </div>
      </button>

      {isExpanded && (
        <div className="absolute top-full right-0 mt-2 bg-white/95 backdrop-blur-md border border-white/20 rounded-xl shadow-xl p-4 min-w-[280px] z-50">
          {/* Current Weather Details */}
          <div className="mb-4">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              {getWeatherIcon(weather.condition)}
              Aktuelles Wetter
            </h3>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-red-500" />
                <span>{weather.temperature}°C</span>
              </div>
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-blue-500" />
                <span>{weather.humidity}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Wind className="w-4 h-4 text-gray-500" />
                <span>{weather.windSpeed} km/h</span>
              </div>
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-purple-500" />
                <span>{weather.pressure} hPa</span>
              </div>
              <div className="flex items-center gap-2 col-span-2">
                <Eye className="w-4 h-4 text-green-500" />
                <span>Sicht: {(weather.visibility / 1000).toFixed(1)} km</span>
              </div>
            </div>
          </div>

          {/* 7-Day Forecast */}
          {forecast && (
            <div>
              <h4 className="font-medium text-base mb-2">7-Tage Vorhersage</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {forecast.forecast.slice(0, 7).map((day, index) => (
                  <div key={day.date} className="flex items-center justify-between py-1 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium w-6">{formatDay(day.date)}</span>
                      {getWeatherIcon(day.condition)}
                      <span className="text-xs">{translateCondition(day.condition)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-medium">{day.high}°</span>
                      <span className="text-gray-500">{day.low}°</span>
                      {day.precipitation > 0 && (
                        <span className="text-blue-500">{day.precipitation}%</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}