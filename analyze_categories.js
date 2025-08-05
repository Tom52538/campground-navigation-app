
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function analyzeCategories() {
  console.log('🔍 ANALYSIERE ROOMPOT POI KATEGORIEN\n');
  
  try {
    // Lade die Roompot GeoJSON Daten
    const roompotPath = path.join(__dirname, 'server', 'data', 'roompot_pois.geojson');
    const roompotData = JSON.parse(fs.readFileSync(roompotPath, 'utf-8'));
    
    console.log(`📊 Gesamtanzahl POIs: ${roompotData.features.length}\n`);
    
    // Kategorisierung basierend auf building_type (wie im Server-Code)
    const buildingCategoryMapping = {
      'static_caravan': 'facilities',
      'retail': 'services', 
      'yes': 'buildings',
      'bungalow': 'facilities',
      'house': 'buildings',
      'semidetached_house': 'buildings',
      'office': 'services',
      'commercial': 'services',
      'industrial': 'services',
      'shed': 'services',
      'garage': 'services',
      'service': 'services',
      'detached': 'buildings',
      'toilets': 'services',
      'swimming_pool': 'recreation',
      'restaurant': 'food-drink',
      'hotel': 'facilities',
      'parking': 'facilities',
      'landuse_grass': 'recreation'
    };
    
    // Zähle nach building_type
    const buildingTypeCount = {};
    const categoryCount = {};
    
    roompotData.features.forEach(feature => {
      const buildingType = feature.properties.building_type;
      const category = buildingCategoryMapping[buildingType] || 'unknown';
      
      // Zähle building_type
      buildingTypeCount[buildingType] = (buildingTypeCount[buildingType] || 0) + 1;
      
      // Zähle Kategorien
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });
    
    console.log('📋 BUILDING TYPES:');
    console.log('==================');
    Object.entries(buildingTypeCount)
      .sort(([,a], [,b]) => b - a)
      .forEach(([type, count]) => {
        const category = buildingCategoryMapping[type] || 'unknown';
        console.log(`${type.padEnd(20)} → ${category.padEnd(12)} (${count})`);
      });
    
    console.log('\n🏷️  KATEGORIEN ZUSAMMENFASSUNG:');
    console.log('===============================');
    Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .forEach(([category, count]) => {
        const percentage = ((count / roompotData.features.length) * 100).toFixed(1);
        console.log(`${category.padEnd(15)} → ${count.toString().padStart(4)} POIs (${percentage}%)`);
      });
    
    console.log('\n🎯 QUICK FILTER EMPFEHLUNGEN:');
    console.log('=============================');
    
    const recommendations = [
      { category: 'facilities', icon: '🏠', label: 'Unterkünfte', count: categoryCount.facilities || 0 },
      { category: 'buildings', icon: '🏘️', label: 'Gebäude', count: categoryCount.buildings || 0 },
      { category: 'services', icon: '🔧', label: 'Services', count: categoryCount.services || 0 },
      { category: 'recreation', icon: '🏊', label: 'Freizeit', count: categoryCount.recreation || 0 },
      { category: 'food-drink', icon: '🍽️', label: 'Gastronomie', count: categoryCount['food-drink'] || 0 }
    ].filter(item => item.count > 0);
    
    recommendations.forEach(item => {
      console.log(`${item.icon} ${item.label.padEnd(12)} → ${item.count.toString().padStart(4)} POIs`);
    });
    
    console.log('\n✅ Analyse abgeschlossen!');
    
  } catch (error) {
    console.error('❌ Fehler beim Analysieren:', error.message);
  }
}

analyzeCategories();
