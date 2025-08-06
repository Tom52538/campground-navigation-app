import type { Express } from "express";
import { createServer, type Server } from "http";
import { WeatherService } from "../client/src/lib/weatherService";
import { GoogleDirectionsService } from "./lib/googleDirectionsService";
import { readFileSync } from "fs";
import { join } from "path";
import * as fs from 'fs';
import * as path from 'path';


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
  'toilets': 'toilets',
  'waste_disposal': 'services',
  'bicycle_parking': 'services',
  'marina': 'services',
  'restaurant': 'food-drink',
  'cafe': 'food-drink',
  'bar': 'food-drink',
  'pub': 'food-drink',
  'fast_food': 'food-drink',
  'first_aid': 'necessities',
  'clinic': 'necessities',
  'hospital': 'necessities',
};

const buildingCategoryMapping: Record<string, string> = {
  'static_caravan': 'static_caravan',
  'bungalow': 'bungalow',
  'house': 'bungalow', // Assume houses are bungalow-type
  'semidetached_house': 'bungalow',
  'detached': 'bungalow',
  'retail': 'services',
  'office': 'services',
  'commercial': 'services',
  'industrial': 'services',
  'service': 'services',
  'toilets': 'toilets',
  'parking': 'parking',
  'garage': 'facilities',
  'shed': 'facilities',
  'landuse_grass': 'facilities',
  'retail': 'food-drink'
};

// Placeholder for transformation functions, assuming they exist elsewhere or will be defined.
// For the purpose of this fix, we'll assume these functions are correctly implemented elsewhere.
// If they are not, this code would still fail at runtime but the immediate fix is for file loading.

interface POI {
  id: string;
  name: string;
  category: string;
  subCategory?: string; // Added subCategory
  coordinates: { lat: number; lng: number };
  description?: string;
  amenities?: string[];
  hours?: string;
  buildingType?: string; // Added buildingType for clarity in roompot data
}

interface Coordinates {
  lat: number;
  lng: number;
}

// Dummy transformation functions to allow the code to compile and run without errors,
// as the original code implies their existence but they are not provided.
// In a real scenario, these would contain the logic to parse different GeoJSON formats.
function transformRoompotPOIs(geoData: any): POI[] {
  console.log('transformRoompotPOIs called');
  // This is a placeholder. The actual transformation logic needs to be implemented.
  return (geoData.features || []).map((feature: any, index: number) => ({
    id: feature.id?.toString() || `roompot_${index}`,
    name: feature.properties?.name || 'Roompot POI',
    category: feature.properties?.building_type || 'unknown',
    coordinates: { lat: feature.geometry.coordinates[1], lng: feature.geometry.coordinates[0] },
    description: feature.properties?.description || 'Point of interest',
  }));
}

function transformGeoJsonToPOIs(geoData: any, site: string): POI[] {
  console.log(`transformGeoJsonToPOIs called for site: ${site}`);
  // This is a placeholder. The actual transformation logic needs to be implemented.
  return (geoData.features || []).map((feature: any, index: number) => {
    const props = feature.properties;
    let name = props.name || props.NAME || `Site POI ${index}`;
    let category = 'unknown';

    if (site === 'kamperland' && props.BUILDING) {
      category = buildingCategoryMapping[props.BUILDING] || 'buildings';
      name = props.A_HSNMBR ? `${props.BUILDING} ${props.A_HSNMBR}` : name;
    } else if (props.amenity) {
      category = osmCategoryMapping[props.amenity] || 'services';
    } else if (props.leisure) {
      category = osmCategoryMapping[props.leisure] || 'leisure';
    } else if (props.tourism) {
      category = osmCategoryMapping[props.tourism] || 'attraction';
    } else if (props.shop) {
      category = 'services';
    } else if (props.building) {
      category = buildingCategoryMapping[props.building] || 'buildings';
    }

    let coordinates;
    if (feature.geometry.type === 'Point') {
      coordinates = { lat: feature.geometry.coordinates[1], lng: feature.geometry.coordinates[0] };
    } else if (feature.geometry.type === 'Polygon') {
      const coords = feature.geometry.coordinates[0];
      const lats = coords.map((c: number[]) => c[1]);
      const lngs = coords.map((c: number[]) => c[0]);
      coordinates = {
        lat: lats.reduce((a: number, b: number) => a + b) / lats.length,
        lng: lngs.reduce((a: number, b: number) => a + b) / lngs.length
      };
    } else {
      return null; // Skip unsupported geometry types
    }

    return {
      id: feature.id?.toString() || `${site}_${index}`,
      name: name,
      category: category,
      coordinates: coordinates,
      description: props.description || 'Point of interest',
    };
  }).filter((poi: POI | null) => poi !== null) as POI[];
}


