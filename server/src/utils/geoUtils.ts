/**
 * Geographic calculation utilities
 */

/**
 * Calculate distance between two geographic coordinates using Haversine formula
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in kilometers
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Sample coordinates evenly from a route
 * @param coordinates Array of [longitude, latitude] coordinates
 * @param maxSamples Maximum number of samples to return
 * @returns Array of indices of sampled coordinates
 */
export function sampleCoordinates(
  coordinates: number[][],
  maxSamples: number
): number[] {
  const sampleIndices: number[] = [];
  
  if (coordinates.length <= maxSamples) {
    // Use all points if route is short
    return coordinates.map((_, i) => i);
  }
  
  // Sample evenly distributed points
  const step = Math.floor(coordinates.length / (maxSamples - 1));
  for (let i = 0; i < coordinates.length; i += step) {
    sampleIndices.push(i);
  }
  
  // Always include the last point
  const lastIndex = coordinates.length - 1;
  if (sampleIndices[sampleIndices.length - 1] !== lastIndex) {
    sampleIndices.push(lastIndex);
  }
  
  return sampleIndices;
}

/**
 * Delay execution for specified milliseconds
 * @param ms Milliseconds to delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
