
const express = require("express");
const { registerRoutes } = require("./routes");
const { setupVite, serveStatic, log } = require("./vite");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const requestPath = req.path;
  let capturedJsonResponse = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (requestPath.startsWith("/api")) {
      let logLine = `${req.method} ${requestPath} ${res.statusCode} in ${duration}ms`;
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
  try {
    log(`🚀 Starting CampCompass Navigation Server`);
    log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    log(`Working Directory: ${process.cwd()}`);
    log(`Server File Location: ${__dirname}`);
    
    const server = await registerRoutes(app);

    app.use((err, _req, res, _next) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ message });
      throw err;
    });

    if (process.env.NODE_ENV === "development") {
      await setupVite(app, server);
    } else {
      // Production static file serving - try multiple possible paths
      const possiblePaths = [
        "/app/dist/public",
        path.join(process.cwd(), "dist", "public"),
        path.join(__dirname, "..", "dist", "public"),
        "dist/public"
      ];
      
      let distPath = null;
      for (const testPath of possiblePaths) {
        if (fs.existsSync(testPath)) {
          distPath = testPath;
          log(`✅ Found build directory at: ${distPath}`);
          break;
        }
      }
      
      if (!distPath) {
        log(`❌ Build directory not found. Tried: ${possiblePaths.join(', ')}`);
        log(`Current working directory: ${process.cwd()}`);
        log(`Server location: ${__dirname}`);
        
        try {
          const rootContents = fs.readdirSync(process.cwd());
          log(`Root directory contents: ${rootContents.join(', ')}`);
          
          if (fs.existsSync('dist')) {
            const distContents = fs.readdirSync('dist');
            log(`Dist directory contents: ${distContents.join(', ')}`);
          }
        } catch (e) {
          log(`Error listing directories: ${e.message}`);
        }
        
        app.use("*", (req, res) => {
          if (req.path.startsWith('/api')) {
            return res.status(503).json({ message: 'Service temporarily unavailable - build not found' });
          }
          res.status(503).send(`
            <html>
              <body>
                <h1>Service Temporarily Unavailable</h1>
                <p>The application build was not found. Please check deployment logs.</p>
              </body>
            </html>
          `);
        });
      } else {
        app.use(express.static(distPath));
        
        app.use("*", (req, res) => {
          if (req.path.startsWith('/api')) {
            return res.status(404).json({ message: 'API endpoint not found' });
          }
          
          const indexPath = path.join(distPath, "index.html");
          if (fs.existsSync(indexPath)) {
            res.sendFile(indexPath);
          } else {
            res.status(503).send('<h1>Index file not found</h1>');
          }
        });
      }
    }

    const port = process.env.PORT || 5000;
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`✅ CampCompass Navigation Server running on port ${port}`);
      log(`🌐 Health check available at: http://0.0.0.0:${port}/api/health`);
    });
  } catch (startupError) {
    console.error('❌ CRITICAL STARTUP ERROR:', startupError);
    console.error('Stack trace:', startupError.stack);
    
    const port = process.env.PORT || 5000;
    app.get('*', (req, res) => {
      res.status(503).json({
        error: 'Server startup failed',
        details: startupError.message,
        timestamp: new Date().toISOString()
      });
    });
    
    app.listen(port, '0.0.0.0', () => {
      console.log(`⚠️ Emergency server running on port ${port} (startup failed)`);
    });
  }
})().catch(globalError => {
  console.error('❌ UNHANDLED STARTUP ERROR:', globalError);
  process.exit(1);
});

module.exports = app;
