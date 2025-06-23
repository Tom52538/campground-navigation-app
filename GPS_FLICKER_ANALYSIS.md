# GPS FLICKERING ROOT CAUSE ANALYSIS

## Problem Statement
GPS flickering occurs when Real GPS is enabled, but NOT in preview mode. The stabilizer works in preview but fails in production deployment.

## Current GPS Flow Analysis

### Preview Mode (Works)
1. useLocation hook initializes GPS stabilizer with useRef
2. GPS positions go through addPosition() method
3. Positions are filtered and smoothed correctly
4. Map updates smoothly

### Production Mode (Flickers)
1. Same code path, but GPS stabilizer may not be properly initialized
2. Positions bypass stabilizer due to null/undefined references
3. Raw GPS coordinates directly update map position
4. Result: Erratic map movement

## Suspected Issues

### 1. useRef Initialization Problem
```typescript
const gpsStabilizer = useRef<GPSStabilizer>(new GPSStabilizer({...}));
```
- In production builds, useRef may not initialize properly on first render
- React strict mode differences between dev/prod
- Hot reloading vs cold starts

### 2. Import/Module Resolution
```typescript
import { GPSStabilizer } from '@/lib/gpsStabilizer';
```
- Production build may have import path issues
- Tree shaking could remove stabilizer code
- Module bundling differences

### 3. Null Safety Gaps
```typescript
const stabilizedPosition = gpsStabilizer.current.addPosition(coords, accuracy);
```
- If gpsStabilizer.current is null, this throws error
- Error causes fallback to direct position updates
- No error boundaries catch this specific failure

## Required Fix Strategy

1. **Force GPS Stabilizer Creation**: Ensure stabilizer exists before ANY GPS operations
2. **Add Error Boundaries**: Catch stabilizer failures and reinitialize
3. **Debug Production Behavior**: Add extensive logging for production GPS flow
4. **Implement Fallback**: If stabilizer fails, implement basic position smoothing

## Next Actions
1. Add production-specific GPS stabilizer debugging
2. Implement bulletproof stabilizer initialization
3. Add error recovery mechanisms
4. Test with real device GPS in production environment