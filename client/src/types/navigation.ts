
export interface Coordinates {
  lat: number;
  lng: number;
}

export interface POI {
  id: string;
  name: string;
  category: string;
  subCategory?: string;
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

// Categories based on Roompot Beach Resort & Water Village legend
export type POICategory = 'services' | 'necessities' | 'food_drinks' | 'leisure' | 'bungalows' | 'beach_houses' | 'chalets' | 'camping' | 'lodges' | 'facilities';

export const POI_CATEGORIES: Record<POICategory, { icon: string; color: string; label: string }> = {
  'services': { icon: 'Building', color: 'bg-gray-600', label: 'Services' },
  'necessities': { icon: 'Plus', color: 'bg-green-600', label: 'Necessities' },
  'food_drinks': { icon: 'Utensils', color: 'bg-orange-600', label: 'Food & Drinks' },
  'leisure': { icon: 'PlayCircle', color: 'bg-purple-600', label: 'Leisure & Entertainment' },
  'bungalows': { icon: 'Building', color: 'bg-red-500', label: 'Bungalows' },
  'beach_houses': { icon: 'Building2', color: 'bg-blue-500', label: 'Beach Houses' },
  'chalets': { icon: 'Building', color: 'bg-orange-500', label: 'Chalets' },
  'camping': { icon: 'Car', color: 'bg-yellow-500', label: 'Camping' },
  'lodges': { icon: 'Building2', color: 'bg-indigo-600', label: 'Lodges' },
  'facilities': { icon: 'MapPin', color: 'bg-slate-600', label: 'Facilities' }
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
