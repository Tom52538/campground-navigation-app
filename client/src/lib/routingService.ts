import MapboxClient from '@mapbox/mapbox-sdk';
import MapboxDirections from '@mapbox/mapbox-sdk/services/directions';
import * as turf from '@turf/turf';
import { NavigationRoute, RouteInstruction, VoiceInstruction } from '@/types/navigation';

export interface RouteRequest {
  coordinates: [number, number][];
  profile?: 'walking' | 'cycling' | 'driving';
  language?: string;
  units?: string;
  instructions?: boolean;
  geometry?: boolean;
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

export class MapboxRoutingService {
  private directionsService: any;
  private accessToken: string;
  
  constructor(accessToken: string) {
    this.accessToken = accessToken;
    console.log('🗺️ Initializing Mapbox service:', {
      token_provided: !!accessToken,
      token_length: accessToken?.length || 0,
      token_prefix: accessToken?.substring(0, 3) || 'none',
      is_valid_format: accessToken?.startsWith('pk.') || false
    });
    
    // Initialize Mapbox service only when token is valid
    if (accessToken && accessToken.startsWith('pk.')) {
      try {
        const mapboxClient = MapboxClient({ accessToken });
        this.directionsService = MapboxDirections(mapboxClient);
        console.log('🗺️ Mapbox Directions service initialized successfully');
      } catch (error) {
        console.error('🗺️ Failed to initialize Mapbox Directions service:', error);
        this.directionsService = null;
      }
    } else {
      console.warn('🗺️ Invalid or missing Mapbox token, will use fallback routing');
      this.directionsService = null;
    }
  }

  async getRoute(request: RouteRequest): Promise<NavigationRoute> {
    if (!this.directionsService) {
      console.warn('🗺️ Mapbox service not available - invalid or missing token');
      throw new Error('Mapbox service not available - invalid token');
    }

    try {
      const profile = this.mapProfile(request.profile || 'walking');
      const coordinates = request.coordinates.map(coord => [coord[1], coord[0]]); // Mapbox expects [lng, lat]
      
      const mapboxRequest = {
        waypoints: coordinates.map(coord => ({
          coordinates: coord
        })),
        profile: profile,
        language: request.language || 'de',
        steps: true,
        geometries: 'geojson',
        overview: 'full',
        alternatives: false
      };

      console.log('🗺️ Mapbox routing request details:', {
        profile: mapboxRequest.profile,
        language: mapboxRequest.language,
        waypoints: mapboxRequest.waypoints,
        token_available: !!this.accessToken,
        token_format: this.accessToken ? this.accessToken.substring(0, 10) + '...' : 'none'
      });

      const response = await this.directionsService.getDirections(mapboxRequest).send();
      
      console.log('🗺️ Mapbox API response status:', response.status);
      
      if (!response.body.routes || response.body.routes.length === 0) {
        console.error('🗺️ No routes found in Mapbox response:', {
          code: response.body.code,
          message: response.body.message,
          coordinates: coordinates
        });
        throw new Error(`No route found: ${response.body.message || 'Unknown error'}`);
      }

      const route = response.body.routes[0];
      console.log('🗺️ Mapbox route received successfully:', { 
        distance: route.distance, 
        duration: route.duration,
        legs: route.legs?.length,
        steps: route.legs?.[0]?.steps?.length
      });
      
      return this.processMapboxRoute(route);
    } catch (error) {
      console.error('🗺️ Mapbox routing error details:', {
        message: error.message,
        stack: error.stack?.split('\n').slice(0, 3),
        profile: request.profile,
        coordinates: request.coordinates
      });
      throw new Error(`Routing failed: ${error.message}`);
    }
  }

  private mapProfile(profile: string): string {
    const profileMap = {
      'walking': 'walking',
      'cycling': 'cycling', 
      'driving': 'driving'
    };
    const mappedProfile = profileMap[profile] || 'walking';
    console.log(`🗺️ Mapbox profile mapping: ${profile} → ${mappedProfile}`);
    return mappedProfile;
  }

