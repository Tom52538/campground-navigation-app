
const fs = require('fs');
const path = require('path');

console.log('🔍 Analyzing GeoJSON files...\n');

// Pfade zu den GeoJSON-Dateien
const files = [
  {
    name: 'Beach Resort Zentroide Layer',
    path: './server/data/Beach Resort Zentroide Layer.geojson'
  },
  {
    name: 'Kamperland POIs',
    path: './server/data/kamperland_pois.geojson'
  },
  {
    name: 'Roompot POIs',
    path: './server/data/roompot_pois.geojson'
  }
];

files.forEach(file => {
  console.log(`\n📁 Analyzing: ${file.name}`);
  console.log('=' + '='.repeat(50));
  
  try {
    if (!fs.existsSync(file.path)) {
      console.log('❌ File not found!');
      return;
    }
    
    const data = fs.readFileSync(file.path, 'utf8');
    const geojson = JSON.parse(data);
    
    console.log(`✅ File loaded successfully`);
    console.log(`📊 Total features: ${geojson.features?.length || 0}`);
    
    if (geojson.features && geojson.features.length > 0) {
      // Analyse der Geometrie-Typen
      const geometryTypes = {};
      geojson.features.forEach(feature => {
        const type = feature.geometry?.type || 'unknown';
        geometryTypes[type] = (geometryTypes[type] || 0) + 1;
      });
      
      console.log('\n🗺️  Geometry Types:');
      Object.entries(geometryTypes).forEach(([type, count]) => {
        console.log(`   ${type}: ${count}`);
      });
      
      // Analyse der Properties
      const properties = {};
      const sampleFeature = geojson.features[0];
      
      console.log('\n🏷️  Sample Properties (first feature):');
      if (sampleFeature.properties) {
        Object.keys(sampleFeature.properties).forEach(key => {
          const value = sampleFeature.properties[key];
          console.log(`   ${key}: ${typeof value === 'string' && value.length > 50 ? value.substring(0, 50) + '...' : value}`);
        });
      }
      
      // Spezielle Analyse für Beach Resort Zentroide Layer
      if (file.name === 'Beach Resort Zentroide Layer') {
        const buildingTypes = {};
        geojson.features.forEach(feature => {
          const building = feature.properties?.BUILDING || 'unknown';
          buildingTypes[building] = (buildingTypes[building] || 0) + 1;
        });
        
        console.log('\n🏠 Building Types:');
        Object.entries(buildingTypes).forEach(([type, count]) => {
          console.log(`   ${type}: ${count}`);
        });
        
        // Prüfe auf Hausnummern
        const withHouseNumbers = geojson.features.filter(f => f.properties?.A_HSNMBR).length;
        console.log(`🏠 Features with house numbers: ${withHouseNumbers}`);
      }
      
      // Analyse für Kamperland POIs
      if (file.name === 'Kamperland POIs') {
        const amenityTypes = {};
        const leisureTypes = {};
        
        geojson.features.forEach(feature => {
          if (feature.properties?.amenity) {
            const amenity = feature.properties.amenity;
            amenityTypes[amenity] = (amenityTypes[amenity] || 0) + 1;
          }
          if (feature.properties?.leisure) {
            const leisure = feature.properties.leisure;
            leisureTypes[leisure] = (leisureTypes[leisure] || 0) + 1;
          }
        });
        
        if (Object.keys(amenityTypes).length > 0) {
          console.log('\n🏪 Amenity Types:');
          Object.entries(amenityTypes).forEach(([type, count]) => {
            console.log(`   ${type}: ${count}`);
          });
        }
        
        if (Object.keys(leisureTypes).length > 0) {
          console.log('\n🎯 Leisure Types:');
          Object.entries(leisureTypes).forEach(([type, count]) => {
            console.log(`   ${type}: ${count}`);
          });
        }
      }
      
      // Analyse für Roompot POIs
      if (file.name === 'Roompot POIs') {
        const categories = {};
        const buildingTypes = {};
        
        geojson.features.forEach(feature => {
          if (feature.properties?.category) {
            const category = feature.properties.category;
            categories[category] = (categories[category] || 0) + 1;
          }
          if (feature.properties?.building_type) {
            const buildingType = feature.properties.building_type;
            buildingTypes[buildingType] = (buildingTypes[buildingType] || 0) + 1;
          }
        });
        
        if (Object.keys(categories).length > 0) {
          console.log('\n📂 Categories:');
          Object.entries(categories).forEach(([type, count]) => {
            console.log(`   ${type}: ${count}`);
          });
        }
        
        if (Object.keys(buildingTypes).length > 0) {
          console.log('\n🏗️  Building Types:');
          Object.entries(buildingTypes).forEach(([type, count]) => {
            console.log(`   ${type}: ${count}`);
          });
        }
      }
      
      // Koordinaten-Bereich analysieren
      if (geojson.features.length > 0) {
        let minLat = Infinity, maxLat = -Infinity;
        let minLng = Infinity, maxLng = -Infinity;
        
        geojson.features.forEach(feature => {
          if (feature.geometry?.type === 'Point') {
            const [lng, lat] = feature.geometry.coordinates;
            minLat = Math.min(minLat, lat);
            maxLat = Math.max(maxLat, lat);
            minLng = Math.min(minLng, lng);
            maxLng = Math.max(maxLng, lng);
          } else if (feature.geometry?.type === 'Polygon') {
            // Berechne Centroid für Polygone
            const coords = feature.geometry.coordinates[0];
            const lats = coords.map(c => c[1]);
            const lngs = coords.map(c => c[0]);
            const lat = lats.reduce((a, b) => a + b) / lats.length;
            const lng = lngs.reduce((a, b) => a + b) / lngs.length;
            
            minLat = Math.min(minLat, lat);
            maxLat = Math.max(maxLat, lat);
            minLng = Math.min(minLng, lng);
            maxLng = Math.max(maxLng, lng);
          }
        });
        
        console.log('\n🌍 Coordinate Bounds:');
        console.log(`   Latitude: ${minLat.toFixed(6)} to ${maxLat.toFixed(6)}`);
        console.log(`   Longitude: ${minLng.toFixed(6)} to ${maxLng.toFixed(6)}`);
      }
      
    } else {
      console.log('⚠️  No features found in this file');
    }
    
  } catch (error) {
    console.log(`❌ Error reading file: ${error.message}`);
  }
});

console.log('\n\n📋 SUMMARY');
console.log('=' + '='.repeat(50));

// Erstelle eine Zusammenfassung
const summary = {};
files.forEach(file => {
  try {
    if (fs.existsSync(file.path)) {
      const data = fs.readFileSync(file.path, 'utf8');
      const geojson = JSON.parse(data);
      summary[file.name] = geojson.features?.length || 0;
    } else {
      summary[file.name] = 'File not found';
    }
  } catch (error) {
    summary[file.name] = 'Error reading file';
  }
});

Object.entries(summary).forEach(([name, count]) => {
  console.log(`${name}: ${count} objects`);
});

console.log('\n✅ Analysis complete!');
