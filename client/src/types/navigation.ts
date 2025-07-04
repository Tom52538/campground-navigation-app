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
  maneuverType?: string;
  coordinates?: [number, number];
}

export interface VoiceInstruction {
  text: string;
  distanceAlongGeometry: number;
  announcement?: number[];
}

export interface NavigationRoute {
  totalDistance: string;
  estimatedTime: string;
  arrivalTime: string;
  durationSeconds?: number; // Raw duration for client-side ETA calculation
  instructions: RouteInstruction[];
  geometry: number[][];
  nextInstruction?: RouteInstruction;
  voiceInstructions?: VoiceInstruction[];
}

export interface MapState {
  center: Coordinates;
  zoom: number;
  selectedPOI: POI | null;
  isNavigating: boolean;
  currentRoute: NavigationRoute | null;
  filteredCategories: string[];
}

export type POICategory = 'food-drink' | 'services' | 'recreation' | 'facilities';

export const POI_CATEGORIES: Record<POICategory, { icon: string; color: string; label: string }> = {
  'food-drink': { icon: 'Utensils', color: 'bg-orange-500', label: 'Food & Drink' },
  'services': { icon: 'Building2', color: 'bg-blue-500', label: 'Essential Services' },
  'recreation': { icon: 'Waves', color: 'bg-green-500', label: 'Recreation' },
  'facilities': { icon: 'Car', color: 'bg-purple-500', label: 'Practical Facilities' }
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
