import { LatLng } from '../types/index.js';

export const calculateDistanceKm = (from: LatLng, to: LatLng): number => {
  const R = 6371;
  const dLat = ((to.latitude - from.latitude) * Math.PI) / 180;
  const dLon = ((to.longitude - from.longitude) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((from.latitude * Math.PI) / 180) *
      Math.cos((to.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
};

export const generateInterpolatedRoute = (
  origin: LatLng,
  destination: LatLng,
  points = 20
): LatLng[] => {
  const route: LatLng[] = [];
  for (let i = 0; i <= points; i++) {
    const t = i / points;
    // Curved Bezier-like perturbation for natural road curve
    const curveOffset = Math.sin(t * Math.PI) * 0.002 * (i % 2 === 0 ? 1 : 0.8);

    route.push({
      latitude: origin.latitude + (destination.latitude - origin.latitude) * t + curveOffset,
      longitude: origin.longitude + (destination.longitude - origin.longitude) * t - curveOffset * 0.5,
    });
  }
  return route;
};
