import { useWeather } from '@/hooks/useWeather';
import { Coordinates } from '@/types/navigation';
import { Cloud, Sun, CloudRain, Loader2 } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface WeatherWidgetProps {
  coordinates: Coordinates;
}

const getWeatherIcon = (condition: string) => {
  const conditionLower = condition.toLowerCase();

  if (conditionLower.includes('sun') || conditionLower.includes('clear')) {
    return <Sun className="text-yellow-500 w-4 h-4" />;
  } else if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
    return <CloudRain className="text-blue-500 w-4 h-4" />;
  } else {
    return <Cloud className="text-gray-500 w-4 h-4" />;
  }
};

export const WeatherWidget = ({ coordinates }: WeatherWidgetProps) => {
  const { data: weather, isLoading, error } = useWeather(coordinates.lat, coordinates.lng);
  const previousCoordinates = useRef<Coordinates>(coordinates);
  
  // Track coordinate changes and their impact on weather data
  useEffect(() => {
    const coordsChanged = 
      Math.abs(coordinates.lat - previousCoordinates.current.lat) > 0.001 ||
      Math.abs(coordinates.lng - previousCoordinates.current.lng) > 0.001;
      
    if (coordsChanged) {
      console.group('📍 WEATHER WIDGET: Coordinate Change Detected');
      console.log('🔄 Coordinate Update:', {
        previous: previousCoordinates.current,
        current: coordinates,
        change: {
          latDelta: coordinates.lat - previousCoordinates.current.lat,
          lngDelta: coordinates.lng - previousCoordinates.current.lng,
          distance: Math.sqrt(
            Math.pow(coordinates.lat - previousCoordinates.current.lat, 2) + 
            Math.pow(coordinates.lng - previousCoordinates.current.lng, 2)
          ) * 111000 // Rough meters
        },
        timestamp: new Date().toISOString()
      });
      
      console.log('🌤️ Weather Query Impact:', {
        previousQueryKey: ['/api/weather', Math.round(previousCoordinates.current.lat * 1000), Math.round(previousCoordinates.current.lng * 1000)],
        newQueryKey: ['/api/weather', Math.round(coordinates.lat * 1000), Math.round(coordinates.lng * 1000)],
        willInvalidateCache: true,
        expectedNewRequest: true
      });
      
      console.groupEnd();
      previousCoordinates.current = coordinates;
    }
  }, [coordinates.lat, coordinates.lng]);
  
  // Detailed GPS and Weather logging
  console.group('🌦️ WEATHER WIDGET DEBUG');
  console.log('📍 GPS Coordinates:', {
    latitude: coordinates.lat,
    longitude: coordinates.lng,
    rounded: {
      lat: Math.round(coordinates.lat * 1000) / 1000,
      lng: Math.round(coordinates.lng * 1000) / 1000
    },
    timestamp: new Date().toLocaleTimeString()
  });
  
  console.log('🔄 Weather Hook State:', {
    isLoading,
    hasData: !!weather,
    hasError: !!error,
    errorMessage: error?.message,
    queryKey: ['/api/weather', Math.round(coordinates.lat * 1000), Math.round(coordinates.lng * 1000)],
    timestamp: new Date().toLocaleTimeString()
  });
  
  if (weather) {
    console.log('🌡️ Weather Data:', {
      temperature: weather.temperature,
      condition: weather.condition,
      humidity: weather.humidity,
      windSpeed: weather.windSpeed,
      dataAge: weather.timestamp ? new Date().getTime() - new Date(weather.timestamp).getTime() : 'unknown',
      timestamp: new Date().toLocaleTimeString()
    });
  }
  
  console.groupEnd();

  if (isLoading) {
    return (
      <div 
        className="absolute top-20 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg shadow-md border border-gray-200 p-1.5 min-w-[80px]"
      >
        <div className="text-center">
          <Loader2 className="w-4 h-4 animate-spin text-gray-400 mx-auto mb-1" />
          <div className="text-xs text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div 
        className="absolute top-20 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg shadow-md border border-gray-200 p-1.5 min-w-[80px]"
      >
        <div className="text-center">
          <Cloud className="w-4 h-4 text-gray-400 mx-auto mb-1" />
          <div className="text-xs text-gray-500">Unavailable</div>
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
    <div 
      className="absolute top-20 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg shadow-md border border-gray-200 p-1.5 min-w-[80px] max-w-[100px]"
    >
      <div className="flex items-center space-x-1 mb-1">
        <div className="w-4 h-4">{getWeatherIcon(weather.condition)}</div>
        <div className="text-sm font-semibold text-gray-800">{weather.temperature}°</div>
      </div>
      <div className="text-xs text-gray-500 mb-1 truncate">{weather.condition}</div>
      <div className="space-y-0.5">
        {[1].map((dayOffset) => (
          <div key={dayOffset} className="flex items-center justify-between">
            <div className="text-xs text-gray-600 truncate">
              {getDayName(dayOffset)}
            </div>
            <div className="text-xs text-gray-600">
              {getForecastTemp(dayOffset)}°
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};