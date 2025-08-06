import { POI } from '../../shared/schema';
import { Coordinates, POICategory } from '../../client/src/types/navigation';

export interface GeoJSONFeature {
  type: 'Feature';
  properties: {
    [key: string]: any;
    name?: string;
    amenity?: string;
    leisure?: string;
    tourism?: string;
    shop?: string;
    sport?: string;
    cuisine?: string;
    phone?: string;
    website?: string;
    opening_hours?: string;
    'addr:street'?: string;
    'addr:housenumber'?: string;
    'addr:city'?: string;
  };
  geometry: {
    type: 'Point' | 'Polygon' | 'LineString';
    coordinates: number[] | number[][] | number[][][];
  };
  id?: string;
}

export interface GeoJSONCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

// OSM tag to POI category mapping for campsite context
const categoryMapping: Record<string, POICategory> = {
  // Food & Drink
  'restaurant': 'food-drink',
  'cafe': 'food-drink',
  'bar': 'food-drink',
  'pub': 'food-drink',
  'fast_food': 'food-drink',
  'food_court': 'food-drink',
  'ice_cream': 'food-drink',
  
  // Essential Services
  'shop': 'services',
  'pharmacy': 'services',
  'bank': 'services',
  'atm': 'services',
  'information': 'services',
  'reception': 'services',
  'hospital': 'services',
  'clinic': 'services',
  'post_office': 'services',
  'fuel': 'services',
  'supermarket': 'services',
  'convenience': 'services',
  
  // Recreation & Activities
  'swimming_pool': 'recreation',
  'playground': 'recreation',
  'sports_centre': 'recreation',
  'fitness_centre': 'recreation',
  'tennis': 'recreation',
  'mini_golf': 'recreation',
  'golf_course': 'recreation',
  'beach_volleyball': 'recreation',
  'attraction': 'recreation',
  'viewpoint': 'recreation',
  'picnic_table': 'recreation',
  'bbq': 'recreation',
  
  // Practical Facilities
  'parking': 'facilities',
  'toilets': 'facilities',
  'shower': 'facilities',
  'waste_disposal': 'facilities',
  'recycling': 'facilities',
  'drinking_water': 'facilities',
  'bicycle_parking': 'facilities',
  'car_wash': 'facilities',
  'charging_station': 'facilities',
  'laundry': 'facilities'
};

function extractCoordinates(geometry: GeoJSONFeature['geometry']): Coordinates {
  switch (geometry.type) {
    case 'Point':
      const pointCoords = geometry.coordinates as number[];
      return { lat: pointCoords[1], lng: pointCoords[0] };
      
    case 'Polygon':
      // Use centroid of first ring
      const polygonCoords = geometry.coordinates as number[][][];
      const ring = polygonCoords[0];
      const centroid = calculateCentroid(ring);
      return { lat: centroid[1], lng: centroid[0] };
      
    case 'LineString':
      // Use midpoint of line
      const lineCoords = geometry.coordinates as number[][];
      const midIndex = Math.floor(lineCoords.length / 2);
      return { lat: lineCoords[midIndex][1], lng: lineCoords[midIndex][0] };
      
    default:
      throw new Error(`Unsupported geometry type: ${geometry.type}`);
  }
}

function calculateCentroid(coordinates: number[][]): number[] {
  let totalLat = 0;
  let totalLng = 0;
  let count = coordinates.length - 1; // Exclude closing coordinate
  
  for (let i = 0; i < count; i++) {
    totalLng += coordinates[i][0];
    totalLat += coordinates[i][1];
  }
  
  return [totalLng / count, totalLat / count];
}

