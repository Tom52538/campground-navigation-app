import type { Express } from "express";
import { createServer, type Server } from "http";
import { WeatherService } from "../client/src/lib/weatherService";
import { RoutingService } from "../client/src/lib/routingService";
import { readFileSync } from "fs";
import { join } from "path";

// Direct POI data access for Railway deployment
async function getPOIData(site: string) {
  try {
    const filename = site === 'zuhause' ? 'zuhause_1749652477995.geojson' : 'kamperland_1749651931880.geojson';
    const filePath = join(process.cwd(), 'attached_assets', filename);
    const data = readFileSync(filePath, 'utf-8');
    const geojson = JSON.parse(data);
    
    return geojson.features.map((feature: any) => {
      // Handle different geometry types properly
      let coordinates;
      if (feature.geometry.type === 'Point') {
        coordinates = {
          lat: feature.geometry.coordinates[1],
          lng: feature.geometry.coordinates[0]
        };
      } else if (feature.geometry.type === 'Polygon') {
        // Calculate centroid for polygons
        const coords = feature.geometry.coordinates[0];
        const lats = coords.map((c: number[]) => c[1]);
        const lngs = coords.map((c: number[]) => c[0]);
        coordinates = {
          lat: lats.reduce((a: number, b: number) => a + b) / lats.length,
          lng: lngs.reduce((a: number, b: number) => a + b) / lngs.length
        };
      } else {
        // Fallback for other geometry types
        coordinates = {
          lat: 51.5886,
          lng: 3.7160
        };
      }

      return {
        id: feature.properties.id || feature.id || `feature_${Math.random()}`,
        name: feature.properties.name || feature.properties.Name || 'Unnamed Location',
        category: feature.properties.amenity || feature.properties.tourism || feature.properties.leisure || 'general',
        coordinates,
        description: feature.properties.description || '',
        amenities: feature.properties.amenities ? feature.properties.amenities.split(',') : [],
        hours: feature.properties.hours || feature.properties.opening_hours || ''
      };
    });
  } catch (error) {
    console.error(`Error loading POI data for ${site}:`, error);
    return [];
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  const weatherService = new WeatherService(
    process.env.OPENWEATHER_API_KEY || process.env.WEATHER_API_KEY || ""
  );
  
  const routingService = new RoutingService(
    process.env.OPENROUTE_API_KEY || process.env.ROUTING_API_KEY || ""
  );

  // Simple polyline decoder for OpenRouteService
  function decodePolyline(encoded: string): number[][] {
    const coordinates: number[][] = [];
    let index = 0;
    let lat = 0;
    let lng = 0;

    while (index < encoded.length) {
      let shift = 0;
      let result = 0;
      let byte: number;

      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      const deltaLat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += deltaLat;

      shift = 0;
      result = 0;

      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      const deltaLng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += deltaLng;

      coordinates.push([lng / 1e5, lat / 1e5]);
    }

    return coordinates;
  }

  // Weather API endpoint
  app.get("/api/weather", async (req, res) => {
    try {
      const { lat, lng } = req.query;
      
      if (!lat || !lng) {
        return res.status(400).json({ error: "Latitude and longitude are required" });
      }

      const weatherData = await weatherService.getCurrentWeather(
        parseFloat(lat as string),
        parseFloat(lng as string)
      );

      const response = {
        temperature: Math.round(weatherData.main.temp),
        condition: weatherData.weather[0].main,
        humidity: weatherData.main.humidity,
        windSpeed: weatherData.wind.speed,
        icon: weatherService.getWeatherIcon(weatherData.weather[0].icon)
      };

      res.json(response);
    } catch (error) {
      console.error("Weather API error:", error);
      res.status(500).json({ error: "Failed to fetch weather data" });
    }
  });

  // POI endpoints
  app.get("/api/pois", async (req, res) => {
    try {
      const site = req.query.site || 'kamperland';
      const pois = await getPOIData(site as string);
      res.json(pois);
    } catch (error) {
      console.error("POI API error:", error);
      res.status(500).json({ error: "Failed to fetch POI data" });
    }
  });

  // POI search endpoint
  app.get("/api/pois/search", async (req, res) => {
    try {
      const { q: query, category, site } = req.query;
      
      // Get POIs for the specific site directly from data files
      const siteName = (site as string) || 'kamperland';
      const allPOIs = await getPOIData(siteName);
      
      let filteredPOIs = allPOIs;
      
      // Filter by category if specified
      if (category) {
        filteredPOIs = filteredPOIs.filter((poi: any) => poi.category === category);
      }
      
      // Filter by search query if specified
      if (query) {
        const searchTerm = (query as string).toLowerCase();
        filteredPOIs = filteredPOIs.filter((poi: any) => 
          poi.name.toLowerCase().includes(searchTerm) ||
          poi.description?.toLowerCase().includes(searchTerm) ||
          poi.category.toLowerCase().includes(searchTerm)
        );
      }
      
      res.json(filteredPOIs);
    } catch (error) {
      console.error("POI search error:", error);
      res.status(500).json({ error: "Failed to search POIs" });
    }
  });

  // Routing endpoint
  app.post("/api/route", async (req, res) => {
    try {
      const { from, to } = req.body;
      
      if (!from || !to || !from.lat || !from.lng || !to.lat || !to.lng) {
        return res.status(400).json({ error: "Valid start and end coordinates are required" });
      }

      const routeData = await routingService.getDirections({
        start: [from.lng, from.lat],
        end: [to.lng, to.lat]
      });

      const route = routeData.routes[0];
      const instructions = route.segments.flatMap((segment: any) => 
        segment.steps.map((step: any) => ({
          instruction: step.instruction,
          distance: routingService.formatDistance(step.distance),
          duration: routingService.formatDuration(step.duration)
        }))
      );

      // Decode geometry for route display
      let geometry: number[][];
      if (typeof route.geometry === 'string') {
        geometry = decodePolyline(route.geometry);
      } else {
        geometry = route.geometry;
      }

      const response = {
        totalDistance: routingService.formatDistance(route.summary.distance),
        estimatedTime: routingService.formatDuration(route.summary.duration),
        arrivalTime: routingService.formatArrivalTime(route.summary.duration),
        instructions,
        geometry: geometry,
        nextInstruction: instructions[0] || null
      };

      res.json(response);
    } catch (error) {
      console.error("Routing API error:", error);
      res.status(500).json({ error: "Failed to calculate route" });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      services: {
        weather: !!process.env.OPENWEATHER_API_KEY || !!process.env.WEATHER_API_KEY,
        routing: !!process.env.OPENROUTE_API_KEY || !!process.env.ROUTING_API_KEY
      }
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}