const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

// Category mapping for campsite navigation
const categoryMapping = {
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
async function getPOIData(site) {
  try {
    const filename = site === 'zuhause' ? 'zuhause_pois.geojson' : 'kamperland_pois.geojson';
    const filePath = path.join(__dirname, 'server', 'data', filename);
    const data = fs.readFileSync(filePath, 'utf-8');
    const geojson = JSON.parse(data);
    
    return geojson.features
      .filter(feature => feature.properties?.name) // Only named features
      .map((feature, index) => {
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
          const lats = coords.map(c => c[1]);
          const lngs = coords.map(c => c[0]);
          coordinates = {
            lat: lats.reduce((a, b) => a + b) / lats.length,
            lng: lngs.reduce((a, b) => a + b) / lngs.length
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

// POI endpoints
app.get("/api/pois", async (req, res) => {
  try {
    const site = req.query.site || 'kamperland';
    const pois = await getPOIData(site);
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
    
    const siteName = site || 'kamperland';
    const allPOIs = await getPOIData(siteName);
    
    let filteredPOIs = allPOIs;
    
    // Filter by category if specified
    if (category) {
      filteredPOIs = filteredPOIs.filter(poi => poi.category === category);
    }
    
    // Filter by search query if specified
    if (query) {
      const searchTerm = query.toLowerCase();
      filteredPOIs = filteredPOIs.filter(poi => 
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

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    message: "Authentic OpenStreetMap POI system running"
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Test server with authentic POI data running on port ${PORT}`);
});