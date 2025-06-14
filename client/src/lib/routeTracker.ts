import { Coordinates, NavigationRoute, RouteInstruction } from '../types/navigation';
import { calculateDistance } from './mapUtils';
import { SpeedTracker, ETAUpdate } from './speedTracker';

export interface RouteProgress {
  currentStep: number;
  distanceToNext: number;
  distanceRemaining: number;
  shouldAdvance: boolean;
  isOffRoute: boolean;
  percentComplete: number;
  estimatedTimeRemaining: number;
  currentSpeed: number;
  averageSpeed: number;
  dynamicETA: ETAUpdate;
}

export class RouteTracker {
  private route: NavigationRoute;
  private currentStepIndex: number = 0;
  private onStepChange: (step: number) => void;
  private onRouteComplete: () => void;
  private onOffRoute: (distance: number) => void;
  private totalDistance: number;
  private completedDistance: number = 0;

  // Thresholds for navigation decisions
  private readonly STEP_ADVANCE_THRESHOLD = 0.02; // 20 meters
  private readonly OFF_ROUTE_THRESHOLD = 0.05; // 50 meters
  private readonly ROUTE_COMPLETE_THRESHOLD = 0.01; // 10 meters

  constructor(
    route: NavigationRoute,
    onStepChange: (step: number) => void,
    onRouteComplete: () => void = () => {},
    onOffRoute: (distance: number) => void = () => {}
  ) {
    this.route = route;
    this.onStepChange = onStepChange;
    this.onRouteComplete = onRouteComplete;
    this.onOffRoute = onOffRoute;
    this.totalDistance = this.calculateTotalDistance();
  }

  private calculateTotalDistance(): number {
    if (!this.route.geometry || this.route.geometry.length < 2) return 0;
    
    let total = 0;
    for (let i = 1; i < this.route.geometry.length; i++) {
      const prev = { lat: this.route.geometry[i-1][1], lng: this.route.geometry[i-1][0] };
      const curr = { lat: this.route.geometry[i][1], lng: this.route.geometry[i][0] };
      total += calculateDistance(prev, curr);
    }
    return total;
  }

  private findClosestPointOnRoute(position: Coordinates): {
    point: Coordinates;
    distance: number;
    segmentIndex: number;
  } {
    if (!this.route.geometry || this.route.geometry.length < 2) {
      return {
        point: position,
        distance: 0,
        segmentIndex: 0
      };
    }

    let minDistance = Infinity;
    let closestPoint = position;
    let closestSegmentIndex = 0;

    for (let i = 0; i < this.route.geometry.length - 1; i++) {
      const segmentStart = { 
        lat: this.route.geometry[i][1], 
        lng: this.route.geometry[i][0] 
      };
      const segmentEnd = { 
        lat: this.route.geometry[i + 1][1], 
        lng: this.route.geometry[i + 1][0] 
      };

      const closestOnSegment = this.getClosestPointOnSegment(
        position, 
        segmentStart, 
        segmentEnd
      );

      const distance = calculateDistance(position, closestOnSegment);
      
      if (distance < minDistance) {
        minDistance = distance;
        closestPoint = closestOnSegment;
        closestSegmentIndex = i;
      }
    }

    return {
      point: closestPoint,
      distance: minDistance,
      segmentIndex: closestSegmentIndex
    };
  }

  private getClosestPointOnSegment(
    point: Coordinates,
    segmentStart: Coordinates,
    segmentEnd: Coordinates
  ): Coordinates {
    const A = point.lat - segmentStart.lat;
    const B = point.lng - segmentStart.lng;
    const C = segmentEnd.lat - segmentStart.lat;
    const D = segmentEnd.lng - segmentStart.lng;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;

    if (lenSq === 0) return segmentStart;

    let param = dot / lenSq;

    if (param < 0) {
      return segmentStart;
    } else if (param > 1) {
      return segmentEnd;
    } else {
      return {
        lat: segmentStart.lat + param * C,
        lng: segmentStart.lng + param * D
      };
    }
  }

