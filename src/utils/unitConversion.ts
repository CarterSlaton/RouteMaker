/**
 * Unit conversion utilities for distance measurements
 */

export type DistanceUnit = 'km' | 'mi';

// Conversion constants
const KM_TO_MILES = 0.621371;
const MILES_TO_KM = 1.60934;
const METERS_TO_FEET = 3.28084;
const FEET_TO_METERS = 0.3048;

/**
 * Convert kilometers to miles
 */
export function kmToMiles(km: number): number {
  return km * KM_TO_MILES;
}

/**
 * Convert miles to kilometers
 */
export function milesToKm(miles: number): number {
  return miles * MILES_TO_KM;
}

/**
 * Convert meters to feet
 */
export function metersToFeet(meters: number): number {
  return meters * METERS_TO_FEET;
}

/**
 * Convert feet to meters
 */
export function feetToMeters(feet: number): number {
  return feet * FEET_TO_METERS;
}

/**
 * Convert distance to preferred unit
 * @param distanceKm Distance in kilometers
 * @param preferredUnit User's preferred unit
 * @returns Distance in preferred unit
 */
export function convertDistance(distanceKm: number, preferredUnit: DistanceUnit): number {
  return preferredUnit === 'mi' ? kmToMiles(distanceKm) : distanceKm;
}

/**
 * Format distance with appropriate unit label
 * @param distanceKm Distance in kilometers
 * @param preferredUnit User's preferred unit
 * @param decimals Number of decimal places
 * @returns Formatted string with unit
 */
export function formatDistance(
  distanceKm: number,
  preferredUnit: DistanceUnit = 'km',
  decimals: number = 2
): string {
  const distance = convertDistance(distanceKm, preferredUnit);
  return `${distance.toFixed(decimals)} ${preferredUnit}`;
}

/**
 * Format elevation with appropriate unit
 * @param elevationMeters Elevation in meters
 * @param preferredUnit User's preferred distance unit
 * @returns Formatted string with unit
 */
export function formatElevation(
  elevationMeters: number,
  preferredUnit: DistanceUnit = 'km'
): string {
  if (preferredUnit === 'mi') {
    const elevationFeet = metersToFeet(elevationMeters);
    return `${Math.round(elevationFeet)} ft`;
  }
  return `${Math.round(elevationMeters)} m`;
}

/**
 * Get unit label
 */
export function getUnitLabel(unit: DistanceUnit): string {
  return unit === 'km' ? 'kilometers' : 'miles';
}

/**
 * Get elevation unit label
 */
export function getElevationUnitLabel(unit: DistanceUnit): string {
  return unit === 'km' ? 'meters' : 'feet';
}
