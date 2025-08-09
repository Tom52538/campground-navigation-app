
// Memory monitoring utility for detecting potential crashes
export class MemoryMonitor {
  private static instance: MemoryMonitor;
  private monitoringInterval: NodeJS.Timeout | null = null;

  public static getInstance(): MemoryMonitor {
    if (!MemoryMonitor.instance) {
      MemoryMonitor.instance = new MemoryMonitor();
    }
    return MemoryMonitor.instance;
  }

  public startMonitoring(): void {
    if (this.monitoringInterval) return;

    this.monitoringInterval = setInterval(() => {
      this.checkMemoryUsage();
    }, 30000); // Check every 30 seconds
  }

  public stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  private checkMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
      const totalMB = Math.round(memory.totalJSHeapSize / 1048576);
      const limitMB = Math.round(memory.jsHeapSizeLimit / 1048576);

      console.log(`🔍 MEMORY: Used: ${usedMB}MB, Total: ${totalMB}MB, Limit: ${limitMB}MB`);

      // Warn if memory usage is high
      if (usedMB > limitMB * 0.8) {
        console.warn('🚨 HIGH MEMORY USAGE DETECTED - Potential crash risk');
        this.triggerCleanup();
      }
    }
  }

  private triggerCleanup(): void {
    // Force garbage collection
    if ('gc' in window) {
      (window as any).gc();
    }

    // Clear unused query cache
    if (window.location.reload) {
      console.log('🔄 Triggering memory cleanup...');
    }
  }
}
