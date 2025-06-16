export interface RouteRequest {
  coordinates: [number, number][];
  profile?: 'driving-car' | 'foot-walking' | 'cycling-regular';
  format?: 'json' | 'geojson';
  instructions?: boolean;
  geometry?: boolean;
  language?: string;
  units?: 'm' | 'km' | 'mi';
}

export interface RouteResponse {
  routes: Array<{
    summary: {
      distance: number;
      duration: number;
    };
    geometry: number[][];
    segments: Array<{
      steps: Array<{
        instruction: string;
        distance: number;
        duration: number;
        type: number;
      }>;
    }>;
  }>;
}

export interface DirectionsRequest {
  start: [number, number];
  end: [number, number];
}

export class RoutingService {
  private apiKey: string;
  private baseUrl = 'https://api.openrouteservice.org/v2';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private detectUserLanguage(): string {
    // Check if we're in browser environment
    if (typeof navigator === 'undefined') {
      // Server-side fallback - default to German for German users
      return 'de';
    }
    
    // Detect browser language and map to OpenRouteService supported languages
    const browserLang = navigator.language.toLowerCase();
    
    // OpenRouteService supported languages
    const supportedLanguages: Record<string, string> = {
      'de': 'de',      // German
      'en': 'en',      // English
      'fr': 'fr',      // French
      'es': 'es',      // Spanish
      'it': 'it',      // Italian
      'nl': 'nl',      // Dutch
      'pt': 'pt',      // Portuguese
      'ru': 'ru',      // Russian
      'zh': 'zh',      // Chinese
    };

    // Extract language code (e.g., 'de' from 'de-DE')
    const langCode = browserLang.split('-')[0];
    
    console.log(`🗺️ OpenRouteService: Detected browser language: ${browserLang}, using: ${supportedLanguages[langCode] || 'en'}`);
    
    return supportedLanguages[langCode] || 'en'; // Default to English
  }

  async getRoute(request: RouteRequest): Promise<RouteResponse> {
    const url = `${this.baseUrl}/directions/${request.profile || 'foot-walking'}`;
    
    // Detect user language and use it for OpenRouteService instructions
    const userLanguage = this.detectUserLanguage();
    
    const body = {
      coordinates: request.coordinates,
      format: request.format || 'json',
      instructions: request.instructions !== false,
      geometry: request.geometry !== false,
      language: request.language || userLanguage, // Use detected or specified language
      units: request.units || 'm', // Use metric units by default
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Routing API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getDirections(request: DirectionsRequest): Promise<RouteResponse> {
    return this.getRoute({
      coordinates: [request.start, request.end],
      profile: 'foot-walking',
      instructions: true,
      geometry: true,
    });
  }

  formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  }

  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }

  formatArrivalTime(durationSeconds: number): string {
    const now = new Date();
    const arrival = new Date(now.getTime() + durationSeconds * 1000);
    // Use 24-hour format to match system time display
    return arrival.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }
}