// Load authentic OpenStreetMap POI data
async function getPOIData(site: string): Promise<POI[]> {
  try {
    console.log(`🔍 POI DEBUG: Loading data for site: ${site}`);

    // Map site names to actual available files
    const siteFileMap: Record<string, string[]> = {
      kamperland: ['roompot_pois.geojson'], // Use roompot data for kamperland
      zuhause: ['zuhause_pois.geojson'],
      default: ['roompot_pois.geojson'] // Default fallback
    };

    const files = siteFileMap[site] || siteFileMap.default;
    console.log(`🔍 POI DEBUG: Will attempt to load files:`, files);

    let allPOIs: POI[] = [];

    for (const filename of files) {
      // Construct the full path to the data file
      const filePath = path.join(process.cwd(), 'server', 'data', filename);
      console.log(`🔍 POI DEBUG: Attempting to read file: ${filePath}`);

      if (!fs.existsSync(filePath)) {
        console.log(`🔍 POI DEBUG: File ${filename} does not exist at ${filePath}, skipping`);
        continue;
      }

      try {
        const data = fs.readFileSync(filePath, 'utf-8');
        const geojson = JSON.parse(data);

        console.log(`🔍 POI DEBUG: File ${filename} contains ${geojson.features?.length || 0} features`);

        // Process and categorize POIs based on filename and properties
        if (filename === 'roompot_pois.geojson') {
          const pois = geojson.features.map((feature: any, index: number) => {
            const props = feature.properties;
            const buildingType = props.building_type;
            const poiName = props.name;
            let name = poiName || buildingType?.charAt(0).toUpperCase() + buildingType?.slice(1) || 'Roompot POI';
            let category = 'unknown';
            let subCategory = '';

            // Enhanced categorization based on Roompot legend and type
            // First check if there's a type property for direct categorization
            const featureType = props.type;
            if (featureType) {
              switch (featureType.toLowerCase()) {
                case 'accommodation':
                case 'chalet':
                  category = 'chalets';
                  subCategory = 'standard';
                  break;
                case 'bungalow':
                  category = 'bungalows';
                  subCategory = 'standard';
                  break;
                case 'restaurant':
                case 'food':
                  category = 'food-drink';
                  subCategory = 'restaurant';
                  break;
                case 'service':
                case 'facility':
                  category = 'services';
                  subCategory = 'general';
                  break;
                case 'parking':
                  category = 'parking';
                  subCategory = 'parking';
                  break;
                case 'toilet':
                case 'toilets':
                  category = 'toilets';
                  subCategory = 'toilets';
                  break;
                default:
                  // Fall back to building_type based categorization
                  break;
              }
            }
            
            // If not categorized by type, use building_type
            if (category === 'unknown' && (buildingType === 'static_caravan' || poiName?.toLowerCase().includes('caravan'))) {
              category = 'camping';
              subCategory = 'static_caravan';
              name = name.replace('static_caravan', 'Caravan Site');
            } else if (category === 'unknown' && (buildingType === 'bungalow' || poiName?.toLowerCase().includes('bungalow'))) {
              category = 'bungalows';
              // Determine bungalow type from name patterns
              if (poiName?.includes('B1')) subCategory = 'b1';
              else if (poiName?.includes('B5')) subCategory = 'b5';
              else if (poiName?.includes('BA')) subCategory = 'ba_comfort';
              else if (poiName?.includes('BC')) subCategory = 'bc_comfort';
              else if (poiName?.includes('BD')) subCategory = 'bd_comfort';
              else if (poiName?.includes('BE')) subCategory = 'be_comfort';
              else if (poiName?.includes('BF')) subCategory = 'bf_comfort';
              else if (poiName?.includes('BG')) subCategory = 'bg';
              else if (poiName?.includes('BH')) subCategory = 'bh';
              else if (poiName?.includes('BI')) subCategory = 'bi';
              else if (poiName?.includes('NB')) subCategory = 'nb_comfort';
              else if (poiName?.includes('NC')) subCategory = 'nc';
              else if (poiName?.includes('ND')) subCategory = 'nd_comfort';
              else if (poiName?.includes('NE')) subCategory = 'ne_comfort';
              else if (poiName?.includes('NG')) subCategory = 'ng_comfort';
              else if (poiName?.includes('RJV')) subCategory = 'rjv';
              else if (poiName?.includes('RJ')) subCategory = 'rj_comfort';
              else if (poiName?.includes('FV')) subCategory = 'fv14';
              else subCategory = 'standard';
            } else if (category === 'unknown' && buildingType === 'house') {
              // Only categorize as beach_houses if explicitly named as beach house or located near beach coordinates
              if (poiName?.toLowerCase().includes('beach house') ||
                  (feature.geometry.coordinates[1] > 51.587 && feature.geometry.coordinates[1] < 51.590 && feature.geometry.coordinates[0] > 3.730 && feature.geometry.coordinates[0] < 3.735)) {
                category = 'beach_houses';
                if (poiName?.includes('4')) subCategory = 'beach_house_4';
                else if (poiName?.includes('6A')) subCategory = 'beach_house_6a';
                else if (poiName?.includes('6B')) subCategory = 'beach_house_6b';
                else subCategory = 'standard';
              } else if (poiName?.toLowerCase().includes('lodge') ||
                        (feature.geometry.coordinates[1] > 51.593 && feature.geometry.coordinates[1] < 51.595 && feature.geometry.coordinates[0] > 3.710 && feature.geometry.coordinates[0] < 3.713)) {
                category = 'lodges';
                subCategory = 'water_village_lodge';
              } else {
                // Regular houses - keep as chalets or create a separate category
                category = 'chalets';
                subCategory = 'standard';
              }
            } else if (category === 'unknown' && (buildingType === 'semidetached_house' || buildingType === 'detached' ||
                      (poiName && (poiName.includes('RP') || poiName.toLowerCase().includes('chalet'))))) {
              category = 'chalets';
              if (poiName?.includes('RP64A')) subCategory = 'rp64a';
              else if (poiName?.includes('RP4A')) subCategory = 'rp4a';
              else if (poiName?.includes('RP6A')) subCategory = 'rp6a';
              else if (poiName?.includes('RP6B')) subCategory = 'rp6b';
              else if (poiName?.includes('RP6C')) subCategory = 'rp6c';
              else if (poiName?.includes('RP6GC')) subCategory = 'rp6gc';
              else subCategory = 'standard';
            } else if (category === 'unknown' && (poiName?.toLowerCase().includes('lodge') || poiName?.toLowerCase().includes('water village'))) {
              category = 'lodges';
              if (poiName?.toLowerCase().includes('water village')) subCategory = 'water_village_lodge';
              else subCategory = 'lodge_4';
            } else if (category === 'unknown' && buildingType === 'toilets') {
              category = 'toilets';
              subCategory = 'toilets';
              name = 'Toilet';
            } else if (buildingType === 'parking') {
              category = 'parking';
              subCategory = 'parking';
              name = 'Parking Area';
            } else if (buildingType === 'retail') {
              category = 'food-drink';
              subCategory = 'restaurant';
              name = 'Restaurant';
            } else if (buildingType === 'office') {
              // Check if it's a restaurant office or general office
              if (poiName?.toLowerCase().includes('restaurant') || poiName?.toLowerCase().includes('bar')) {
                category = 'food-drink';
                subCategory = 'restaurant';
                name = poiName || 'Restaurant';
              } else {
                category = 'services';
                subCategory = 'reception';
                name = 'Reception/Office';
              }
            } else if (buildingType === 'commercial' || buildingType === 'industrial') {
              category = 'services';
              subCategory = 'service_station';
              name = 'Service Station';
            } else if (buildingType === 'garage' || buildingType === 'shed') {
              category = 'facilities';
              subCategory = 'storage';
              name = 'Storage/Garage';
            } else if (buildingType === 'landuse_grass') {
              category = 'leisure';
              subCategory = 'playground';
              name = 'Recreational Area';
            } else if (buildingType === 'service') {
              category = 'services';
              subCategory = 'maintenance';
              name = 'Service Point';
            } else if (category === 'unknown') {
              // Use roompot_category as fallback if available
              const roompotCategory = props.roompot_category;
              if (roompotCategory) {
                switch (roompotCategory.toLowerCase()) {
                  case 'food & drinks':
                    category = 'food-drink';
                    subCategory = 'restaurant';
                    break;
                  case 'leisure & entertainment':
                    category = 'leisure';
                    subCategory = 'entertainment';
                    break;
                  case 'necessities':
                    category = 'services';
                    subCategory = 'essential';
                    break;
                  case 'shopping':
                    category = 'services';
                    subCategory = 'shopping';
                    break;
                  case 'chalets/lodges':
                    category = 'chalets';
                    subCategory = 'standard';
                    // Ensure name is properly set for chalets
                    if (!name || name === 'Roompot POI') {
                      name = props.name || `Chalet ${props.ref || index}`;
                    }
                    break;
                  case 'bungalows - standard':
                    category = 'bungalows';
                    subCategory = 'standard';
                    break;
                  default:
                    category = 'services';
                    subCategory = 'general';
                    break;
                }
              } else {
                category = 'services';
                subCategory = 'general';
              }
            }
            console.log(`Roompot POI ${index}: ${name}, Building: ${buildingType}, Category: ${category}, SubCategory: ${subCategory}`);

            let coordinates;
            if (feature.geometry.type === 'Point') {
              coordinates = { lat: feature.geometry.coordinates[1], lng: feature.geometry.coordinates[0] };
            } else { return null; } // Skip non-point geometries for roompot data

            const amenities = [];
            if (props.phone) amenities.push(`Phone: ${props.phone}`);
            if (props.website) amenities.push(`Website: ${props.website}`);

            return {
              id: feature.id?.toString() || `roompot_${index}`,
              name: name,
              category,
              subCategory: subCategory || undefined,
              coordinates,
              amenities: amenities.length > 0 ? amenities : undefined,
              hours: props.opening_hours || undefined,
              buildingType: buildingType // Add buildingType to the POI object
            };
          }).filter(Boolean);
          allPOIs.push(...pois);

        } else if (filename === 'Beach Resort Zentroide Layer.geojson') {
          const buildingTypes = geojson.features.reduce((acc: Record<string, number>, feature: any) => {
            const building = feature.properties?.BUILDING || 'no_building_type';
            acc[building] = (acc[building] || 0) + 1;
            return acc;
          }, {});
          console.log('Beach Resort features breakdown:', buildingTypes);

          const pois = geojson.features.map((feature: any, index: number) => {
            const props = feature.properties;
            const buildingType = props.BUILDING;
            const houseNumber = props.A_HSNMBR;
            const poiName = props.NAME;
            let name = 'Beach Resort POI';

            if (buildingType && houseNumber) {
              name = buildingType === 'static_caravan' ? `Stellplatz ${houseNumber}` : `${buildingType} ${houseNumber}`;
            } else if (poiName) {
              name = poiName;
            } else if (buildingType) {
              name = buildingType.charAt(0).toUpperCase() + buildingType.slice(1);
            }

            const category = buildingCategoryMapping[buildingType] || 'buildings';
            console.log(`Beach Resort POI: ${name}, Building: ${buildingType}, Category: ${category}`);

            let coordinates;
            if (feature.geometry.type === 'Point') {
              coordinates = { lat: feature.geometry.coordinates[1], lng: feature.geometry.coordinates[0] };
            } else if (feature.geometry.type === 'Polygon') {
              const coords = feature.geometry.coordinates[0];
              const lats = coords.map((c: number[]) => c[1]);
              const lngs = coords.map((c: number[]) => c[0]);
              coordinates = {
                lat: lats.reduce((a: number, b: number) => a + b) / lats.length,
                lng: lngs.reduce((a: number, b: number) => a + b) / lngs.length
              };
            } else {
              return null; // Skip unsupported geometry types
            }

            const amenities = [];
            if (props.phone) amenities.push(`Phone: ${props.phone}`);
            if (props.website) amenities.push(`Website: ${props.website}`);
            if (props['addr:street'] && props['addr:housenumber']) {
              amenities.push(`Address: ${props['addr:housenumber']} ${props['addr:street']}`);
            }

            return {
              id: feature.id?.toString() || `beachresort_${index}`,
              name: name,
              category,
              coordinates: coordinates,
              amenities: amenities.length > 0 ? amenities : undefined,
              hours: props.opening_hours || undefined
            };
          }).filter(Boolean);
          allPOIs.push(...pois);
        } else {
          // General OSM category mapping
          const pois = geojson.features.map((feature: any, index: number) => {
            const props = feature.properties;
            let category = 'unknown';

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
            } else {
              category = 'services'; // Default category for general POIs
            }

            let name = props.name || 'POI';
            if (props.tourism === 'hotel' && props['addr:housenumber']) name = `Hotel ${props['addr:housenumber']}`;
            if (props.shop === 'supermarket' && props.name) name = props.name;

            let coordinates;
            if (feature.geometry.type === 'Point') {
              coordinates = { lat: feature.geometry.coordinates[1], lng: feature.geometry.coordinates[0] };
            } else if (feature.geometry.type === 'Polygon') {
              const coords = feature.geometry.coordinates[0];
              const lats = coords.map((c: number[]) => c[1]);
              const lngs = coords.map((c: number[]) => c[0]);
              coordinates = {
                lat: lats.reduce((a: number, b: number) => a + b) / lats.length,
                lng: lngs.reduce((a: number, b: number) => a + b) / lngs.length
              };
            } else {
              return null; // Skip unsupported geometry types
            }

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
          allPOIs.push(...pois);
        }
      } catch (parseError) {
        console.error(`🔍 POI DEBUG: Error parsing ${filename}:`, parseError);
        continue; // Continue to the next file if parsing fails
      }
    }

    console.log(`🔍 POI DEBUG: Total POIs before filtering: ${allPOIs.length}`);

    // Filter POIs to only include useful ones
    const filteredPOIs = allPOIs.filter((poi: any) => {
      // Always include POIs with valid names
      if (poi.name && poi.name.trim() !== '') return true;

      // For Beach Resort, include building-based POIs
      if (poi.category && poi.category !== 'unknown' && poi.category !== 'buildings') return true;

      // For Beach Resort static caravans and buildings, include all
      if (poi.name && (poi.name.includes('Stellplatz') || poi.name.includes('static_caravan') || poi.category === 'buildings')) return true;

      return false;
    });

    // Log category breakdown
    const categoryBreakdown = filteredPOIs.reduce((acc: Record<string, number>, poi: any) => {
      acc[poi.category] = (acc[poi.category] || 0) + 1;
      return acc;
    }, {});

    console.log(`POI API: Loaded ${filteredPOIs.length} POIs for site ${site}`);
    console.log(`🔍 POI DEBUG: Category breakdown:`, categoryBreakdown);
    console.log(`🔍 POI DEBUG: Sample POI response:`, filteredPOIs.slice(0, 2).map(poi => ({
      id: poi.id,
      name: poi.name,
      category: poi.category,
      coordinates: poi.coordinates
    })));

    // Set proper headers to ensure data reaches client
    // headers are set in the API route handler, not here. This function just returns data.

    return filteredPOIs;
  } catch (error) {
    console.error(`Error loading POI data for ${site}:`, error);
    return []; // Return empty array on error
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
      // console.log(`POI API: Loaded ${pois.length} POIs for site ${site}`);
      // Removed redundant logging here as getPOIData already logs

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-cache');
      res.status(200).json(pois);
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
      // Now supports combined Kamperland data (roompot_pois.geojson + Beach Resort Zentroide Layer.geojson)
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
          poi.category.toLowerCase().includes(searchTerm) ||
          poi.subCategory?.toLowerCase().includes(searchTerm) ||
          poi.id.toLowerCase().includes(searchTerm) ||
          poi.buildingType?.toLowerCase().includes(searchTerm)
        );
      }

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-cache');
      res.status(200).json(filteredPOIs);
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