  private processMapboxRoute(route: any): NavigationRoute {
    const leg = route.legs[0];
    const duration = route.duration;
    const distance = route.distance;
    
    console.log('🗺️ Processing Mapbox route:', {
      distance,
      duration,
      legs: route.legs.length,
      steps: leg.steps.length,
      geometry_type: route.geometry?.type
    });
    
    // Process step-by-step instructions
    const instructions: RouteInstruction[] = leg.steps.map((step: any) => ({
      instruction: step.maneuver.instruction || this.generateInstruction(step),
      distance: this.formatDistance(step.distance),
      duration: this.formatDuration(step.duration),
      maneuverType: step.maneuver.type,
      coordinates: step.maneuver.location as [number, number]
    }));

    // Calculate arrival time using device time
    const arrivalTime = this.formatArrivalTime(duration);

    return {
      totalDistance: this.formatDistance(distance),
      estimatedTime: this.formatDuration(duration),
      durationSeconds: duration,
      instructions,
      geometry: route.geometry.coordinates,
      nextInstruction: instructions[0] || null,
      arrivalTime
    };
  }

  private generateInstruction(step: any): string {
    // Fallback instruction generation for German
    const maneuver = step.maneuver;
    const direction = maneuver.modifier;
    
    const instructionMap = {
      'turn': direction === 'left' ? 'Links abbiegen' : 
              direction === 'right' ? 'Rechts abbiegen' : 'Weiter geradeaus',
      'merge': 'Einfahren',
      'ramp': 'Auffahrt nehmen',
      'roundabout': 'In den Kreisverkehr einfahren',
      'arrive': 'Sie haben Ihr Ziel erreicht'
    };

    return instructionMap[maneuver.type] || 'Weiter geradeaus';
  }

  async getDirections(request: DirectionsRequest): Promise<NavigationRoute> {
    return this.getRoute({
      coordinates: [request.start, request.end],
      profile: 'walking',
      instructions: true,
      geometry: true,
    });
  }

