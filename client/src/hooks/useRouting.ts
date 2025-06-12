import { useMutation, useQuery } from '@tanstack/react-query';
import { NavigationRoute, Coordinates } from '@/types/navigation';

export const useRouting = () => {
  const getRoute = useMutation({
    mutationFn: async ({ from, to }: { from: Coordinates; to: Coordinates }) => {
      const response = await fetch('/api/route', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ from, to }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to calculate route');
      }
      
      const data = await response.json();
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
