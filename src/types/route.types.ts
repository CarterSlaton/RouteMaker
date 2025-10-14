/**
 * Route-related type definitions for the frontend
 */

export interface Route {
  id?: string;
  _id?: string;
  name: string;
  distance: number;
  location: string;
  date: string;
  difficulty: 'Easy' | 'Moderate' | 'Hard';
  coordinates: number[][];
  elevationData?: ElevationData;
  directions?: DirectionStep[];
  createdAt?: string | number;
}

export interface ElevationData {
  elevationGain: number;
  elevationLoss: number;
  minElevation: number;
  maxElevation: number;
  profile: Array<{ distance: number; elevation: number }>;
}

export interface DirectionStep {
  instruction: string;
  distance: number;
  type: string;
}

export interface CreateRoutePayload {
  name: string;
  distance: number;
  difficulty: Route['difficulty'];
  coordinates: number[][];
}

export interface UpdateRoutePayload {
  name?: string;
  distance?: number;
  difficulty?: Route['difficulty'];
  coordinates?: number[][];
}
