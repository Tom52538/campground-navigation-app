
// Enhanced mobile logger with git debugging capabilities
import { mobileLogger } from './client/src/utils/mobileLogger';

export class EnhancedDebugLogger extends mobileLogger.constructor {
  constructor() {
    super();
    this.setupGitDebugging();
    this.setupNetworkDebugging();
    this.setupErrorRecovery();
  }

  private setupGitDebugging() {
    // Log git-related operations
    this.log('GIT_DEBUG', 'Enhanced git debugging initialized');
    
    // Monitor any git-related errors
    window.addEventListener('error', (event) => {
      if (event.message.includes('git') || event.message.includes('push')) {
        this.log('GIT_ERROR', `Git operation failed: ${event.message}`);
        this.triggerGitRecovery();
      }
    });
  }

  private setupNetworkDebugging() {
    // Enhanced network monitoring
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = Date.now();
      const url = args[0]?.toString() || 'unknown';
      
      this.log('NETWORK_DEBUG', `Starting request to: ${url}`);
      
      try {
        const response = await originalFetch(...args);
        const duration = Date.now() - startTime;
        
        this.log('NETWORK_SUCCESS', `${url} - ${response.status} (${duration}ms)`);
        
        if (!response.ok) {
          this.log('NETWORK_ERROR', `HTTP Error ${response.status}: ${response.statusText}`);
        }
        
        return response;
      } catch (error) {
        const duration = Date.now() - startTime;
        this.log('NETWORK_FAILED', `${url} - ${error} (${duration}ms)`);
        throw error;
      }
    };
  }

  private setupErrorRecovery() {
    // Automatic error recovery
    window.addEventListener('unhandledrejection', (event) => {
      this.log('PROMISE_REJECTION', `Unhandled promise rejection: ${event.reason}`);
      
      if (event.reason?.toString().includes('git')) {
        this.triggerGitRecovery();
      }
    });
  }

  private triggerGitRecovery() {
    this.log('GIT_RECOVERY', 'Attempting automatic git recovery...');
    
    // Show user-friendly message
    if (window.confirm('Git synchronization issue detected. Run automatic fix?')) {
      this.log('GIT_RECOVERY', 'User approved automatic git fix');
      // This would trigger the git fix script
    }
  }

  // Enhanced logging methods
  logGitOperation(operation: string, success: boolean, details?: string) {
    const status = success ? 'SUCCESS' : 'FAILED';
    this.log(`GIT_${status}`, `${operation}: ${details || 'No details'}`);
  }

  logSystemState() {
    const systemInfo = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      memory: (performance as any).memory ? {
        used: Math.round((performance as any).memory.usedJSHeapSize / 1048576) + 'MB',
        total: Math.round((performance as any).memory.totalJSHeapSize / 1048576) + 'MB'
      } : 'unavailable',
      connection: (navigator as any).connection ? {
        type: (navigator as any).connection.effectiveType,
        downlink: (navigator as any).connection.downlink
      } : 'unavailable'
    };
    
    this.log('SYSTEM_STATE', JSON.stringify(systemInfo, null, 2));
  }

  exportDebugReport(): string {
    const report = {
      timestamp: new Date().toISOString(),
      logs: this.exportLogs(),
      systemInfo: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        devicePixelRatio: window.devicePixelRatio
      }
    };
    
    return JSON.stringify(report, null, 2);
  }
}

// Global enhanced logger instance
export const enhancedLogger = new EnhancedDebugLogger();
