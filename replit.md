# Campground Navigation App

## Overview

The Campground Navigation App is a professional React-TypeScript mobile-first application designed for outdoor enthusiasts visiting campgrounds and recreational sites. It provides real-time navigation, POI discovery, weather integration, and interactive mapping capabilities specifically tailored for camping environments.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite build system
- **UI Library**: Shadcn/UI components with Tailwind CSS styling
- **State Management**: TanStack Query v5 for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Mapping**: React Leaflet with OpenStreetMap tiles for interactive maps
- **Mobile-First Design**: Progressive Web App with responsive UI optimized for smartphones

### Backend Architecture
- **Runtime**: Node.js with Express.js TypeScript server
- **API Design**: RESTful endpoints with JSON responses
- **Data Storage**: In-memory storage with MemStorage abstraction layer
- **External Integrations**: OpenRouteService for routing, OpenWeatherMap for weather data
- **Build System**: Vite for client bundling, esbuild for server compilation

## Key Components

### Core Navigation Features
- **Real-time GPS Integration**: Live positioning with mock mode for testing
- **Multi-Modal Routing**: Walking, cycling, and driving directions via OpenRouteService
- **Turn-by-Turn Navigation**: Step-by-step instructions with distance calculations
- **POI Discovery System**: Category-based filtering and search functionality
- **Weather Integration**: Live weather conditions and camping-specific alerts

### Data Management
- **GeoJSON Processing**: Authentic OpenStreetMap POI data for test locations
- **Category Mapping**: OSM tags mapped to campground-relevant categories
- **Distance Calculations**: Real-time distance updates using Haversine formula
- **Route Geometry**: Polyline encoding/decoding for route visualization

### User Interface Components
- **MapContainer**: Interactive map with markers and route overlays
- **Navigation Panel**: Swipe-based panel system for different app modes
- **Search & Filter**: Real-time POI search with category filtering
- **Weather Widget**: Current conditions display with camping-relevant metrics
- **Mobile Controls**: Touch-optimized buttons and gesture navigation

## Data Flow

1. **Location Services**: GPS positioning (real or mocked) provides current coordinates
2. **POI Loading**: GeoJSON data loaded from server and processed into POI objects
3. **Search & Discovery**: User searches trigger filtered POI queries with distance calculations
4. **Route Planning**: Selected destinations trigger OpenRouteService API calls
5. **Navigation**: Route geometry displayed on map with turn-by-turn instructions
6. **Weather Updates**: Periodic OpenWeatherMap API calls for current conditions

## External Dependencies

### Required API Keys
- **OpenRouteService**: `OPENROUTE_API_KEY` for routing and directions
- **OpenWeatherMap**: `OPENWEATHER_API_KEY` for weather data integration

### Core Libraries
- **Mapping**: React Leaflet, Leaflet
- **UI Framework**: Radix UI primitives, Tailwind CSS
- **State Management**: TanStack Query, Wouter
- **HTTP Client**: Native fetch API with error handling
- **Build Tools**: Vite, TypeScript, esbuild

### Test Data Sources
- **Kamperland (Netherlands)**: Authentic OpenStreetMap GeoJSON data
- **Zuhause (Germany)**: Real-world POI data for testing German locations

## Deployment Strategy

### Railway Platform Configuration
- **Build Command**: `npm run build` (Vite client + esbuild server)
- **Start Command**: `npm start` (Production Express server)
- **Environment**: Node.js with automatic dependency installation
- **Static Serving**: Express serves built client files from `/dist/public`

### Production Optimizations
- **Asset Bundling**: Vite optimizes client assets with code splitting
- **Server Compilation**: esbuild bundles TypeScript server for production
- **Environment Variables**: API keys configured via Railway environment settings
- **Health Checks**: `/api/health` endpoint for service monitoring

### Deployment Files
- `railway.toml`: Railway deployment configuration
- `build.sh`: Production build script
- `start.sh`: Production server startup script
- Environment variable templates in documentation

## Changelog

- June 14, 2025. **MAJOR MILESTONE**: Completed full live navigation system implementation with all advanced features:
  - Real-time GPS tracking with adaptive battery optimization
  - Professional voice guidance with optimized speech synthesis
  - Automatic rerouting when going off-route
  - Speed monitoring with current and average speed display
  - Dynamic ETA updates based on actual movement patterns
  - Performance monitoring with battery, GPS accuracy, and memory usage tracking
  - Offline route storage using IndexedDB for backup access
  - Enhanced UI with transparent glass morphism design and real-time indicators
- June 14, 2025. Fixed UI layout overlapping issues - moved navigation panels from bottom to top positioning to prevent weather widget conflicts
- June 13, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.