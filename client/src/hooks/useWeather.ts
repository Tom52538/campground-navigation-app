import { useQuery } from '@tanstack/react-query';
import { WeatherData } from '@/types/navigation';

export const useWeather = (lat: number, lng: number) => {
  return useQuery({
    queryKey: ['/api/weather', Math.round(lat * 1000), Math.round(lng * 1000)], // Round coordinates to prevent excessive queries
    queryFn: async () => {
      console.log('🌤️ WEATHER HOOK: Fetching weather data', { lat, lng });
      
      const response = await fetch(`/api/weather?lat=${lat}&lng=${lng}`);
      if (!response.ok) {
        console.error('🌤️ WEATHER HOOK: Fetch failed', response.status, response.statusText);
        throw new Error(`Failed to fetch weather data: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('🌤️ WEATHER HOOK: Data received', data);
      return data as WeatherData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - more frequent updates
    refetchInterval: 5 * 60 * 1000, // Auto-refetch every 5 minutes
    refetchOnWindowFocus: true, // Refetch when window gains focus
    enabled: !!(lat && lng),
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
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
    staleTime: 15 * 60 * 1000, // 15 minutes - more frequent updates
    refetchInterval: 15 * 60 * 1000, // Auto-refetch every 15 minutes
    refetchOnWindowFocus: true, // Refetch when window gains focus
    enabled: !!(lat && lng),
  });
};
