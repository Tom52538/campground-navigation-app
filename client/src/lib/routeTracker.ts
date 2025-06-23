import { Coordinates } from '@/types';
import { calculateDistance } from './mapUtils';

export interface NavigationRoute {
  instructions: Array<{
    instruction: string;
    distance: string;
    duration: string;
  }>;
  geometry: number[][];
  totalDistance: string;
  totalDuration: string;
}

export class RouteTracker {
  private route: NavigationRoute;
  private currentStepIndex: number = 0;
  private onStepChange: (step: number) => void;
  private onOffRoute: (isOff: boolean) => void;

  private readonly STEP_ADVANCE_THRESHOLD = 0.02; // 20 meters
  private readonly OFF_ROUTE_THRESHOLD = 0.05; // 50 meters

  constructor(route: NavigationRoute, onStepChange: (step: number) => void, onOffRoute: (isOff: boolean) => void) {
    this.route = route;
    this.onStepChange = onStepChange;
    this.onOffRoute = onOffRoute;
  }

  public updatePosition(position: Coordinates) {
    if (this.currentStepIndex >= this.route.instructions.length - 1) return;

    const nextWaypoint = {
      lat: this.route.geometry[this.currentStepIndex + 1][1],
      lng: this.route.geometry[this.currentStepIndex + 1][0]
    };

    const distanceToNext = calculateDistance(position, nextWaypoint);

    if (distanceToNext < this.STEP_ADVANCE_THRESHOLD) {
      this.currentStepIndex++;
      this.onStepChange(this.currentStepIndex);
    }
  }

  public getCurrentStepIndex(): number {
    return this.currentStepIndex;
  }
}