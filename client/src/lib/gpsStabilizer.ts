import { Coordinates } from '@/types/navigation';

// Inline distance calculation to avoid import issues in production
function calculateDistance(pos1: Coordinates, pos2: Coordinates): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (pos1.lat * Math.PI) / 180;
  const φ2 = (pos2.lat * Math.PI) / 180;
  const Δφ = ((pos2.lat - pos1.lat) * Math.PI) / 180;
  const Δλ = ((pos2.lng - pos1.lng) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

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
  private isStabilizing: boolean = false;
  private smoothedPosition: Coordinates | null = null;
  private interpolationTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<GPSStabilizerConfig> = {}) {
    this.config = {
      smoothingWindow: 7,
      maxAccuracy: 40,
      maxJumpDistance: 50,
      minUpdateInterval: 5000, // 5 seconds - very conservative
      speedThreshold: 1.2, // 1.2 m/s = 4.3 km/h (slow walking)
      ...config
    };
  }

  addPosition(position: Coordinates, accuracy: number): StabilizedPosition | null {
    const now = Date.now();
    
    console.log(`🔍 GPS RAW: ${position.lat.toFixed(7)},${position.lng.toFixed(7)} acc:${accuracy}m`);
    
    // ULTRA-STRICT filtering to prevent ANY flickering
    
    // 1. Only accept high-accuracy positions
    if (accuracy > this.config.maxAccuracy) {
      console.log(`🔍 GPS: REJECT accuracy ${accuracy}m`);
      return null;
    }

    // 2. Enforce minimum time interval religiously
    if (this.lastEmittedTime > 0) {
      const timeSinceLastEmit = now - this.lastEmittedTime;
      if (timeSinceLastEmit < this.config.minUpdateInterval) {
        console.log(`🔍 GPS: THROTTLE ${Math.round(timeSinceLastEmit/1000)}s/${this.config.minUpdateInterval/1000}s`);
        return null;
      }
    }

    // 3. Validate against last known good position
    if (this.lastEmittedPosition) {
      const distance = calculateDistance(this.lastEmittedPosition, position);
      const timeDelta = this.lastEmittedTime ? (now - this.lastEmittedTime) / 1000 : 1;
      const speed = distance / timeDelta;
      
      if (speed > this.config.speedThreshold) {
        console.log(`🔍 GPS: REJECT speed ${speed.toFixed(1)}m/s (${distance.toFixed(0)}m in ${timeDelta.toFixed(0)}s)`);
        return null;
      }
    }

    // 4. Add to buffer for smoothing
    this.positionHistory.push({ position, accuracy, timestamp: now });
    this.positionHistory = this.positionHistory.slice(-this.config.smoothingWindow);

    // 5. Only emit after collecting enough stable samples
    if (this.positionHistory.length >= 5) {
      const stablePosition = this.calculateUltraStablePosition();
      
      console.log(`🔍 GPS: ✅ EMIT ${stablePosition.position.lat.toFixed(7)},${stablePosition.position.lng.toFixed(7)} conf:${stablePosition.confidence.toFixed(2)}`);
      
      this.lastEmittedPosition = stablePosition.position;
      this.lastEmittedTime = now;
      this.smoothedPosition = stablePosition.position;
      
      return stablePosition;
    }

    console.log(`🔍 GPS: BUFFER ${this.positionHistory.length}/${this.config.smoothingWindow}`);
    return null;
  }

  private calculateUltraStablePosition(): StabilizedPosition {
    if (this.positionHistory.length === 0) {
      throw new Error('No position history available');
    }

    // Use MEDIAN instead of average to eliminate outliers completely
    const latitudes = this.positionHistory.map(p => p.position.lat).sort((a, b) => a - b);
    const longitudes = this.positionHistory.map(p => p.position.lng).sort((a, b) => a - b);
    
    const medianLat = latitudes[Math.floor(latitudes.length / 2)];
    const medianLng = longitudes[Math.floor(longitudes.length / 2)];

    // Additional smoothing: weighted average of positions closest to median
    let totalWeight = 0;
    let weightedLat = 0;
    let weightedLng = 0;
    let totalAccuracy = 0;

    for (const entry of this.positionHistory) {
      const latDiff = Math.abs(entry.position.lat - medianLat);
      const lngDiff = Math.abs(entry.position.lng - medianLng);
      const distanceFromMedian = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
      
      // Weight: closer to median = higher weight, better accuracy = higher weight
      const proximityWeight = 1 / (distanceFromMedian * 1000000 + 1); // Scale for GPS precision
      const accuracyWeight = 1 / (entry.accuracy + 1);
      const weight = proximityWeight * accuracyWeight;
      
      totalWeight += weight;
      weightedLat += entry.position.lat * weight;
      weightedLng += entry.position.lng * weight;
      totalAccuracy += entry.accuracy;
    }

    const ultraStablePosition: Coordinates = {
      lat: weightedLat / totalWeight,
      lng: weightedLng / totalWeight
    };

    const avgAccuracy = totalAccuracy / this.positionHistory.length;
    const confidence = Math.min(1, this.positionHistory.length / this.config.smoothingWindow);

    return {
      position: ultraStablePosition,
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