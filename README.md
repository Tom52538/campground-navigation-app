# Campground Navigation App

A professional React-TypeScript campground navigation app designed for mobile-first experience, featuring advanced routing and discovery tools for outdoor enthusiasts.

## Features

- **Real-time Navigation**: Turn-by-turn directions with voice guidance
- **POI Discovery**: Search and filter points of interest by category
- **Multi-site Support**: Switch between Kamperland (Netherlands) and Zuhause (Germany) test locations
- **Weather Integration**: Live weather data for current location
- **Mobile-first Design**: Optimized for smartphone screens with responsive UI
- **GPS Toggle**: Switch between mock and real GPS positioning
- **Route Visualization**: Interactive map with route polylines and markers

## Technology Stack

- **Frontend**: React with TypeScript, Vite
- **UI Components**: Shadcn/UI with Tailwind CSS
- **Mapping**: React Leaflet with OpenStreetMap tiles
- **Routing**: OpenRouteService API for authentic turn-by-turn directions
- **Weather**: OpenWeatherMap API for live weather data
- **State Management**: TanStack Query for API state management
- **Backend**: Express.js with TypeScript

## Test Locations

### Kamperland (Netherlands)
- Coordinates: 51.589795, 3.721826
- Features: Swimming pool, restaurants, beach activities
- POIs: 50+ authentic locations with Dutch coordinates

### Zuhause (Germany) 
- Coordinates: 51.001654, 6.051040
- Features: Restaurant DALMACIJA, local services, facilities
- POIs: Authentic German locations with proper street names

## Installation

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:5000`

## Environment Variables

Required API keys:
- `OPENROUTE_API_KEY` - For routing and navigation
- `OPENWEATHER_API_KEY` - For weather data

## Usage

1. **Site Selection**: Use the dropdown to switch between Kamperland and Zuhause
2. **Search POIs**: Type in the search bar to find restaurants, activities, facilities
3. **Navigation**: Click on any POI marker to see details, then start navigation
4. **Ground Navigation**: Follow turn-by-turn directions with voice guidance
5. **GPS Toggle**: Switch between mock positioning and real GPS

## Navigation Features

- Real-time step-by-step instructions
- Distance and time calculations
- Voice announcements at waypoints
- Route progress tracking
- Street-level accuracy with authentic road names

## API Integration

- **OpenRouteService**: Provides authentic routing data with real street names
- **OpenWeatherMap**: Live weather conditions and forecasts
- **GeoJSON Data**: Authentic POI locations for both test sites

## Mobile Optimization

- Touch-friendly interface design
- Responsive layout for various screen sizes
- Optimized button positioning and sizing
- Transparent search overlay with proper contrast
- Efficient gesture handling and map controls

## Project Structure

```
├── client/src/
│   ├── components/     # React components
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utility libraries
│   ├── pages/         # Route pages
│   └── types/         # TypeScript definitions
├── server/            # Express backend
├── shared/            # Shared types and schemas
└── attached_assets/   # Test data and assets
```# Force Railway deployment of POI system
