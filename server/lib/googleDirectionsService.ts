import { Coordinates, NavigationRoute } from '../../client/src/types/navigation';

export interface RouteRequest {
  from: Coordinates;
  to: Coordinates;
  profile?: 'walking' | 'cycling' | 'driving';
  language?: string;
}

export class GoogleDirectionsService {
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getRoute(request: RouteRequest): Promise<NavigationRoute> {
    const origin = `${request.from.lat},${request.from.lng}`;
    const destination = `${request.to.lat},${request.to.lng}`;
    
    // Map profiles to Google travel modes
    const travelMode = this.mapProfile(request.profile || 'walking');
    
    const url = `https://maps.googleapis.com/maps/api/directions/json?` +
      `origin=${origin}&` +
      `destination=${destination}&` +
      `mode=${travelMode}&` +
      `language=de&` +
      `units=metric&` +
      `key=${this.apiKey}`;

    console.log(`🗺️ Google Directions: Routing from ${origin} to ${destination} (${travelMode})`);

    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Google Directions API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status !== 'OK') {
        console.error('Google Directions API error:', data);
        throw new Error(`Google Directions API status: ${data.status} - ${data.error_message || 'Unknown error'}`);
      }

      if (!data.routes || data.routes.length === 0) {
        throw new Error('No routes found');
      }

      const processedRoute = this.processGoogleRoute(data.routes[0]);
      console.log(`✅ Google Directions: Route calculated - ${processedRoute.totalDistance}, ${processedRoute.estimatedTime}`);
      
      return processedRoute;
    } catch (error) {
      console.error('Google Directions API error:', error);
      throw new Error(`Navigation failed: ${error.message}`);
    }
  }

  private mapProfile(profile: string): string {
    const profileMap = {
      'walking': 'bicycling', // Use bicycling to avoid driving restrictions in campgrounds
      'cycling': 'bicycling', 
      'driving': 'driving'
    };
    return profileMap[profile] || 'bicycling';
  }

  private processGoogleRoute(route: any): NavigationRoute {
    const leg = route.legs[0];
    const distance = leg?.distance?.value || 0; // meters
    
    // Recalculate duration for 6 km/h campground walking speed
    const campgroundWalkingSpeed = 6; // km/h
    const distanceKm = distance / 1000;
    const recalculatedDurationHours = distanceKm / campgroundWalkingSpeed;
    const recalculatedDurationSeconds = Math.round(recalculatedDurationHours * 3600);
    
    console.log(`🚶 Campground routing: ${distance}m distance, recalculated from Google's time to ${Math.round(recalculatedDurationSeconds/60)} min for 6km/h walking`);
    
    const duration = recalculatedDurationSeconds; // Use our campground-optimized timing
    
    // Process turn-by-turn instructions with recalculated timing for each step
    const instructions = (leg?.steps || []).map((step: any, index: number) => {
      const stepDistance = step.distance?.value || 0;
      const stepDistanceKm = stepDistance / 1000;
      const stepDurationHours = stepDistanceKm / campgroundWalkingSpeed;
      const stepDurationSeconds = Math.round(stepDurationHours * 3600);
      
      return {
        instruction: this.cleanHtmlTags(step.html_instructions || ''),
        distance: this.formatDistance(stepDistance),
        duration: this.formatDuration(stepDurationSeconds), // Use campground walking speed
        maneuverType: step.maneuver || 'straight',
        stepIndex: index
      };
    });

    // Process route geometry (decode polyline)
    const geometry = this.decodePolyline(route.overview_polyline?.points || '');

    // Calculate arrival time
    const arrivalTime = new Date(Date.now() + duration * 1000).toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit'
    });

    return {
      totalDistance: this.formatDistance(distance),
      estimatedTime: this.formatDuration(duration),
      durationSeconds: duration,
      instructions,
      geometry,
      nextInstruction: instructions[0] || null,
      arrivalTime
    };
  }

  private cleanHtmlTags(htmlString: string): string {
    return htmlString.replace(/<[^>]*>/g, '');
  }

  private decodePolyline(encoded: string): number[][] {
    const coordinates: number[][] = [];
    let index = 0;
    let lat = 0;
    let lng = 0;

    while (index < encoded.length) {
      let shift = 0;
      let result = 0;
      let byte: number;

      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      const deltaLat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += deltaLat;

      shift = 0;
      result = 0;

      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      const deltaLng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += deltaLng;

      coordinates.push([lng / 1e5, lat / 1e5]);
    }

    return coordinates;
  }

  private formatDistance(meters: number): string {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${Math.round(meters)} m`;
  }

  private formatDuration(seconds: number): string {
    const minutes = Math.round(seconds / 60);
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
    }
    return `${minutes} min`;
  }
}