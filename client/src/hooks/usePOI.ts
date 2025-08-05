import { useQuery } from '@tanstack/react-query';
import { POI, TestSite } from '@/types/navigation';

export const usePOI = (site: TestSite = 'kamperland') => {
  return useQuery({
    queryKey: ['/api/pois', site],
    queryFn: async () => {
      console.log('🔍 usePOI: Fetching POIs for site:', site);
      const response = await fetch(`/api/pois?site=${site}`);
      console.log('🔍 usePOI: Response status:', response.status);
      
      if (!response.ok) {
        console.error('🔍 usePOI: Failed to fetch POI data', response.status, response.statusText);
        throw new Error('Failed to fetch POI data');
      }
      
      const data = await response.json();
      console.log('🔍 usePOI: Received data:', {
        isArray: Array.isArray(data),
        length: data?.length || 0,
        firstPOI: data?.[0] || 'none',
        sample: data?.slice(0, 3) || []
      });
      
      return data as POI[];
    },
    staleTime: Infinity, // POI data doesn't change frequently
  });
};

export const useSearchPOI = (query: string, site: TestSite = 'kamperland', category?: string) => {
  return useQuery({
    queryKey: ['/api/pois/search', query, site, category],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      params.append('site', site);
      if (category) params.append('category', category);

      const response = await fetch(`/api/pois/search?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to search POIs');
      }
      const data = await response.json();
      return data as POI[];
    },
    enabled: query.length >= 2, // Require at least 2 characters
    staleTime: 60000, // 1 minute
  });
};