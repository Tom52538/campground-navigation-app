import { Coordinates, NavigationRoute } from '../types/navigation';

export interface RerouteRequest {
  currentPosition: Coordinates;
  destination: Coordinates;
  profile?: 'foot-walking' | 'cycling-regular' | 'driving-car';
}

export class RerouteService {
  private apiKey: string;
  private baseUrl = '/api'; // Use our backend proxy

  constructor(apiKey: string = '') {
    this.apiKey = apiKey;
  }

  async calculateNewRoute(request: RerouteRequest): Promise<NavigationRoute> {
    try {
      const response = await fetch(`${this.baseUrl}/route`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: request.currentPosition,
          to: request.destination,
          profile: request.profile || 'foot-walking'
        })
      });

      if (!response.ok) {
        throw new Error(`Rerouting failed: ${response.statusText}`);
      }

      const routeData = await response.json();
      
      // Transform the response to match NavigationRoute interface
      return {
        totalDistance: routeData.totalDistance,
        estimatedTime: routeData.estimatedTime,
        arrivalTime: routeData.arrivalTime,
        instructions: routeData.instructions,
        geometry: routeData.geometry,
        nextInstruction: routeData.nextInstruction
      };

    } catch (error) {
      console.error('Rerouting error:', error);
      throw new Error(`Failed to calculate new route: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async quickReroute(
    currentPosition: Coordinates, 
    destination: Coordinates
  ): Promise<NavigationRoute> {
    return this.calculateNewRoute({
      currentPosition,
      destination,
      profile: 'foot-walking' // Default for camping navigation
    });
  }

  // Check if rerouting is needed based on off-route distance
  shouldReroute(offRouteDistance: number, consecutiveOffRouteCount: number): boolean {
    // Reroute if significantly off route (>100m) or consistently off route
    return offRouteDistance > 0.1 || consecutiveOffRouteCount > 3;
  }

  // Calculate estimated time savings from rerouting
  estimateRerouteBenefit(
    currentRouteDistance: number, 
    newRouteDistance: number
  ): { timeSaved: number; distanceSaved: number; worthRerouting: boolean } {
    const distanceSaved = currentRouteDistance - newRouteDistance;
    const timeSaved = distanceSaved * 15; // Assume 4 km/h walking speed (15 min/km)
    
    // Reroute if saves more than 2 minutes or 100m
    const worthRerouting = timeSaved > 2 || distanceSaved > 0.1;

    return {
      timeSaved: Math.max(0, timeSaved),
      distanceSaved: Math.max(0, distanceSaved),
      worthRerouting
    };
  }

  // Format reroute messages for user feedback
  formatRerouteMessage(
    reason: 'off-route' | 'faster-route' | 'manual',
    timeSaved?: number,
    distanceSaved?: number
  ): string {
    switch (reason) {
      case 'off-route':
        return 'You are off the planned route. Calculating new directions...';
      case 'faster-route':
        if (timeSaved && distanceSaved) {
          return `Found faster route: saves ${Math.round(timeSaved)} minutes and ${Math.round(distanceSaved * 1000)}m`;
        }
        return 'Found a faster route. Updating directions...';
      case 'manual':
        return 'Recalculating route to destination...';
      default:
        return 'Updating route...';
    }
  }
}