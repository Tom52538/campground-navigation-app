export interface RouteRequest {
  coordinates: [number, number][];
  profile?: 'driving-car' | 'foot-walking' | 'cycling-regular';
  format?: 'json' | 'geojson';
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

export class RoutingService {
  private apiKey: string;
  private baseUrl = 'https://api.openrouteservice.org/v2';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getRoute(request: RouteRequest): Promise<RouteResponse> {
    const url = `${this.baseUrl}/directions/${request.profile || 'foot-walking'}`;
    
    const body = {
      coordinates: request.coordinates,
      format: request.format || 'json',
      instructions: request.instructions !== false,
      geometry: request.geometry !== false,
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
    return arrival.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }
}
