/**
 * Route-related type definitions for the backend
 */

export interface Coordinate {
  longitude: number;
  latitude: number;
}

export interface ElevationPoint {
  distance: number;
  elevation: number;
}

export interface ElevationData {
  elevationGain: number;
  elevationLoss: number;
  minElevation: number;
  maxElevation: number;
  profile: ElevationPoint[];
}

export interface DirectionStep {
  instruction: string;
  distance: number;
  type: string;
}

export interface RouteCoordinates {
  type: 'LineString';
  coordinates: number[][];
}

export type Difficulty = 'Easy' | 'Moderate' | 'Hard';

export interface CreateRouteDTO {
  name: string;
  distance: number;
  difficulty: Difficulty;
  coordinates: number[][];
}

export interface UpdateRouteDTO {
  name?: string;
  distance?: number;
  difficulty?: Difficulty;
  coordinates?: number[][];
}
