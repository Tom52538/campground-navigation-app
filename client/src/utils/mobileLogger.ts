// Mobile-specific logging utility for smartphone debugging
export class MobileLogger {
  private logs: string[] = [];
  private maxLogs = 500;
  private logElement: HTMLElement | null = null;
  private isVisible = false;

  constructor() {
    this.setupMobileLogging();
    this.createLogDisplay();
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
      bottom: 60px;
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
}

// Global mobile logger instance
export const mobileLogger = new MobileLogger();