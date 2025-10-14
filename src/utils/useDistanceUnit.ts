/**
 * Custom hook to access and format distances with user's preferred unit
 */
import { useAuth } from '../contexts/AuthContext';
import { formatDistance, formatElevation, convertDistance, type DistanceUnit } from './unitConversion';

export const useDistanceUnit = () => {
  const { user } = useAuth();
  const preferredUnit: DistanceUnit = user?.preferredUnit || 'km';

  return {
    preferredUnit,
    formatDistance: (distanceKm: number, decimals?: number) => 
      formatDistance(distanceKm, preferredUnit, decimals),
    formatElevation: (elevationMeters: number) => 
      formatElevation(elevationMeters, preferredUnit),
    convertDistance: (distanceKm: number) => 
      convertDistance(distanceKm, preferredUnit),
  };
};
