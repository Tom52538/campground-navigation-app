
const fs = require('fs');
const path = require('path');

console.log('📊 ROOMPOT POI KATEGORIEN ANALYSE\n');

try {
  const filePath = path.join(__dirname, 'server', 'data', 'roompot_pois.geojson');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  
  console.log(`📋 Gesamt POIs: ${data.features.length}\n`);
  
  // Kategorien basierend auf building_type (wie im Server-Code)
  const categoryCount = {};
  
  data.features.forEach(feature => {
    const buildingType = feature.properties.building_type;
    let category = 'unknown';
    
    // Mapping wie im Server
    if (['static_caravan', 'bungalow', 'hotel', 'parking'].includes(buildingType)) {
      category = 'facilities';
    } else if (['yes', 'house', 'semidetached_house', 'detached'].includes(buildingType)) {
      category = 'buildings';
    } else if (['retail', 'office', 'commercial', 'industrial', 'shed', 'garage', 'service', 'toilets'].includes(buildingType)) {
      category = 'services';
    } else if (buildingType === 'swimming_pool') {
      category = 'leisure';
    } else if (buildingType === 'restaurant') {
      category = 'food-drink';
    }
    
    categoryCount[category] = (categoryCount[category] || 0) + 1;
  });
  
  console.log('🏷️ KATEGORIEN:');
  console.log('================');
  Object.entries(categoryCount)
    .sort(([,a], [,b]) => b - a)
    .forEach(([category, count]) => {
      const percent = ((count / data.features.length) * 100).toFixed(1);
      console.log(`${category.padEnd(12)} → ${count.toString().padStart(4)} POIs (${percent}%)`);
    });
    
} catch (error) {
  console.error('❌ Fehler:', error.message);
}
