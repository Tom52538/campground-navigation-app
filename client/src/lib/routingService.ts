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
  
  constructor(accessToken: string) {
    this.directionsService = MapboxDirections({ accessToken });
  }

  async getRoute(request: RouteRequest): Promise<NavigationRoute> {
    try {
      const mapboxRequest = {
        waypoints: request.coordinates.map(coord => ({
          coordinates: [coord[1], coord[0]] // Mapbox expects [lng, lat]
        })),
        profile: this.mapProfile(request.profile || 'walking'),
        language: request.language || 'de',
        steps: true,
        voice_instructions: true,
        banner_instructions: true,
        geometries: 'geojson',
        overview: 'full'
      };

      console.log('🗺️ Mapbox routing request:', { profile: mapboxRequest.profile, language: mapboxRequest.language });

      const response = await this.directionsService.getDirections(mapboxRequest).send();
      
      if (!response.body.routes || response.body.routes.length === 0) {
        throw new Error('No route found');
      }

      const route = response.body.routes[0];
      console.log('🗺️ Mapbox route received:', { distance: route.distance, duration: route.duration });
      
      return this.processMapboxRoute(route);
    } catch (error) {
      console.error('Mapbox routing error:', error);
      throw new Error(`Routing failed: ${error.message}`);
    }
  }

  private mapProfile(profile: string): string {
    const profileMap = {
      'walking': 'mapbox/walking',
      'cycling': 'mapbox/cycling', 
      'driving': 'mapbox/driving'
    };
    return profileMap[profile] || 'mapbox/walking';
  }

  private processMapboxRoute(route: any): NavigationRoute {
    const leg = route.legs[0];
    const duration = route.duration;
    const distance = route.distance;
    
    // Process step-by-step instructions
    const instructions: RouteInstruction[] = leg.steps.map((step: any) => ({
      instruction: step.maneuver.instruction || this.generateInstruction(step),
      distance: this.formatDistance(step.distance),
      duration: this.formatDuration(step.duration),
      maneuverType: step.maneuver.type,
      coordinates: step.maneuver.location as [number, number]
    }));

    // Process voice instructions
    const voiceInstructions: VoiceInstruction[] = leg.steps
      .filter((step: any) => step.voiceInstructions && step.voiceInstructions.length > 0)
      .flatMap((step: any) => 
        step.voiceInstructions.map((voice: any) => ({
          text: voice.announcement,
          distanceAlongGeometry: voice.distanceAlongGeometry,
          announcement: voice.announcement
        }))
      );

    // Calculate arrival time using device time
    const arrivalTime = this.formatArrivalTime(duration);

    return {
      totalDistance: this.formatDistance(distance),
      estimatedTime: this.formatDuration(duration),
      durationSeconds: duration,
      instructions,
      geometry: route.geometry.coordinates,
      nextInstruction: instructions[0] || null,
      arrivalTime,
      voiceInstructions
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
    try {
      // Try Mapbox first (primary routing)
      console.log('🗺️ Using Mapbox routing (primary)');
      return await this.mapboxService.getRoute(request);
    } catch (error) {
      console.warn('⚠️ Mapbox routing failed, falling back to OpenRoute:', error);
      
      try {
        // Fallback to OpenRouteService
        console.log('🔄 Using OpenRoute fallback service');
        return await this.openRouteService.getRoute(request);
      } catch (fallbackError) {
        console.error('❌ Both routing services failed:', fallbackError);
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
    return this.mapboxService.calculateRouteProgress(currentPosition, routeGeometry);
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
