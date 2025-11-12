// Geographic utility functions for calculating distances and routes

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 - Latitude of first point
 * @param lon1 - Longitude of first point
 * @param lat2 - Latitude of second point
 * @param lon2 - Longitude of second point
 * @returns Distance in kilometers
 */
export function calculateDistance(
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
  const distance = R * c;

  return distance;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate the bearing between two points
 * @returns Bearing in degrees (0-360)
 */
export function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLon = toRadians(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(toRadians(lat2));
  const x =
    Math.cos(toRadians(lat1)) * Math.sin(toRadians(lat2)) -
    Math.sin(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.cos(dLon);
  
  let bearing = Math.atan2(y, x);
  bearing = (bearing * 180) / Math.PI;
  bearing = (bearing + 360) % 360;
  
  return bearing;
}

/**
 * Find the closest point on a route to a given position
 * @param position - Current GPS position
 * @param routeCoordinates - Array of route coordinates
 * @returns Index of closest point and distance in meters
 */
export function findClosestPointOnRoute(
  position: { latitude: number; longitude: number },
  routeCoordinates: [number, number][]
): { index: number; distance: number } {
  let minDistance = Infinity;
  let closestIndex = 0;

  for (let i = 0; i < routeCoordinates.length; i++) {
    const [lon, lat] = routeCoordinates[i];
    const distance = calculateDistance(
      position.latitude,
      position.longitude,
      lat,
      lon
    );

    if (distance < minDistance) {
      minDistance = distance;
      closestIndex = i;
    }
  }

  return {
    index: closestIndex,
    distance: minDistance * 1000, // Convert to meters
  };
}
