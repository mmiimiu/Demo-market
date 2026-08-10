import { type Coordinates, type DistanceMatrixResult, type NearbyBTSResult } from './types';
import { searchPlaces } from './places';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

/**
 * Calculate distance and travel time between two points
 */
export async function getDistanceMatrix(
  origin: Coordinates | string,
  destination: Coordinates | string,
  mode: 'driving' | 'walking' | 'bicycling' | 'transit' = 'driving'
): Promise<DistanceMatrixResult | null> {
  try {
    const originStr = typeof origin === 'string' 
      ? origin 
      : `${origin.latitude},${origin.longitude}`;
    
    const destStr = typeof destination === 'string' 
      ? destination 
      : `${destination.latitude},${destination.longitude}`;

    const url = new URL('https://maps.googleapis.com/maps/api/distancematrix/json');
    url.searchParams.set('origins', originStr);
    url.searchParams.set('destinations', destStr);
    url.searchParams.set('mode', mode);
    url.searchParams.set('key', GOOGLE_MAPS_API_KEY);
    url.searchParams.set('language', 'th');

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.status !== 'OK' || !data.rows || data.rows.length === 0) {
      console.error('Distance matrix failed:', data.status);
      return null;
    }

    const element = data.rows[0].elements[0];

    if (element.status !== 'OK') {
      console.error('Distance matrix element failed:', element.status);
      return null;
    }

    return {
      distance: element.distance,
      duration: element.duration,
      status: element.status,
    };
  } catch (error) {
    console.error('Distance matrix error:', error);
    return null;
  }
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (coord1.latitude * Math.PI) / 180;
  const φ2 = (coord2.latitude * Math.PI) / 180;
  const Δφ = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const Δλ = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Find nearby BTS/MRT stations
 */
export async function findNearbyBTS(
  coordinates: Coordinates,
  maxDistance: number = 2000 // meters
): Promise<NearbyBTSResult[]> {
  try {
    // Search for BTS stations
    const btsResults = await searchPlaces(
      'BTS station',
      coordinates,
      maxDistance
    );

    // Search for MRT stations
    const mrtResults = await searchPlaces(
      'MRT station',
      coordinates,
      maxDistance
    );

    const allStations = [...btsResults, ...mrtResults];

    // Calculate distances and sort
    const stationsWithDistance = await Promise.all(
      allStations.map(async (station) => {
        const distance = calculateDistance(coordinates, station.coordinates);
        
        // Determine line from name
        let line = 'Unknown';
        if (station.name.toLowerCase().includes('bts')) {
          if (station.name.includes('Sukhumvit') || station.name.includes('สุขุมวิท')) {
            line = 'BTS Sukhumvit';
          } else if (station.name.includes('Silom') || station.name.includes('สีลม')) {
            line = 'BTS Silom';
          } else {
            line = 'BTS';
          }
        } else if (station.name.toLowerCase().includes('mrt')) {
          if (station.name.includes('Blue') || station.name.includes('สีน้ำเงิน')) {
            line = 'MRT Blue';
          } else if (station.name.includes('Purple') || station.name.includes('สีม่วง')) {
            line = 'MRT Purple';
          } else {
            line = 'MRT';
          }
        }

        return {
          name: station.name.replace(/BTS|MRT/gi, '').trim(),
          distance,
          coordinates: station.coordinates,
          line,
        };
      })
    );

    // Sort by distance and filter by max distance
    return stationsWithDistance
      .filter(s => s.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5); // Return top 5 nearest
  } catch (error) {
    console.error('Find nearby BTS error:', error);
    return [];
  }
}
