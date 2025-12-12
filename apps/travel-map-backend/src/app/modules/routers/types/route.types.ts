/**
 * TypeScript interfaces and types for route-related data structures.
 */

/**
 * Represents a geographic point with latitude and longitude coordinates.
 */
export interface Point {
  lat: number;
  lng: number;
}

/**
 * GeoJSON geometry structure for route lines.
 */
export interface GeoJsonGeometry {
  type: string;
  coordinates: number[][];
}

/**
 * Result from reverse geocoding API containing location information.
 */
export interface GeocodingResult {
  country: string | null;
  city: string | null;
}

/**
 * Address information from Nominatim API response.
 */
export interface NominatimAddress {
  country?: string;
  city?: string;
  town?: string;
  village?: string;
}

/**
 * Complete Nominatim API response structure.
 */
export interface NominatimResponse {
  address?: NominatimAddress;
}

/**
 * Data calculated during route creation.
 */
export interface RouteCalculationData {
  countries: string[];
  cities: string[];
  distance: number;
  pointsEarned: number;
}
