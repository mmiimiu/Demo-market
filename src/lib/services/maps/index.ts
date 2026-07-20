import { geocode, reverseGeocode, getStaticMapUrl } from './core';
import { searchPlaces, getAutocompleteSuggestions, getPlaceDetails } from './places';
import { getDistanceMatrix, calculateDistance, findNearbyBTS } from './commute';

export * from './types';

export class MapsService {
  static geocode = geocode;
  static reverseGeocode = reverseGeocode;
  static getDistanceMatrix = getDistanceMatrix;
  static searchPlaces = searchPlaces;
  static findNearbyBTS = findNearbyBTS;
  static calculateDistance = calculateDistance;
  static getAutocompleteSuggestions = getAutocompleteSuggestions;
  static getPlaceDetails = getPlaceDetails;
  static getStaticMapUrl = getStaticMapUrl;
}
