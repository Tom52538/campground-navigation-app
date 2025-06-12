export interface Coordinates {
  lat: number;
  lng: number;
}

export interface POI {
  id: string;
  name: string;
  category: string;
  coordinates: Coordinates;
  description?: string;
  amenities?: string[];
  hours?: string;
  distance?: string;
}

export interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
  humidity?: number;
  windSpeed?: number;
}

export interface RouteInstruction {
  instruction: string;
  distance: string;
  duration: string;
  direction?: string;
}

export interface NavigationRoute {
  totalDistance: string;
  estimatedTime: string;
  arrivalTime: string;
  instructions: RouteInstruction[];
  geometry: number[][];
  nextInstruction?: RouteInstruction;
}

export interface MapState {
  center: Coordinates;
  zoom: number;
  selectedPOI: POI | null;
  isNavigating: boolean;
  currentRoute: NavigationRoute | null;
  filteredCategories: string[];
}

export type POICategory = 'restaurants' | 'activities' | 'facilities' | 'services';

export const POI_CATEGORIES: Record<POICategory, { icon: string; color: string; label: string }> = {
  restaurants: { icon: 'fas fa-utensils', color: 'bg-secondary', label: 'Restaurants' },
  activities: { icon: 'fas fa-swimming-pool', color: 'bg-primary', label: 'Activities' },
  facilities: { icon: 'fas fa-restroom', color: 'bg-warning', label: 'Facilities' },
  services: { icon: 'fas fa-info-circle', color: 'bg-gray-500', label: 'Services' }
};

export const KAMPERLAND_COORDINATES: Coordinates = {
  lat: 51.58979501327052,
  lng: 3.721826089503387
};

export const ZUHAUSE_COORDINATES: Coordinates = {
  lat: 51.00165397612932,
  lng: 6.051040465199215
};

export type TestSite = 'kamperland' | 'zuhause';

export const TEST_SITES: Record<TestSite, { name: string; coordinates: Coordinates }> = {
  kamperland: { name: 'Kamperland', coordinates: KAMPERLAND_COORDINATES },
  zuhause: { name: 'Zuhause', coordinates: ZUHAUSE_COORDINATES }
};