  updatePosition(position: Coordinates): RouteProgress {
    if (!this.route.geometry || this.route.geometry.length === 0) {
      return this.createDefaultProgress();
    }

    // Find closest point on route
    const routeInfo = this.findClosestPointOnRoute(position);
    const isOffRoute = routeInfo.distance > this.OFF_ROUTE_THRESHOLD;

    // Check if we should advance to next step
    const nextWaypointIndex = Math.min(
      this.currentStepIndex + 1, 
      this.route.geometry.length - 1
    );
    
    const nextWaypoint = {
      lat: this.route.geometry[nextWaypointIndex][1],
      lng: this.route.geometry[nextWaypointIndex][0]
    };

    const distanceToNext = calculateDistance(position, nextWaypoint);
    const shouldAdvance = distanceToNext < this.STEP_ADVANCE_THRESHOLD;

    // Check if route is complete
    const destination = {
      lat: this.route.geometry[this.route.geometry.length - 1][1],
      lng: this.route.geometry[this.route.geometry.length - 1][0]
    };
    const distanceToDestination = calculateDistance(position, destination);
    const isComplete = distanceToDestination < this.ROUTE_COMPLETE_THRESHOLD;

    // Advance step if needed
    if (shouldAdvance && this.currentStepIndex < this.route.instructions.length - 1) {
      this.currentStepIndex++;
      this.onStepChange(this.currentStepIndex);
    }

    // Check for route completion
    if (isComplete) {
      this.onRouteComplete();
    }

    // Trigger off-route callback
    if (isOffRoute) {
      this.onOffRoute(routeInfo.distance);
    }

    // Calculate remaining distance
    const distanceRemaining = this.calculateRemainingDistance(position);
    const percentComplete = Math.min(
      ((this.totalDistance - distanceRemaining) / this.totalDistance) * 100,
      100
    );

    // Estimate remaining time based on average walking speed (4 km/h)
    const estimatedTimeRemaining = (distanceRemaining / 4) * 3600; // seconds

    return {
      currentStep: this.currentStepIndex,
      distanceToNext,
      distanceRemaining,
      shouldAdvance,
      isOffRoute,
      percentComplete,
      estimatedTimeRemaining
    };
  }

  private calculateRemainingDistance(currentPosition: Coordinates): number {
    if (!this.route.geometry || this.route.geometry.length === 0) return 0;

    // Find closest point on route
    const routeInfo = this.findClosestPointOnRoute(currentPosition);
    
    // Calculate distance from closest point to destination
    let remaining = 0;
    
    // Add distance from closest point to end of current segment
    if (routeInfo.segmentIndex < this.route.geometry.length - 1) {
      const segmentEnd = {
        lat: this.route.geometry[routeInfo.segmentIndex + 1][1],
        lng: this.route.geometry[routeInfo.segmentIndex + 1][0]
      };
      remaining += calculateDistance(routeInfo.point, segmentEnd);
    }

    // Add distance for all remaining segments
    for (let i = routeInfo.segmentIndex + 1; i < this.route.geometry.length - 1; i++) {
      const segmentStart = {
        lat: this.route.geometry[i][1],
        lng: this.route.geometry[i][0]
      };
      const segmentEnd = {
        lat: this.route.geometry[i + 1][1],
        lng: this.route.geometry[i + 1][0]
      };
      remaining += calculateDistance(segmentStart, segmentEnd);
    }

    return remaining;
  }

  private createDefaultProgress(): RouteProgress {
    return {
      currentStep: 0,
      distanceToNext: 0,
      distanceRemaining: 0,
      shouldAdvance: false,
      isOffRoute: false,
      percentComplete: 0,
      estimatedTimeRemaining: 0
    };
  }

  getCurrentInstruction(): RouteInstruction | null {
    if (!this.route.instructions || this.currentStepIndex >= this.route.instructions.length) {
      return null;
    }
    return this.route.instructions[this.currentStepIndex];
  }

  getNextInstruction(): RouteInstruction | null {
    const nextIndex = this.currentStepIndex + 1;
    if (!this.route.instructions || nextIndex >= this.route.instructions.length) {
      return null;
    }
    return this.route.instructions[nextIndex];
  }

  reset(): void {
    this.currentStepIndex = 0;
    this.completedDistance = 0;
  }

  // Get current step progress for UI
  getStepProgress(): {
    current: number;
    total: number;
    instruction: RouteInstruction | null;
    nextInstruction: RouteInstruction | null;
  } {
    return {
      current: this.currentStepIndex + 1,
      total: this.route.instructions.length,
      instruction: this.getCurrentInstruction(),
      nextInstruction: this.getNextInstruction()
    };
  }
}