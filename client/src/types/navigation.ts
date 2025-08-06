
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

// Accommodation-specific categories based on Roompot legend
export type POICategory = 'bungalows' | 'beach_houses' | 'chalets' | 'lodges' | 'camper_sites' | 'services' | 'facilities';

export const POI_CATEGORIES = {
  bungalows: { label: 'Bungalows', icon: 'Building', color: 'bg-green-500' },
  beach_houses: { label: 'Beach Houses', icon: 'Building2', color: 'bg-blue-500' },
  chalets: { label: 'Chalets', icon: 'Building', color: 'bg-orange-500' },
  lodges: { label: 'Lodges', icon: 'Building2', color: 'bg-purple-500' },
  camper_sites: { label: 'Camper Sites', icon: 'Car', color: 'bg-gray-500' },
  services: { label: 'Services', icon: 'Utensils', color: 'bg-yellow-500' },
  facilities: { label: 'Facilities', icon: 'Utensils', color: 'bg-red-500' }
} as const;

export const POI_CATEGORIES: Record<POICategory, { icon: string; color: string; label: string }> = {
  'bungalow': { icon: 'Building', color: 'bg-green-500', label: 'Bungalows' }, // B1, B5, BA Comfort series
  'beach_house': { icon: 'Building2', color: 'bg-blue-500', label: 'Beach Houses' }, // Beach House 4, 6A, 6B
  'chalet': { icon: 'Building', color: 'bg-purple-500', label: 'Chalets' }, // RP64A, RP4A series
  'lodge': { icon: 'Building', color: 'bg-yellow-500', label: 'Lodges' }, // Water Village Lodges
  'static_caravan': { icon: 'Car', color: 'bg-orange-500', label: 'Camper Sites' }, // Static caravans
  'services': { icon: 'Building2', color: 'bg-cyan-500', label: 'Services' }, // Shops, info
  'facilities': { icon: 'Utensils', color: 'bg-red-500', label: 'Facilities' } // Toilets, showers
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
