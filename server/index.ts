// === DEBUG LOGGING START ===
console.log('🚀 Server starting with NODE_ENV:', process.env.NODE_ENV);
console.log('📊 Process PID:', process.pid);
console.log('💾 Memory usage at start:', process.memoryUsage());

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('⚠️  SIGTERM received - graceful shutdown initiated');
  console.log('💾 Memory usage at SIGTERM:', process.memoryUsage());
  console.log('⏰ Uptime at shutdown:', process.uptime(), 'seconds');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('⚠️  SIGINT received - graceful shutdown initiated');
  process.exit(0);
});

// Error handling
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  console.error('Stack:', error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🚫 Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
  process.exit(1);
});

// Memory monitoring
setInterval(() => {
  const usage = process.memoryUsage();
  console.log('📈 Memory check:', {
    rss: Math.round(usage.rss / 1024 / 1024) + 'MB',
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024) + 'MB',
    uptime: Math.round(process.uptime()) + 's'
  });
}, 30000); // Alle 30 Sekunden
// === DEBUG LOGGING END ===

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";
import fs from "fs";

// Debug environment
console.log('🔧 Key environment variables:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- PORT:', process.env.PORT);
console.log('- Available memory:', process.memoryUsage().rss / 1024 / 1024, 'MB');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      log(logLine);
    }
  });
  next();
});

(async () => {
  console.log('🔄 Starting async server setup...');
  
  try {
    const server = await registerRoutes(app);
    console.log('✅ Routes registered successfully');

    app.use((err: any, req: Request, res: Response, next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      
      // Enhanced error logging
      console.error('🔥 Express error handler triggered:', {
        status,
        message,
        path: req.path,
        method: req.method,
        stack: err.stack
      });
      
      res.status(status).json({ message });
      throw err;
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (process.env.NODE_ENV === "development") {
      console.log('🛠️  Setting up Vite for development...');
      await setupVite(app, server);
    } else {
      console.log('📦 Setting up production static serving...');
      
      // Custom static file serving with Railway absolute path
      const distPath = "/app/dist/public";
      
      if (!fs.existsSync(distPath)) {
        console.error(`❌ Warning: Build directory not found at ${distPath}. Run 'npm run build' first.`);
        log(`Warning: Build directory not found at ${distPath}. Run 'npm run build' first.`);
      } else {
        console.log('✅ Build directory found, setting up static serving...');
        
        // Serve static assets
        app.use(express.static(distPath));
        
        // Handle client-side routing - serve index.html for all non-API routes
        app.use("*", (req, res) => {
          // Exclude API routes from SPA fallback
          if (req.path.startsWith('/api')) {
            return res.status(404).json({ message: 'API endpoint not found' });
          }
          
          res.sendFile(path.join(distPath, "index.html"));
        });
      }
    }

    // Use Railway's PORT environment variable or fallback to 5000
    const port = process.env.PORT || 5000;
    
    console.log(`🌐 Starting server on port ${port}...`);
    
    const serverInstance = server.listen({
      port,
      host: "0.0.0.0",
    }, () => {
      console.log(`✅ Server ready at http://0.0.0.0:${port}`);
      console.log(`📦 Environment: ${process.env.NODE_ENV}`);
      log(`serving on port ${port}`);
    });

    // Server error handling
    serverInstance.on('error', (error) => {
      console.error('🔥 Server error:', error);
    });

    serverInstance.on('close', () => {
      console.log('🛑 Server closed');
    });

    // Handle server-level errors
    serverInstance.on('clientError', (err, socket) => {
      console.error('🚫 Client error:', err);
      socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
    });

  } catch (error) {
    console.error('💥 Failed to start server:', error);
    process.exit(1);
  }
})();
