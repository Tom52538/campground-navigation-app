import { Coordinates } from '@/types/navigation';
import { calculateDistance } from '@/lib/mapUtils';

export interface GPSStabilizerConfig {
  smoothingWindow: number;      // Number of positions to average
  maxAccuracy: number;          // Maximum GPS accuracy in meters
  maxJumpDistance: number;      // Maximum allowed position jump in meters
  minUpdateInterval: number;    // Minimum time between updates in ms
  speedThreshold: number;       // Maximum realistic speed in m/s (walking ~1.5 m/s)
}

export interface StabilizedPosition {
  position: Coordinates;
  accuracy: number;
  confidence: number;
  timestamp: number;
}

export class GPSStabilizer {
  private config: GPSStabilizerConfig;
  private positionHistory: Array<{
    position: Coordinates;
    accuracy: number;
    timestamp: number;
  }> = [];
  private lastEmittedPosition: Coordinates | null = null;
  private lastEmittedTime: number = 0;

  constructor(config: Partial<GPSStabilizerConfig> = {}) {
    this.config = {
      smoothingWindow: 3,
      maxAccuracy: 30,
      maxJumpDistance: 50,
      minUpdateInterval: 1500,
      speedThreshold: 5, // 5 m/s = 18 km/h (fast walking/jogging)
      ...config
    };
  }

  addPosition(position: Coordinates, accuracy: number): StabilizedPosition | null {
    const now = Date.now();
    
    // 1. Filter by accuracy
    if (accuracy > this.config.maxAccuracy) {
      console.log(`🔍 GPS STABILIZER: Rejected low accuracy (${accuracy}m)`);
      return null;
    }

    // 2. Check time interval
    if (now - this.lastEmittedTime < this.config.minUpdateInterval) {
      console.log(`🔍 GPS STABILIZER: Throttled update (${now - this.lastEmittedTime}ms)`);
      return null;
    }

    // 3. Check for unrealistic jumps
    if (this.lastEmittedPosition) {
      const distance = calculateDistance(this.lastEmittedPosition, position);
      const timeDelta = (now - this.lastEmittedTime) / 1000; // seconds
      const speed = distance / timeDelta;

      if (speed > this.config.speedThreshold) {
        console.log(`🔍 GPS STABILIZER: Rejected unrealistic speed (${speed.toFixed(1)} m/s, ${distance.toFixed(0)}m jump)`);
        return null;
      }
    }

    // 4. Add to history
    this.positionHistory.push({
      position,
      accuracy,
      timestamp: now
    });

    // Keep only recent positions
    this.positionHistory = this.positionHistory.slice(-this.config.smoothingWindow);

    // 5. Calculate smoothed position if we have enough data
    if (this.positionHistory.length >= Math.min(2, this.config.smoothingWindow)) {
      const smoothedPosition = this.calculateSmoothedPosition();
      this.lastEmittedPosition = smoothedPosition.position;
      this.lastEmittedTime = now;
      
      console.log(`🔍 GPS STABILIZER: Emitting smoothed position:`, smoothedPosition.position, `confidence: ${smoothedPosition.confidence.toFixed(2)}`);
      return smoothedPosition;
    }

    return null;
  }

  private calculateSmoothedPosition(): StabilizedPosition {
    if (this.positionHistory.length === 0) {
      throw new Error('No position history available');
    }

    // Weighted average based on accuracy (better accuracy = higher weight)
    let totalWeight = 0;
    let weightedLat = 0;
    let weightedLng = 0;
    let totalAccuracy = 0;

    for (const entry of this.positionHistory) {
      // Inverse accuracy as weight (lower accuracy number = better = higher weight)
      const weight = 1 / (entry.accuracy + 1);
      totalWeight += weight;
      weightedLat += entry.position.lat * weight;
      weightedLng += entry.position.lng * weight;
      totalAccuracy += entry.accuracy;
    }

    const smoothedPosition: Coordinates = {
      lat: weightedLat / totalWeight,
      lng: weightedLng / totalWeight
    };

    const avgAccuracy = totalAccuracy / this.positionHistory.length;
    const confidence = Math.min(1, this.positionHistory.length / this.config.smoothingWindow);

    return {
      position: smoothedPosition,
      accuracy: avgAccuracy,
      confidence,
      timestamp: Date.now()
    };
  }

  reset(): void {
    this.positionHistory = [];
    this.lastEmittedPosition = null;
    this.lastEmittedTime = 0;
    console.log('🔍 GPS STABILIZER: Reset');
  }

  getCurrentPosition(): Coordinates | null {
    return this.lastEmittedPosition;
  }
}