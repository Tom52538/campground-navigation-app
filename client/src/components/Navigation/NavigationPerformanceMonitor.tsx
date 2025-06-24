import { Battery, Signal, Clock, Gauge, Satellite } from 'lucide-react';

interface NavigationPerformanceMonitorProps {
  gpsAccuracy: number;
  adaptiveInterval: number;
  isVisible: boolean;
  currentSpeed?: number;
  averageSpeed?: number;
  updateCount?: number;
}

export const NavigationPerformanceMonitor = ({ 
  gpsAccuracy, 
  adaptiveInterval, 
  isVisible,
  currentSpeed = 0,
  averageSpeed = 0,
  updateCount = 0
}: NavigationPerformanceMonitorProps) => {
  if (!isVisible) return null;

  const getGpsSignalStrength = (accuracy: number) => {
    if (accuracy <= 5) return { status: 'excellent', color: 'text-green-400' };
    if (accuracy <= 10) return { status: 'good', color: 'text-yellow-400' };
    if (accuracy <= 20) return { status: 'fair', color: 'text-orange-400' };
    return { status: 'poor', color: 'text-red-400' };
  };

  const getBatteryOptimization = (interval: number) => {
    if (interval <= 1000) return { status: 'high-power', color: 'text-red-300' };
    if (interval <= 2000) return { status: 'balanced', color: 'text-yellow-300' };
    return { status: 'power-saving', color: 'text-green-300' };
  };

  const signalStrength = getGpsSignalStrength(gpsAccuracy);
  const batteryMode = getBatteryOptimization(adaptiveInterval);
  
  return (
    <div className="absolute top-4 right-4 z-50 bg-black/90 backdrop-blur-sm p-3 rounded-lg text-white text-xs space-y-2 min-w-[200px]">
      <div className="font-bold text-center flex items-center justify-center space-x-1">
        <Satellite className="w-3 h-3" />
        <span>Navigation Debug</span>
      </div>
      
      {/* GPS Status */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-1">
          <Signal className="w-3 h-3" />
          <span>GPS Signal:</span>
        </div>
        <span className={signalStrength.color}>
          {signalStrength.status} (±{gpsAccuracy.toFixed(1)}m)
        </span>
      </div>

      {/* Update Frequency */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-1">
          <Clock className="w-3 h-3" />
          <span>Update Rate:</span>
        </div>
        <span>{adaptiveInterval}ms</span>
      </div>

      {/* Battery Optimization */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-1">
          <Battery className="w-3 h-3" />
          <span>Power Mode:</span>
        </div>
        <span className={batteryMode.color}>
          {batteryMode.status}
        </span>
      </div>

      {/* Speed Information */}
      {currentSpeed > 0 && (
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-1">
            <Gauge className="w-3 h-3" />
            <span>Speed:</span>
          </div>
          <span className="text-blue-300">
            {currentSpeed.toFixed(1)} km/h
          </span>
        </div>
      )}

      {/* Average Speed */}
      {averageSpeed > 0 && (
        <div className="flex justify-between items-center">
          <span>Avg Speed:</span>
          <span className="text-cyan-300">
            {averageSpeed.toFixed(1)} km/h
          </span>
        </div>
      )}

      {/* Update Counter */}
      <div className="flex justify-between items-center">
        <span>GPS Updates:</span>
        <span className="text-gray-300">
          {updateCount}
        </span>
      </div>

      {/* Status Indicators */}
      <div className="pt-2 border-t border-gray-600">
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">System Status:</span>
          <span className="text-green-400">Active</span>
        </div>
      </div>
    </div>
  );
};