  // Enhanced route tracking with better accuracy
  calculateRouteProgress(currentPosition: [number, number], routeGeometry: number[][]): {
    progressPercentage: number;
    distanceRemaining: number;
    nextWaypointIndex: number;
    distanceToNext: number;
  } {
    try {
      const currentPoint = turf.point([currentPosition[1], currentPosition[0]]); // [lng, lat]
      const routeLine = turf.lineString(routeGeometry);
      
      // Find closest point on route
      const snapped = turf.nearestPointOnLine(routeLine, currentPoint);
      const progressAlong = snapped.properties.location;
      
      // Calculate remaining distance
      const remainingSlice = turf.lineSliceAlong(
        routeLine, 
        progressAlong, 
        turf.length(routeLine)
      );
      
      const distanceRemaining = turf.length(remainingSlice) * 1000; // Convert to meters
      const totalDistance = turf.length(routeLine) * 1000;
      const progressPercentage = ((totalDistance - distanceRemaining) / totalDistance) * 100;

      return {
        progressPercentage: Math.max(0, Math.min(100, progressPercentage)),
        distanceRemaining,
        nextWaypointIndex: 0,
        distanceToNext: distanceRemaining
      };
    } catch (error) {
      console.error('Route progress calculation error:', error);
      return {
        progressPercentage: 0,
        distanceRemaining: 0,
        nextWaypointIndex: 0,
        distanceToNext: 0
      };
    }
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
    // Use device system time for accurate ETA calculation
    const now = new Date();
    const arrival = new Date(now.getTime() + durationSeconds * 1000);
    
    // Use device locale and 24-hour format to match system time display
    return arrival.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }
}

// Legacy OpenRouteService class for fallback
export class OpenRouteService {
  private apiKey: string;
  private baseUrl = 'https://api.openrouteservice.org/v2';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getRoute(request: RouteRequest): Promise<NavigationRoute> {
    const url = `${this.baseUrl}/directions/foot-walking`;
    
    const body = {
      coordinates: request.coordinates,
      format: 'json',
      instructions: true,
      geometry: true,
      language: request.language || 'de',
      units: 'm',
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
      throw new Error(`OpenRoute API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const route = data.routes[0];
    
    // Convert to NavigationRoute format
    const instructions: RouteInstruction[] = route.segments[0].steps.map((step: any) => ({
      instruction: step.instruction,
      distance: this.formatDistance(step.distance),
      duration: this.formatDuration(step.duration)
    }));

    return {
      totalDistance: this.formatDistance(route.summary.distance),
      estimatedTime: this.formatDuration(route.summary.duration),
      durationSeconds: route.summary.duration,
      instructions,
      geometry: route.geometry,
      nextInstruction: instructions[0] || null,
      arrivalTime: this.formatArrivalTime(route.summary.duration)
    };
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
    
    return arrival.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }
}

// Enhanced routing service with fallback capability
export class EnhancedRoutingService {
  private mapboxService: MapboxRoutingService;
  private openRouteService: OpenRouteService;
  
  constructor(mapboxToken: string, openRouteToken: string) {
    this.mapboxService = new MapboxRoutingService(mapboxToken);
    this.openRouteService = new OpenRouteService(openRouteToken);
  }

  async getRoute(request: RouteRequest): Promise<NavigationRoute> {
    console.log('🗺️ Enhanced routing service called with:', {
      profile: request.profile,
      coordinates: request.coordinates,
      language: request.language
    });

    try {
      // Try Mapbox first (primary routing)
      console.log('🗺️ Attempting Mapbox routing (primary service)');
      const result = await this.mapboxService.getRoute(request);
      console.log('✅ Mapbox routing successful');
      return result;
    } catch (error) {
      console.warn('⚠️ Mapbox routing failed, falling back to OpenRoute:', {
        error: error.message,
        hasMapboxToken: !!process.env.MAPBOX_ACCESS_TOKEN,
        hasOpenRouteToken: !!process.env.OPENROUTE_API_KEY
      });
      
      try {
        // Fallback to OpenRouteService
        console.log('🔄 Using OpenRoute fallback service');
        const result = await this.openRouteService.getRoute(request);
        console.log('✅ OpenRoute fallback successful');
        return result;
      } catch (fallbackError) {
        console.error('❌ Both routing services failed:', {
          mapboxError: error.message,
          openRouteError: fallbackError.message
        });
        throw new Error('Navigation service unavailable. Please try again.');
      }
    }
  }

  async getDirections(request: DirectionsRequest): Promise<NavigationRoute> {
    return this.getRoute({
      coordinates: [request.start, request.end],
      profile: 'walking',
      instructions: true,
      geometry: true,
    });
  }

  calculateRouteProgress(currentPosition: [number, number], routeGeometry: number[][]): {
    progressPercentage: number;
    distanceRemaining: number;
    nextWaypointIndex: number;
    distanceToNext: number;
  } {
    try {
      return this.mapboxService.calculateRouteProgress(currentPosition, routeGeometry);
    } catch (error) {
      console.warn('Using fallback route progress calculation');
      // Simple fallback calculation
      return {
        progressPercentage: 0,
        distanceRemaining: 0,
        nextWaypointIndex: 0,
        distanceToNext: 0
      };
    }
  }

  formatDistance(meters: number): string {
    return this.mapboxService.formatDistance(meters);
  }

  formatDuration(seconds: number): string {
    return this.mapboxService.formatDuration(seconds);
  }

  formatArrivalTime(durationSeconds: number): string {
    return this.mapboxService.formatArrivalTime(durationSeconds);
  }
}

// Backward compatibility exports
export const RoutingService = EnhancedRoutingService;
