import { LatLng } from '../types/index.js';

/**
 * Calculates the great-circle distance between two geographic coordinates using the Haversine formula.
 * @returns distance in kilometers
 */
export const calculateDistanceKm = (from: LatLng, to: LatLng): number => {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = degreesToRadians(to.latitude - from.latitude);
  const dLon = degreesToRadians(to.longitude - from.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degreesToRadians(from.latitude)) *
      Math.cos(degreesToRadians(to.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  // Round to 2 decimal places
  return Math.round(distance * 100) / 100;
};

export const calculateHaversineDistanceKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  return calculateDistanceKm({ latitude: lat1, longitude: lon1 }, { latitude: lat2, longitude: lon2 });
};

const degreesToRadians = (degrees: number): number => {
  return (degrees * Math.PI) / 180;
};

/**
 * Estimates delivery duration in minutes based on distance and average city travel speeds.
 */
export const estimateTravelMinutes = (distanceKm: number, basePrepMinutes = 0): number => {
  const travelMinutes = Math.ceil((distanceKm / 20) * 60) + 5;
  return Math.max(10, travelMinutes + basePrepMinutes);
};

/**
 * Generates an interpolated realistic sequence of waypoints between two coordinates.
 */
export const generateRouteWaypoints = (
  origin: LatLng,
  destination: LatLng,
  steps = 15
): LatLng[] => {
  const waypoints: LatLng[] = [];
  for (let i = 0; i <= steps; i++) {
    const fraction = i / steps;
    const jitterLat = Math.sin(fraction * Math.PI) * 0.0015 * (i % 2 === 0 ? 1 : -1);
    const jitterLng = Math.cos(fraction * Math.PI) * 0.0015 * (i % 2 === 0 ? -1 : 1);

    waypoints.push({
      latitude: origin.latitude + (destination.latitude - origin.latitude) * fraction + jitterLat,
      longitude: origin.longitude + (destination.longitude - origin.longitude) * fraction + jitterLng,
    });
  }
  return waypoints;
};
