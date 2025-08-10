// Mobile-specific logging utility for smartphone debugging
export class MobileLogger {
  private logs: string[] = [];
  private maxLogs = 500;
  private logElement: HTMLElement | null = null;
  private isVisible = false;

  constructor() {
    this.setupMobileLogging();
    this.createLogDisplay();
    this.setupCrashDetection();
  }

  private setupMobileLogging() {
    // Capture console errors
    const originalError = console.error;
    console.error = (...args) => {
      this.log('ERROR', args.join(' '));
      originalError.apply(console, args);
    };

    // Capture unhandled errors
    window.addEventListener('error', (event) => {
      this.log('UNHANDLED_ERROR', `${event.message} at ${event.filename}:${event.lineno}`);
    });

    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.log('PROMISE_REJECTION', event.reason?.toString() || 'Unknown promise rejection');
    });

    // Capture network errors
    this.interceptFetch();
  }

  private interceptFetch() {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = Date.now();
      try {
        const response = await originalFetch(...args);
        const duration = Date.now() - startTime;
        
        if (!response.ok) {
          this.log('FETCH_ERROR', `${args[0]} - ${response.status} ${response.statusText} (${duration}ms)`);
        } else {
          this.log('FETCH_SUCCESS', `${args[0]} - ${response.status} (${duration}ms)`);
        }
        
        return response;
      } catch (error) {
        const duration = Date.now() - startTime;
        this.log('FETCH_FAILED', `${args[0]} - ${error} (${duration}ms)`);
        throw error;
      }
    };
  }

  private createLogDisplay() {
    // Create floating log viewer for mobile
    const logContainer = document.createElement('div');
    logContainer.id = 'mobile-log-container';
    logContainer.style.cssText = `
      position: fixed;
      top: 100px;
      right: 10px;
      width: 40px;
      height: 40px;
      background: rgba(255, 0, 0, 0.8);
      border-radius: 50%;
      z-index: 9999;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 12px;
      backdrop-filter: blur(8px);
      border: 2px solid rgba(255, 255, 255, 0.3);
    `;
    logContainer.textContent = 'LOG';

    const logDisplay = document.createElement('div');
    logDisplay.id = 'mobile-log-display';
    logDisplay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.95);
      color: #00ff00;
      font-family: monospace;
      font-size: 12px;
      padding: 20px;
      overflow-y: auto;
      z-index: 10000;
      display: none;
      white-space: pre-wrap;
      word-wrap: break-word;
    `;

    // Toggle log display
    logContainer.addEventListener('click', () => {
      this.isVisible = !this.isVisible;
      logDisplay.style.display = this.isVisible ? 'block' : 'none';
      if (this.isVisible) {
        this.updateLogDisplay();
      }
    });

    // Close log on tap outside or escape
    logDisplay.addEventListener('click', (e) => {
      if (e.target === logDisplay) {
        this.isVisible = false;
        logDisplay.style.display = 'none';
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isVisible) {
        this.isVisible = false;
        logDisplay.style.display = 'none';
      }
    });

    document.body.appendChild(logContainer);
    document.body.appendChild(logDisplay);
    this.logElement = logDisplay;
  }

  log(level: string, message: string) {
    const timestamp = new Date().toISOString().substr(11, 12);
    const logEntry = `[${timestamp}] ${level}: ${message}`;
    
    this.logs.push(logEntry);
    
    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Update display if visible
    if (this.isVisible && this.logElement) {
      this.updateLogDisplay();
    }

    // Also log to console for desktop debugging
    console.log(`📱 ${logEntry}`);
  }

  private updateLogDisplay() {
    if (this.logElement) {
      this.logElement.textContent = this.logs.join('\n');
      this.logElement.scrollTop = this.logElement.scrollHeight;
    }
  }

  // Device information logging
  logDeviceInfo() {
    const info = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      screenWidth: screen.width,
      screenHeight: screen.height,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      devicePixelRatio: window.devicePixelRatio,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      memory: (navigator as any).deviceMemory || 'unknown',
      connection: (navigator as any).connection?.effectiveType || 'unknown'
    };

    this.log('DEVICE_INFO', JSON.stringify(info, null, 2));
  }

  // Performance monitoring
  logPerformance(label: string, startTime: number) {
    const duration = performance.now() - startTime;
    this.log('PERFORMANCE', `${label}: ${duration.toFixed(2)}ms`);
  }

  // Log weather API calls to track frequency
  logWeatherCall(endpoint: string, coords: { lat: number, lng: number }) {
    this.log('WEATHER_API', `${endpoint} called for ${coords.lat.toFixed(3)},${coords.lng.toFixed(3)}`);
  }

  // Log compass/orientation changes
  logCompass(action: string, bearing?: number) {
    this.log('COMPASS', bearing !== undefined ? `${action} - bearing: ${bearing}°` : action);
  }

  // Log map rotation attempts
  logMapRotation(angle: number, method: string) {
    this.log('MAP_ROTATION', `Attempting ${angle}° rotation via ${method}`);
  }

  // Touch event logging
  logTouchEvent(event: TouchEvent, action: string) {
    const touch = event.touches[0] || event.changedTouches[0];
    if (touch) {
      this.log('TOUCH', `${action} at ${touch.clientX},${touch.clientY} - Target: ${(event.target as Element)?.tagName || 'unknown'}`);
    }
  }

  // Clear logs
  clearLogs() {
    this.logs = [];
    if (this.logElement) {
      this.logElement.textContent = '';
    }
    this.log('SYSTEM', 'Logs cleared');
  }

  // Export logs for sharing
  exportLogs(): string {
    return this.logs.join('\n');
  }

  // Crash detection and recovery
  private setupCrashDetection() {
    // Detect potential app crashes
    let lastActivity = Date.now();
    
    // Monitor for sudden inactivity (potential crash)
    setInterval(() => {
      const now = Date.now();
      if (now - lastActivity > 60000) { // 1 minute of inactivity
        this.log('CRASH_DETECTION', 'Potential crash detected - app inactive for >1 minute');
        this.triggerCrashRecovery();
      }
      lastActivity = now;
    }, 30000);

    // Monitor memory usage
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
        const limitMB = Math.round(memory.jsHeapSizeLimit / 1048576);
        
        if (usedMB > limitMB * 0.9) {
          this.log('MEMORY_WARNING', `Critical memory usage: ${usedMB}MB/${limitMB}MB`);
          this.triggerMemoryCleanup();
        }
      }, 15000);
    }

    // Detect React component errors
    window.addEventListener('error', (event) => {
      if (event.message.includes('React') || event.message.includes('Component')) {
        this.log('REACT_ERROR', `React component error: ${event.message}`);
        this.logReactState();
      }
    });

    // Monitor query client errors
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason?.toString().includes('query') || event.reason?.toString().includes('fetch')) {
        this.log('QUERY_ERROR', `Query/Fetch error: ${event.reason}`);
        this.suggestQueryReset();
      }
    });
  }

  private triggerCrashRecovery() {
    this.log('CRASH_RECOVERY', 'Attempting automatic crash recovery...');
    
    // Clear potential memory leaks
    for (let i = 1; i < 99999; i++) {
      window.clearTimeout(i);
      window.clearInterval(i);
    }

    // Force garbage collection
    if ('gc' in window) {
      (window as any).gc();
    }

    // Suggest reload if available
    if (confirm('App may have crashed. Would you like to reload?')) {
      window.location.reload();
    }
  }

  private triggerMemoryCleanup() {
    this.log('MEMORY_CLEANUP', 'Triggering memory cleanup...');
    
    // Clear query cache if available
    if ((window as any).queryClient) {
      (window as any).queryClient.clear();
      this.log('MEMORY_CLEANUP', 'Query cache cleared');
    }

    // Force garbage collection
    if ('gc' in window) {
      (window as any).gc();
    }
  }

  private logReactState() {
    const reactElements = document.querySelectorAll('[data-reactroot], [data-react-checksum]');
    this.log('REACT_STATE', `React elements found: ${reactElements.length}`);
    
    // Check for error boundaries
    const errorBoundaries = document.querySelectorAll('[class*="error"], [class*="crash"]');
    if (errorBoundaries.length > 0) {
      this.log('REACT_ERROR_BOUNDARY', `Error boundaries active: ${errorBoundaries.length}`);
    }
  }

  private suggestQueryReset() {
    this.log('QUERY_RESET', 'Suggesting query client reset due to persistent errors');
    
    setTimeout(() => {
      if ((window as any).queryClient) {
        (window as any).queryClient.invalidateQueries();
        this.log('QUERY_RESET', 'Query cache invalidated');
      }
    }, 1000);
  }

  // Enhanced app state logging
  logAppState() {
    const state = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      memory: 'memory' in performance ? {
        used: Math.round(((performance as any).memory.usedJSHeapSize / 1048576)),
        total: Math.round(((performance as any).memory.totalJSHeapSize / 1048576)),
        limit: Math.round(((performance as any).memory.jsHeapSizeLimit / 1048576))
      } : 'unavailable',
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      connection: (navigator as any).connection ? {
        type: (navigator as any).connection.effectiveType,
        downlink: (navigator as any).connection.downlink,
        rtt: (navigator as any).connection.rtt
      } : 'unavailable',
      geolocation: navigator.geolocation ? 'available' : 'unavailable',
      storage: {
        localStorage: !!window.localStorage,
        sessionStorage: !!window.sessionStorage
      }
    };
    
    this.log('APP_STATE', JSON.stringify(state, null, 2));
  }
}

// Global mobile logger instance
export const mobileLogger = new MobileLogger();