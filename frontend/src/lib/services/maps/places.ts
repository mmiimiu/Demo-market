import { type Coordinates, type PlaceResult } from './types';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

/**
 * Search for places by text query
 */
export async function searchPlaces(
  query: string,
  location?: Coordinates,
  radius?: number
): Promise<PlaceResult[]> {
  try {
    const url = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
    url.searchParams.set('query', query);
    url.searchParams.set('key', GOOGLE_MAPS_API_KEY);
    url.searchParams.set('language', 'th');

    if (location) {
      url.searchParams.set('location', `${location.latitude},${location.longitude}`);
    }

    if (radius) {
      url.searchParams.set('radius', radius.toString());
    }

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.status !== 'OK' || !data.results) {
      console.error('Place search failed:', data.status);
      return [];
    }

    return data.results.map((place: any) => ({
      placeId: place.place_id,
      name: place.name,
      address: place.formatted_address,
      coordinates: {
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
      },
      types: place.types,
      rating: place.rating,
    }));
  } catch (error) {
    console.error('Place search error:', error);
    return [];
  }
}

/**
 * Get autocomplete suggestions for place names
 */
export async function getAutocompleteSuggestions(
  input: string,
  location?: Coordinates
): Promise<Array<{ description: string; placeId: string }>> {
  try {
    const url = new URL('https://maps.googleapis.com/maps/api/place/autocomplete/json');
    url.searchParams.set('input', input);
    url.searchParams.set('key', GOOGLE_MAPS_API_KEY);
    url.searchParams.set('language', 'th');
    url.searchParams.set('components', 'country:th'); // Thailand only

    if (location) {
      url.searchParams.set('location', `${location.latitude},${location.longitude}`);
      url.searchParams.set('radius', '50000'); // 50km radius
    }

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.status !== 'OK' || !data.predictions) {
      return [];
    }

    return data.predictions.map((pred: any) => ({
      description: pred.description,
      placeId: pred.place_id,
      }));
  } catch (error) {
    console.error('Autocomplete error:', error);
    return [];
  }
}

/**
 * Get place details by place ID
 */
export async function getPlaceDetails(placeId: string): Promise<PlaceResult | null> {
  try {
    const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
    url.searchParams.set('place_id', placeId);
    url.searchParams.set('key', GOOGLE_MAPS_API_KEY);
    url.searchParams.set('language', 'th');
    url.searchParams.set('fields', 'name,formatted_address,geometry,types,rating');

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.status !== 'OK' || !data.result) {
      console.error('Place details failed:', data.status);
      return null;
    }

    const place = data.result;

    return {
      placeId: place.place_id,
      name: place.name,
      address: place.formatted_address,
      coordinates: {
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
      },
      types: place.types,
      rating: place.rating,
    };
  } catch (error) {
    console.error('Place details error:', error);
    return null;
  }
}
