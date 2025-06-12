const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

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
  'convenience': 'services',
  'swimming_pool': 'recreation',
  'playground': 'recreation',
  'sports_centre': 'recreation',
  'attraction': 'recreation',
  'viewpoint': 'recreation',
  'picnic_table': 'recreation',
  'parking': 'facilities',
  'toilets': 'facilities',
  'waste_disposal': 'facilities',
  'bicycle_parking': 'facilities',
  'drinking_water': 'facilities'
};

// Load authentic OpenStreetMap POI data
function getPOIData(site) {
  try {
    const filename = site === 'zuhause' ? 'zuhause_pois.geojson' : 'kamperland_pois.geojson';
    const filePath = path.join(__dirname, 'server', 'data', filename);
    const data = fs.readFileSync(filePath, 'utf-8');
    const geojson = JSON.parse(data);
    
    console.log(`Loading ${geojson.features.length} features from ${filename}`);
    
    const transformedPOIs = geojson.features
      .filter(feature => feature.properties?.name)
      .map((feature, index) => {
        try {
          // Extract coordinates
          let coordinates;
          if (feature.geometry.type === 'Point') {
            coordinates = {
              lat: feature.geometry.coordinates[1],
              lng: feature.geometry.coordinates[0]
            };
          } else if (feature.geometry.type === 'Polygon') {
            const coords = feature.geometry.coordinates[0];
            const lats = coords.map(c => c[1]);
            const lngs = coords.map(c => c[0]);
            coordinates = {
              lat: lats.reduce((a, b) => a + b) / lats.length,
              lng: lngs.reduce((a, b) => a + b) / lngs.length
            };
          } else {
            return null;
          }

          const props = feature.properties;
          
          // Categorize using OSM tags
          let category = 'services';
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
            id: feature.properties['@id'] || feature.id?.toString() || `${site}_${index}`,
            name: props.name,
            category,
            coordinates,
            description: [props.amenity, props.leisure, props.tourism, props.shop]
              .filter(Boolean)
              .map(tag => tag.replace(/_/g, ' '))
              .join(', ') || 'Point of interest',
            amenities: amenities.length > 0 ? amenities : undefined,
            hours: props.opening_hours || props['opening_hours:restaurant'] || undefined
          };
        } catch (error) {
          console.warn(`Failed to transform feature:`, error);
          return null;
        }
      })
      .filter(Boolean);
      
    console.log(`Transformed ${transformedPOIs.length} POIs for ${site}`);
    return transformedPOIs;
    
  } catch (error) {
    console.error(`Error loading POI data for ${site}:`, error);
    return [];
  }
}

// POI endpoints
app.get("/api/pois", (req, res) => {
  try {
    const site = req.query.site || 'kamperland';
    const pois = getPOIData(site);
    res.json(pois);
  } catch (error) {
    console.error("POI API error:", error);
    res.status(500).json({ error: "Failed to fetch POI data" });
  }
});

// POI search endpoint
app.get("/api/pois/search", (req, res) => {
  try {
    const { q: query, category, site } = req.query;
    
    const siteName = site || 'kamperland';
    const allPOIs = getPOIData(siteName);
    
    let filteredPOIs = allPOIs;
    
    // Filter by category
    if (category) {
      filteredPOIs = filteredPOIs.filter(poi => poi.category === category);
    }
    
    // Filter by search query
    if (query) {
      const searchTerm = query.toLowerCase();
      filteredPOIs = filteredPOIs.filter(poi => 
        poi.name.toLowerCase().includes(searchTerm) ||
        poi.description?.toLowerCase().includes(searchTerm) ||
        poi.category.toLowerCase().includes(searchTerm) ||
        (poi.amenities && poi.amenities.some(amenity => 
          amenity.toLowerCase().includes(searchTerm)
        ))
      );
    }
    
    res.json(filteredPOIs);
  } catch (error) {
    console.error("POI search error:", error);
    res.status(500).json({ error: "Failed to search POIs" });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    message: "Authentic OpenStreetMap POI system running",
    sites: ['kamperland', 'zuhause']
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Authentic POI server running on port ${PORT}`);
  console.log('Testing POI data loading...');
  
  // Test data loading
  const kamperland = getPOIData('kamperland');
  const zuhause = getPOIData('zuhause');
  
  console.log(`Loaded ${kamperland.length} POIs for Kamperland`);
  console.log(`Loaded ${zuhause.length} POIs for Zuhause`);
});