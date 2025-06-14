import { useState, useEffect } from 'react';
import { Battery, Signal, Clock, Gauge } from 'lucide-react';

interface PerformanceMetrics {
  batteryLevel?: number;
  batteryCharging?: boolean;
  gpsAccuracy: number;
  gpsSignalStrength: 'poor' | 'fair' | 'good' | 'excellent';
  updateFrequency: number;
  memoryUsage?: number;
}

interface NavigationPerformanceMonitorProps {
  gpsAccuracy: number;
  adaptiveInterval: number;
  isVisible?: boolean;
}

export const NavigationPerformanceMonitor = ({ 
  gpsAccuracy, 
  adaptiveInterval, 
  isVisible = false 
}: NavigationPerformanceMonitorProps) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    gpsAccuracy,
    gpsSignalStrength: 'good',
    updateFrequency: adaptiveInterval
  });

  // GPS signal strength based on accuracy
  const getGpsSignalStrength = (accuracy: number): PerformanceMetrics['gpsSignalStrength'] => {
    if (accuracy <= 5) return 'excellent';
    if (accuracy <= 10) return 'good';
    if (accuracy <= 20) return 'fair';
    return 'poor';
  };

  // Battery monitoring
  useEffect(() => {
    const updateBatteryInfo = async () => {
      if ('getBattery' in navigator) {
        try {
          const battery = await (navigator as any).getBattery();
          setMetrics(prev => ({
            ...prev,
            batteryLevel: Math.round(battery.level * 100),
            batteryCharging: battery.charging
          }));

          const updateBattery = () => {
            setMetrics(prev => ({
              ...prev,
              batteryLevel: Math.round(battery.level * 100),
              batteryCharging: battery.charging
            }));
          };

          battery.addEventListener('levelchange', updateBattery);
          battery.addEventListener('chargingchange', updateBattery);

          return () => {
            battery.removeEventListener('levelchange', updateBattery);
            battery.removeEventListener('chargingchange', updateBattery);
          };
        } catch (error) {
          console.log('Battery API not available');
        }
      }
    };

    updateBatteryInfo();
  }, []);

  // Memory usage monitoring
  useEffect(() => {
    const updateMemoryUsage = () => {
      if ('memory' in performance) {
        const memInfo = (performance as any).memory;
        const usedMB = Math.round(memInfo.usedJSHeapSize / 1024 / 1024);
        setMetrics(prev => ({ ...prev, memoryUsage: usedMB }));
      }
    };

    updateMemoryUsage();
    const interval = setInterval(updateMemoryUsage, 5000);
    return () => clearInterval(interval);
  }, []);

  // Update GPS metrics
  useEffect(() => {
    setMetrics(prev => ({
      ...prev,
      gpsAccuracy,
      gpsSignalStrength: getGpsSignalStrength(gpsAccuracy),
      updateFrequency: adaptiveInterval
    }));
  }, [gpsAccuracy, adaptiveInterval]);

  const getSignalColor = (strength: PerformanceMetrics['gpsSignalStrength']) => {
    switch (strength) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getBatteryColor = (level?: number, charging?: boolean) => {
    if (charging) return 'text-green-600';
    if (!level) return 'text-gray-400';
    if (level > 50) return 'text-green-600';
    if (level > 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!isVisible) return null;

  return (
    <div className="absolute top-4 right-4 z-40">
      <div className="bg-black/80 backdrop-blur-sm rounded-lg p-3 text-white text-xs space-y-2 min-w-[200px]">
        <div className="text-center font-medium text-white/90 mb-2">
          Navigation Performance
        </div>

        {/* GPS Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Signal className={`w-3 h-3 ${getSignalColor(metrics.gpsSignalStrength)}`} />
            <span>GPS</span>
          </div>
          <div className="text-right">
            <div className={getSignalColor(metrics.gpsSignalStrength)}>
              {metrics.gpsSignalStrength.toUpperCase()}
            </div>
            <div className="text-white/60">±{gpsAccuracy.toFixed(0)}m</div>
          </div>
        </div>

        {/* Update Frequency */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-blue-400" />
            <span>Update</span>
          </div>
          <div className="text-right">
            <div className="text-blue-400">
              {(1000 / adaptiveInterval).toFixed(1)}Hz
            </div>
            <div className="text-white/60">{adaptiveInterval}ms</div>
          </div>
        </div>

        {/* Battery Status */}
        {metrics.batteryLevel !== undefined && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Battery className={`w-3 h-3 ${getBatteryColor(metrics.batteryLevel, metrics.batteryCharging)}`} />
              <span>Battery</span>
            </div>
            <div className="text-right">
              <div className={getBatteryColor(metrics.batteryLevel, metrics.batteryCharging)}>
                {metrics.batteryLevel}%
                {metrics.batteryCharging && ' ⚡'}
              </div>
            </div>
          </div>
        )}

        {/* Memory Usage */}
        {metrics.memoryUsage && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Gauge className="w-3 h-3 text-purple-400" />
              <span>Memory</span>
            </div>
            <div className="text-right">
              <div className="text-purple-400">{metrics.memoryUsage}MB</div>
            </div>
          </div>
        )}

        <div className="border-t border-white/20 pt-2 text-center">
          <div className="text-white/60">
            Adaptive GPS Tracking Active
          </div>
        </div>
      </div>
    </div>
  );
};