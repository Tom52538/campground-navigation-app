import { useMutation, useQuery } from '@tanstack/react-query';
import { NavigationRoute, Coordinates } from '@/types/navigation';

export const useRouting = () => {
  const getRoute = useMutation({
    mutationFn: async ({ from, to, profile = 'walking' }: { 
      from: Coordinates; 
      to: Coordinates; 
      profile?: 'walking' | 'cycling' | 'driving';
    }) => {
      const response = await fetch('/api/route', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ from, to, profile }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to calculate route');
      }
      
      const data = await response.json();
      
      // Calculate accurate ETA using device time
      if (data.durationSeconds) {
        const now = new Date();
        const arrival = new Date(now.getTime() + data.durationSeconds * 1000);
        data.arrivalTime = arrival.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
      }
      
      return data as NavigationRoute;
    },
  });

  return {
    getRoute,
    isLoading: getRoute.isPending,
    error: getRoute.error,
    route: getRoute.data,
  };
};
