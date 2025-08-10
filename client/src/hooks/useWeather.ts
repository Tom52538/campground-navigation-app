import { useQuery } from '@tanstack/react-query';
import { WeatherData } from '@/types/navigation';

export const useWeather = (lat: number, lng: number) => {
  return useQuery({
    queryKey: ['/api/weather', Math.round(lat * 1000), Math.round(lng * 1000)], // Round coordinates to prevent excessive queries
    queryFn: async () => {
      console.group('🌤️ WEATHER HOOK: API Request');
      console.log('📡 Request Details:', {
        coordinates: { lat, lng },
        roundedCoordinates: { lat: Math.round(lat * 1000), lng: Math.round(lng * 1000) },
        url: `/api/weather?lat=${lat}&lng=${lng}`,
        timestamp: new Date().toISOString(),
        queryKey: ['/api/weather', Math.round(lat * 1000), Math.round(lng * 1000)]
      });
      
      const startTime = performance.now();
      
      try {
        const response = await fetch(`/api/weather?lat=${lat}&lng=${lng}`);
        const endTime = performance.now();
        
        console.log('🌐 Network Response:', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          responseTime: `${(endTime - startTime).toFixed(2)}ms`,
          headers: Object.fromEntries(response.headers.entries()),
          timestamp: new Date().toISOString()
        });
        
        if (!response.ok) {
          console.error('❌ WEATHER HOOK: Fetch failed', {
            status: response.status,
            statusText: response.statusText,
            coordinates: { lat, lng },
            timestamp: new Date().toISOString()
          });
          throw new Error(`Failed to fetch weather data: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ WEATHER HOOK: Data received successfully', {
          data,
          dataSize: JSON.stringify(data).length,
          hasTemperature: 'temperature' in data,
          hasCondition: 'condition' in data,
          timestamp: new Date().toISOString()
        });
        
        console.groupEnd();
        return data as WeatherData;
      } catch (error) {
        console.error('💥 WEATHER HOOK: Request failed', {
          error: error instanceof Error ? error.message : 'Unknown error',
          coordinates: { lat, lng },
          timestamp: new Date().toISOString()
        });
        console.groupEnd();
        throw error;
      }
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
