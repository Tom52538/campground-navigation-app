# GPS Flickering Analysis Report

## Current GPS Configuration
```javascript
navigator.geolocation.watchPosition(
  callback,
  errorCallback,
  {
    enableHighAccuracy: false,
    timeout: 30000,
    maximumAge: 60000
  }
);
```

## Map Library Configuration
- **Library**: React Leaflet
- **Update Method**: `map.setView([lat, lng], zoom, { animate: true, duration: 0.8 })`
- **Behavior**: **ENTIRE MAP RECENTERS** on every GPS update
- **Trigger**: GPS position change → `setMapCenter()` → `map.setView()` called

## Root Cause Analysis

### Issue Identified: Map Recentering
The flickering occurs because we're calling `map.setView()` on every GPS update, which:
1. Recenters the entire map view
2. Triggers map animation (0.8s duration)
3. Interrupts previous animations if GPS updates arrive rapidly
4. Creates visual flickering/jumping effect

### Current Flow:
```
GPS Update → setCurrentPosition() → trackingPosition changes → 
setMapCenter() → map.setView() → ENTIRE MAP RECENTERS
```

### Problem: We're treating GPS updates like navigation waypoints
- GPS updates should only move the user marker
- Map should only recenter when user explicitly requests it or when significantly off-screen

## Solution Strategy

### Option 1: Update Marker Only (Recommended)
```javascript
// Instead of recentering map, just update user marker position
userMarker.setLatLng([lat, lng]);
```

### Option 2: Smart Map Following
```javascript
// Only recenter if user marker goes off-screen
const bounds = map.getBounds();
if (!bounds.contains([lat, lng])) {
  map.setView([lat, lng], zoom, { animate: true });
}
```

### Option 3: Debounced Map Updates
```javascript
// Delay map recentering to avoid animation conflicts
const debouncedMapUpdate = debounce(setMapCenter, 1000);
```

## Diagnostic Data Collection
With the new logging, we'll see:
- GPS update frequency
- Coordinate precision changes
- Map update correlation
- Animation timing conflicts

## Expected Behavior After Fix
- User marker moves smoothly with GPS updates
- Map stays centered unless user goes off-screen
- No flickering or jumping
- Smooth navigation experience