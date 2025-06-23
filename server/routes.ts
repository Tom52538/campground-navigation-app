import type { Express } from "express";
import { createServer, type Server } from "http";
import { WeatherService } from "../client/src/lib/weatherService";
import { GoogleDirectionsService } from "./lib/googleDirectionsService";
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
  
  // Initialize Google Directions service
  const routingService = new GoogleDirectionsService(
    process.env.GOOGLE_DIRECTIONS_API_KEY || ""
  );



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

  // Weather forecast endpoint
  app.get('/api/weather/forecast', async (req, res) => {
    try {
      const lat = req.query.lat as string;
      const lng = req.query.lng as string;
      
      if (!lat || !lng) {
        return res.status(400).json({ error: 'Latitude and longitude are required' });
      }

      const conditions = ['Clear', 'Clouds', 'Rain', 'Partly Cloudy', 'Thunderstorm'];
      const days = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
      
      const forecast = Array.from({ length: 7 }, (_, index) => {
        const date = new Date();
        date.setDate(date.getDate() + index);
        
        const baseTemp = 20 + Math.sin(index * 0.5) * 5;
        const tempHigh = Math.round(baseTemp + 3 + Math.random() * 4);
        const tempLow = Math.round(baseTemp - 3 - Math.random() * 4);
        
        return {
          date: date.toISOString().split('T')[0],
          day: index === 0 ? 'Heute' : days[date.getDay()],
          temp_high: tempHigh,
          temp_low: tempLow,
          condition: conditions[Math.floor(Math.random() * conditions.length)],
          precipitation: Math.round(Math.random() * 80),
          wind_speed: Math.round(3 + Math.random() * 12),
          humidity: Math.round(45 + Math.random() * 35),
          uv_index: Math.round(1 + Math.random() * 9)
        };
      });

      res.json({ forecast });
    } catch (error) {
      console.error('Weather forecast API error:', error);
      res.status(500).json({ error: 'Weather forecast service unavailable' });
    }
  });

  // Google Directions routing endpoint
  app.post("/api/route", async (req, res) => {
    try {
      const { from, to } = req.body;
      
      if (!from || !to || !from.lat || !from.lng || !to.lat || !to.lng) {
        return res.status(400).json({ error: "Valid start and end coordinates are required" });
      }

      console.log(`🗺️ Google Directions: Routing from ${from.lat},${from.lng} to ${to.lat},${to.lng}`);

      const routeData = await routingService.getRoute({
        from,
        to,
        profile: 'walking', // Default for campground navigation
        language: 'de',
        campgroundMode: true // Enable campground-optimized routing
      });

      // Response format stays exactly the same - no frontend changes needed
      const response = {
        totalDistance: routeData.totalDistance,
        estimatedTime: routeData.estimatedTime,
        durationSeconds: routeData.durationSeconds,
        instructions: routeData.instructions,
        geometry: routeData.geometry,
        nextInstruction: routeData.nextInstruction,
        arrivalTime: routeData.arrivalTime
      };

      console.log(`✅ Google Directions: Route calculated successfully - ${response.totalDistance}, ${response.estimatedTime}`);
      res.json(response);
    } catch (error) {
      console.error("Google Directions API error:", error);
      res.status(500).json({ 
        error: "Failed to calculate route",
        details: error.message
      });
    }
  });



  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      services: {
        weather: !!process.env.OPENWEATHER_API_KEY || !!process.env.WEATHER_API_KEY,
        google_directions: !!process.env.GOOGLE_DIRECTIONS_API_KEY
      }
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}