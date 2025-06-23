import { useQuery } from '@tanstack/react-query';
import { WeatherData } from '@/types/navigation';

export const useWeather = (lat: number, lng: number) => {
  return useQuery({
    queryKey: ['/api/weather', lat, lng],
    queryFn: async () => {
      const response = await fetch(`/api/weather?lat=${lat}&lng=${lng}`);
      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }
      const data = await response.json();
      return data as WeatherData;
    },
    staleTime: 300000, // 5 minutes
    refetchInterval: 300000, // Refresh every 5 minutes
    enabled: !!(lat && lng),
  });
};

export const useWeatherForecast = (lat: number, lng: number) => {
  return useQuery({
    queryKey: ['/api/weather/forecast', lat, lng],
    queryFn: async () => {
      const response = await fetch(`/api/weather/forecast?lat=${lat}&lng=${lng}`);
      if (!response.ok) {
        throw new Error('Failed to fetch weather forecast');
      }
      return response.json();
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    enabled: !!(lat && lng),
  });
};
