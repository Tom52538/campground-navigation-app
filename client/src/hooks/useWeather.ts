import { useQuery } from '@tanstack/react-query';
import { WeatherData } from '@/types/navigation';

export const useWeather = (lat: number, lng: number) => {
  return useQuery({
    queryKey: ['/api/weather', Math.round(lat * 1000), Math.round(lng * 1000)], // Round coordinates to prevent excessive queries
    queryFn: async () => {
      const response = await fetch(`/api/weather?lat=${lat}&lng=${lng}`);
      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }
      const data = await response.json();
      return data as WeatherData;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - weather doesn't change that fast
    refetchInterval: false, // Disable automatic refetching
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
    enabled: !!(lat && lng),
  });
};

export const useWeatherForecast = (lat: number, lng: number) => {
  return useQuery({
    queryKey: ['/api/weather/forecast', Math.round(lat * 1000), Math.round(lng * 1000)],
    queryFn: async () => {
      const response = await fetch(`/api/weather/forecast?lat=${lat}&lng=${lng}`);
      if (!response.ok) {
        throw new Error('Failed to fetch weather forecast');
      }
      return response.json();
    },
    staleTime: 60 * 60 * 1000, // 1 hour - forecast changes even less frequently
    refetchInterval: false,
    refetchOnWindowFocus: false,
    enabled: !!(lat && lng),
  });
};
