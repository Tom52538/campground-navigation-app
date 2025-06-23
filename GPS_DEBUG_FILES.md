# GPS FLICKER DEBUG - Files Involved

## Core GPS Files:
1. `client/src/hooks/useLocation.ts` - GPS position management
2. `client/src/pages/Navigation.tsx` - Map center updates 
3. `client/src/components/Map/MapContainer.tsx` - Leaflet map rendering

## GPS Flow:
1. useLocation.ts receives GPS coordinates via watchPosition
2. Navigation.tsx updates mapCenter based on GPS position
3. MapContainer.tsx renders map view changes

## CURRENT TEST:
- Removed ALL filtering and throttling
- Disabled auto-follow GPS to map
- Disabled map animations
- Pure GPS -> position state -> manual map centering only

## THEORY:
If GPS still flickers with these changes, the issue is in:
- Browser GPS API itself
- React state updates
- Leaflet map rendering
- Production vs development environment differences