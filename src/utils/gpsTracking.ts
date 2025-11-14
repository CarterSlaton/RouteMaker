// GPS tracking service for live run tracking
import { calculateDistance } from "./geoUtils.js";

export interface GPSPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export interface RunStatistics {
  totalDistance: number; // in kilometers
  totalTime: number; // in seconds
  currentPace: number; // minutes per kilometer
  averagePace: number; // minutes per kilometer
}

class GPSTrackingService {
  private watchId: number | null = null;
  private isTracking = false;
  private positionCallback: ((position: GPSPosition) => void) | null = null;
  private errorCallback: ((error: GeolocationPositionError) => void) | null = null;

  // Start tracking GPS position
  startTracking(
    onPosition: (position: GPSPosition) => void,
    onError: (error: GeolocationPositionError) => void
  ): boolean {
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by this browser");
      return false;
    }

    if (this.isTracking) {
      console.warn("GPS tracking is already active");
      return false;
    }

    this.positionCallback = onPosition;
    this.errorCallback = onError;
    this.isTracking = true;

    // High accuracy GPS tracking
    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000, // 10 seconds
      maximumAge: 0, // No cached positions
    };

    console.log('Starting GPS watchPosition with high accuracy');
    
    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        console.log('watchPosition update:', {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          speed: position.coords.speed,
          heading: position.coords.heading
        });
        
        const gpsPosition: GPSPosition = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        };
        
        if (this.positionCallback) {
          this.positionCallback(gpsPosition);
        }
      },
      (error) => {
        console.error("GPS Error:", error.message);
        if (this.errorCallback) {
          this.errorCallback(error);
        }
      },
      options
    );

    return true;
  }

  // Stop tracking GPS position
  stopTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    
    this.isTracking = false;
    this.positionCallback = null;
    this.errorCallback = null;
  }

  // Check if currently tracking
  isActive(): boolean {
    return this.isTracking;
  }

  // Get current position once (for initial position)
  getCurrentPosition(): Promise<GPSPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }
}

// Calculate live run statistics
export class RunStatisticsCalculator {
  private positions: GPSPosition[] = [];
  private startTime: number;
  private pausedTime: number = 0;
  private lastPauseStart: number | null = null;

  constructor(startTime: number) {
    this.startTime = startTime;
  }

  // Add a new GPS position
  addPosition(position: GPSPosition): void {
    console.log('GPS Position added:', {
      lat: position.latitude,
      lng: position.longitude,
      accuracy: position.accuracy,
      totalPositions: this.positions.length + 1
    });
    this.positions.push(position);
  }

  // Calculate total distance traveled
  calculateDistance(): number {
    if (this.positions.length < 2) {
      return 0;
    }

    let totalDistance = 0;
    for (let i = 1; i < this.positions.length; i++) {
      const prev = this.positions[i - 1];
      const curr = this.positions[i];
      
      // Only add distance if accuracy is reasonable (< 100 meters)
      // Relaxed from 50m to 100m for better mobile GPS support
      if (curr.accuracy < 100 && prev.accuracy < 100) {
        const segmentDistance = calculateDistance(
          prev.latitude,
          prev.longitude,
          curr.latitude,
          curr.longitude
        );
        
        // Only add if the segment is reasonable (< 100 meters between updates)
        // This filters out GPS jumps/glitches
        if (segmentDistance < 0.1) { // 100 meters = 0.1 km
          totalDistance += segmentDistance;
        } else {
          console.warn('GPS jump detected, ignoring segment:', segmentDistance, 'km');
        }
      } else {
        console.warn('Poor GPS accuracy, ignoring position:', curr.accuracy, 'm');
      }
    }

    return totalDistance;
  }

  // Calculate current pace (last 5 data points)
  calculateCurrentPace(): number {
    if (this.positions.length < 5) {
      return 0;
    }

    const recentPositions = this.positions.slice(-5);
    let distance = 0;
    let time = 0;

    for (let i = 1; i < recentPositions.length; i++) {
      const prev = recentPositions[i - 1];
      const curr = recentPositions[i];
      
      if (curr.accuracy < 100 && prev.accuracy < 100) {
        const segmentDistance = calculateDistance(
          prev.latitude,
          prev.longitude,
          curr.latitude,
          curr.longitude
        );
        
        // Filter out GPS jumps
        if (segmentDistance < 0.1) {
          distance += segmentDistance;
          time += (curr.timestamp - prev.timestamp) / 1000; // Convert to seconds
        }
      }
    }

    if (distance === 0) return 0;

    // Pace in minutes per kilometer
    return (time / 60) / distance;
  }

  // Calculate average pace
  calculateAveragePace(): number {
    const totalDistance = this.calculateDistance();
    const totalTime = this.getActiveTime();

    if (totalDistance === 0 || totalTime === 0) {
      return 0;
    }

    // Pace in minutes per kilometer
    return (totalTime / 60) / totalDistance;
  }

  // Get active running time (excluding pauses)
  getActiveTime(): number {
    const currentTime = Date.now();
    const totalElapsed = (currentTime - this.startTime) / 1000; // seconds
    
    let pausedDuration = this.pausedTime;
    if (this.lastPauseStart !== null) {
      pausedDuration += (currentTime - this.lastPauseStart) / 1000;
    }

    return Math.max(0, totalElapsed - pausedDuration);
  }

  // Get total elapsed time (including pauses)
  getTotalTime(): number {
    return (Date.now() - this.startTime) / 1000;
  }

  // Pause the timer
  pause(): void {
    if (this.lastPauseStart === null) {
      this.lastPauseStart = Date.now();
    }
  }

  // Resume the timer
  resume(): void {
    if (this.lastPauseStart !== null) {
      this.pausedTime += (Date.now() - this.lastPauseStart) / 1000;
      this.lastPauseStart = null;
    }
  }

  // Get all statistics
  getStatistics(): RunStatistics {
    return {
      totalDistance: this.calculateDistance(),
      totalTime: this.getActiveTime(),
      currentPace: this.calculateCurrentPace(),
      averagePace: this.calculateAveragePace(),
    };
  }

  // Get all GPS positions
  getPositions(): GPSPosition[] {
    return this.positions;
  }

  // Get total paused time
  getPausedTime(): number {
    return this.pausedTime;
  }
}

// Format pace for display (e.g., "5:30" for 5 minutes 30 seconds per km)
export function formatPace(paceMinPerKm: number): string {
  if (!paceMinPerKm || paceMinPerKm === 0 || !isFinite(paceMinPerKm)) {
    return "--:--";
  }

  const minutes = Math.floor(paceMinPerKm);
  const seconds = Math.round((paceMinPerKm - minutes) * 60);
  
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

// Format time for display (e.g., "1:23:45" for 1 hour, 23 minutes, 45 seconds)
export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }
  
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

// Singleton instance
export const gpsTracker = new GPSTrackingService();
