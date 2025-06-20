import type { Express } from "express";
import { createServer, type Server } from "http";
import { WeatherService } from "../client/src/lib/weatherService";
import { RoutingService } from "../client/src/lib/routingService";
import { readFileSync } from "fs";
import { join } from "path";


// Category mapping for campsite navigation
const categoryMapping: Record<string, string> = {
  'restaurant': 'food-drink',
  'cafe': 'food-drink',
  'bar': 'food-drink',
  'pub': 'food-drink',
  'fast_food': 'food-drink',
  'shop': 'services',
  'pharmacy': 'services',
  'bank': 'services',
  'atm': 'services',
  'information': 'services',
  'fuel': 'services',
  'supermarket': 'services',
  'swimming_pool': 'recreation',
  'playground': 'recreation',
  'sports_centre': 'recreation',
  'attraction': 'recreation',
  'parking': 'facilities',
  'toilets': 'facilities',
  'waste_disposal': 'facilities',
  'bicycle_parking': 'facilities'
};

// Load authentic OpenStreetMap POI data
async function getPOIData(site: string) {
  try {
    const filename = site === 'zuhause' ? 'zuhause_pois.geojson' : 'kamperland_pois.geojson';
    const filePath = join(process.cwd(), 'server', 'data', filename);
    const data = readFileSync(filePath, 'utf-8');
    const geojson = JSON.parse(data);
    
    return geojson.features
      .filter((feature: any) => feature.properties?.name) // Only named features
      .map((feature: any, index: number) => {
        // Extract coordinates from geometry
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
          // Skip unsupported geometry types
          return null;
        }

        // Categorize using OSM tags
        const props = feature.properties;
        let category = 'services'; // default
        
        if (props.amenity && categoryMapping[props.amenity]) {
          category = categoryMapping[props.amenity];
        } else if (props.leisure && categoryMapping[props.leisure]) {
          category = categoryMapping[props.leisure];
        } else if (props.tourism && categoryMapping[props.tourism]) {
          category = categoryMapping[props.tourism];
        } else if (props.shop) {
          category = 'services';
        }

        // Extract amenities
        const amenities = [];
        if (props.cuisine) amenities.push(`Cuisine: ${props.cuisine}`);
        if (props.phone) amenities.push(`Phone: ${props.phone}`);
        if (props.website) amenities.push(`Website: ${props.website}`);
        if (props['addr:street'] && props['addr:housenumber']) {
          amenities.push(`Address: ${props['addr:housenumber']} ${props['addr:street']}`);
        }

        return {
          id: feature.id?.toString() || `${site}_${index}`,
          name: props.name,
          category,
          coordinates,
          description: [props.amenity, props.leisure, props.tourism, props.shop]
            .filter(Boolean)
            .join(', ') || 'Point of interest',
          amenities: amenities.length > 0 ? amenities : undefined,
          hours: props.opening_hours || props['opening_hours:restaurant'] || undefined
        };
      })
      .filter(Boolean); // Remove null entries
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

      // Create route request with German language for OpenRouteService
      const routeData = await routingService.getRoute({
        coordinates: [[from.lng, from.lat], [to.lng, to.lat]],
        profile: 'foot-walking',
        language: 'de', // Request German instructions directly
        units: 'm',
        instructions: true,
        geometry: true
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
        durationSeconds: route.summary.duration, // Send raw duration for client-side ETA calculation
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