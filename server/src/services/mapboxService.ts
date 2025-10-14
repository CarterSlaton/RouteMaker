/**
 * Mapbox API service for fetching elevation and directions data
 */
import axios from 'axios';

// Elevation data point with distance and elevation
interface ElevationPoint {
  distance: number;
  elevation: number;
}

// Turn-by-turn direction step
interface DirectionStep {
  instruction: string;
  distance: number;
  type: string;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in kilometers
 */
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Convert degrees to radians
 */
function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Fetch elevation data for a route from Mapbox Tilequery API
 * @param coordinates Array of [longitude, latitude] pairs
 * @returns Elevation statistics and profile, or null if failed
 */
export const getElevationData = async (coordinates: number[][]) => {
  try {
    console.log('Fetching elevation data for', coordinates.length, 'coordinates');
    const MAPBOX_TOKEN = process.env.MAPBOX_ACCESS_TOKEN || '';
    if (!MAPBOX_TOKEN) {
      console.error('MAPBOX_ACCESS_TOKEN is not set');
      return null;
    }

    const maxSamples = 15;
    const sampleIndices: number[] = [];
    
    if (coordinates.length <= maxSamples) {
      for (let i = 0; i < coordinates.length; i++) {
        sampleIndices.push(i);
      }
    } else {
      const step = Math.floor(coordinates.length / (maxSamples - 1));
      for (let i = 0; i < coordinates.length; i += step) {
        sampleIndices.push(i);
      }
      if (sampleIndices[sampleIndices.length - 1] !== coordinates.length - 1) {
        sampleIndices.push(coordinates.length - 1);
      }
    }

    const elevationProfile: ElevationPoint[] = [];
    let cumulativeDistance = 0;
    let elevationGain = 0;
    let elevationLoss = 0;
    let minElevation = Infinity;
    let maxElevation = -Infinity;

    for (let idx of sampleIndices) {
      const [lng, lat] = coordinates[idx];

      if (idx > 0) {
        const prevIdx = sampleIndices[sampleIndices.indexOf(idx) - 1];
        const prevCoord = coordinates[prevIdx];
        cumulativeDistance += haversineDistance(prevCoord[1], prevCoord[0], lat, lng);
      }

      try {
        const response = await axios.get(
          `https://api.mapbox.com/v4/mapbox.mapbox-terrain-v2/tilequery/${lng},${lat}.json`,
          {
            params: {
              layers: 'contour',
              limit: 1,
              access_token: MAPBOX_TOKEN
            },
            timeout: 2000
          }
        );

        const elevation = response.data.features[0]?.properties?.ele || 0;
        elevationProfile.push({ distance: cumulativeDistance * 1000, elevation });

        if (elevationProfile.length > 1) {
          const prevElevation = elevationProfile[elevationProfile.length - 2].elevation;
          const diff = elevation - prevElevation;
          if (diff > 0) {
            elevationGain += diff;
          } else {
            elevationLoss += Math.abs(diff);
          }
        }

        minElevation = Math.min(minElevation, elevation);
        maxElevation = Math.max(maxElevation, elevation);

        await new Promise(resolve => setTimeout(resolve, 50));
      } catch (error: any) {
        console.error(`Error fetching elevation for point ${idx}:`, error.message);
        elevationProfile.push({ distance: cumulativeDistance * 1000, elevation: 0 });
      }
    }

    if (elevationProfile.every(p => p.elevation === 0)) {
      console.log('No valid elevation data received');
      return null;
    }

    console.log(`Successfully fetched elevation data: ${elevationProfile.length} points`);
    return {
      elevationGain: Math.round(elevationGain),
      elevationLoss: Math.round(elevationLoss),
      minElevation: Math.round(minElevation),
      maxElevation: Math.round(maxElevation),
      profile: elevationProfile
    };
  } catch (error) {
    console.error('Error getting elevation data:', error);
    return null;
  }
};

export const getDirections = async (coordinates: number[][]): Promise<DirectionStep[]> => {
  try {
    console.log('Fetching directions for', coordinates.length, 'coordinates');
    const MAPBOX_TOKEN = process.env.MAPBOX_ACCESS_TOKEN || '';
    if (!MAPBOX_TOKEN) {
      console.error('MAPBOX_ACCESS_TOKEN is not set');
      return [];
    }

    let waypoints = coordinates;
    if (coordinates.length > 25) {
      const step = Math.floor(coordinates.length / 24);
      waypoints = coordinates.filter((_, i) => i % step === 0);
      if (waypoints[waypoints.length - 1] !== coordinates[coordinates.length - 1]) {
        waypoints.push(coordinates[coordinates.length - 1]);
      }
    }

    const coordinatesString = waypoints.map(coord => `${coord[0]},${coord[1]}`).join(';');

    const response = await axios.get(
      `https://api.mapbox.com/directions/v5/mapbox/walking/${coordinatesString}`,
      {
        params: {
          steps: true,
          banner_instructions: true,
          voice_instructions: true,
          geometries: 'geojson',
          access_token: MAPBOX_TOKEN
        },
        timeout: 5000
      }
    );

    const steps = response.data.routes[0]?.legs.flatMap((leg: any) => leg.steps) || [];

    console.log(`Successfully fetched ${steps.length} direction steps`);
    return steps.map((step: any) => ({
      instruction: step.maneuver?.instruction || 'Continue',
      distance: Math.round(step.distance),
      type: step.maneuver?.type || 'turn'
    }));
  } catch (error: any) {
    console.error('Error getting directions:', error.message);
    return [];
  }
};
