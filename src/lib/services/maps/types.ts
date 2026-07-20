export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface GeocodingResult {
  address: string;
  coordinates: Coordinates;
  province?: string;
  district?: string;
  subdistrict?: string;
  postalCode?: string;
  placeId?: string;
}

export interface DistanceMatrixResult {
  distance: {
    text: string;
    value: number; // meters
  };
  duration: {
    text: string;
    value: number; // seconds
  };
  status: string;
}

export interface PlaceResult {
  placeId: string;
  name: string;
  address: string;
  coordinates: Coordinates;
  types: string[];
  rating?: number;
}

export interface NearbyBTSResult {
  name: string;
  distance: number; // meters
  coordinates: Coordinates;
  line?: string; // BTS Sukhumvit, BTS Silom, MRT Blue, etc.
}
