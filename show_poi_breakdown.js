
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('📊 DETAILLIERTE POI KATEGORIEN ÜBERSICHT\n');

try {
  // Lade Roompot POI Daten
  const roompotPath = path.join(__dirname, 'server', 'data', 'roompot_pois.geojson');
  const roompotData = JSON.parse(fs.readFileSync(roompotPath, 'utf-8'));
  
  console.log(`🏕️ ROOMPOT POIs: ${roompotData.features.length} Gesamt\n`);
  
  // Server-Code Mapping (aus poiTransformer.ts)
  const buildingCategoryMapping = {
    'static_caravan': 'facilities',
    'bungalow': 'facilities',
    'hotel': 'facilities',
    'parking': 'facilities',
    'yes': 'buildings',
    'house': 'buildings', 
    'semidetached_house': 'buildings',
    'detached': 'buildings',
    'retail': 'services',
    'office': 'services',
    'commercial': 'services',
    'industrial': 'services',
    'shed': 'services',
    'garage': 'services',
    'service': 'services',
    'toilets': 'services',
    'swimming_pool': 'leisure',
    'restaurant': 'food-drink',
    'landuse_grass': 'unknown'
  };
  
  // Zähle nach building_type und Kategorie
  const buildingTypeCount = {};
  const categoryCount = {};
  
  roompotData.features.forEach(feature => {
    const buildingType = feature.properties.building_type;
    const category = buildingCategoryMapping[buildingType] || 'unknown';
    
    buildingTypeCount[buildingType] = (buildingTypeCount[buildingType] || 0) + 1;
    categoryCount[category] = (categoryCount[category] || 0) + 1;
  });
  
  // Sortierte Ausgabe nach Kategorien
  console.log('🏷️ KATEGORIEN ÜBERSICHT:');
  console.log('='.repeat(50));
  Object.entries(categoryCount)
    .sort(([,a], [,b]) => b - a)
    .forEach(([category, count]) => {
      const percent = ((count / roompotData.features.length) * 100).toFixed(1);
      console.log(`${category.toUpperCase().padEnd(15)} → ${count.toString().padStart(4)} POIs (${percent}%)`);
    });
  
  console.log('\n📋 DETAILLIERTE BUILDING TYPES:');
  console.log('='.repeat(50));
  Object.entries(buildingTypeCount)
    .sort(([,a], [,b]) => b - a)
    .forEach(([buildingType, count]) => {
      const category = buildingCategoryMapping[buildingType] || 'unknown';
      const percent = ((count / roompotData.features.length) * 100).toFixed(1);
      console.log(`${buildingType.padEnd(20)} → ${count.toString().padStart(4)} (${percent}%) [${category}]`);
    });
    
  // Lade auch Kamperland POIs
  console.log('\n\n🏖️ KAMPERLAND POIs ANALYSE:');
  console.log('='.repeat(50));
  
  const kamperlandPath = path.join(__dirname, 'server', 'data', 'kamperland_pois.geojson');
  const kamperlandData = JSON.parse(fs.readFileSync(kamperlandPath, 'utf-8'));
  
  console.log(`Gesamt Kamperland POIs: ${kamperlandData.features.length}\n`);
  
  const kamperlandCategories = {};
  const kamperlandAmenities = {};
  
  kamperlandData.features.forEach(feature => {
    const props = feature.properties;
    
    // Kategorisierung basierend auf Server-Logic
    let category = 'unknown';
    if (props.amenity) {
      const amenity = props.amenity;
      kamperlandAmenities[amenity] = (kamperlandAmenities[amenity] || 0) + 1;
      
      // Mapping aus poiTransformer.ts
      if (['restaurant', 'cafe', 'bar', 'pub', 'fast_food'].includes(amenity)) {
        category = 'food-drink';
      } else if (['parking', 'toilets', 'shower', 'waste_disposal'].includes(amenity)) {
        category = 'facilities';
      } else if (['swimming_pool', 'playground', 'sports_centre'].includes(amenity)) {
        category = 'recreation';
      } else {
        category = 'services';
      }
    } else if (props.leisure) {
      if (['swimming_pool', 'playground', 'sports_centre'].includes(props.leisure)) {
        category = 'recreation';
      } else {
        category = 'facilities';
      }
    }
    
    kamperlandCategories[category] = (kamperlandCategories[category] || 0) + 1;
  });
  
  console.log('🏷️ KAMPERLAND KATEGORIEN:');
  Object.entries(kamperlandCategories)
    .sort(([,a], [,b]) => b - a)
    .forEach(([category, count]) => {
      const percent = ((count / kamperlandData.features.length) * 100).toFixed(1);
      console.log(`${category.toUpperCase().padEnd(15)} → ${count.toString().padStart(3)} POIs (${percent}%)`);
    });
    
  console.log('\n🏪 KAMPERLAND AMENITIES:');
  Object.entries(kamperlandAmenities)
    .sort(([,a], [,b]) => b - a)
    .forEach(([amenity, count]) => {
      const percent = ((count / kamperlandData.features.length) * 100).toFixed(1);
      console.log(`${amenity.padEnd(20)} → ${count.toString().padStart(3)} (${percent}%)`);
    });
    
} catch (error) {
  console.error('❌ Fehler:', error.message);
}
