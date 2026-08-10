import { type Coordinates, type GeocodingResult } from './types';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

/**
 * Geocode an address to coordinates
 */
export async function geocode(address: string): Promise<GeocodingResult | null> {
  try {
    const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
    url.searchParams.set('address', address);
    url.searchParams.set('key', GOOGLE_MAPS_API_KEY);
    url.searchParams.set('language', 'th');
    url.searchParams.set('region', 'th');

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      console.error('Geocoding failed:', data.status);
      return null;
    }

    const result = data.results[0];
    const location = result.geometry.location;

    // Extract address components
    const components = result.address_components;
    const province = components.find((c: any) => 
      c.types.includes('administrative_area_level_1')
    )?.long_name;
    
    const district = components.find((c: any) => 
      c.types.includes('administrative_area_level_2')
    )?.long_name;
    
    const subdistrict = components.find((c: any) => 
      c.types.includes('sublocality_level_1') || c.types.includes('locality')
    )?.long_name;
    
    const postalCode = components.find((c: any) => 
      c.types.includes('postal_code')
    )?.long_name;

    return {
      address: result.formatted_address,
      coordinates: {
        latitude: location.lat,
        longitude: location.lng,
      },
      province,
      district,
      subdistrict,
      postalCode,
      placeId: result.place_id,
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

/**
 * Reverse geocode coordinates to address
 */
export async function reverseGeocode(coordinates: Coordinates): Promise<GeocodingResult | null> {
  try {
    const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
    url.searchParams.set('latlng', `${coordinates.latitude},${coordinates.longitude}`);
    url.searchParams.set('key', GOOGLE_MAPS_API_KEY);
    url.searchParams.set('language', 'th');

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      console.error('Reverse geocoding failed:', data.status);
      return null;
    }

    const result = data.results[0];
    const components = result.address_components;

    const province = components.find((c: any) => 
      c.types.includes('administrative_area_level_1')
    )?.long_name;
    
    const district = components.find((c: any) => 
      c.types.includes('administrative_area_level_2')
    )?.long_name;

    return {
      address: result.formatted_address,
      coordinates,
      province,
      district,
      placeId: result.place_id,
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
}

/**
 * Generate static map image URL
 * Useful for property thumbnails (cheaper than Maps JavaScript API)
 */
export function getStaticMapUrl(
  coordinates: Coordinates,
  width: number = 400,
  height: number = 300,
  zoom: number = 15
): string {
  const url = new URL('https://maps.googleapis.com/maps/api/staticmap');
  url.searchParams.set('center', `${coordinates.latitude},${coordinates.longitude}`);
  url.searchParams.set('zoom', zoom.toString());
  url.searchParams.set('size', `${width}x${height}`);
  url.searchParams.set('markers', `color:red|${coordinates.latitude},${coordinates.longitude}`);
  url.searchParams.set('key', GOOGLE_MAPS_API_KEY);

  return url.toString();
}
