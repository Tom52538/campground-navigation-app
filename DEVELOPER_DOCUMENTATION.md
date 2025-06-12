# Campground Navigation App - Developer Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Code Structure](#code-structure)
4. [Technology Stack](#technology-stack)
5. [Key Features](#key-features)
6. [API Integration](#api-integration)
7. [Development Workflow](#development-workflow)
8. [Railway Deployment Guide](#railway-deployment-guide)
9. [Environment Variables](#environment-variables)
10. [Testing & Debugging](#testing--debugging)

## Project Overview

The Campground Navigation App is a professional React-TypeScript mobile-first application designed for outdoor enthusiasts. It provides real-time navigation, POI discovery, weather integration, and advanced routing capabilities for campground exploration.

### Key Capabilities
- **Real-time Navigation**: Turn-by-turn directions with voice guidance
- **Multi-site Support**: Kamperland (Netherlands) and Zuhause (Germany) test locations
- **POI Discovery**: Search and filter points of interest by category
- **Weather Integration**: Live weather data using OpenWeatherMap API
- **Mobile-first Design**: Optimized for smartphone screens with responsive UI
- **GPS Integration**: Real GPS positioning with mock mode for testing

---

## Architecture

### Frontend Architecture
```
React + TypeScript + Vite
├── UI Components (Shadcn/UI + Tailwind CSS)
├── State Management (TanStack Query)
├── Routing (Wouter)
├── Mapping (React Leaflet + OpenStreetMap)
└── Mobile-First Responsive Design
```

### Backend Architecture
```
Express.js + TypeScript
├── RESTful API Endpoints
├── In-Memory Storage (MemStorage)
├── External API Integration (OpenRouteService, OpenWeatherMap)
└── Static File Serving
```

### Data Flow
```
Client Request → Express Server → External APIs → Data Processing → Client Response
```

---

## Code Structure

### Root Directory Structure
```
campground-navigation-app/
├── client/                     # Frontend React application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Map/           # Map-related components
│   │   │   ├── Navigation/    # Navigation UI components
│   │   │   └── ui/            # Shadcn UI components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Utility libraries
│   │   ├── pages/             # Application pages
│   │   └── types/             # TypeScript type definitions
│   └── index.html             # HTML entry point
├── server/                     # Backend Express application
│   ├── data/                  # Static data files (POIs, routes)
│   ├── index.ts               # Server entry point
│   ├── routes.ts              # API route handlers
│   ├── storage.ts             # Data storage abstraction
│   └── vite.ts                # Vite integration
├── shared/                     # Shared types and schemas
│   └── schema.ts              # Drizzle ORM schemas
├── railway.toml               # Railway deployment configuration
├── build.sh                   # Production build script
├── start.sh                   # Production start script
└── package.json               # Dependencies and scripts
```

### Key Components Breakdown

#### 1. Map Components (`client/src/components/Map/`)
- **MapContainer.tsx**: Main map component with Leaflet integration
- **POIMarker.tsx**: Point of interest markers with category-based styling

#### 2. Navigation Components (`client/src/components/Navigation/`)
- **GroundNavigation.tsx**: Turn-by-turn navigation interface
- **NavigationPanel.tsx**: Navigation control panel
- **TopBar.tsx**: Search and GPS controls
- **WeatherWidget.tsx**: Weather information display
- **CompassWidget.tsx**: Device orientation compass
- **CategoryFilter.tsx**: POI category filtering
- **SiteSelector.tsx**: Test site switching

#### 3. Custom Hooks (`client/src/hooks/`)
- **useLocation.ts**: Geolocation management
- **usePOI.ts**: Points of interest data fetching
- **useRouting.ts**: Route calculation and navigation
- **useWeather.ts**: Weather data integration

#### 4. Server Components (`server/`)
- **index.ts**: Express server setup and middleware
- **routes.ts**: API endpoint definitions
- **storage.ts**: In-memory data storage interface
- **vite.ts**: Frontend-backend integration

---

## Technology Stack

### Frontend Dependencies
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "typescript": "5.6.3",
  "vite": "^5.4.14",
  "@vitejs/plugin-react": "^4.3.2",
  "wouter": "^3.3.5",
  "@tanstack/react-query": "^5.60.5",
  "react-leaflet": "^4.2.1",
  "leaflet": "^1.9.4",
  "tailwindcss": "^3.4.17",
  "framer-motion": "^11.13.1",
  "lucide-react": "^0.453.0"
}
```

### Backend Dependencies
```json
{
  "express": "^4.21.2",
  "tsx": "^4.19.1",
  "drizzle-orm": "^0.39.1",
  "zod": "^3.24.2",
  "ws": "^8.18.0"
}
```

### UI Components
- **Shadcn/UI**: Modern React component library
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework

---

## Key Features

### 1. Multi-Site Support
The application supports two test locations:

**Kamperland (Netherlands)**
```typescript
const KAMPERLAND_COORDINATES: Coordinates = {
  lat: 51.589795,
  lng: 3.721826
};
```

**Zuhause (Germany)**
```typescript
const ZUHAUSE_COORDINATES: Coordinates = {
  lat: 51.001654,
  lng: 6.051040
};
```

### 2. POI Categories
```typescript
type POICategory = 'restaurants' | 'activities' | 'facilities' | 'services';

const POI_CATEGORIES: Record<POICategory, { icon: string; color: string; label: string }> = {
  restaurants: { icon: 'utensils', color: 'text-orange-600', label: 'Restaurants' },
  activities: { icon: 'zap', color: 'text-blue-600', label: 'Activities' },
  facilities: { icon: 'building', color: 'text-green-600', label: 'Facilities' },
  services: { icon: 'wrench', color: 'text-purple-600', label: 'Services' }
};
```

### 3. Navigation Features
- **Real-time GPS tracking**
- **Turn-by-turn directions**
- **Route visualization with polylines**
- **Voice guidance support**
- **Distance and ETA calculations**

### 4. Weather Integration
- **Current weather conditions**
- **Temperature and humidity**
- **Wind speed and direction**
- **Weather icons and descriptions**

---

## API Integration

### 1. OpenRouteService API
```typescript
export class RoutingService {
  private apiKey: string;
  private baseUrl = 'https://api.openrouteservice.org/v2';

  async getRoute(request: RouteRequest): Promise<RouteResponse> {
    const response = await fetch(`${this.baseUrl}/directions/driving-car`, {
      method: 'POST',
      headers: {
        'Authorization': this.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    });
    return response.json();
  }
}
```

### 2. OpenWeatherMap API
```typescript
export class WeatherService {
  private apiKey: string;
  private baseUrl = 'https://api.openweathermap.org/data/2.5';

  async getCurrentWeather(lat: number, lon: number): Promise<WeatherResponse> {
    const response = await fetch(
      `${this.baseUrl}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`
    );
    return response.json();
  }
}
```

### 3. Internal API Endpoints
```typescript
// GET /api/pois?site=kamperland&category=restaurants
// GET /api/weather?lat=51.589795&lng=3.721826
// POST /api/route - Calculate route between coordinates
// GET /api/health - Health check endpoint
```

---

## Development Workflow

### 1. Local Development Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Type checking
npm run check

# Production build
npm run build
```

### 2. Development Server
- **Frontend**: Vite dev server with hot reload
- **Backend**: Express server with tsx for TypeScript execution
- **Port**: Single port (5000) serves both frontend and backend
- **API**: Available at `/api/*` endpoints

### 3. Code Quality
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code linting and formatting
- **Tailwind CSS**: Utility-first styling
- **Component Architecture**: Modular, reusable components

---

## Railway Deployment Guide

### Prerequisites
1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Repository**: Code must be in a GitHub repository
3. **API Keys**: OpenRouteService and OpenWeatherMap API keys

### Deployment Workflow: Replit → GitHub → Railway

#### Step 1: GitHub Repository Setup
Your repository should be configured as:
- **Repository Name**: `campground-navigation-app`
- **Visibility**: Public (or private with Railway access)
- **Branch**: `main` (default)

#### Step 2: Railway Project Configuration

**2.1 Connect to Railway**
1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your `campground-navigation-app` repository

**2.2 Railway Auto-Detection**
Railway automatically detects:
- **Runtime**: Node.js
- **Build Command**: `npm run build`
- **Start Command**: `NODE_ENV=production tsx server/index.ts`

**2.3 Railway Configuration Files**

The project includes pre-configured Railway files:

**railway.toml**
```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "NODE_ENV=production tsx server/index.ts"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

**build.sh**
```bash
#!/bin/bash
set -e

echo "Building client application..."
npm run build

echo "Build completed successfully!"
```

**start.sh**
```bash
#!/bin/bash
set -e

echo "Starting production server..."
NODE_ENV=production tsx server/index.ts
```

#### Step 3: Environment Variables Configuration

**3.1 Required Environment Variables**
Set these in Railway's environment variables section:

```env
NODE_ENV=production
OPENROUTE_API_KEY=your_openroute_service_api_key
OPENWEATHER_API_KEY=your_openweather_api_key
PORT=3000
```

**3.2 API Key Setup**

**OpenRouteService API Key:**
1. Visit [openrouteservice.org](https://openrouteservice.org)
2. Create account and generate API key
3. Add to Railway environment variables

**OpenWeatherMap API Key:**
1. Visit [openweathermap.org](https://openweathermap.org/api)
2. Create account and generate API key
3. Add to Railway environment variables

#### Step 4: Deployment Process

**4.1 Automatic Deployment**
Railway automatically:
1. Detects code changes in GitHub
2. Triggers build process
3. Runs `npm install`
4. Executes `npm run build`
5. Starts server with `NODE_ENV=production tsx server/index.ts`

**4.2 Build Process Details**
```bash
# Railway executes these commands automatically:
npm install                          # Install dependencies
npm run build                        # Build client and server
NODE_ENV=production tsx server/index.ts  # Start production server
```

**4.3 Production Server Configuration**
```typescript
// server/index.ts - Production configuration
const port = process.env.PORT || 3000;
const host = '0.0.0.0'; // Railway requires 0.0.0.0 binding

app.listen(port, host, () => {
  console.log(`Server running on http://${host}:${port}`);
});
```

#### Step 5: Post-Deployment Verification

**5.1 Health Checks**
Test these endpoints after deployment:
```bash
# Health check
curl https://your-app.railway.app/api/health

# POI data
curl https://your-app.railway.app/api/pois?site=kamperland

# Weather data
curl https://your-app.railway.app/api/weather?lat=51.589795&lng=3.721826
```

**5.2 Frontend Verification**
- Navigate to your Railway app URL
- Test navigation features
- Verify map loading and POI display
- Test route calculation
- Check weather widget functionality

#### Step 6: Continuous Deployment Setup

**6.1 GitHub Integration**
Railway automatically deploys when:
- Code is pushed to `main` branch
- Pull requests are merged
- Repository is updated

**6.2 Deployment Monitoring**
Monitor deployments in Railway dashboard:
- Build logs
- Runtime logs
- Performance metrics
- Error tracking

---

## Environment Variables

### Development Environment (.env.local)
```env
NODE_ENV=development
OPENROUTE_API_KEY=your_development_key
OPENWEATHER_API_KEY=your_development_key
```

### Production Environment (Railway)
```env
NODE_ENV=production
OPENROUTE_API_KEY=your_production_key
OPENWEATHER_API_KEY=your_production_key
PORT=3000
```

### Environment Variable Usage
```typescript
// Client-side (Vite environment variables)
const apiKey = import.meta.env.VITE_API_KEY;

// Server-side (Node.js environment variables)
const apiKey = process.env.OPENROUTE_API_KEY;
```

---

## Testing & Debugging

### 1. Development Testing
```bash
# Start development server
npm run dev

# Test API endpoints
curl http://localhost:5000/api/health
curl http://localhost:5000/api/pois?site=kamperland
```

### 2. Production Testing
```bash
# Build for production
npm run build

# Start production server
npm start

# Test production build
curl http://localhost:3000/api/health
```

### 3. Common Issues & Solutions

**Issue: Map not loading**
- Check Leaflet CSS imports
- Verify map container dimensions
- Ensure coordinates are valid

**Issue: API requests failing**
- Verify API keys are set correctly
- Check CORS configuration
- Validate request parameters

**Issue: Routes not calculating**
- Confirm OpenRouteService API key
- Check coordinate format (lng, lat order)
- Verify network connectivity

### 4. Logging & Monitoring

**Development Logging**
```typescript
console.log('[DEBUG]', 'Component mounted');
console.error('[ERROR]', 'API request failed', error);
```

**Production Monitoring**
- Railway provides built-in logging
- Monitor API response times
- Track error rates and patterns

---

## Performance Optimization

### 1. Bundle Optimization
- **Code Splitting**: Vite automatically splits code
- **Tree Shaking**: Unused code is eliminated
- **Asset Optimization**: Images and CSS are optimized

### 2. API Optimization
- **Request Caching**: TanStack Query provides caching
- **Debounced Searches**: Prevent excessive API calls
- **Lazy Loading**: Load components when needed

### 3. Mobile Performance
- **Responsive Images**: Optimized for different screen sizes
- **Touch Optimization**: Touch-friendly controls
- **PWA Features**: Offline capability and app-like experience

---

## Security Considerations

### 1. API Key Security
- Server-side API key storage
- Environment variable protection
- No client-side exposure of sensitive keys

### 2. CORS Configuration
```typescript
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.railway.app']
    : ['http://localhost:5173'],
  credentials: true
}));
```

### 3. Input Validation
```typescript
const coordinateSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180)
});
```

---

## Maintenance & Updates

### 1. Dependency Updates
```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Security audit
npm audit
```

### 2. API Monitoring
- Monitor API usage limits
- Track response times
- Set up alerting for failures

### 3. Feature Development
- Follow component-based architecture
- Maintain TypeScript strict mode
- Add comprehensive error handling

---

This documentation provides a complete guide for developers working on the Campground Navigation App, from local development to Railway deployment. The app is production-ready with proper error handling, security measures, and performance optimizations.