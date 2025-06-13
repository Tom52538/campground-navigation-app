# Campground Navigation App

A professional React-TypeScript campground navigation app designed for mobile-first outdoor exploration, offering advanced routing, discovery, and interactive features for nature enthusiasts.

## Core Features

### Navigation & Routing
- **Real-time Turn-by-Turn Navigation**: Professional routing with OpenRouteService API
- **Multi-Modal Routing**: Walking, cycling, and driving directions
- **Route Visualization**: Interactive polylines with step-by-step instructions
- **Distance & Time Calculations**: Accurate arrival time estimates
- **Voice Guidance**: Audio navigation prompts at waypoints

### Point of Interest (POI) System
- **Dynamic POI Discovery**: Search restaurants, facilities, recreation areas
- **Category-Based Filtering**: Food & drink, services, recreation, facilities
- **Real-time Distance Calculation**: Live distance updates to POIs
- **Detailed POI Information**: Contact details, amenities, descriptions
- **Interactive Map Markers**: Custom category-specific icons

### Weather & Environmental Data
- **Live Weather Integration**: OpenWeatherMap API with real-time conditions
- **Camping-Specific Alerts**: Temperature, wind, UV, and weather warnings
- **Location-Based Forecasts**: Weather data for current position
- **Visual Weather Indicators**: Temperature display and condition icons

### Advanced Mobile Features
- **Gesture-Based Controls**: Swipe navigation between panels
- **Touch-Optimized Interface**: Mobile-first design with proper touch targets
- **GPS Integration**: Real GPS positioning with mock mode for testing
- **Responsive Map Controls**: Zoom, center, and location controls
- **Progressive Web App**: Offline-capable with service worker support

## Technology Stack

- **Frontend**: React 18 with TypeScript, Vite build system
- **UI Framework**: Shadcn/UI components with Tailwind CSS
- **Mapping Engine**: React Leaflet with OpenStreetMap tiles
- **Routing Service**: OpenRouteService API for professional navigation
- **Weather Service**: OpenWeatherMap API for meteorological data
- **State Management**: TanStack Query v5 for server state
- **Backend**: Express.js with TypeScript and in-memory storage
- **Data Processing**: GeoJSON transformation and spatial calculations

## Test Locations & Data

### Kamperland (Netherlands)
- **Location**: 51.589795, 3.721826 (Zeeland Province)
- **POI Coverage**: 50+ authentic locations including swimming pools, restaurants, beach facilities
- **Data Source**: OpenStreetMap GeoJSON with real Dutch coordinates
- **Features**: Coastal campground with water sports, dining, and recreational amenities

### Zuhause (Germany) 
- **Location**: 51.001654, 6.051040 (North Rhine-Westphalia)
- **POI Coverage**: Urban area with Restaurant DALMACIJA, local services, and community facilities
- **Data Source**: Authentic German location data with proper street names
- **Features**: Residential area with local businesses and essential services

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager
- API keys for external services (see Environment Variables)

### Installation & Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Access application
open http://localhost:5000
```

### Environment Variables
Create a `.env` file in the root directory:

```env
# Required for routing functionality
OPENROUTE_API_KEY=your_openroute_service_key

# Required for weather data
OPENWEATHER_API_KEY=your_openweather_api_key

# Optional: Development settings
NODE_ENV=development
```

## User Guide

### Basic Navigation
1. **Site Selection**: Toggle between Kamperland and Zuhause using the site selector
2. **POI Discovery**: Use the search bar to find specific locations or services
3. **Category Filtering**: Apply filters for food & drink, services, recreation, facilities
4. **Route Planning**: Tap any POI to view details and start navigation
5. **GPS Control**: Switch between mock positioning (testing) and real GPS

### Advanced Features
- **Gesture Navigation**: Swipe between different app panels
- **Weather Monitoring**: View current conditions and camping-specific alerts
- **Multi-Modal Routing**: Choose between walking, cycling, or driving directions
- **Real-Time Updates**: Live distance calculations and weather data refresh

## Architecture Overview

### Component Structure
```
client/src/
├── components/
│   ├── Map/              # Leaflet map integration and controls
│   ├── Navigation/       # UI components for search, POI, weather
│   └── ui/              # Shadcn/UI base components
├── hooks/               # Custom React hooks for location, POI, weather
├── lib/                 # Utility functions and API clients
├── pages/               # Main application pages
└── types/               # TypeScript definitions

server/
├── data/                # GeoJSON POI data for test locations
├── lib/                 # Backend utilities and transformers
├── routes.ts            # API endpoints for POI, weather, routing
└── index.ts             # Express server configuration
```

### Data Flow
1. **POI Data**: GeoJSON → Transformer → API → React Query → Components
2. **Weather Data**: OpenWeatherMap API → Backend → Frontend Cache → UI
3. **Routing**: OpenRouteService API → Route Calculator → Map Visualization
4. **Location**: GPS/Mock → Position Hook → Map Center + Distance Calculations

## API Endpoints

- `GET /api/pois?site=kamperland|zuhause` - Retrieve POI data for specified site
- `GET /api/weather?lat={lat}&lng={lng}` - Get weather data for coordinates
- `POST /api/route` - Calculate route between two points
- `GET /api/search?q={query}&site={site}&category={category}` - Search POIs

## Development Notes

### Known Limitations
- Weather data requires valid API key for real-time updates
- Route calculations depend on OpenRouteService availability
- POI data is currently limited to two test locations
- GPS functionality requires HTTPS in production

### Performance Considerations
- Map tiles cached for offline usage
- POI data loaded on site selection to minimize initial load
- Weather data refreshed every 15 minutes
- Route calculations debounced to prevent API rate limiting

## Deployment

The application is configured for deployment on Replit with automatic workflow management. The Express server serves both API endpoints and the built React application on a single port.