function categorizeFeature(properties: GeoJSONFeature['properties']): POICategory {
  // Check amenity first (most common)
  if (properties.amenity && categoryMapping[properties.amenity]) {
    return categoryMapping[properties.amenity];
  }
  
  // Check leisure
  if (properties.leisure && categoryMapping[properties.leisure]) {
    return categoryMapping[properties.leisure];
  }
  
  // Check tourism
  if (properties.tourism && categoryMapping[properties.tourism]) {
    return categoryMapping[properties.tourism];
  }
  
  // Check shop types
  if (properties.shop) {
    return 'services'; // All shops go to services
  }
  
  // Check sport
  if (properties.sport && categoryMapping[properties.sport]) {
    return categoryMapping[properties.sport];
  }
  
  // Default fallback
  return 'services';
}

function extractAmenities(properties: GeoJSONFeature['properties']): string[] {
  const amenities: string[] = [];
  
  if (properties.cuisine) {
    amenities.push(`Cuisine: ${properties.cuisine}`);
  }
  
  if (properties.phone) {
    amenities.push(`Phone: ${properties.phone}`);
  }
  
  if (properties.website) {
    amenities.push(`Website: ${properties.website}`);
  }
  
  if (properties.opening_hours || properties['opening_hours:restaurant']) {
    const hours = properties.opening_hours || properties['opening_hours:restaurant'];
    amenities.push(`Hours: ${hours}`);
  }
  
  if (properties['addr:street'] && properties['addr:housenumber']) {
    const address = `${properties['addr:housenumber']} ${properties['addr:street']}`;
    if (properties['addr:city']) {
      amenities.push(`Address: ${address}, ${properties['addr:city']}`);
    } else {
      amenities.push(`Address: ${address}`);
    }
  }
  
  return amenities;
}

function generateDescription(properties: GeoJSONFeature['properties']): string {
  const parts: string[] = [];
  
  if (properties.amenity) {
    parts.push(properties.amenity.replace(/_/g, ' '));
  }
  
  if (properties.leisure) {
    parts.push(properties.leisure.replace(/_/g, ' '));
  }
  
  if (properties.tourism) {
    parts.push(properties.tourism.replace(/_/g, ' '));
  }
  
  if (properties.shop) {
    parts.push(`${properties.shop.replace(/_/g, ' ')} shop`);
  }
  
  return parts.length > 0 ? parts.join(', ') : 'Point of interest';
}

export function transformGeoJSONToPOIs(
  geoJsonData: GeoJSONCollection,
  sitePrefix: string
): POI[] {
  return geoJsonData.features
    .filter(feature => feature.properties?.name) // Only include named features
    .map((feature, index) => {
      try {
        const coordinates = extractCoordinates(feature.geometry);
        const category = categorizeFeature(feature.properties);
        const amenities = extractAmenities(feature.properties);
        const description = generateDescription(feature.properties);
        
        return {
          id: parseInt(feature.id?.toString().replace(/\D/g, '')) || index + 1,
          name: feature.properties.name!,
          category,
          latitude: coordinates.lat.toString(),
          longitude: coordinates.lng.toString(),
          description: description || null,
          amenities: amenities.length > 0 ? amenities : null,
          hours: feature.properties.opening_hours || 
                 feature.properties['opening_hours:restaurant'] || 
                 null,
          createdAt: new Date()
        };
      } catch (error) {
        console.warn(`Failed to transform feature ${feature.id}:`, error);
        return null;
      }
    })
    .filter((poi): poi is POI => poi !== null);
}

export function searchPOIs(pois: POI[], query: string): POI[] {
  const searchTerm = query.toLowerCase().trim();
  
  if (!searchTerm) return pois;
  
  return pois.filter(poi => {
    // Search in name
    if (poi.name.toLowerCase().includes(searchTerm)) return true;
    
    // Search in description
    if (poi.description?.toLowerCase().includes(searchTerm)) return true;
    
    // Search in amenities
    if (poi.amenities?.some(amenity => 
      amenity.toLowerCase().includes(searchTerm)
    )) return true;
    
    // Search in category
    if (poi.category.toLowerCase().includes(searchTerm)) return true;
    
    return false;
  });
}

export function filterPOIsByCategory(
  pois: POI[], 
  categories: string[]
): POI[] {
  if (categories.length === 0) return pois;
  return pois.filter(poi => categories.includes(poi.category));
}