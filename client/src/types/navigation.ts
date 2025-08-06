
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

// Updated to match actual GeoJSON categories from server data
export type POICategory = 'accommodations' | 'services' | 'buildings' | 'parking' | 'amenities' | 'facilities';

export const POI_CATEGORIES: Record<POICategory, { icon: string; color: string; label: string }> = {
  'accommodations': { icon: 'Building', color: 'bg-green-500', label: 'Accommodations' }, // 1649 POIs
  'services': { icon: 'Building2', color: 'bg-blue-500', label: 'Services' }, // 22 POIs
  'buildings': { icon: 'Building', color: 'bg-gray-600', label: 'Buildings' }, // 168 POIs
  'parking': { icon: 'Car', color: 'bg-purple-500', label: 'Parking' }, // 12 POIs
  'amenities': { icon: 'Waves', color: 'bg-cyan-500', label: 'Amenities' }, // 15 POIs
  'facilities': { icon: 'Utensils', color: 'bg-orange-500', label: 'Facilities' } // 39 POIs
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
