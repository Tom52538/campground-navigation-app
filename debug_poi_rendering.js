
console.log('🔍 POI RENDERING DEBUG SCRIPT STARTING...');

// Test 1: Check if POI data is available
console.log('=== TEST 1: POI DATA AVAILABILITY ===');
fetch('/api/pois?site=kamperland')
  .then(response => response.json())
  .then(data => {
    console.log('✅ POI API Response:', {
      totalPOIs: data.length,
      firstPOI: data[0],
      categories: [...new Set(data.map(poi => poi.category))],
      coordinatesSample: data.slice(0, 5).map(poi => ({
        name: poi.name,
        coords: poi.coordinates
      }))
    });

    // Test 2: Check coordinate validity
    console.log('=== TEST 2: COORDINATE VALIDATION ===');
    const invalidCoords = data.filter(poi => 
      !poi.coordinates || 
      typeof poi.coordinates.lat !== 'number' || 
      typeof poi.coordinates.lng !== 'number' ||
      isNaN(poi.coordinates.lat) || 
      isNaN(poi.coordinates.lng) ||
      Math.abs(poi.coordinates.lat) > 90 ||
      Math.abs(poi.coordinates.lng) > 180
    );
    
    console.log('🔍 Invalid coordinates found:', invalidCoords.length);
    if (invalidCoords.length > 0) {
      console.log('❌ Invalid POIs:', invalidCoords.slice(0, 10));
    }

    // Test 3: Check if POIs are within map bounds
    console.log('=== TEST 3: POI BOUNDS CHECK ===');
    const kamperland_bounds = {
      north: 51.62,
      south: 51.55,
      east: 3.75,
      west: 3.69
    };

    const outsideBounds = data.filter(poi => 
      poi.coordinates &&
      (poi.coordinates.lat > kamperland_bounds.north ||
       poi.coordinates.lat < kamperland_bounds.south ||
       poi.coordinates.lng > kamperland_bounds.east ||
       poi.coordinates.lng < kamperland_bounds.west)
    );

    console.log('🗺️ POIs outside Kamperland bounds:', outsideBounds.length);
    if (outsideBounds.length > 0) {
      console.log('🌍 Out of bounds POIs:', outsideBounds.slice(0, 5).map(poi => ({
        name: poi.name,
        coords: poi.coordinates
      })));
    }

    // Test 4: Check POI categories and filtering
    console.log('=== TEST 4: POI CATEGORY ANALYSIS ===');
    const categoryBreakdown = data.reduce((acc, poi) => {
      acc[poi.category] = (acc[poi.category] || 0) + 1;
      return acc;
    }, {});
    console.log('📊 POI Categories:', categoryBreakdown);

  })
  .catch(error => {
    console.error('❌ POI API Error:', error);
  });

// Test 5: Check React component rendering
console.log('=== TEST 5: REACT COMPONENT INSPECTION ===');
setTimeout(() => {
  // Check if POI markers are in DOM
  const poiMarkers = document.querySelectorAll('.leaflet-marker-icon');
  console.log('🔍 Leaflet markers in DOM:', poiMarkers.length);
  
  // Check if POI components are rendered
  const poiComponents = document.querySelectorAll('[data-testid*="poi"], [class*="poi"]');
  console.log('🔍 POI components in DOM:', poiComponents.length);
  
  // Check leaflet map layers
  const leafletContainer = document.querySelector('.leaflet-container');
  if (leafletContainer) {
    const markerLayers = leafletContainer.querySelectorAll('.leaflet-marker-pane .leaflet-marker-icon');
    console.log('🗺️ Leaflet marker layer count:', markerLayers.length);
    
    // Check if markers are hidden
    const hiddenMarkers = Array.from(markerLayers).filter(marker => 
      marker.style.display === 'none' || 
      marker.style.visibility === 'hidden' ||
      marker.style.opacity === '0'
    );
    console.log('👻 Hidden markers:', hiddenMarkers.length);
  }
  
  // Check React DevTools if available
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('⚛️ React DevTools available - check component state');
  }

}, 3000);

// Test 6: Check filteredCategories state
console.log('=== TEST 6: FILTERING STATE CHECK ===');
setTimeout(() => {
  // Try to access React state (this might not work in production)
  const mapContainer = document.querySelector('.map-container');
  if (mapContainer && mapContainer._reactInternalFiber) {
    console.log('⚛️ React fiber found, checking props...');
  }
  
  // Check if there are any console errors
  console.log('🔍 Check browser console for any React/Leaflet errors');
  
}, 1000);

console.log('🔍 POI DEBUG SCRIPT COMPLETE - Check results above');
