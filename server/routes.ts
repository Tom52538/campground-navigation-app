import type { Express } from "express";
import { createServer, type Server } from "http";
import { WeatherService } from "../client/src/lib/weatherService";
import { GoogleDirectionsService } from "./lib/googleDirectionsService";
import { readFileSync } from "fs";
import { join } from "path";


// Category mapping for campsite navigation
const osmCategoryMapping: Record<string, string> = {
  'restaurant': 'food-drink',
  'cafe': 'food-drink',
  'bar': 'food-drink',
  'pub': 'food-drink',
  'fast_food': 'food-drink',
  'shop': 'services',
  'pharmacy': 'necessities',
  'bank': 'services',
  'atm': 'services',
  'information': 'services',
  'fuel': 'services',
  'supermarket': 'services',
  'swimming_pool': 'leisure',
  'playground': 'leisure',
  'sports_centre': 'leisure',
  'attraction': 'leisure',
  'parking': 'parking',
  'toilets': 'services',
  'waste_disposal': 'services',
  'bicycle_parking': 'services',
  'marina': 'services',
  'first_aid': 'necessities',
  'clinic': 'necessities',
  'hospital': 'necessities',
};

const buildingCategoryMapping: Record<string, string> = {
  'static_caravan': 'facilities',
  'bungalow': 'buildings',
  'house': 'buildings',
  'retail': 'services',
  'office': 'services',
  'commercial': 'services',
  'shed': 'facilities',
  'industrial': 'services',
  'beach_house': 'buildings',
  'chalet': 'buildings',
  'lodge': 'buildings',
  'bungalow_water': 'buildings',
  'yes': 'buildings',
  'toilets': 'facilities',
  'service': 'facilities',
  'semidetached_house': 'buildings',
  'detached': 'buildings',
  'garage': 'facilities',
};

// Load authentic OpenStreetMap POI data
async function getPOIData(site: string) {
  try {
    const poiFilenames = site === 'zuhause' ? ['zuhause_pois.geojson'] : site === 'beach_resort' ? ['Beach Resort Zentroide Layer.geojson'] : ['kamperland_pois.geojson'];
    
    let allPois: any[] = [];

    for (const filename of poiFilenames) {
      const filePath = join(process.cwd(), 'server', 'data', filename);
      const data = readFileSync(filePath, 'utf-8');
      const geojson = JSON.parse(data);

      const pois = geojson.features.map((feature: any, index: number) => {
        const props = feature.properties;
        let name = props.name;
        let category = 'unknown';

        if (filename === 'Beach Resort Zentroide Layer.geojson') {
          const buildingType = props.BUILDING;
          const houseNumber = props.A_HSNMBR;
          const poiName = props.NAME;
          
          if (buildingType || poiName) {
            if (buildingType && houseNumber) {
              name = buildingType === 'static_caravan' ? `Stellplatz ${houseNumber}` : `${buildingType} ${houseNumber}`;
            } else if (poiName) {
              name = poiName;
            } else if (buildingType) {
              name = buildingType.charAt(0).toUpperCase() + buildingType.slice(1);
            } else {
              name = 'Beach Resort POI';
            }
            category = buildingCategoryMapping[buildingType] || 'buildings';
            console.log(`Beach Resort POI: ${name}, Building: ${buildingType}, Category: ${category}`);
          }
        } else {
          if (props.amenity && osmCategoryMapping[props.amenity]) {
            category = osmCategoryMapping[props.amenity];
          } else if (props.leisure && osmCategoryMapping[props.leisure]) {
            category = osmCategoryMapping[props.leisure];
          } else if (props.tourism && osmCategoryMapping[props.tourism]) {
            category = osmCategoryMapping[props.tourism];
          } else if (props.shop) {
            category = 'services';
          } else if (props.building && buildingCategoryMapping[props.building]) {
            category = buildingCategoryMapping[props.building];
          }
        }

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
          name: name,
          category,
          coordinates,
          description: [props.amenity, props.leisure, props.tourism, props.shop]
            .filter(Boolean)
            .join(', ') || 'Point of interest',
          amenities: amenities.length > 0 ? amenities : undefined,
          hours: props.opening_hours || props['opening_hours:restaurant'] || undefined
        };
      }).filter(Boolean);
      allPois = allPois.concat(pois);
    }

    return allPois.filter(poi => {
      if (!poi) return false;
      
      // Always include POIs with valid names
      if (poi.name && poi.name.trim() !== '') return true;
      
      // Include POIs with important properties
      const props = poi.properties;
      if (props?.amenity || props?.leisure || props?.tourism || props?.shop) return true;
      
      // For Beach Resort, include building-based POIs
      if (poi.category && poi.category !== 'unknown') return true;
      
      return false;
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

      // Check if API key is available
      const apiKey = process.env.OPENWEATHER_API_KEY || process.env.WEATHER_API_KEY;
      if (!apiKey) {
        // Return mock weather data for development
        const mockResponse = {
          temperature: 22,
          condition: "Clear",
          humidity: 65,
          windSpeed: 2.5,
          icon: "☀️"
        };
        return res.json(mockResponse);
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
      // Return mock data as fallback
      const fallbackResponse = {
        temperature: 20,
        condition: "Partly Cloudy",
        humidity: 70,
        windSpeed: 1.8,
        icon: "⛅"
      };
      res.json(fallbackResponse);
    }
  });

  // POI endpoints
  app.get("/api/pois", async (req, res) => {
    try {
      const site = req.query.site || 'kamperland';
      const pois = await getPOIData(site as string);
      console.log(`POI API: Loaded ${pois.length} POIs for site ${site}`);
      if (site === 'beach_resort') {
        const categoryCount = pois.reduce((acc, poi) => {
          acc[poi.category] = (acc[poi.category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        console.log('Beach Resort POI categories:', categoryCount);
      }
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
      const { from, to, profile = 'walking' } = req.body;
      
      if (!from || !to || !from.lat || !from.lng || !to.lat || !to.lng) {
        return res.status(400).json({ error: "Valid start and end coordinates are required" });
      }

      console.log(`🗺️ Google Directions: Routing from ${from.lat},${from.lng} to ${to.lat},${to.lng}`);

      const apiKey = process.env.GOOGLE_DIRECTIONS_API_KEY;
      if (!apiKey) {
        throw new Error('Google Directions API key not configured');
      }

      const googleDirections = new GoogleDirectionsService(apiKey);
      const routeData = await googleDirections.getRoute({
        from,
        to,
        profile, // Use requested travel mode
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